import Image from 'next/image';
import Link from 'next/link';
import { fetchDocsList } from '@/lib/github';

export const revalidate = 300;

export default async function DocsPage() {
  const docs = await fetchDocsList();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="FED logo" width={40} height={40} className="rounded-full" />
              <span className="text-xl font-medium">Fed News</span>
            </Link>
            <div className="flex gap-4 text-sm text-gray-400">
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-sm text-gray-500 uppercase tracking-wide mb-8">
          Documentation
        </h1>

        <div className="space-y-0">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block py-4 border-b border-gray-800/50 hover:bg-gray-900/50 -mx-4 px-4 transition-colors"
            >
              <p className="text-gray-200">{doc.title}</p>
              <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <a
            href="https://github.com/snark-tank/ralph/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            View on GitHub →
          </a>
        </div>
      </main>
    </div>
  );
}
