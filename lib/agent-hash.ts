import { CharacterProps } from '@/components/characters/ShapeCharacter';

export interface AgentTraits {
  headStyle: string;
  eyeStyle: string;
  mouthStyle: string;
  bodyStyle: string;
  feetStyle: string;
  accessory: string;
  bgStyle: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor: string;
  tier: string;
}

/**
 * Normalizes traits to ensure consistent hash generation
 * - Converts all values to lowercase
 * - Uses empty string for undefined/null secondaryColor
 * - Sorts keys alphabetically
 */
function normalizeTraits(traits: AgentTraits): string {
  const normalized = {
    accessory: traits.accessory.toLowerCase(),
    accentColor: traits.accentColor.toLowerCase(),
    bgStyle: traits.bgStyle.toLowerCase(),
    bodyStyle: traits.bodyStyle.toLowerCase(),
    eyeStyle: traits.eyeStyle.toLowerCase(),
    feetStyle: traits.feetStyle.toLowerCase(),
    headStyle: traits.headStyle.toLowerCase(),
    mouthStyle: traits.mouthStyle.toLowerCase(),
    primaryColor: traits.primaryColor.toLowerCase(),
    secondaryColor: (traits.secondaryColor || '').toLowerCase(),
    tier: traits.tier.toLowerCase(),
  };

  // Create deterministic string representation
  return JSON.stringify(normalized);
}

/**
 * Generates a SHA-256 hash from agent traits
 * Used for uniqueness checking - same traits = same hash
 */
export async function generateTraitHash(traits: AgentTraits): Promise<string> {
  const normalizedString = normalizeTraits(traits);

  // Use Web Crypto API for SHA-256 hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);

  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Synchronous hash generation using Node.js crypto (for server-side)
 */
export function generateTraitHashSync(traits: AgentTraits): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  const normalizedString = normalizeTraits(traits);
  return crypto.createHash('sha256').update(normalizedString).digest('hex');
}

/**
 * Converts CharacterProps to AgentTraits format
 */
export function characterToTraits(
  char: CharacterProps & { tier: string }
): AgentTraits {
  return {
    headStyle: char.headStyle || 'circle',
    eyeStyle: char.eyeStyle || 'dots',
    mouthStyle: char.mouthStyle || 'wave',
    bodyStyle: char.bodyStyle || 'blob',
    feetStyle: char.feetStyle || 'orbs',
    accessory: char.accessory || 'none',
    bgStyle: char.bgStyle || 'solid',
    primaryColor: char.primaryColor || '#6b7280',
    secondaryColor: char.secondaryColor,
    accentColor: char.accentColor || '#ffffff',
    tier: char.tier,
  };
}

/**
 * Validates that a hash is a valid SHA-256 hex string
 */
export function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}
