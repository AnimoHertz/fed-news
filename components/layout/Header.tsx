import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logoseal.png" alt="FED logo" width={80} height={80} />
            <span className="text-xl font-medium">Fed News</span>
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
            <Link href="/holders" className="hover:text-white transition-colors">
              Holders
            </Link>
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
            <Link href="/forum" className="hover:text-white transition-colors">
              Forum
            </Link>
            <Link href="/social" className="hover:text-white transition-colors">
              Social
            </Link>
            <Link href="/manifesto" className="hover:text-white transition-colors">
              Manifesto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
