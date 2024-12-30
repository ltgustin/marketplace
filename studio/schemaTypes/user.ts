export default {
  name: 'user',
  title: 'User',
  type: 'document',
  liveEdit: true,
  permissions: [
    {
      role: 'anonymous',
      permissions: ['create']
    }
  ],
  fields: [
    {
      name: 'walletAddress',
      title: 'Wallet Address',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'baseAmount',
      title: 'Base Amount',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'multiplier',
      title: 'Multiplier',
      type: 'number',
      initialValue: 1
    },
    {
      name: 'perDay',
      title: 'Tokens Per Day',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'tokens',
      title: 'Total Tokens',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'lastSync',
      title: 'Last Sync',
      type: 'datetime'
    }
  ]
} 