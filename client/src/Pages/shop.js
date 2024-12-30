import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { useSanityUser } from '../hooks/useSanityUser'
import Header from '../components/Header'
import RightTop from '../components/RightTop'
import BiddableItem from '../components/BiddableItem'
import PurchasableItem from '../components/PurchasableItem'
import { nanoid } from 'nanoid'
import { ToastContainer } from '../components/Toast'

const Shop = ({ address, setAddress, userTokens, multiplier, perDay, timeLeft }) => {
  const [items, setItems] = useState([])
  const { userData, updateUser } = useSanityUser(address)
  const [activeTab, setActiveTab] = useState('purchasable') // or 'biddable'
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    const marketplaceItems = await client.fetch(`
      *[_type == "marketplaceItem" && available == true] {
        _id,
        title,
        description,
        image,
        tokenCost,
        quantity,
        itemType,
        bidEndTime,
        tickets,
        owners
      }
    `)
    console.log('Fetched items:', marketplaceItems)
    setItems(marketplaceItems)
  }

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const purchaseItem = async (item, quantity = 1) => {
    if (!userData || userData.tokens < (item.tokenCost * quantity)) {
      alert('Not enough tokens!')
      return
    }

    try {
      // Update user tokens
      await updateUser({
        tokens: userData.tokens - (item.tokenCost * quantity)
      })

      // Update item data
      const now = new Date().toISOString()
      
      if (item.itemType === 'purchasable') {
        // Handle regular purchase
        await client
          .patch(item._id)
          .set({
            quantity: item.quantity - quantity,
            available: (item.quantity - quantity) > 0
          })
          .setIfMissing({ owners: [] })
          .append('owners', [{
            walletAddress: address,
            purchaseDate: now,
            quantity: quantity
          }])
          .commit()
      } else {
        // Handle ticket purchase
        const ticketUpdate = {
          _key: nanoid(),
          walletAddress: address,
          quantity: quantity,
          purchaseDate: now
        }

        await client
          .patch(item._id)
          .setIfMissing({ tickets: [] })
          .append('tickets', [ticketUpdate])
          .commit()
      }

      // Update user's inventory
      const inventoryDoc = await client.fetch(
        `*[_type == "userInventory" && user._ref == $userId][0]`,
        { userId: userData._id }
      )

      if (inventoryDoc) {
        await client
          .patch(inventoryDoc._id)
          .setIfMissing({ items: [] })
          .append('items', [{
            _key: nanoid(),
            item: { _type: 'reference', _ref: item._id },
            quantity: quantity,
            acquiredDate: now,
            method: item.itemType === 'purchasable' ? 'purchase' : 'bid_pending'
          }])
          .commit()
      } else {
        // Create new inventory for user
        await client.create({
          _type: 'userInventory',
          user: { _type: 'reference', _ref: userData._id },
          items: [{
            _key: nanoid(),
            item: { _type: 'reference', _ref: item._id },
            quantity: quantity,
            acquiredDate: now,
            method: item.itemType === 'purchasable' ? 'purchase' : 'bid_pending'
          }]
        })
      }

      // Refresh items
      fetchItems()

      // Add success toast
      addToast(
        item.itemType === 'purchasable'
          ? `Successfully purchased ${quantity} ${item.title}`
          : `Successfully purchased ${quantity} raffle tickets for ${item.title}`
      )
    } catch (err) {
      console.error('Error purchasing item:', err)
      addToast('Failed to complete purchase', 'error')
    }
  }

  console.log('All items before filter:', items)
  const filteredItems = items.filter(item => item.itemType === activeTab)
  console.log('Filtered items:', filteredItems)

  return (
    <div className="page-wrap shop">
      <Header current="shop" />

      <div className="right-wrap">
        <RightTop 
          assetsNum={0}
          address={address}
          setAddress={setAddress}
          userTokens={userTokens}
          multiplier={multiplier}
          perDay={perDay}
          timeLeft={timeLeft}
        />

        <div className="home-inner container">
          <div className="shop-header">
            <h1>Spend Tokens</h1>
            <div className="shop-tabs">
              <button 
                className={`tab ${activeTab === 'purchasable' ? 'active' : ''}`}
                onClick={() => setActiveTab('purchasable')}
              >
                Shop
              </button>
              <button 
                className={`tab ${activeTab === 'biddable' ? 'active' : ''}`}
                onClick={() => setActiveTab('biddable')}
              >
                Raffles
              </button>
            </div>
          </div>

          <div className="marketplace-items">
            {filteredItems.map(item => (
              item.itemType === 'purchasable' ? (
                <PurchasableItem 
                  key={item._id}
                  item={item}
                  onPurchase={purchaseItem}
                  userTokens={userData?.tokens}
                />
              ) : (
                <BiddableItem
                  key={item._id}
                  item={item}
                  onPurchaseTickets={purchaseItem}
                  userTokens={userData?.tokens}
                  userAddress={address}
                />
              )
            ))}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Shop