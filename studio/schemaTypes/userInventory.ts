export default {
  name: 'userInventory',
  title: 'User Inventory',
  type: 'document',
  fields: [
    {
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'item',
              title: 'Item',
              type: 'reference',
              to: [{ type: 'marketplaceItem' }]
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number'
            },
            {
              name: 'acquiredDate',
              title: 'Acquired Date',
              type: 'datetime'
            },
            {
              name: 'method',
              title: 'Acquisition Method',
              type: 'string',
              options: {
                list: [
                  { title: 'Purchase', value: 'purchase' },
                  { title: 'Bid Win', value: 'bid_win' },
                  { title: 'Bid Pending', value: 'bid_pending' }
                ]
              }
            }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      userName: 'user.walletAddress',
      userId: 'user._ref'
    },
    prepare({ userName, userId }) {
      return {
        title: `Inventory: ${userName || userId || 'Unknown User'}`
      }
    }
  }
} 