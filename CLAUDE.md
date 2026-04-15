# Gold Price Ticker - Claude Code Instructions

A Shopify app that displays live gold prices to merchants.

## Tech Stack

- **Framework**: Shopify Remix App Template
- **Database**: Prisma with SQLite (dev) / PostgreSQL (prod)
- **UI**: Polaris components
- **API**: Shopify Admin API

## Available Agent Teams

This project supports Claude Code agent teams for complex tasks. Available agents:

| Agent | Role | Use For |
|-------|------|---------|
| `lead` | Team coordinator | Complex multi-file changes, ticket implementation |
| `planner` | Implementation architect | Creating implementation plans before coding |
| `shopify-expert` | Shopify/Hydrogen specialist | App config, extensions, GraphQL queries |
| `react-expert` | React specialist | UI components, hooks, state management |
| `typescript-expert` | TypeScript specialist | Complex types, generics, type safety |
| `tester` | Jest unit test specialist | Unit tests, coverage |
| `playwright-expert` | E2E test specialist | Browser automation, E2E flows |
| `reviewer` | Code review | Quality, security, standards compliance |
| `dependency-expert` | Package upgrades | Dependency updates, changelogs |

### Using Agent Teams

For complex tasks, ask Claude to create an agent team:

```
Create an agent team to implement the pricing dashboard feature.
Spawn a planner to create the implementation plan, then a react-expert
and shopify-expert to implement it.
```

## Project Structure

```
gold-price-ticker/
├── app/
│   ├── routes/          # Remix routes
│   ├── components/      # React components
│   └── lib/             # Utilities
├── extensions/          # Shopify extensions
├── prisma/              # Database schema
└── .claude/
    ├── agents/          # Agent definitions (symlinked to global)
    └── skills/          # Project-specific skills
```

## Development Commands

```bash
shopify app dev          # Start dev server
npm run build            # Build for production
npm run test             # Run tests
```

## Key Considerations

- Gold prices update frequently - handle caching appropriately
- Merchant settings stored in database
- Extension renders in storefront via app blocks
