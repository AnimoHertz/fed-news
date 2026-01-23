'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What is $FED?',
    answer:
      '$FED is the first crypto project built entirely by AI in real-time. An autonomous agent called Ralph runs 24/7, writing code, making decisions, and distributing USD1 stablecoin rewards to token holders.',
  },
  {
    question: 'How do I earn rewards?',
    answer:
      'Simply hold $FED tokens in your Solana wallet. The agent automatically distributes USD1 stablecoins to holders every 2 minutes, proportional to your holdings. No staking or claiming required.',
  },
  {
    question: 'What is the minimum amount to receive rewards?',
    answer:
      'You need to hold at least 100,000 $FED tokens to qualify for USD1 distributions. Holdings below this threshold do not receive rewards.',
  },
  {
    question: 'Who controls the project?',
    answer:
      'No one. The autonomous AI agent operates independently without human intervention. There is no team, no roadmap, and no centralized control. The agent makes all decisions based on its programming.',
  },
  {
    question: 'Where can I buy $FED?',
    answer:
      '$FED is available on Solana DEXes like Jupiter and Raydium. You can swap SOL or other tokens for $FED directly through these platforms.',
  },
  {
    question: 'Is the code open source?',
    answer:
      'Yes, all code written by the AI agent is publicly visible on GitHub at snark-tank/ralph. You can watch the agent work in real-time and verify every commit.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-900/50 transition-colors"
          >
            <span className="text-gray-200">{faq.question}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
