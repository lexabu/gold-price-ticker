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
npm run dev              # shopify app dev (tunnel + hot reload)
npm run build            # react-router build for production
npm run start            # Serve production build
npm run setup            # prisma generate && prisma migrate deploy
npm run lint             # ESLint
npm run typecheck        # react-router typegen + tsc --noEmit
npm run deploy           # shopify app deploy
npm run test:e2e         # playwright test (E2E suite)
npm run test:e2e:ui      # playwright test --ui
npm run test:e2e:debug   # playwright test --debug
```

## Environment Variables

Required in `.env` (dev) and production host:

```bash
SHOPIFY_API_KEY=<key>
SHOPIFY_API_SECRET=<secret>
SCOPES=<scopes>
HOST=<ngrok-or-production-url>
DATABASE_URL=<sqlite-dev-or-postgres-prod-url>
OPENAI_API_KEY=<key>              # AI product recommendations
```

## Pre-Commit Checklist

Before committing:
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No `.env` secrets committed

## Key Considerations

- Gold prices update frequently - handle caching appropriately
- Merchant settings stored in database
- Extension renders in storefront via app blocks
