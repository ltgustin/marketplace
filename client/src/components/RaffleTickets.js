import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import SanityImage from './SanityImage'

export function RaffleTickets({ item, userAddress, purchaseHistory = [] }) {
  const [timeLeft, setTimeLeft] = useState('')
  
  // Get total tickets for this raffle
  const totalRaffleTickets = item.item.tickets?.reduce(
    (total, ticket) => total + ticket.quantity, 0
  ) || 0

  // Calculate win chance based on user's total tickets
  const winChance = totalRaffleTickets ? 
    ((item.quantity / totalRaffleTickets) * 100).toFixed(1) : 0

  useEffect(() => {
    function updateTimeLeft() {
      const now = new Date()
      const endTime = new Date(item.item.bidEndTime)
      const diff = endTime - now

      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [item.item.bidEndTime])

  const isEnded = new Date(item.item.bidEndTime) <= new Date()
  const totalSpent = item.quantity * item.item.tokenCost

  return (
    <div className="raffle-ticket-item">
      <div className="item-image">
        <SanityImage image={item.item.image} />
      </div>
      <div className="item-details">
        <div className="item-header">
          <h3>{item.item.title}</h3>
          <div className="time-status">
            {isEnded ? (
              <span className="ended">Raffle Ended</span>
            ) : (
              <span className="time-left">Ends in: {timeLeft}</span>
            )}
          </div>
        </div>

        <p>{item.item.description}</p>
        
        <div className="ticket-stats">
          <div className="stat">
            <span className="label">Your Tickets</span>
            <span className="value">{item.quantity}</span>
          </div>
          <div className="stat">
            <span className="label">Total Tickets</span>
            <span className="value">{totalRaffleTickets}</span>
          </div>
          <div className="stat">
            <span className="label">Win Chance</span>
            <span className="value">{winChance}%</span>
          </div>
          <div className="stat">
            <span className="label">Total Spent</span>
            <span className="value">{totalSpent} tokens</span>
          </div>
        </div>

        <div className="purchase-history">
          <h4>Purchase History</h4>
          <div className="history-list">
            {purchaseHistory.sort((a, b) => 
              new Date(b.acquiredDate) - new Date(a.acquiredDate)
            ).map((purchase, index) => (
              <div key={index} className="history-item">
                <span className="quantity">+{purchase.quantity} tickets</span>
                <span className="date">
                  {format(new Date(purchase.acquiredDate), 'MMM d, h:mm a')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RaffleTickets 