'use client';

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-400/5 rounded-full blur-3xl animate-float-fast" />

      {/* Subtle rising particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/20 rounded-full animate-rise"
            style={{
              left: `${5 + (i * 4.5)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-radial-fade" />
    </div>
  );
}
