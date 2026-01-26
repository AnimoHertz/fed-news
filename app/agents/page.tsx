"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShapeCharacter, CharacterProps } from "@/components/characters/ShapeCharacter";
import { generateRandomCharacter, calculateRarityScore, getRarityTier, TOTAL_COMBINATIONS, TRAIT_RARITY } from "@/components/characters/CharacterGallery";
import { Header } from "@/components/layout/Header";
import { BackgroundAnimation } from "@/components/home/BackgroundAnimation";
import { MintButton } from "@/components/characters/MintButton";
import { MintedAgent } from "@/app/api/agents/gallery/route";

const TIER_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  chairman: { border: "border-yellow-500/50", glow: "shadow-yellow-500/20", text: "text-yellow-400", bg: "bg-yellow-500/10" },
  governor: { border: "border-purple-500/50", glow: "shadow-purple-500/20", text: "text-purple-400", bg: "bg-purple-500/10" },
  director: { border: "border-blue-500/50", glow: "shadow-blue-500/20", text: "text-blue-400", bg: "bg-blue-500/10" },
  member: { border: "border-emerald-500/50", glow: "shadow-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  citizen: { border: "border-gray-500/50", glow: "shadow-gray-500/20", text: "text-gray-400", bg: "bg-gray-500/10" },
  special: { border: "border-red-500/50", glow: "shadow-red-500/20", text: "text-red-400", bg: "bg-red-500/10" },
  shadow: { border: "border-emerald-500/50", glow: "shadow-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
};

// Preview characters - abstract compositions
const PREVIEW_CHARACTERS: (CharacterProps & { tier: string })[] = [
  { headStyle: "circle", eyeStyle: "dots", mouthStyle: "wave", bodyStyle: "blob", feetStyle: "orbs", accessory: "halo", bgStyle: "gradient", primaryColor: "#dc2626", tier: "special" },
  { headStyle: "hexagon", eyeStyle: "rings", mouthStyle: "zigzag", bodyStyle: "layered", feetStyle: "triangles", accessory: "aura", bgStyle: "circuit", primaryColor: "#a855f7", tier: "governor" },
  { headStyle: "square", eyeStyle: "lines", mouthStyle: "straight", bodyStyle: "geometric", feetStyle: "bars", accessory: "frame", bgStyle: "grid", primaryColor: "#3b82f6", tier: "director" },
  { headStyle: "triangle", eyeStyle: "slits", mouthStyle: "none", bodyStyle: "fragmented", feetStyle: "none", accessory: "glitch", bgStyle: "stars", primaryColor: "#10b981", accentColor: "#10b981", tier: "shadow" },
  { headStyle: "diamond", eyeStyle: "arcs", mouthStyle: "curve", bodyStyle: "minimal", feetStyle: "floating", bgStyle: "radial", primaryColor: "#fbbf24", tier: "chairman" },
  { headStyle: "ring", eyeStyle: "crosses", mouthStyle: "dashes", bodyStyle: "layered", feetStyle: "floating", accessory: "orbits", bgStyle: "dots", primaryColor: "#f97316", tier: "special" },
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

// Minted Agents Gallery Component
function MintedAgentsGallery() {
  const [agents, setAgents] = useState<MintedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await fetch('/api/agents/gallery?limit=12&sort=newest');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading minted agents...
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No agents minted yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Minted Agents</h3>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {agents.map((agent) => {
          const tierStyle = TIER_COLORS[agent.traits.tier] || TIER_COLORS.citizen;
          return (
            <div
              key={agent.id}
              className={`relative rounded-xl bg-gray-900/80 border ${tierStyle.border} overflow-hidden group hover:scale-105 transition-transform`}
            >
              <ShapeCharacter
                headStyle={agent.traits.headStyle as CharacterProps["headStyle"]}
                eyeStyle={agent.traits.eyeStyle as CharacterProps["eyeStyle"]}
                mouthStyle={agent.traits.mouthStyle as CharacterProps["mouthStyle"]}
                bodyStyle={agent.traits.bodyStyle as CharacterProps["bodyStyle"]}
                feetStyle={agent.traits.feetStyle as CharacterProps["feetStyle"]}
                accessory={agent.traits.accessory as CharacterProps["accessory"]}
                bgStyle={agent.traits.bgStyle as CharacterProps["bgStyle"]}
                primaryColor={agent.traits.primaryColor}
                secondaryColor={agent.traits.secondaryColor || undefined}
                accentColor={agent.traits.accentColor}
                size={120}
                className="rounded-xl"
                rarityTier={getRarityTier(agent.rarityScore).label as "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${tierStyle.text} capitalize`}>
                    {agent.traits.tier}
                  </span>
                  <span className={`text-xs ${getRarityTier(agent.rarityScore).color}`}>
                    {agent.rarityScore}
                  </span>
                </div>
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={`https://solscan.io/token/${agent.nftMintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 bg-gray-900/80 rounded text-gray-400 hover:text-white"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
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
  const [mintedHash, setMintedHash] = useState<string | null>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // Function to export SVG as PNG data URL for minting
  const getImageDataUrl = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!svgRef.current) {
        reject(new Error('SVG ref not available'));
        return;
      }

      const svg = svgRef.current.querySelector("svg");
      if (!svg) {
        reject(new Error('SVG element not found'));
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

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
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG as image'));
      };
      img.src = url;
    });
  }, []);

  const handleMintSuccess = useCallback((result: { traitHash: string; nftMint: string }) => {
    setMintedHash(result.traitHash);
  }, []);

  const generateCharacterHandler = () => {
    setIsGenerating(true);
    setShowCelebration(false);
    setMintedHash(null); // Reset minted status for new character
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
                      <ShapeCharacter {...character} size={200} className="rounded-xl" rarityTier={rarityTierInfo?.label as "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"} />
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-gray-800 border border-gray-700 rounded-full">
                        <span className="text-xs text-gray-400 font-mono">#{String(generationCount).padStart(4, "0")}</span>
                      </div>
                      {mintedHash && (
                        <div className="absolute -top-2 -left-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
                          <span className="text-xs text-emerald-400">NFT</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-3">
                      {/* Tier Badge */}
                      <div className={`inline-block px-4 py-1.5 rounded-full bg-gray-800 border ${tier?.border}`}>
                        <span className={`font-semibold ${tier?.text}`}>
                          {character.tier.charAt(0).toUpperCase() + character.tier.slice(1)} Agent
                        </span>
                      </div>

                      {/* Rarity Score */}
                      {rarityScore !== null && rarityTierInfo && (
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">Rarity:</span>
                            <span className={`font-bold text-lg ${rarityTierInfo.color}`}>
                              {rarityScore}
                            </span>
                            <span className="text-gray-600 text-sm">/1000</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rarityTierInfo.label === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                            rarityTierInfo.label === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
                            rarityTierInfo.label === 'Rare' ? 'bg-blue-500/20 text-blue-400' :
                            rarityTierInfo.label === 'Uncommon' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {rarityTierInfo.label}
                          </span>
                        </div>
                      )}

                      {/* Trait Tags */}
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
                        {character.secondaryColor && (
                          <span className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-400 border border-gray-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: character.secondaryColor }} />
                            dual
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
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isGenerating
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : character
                        ? "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                        : "bg-red-500 hover:bg-red-400 text-white"
                    }`}
                  >
                    {isGenerating ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {isGenerating ? "Deploying..." : character ? "Deploy Another" : "Deploy Agent"}
                  </button>
                  {character && !isGenerating && (
                    <button
                      onClick={downloadCharacter}
                      className="px-4 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-400 text-white transition-all"
                      title="Download PNG"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Mint as NFT Section */}
              {character && !isGenerating && rarityScore !== null && rarityTierInfo && !mintedHash && (
                <div className="p-4 border-t border-gray-800">
                  <MintButton
                    character={character}
                    rarityScore={rarityScore}
                    rarityTier={rarityTierInfo.label}
                    getImageDataUrl={getImageDataUrl}
                    onMintSuccess={handleMintSuccess}
                  />
                </div>
              )}

              {/* Lore Section */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Classified: Origin File</span>
                </div>
                <div className="text-xs text-gray-400 space-y-2 leading-relaxed">
                  <p>
                    <span className="text-gray-500 font-mono">[REDACTED]</span> In the shadow markets where digital currencies flow like blood through veins, they emerged—not born, but <span className="text-white">forged</span>.
                  </p>
                  <p>
                    The Federal Agents are autonomous constructs, each one a unique cipher generated from the quantum noise of blockchain transactions. No two share the same pattern. No two serve the same purpose.
                  </p>
                  <p className="text-gray-500 italic">
                    They watch. They calculate. They wait.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Traits */}
          <section className="lg:col-span-3 space-y-3">
            {/* Unique Agents Count */}
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

            <TraitSection title="Clearance Levels">
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
            </TraitSection>

            {/* Collapsible Trait Tables */}
            <TraitSection title="Primary Shapes">
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

            <TraitSection title="Accent Patterns">
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

            <TraitSection title="Connections">
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

            <TraitSection title="Secondary Forms">
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

            <TraitSection title="Base & Effects">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase mb-2">Base Elements</p>
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
                  <p className="text-xs text-gray-500 uppercase mb-2">Effects</p>
                  {TRAIT_RARITY.accessories.map((a) => {
                    const percent = ((a.weight / accTotal) * 100).toFixed(1);
                    const rarity = getRarityLabel(a.weight, accTotal);
                    return (
                      <div key={a.accessory} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 capitalize">{a.accessory === "none" ? "clean" : a.accessory}</span>
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

        {/* Minted Agents Gallery */}
        <section className="mb-12 rounded-2xl bg-gray-900/60 border border-gray-800 p-6">
          <MintedAgentsGallery />
        </section>

        {/* Pricing Info */}
        <section className="mb-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Minting Prices
          </h3>
          <div className="grid sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Common</div>
              <div className="text-white font-bold">5K $FED</div>
              <div className="text-gray-600 text-xs">1x base</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-emerald-400 text-xs mb-1">Uncommon</div>
              <div className="text-white font-bold">7.5K $FED</div>
              <div className="text-gray-600 text-xs">1.5x base</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-blue-400 text-xs mb-1">Rare</div>
              <div className="text-white font-bold">10K $FED</div>
              <div className="text-gray-600 text-xs">2x base</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="text-purple-400 text-xs mb-1">Epic</div>
              <div className="text-white font-bold">15K $FED</div>
              <div className="text-gray-600 text-xs">3x base</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="text-yellow-400 text-xs mb-1">Legendary</div>
              <div className="text-white font-bold">25K $FED</div>
              <div className="text-gray-600 text-xs">5x base</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            All minting fees go to the treasury for LP addition. Each unique trait combination can only be minted once.
          </p>
        </section>

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
