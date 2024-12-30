import { client } from '../lib/sanity'
import { nanoid } from 'nanoid'

export async function selectRaffleWinner(raffleItem) {
  // Get all tickets
  const tickets = raffleItem.tickets || []
  if (tickets.length === 0) return null

  // Calculate total tickets for the user
  const userTicketTotals = tickets.reduce((acc, entry) => {
    acc[entry.walletAddress] = (acc[entry.walletAddress] || 0) + entry.quantity
    return acc
  }, {})

  // Create ticket pool where each ticket is an individual entry
  let ticketPool = []
  tickets.forEach(entry => {
    // Add an entry for each individual ticket
    for (let i = 0; i < entry.quantity; i++) {
      ticketPool.push(entry.walletAddress)
    }
  })

  // Randomly select a winner from the ticket pool
  const winnerIndex = Math.floor(Math.random() * ticketPool.length)
  const winnerAddress = ticketPool[winnerIndex]

  try {
    // Update the item to mark it as completed and store winner
    await client
      .patch(raffleItem._id)
      .set({
        available: false,
        winner: {
          walletAddress: winnerAddress,
          ticketCount: userTicketTotals[winnerAddress], // Total tickets owned by winner
          totalTickets: ticketPool.length,
          winningOdds: ((userTicketTotals[winnerAddress] / ticketPool.length) * 100).toFixed(2),
          selectedAt: new Date().toISOString()
        }
      })
      .commit()

    // Update winner's inventory
    const winner = await client.fetch(
      `*[_type == "user" && walletAddress == $address][0]`,
      { address: winnerAddress }
    )

    if (winner) {
      const inventoryDoc = await client.fetch(
        `*[_type == "userInventory" && user._ref == $userId][0]`,
        { userId: winner._id }
      )

      if (inventoryDoc) {
        // Update existing inventory
        await client
          .patch(inventoryDoc._id)
          .setIfMissing({ items: [] })
          .append('items', [{
            _key: nanoid(),
            item: { _type: 'reference', _ref: raffleItem._id },
            quantity: 1,
            acquiredDate: new Date().toISOString(),
            method: 'bid_win'
          }])
          .commit()
      } else {
        // Create new inventory
        await client.create({
          _type: 'userInventory',
          user: { _type: 'reference', _ref: winner._id },
          items: [{
            _key: nanoid(),
            item: { _type: 'reference', _ref: raffleItem._id },
            quantity: 1,
            acquiredDate: new Date().toISOString(),
            method: 'bid_win'
          }]
        })
      }

      // Update all users' bid_pending status for this item to bid_complete
      const allInventories = await client.fetch(
        `*[_type == "userInventory" && items[].item._ref == $itemId]`,
        { itemId: raffleItem._id }
      )

      for (const inventory of allInventories) {
        await client
          .patch(inventory._id)
          .set({
            'items[item._ref == $itemId].method': 'bid_complete'
          })
          .commit({ itemId: raffleItem._id })
      }
    }

    // Create notification for winner
    console.log('Creating notification for winner:', winnerAddress)
    
    // Create notification
    const notification = await client.create({
      _type: 'notification',
      recipientAddress: winnerAddress,
      type: 'RAFFLE_WIN',
      message: `Congratulations! You won the raffle for "${raffleItem.title}"!`,
      itemRef: {
        _type: 'reference',
        _ref: raffleItem._id
      },
      _createdAt: new Date().toISOString()
    }).catch(err => {
      console.error('Error creating notification:', err)
      return null
    })

    console.log('Created notification:', notification)

    return {
      winner: winnerAddress,
      ticketCount: userTicketTotals[winnerAddress],
      totalTickets: ticketPool.length,
      notification: notification
    }
  } catch (err) {
    console.error('Error in selectRaffleWinner:', err)
    return null
  }
}

export async function checkEndedRaffles() {
  try {
    // Find all biddable items that have ended but don't have a winner
    const endedRaffles = await client.fetch(`
      *[
        _type == "marketplaceItem" && 
        itemType == "biddable" && 
        bidEndTime < now() && 
        !defined(winner) && 
        available == true
      ] {
        _id,
        title,
        tickets
      }
    `)

    console.log('Found ended raffles:', endedRaffles.length)

    for (const raffle of endedRaffles) {
      const winner = await selectRaffleWinner(raffle)
      if (winner) {
        console.log(`Selected winner for ${raffle.title}:`, winner)
      }
    }
  } catch (err) {
    console.error('Error checking ended raffles:', err)
  }
} 