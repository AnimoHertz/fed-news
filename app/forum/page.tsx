import Image from 'next/image';
import Link from 'next/link';
import { ChatForum } from '@/components/chat/ChatForum';

export const metadata = {
  title: 'Forum | Fed News',
  description: 'Community forum for $FED token holders.',
};

export default function ForumPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logoseal.png" alt="FED logo" width={120} height={120} />
              <span className="text-xl font-medium">Fed News</span>
            </Link>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/incentives" className="hover:text-white transition-colors">
                Incentives
              </Link>
              <Link href="/roles" className="hover:text-white transition-colors">
                Roles
              </Link>
              <Link href="/payouts" className="hover:text-white transition-colors">
                Payouts
              </Link>
              <Link href="/growth" className="hover:text-white transition-colors">
                Growth
              </Link>
              <Link href="/social" className="hover:text-white transition-colors">
                Social
              </Link>
              <Link href="/manifesto" className="hover:text-white transition-colors">
                Manifesto
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Title */}
        <section className="mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Forum</p>
          <h1 className="text-3xl font-medium mb-2">Community Chat</h1>
          <p className="text-gray-400">
            Connect your wallet to join the conversation. Your $FED balance determines your tier badge.
          </p>
        </section>

        {/* Chat Forum */}
        <ChatForum />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Messages are stored for 30 days. Your token balance is captured at the time of posting.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/snark-tank/ralph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="View on GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://x.com/fed_USD1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                title="Follow @fed_USD1 on X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
