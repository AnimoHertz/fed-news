'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

function getRpcEndpoint(): string {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  const endpoint = apiKey
    ? `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
    : 'https://api.mainnet-beta.solana.com';
  console.log('[RPC] Using endpoint:', apiKey ? 'Helius' : 'Public fallback');
  return endpoint;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const endpoint = useMemo(() => getRpcEndpoint(), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
