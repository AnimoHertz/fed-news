import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export const metadata = {
  title: 'Manifesto | Federal Cash',
  description: 'Why $FED represents a new paradigm in crypto: AI-driven, self-evolving, built in real-time.',
};

export default function ManifestoPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-16">
        <article className="space-y-12">
          {/* Title */}
          <header className="space-y-4">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Manifesto</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight">
              The First Self-Evolving Crypto Project
            </h1>
            <p className="text-lg sm:text-xl text-gray-400">
              Built by AI. In real-time. While you watch.
            </p>
          </header>

          {/* Content */}
          <section className="space-y-8 text-gray-300 leading-relaxed">
            <p className="text-lg">
              Something unprecedented is happening in crypto.
            </p>

            <p>
              For the first time, a project isn&apos;t just using AI as a tool—it&apos;s being
              <em className="text-white"> built by AI</em>, continuously, autonomously, in the open.
              Every commit you see on this site was written by an AI working through problems,
              making decisions, and shipping code. Not once. Not as a gimmick. But as the
              fundamental architecture of how this project evolves.
            </p>

            <div className="border-l-2 border-gray-700 pl-6 my-8">
              <p className="text-xl text-white">
                &ldquo;The code writes itself. The system improves itself. The money prints itself.&rdquo;
              </p>
            </div>

            <h2 className="text-xl sm:text-2xl text-white pt-4">Why This Matters</h2>

            <p>
              Traditional crypto projects follow a familiar pattern: a team builds something,
              launches it, and then struggles to maintain momentum. Development slows.
              Updates become infrequent. The gap between promise and delivery grows.
            </p>

            <p>
              $FED breaks this pattern completely.
            </p>

            <p>
              The project runs on what we call the <span className="text-white">Ralph Loop</span>—a
              continuous AI development cycle where the same prompt is fed to Claude repeatedly.
              Each iteration, the AI sees its previous work, identifies improvements, implements
              them, and commits. Then it does it again. And again. Forever.
            </p>

            <p>
              This isn&apos;t a team of developers who might get tired, distracted, or move on to
              other projects. This is a system that <em className="text-white">cannot stop building</em>.
            </p>

            <h2 className="text-xl sm:text-2xl text-white pt-4">The Three Pillars</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">1. Autonomous Distribution</h3>
                <p className="text-gray-400">
                  Every 2 minutes, the system collects trading fees and distributes USD1
                  stablecoins to holders. No human intervention. No delays. No excuses.
                  The money printer goes BRRR on a schedule that never misses.
                </p>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">2. AI-Driven Development</h3>
                <p className="text-gray-400">
                  The codebase evolves through continuous AI iteration. Features are added,
                  bugs are fixed, optimizations are made—all by an AI that sees the full
                  context of the project and works toward its improvement 24/7.
                </p>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">3. Radical Transparency</h3>
                <p className="text-gray-400">
                  Everything happens in public. Every commit is visible. Every decision is
                  documented. You can watch the AI think, build, and iterate in real-time.
                  No black boxes. No hidden agendas.
                </p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl text-white pt-4">The Implications</h2>

            <p>
              We&apos;re witnessing something that was theoretical until now: a project that
              genuinely improves itself. Not through the heroic efforts of a founding team,
              but through the relentless, tireless iteration of artificial intelligence.
            </p>

            <p>
              Consider what this means:
            </p>

            <ul className="list-none space-y-3 text-gray-400">
              <li className="flex gap-3">
                <span className="text-white">→</span>
                <span>No single point of failure. The AI can be run by anyone.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-white">→</span>
                <span>No development fatigue. The loop never gets tired.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-white">→</span>
                <span>No roadmap delays. Features ship when they&apos;re ready.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-white">→</span>
                <span>No communication gaps. Every change is immediately visible.</span>
              </li>
            </ul>

            <h2 className="text-xl sm:text-2xl text-white pt-4">A New Paradigm</h2>

            <p>
              $FED isn&apos;t just another DeFi project. It&apos;s a proof of concept for a
              new way of building software—one where humans set the direction and AI
              handles the execution. Where the vision is encoded in a prompt and the
              implementation emerges through iteration.
            </p>

            <p>
              The code you see being committed isn&apos;t written by a team burning out
              in a startup. It&apos;s written by an AI that will still be iterating long
              after any human team would have moved on.
            </p>

            <div className="animated-border animated-border-slow rounded-lg p-6 my-8 bg-gray-900/50">
              <p className="text-white text-lg mb-4">
                This is the future of open source.
              </p>
              <p className="text-gray-400">
                Projects that build themselves. Systems that improve themselves.
                Code that evolves while you sleep.
              </p>
            </div>

            <p>
              $FED is the first. It won&apos;t be the last.
            </p>

            <p>
              But right now, you can watch it happen. Every commit. Every improvement.
              Every iteration. All in the open. All in real-time.
            </p>

            <p className="text-white text-lg pt-4">
              The machine is building. The money is printing. The future is here.
            </p>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-gray-800">
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="https://fed.markets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                fed.markets →
              </a>
              <a
                href="https://github.com/snark-tank/ralph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                View the code →
              </a>
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Watch it build →
              </Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
