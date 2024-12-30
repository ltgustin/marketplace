import { format } from 'date-fns'
import SanityImage from './SanityImage'

export function InventoryItem({ item }) {
  const acquiredDate = format(new Date(item.acquiredDate), 'MMM d, yyyy')

  return (
    <div className="inventory-item">
      <div className="item-image">
        <SanityImage image={item.item.image} />
      </div>
      <div className="item-details">
        <h3>{item.item.title}</h3>
        <p>{item.item.description}</p>
        <div className="item-meta">
          <span className="quantity">Quantity: {item.quantity}</span>
          <span className="acquired-date">Acquired: {acquiredDate}</span>
        </div>
      </div>
    </div>
  )
}

export default InventoryItem 