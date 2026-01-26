# Fed News

Development updates and community hub for the [$FED project](https://github.com/snark-tank/ralph) on Solana.

## What is $FED?

Autonomous USD1 distribution system. Collects trading fees, distributes stablecoins to holders every 2 minutes.

## Features

### Federal Agents (NFTs)
- **Mint unique agents** - Over 1.4M possible trait combinations
- **Rarity tiers** - Common, Uncommon, Rare, Epic, Legendary
- **On-chain traits** - Each agent has unique visual attributes
- **Profile pictures** - Use your minted agent as your forum avatar

### Forum
- **Token-gated posting** - Hold $FED to participate
- **Tier system** - Chairman, Governor, Director, Member, Citizen
- **Threaded replies** - Nested conversations
- **Upvoting** - Community curation

### Profile System
- **NFT avatars** - Display your Federal Agent
- **Balance tracking** - Shows $FED holdings
- **Activity stats** - Post count and engagement

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Required for wallet RPC
NEXT_PUBLIC_HELIUS_API_KEY=your-helius-api-key
HELIUS_API_KEY=your-helius-api-key

# Supabase (for NFT tracking)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional (uses mock URIs if not set)
ARWEAVE_PRIVATE_KEY=your-arweave-key
```

## Database Setup

Run these migrations in Supabase SQL Editor:
- `supabase/migrations/001_create_minted_agents.sql`
- `supabase/migrations/002_user_profile_nft.sql`

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Supabase
- Arweave (for NFT metadata)
