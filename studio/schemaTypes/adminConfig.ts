export default {
  name: 'adminConfig',
  title: 'Admin Configuration',
  type: 'document',
  fields: [
    {
      name: 'contractInfo',
      title: 'NFT Contract Information',
      type: 'object',
      fields: [
        {
          name: 'contractAddress',
          title: 'Contract Address',
          type: 'string',
          validation: Rule => Rule.required()
        },
        {
          name: 'contractName',
          title: 'Contract Name',
          type: 'string',
          validation: Rule => Rule.required()
        }
      ]
    },
    {
      name: 'tokenSystem',
      title: 'Token System Settings',
      type: 'object',
      fields: [
        {
          name: 'baseRewardRate',
          title: 'Base Reward Rate',
          type: 'number',
          validation: Rule => Rule.required().min(0)
        },
        {
          name: 'lastGlobalUpdate',
          title: 'Last Global Update',
          type: 'datetime'
        },
        {
          name: 'updateInterval',
          title: 'Update Interval (in ms)',
          type: 'number',
          validation: Rule => Rule.required().min(0)
        },
        {
          name: 'multiplierRates',
          title: 'Multiplier Rates',
          type: 'object',
          fields: [
            { name: 'tier1', title: 'Tier 1', type: 'number' },
            { name: 'tier2', title: 'Tier 2', type: 'number' },
            { name: 'tier3', title: 'Tier 3', type: 'number' },
            { name: 'tier4', title: 'Tier 4', type: 'number' },
            { name: 'tier5', title: 'Tier 5', type: 'number' }
          ]
        }
      ]
    }
  ]
} 