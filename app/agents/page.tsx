"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ShapeCharacter, CharacterProps } from "@/components/characters/ShapeCharacter";
import { generateRandomCharacter, calculateRarityScore, getRarityTier, TOTAL_COMBINATIONS, TRAIT_RARITY } from "@/components/characters/CharacterGallery";
import { Header } from "@/components/layout/Header";
import { BackgroundAnimation } from "@/components/home/BackgroundAnimation";

const TIER_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  chairman: { border: "border-yellow-500/50", glow: "shadow-yellow-500/20", text: "text-yellow-400", bg: "bg-yellow-500/10" },
  governor: { border: "border-purple-500/50", glow: "shadow-purple-500/20", text: "text-purple-400", bg: "bg-purple-500/10" },
  director: { border: "border-blue-500/50", glow: "shadow-blue-500/20", text: "text-blue-400", bg: "bg-blue-500/10" },
  member: { border: "border-emerald-500/50", glow: "shadow-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  citizen: { border: "border-gray-500/50", glow: "shadow-gray-500/20", text: "text-gray-400", bg: "bg-gray-500/10" },
  special: { border: "border-red-500/50", glow: "shadow-red-500/20", text: "text-red-400", bg: "bg-red-500/10" },
  shadow: { border: "border-emerald-500/50", glow: "shadow-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
};

// Preview characters with faces
const PREVIEW_CHARACTERS: (CharacterProps & { tier: string })[] = [
  { headStyle: "round", eyeStyle: "round", mouthStyle: "smile", bodyStyle: "round", feetStyle: "pill", accessory: "badge", bgStyle: "gradient", primaryColor: "#dc2626", tier: "special" },
  { headStyle: "horns", eyeStyle: "angry", mouthStyle: "teeth", bodyStyle: "wide", feetStyle: "split", accessory: "glow", bgStyle: "circuit", primaryColor: "#a855f7", tier: "governor" },
  { headStyle: "square", eyeStyle: "wide", mouthStyle: "neutral", bodyStyle: "square", feetStyle: "square", accessory: "glasses", bgStyle: "grid", primaryColor: "#3b82f6", tier: "director" },
  { headStyle: "pointed", eyeStyle: "slit", mouthStyle: "frown", bodyStyle: "split", feetStyle: "none", accessory: "glow", bgStyle: "stars", primaryColor: "#10b981", accentColor: "#10b981", tier: "shadow" },
  { headStyle: "split", eyeStyle: "half", mouthStyle: "smirk", bodyStyle: "tall", feetStyle: "pill", bgStyle: "radial", primaryColor: "#fbbf24", tier: "chairman" },
  { headStyle: "flat", eyeStyle: "wink", mouthStyle: "open", bodyStyle: "wide", feetStyle: "pill", accessory: "hat", bgStyle: "dots", primaryColor: "#f97316", tier: "special" },
];

function getRarityLabel(weight: number, total: number): { label: string; color: string } {
  const percent = (weight / total) * 100;
  if (percent <= 3) return { label: "Legendary", color: "text-yellow-400" };
  if (percent <= 6) return { label: "Epic", color: "text-purple-400" };
  if (percent <= 12) return { label: "Rare", color: "text-blue-400" };
  if (percent <= 20) return { label: "Uncommon", color: "text-emerald-400" };
  return { label: "Common", color: "text-gray-400" };
}

// Animated preview
function AnimatedPreview() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PREVIEW_CHARACTERS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const currentChar = PREVIEW_CHARACTERS[currentIndex];
  const tierStyle = TIER_COLORS[currentChar.tier] || TIER_COLORS.citizen;

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl">
        {PREVIEW_CHARACTERS.map((char, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ${
              index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-90 absolute inset-0"
            }`}
          >
            <ShapeCharacter {...char} size={180} className="rounded-xl" />
          </div>
        ))}
      </div>
      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-900 border ${tierStyle.border} text-xs ${tierStyle.text} font-medium whitespace-nowrap`}>
        {currentChar.tier.charAt(0).toUpperCase() + currentChar.tier.slice(1)}
      </div>
      <div className="absolute -inset-3 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-40 animate-pulse" style={{ zIndex: -1 }} />
    </div>
  );
}

// Celebration particles for rare pulls
function CelebrationEffect({ rarityTier }: { rarityTier: string }) {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (rarityTier === "Common" || rarityTier === "Uncommon") return;

    const colors = rarityTier === "Legendary"
      ? ["#fbbf24", "#f59e0b", "#fcd34d"]
      : rarityTier === "Epic"
      ? ["#a855f7", "#c084fc", "#e879f9"]
      : ["#3b82f6", "#60a5fa", "#93c5fd"];

    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timer);
  }, [rarityTier]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-rise"
          style={{
            left: `${p.x}%`,
            bottom: 0,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: "1.5s",
          }}
        />
      ))}
    </div>
  );
}

