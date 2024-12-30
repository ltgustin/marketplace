import { useState, useEffect } from 'react'
import { client } from '../lib/sanity'
import { format } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function Notifications({ userAddress }) {
  const [notifications, setNotifications] = useState([])
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    if (!userAddress) return

    // Initial fetch
    fetchNotifications()

    // Set up polling for new notifications every 30 seconds
    const pollInterval = setInterval(fetchNotifications, 30000)

    // Set up real-time listener
    const subscription = client
      .listen(`*[_type == "notification" && 
        recipientAddress == $address && 
        !viewed] | order(_createdAt desc)`,
      { address: userAddress })
      .subscribe(update => {
        console.log('Notification update:', update)
        if (update.type === 'appear') {
          setHasNew(true)
          fetchNotifications()
        }
      })

    return () => {
      clearInterval(pollInterval)
      subscription.unsubscribe()
    }
  }, [userAddress])

  async function fetchNotifications() {
    try {
      console.log('Fetching notifications for:', userAddress)
      const results = await client.fetch(`
        *[_type == "notification" && 
          recipientAddress == $address] | order(_createdAt desc)[0...5] {
          _id,
          type,
          message,
          itemRef->,
          _createdAt,
          viewed
        }
      `, { address: userAddress })
      
      console.log('Fetched notifications:', results)
      setNotifications(results)
      
      // If there are any unviewed notifications, set hasNew to true
      if (results.some(notif => !notif.viewed)) {
        setHasNew(true)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  async function markAsRead(notificationId) {
    try {
      await client
        .patch(notificationId)
        .set({ viewed: true })
        .commit()
      
      setHasNew(false)
      fetchNotifications()
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Add a visual indicator when new notifications arrive
  useEffect(() => {
    if (hasNew) {
      // Optional: Play a sound or show a toast
      const title = document.title
      document.title = '🎉 New Notification!'
      
      return () => {
        document.title = title
      }
    }
  }, [hasNew])

  return (
    <div className="notifications-wrapper">
      <div 
        className={`notifications-icon ${hasNew ? 'has-new' : ''}`}
        onClick={() => setHasNew(false)}
      >
        <FontAwesomeIcon icon="fa-bell" />
        {hasNew && <span className="notification-badge" />}
      </div>

      <div className="notifications-dropdown">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${!notification.viewed ? 'unread' : ''}`}
              onClick={() => markAsRead(notification._id)}
            >
              {notification.type === 'RAFFLE_WIN' && (
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="win-badge">Winner!</span>
                    <span className="date">
                      {format(new Date(notification._createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                  {notification.itemRef && (
                    <div className="item-preview">
                      <img 
                        src={notification.itemRef.image?.asset.url} 
                        alt={notification.itemRef.title} 
                      />
                      <span>{notification.itemRef.title}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            No notifications
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications 