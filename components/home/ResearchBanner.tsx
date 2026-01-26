'use client';

import Link from 'next/link';
import type { ParsedCommit } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

interface ResearchBannerProps {
  latestResearch: ParsedCommit | null;
  totalCount: number;
}

export function ResearchBanner({ latestResearch, totalCount }: ResearchBannerProps) {
  if (!latestResearch) return null;

  return (
    <section className="mb-16">
      <Link
        href="/commits?category=research"
        className="group block relative overflow-hidden rounded-2xl bg-gray-950 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-500"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="research-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Hexagonal/molecular pattern */}
                <circle cx="30" cy="30" r="2" fill="#f59e0b" />
                <circle cx="0" cy="0" r="1.5" fill="#f59e0b" />
                <circle cx="60" cy="0" r="1.5" fill="#f59e0b" />
                <circle cx="0" cy="60" r="1.5" fill="#f59e0b" />
                <circle cx="60" cy="60" r="1.5" fill="#f59e0b" />
                <line x1="30" y1="30" x2="0" y2="0" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
                <line x1="30" y1="30" x2="60" y2="0" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
                <line x1="30" y1="30" x2="0" y2="60" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
                <line x1="30" y1="30" x2="60" y2="60" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#research-grid)" />
          </svg>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glowing orb effect */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Icon section */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-1 rounded-full border border-amber-500/20 animate-[spin_15s_linear_infinite_reverse]" />

                {/* Icon container */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Research
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {totalCount} report{totalCount !== 1 ? 's' : ''} published
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 group-hover:text-amber-50 transition-colors">
                AI Research & Analysis
              </h3>

              {/* Latest research preview */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                  {latestResearch.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Latest update {formatRelativeDate(latestResearch.date)}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                <span>Explore research</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Stats badge */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-800/50">
              <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">{totalCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Reports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
    </section>
  );
}