// Collapsible trait section
function TraitSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
      >
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [character, setCharacter] = useState<(CharacterProps & { tier: string }) | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [rarityScore, setRarityScore] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  const generateCharacterHandler = () => {
    setIsGenerating(true);
    setShowCelebration(false);
    setTimeout(() => {
      const newCharacter = generateRandomCharacter();
      const score = calculateRarityScore(newCharacter);
      setCharacter(newCharacter);
      setRarityScore(score);
      setGenerationCount((prev) => prev + 1);
      setIsGenerating(false);

      // Trigger celebration for rare+ pulls
      const tier = getRarityTier(score);
      if (tier.label !== "Common" && tier.label !== "Uncommon") {
        setShowCelebration(true);
      }
    }, 800);
  };

  const downloadCharacter = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 3;
    canvas.width = 150 * scale;
    canvas.height = 200 * scale;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `fed-agent-${String(generationCount).padStart(4, "0")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  const tier = character ? (TIER_COLORS[character.tier] || TIER_COLORS.citizen) : null;
  const rarityTierInfo = rarityScore !== null ? getRarityTier(rarityScore) : null;

  const headTotal = TRAIT_RARITY.heads.reduce((s, h) => s + h.weight, 0);
  const eyeTotal = TRAIT_RARITY.eyes.reduce((s, e) => s + e.weight, 0);
  const mouthTotal = TRAIT_RARITY.mouths.reduce((s, m) => s + m.weight, 0);
  const bodyTotal = TRAIT_RARITY.bodies.reduce((s, b) => s + b.weight, 0);
  const feetTotal = TRAIT_RARITY.feet.reduce((s, f) => s + f.weight, 0);
  const accTotal = TRAIT_RARITY.accessories.reduce((s, a) => s + a.weight, 0);
  const bgTotal = TRAIT_RARITY.backgrounds.reduce((s, b) => s + b.weight, 0);
  const paletteTotal = TRAIT_RARITY.palettes.reduce((s, p) => s + p.weight, 0);

  return (
    <div className="min-h-screen relative">
      <BackgroundAnimation />
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <section className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">Fed Agent Generator</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Deploy your unique Fed Agent. Rare combinations unlock legendary operatives.
          </p>
        </section>

        <div className="grid lg:grid-cols-5 gap-6 mb-12">
          {/* Generator */}
          <section className="lg:col-span-2">
            <div
              className={`relative rounded-2xl bg-gray-900/80 border ${
                character ? tier?.border : "border-gray-800"
              } ${character ? `shadow-lg ${tier?.glow}` : ""} transition-all duration-500 h-full`}
            >
              {showCelebration && rarityTierInfo && (
                <CelebrationEffect rarityTier={rarityTierInfo.label} />
              )}

              <div className="flex flex-col items-center justify-center p-6 min-h-[420px]">
                {!character && !isGenerating && (
                  <div className="text-center">
                    <AnimatedPreview />
                    <p className="text-gray-400 mt-6 mb-1">Your agent awaits</p>
                    <p className="text-gray-600 text-sm">{TOTAL_COMBINATIONS.toLocaleString()} unique agents</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center">
                    <div className="w-44 h-56 mx-auto mb-4 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center relative overflow-hidden">
                      <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-700" />
                        <div className="w-8 h-3 rounded bg-gray-700" />
                        <div className="w-20 h-14 rounded-xl bg-gray-700" />
                        <div className="flex gap-3">
                          <div className="w-8 h-6 rounded-full bg-gray-700" />
                          <div className="w-8 h-6 rounded-full bg-gray-700" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent animate-pulse" />
                    </div>
                    <p className="text-red-400 animate-pulse font-mono text-sm">DEPLOYING...</p>
                  </div>
                )}

                {character && !isGenerating && (
                  <div className="text-center">
                    <div className="relative inline-block" ref={svgRef}>
                      <ShapeCharacter {...character} size={200} className="rounded-xl" />
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-gray-800 border border-gray-700 rounded-full">
                        <span className="text-xs text-gray-400 font-mono">#{String(generationCount).padStart(4, "0")}</span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {/* Rarity Score Display */}
                      {rarityScore !== null && rarityTierInfo && (
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg ${
                          rarityTierInfo.label === "Legendary" ? "bg-yellow-500/10 border border-yellow-500/30" :
                          rarityTierInfo.label === "Epic" ? "bg-purple-500/10 border border-purple-500/30" :
                          rarityTierInfo.label === "Rare" ? "bg-blue-500/10 border border-blue-500/30" :
                          "bg-gray-800 border border-gray-700"
                        }`}>
                          <span className={`text-lg font-bold font-mono ${rarityTierInfo.color}`}>
                            {rarityScore}
                          </span>
                          <span className="text-gray-500 text-sm">/1000</span>
                          <span className={`text-sm font-semibold ${rarityTierInfo.color}`}>
                            {rarityTierInfo.label}
                          </span>
                        </div>
                      )}

                      <div className={`inline-block px-4 py-1.5 rounded-full bg-gray-800 border ${tier?.border}`}>
                        <span className={`font-semibold ${tier?.text}`}>
                          {character.tier.charAt(0).toUpperCase() + character.tier.slice(1)} Agent
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                          {character.headStyle}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                          {character.eyeStyle}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                          {character.mouthStyle}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                          {character.bodyStyle}
                        </span>
                        {character.feetStyle !== "none" && (
                          <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                            {character.feetStyle}
                          </span>
                        )}
                        {character.accessory !== "none" && (
                          <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                            {character.accessory}
                          </span>
                        )}
                        {character.bgStyle && character.bgStyle !== "solid" && (
                          <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700">
                            {character.bgStyle} bg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-3">
                  <button
                    onClick={generateCharacterHandler}
                    disabled={isGenerating}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      isGenerating
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : character
                        ? "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                        : "bg-red-500 hover:bg-red-400 text-white"
                    }`}
                  >
                    {isGenerating ? "Deploying..." : character ? "Deploy Another" : "Deploy Agent"}
                  </button>
                  {character && !isGenerating && (
                    <button
                      onClick={downloadCharacter}
                      className="px-4 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-400 text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Traits */}
          <section className="lg:col-span-3 space-y-3">
            {/* Clearance Levels - Always visible */}
            <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                Clearance Levels
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TRAIT_RARITY.palettes.map((p) => {
                  const percent = ((p.weight / paletteTotal) * 100).toFixed(1);
                  const rarity = getRarityLabel(p.weight, paletteTotal);
                  const style = TIER_COLORS[p.tier] || TIER_COLORS.citizen;
                  return (
                    <div key={p.tier + p.primary} className={`p-2 rounded-lg ${style.bg} border ${style.border}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium text-sm ${style.text} capitalize`}>{p.tier}</span>
                        <span className="text-xs text-gray-500">{percent}%</span>
                      </div>
                      <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rarity Guide */}
            <div className="rounded-xl bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white font-mono">{TOTAL_COMBINATIONS.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Unique Agents</p>
                </div>
                <div className="flex gap-2 text-xs flex-wrap justify-end">
                  <span className="px-2 py-1 rounded bg-gray-800 text-gray-400">0-399 Common</span>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">400+ Uncommon</span>
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">550+ Rare</span>
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">700+ Epic</span>
                  <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">850+ Legendary</span>
                </div>
              </div>
            </div>

            {/* Collapsible Trait Tables */}
            <TraitSection title="Head Styles">
              <div className="space-y-1">
                {TRAIT_RARITY.heads.map((h) => {
                  const percent = ((h.weight / headTotal) * 100).toFixed(1);
                  const rarity = getRarityLabel(h.weight, headTotal);
                  return (
                    <div key={h.style} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{h.style}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                        <span className="text-gray-600 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TraitSection>

            <TraitSection title="Eye Styles">
              <div className="space-y-1">
                {TRAIT_RARITY.eyes.map((e) => {
                  const percent = ((e.weight / eyeTotal) * 100).toFixed(1);
                  const rarity = getRarityLabel(e.weight, eyeTotal);
                  return (
                    <div key={e.style} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{e.style}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                        <span className="text-gray-600 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TraitSection>

            <TraitSection title="Mouth Expressions">
              <div className="space-y-1">
                {TRAIT_RARITY.mouths.map((m) => {
                  const percent = ((m.weight / mouthTotal) * 100).toFixed(1);
                  const rarity = getRarityLabel(m.weight, mouthTotal);
                  return (
                    <div key={m.style} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{m.style}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                        <span className="text-gray-600 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TraitSection>

            <TraitSection title="Body Types">
              <div className="space-y-1">
                {TRAIT_RARITY.bodies.map((b) => {
                  const percent = ((b.weight / bodyTotal) * 100).toFixed(1);
                  const rarity = getRarityLabel(b.weight, bodyTotal);
                  return (
                    <div key={b.style} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{b.style}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                        <span className="text-gray-600 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TraitSection>

            <TraitSection title="Backgrounds">
              <div className="space-y-1">
                {TRAIT_RARITY.backgrounds.map((b) => {
                  const percent = ((b.weight / bgTotal) * 100).toFixed(1);
                  const rarity = getRarityLabel(b.weight, bgTotal);
                  return (
                    <div key={b.style} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{b.style}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                        <span className="text-gray-600 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TraitSection>

            <TraitSection title="Feet & Accessories">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase mb-2">Feet</p>
                  {TRAIT_RARITY.feet.map((f) => {
                    const percent = ((f.weight / feetTotal) * 100).toFixed(1);
                    const rarity = getRarityLabel(f.weight, feetTotal);
                    return (
                      <div key={f.style} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 capitalize">{f.style === "none" ? "floating" : f.style}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                          <span className="text-gray-600 w-10 text-right">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase mb-2">Accessories</p>
                  {TRAIT_RARITY.accessories.map((a) => {
                    const percent = ((a.weight / accTotal) * 100).toFixed(1);
                    const rarity = getRarityLabel(a.weight, accTotal);
                    return (
                      <div key={a.accessory} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 capitalize">{a.accessory === "none" ? "standard" : a.accessory}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                          <span className="text-gray-600 w-10 text-right">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TraitSection>
          </section>
        </div>

        <section className="text-center text-sm text-gray-500">
          <p>Fed Agents · $FED on Solana</p>
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
