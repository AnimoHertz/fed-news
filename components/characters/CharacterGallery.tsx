"use client";

import React from "react";
import { ShapeCharacter, CHARACTER_PRESETS, CharacterProps, HeadStyle, EyeStyle, MouthStyle, BodyStyle, FeetStyle, Accessory, BgStyle } from "./ShapeCharacter";

// Weighted trait pools
const HEAD_WEIGHTS: { style: HeadStyle; weight: number }[] = [
  { style: "circle", weight: 25 },
  { style: "square", weight: 20 },
  { style: "triangle", weight: 18 },
  { style: "diamond", weight: 15 },
  { style: "hexagon", weight: 12 },
  { style: "ring", weight: 10 },
];

const EYE_WEIGHTS: { style: EyeStyle; weight: number }[] = [
  { style: "dots", weight: 25 },
  { style: "lines", weight: 22 },
  { style: "arcs", weight: 18 },
  { style: "rings", weight: 15 },
  { style: "slits", weight: 10 },
  { style: "crosses", weight: 6 },
  { style: "scatter", weight: 4 },
];

const MOUTH_WEIGHTS: { style: MouthStyle; weight: number }[] = [
  { style: "wave", weight: 28 },
  { style: "straight", weight: 22 },
  { style: "curve", weight: 18 },
  { style: "zigzag", weight: 14 },
  { style: "dashes", weight: 10 },
  { style: "none", weight: 8 },
];

const BODY_WEIGHTS: { style: BodyStyle; weight: number }[] = [
  { style: "blob", weight: 28 },
  { style: "geometric", weight: 22 },
  { style: "layered", weight: 20 },
  { style: "minimal", weight: 18 },
  { style: "fragmented", weight: 12 },
];

const FEET_WEIGHTS: { style: FeetStyle; weight: number }[] = [
  { style: "orbs", weight: 30 },
  { style: "bars", weight: 22 },
  { style: "triangles", weight: 20 },
  { style: "floating", weight: 18 },
  { style: "none", weight: 10 },
];

const ACCESSORY_WEIGHTS: { accessory: Accessory; weight: number }[] = [
  { accessory: "none", weight: 35 },
  { accessory: "aura", weight: 18 },
  { accessory: "sparks", weight: 15 },
  { accessory: "halo", weight: 12 },
  { accessory: "frame", weight: 10 },
  { accessory: "orbits", weight: 6 },
  { accessory: "glitch", weight: 4 },
];

const BG_WEIGHTS: { style: BgStyle; weight: number }[] = [
  { style: "solid", weight: 30 },
  { style: "gradient", weight: 20 },
  { style: "radial", weight: 18 },
  { style: "grid", weight: 12 },
  { style: "dots", weight: 10 },
  { style: "stars", weight: 6 },
  { style: "circuit", weight: 4 },
];

const COLOR_PALETTES: { primary: string; accent: string; weight: number; tier: string }[] = [
  // Citizens (common)
  { primary: "#6b7280", accent: "#ffffff", weight: 20, tier: "citizen" },
  { primary: "#4b5563", accent: "#d1d5db", weight: 18, tier: "citizen" },
  { primary: "#78716c", accent: "#ffffff", weight: 16, tier: "citizen" },
  // Members (uncommon)
  { primary: "#10b981", accent: "#ffffff", weight: 14, tier: "member" },
  { primary: "#14b8a6", accent: "#ffffff", weight: 12, tier: "member" },
  { primary: "#22c55e", accent: "#ffffff", weight: 10, tier: "member" },
  // Directors (rare)
  { primary: "#3b82f6", accent: "#ffffff", weight: 9, tier: "director" },
  { primary: "#6366f1", accent: "#ffffff", weight: 8, tier: "director" },
  { primary: "#0ea5e9", accent: "#ffffff", weight: 7, tier: "director" },
  // Special (rare)
  { primary: "#dc2626", accent: "#ffffff", weight: 6, tier: "special" },
  { primary: "#f97316", accent: "#ffffff", weight: 5, tier: "special" },
  { primary: "#ec4899", accent: "#ffffff", weight: 4, tier: "special" },
  { primary: "#f43f5e", accent: "#ffffff", weight: 4, tier: "special" },
  // Governors (epic)
  { primary: "#a855f7", accent: "#ffffff", weight: 3, tier: "governor" },
  { primary: "#8b5cf6", accent: "#ffffff", weight: 3, tier: "governor" },
  { primary: "#d946ef", accent: "#ffffff", weight: 2, tier: "governor" },
  // Chairman (legendary)
  { primary: "#fbbf24", accent: "#ffffff", weight: 2, tier: "chairman" },
  { primary: "#f59e0b", accent: "#0a0a0a", weight: 1, tier: "chairman" },
  // Shadow (legendary)
  { primary: "#10b981", accent: "#10b981", weight: 1, tier: "shadow" },
  { primary: "#ffffff", accent: "#0a0a0a", weight: 1, tier: "shadow" },
];

// Secondary colors (for body - can be same or different from primary)
const SECONDARY_COLORS: { color: string; weight: number }[] = [
  { color: "", weight: 40 }, // Empty = same as primary
  { color: "#6b7280", weight: 8 },
  { color: "#4b5563", weight: 8 },
  { color: "#10b981", weight: 6 },
  { color: "#14b8a6", weight: 6 },
  { color: "#3b82f6", weight: 5 },
  { color: "#6366f1", weight: 5 },
  { color: "#dc2626", weight: 4 },
  { color: "#f97316", weight: 4 },
  { color: "#a855f7", weight: 3 },
  { color: "#ec4899", weight: 3 },
  { color: "#fbbf24", weight: 2 },
  { color: "#22c55e", weight: 2 },
  { color: "#0ea5e9", weight: 2 },
  { color: "#f43f5e", weight: 2 },
];

