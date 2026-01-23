'use client';

import { useState } from 'react';

interface CopyAddressProps {
  address: string;
  label?: string;
}

export function CopyAddress({ address, label = 'Token Address' }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors group"
      title="Click to copy"
    >
      <span className="text-gray-600">{label}:</span>
      <span className="text-gray-400 group-hover:text-white">{shortAddress}</span>
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
