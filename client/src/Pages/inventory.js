import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { useSanityUser } from '../hooks/useSanityUser'
import Header from '../components/Header'
import RightTop from '../components/RightTop'
import InventoryItem from '../components/InventoryItem'
import RaffleTickets from '../components/RaffleTickets'

const Inventory = ({ address, setAddress, userTokens, multiplier, perDay, timeLeft }) => {
  const [inventory, setInventory] = useState(null)
  const [activeTab, setActiveTab] = useState('items')
  const { userData } = useSanityUser(address)

  useEffect(() => {
    if (userData?._id) {
      fetchInventory()
    }
  }, [userData?._id])

  async function fetchInventory() {
    try {
      const result = await client.fetch(`
        *[_type == "userInventory" && user._ref == $userId][0] {
          items[] {
            _key,
            quantity,
            acquiredDate,
            method,
            item-> {
              _id,
              title,
              description,
              image,
              itemType,
              bidEndTime,
              tickets,
              tokenCost
            }
          }
        }
      `, { userId: userData._id })

      setInventory(result)
    } catch (err) {
      console.error('Error fetching inventory:', err)
    }
  }

  const purchasedItems = inventory?.items?.filter(
    item => item.method === 'purchase'
  ) || []

  // Group raffle tickets by item
  const groupedRaffleTickets = inventory?.items?.reduce((acc, item) => {
    if (item.method === 'bid_pending' && item.item.itemType === 'biddable') {
      if (!acc[item.item._id]) {
        acc[item.item._id] = {
          ...item,
          totalQuantity: 0,
          purchases: []
        }
      }
      acc[item.item._id].totalQuantity += item.quantity
      acc[item.item._id].purchases.push({
        quantity: item.quantity,
        acquiredDate: item.acquiredDate
      })
    }
    return acc
  }, {}) || {}

  const raffleTickets = Object.values(groupedRaffleTickets)

  return (
    <div className="page-wrap inventory">
      <Header current="inventory" />

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
          <div className="inventory-header">
            <h1>My Items</h1>
            <div className="inventory-tabs">
              <button 
                className={`tab ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                Purchased Items
              </button>
              <button 
                className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('tickets')}
              >
                Active Raffles
              </button>
            </div>
          </div>

          <div className="inventory-content">
            {activeTab === 'items' ? (
              <div className="inventory-grid">
                {purchasedItems.length > 0 ? (
                  purchasedItems.map(item => (
                    <InventoryItem 
                      key={item._key}
                      item={item}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    No items purchased yet
                  </div>
                )}
              </div>
            ) : (
              <div className="raffle-tickets-list">
                {raffleTickets.length > 0 ? (
                  raffleTickets.map(item => (
                    <RaffleTickets
                      key={item.item._id}
                      item={{
                        ...item,
                        quantity: item.totalQuantity // Pass total quantity instead
                      }}
                      userAddress={address}
                      purchaseHistory={item.purchases}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    No active raffle tickets
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory 