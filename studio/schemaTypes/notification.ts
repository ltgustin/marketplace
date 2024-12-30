export default {
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    {
      name: 'recipientAddress',
      title: 'Recipient Address',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'type',
      title: 'Notification Type',
      type: 'string',
      options: {
        list: [
          { title: 'Raffle Win', value: 'RAFFLE_WIN' },
          // Add other types as needed
        ]
      }
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text'
    },
    {
      name: 'itemRef',
      title: 'Related Item',
      type: 'reference',
      to: [{ type: 'marketplaceItem' }]
    },
    {
      name: 'viewed',
      title: 'Viewed',
      type: 'boolean',
      initialValue: false
    }
  ]
} 