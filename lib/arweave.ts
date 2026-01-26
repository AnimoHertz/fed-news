/**
 * Arweave upload utilities via Bundlr Network
 *
 * NOTE: Requires @bundlr-network/client to be installed:
 * npm install @bundlr-network/client
 *
 * Environment variable required:
 * ARWEAVE_PRIVATE_KEY - Base58 encoded Solana private key for upload wallet
 */

// Bundlr/Irys node URLs
const BUNDLR_NODE = 'https://node1.bundlr.network';

// Arweave gateway for retrieving content
export const ARWEAVE_GATEWAY = 'https://arweave.net';

export interface UploadResult {
  id: string;
  uri: string;
}

export interface AgentMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
}

/**
 * Creates agent NFT metadata in Metaplex standard format
 */
export function createAgentMetadata(
  agentName: string,
  traits: {
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
  },
  imageUri: string,
  rarityScore: number,
  rarityTier: string,
  creatorWallet: string
): AgentMetadata {
  return {
    name: agentName,
    symbol: 'FEDAGENT',
    description: `A unique Federal Agent from the Fed News collection. Tier: ${traits.tier.toUpperCase()} | Rarity: ${rarityTier} (${rarityScore}/1000)`,
    image: imageUri,
    external_url: 'https://fed.news/agents',
    attributes: [
      { trait_type: 'Head', value: traits.headStyle },
      { trait_type: 'Eyes', value: traits.eyeStyle },
      { trait_type: 'Mouth', value: traits.mouthStyle },
      { trait_type: 'Body', value: traits.bodyStyle },
      { trait_type: 'Feet', value: traits.feetStyle },
      { trait_type: 'Accessory', value: traits.accessory },
      { trait_type: 'Background', value: traits.bgStyle },
      { trait_type: 'Primary Color', value: traits.primaryColor },
      { trait_type: 'Secondary Color', value: traits.secondaryColor || traits.primaryColor },
      { trait_type: 'Accent Color', value: traits.accentColor },
      { trait_type: 'Tier', value: traits.tier },
      { trait_type: 'Rarity Score', value: rarityScore },
      { trait_type: 'Rarity Tier', value: rarityTier },
    ],
    properties: {
      files: [
        {
          uri: imageUri,
          type: 'image/png',
        },
      ],
      category: 'image',
      creators: [
        {
          address: creatorWallet,
          share: 100,
        },
      ],
    },
  };
}

/**
 * Uploads a PNG image to Arweave via Bundlr
 * @param imageDataUrl - Base64 data URL of the image
 * @returns Upload result with Arweave URI
 */
export async function uploadImageToArweave(imageDataUrl: string): Promise<UploadResult> {
  // Convert data URL to buffer
  const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  return uploadToArweave(buffer, 'image/png');
}

/**
 * Uploads JSON metadata to Arweave via Bundlr
 * @param metadata - NFT metadata object
 * @returns Upload result with Arweave URI
 */
export async function uploadMetadataToArweave(metadata: AgentMetadata): Promise<UploadResult> {
  const jsonString = JSON.stringify(metadata);
  const buffer = Buffer.from(jsonString, 'utf-8');

  return uploadToArweave(buffer, 'application/json');
}

/**
 * Core upload function using Bundlr Network
 * @param data - Data buffer to upload
 * @param contentType - MIME type of the content
 * @returns Upload result with Arweave transaction ID and URI
 */
export async function uploadToArweave(
  data: Buffer,
  contentType: string
): Promise<UploadResult> {
  const privateKey = process.env.ARWEAVE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ARWEAVE_PRIVATE_KEY environment variable is not set');
  }

  try {
    // Dynamic import for Bundlr to avoid client-side issues
    const { default: Bundlr } = await import('@bundlr-network/client');

    // Initialize Bundlr with Solana
    const bundlr = new Bundlr(BUNDLR_NODE, 'solana', privateKey, {
      providerUrl: process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    });

    // Check balance and fund if needed
    const price = await bundlr.getPrice(data.length);
    const balance = await bundlr.getLoadedBalance();

    if (balance.isLessThan(price)) {
      // In production, you'd want to handle this differently
      // For now, we'll throw an error
      throw new Error(
        `Insufficient Bundlr balance. Need ${price.toString()} atomic units, have ${balance.toString()}`
      );
    }

    // Create and upload transaction
    const tx = bundlr.createTransaction(data, {
      tags: [{ name: 'Content-Type', value: contentType }],
    });

    await tx.sign();
    const result = await tx.upload();

    return {
      id: result.id,
      uri: `${ARWEAVE_GATEWAY}/${result.id}`,
    };
  } catch (error) {
    console.error('Arweave upload error:', error);
    throw error;
  }
}

/**
 * Checks if the Arweave wallet has sufficient balance
 */
export async function checkArweaveBalance(): Promise<{
  balance: string;
  sufficient: boolean;
}> {
  const privateKey = process.env.ARWEAVE_PRIVATE_KEY;
  if (!privateKey) {
    return { balance: '0', sufficient: false };
  }

  try {
    const { default: Bundlr } = await import('@bundlr-network/client');

    const bundlr = new Bundlr(BUNDLR_NODE, 'solana', privateKey, {
      providerUrl: process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    });

    const balance = await bundlr.getLoadedBalance();
    // Consider sufficient if can upload at least 100KB
    const minPrice = await bundlr.getPrice(100 * 1024);

    return {
      balance: balance.toString(),
      sufficient: balance.isGreaterThanOrEqualTo(minPrice),
    };
  } catch (error) {
    console.error('Error checking Arweave balance:', error);
    return { balance: '0', sufficient: false };
  }
}

/**
 * Estimates the cost to upload data of a given size
 * @param sizeBytes - Size in bytes
 * @returns Estimated cost in SOL
 */
export async function estimateUploadCost(sizeBytes: number): Promise<string> {
  const privateKey = process.env.ARWEAVE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ARWEAVE_PRIVATE_KEY environment variable is not set');
  }

  try {
    const { default: Bundlr } = await import('@bundlr-network/client');

    const bundlr = new Bundlr(BUNDLR_NODE, 'solana', privateKey, {
      providerUrl: process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    });

    const price = await bundlr.getPrice(sizeBytes);
    return bundlr.utils.fromAtomic(price).toString();
  } catch (error) {
    console.error('Error estimating upload cost:', error);
    throw error;
  }
}
