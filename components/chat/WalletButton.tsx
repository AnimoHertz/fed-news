'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  const { wallet, publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (publicKey) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {connecting ? (
        'Connecting...'
      ) : publicKey ? (
        <span className="flex items-center gap-2">
          {wallet?.adapter.icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="w-4 h-4"
            />
          )}
          {formatAddress(publicKey.toBase58())}
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
