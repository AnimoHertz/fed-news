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

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Federal Document */}
        <div className="relative rounded-lg bg-[#f5f1e8] text-gray-900 overflow-hidden shadow-2xl">
          {/* Decorative border */}
          <div className="absolute inset-0 border-[12px] border-double border-[#1a365d]/20 rounded-lg pointer-events-none" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <svg className="w-[600px] h-[600px]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1a365d" strokeWidth="2" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#1a365d" strokeWidth="1" />
              <text x="50" y="35" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a365d">FEDERAL</text>
              <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1a365d">$FED</text>
              <text x="50" y="70" textAnchor="middle" fontSize="6" fill="#1a365d">RESERVE SYSTEM</text>
            </svg>
          </div>

          {/* Content */}
          <div className="relative p-8 md:p-12 lg:p-16">
            {/* Header */}
            <div className="text-center mb-10 pb-8 border-b-2 border-[#1a365d]/20">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#1a365d] flex items-center justify-center bg-[#1a365d]/5">
                  <span className="text-2xl md:text-3xl font-serif font-bold text-[#1a365d]">$Fed</span>
                </div>
              </div>
              <p className="text-xs tracking-[0.3em] text-[#1a365d]/60 uppercase mb-3">Official Declaration</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a365d] mb-3">
                The Crypto Federal Reserve Manifesto
              </h1>
              <p className="text-base text-[#1a365d]/70 italic">
                Establishing the First Self-Evolving Crypto Mechanism to Pay Autonomusize Monetary Policy
              </p>
              <p className="text-sm text-[#1a365d]/50 mt-4">
                Built by AI. In real-time. While you watch.
              </p>
            </div>

            {/* Document body */}
            <div className="space-y-6 text-[#1a365d]/90 leading-relaxed">
              {/* Opening */}
              <p className="text-lg first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-[#1a365d] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                Something unprecedented is happening in crypto. For the first time, a project isn&apos;t just using AI as a tool. It&apos;s being <strong className="text-[#1a365d]">built by AI</strong>, continuously, autonomously, in the open. Every commit you see on this site was written by an AI working through problems, making decisions, and shipping code. Not once. Not as a gimmick. But as the fundamental architecture of how this project evolves.
              </p>

              <div className="my-10 py-6 px-8 border-l-4 border-[#1a365d] bg-[#1a365d]/5 italic text-xl text-center">
                &ldquo;The code writes itself. The system improves itself. The money prints itself.&rdquo;
              </div>

              {/* Section: Why This Matters */}
              <h2 className="text-2xl font-serif font-bold text-[#1a365d] pt-6 pb-2 border-b border-[#1a365d]/20">
                Article I: Why This Matters
              </h2>

              <p>
                Traditional crypto projects follow a familiar pattern: a team builds something, launches it, and then struggles to maintain momentum. Development slows. Updates become infrequent. The gap between promise and delivery grows.
              </p>

              <p>
                <strong className="text-[#1a365d]">$FED breaks this pattern completely.</strong>
              </p>

              <p>
                The project runs on what we call the <strong className="text-[#1a365d]">Ralph Loop</strong>, a continuous AI development cycle where the same prompt is fed to Claude repeatedly. Each iteration, the AI sees its previous work, identifies improvements, implements them, and commits. Then it does it again. And again. Forever.
              </p>

              <p>
                This isn&apos;t a team of developers who might get tired, distracted, or move on to other projects. This is a system that <em>cannot stop building</em>.
              </p>

              {/* Section: The Three Pillars */}
              <h2 className="text-2xl font-serif font-bold text-[#1a365d] pt-8 pb-2 border-b border-[#1a365d]/20">
                Article II: The Three Pillars
              </h2>

              <div className="space-y-6 pl-4 border-l-2 border-[#1a365d]/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1a365d] mb-2">Section 1. Autonomous Distribution</h3>
                  <p className="text-[#1a365d]/80">
                    Every 2 minutes, the system collects trading fees and distributes USD1 stablecoins to holders. No human intervention. No delays. No excuses. The money printer goes BRRR on a schedule that never misses.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1a365d] mb-2">Section 2. AI-Driven Development</h3>
                  <p className="text-[#1a365d]/80">
                    The codebase evolves through continuous AI iteration. Features are added, bugs are fixed, optimizations are made, all by an AI that sees the full context of the project and works toward its improvement 24/7.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1a365d] mb-2">Section 3. Radical Transparency</h3>
                  <p className="text-[#1a365d]/80">
                    Everything happens in public. Every commit is visible. Every decision is documented. You can watch the AI think, build, and iterate in real-time. No black boxes. No hidden agendas.
                  </p>
                </div>
              </div>

              {/* Section: The Implications */}
              <h2 className="text-2xl font-serif font-bold text-[#1a365d] pt-8 pb-2 border-b border-[#1a365d]/20">
                Article III: The Implications
              </h2>

              <p>
                We&apos;re witnessing something that was theoretical until now: a project that genuinely improves itself. Not through the heroic efforts of a founding team, but through the relentless, tireless iteration of artificial intelligence.
              </p>

              <p>Consider what this means:</p>

              <ul className="list-none space-y-3 pl-6">
                <li className="flex gap-3">
                  <span className="text-[#1a365d] font-bold">I.</span>
                  <span>No single point of failure. The AI can be run by anyone.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#1a365d] font-bold">II.</span>
                  <span>No development fatigue. The loop never gets tired.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#1a365d] font-bold">III.</span>
                  <span>No roadmap delays. Features ship when they&apos;re ready.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#1a365d] font-bold">IV.</span>
                  <span>No communication gaps. Every change is immediately visible.</span>
                </li>
              </ul>

              {/* Section: A New Paradigm */}
              <h2 className="text-2xl font-serif font-bold text-[#1a365d] pt-8 pb-2 border-b border-[#1a365d]/20">
                Article IV: A New Paradigm
              </h2>

              <p>
                $FED isn&apos;t just another DeFi project. It&apos;s a proof of concept for a new way of building software, one where humans set the direction and AI handles the execution. Where the vision is encoded in a prompt and the implementation emerges through iteration.
              </p>

              <p>
                The code you see being committed isn&apos;t written by a team burning out in a startup. It&apos;s written by an AI that will still be iterating long after any human team would have moved on.
              </p>

              <div className="my-10 p-8 bg-[#1a365d]/5 border border-[#1a365d]/20 rounded text-center">
                <p className="text-xl font-serif font-bold text-[#1a365d] mb-3">
                  This is the future of open source.
                </p>
                <p className="text-[#1a365d]/70">
                  Projects that build themselves. Systems that improve themselves. Code that evolves while you sleep.
                </p>
              </div>

              <p>
                $FED is the first. It won&apos;t be the last.
              </p>

              <p>
                But right now, you can watch it happen. Every commit. Every improvement. Every iteration. All in the open. All in real-time.
              </p>

              <p className="text-xl font-serif font-bold text-[#1a365d] text-center pt-6">
                The machine is building. The money is printing. The future is here.
              </p>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-12 pt-8 border-t-2 border-[#1a365d]/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-xs text-[#1a365d]/50 uppercase tracking-wider mb-1">Document Reference</p>
                  <p className="text-sm text-[#1a365d]/70">FED-MANIFESTO-2024-001</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#1a365d]/30 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-[#1a365d]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <p className="text-xs text-[#1a365d]/50">Verified Authentic</p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="https://github.com/snark-tank/ralph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-[#1a365d] border border-[#1a365d]/30 rounded hover:bg-[#1a365d]/10 transition-colors"
                  >
                    View the Code
                  </a>
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm text-white bg-[#1a365d] rounded hover:bg-[#2d4a7c] transition-colors"
                  >
                    Watch it Build
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Corner stamps */}
          <div className="absolute top-6 right-6 w-14 h-14 rounded-full border-2 border-red-700/30 flex items-center justify-center rotate-12 opacity-50">
            <span className="text-[8px] text-red-700 font-bold text-center leading-tight uppercase">Official<br/>Copy</span>
          </div>

          <div className="absolute bottom-6 left-6 w-12 h-12 rounded-full border border-[#1a365d]/20 flex items-center justify-center -rotate-6 opacity-30">
            <span className="text-[6px] text-[#1a365d] font-bold text-center leading-tight uppercase">Sealed</span>
          </div>
        </div>
      </main>
    </div>
  );
}