function weightedRandom<T>(items: { weight: number }[] & T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

// Calculate rarity score (0-1000, higher = rarer)
export function calculateRarityScore(char: CharacterProps & { tier: string }): number {
  const headTotal = HEAD_WEIGHTS.reduce((s, h) => s + h.weight, 0);
  const eyeTotal = EYE_WEIGHTS.reduce((s, e) => s + e.weight, 0);
  const mouthTotal = MOUTH_WEIGHTS.reduce((s, m) => s + m.weight, 0);
  const bodyTotal = BODY_WEIGHTS.reduce((s, b) => s + b.weight, 0);
  const feetTotal = FEET_WEIGHTS.reduce((s, f) => s + f.weight, 0);
  const accTotal = ACCESSORY_WEIGHTS.reduce((s, a) => s + a.weight, 0);
  const bgTotal = BG_WEIGHTS.reduce((s, b) => s + b.weight, 0);
  const paletteTotal = COLOR_PALETTES.reduce((s, p) => s + p.weight, 0);

  const headWeight = HEAD_WEIGHTS.find(h => h.style === char.headStyle)?.weight || 25;
  const eyeWeight = EYE_WEIGHTS.find(e => e.style === char.eyeStyle)?.weight || 25;
  const mouthWeight = MOUTH_WEIGHTS.find(m => m.style === char.mouthStyle)?.weight || 28;
  const bodyWeight = BODY_WEIGHTS.find(b => b.style === char.bodyStyle)?.weight || 28;
  const feetWeight = FEET_WEIGHTS.find(f => f.style === char.feetStyle)?.weight || 30;
  const accWeight = ACCESSORY_WEIGHTS.find(a => a.accessory === char.accessory)?.weight || 35;
  const bgWeight = BG_WEIGHTS.find(b => b.style === char.bgStyle)?.weight || 30;
  const paletteWeight = COLOR_PALETTES.find(p => p.primary === char.primaryColor)?.weight || 25;

  // Convert weights to rarity (inverse - lower weight = higher rarity)
  const headRarity = 1 - (headWeight / headTotal);
  const eyeRarity = 1 - (eyeWeight / eyeTotal);
  const mouthRarity = 1 - (mouthWeight / mouthTotal);
  const bodyRarity = 1 - (bodyWeight / bodyTotal);
  const feetRarity = 1 - (feetWeight / feetTotal);
  const accRarity = 1 - (accWeight / accTotal);
  const bgRarity = 1 - (bgWeight / bgTotal);
  const paletteRarity = 1 - (paletteWeight / paletteTotal);

  // Average rarity, weighted slightly towards color (tier)
  const avgRarity = (headRarity + eyeRarity + mouthRarity + bodyRarity + feetRarity + accRarity + bgRarity + paletteRarity * 2) / 9;

  return Math.round(avgRarity * 1000);
}

// Get rarity tier from score
export function getRarityTier(score: number): { label: string; color: string } {
  if (score >= 850) return { label: "Legendary", color: "text-yellow-400" };
  if (score >= 700) return { label: "Epic", color: "text-purple-400" };
  if (score >= 550) return { label: "Rare", color: "text-blue-400" };
  if (score >= 400) return { label: "Uncommon", color: "text-emerald-400" };
  return { label: "Common", color: "text-gray-400" };
}

// Generate random character
export function generateRandomCharacter(): CharacterProps & { tier: string } {
  const head = weightedRandom(HEAD_WEIGHTS);
  const eye = weightedRandom(EYE_WEIGHTS);
  const mouth = weightedRandom(MOUTH_WEIGHTS);
  const body = weightedRandom(BODY_WEIGHTS);
  const feet = weightedRandom(FEET_WEIGHTS);
  const accessory = weightedRandom(ACCESSORY_WEIGHTS);
  const bg = weightedRandom(BG_WEIGHTS);
  const palette = weightedRandom(COLOR_PALETTES);
  const secondary = weightedRandom(SECONDARY_COLORS);

  return {
    headStyle: head.style,
    eyeStyle: eye.style,
    mouthStyle: mouth.style,
    bodyStyle: body.style,
    feetStyle: feet.style,
    accessory: accessory.accessory,
    bgStyle: bg.style,
    primaryColor: palette.primary,
    secondaryColor: secondary.color || undefined, // Empty string = same as primary
    accentColor: palette.accent,
    tier: palette.tier,
  };
}

// Export trait data for UI
export const TRAIT_RARITY = {
  heads: HEAD_WEIGHTS,
  eyes: EYE_WEIGHTS,
  mouths: MOUTH_WEIGHTS,
  bodies: BODY_WEIGHTS,
  feet: FEET_WEIGHTS,
  accessories: ACCESSORY_WEIGHTS,
  backgrounds: BG_WEIGHTS,
  secondaryColors: SECONDARY_COLORS,
  palettes: COLOR_PALETTES,
};

// Total combinations
export const TOTAL_COMBINATIONS =
  HEAD_WEIGHTS.length *
  EYE_WEIGHTS.length *
  MOUTH_WEIGHTS.length *
  BODY_WEIGHTS.length *
  FEET_WEIGHTS.length *
  ACCESSORY_WEIGHTS.length *
  BG_WEIGHTS.length *
  SECONDARY_COLORS.length *
  COLOR_PALETTES.length;

export { ShapeCharacter, CHARACTER_PRESETS };
export type { CharacterProps, HeadStyle, EyeStyle, MouthStyle, BodyStyle, FeetStyle, Accessory, BgStyle };
