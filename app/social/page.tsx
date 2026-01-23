import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Social | Fed News',
  description: 'Follow $FED on social media and join the community.',
};

const featuredAccounts = [
  {
    handle: 'fed_USD1',
    name: '$FED Official',
    description: 'Official $FED account - updates, announcements, and distribution alerts',
    followers: null,
    verified: true,
  },
];

const communityLinks = [
  {
    name: 'X (Twitter)',
    description: 'Follow for updates and join the conversation',
    url: 'https://x.com/fed_USD1',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    description: 'Watch the AI build in real-time',
    url: 'https://github.com/snark-tank/ralph',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'DexScreener',
    description: 'Live price charts and trading data',
    url: 'https://dexscreener.com/solana/132STreShuLRNgkyF1QECv37yP9Cdp8JBAgnKBgKafed',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

export default function SocialPage() {
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
              <Link href="/payouts" className="hover:text-white transition-colors">
                Payouts
              </Link>
              <Link href="/roles" className="hover:text-white transition-colors">
                Roles
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
        <section className="mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Social</p>
          <h1 className="text-3xl font-medium mb-2">Join the Community</h1>
          <p className="text-gray-400">
            Follow $FED on social media and stay updated on distributions, development, and community news.
          </p>
        </section>

        {/* Featured Account */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
            Official Account
          </h2>
          {featuredAccounts.map((account) => (
            <a
              key={account.handle}
              href={`https://x.com/${account.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{account.name}</span>
                    {account.verified && (
                      <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sky-400 text-sm">@{account.handle}</p>
                  <p className="text-gray-400 text-sm mt-2">{account.description}</p>
                </div>
                <span className="text-gray-500">→</span>
              </div>
            </a>
          ))}
        </section>

        {/* Search on X */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
            See What People Are Saying
          </h2>
          <a
            href="https://x.com/search?q=%24FED%20solana&src=typed_query&f=live"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/70 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white mb-1">Search $FED on X</h3>
                <p className="text-sm text-gray-500">
                  View the latest posts and discussions about $FED
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </a>
        </section>

        {/* Community Links */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
            Links
          </h2>
          <div className="space-y-3">
            {communityLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/70 hover:border-gray-700 transition-all"
              >
                <div className="text-gray-400">{link.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{link.name}</h3>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
                <span className="text-gray-500">→</span>
              </a>
            ))}
          </div>
        </section>

        {/* Hashtags */}
        <section className="border-t border-gray-800 pt-8">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
            Hashtags
          </h2>
          <div className="flex flex-wrap gap-2">
            {['$FED', '#FED', '#FEDUSD1', '#SolanaAI'].map((tag) => (
              <a
                key={tag}
                href={`https://x.com/search?q=${encodeURIComponent(tag)}&src=typed_query&f=live`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm font-mono text-gray-400 bg-gray-800/50 rounded hover:bg-gray-800 hover:text-white transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
