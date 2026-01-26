"use client";

import React from "react";
import { ShapeCharacter, CHARACTER_PRESETS, CharacterProps, HeadStyle, EyeStyle, MouthStyle, BodyStyle, FeetStyle, Accessory, BgStyle } from "./ShapeCharacter";

// Weighted trait pools
const HEAD_WEIGHTS: { style: HeadStyle; weight: number }[] = [
  { style: "round", weight: 25 },
  { style: "square", weight: 20 },
  { style: "flat", weight: 18 },
  { style: "split", weight: 15 },
  { style: "pointed", weight: 12 },
  { style: "horns", weight: 10 },
];

const EYE_WEIGHTS: { style: EyeStyle; weight: number }[] = [
  { style: "dot", weight: 25 },
  { style: "round", weight: 22 },
  { style: "half", weight: 18 },
  { style: "wide", weight: 15 },
  { style: "slit", weight: 10 },
  { style: "angry", weight: 6 },
  { style: "wink", weight: 4 },
];

const MOUTH_WEIGHTS: { style: MouthStyle; weight: number }[] = [
  { style: "smile", weight: 28 },
  { style: "neutral", weight: 22 },
  { style: "smirk", weight: 18 },
  { style: "open", weight: 14 },
  { style: "frown", weight: 10 },
  { style: "teeth", weight: 8 },
];

const BODY_WEIGHTS: { style: BodyStyle; weight: number }[] = [
  { style: "round", weight: 28 },
  { style: "square", weight: 22 },
  { style: "wide", weight: 20 },
  { style: "tall", weight: 18 },
  { style: "split", weight: 12 },
];

const FEET_WEIGHTS: { style: FeetStyle; weight: number }[] = [
  { style: "pill", weight: 30 },
  { style: "round", weight: 22 },
  { style: "square", weight: 20 },
  { style: "split", weight: 18 },
  { style: "none", weight: 10 },
];

const ACCESSORY_WEIGHTS: { accessory: Accessory; weight: number }[] = [
  { accessory: "none", weight: 35 },
  { accessory: "mark", weight: 18 },
  { accessory: "glow", weight: 15 },
  { accessory: "badge", weight: 12 },
  { accessory: "glasses", weight: 10 },
  { accessory: "hat", weight: 6 },
  { accessory: "antenna", weight: 4 },
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
  { primary: "#6b7280", accent: "#ffffff", weight: 25, tier: "citizen" },
  { primary: "#10b981", accent: "#ffffff", weight: 20, tier: "member" },
  { primary: "#3b82f6", accent: "#ffffff", weight: 15, tier: "director" },
  { primary: "#dc2626", accent: "#ffffff", weight: 12, tier: "special" },
  { primary: "#a855f7", accent: "#ffffff", weight: 10, tier: "governor" },
  { primary: "#f97316", accent: "#ffffff", weight: 8, tier: "special" },
  { primary: "#ec4899", accent: "#ffffff", weight: 5, tier: "special" },
  { primary: "#fbbf24", accent: "#ffffff", weight: 3, tier: "chairman" },
  { primary: "#10b981", accent: "#10b981", weight: 2, tier: "shadow" },
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

  return {
    headStyle: head.style,
    eyeStyle: eye.style,
    mouthStyle: mouth.style,
    bodyStyle: body.style,
    feetStyle: feet.style,
    accessory: accessory.accessory,
    bgStyle: bg.style,
    primaryColor: palette.primary,
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
  COLOR_PALETTES.length;

export { ShapeCharacter, CHARACTER_PRESETS };
export type { CharacterProps, HeadStyle, EyeStyle, MouthStyle, BodyStyle, FeetStyle, Accessory, BgStyle };
