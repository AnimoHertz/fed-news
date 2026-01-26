import { NextRequest, NextResponse } from 'next/server';
import {
  uploadImageToArweave,
  uploadMetadataToArweave,
  createAgentMetadata,
} from '@/lib/arweave';
import { AgentTraits } from '@/lib/agent-hash';

interface UploadImageRequest {
  type: 'image';
  data: string; // Base64 data URL
}

interface UploadMetadataRequest {
  type: 'metadata';
  traits: AgentTraits;
  imageUri: string;
  rarityScore: number;
  rarityTier: string;
  creatorWallet: string;
}

type UploadRequest = UploadImageRequest | UploadMetadataRequest;

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();

    if (!body.type) {
      return NextResponse.json(
        { error: 'Upload type required (image or metadata)' },
        { status: 400 }
      );
    }

    if (body.type === 'image') {
      if (!body.data) {
        return NextResponse.json(
          { error: 'Image data required' },
          { status: 400 }
        );
      }

      // Validate it's a data URL
      if (!body.data.startsWith('data:image/')) {
        return NextResponse.json(
          { error: 'Invalid image data URL format' },
          { status: 400 }
        );
      }

      // Check if Arweave is configured before attempting upload
      if (!process.env.ARWEAVE_PRIVATE_KEY) {
        const mockId = `mock_img_${Date.now()}`;
        return NextResponse.json({
          success: true,
          type: 'image',
          id: mockId,
          uri: `https://arweave.net/${mockId}`,
          mock: true,
          warning: 'Arweave not configured - using mock URI',
        });
      }

      try {
        const result = await uploadImageToArweave(body.data);
        return NextResponse.json({
          success: true,
          type: 'image',
          id: result.id,
          uri: result.uri,
        });
      } catch (error) {
        console.error('Image upload error:', error);

        // Return mock URI for development if Arweave fails (e.g., insufficient balance)
        const mockId = `mock_img_${Date.now()}`;
        return NextResponse.json({
          success: true,
          type: 'image',
          id: mockId,
          uri: `https://arweave.net/${mockId}`,
          mock: true,
          warning: error instanceof Error ? error.message : 'Arweave upload failed - using mock URI',
        });
      }
    }

    if (body.type === 'metadata') {
      const { traits, imageUri, rarityScore, rarityTier, creatorWallet } = body;

      if (!traits || !imageUri || rarityScore === undefined || !rarityTier || !creatorWallet) {
        return NextResponse.json(
          { error: 'Missing required metadata fields' },
          { status: 400 }
        );
      }

      // Generate agent name
      const agentName = `Federal Agent #${Date.now().toString(36).toUpperCase()}`;

      // Create metadata object
      const metadata = createAgentMetadata(
        agentName,
        traits,
        imageUri,
        rarityScore,
        rarityTier,
        creatorWallet
      );

      // Check if Arweave is configured before attempting upload
      if (!process.env.ARWEAVE_PRIVATE_KEY) {
        const mockId = `mock_meta_${Date.now()}`;
        return NextResponse.json({
          success: true,
          type: 'metadata',
          id: mockId,
          uri: `https://arweave.net/${mockId}`,
          name: agentName,
          mock: true,
          warning: 'Arweave not configured - using mock URI',
        });
      }

      try {
        const result = await uploadMetadataToArweave(metadata);
        return NextResponse.json({
          success: true,
          type: 'metadata',
          id: result.id,
          uri: result.uri,
          name: agentName,
        });
      } catch (error) {
        console.error('Metadata upload error:', error);

        // Return mock URI for development if Arweave fails (e.g., insufficient balance)
        const mockId = `mock_meta_${Date.now()}`;
        return NextResponse.json({
          success: true,
          type: 'metadata',
          id: mockId,
          uri: `https://arweave.net/${mockId}`,
          name: agentName,
          mock: true,
          warning: error instanceof Error ? error.message : 'Arweave upload failed - using mock URI',
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid upload type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
