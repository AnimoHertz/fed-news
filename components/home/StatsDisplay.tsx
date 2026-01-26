'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface StatsDisplayProps {
  distributed: number;
  distributions: number;
  holders: number;
}

function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplayValue(value * eased);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}

export function StatsDisplay({ distributed, distributions, holders }: StatsDisplayProps) {
  return (
    <div className="relative">
      {/* Main stats container */}
      <div className="stats-display relative overflow-hidden rounded-2xl bg-gray-950 border border-gray-800">
        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500 to-transparent stats-line-animate" />
          <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-emerald-500 to-transparent stats-line-animate" />
        </div>
        <div className="absolute top-0 right-0 w-20 h-20">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-emerald-500 to-transparent stats-line-animate" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-emerald-500 to-transparent stats-line-animate" />
        </div>
        <div className="absolute bottom-0 left-0 w-20 h-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500 to-transparent stats-line-animate" />
          <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-emerald-500 to-transparent stats-line-animate" />
        </div>
        <div className="absolute bottom-0 right-0 w-20 h-20">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-emerald-500 to-transparent stats-line-animate" />
          <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-emerald-500 to-transparent stats-line-animate" />
        </div>

        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="stats-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stats-grid)" />
          </svg>
        </div>

        {/* Header bar */}
        <div className="relative px-6 py-3 border-b border-gray-800/50 bg-gray-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">
                Live Statistics
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 font-mono">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-800/50">
          {/* Distributed */}
          <div className="group relative p-6 sm:p-8 text-center transition-colors hover:bg-emerald-500/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
                <AnimatedNumber value={distributed} prefix="$" decimals={0} />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-emerald-500/50" />
                <span className="text-xs sm:text-sm uppercase tracking-[0.15em] text-emerald-500 font-medium">
                  Paid to $FED Holders
                </span>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-emerald-500/50" />
              </div>
              <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-wider">USD1 Stablecoin</p>
            </div>
          </div>

          {/* Distributions */}
          <div className="group relative p-6 sm:p-8 text-center transition-colors hover:bg-blue-500/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
                <AnimatedNumber value={distributions} />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-blue-500/50" />
                <span className="text-xs sm:text-sm uppercase tracking-[0.15em] text-blue-400 font-medium">
                  Distributions
                </span>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-blue-500/50" />
              </div>
              <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-wider">Total Payouts</p>
            </div>
          </div>

          {/* Holders */}
          <div className="group relative p-6 sm:p-8 text-center transition-colors hover:bg-purple-500/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
                <AnimatedNumber value={holders} />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-purple-500/50" />
                <span className="text-xs sm:text-sm uppercase tracking-[0.15em] text-purple-400 font-medium">
                  Holders
                </span>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-purple-500/50" />
              </div>
              <p className="mt-2 text-[10px] text-gray-600 uppercase tracking-wider">Active Wallets</p>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="relative px-6 py-4 border-t border-gray-800/50 bg-gray-900/30">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
              <span className="uppercase tracking-[0.15em]">Auto-updating every 2 minutes</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            </div>
            <Link
              href="/incentives"
              className="mt-1 px-4 py-1.5 text-[10px] sm:text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors uppercase tracking-[0.15em] font-medium rounded-md"
            >
              How it Works →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
