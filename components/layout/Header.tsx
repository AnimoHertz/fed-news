'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { href: '/incentives', label: 'How it Works' },
  { href: '/payouts', label: 'Payouts' },
  { href: '/growth', label: 'Stats' },
  { href: '/agents', label: 'Agents' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/manifesto', label: 'Manifesto' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-xl sm:text-2xl md:text-3xl font-medium">Federal Cash</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-4 text-sm text-gray-400">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative hover:text-white transition-all hover:scale-105 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-emerald-500 after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Forum
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white transition-colors py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/forum"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Forum
              </Link>
            </div>
          </nav>
        )}
      </div>
      <div className="animated-gradient-line" />
    </header>
  );
}
