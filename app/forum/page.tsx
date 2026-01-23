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
              <a
                href="https://github.com/snark-tank/ralph"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
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
          <p className="text-xs text-gray-600">
            Messages are stored for 30 days. Your token balance is captured at the time of posting.
          </p>
        </div>
      </footer>
    </div>
  );
}
