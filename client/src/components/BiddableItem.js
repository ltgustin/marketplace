import { useState, useEffect } from 'react'
import SanityImage from './SanityImage'

export function BiddableItem({ item, onPurchaseTickets, userTokens, userAddress }) {
  const [quantity, setQuantity] = useState(1)
  const [timeLeft, setTimeLeft] = useState('')
  const totalCost = item.tokenCost * quantity
  const canAfford = userTokens >= totalCost
  
  // Calculate user's current tickets
  const userTickets = item.tickets?.filter(
    ticket => ticket.walletAddress === userAddress
  ).reduce((total, ticket) => total + ticket.quantity, 0) || 0

  // Calculate total tickets
  const totalTickets = item.tickets?.reduce(
    (total, ticket) => total + ticket.quantity, 0
  ) || 0

  useEffect(() => {
    function updateTimeLeft() {
      const now = new Date()
      const endTime = new Date(item.bidEndTime)
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
  }, [item.bidEndTime])

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setQuantity(value)
  }

  const isEnded = new Date(item.bidEndTime) <= new Date()

  return (
    <div className="marketplace-item raffle">
      <div className="item-image">
        <SanityImage image={item.image} />
      </div>
      <div className="item-details">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="item-meta">
          <span className="cost">{item.tokenCost} tokens per ticket</span>
          <span className="time-left">Ends in: {timeLeft}</span>
        </div>
        <div className="ticket-info">
          <span>Your tickets: {userTickets}</span>
          <span>Total tickets: {totalTickets}</span>
          <span>Win chance: {totalTickets ? ((userTickets / totalTickets) * 100).toFixed(1) : 0}%</span>
        </div>
        {!isEnded ? (
          <div className="purchase-controls">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
            />
            <button
              onClick={() => onPurchaseTickets(item, quantity)}
              disabled={!canAfford}
              className={`purchase-btn ${!canAfford ? 'disabled' : ''}`}
            >
              {canAfford ? 'Buy Tickets' : 'Not enough tokens'}
            </button>
          </div>
        ) : (
          <div className="ended">Raffle Ended</div>
        )}
      </div>
    </div>
  )
}

export default BiddableItem 