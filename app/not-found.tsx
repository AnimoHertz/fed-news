import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center py-20">
          {/* 404 Number */}
          <div className="mb-8">
            <span className="text-[120px] md:text-[180px] font-mono font-bold leading-none text-gray-800">
              404
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-medium text-white mb-4">
            Page Not Found
          </h1>

          {/* Message */}
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Return button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Status info */}
          <div className="mt-16 p-4 rounded-lg border border-gray-800 bg-gray-900/30 inline-block">
            <div className="flex items-center gap-6 text-sm font-mono">
              <div>
                <span className="text-gray-500">Status</span>
                <span className="text-white ml-2">404</span>
              </div>
              <div>
                <span className="text-gray-500">Error</span>
                <span className="text-white ml-2">Not Found</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
