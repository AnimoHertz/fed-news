'use client';

import { useEffect, useState } from 'react';

interface FloatingCoin {
  id: number;
  x: number;
  delay: number;
  duration: number;
}

export function MoneyPrinterAnimation() {
  const [coins, setCoins] = useState<FloatingCoin[]>([]);

  useEffect(() => {
    // Generate floating coins
    const newCoins: FloatingCoin[] = [];
    for (let i = 0; i < 8; i++) {
      newCoins.push({
        id: i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      });
    }
    setCoins(newCoins);
  }, []);

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Floating coins */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute text-2xl animate-float-up opacity-0"
          style={{
            left: `${coin.x}%`,
            bottom: '-20px',
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
          }}
        >
          💵
        </div>
      ))}

      {/* Main printer icon */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Printer body */}
        <div className="relative">
          {/* Top part with glow */}
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gray-800 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-lg shadow-emerald-500/20">
              {/* Screen */}
              <div className="bg-black rounded-lg p-3 mb-3 border border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-mono text-xs">PRINTING USD1...</span>
                </div>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-scan" />
                </div>
              </div>

              {/* Dollar bills coming out */}
              <div className="flex justify-center gap-1">
                <div className="w-12 h-6 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded animate-print-1 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  $1
                </div>
                <div className="w-12 h-6 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded animate-print-2 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  $1
                </div>
                <div className="w-12 h-6 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded animate-print-3 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  $1
                </div>
              </div>
            </div>
          </div>

          {/* Sparkles */}
          <div className="absolute -top-2 -left-2 text-yellow-400 animate-sparkle">✦</div>
          <div className="absolute -top-1 -right-3 text-yellow-400 animate-sparkle-delayed">✦</div>
          <div className="absolute -bottom-1 -left-3 text-emerald-400 animate-sparkle">✦</div>
          <div className="absolute -bottom-2 -right-2 text-emerald-400 animate-sparkle-delayed">✦</div>
        </div>

        {/* Label */}
        <div className="mt-4 text-center">
          <span className="text-emerald-400 font-mono text-sm animate-pulse">
            24/7 Automated Rewards
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) rotate(20deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 4s ease-out infinite;
        }

        @keyframes scan {
          0% {
            width: 0%;
          }
          50% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }

        @keyframes print-1 {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(10px);
            opacity: 0.7;
          }
        }
        .animate-print-1 {
          animation: print-1 1.5s ease-in-out infinite;
        }

        @keyframes print-2 {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(10px);
            opacity: 0.7;
          }
        }
        .animate-print-2 {
          animation: print-2 1.5s ease-in-out infinite 0.2s;
        }

        @keyframes print-3 {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(10px);
            opacity: 0.7;
          }
        }
        .animate-print-3 {
          animation: print-3 1.5s ease-in-out infinite 0.4s;
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.5;
          }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-sparkle-delayed {
          animation: sparkle 2s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  );
}
