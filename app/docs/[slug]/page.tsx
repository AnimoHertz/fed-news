import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchDocsList, fetchDocContent } from '@/lib/github';

export const revalidate = 300;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const docs = await fetchDocsList();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const docs = await fetchDocsList();
  const doc = docs.find((d) => d.slug === slug);

  return {
    title: doc ? `${doc.title} | Fed News` : 'Not Found',
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const docs = await fetchDocsList();
  const doc = docs.find((d) => d.slug === slug);

  if (!doc) {
    notFound();
  }

  const content = await fetchDocContent(doc.name);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-medium hover:text-gray-300 transition-colors">
              Fed News
            </Link>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/docs" className="hover:text-white transition-colors">
                Docs
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/docs"
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-medium mt-6 mb-8">{doc.title}</h1>

        <article className="prose prose-invert prose-gray max-w-none prose-headings:font-medium prose-headings:text-white prose-a:text-gray-300 prose-a:no-underline hover:prose-a:text-white prose-code:text-gray-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
