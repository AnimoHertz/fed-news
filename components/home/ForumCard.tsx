'use client';

import Link from 'next/link';

interface ForumCardProps {
  messageCount?: number;
  activeUsers?: number;
}

export function ForumCard({ messageCount = 0, activeUsers = 0 }: ForumCardProps) {
  const tiers = [
    { name: 'Chairman', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { name: 'Governor', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { name: 'Director', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { name: 'Member', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  ];

  return (
    <section className="mb-16">
      <Link
        href="/forum"
        className="group block relative overflow-hidden rounded-2xl bg-gray-950 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-500"
      >
        {/* Animated background pattern - chat bubble grid */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="forum-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Chat bubble pattern */}
                <path
                  d="M20 15c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-1.5 0-3-.3-4.3-.9L20 27v-7.5c-1.3-1.2-2-3-2-4.5z"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle cx="60" cy="60" r="3" fill="#8b5cf6" opacity="0.4" />
                <circle cx="70" cy="50" r="2" fill="#8b5cf6" opacity="0.3" />
                <circle cx="50" cy="70" r="2" fill="#8b5cf6" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#forum-grid)" />
          </svg>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glowing orb effect */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Icon section */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Outer ring with pulse */}
                <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-1 rounded-full border border-violet-500/20 animate-[spin_15s_linear_infinite_reverse]" />

                {/* Icon container */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/30 flex items-center justify-center">
                  {/* Chat icon */}
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>

                {/* Live indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-950 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  Token-gated community
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 group-hover:text-violet-50 transition-colors">
                Join the Conversation
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Connect with fellow $FED holders. Your balance unlocks exclusive tier badges from Fed Citizen to Fed Chairman.
              </p>

              {/* Tier badges preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tiers.map((tier) => (
                  <span
                    key={tier.name}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${tier.bg} ${tier.color} border border-current/20`}
                  >
                    {tier.name}
                  </span>
                ))}
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-500/10 text-gray-500 border border-gray-500/20">
                  +1 more
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
                <span>Enter the forum</span>
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

            {/* Stats (desktop) */}
            {(messageCount > 0 || activeUsers > 0) && (
              <div className="hidden lg:flex flex-col items-end gap-3">
                {messageCount > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-violet-400 font-mono">{messageCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Messages</div>
                  </div>
                )}
                {activeUsers > 0 && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400 font-mono">{activeUsers}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Active</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features row */}
          <div className="mt-6 pt-5 border-t border-gray-800/50 flex flex-wrap gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
              <span>Wallet connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span>Threaded replies</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.53 4.53 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
              </svg>
              <span>Upvote posts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span>Reply notifications</span>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
    </section>
  );
}
