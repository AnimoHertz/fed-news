'use client';

import { useRef, useState } from 'react';

interface PayoutShareCardProps {
  totalReceived: number;
  transferCount: number;
  tierName: string;
  tierColor: string;
  address: string;
}

export function PayoutShareCard({
  totalReceived,
  transferCount,
  tierName,
  tierColor,
  address,
}: PayoutShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return amount.toFixed(4);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/payouts?address=${address}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My FED Earnings',
      text: `The New Fed has paid me $${formatAmount(totalReceived)} USD1 across ${transferCount} distributions. Check your payouts:`,
      url: `${window.location.origin}/payouts`,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="mb-8">
      {/* The Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-gray-950 p-1"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
        }}
      >
        <div className="relative rounded-xl bg-gray-950 p-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Symmetrical grid pattern */}
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Radial glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest mb-2">
                <span className="w-8 h-px bg-gray-700" />
                <span>The New Fed</span>
                <span className="w-8 h-px bg-gray-700" />
              </div>
              <p className="text-gray-400 text-sm">has paid me</p>
            </div>

            {/* Amount - The Star */}
            <div className="mb-6">
              <div className="relative inline-block">
                {/* Outer glow effect */}
                <div className="absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full" />

                <div className="relative">
                  <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    ${formatAmount(totalReceived)}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2 tracking-wide">USD1</p>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl font-mono text-white">{transferCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Distributions</div>
              </div>
            </div>

            {/* User Title */}
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${tierColor} bg-gray-800/80 border border-gray-700/50`}>
              {tierName}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-800/50">
              <div className="text-xs text-gray-600">
                thenewfed.com
              </div>
            </div>
          </div>

          {/* Corner accents for symmetry */}
          <div className="absolute top-4 left-4 w-3 h-3 border-l border-t border-gray-700/50" />
          <div className="absolute top-4 right-4 w-3 h-3 border-r border-t border-gray-700/50" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-l border-b border-gray-700/50" />
          <div className="absolute bottom-4 right-4 w-3 h-3 border-r border-b border-gray-700/50" />
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={handleShare}
          className="group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={handleCopyLink}
          className="group flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 border border-gray-700"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-400 animate-bounce-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
