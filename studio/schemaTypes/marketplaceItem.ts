export default {
  name: 'marketplaceItem',
  title: 'Marketplace Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image'
    },
    {
      name: 'itemType',
      title: 'Item Type',
      type: 'string',
      options: {
        list: [
          { title: 'Purchasable', value: 'purchasable' },
          { title: 'Biddable', value: 'biddable' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'tokenCost',
      title: 'Token Cost',
      type: 'number',
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'quantity',
      title: 'Quantity Available',
      type: 'number',
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'available',
      title: 'Available',
      type: 'boolean',
      initialValue: true
    },
    // Biddable-specific fields
    {
      name: 'bidEndTime',
      title: 'Bid End Time',
      type: 'datetime',
      hidden: ({ document }) => document?.itemType !== 'biddable'
    },
    {
      name: 'tickets',
      title: 'Tickets',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'walletAddress',
            type: 'string',
            title: 'Wallet Address'
          },
          {
            name: 'quantity',
            type: 'number',
            title: 'Quantity'
          },
          {
            name: 'purchaseDate',
            type: 'datetime',
            title: 'Purchase Date'
          }
        ],
        preview: {
          select: {
            address: 'walletAddress',
            quantity: 'quantity'
          },
          prepare({ address, quantity }) {
            return {
              title: `${quantity} tickets - ${address}`
            }
          }
        }
      }],
      hidden: ({ document }) => document?.itemType !== 'biddable'
    },
    // Tracking ownership
    {
      name: 'owners',
      title: 'Owners',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'walletAddress',
              title: 'Wallet Address',
              type: 'string'
            },
            {
              name: 'purchaseDate',
              title: 'Purchase Date',
              type: 'datetime'
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number'
            }
          ]
        }
      ]
    },
    {
      name: 'winner',
      title: 'Winner',
      type: 'object',
      fields: [
        {
          name: 'walletAddress',
          title: 'Wallet Address',
          type: 'string'
        },
        {
          name: 'ticketCount',
          title: 'Winning Ticket Count',
          type: 'number'
        },
        {
          name: 'totalTickets',
          title: 'Total Tickets',
          type: 'number'
        },
        {
          name: 'winningOdds',
          title: 'Winning Odds',
          type: 'string'
        },
        {
          name: 'selectedAt',
          title: 'Selected At',
          type: 'datetime'
        }
      ]
    }
  ]
} 