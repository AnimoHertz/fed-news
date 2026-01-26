-- Migration: Create minted_agents table for NFT tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS minted_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Uniqueness hash (SHA-256 of all traits)
  trait_hash VARCHAR(64) UNIQUE NOT NULL,

  -- Character traits
  head_style VARCHAR(20) NOT NULL,
  eye_style VARCHAR(20) NOT NULL,
  mouth_style VARCHAR(20) NOT NULL,
  body_style VARCHAR(20) NOT NULL,
  feet_style VARCHAR(20) NOT NULL,
  accessory VARCHAR(20) NOT NULL,
  bg_style VARCHAR(20) NOT NULL,

  -- Colors
  primary_color VARCHAR(7) NOT NULL,
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7) NOT NULL,

  -- Agent tier
  tier VARCHAR(20) NOT NULL,

  -- NFT data
  nft_mint_address VARCHAR(44) NOT NULL,
  metadata_uri TEXT NOT NULL,
  image_uri TEXT NOT NULL,

  -- Ownership
  owner_wallet VARCHAR(44) NOT NULL,
  minter_wallet VARCHAR(44) NOT NULL,

  -- Transactions
  mint_transaction VARCHAR(88) NOT NULL,
  payment_transaction VARCHAR(88) NOT NULL,

  -- Payment info
  payment_amount BIGINT NOT NULL, -- Raw $FED amount (no decimals)

  -- Rarity
  rarity_score INTEGER NOT NULL CHECK (rarity_score >= 0 AND rarity_score <= 1000),
  rarity_tier VARCHAR(20) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_minted_agents_owner ON minted_agents(owner_wallet);
CREATE INDEX idx_minted_agents_minter ON minted_agents(minter_wallet);
CREATE INDEX idx_minted_agents_rarity_score ON minted_agents(rarity_score DESC);
CREATE INDEX idx_minted_agents_rarity_tier ON minted_agents(rarity_tier);
CREATE INDEX idx_minted_agents_tier ON minted_agents(tier);
CREATE INDEX idx_minted_agents_created_at ON minted_agents(created_at DESC);
CREATE INDEX idx_minted_agents_nft_mint ON minted_agents(nft_mint_address);

-- Enable Row Level Security
ALTER TABLE minted_agents ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON minted_agents
  FOR SELECT USING (true);

-- Allow insert from authenticated service role only (API routes use service key)
CREATE POLICY "Allow service role insert" ON minted_agents
  FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE minted_agents IS 'Stores minted Federal Agent NFTs with trait uniqueness';
COMMENT ON COLUMN minted_agents.trait_hash IS 'SHA-256 hash of all traits for uniqueness';
COMMENT ON COLUMN minted_agents.payment_amount IS 'Raw $FED token amount paid (no decimals)';
COMMENT ON COLUMN minted_agents.rarity_score IS 'Rarity score from 0-1000';
