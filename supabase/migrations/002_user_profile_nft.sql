-- Migration: Add user profile settings for NFT profile pictures
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_address VARCHAR(44) PRIMARY KEY,
  profile_nft_id UUID REFERENCES minted_agents(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for looking up by NFT
CREATE INDEX idx_user_profiles_nft ON user_profiles(profile_nft_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON user_profiles
  FOR SELECT USING (true);

-- Allow insert/update from service role
CREATE POLICY "Allow service role insert" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update" ON user_profiles
  FOR UPDATE USING (true);

-- Comments
COMMENT ON TABLE user_profiles IS 'Stores user profile settings including selected NFT profile picture';
COMMENT ON COLUMN user_profiles.profile_nft_id IS 'Reference to minted_agents for profile picture';
