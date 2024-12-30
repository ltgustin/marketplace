import { useState } from 'react'
import SanityImage from './SanityImage'

export function PurchasableItem({ item, onPurchase, userTokens }) {
  const [quantity, setQuantity] = useState(1)
  const totalCost = item.tokenCost * quantity
  const canAfford = userTokens >= totalCost
  const isAvailable = item.quantity > 0

  const handleQuantityChange = (e) => {
    const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), item.quantity)
    setQuantity(value)
  }

  return (
    <div className="marketplace-item">
      <div className="item-image">
        <SanityImage image={item.image} />
      </div>
      <div className="item-details">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="item-meta">
          <span className="cost">{item.tokenCost} tokens</span>
          <span className="quantity">
            {item.quantity} remaining
          </span>
        </div>
        {isAvailable ? (
          <div className="purchase-controls">
            <input
              type="number"
              min="1"
              max={item.quantity}
              value={quantity}
              onChange={handleQuantityChange}
            />
            <button
              onClick={() => onPurchase(item, quantity)}
              disabled={!canAfford || !isAvailable}
              className={`purchase-btn ${!canAfford ? 'disabled' : ''}`}
            >
              {canAfford ? 'Purchase' : 'Not enough tokens'}
            </button>
          </div>
        ) : (
          <div className="sold-out">Sold Out</div>
        )}
      </div>
    </div>
  )
}

export default PurchasableItem 