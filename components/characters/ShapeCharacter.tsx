"use client";

import React from "react";

export type HeadStyle = "circle" | "square" | "triangle" | "diamond" | "hexagon" | "ring";
export type EyeStyle = "dots" | "lines" | "arcs" | "crosses" | "rings" | "slits" | "scatter";
export type MouthStyle = "wave" | "straight" | "zigzag" | "curve" | "dashes" | "none";
export type BodyStyle = "blob" | "geometric" | "layered" | "fragmented" | "minimal";
export type FeetStyle = "orbs" | "bars" | "triangles" | "floating" | "none";
export type Accessory = "none" | "halo" | "orbits" | "sparks" | "aura" | "frame" | "glitch";
export type BgStyle = "solid" | "gradient" | "radial" | "grid" | "dots" | "circuit" | "stars";

export interface CharacterProps {
  headStyle?: HeadStyle;
  eyeStyle?: EyeStyle;
  mouthStyle?: MouthStyle;
  bodyStyle?: BodyStyle;
  feetStyle?: FeetStyle;
  accessory?: Accessory;
  bgStyle?: BgStyle;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  size?: number;
  className?: string;
}

export function ShapeCharacter({
  headStyle = "circle",
  eyeStyle = "dots",
  mouthStyle = "wave",
  bodyStyle = "blob",
  feetStyle = "orbs",
  accessory = "none",
  bgStyle = "solid",
  primaryColor = "#dc2626",
  secondaryColor,
  accentColor = "#ffffff",
  size = 200,
  className = "",
}: CharacterProps) {
  const centerX = 75;
  const centerY = 100;
  const bodyColor = secondaryColor || primaryColor;

  // Background rendering
  const renderBackground = () => {
    const bgBase = "#0a0a0a";
    const bgAccent = primaryColor;

    switch (bgStyle) {
      case "gradient":
        return (
          <>
            <defs>
              <linearGradient id={`bg-grad-${primaryColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={bgBase} />
                <stop offset="100%" stopColor={bgAccent} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="150" height="200" fill={`url(#bg-grad-${primaryColor.replace('#', '')})`} />
          </>
        );
      case "radial":
        return (
          <>
            <defs>
              <radialGradient id={`bg-radial-${primaryColor.replace('#', '')}`} cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={bgAccent} stopOpacity="0.25" />
                <stop offset="100%" stopColor={bgBase} />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="150" height="200" fill={`url(#bg-radial-${primaryColor.replace('#', '')})`} />
          </>
        );
      case "grid":
        return (
          <>
            <defs>
              <pattern id="grid-pattern" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M 15 0 L 0 0 0 15" fill="none" stroke={bgAccent} strokeWidth="0.5" strokeOpacity="0.15" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="150" height="200" fill={bgBase} />
            <rect x="0" y="0" width="150" height="200" fill="url(#grid-pattern)" />
          </>
        );
      case "dots":
        return (
          <>
            <defs>
              <pattern id="dots-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="1" fill={bgAccent} fillOpacity="0.15" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="150" height="200" fill={bgBase} />
            <rect x="0" y="0" width="150" height="200" fill="url(#dots-pattern)" />
          </>
        );
      case "circuit":
        return (
          <>
            <rect x="0" y="0" width="150" height="200" fill={bgBase} />
            <g stroke={bgAccent} strokeOpacity="0.12" strokeWidth="1" fill="none">
              <path d="M0,40 H40 V80 H80" />
              <path d="M150,60 H110 V100 H70" />
              <path d="M30,200 V160 H70 V120" />
              <path d="M120,200 V170 H90 V140" />
              <circle cx="40" cy="40" r="2" fill={bgAccent} fillOpacity="0.15" />
              <circle cx="80" cy="80" r="2" fill={bgAccent} fillOpacity="0.15" />
              <circle cx="110" cy="60" r="2" fill={bgAccent} fillOpacity="0.15" />
              <circle cx="70" cy="100" r="2" fill={bgAccent} fillOpacity="0.15" />
            </g>
          </>
        );
      case "stars":
        return (
          <>
            <rect x="0" y="0" width="150" height="200" fill={bgBase} />
            <g fill={accentColor} fillOpacity="0.3">
              <circle cx="20" cy="25" r="1" />
              <circle cx="45" cy="15" r="1.5" />
              <circle cx="120" cy="20" r="1" />
              <circle cx="135" cy="55" r="1" />
              <circle cx="15" cy="80" r="1" />
              <circle cx="130" cy="95" r="1" />
              <circle cx="25" cy="140" r="1" />
              <circle cx="140" cy="150" r="1.5" />
              <circle cx="10" cy="180" r="1" />
              <circle cx="125" cy="185" r="1" />
            </g>
          </>
        );
      case "solid":
      default:
        return <rect x="0" y="0" width="150" height="200" fill={bgBase} />;
    }
  };

  // Primary shape (top/main element)
  const renderPrimaryShape = () => {
    const y = 45;
    const size = 50;

    switch (headStyle) {
      case "circle":
        return <circle cx={centerX} cy={y} r={size / 2} fill={primaryColor} />;
      case "square":
        return <rect x={centerX - size/2} y={y - size/2} width={size} height={size} rx="6" fill={primaryColor} />;
      case "triangle":
        return <polygon points={`${centerX},${y - size/2} ${centerX + size/2},${y + size/2} ${centerX - size/2},${y + size/2}`} fill={primaryColor} />;
      case "diamond":
        return <polygon points={`${centerX},${y - size/2} ${centerX + size/2},${y} ${centerX},${y + size/2} ${centerX - size/2},${y}`} fill={primaryColor} />;
      case "hexagon":
        const r = size / 2;
        const points = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 60 - 90) * Math.PI / 180;
          return `${centerX + r * Math.cos(angle)},${y + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={points} fill={primaryColor} />;
      case "ring":
        return (
          <g>
            <circle cx={centerX} cy={y} r={size / 2} fill="none" stroke={primaryColor} strokeWidth="8" />
            <circle cx={centerX} cy={y} r={size / 4} fill={primaryColor} />
          </g>
        );
      default:
        return <circle cx={centerX} cy={y} r={size / 2} fill={primaryColor} />;
    }
  };

  // Accent elements (detail patterns)
  const renderAccents = () => {
    const y = 45;

    switch (eyeStyle) {
      case "dots":
        return (
          <g fill={accentColor}>
            <circle cx={centerX - 12} cy={y - 5} r="5" />
            <circle cx={centerX + 12} cy={y - 5} r="5" />
          </g>
        );
      case "lines":
        return (
          <g stroke={accentColor} strokeWidth="3" strokeLinecap="round">
            <line x1={centerX - 18} y1={y - 8} x2={centerX - 6} y2={y - 8} />
            <line x1={centerX + 6} y1={y - 8} x2={centerX + 18} y2={y - 8} />
          </g>
        );
      case "arcs":
        return (
          <g fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round">
            <path d={`M${centerX - 18},${y} A8,8 0 0 1 ${centerX - 2},${y}`} />
            <path d={`M${centerX + 2},${y} A8,8 0 0 1 ${centerX + 18},${y}`} />
          </g>
        );
      case "crosses":
        return (
          <g stroke={accentColor} strokeWidth="2" strokeLinecap="round">
            <line x1={centerX - 15} y1={y - 10} x2={centerX - 5} y2={y} />
            <line x1={centerX - 5} y1={y - 10} x2={centerX - 15} y2={y} />
            <line x1={centerX + 5} y1={y - 10} x2={centerX + 15} y2={y} />
            <line x1={centerX + 15} y1={y - 10} x2={centerX + 5} y2={y} />
          </g>
        );
      case "rings":
        return (
          <g fill="none" stroke={accentColor} strokeWidth="2">
            <circle cx={centerX - 12} cy={y - 3} r="7" />
            <circle cx={centerX + 12} cy={y - 3} r="7" />
          </g>
        );
      case "slits":
        return (
          <g fill={accentColor}>
            <rect x={centerX - 18} y={y - 6} width="14" height="4" rx="2" />
            <rect x={centerX + 4} y={y - 6} width="14" height="4" rx="2" />
          </g>
        );
      case "scatter":
        return (
          <g fill={accentColor}>
            <circle cx={centerX - 15} cy={y - 10} r="3" />
            <circle cx={centerX - 8} cy={y + 2} r="2" />
            <circle cx={centerX + 8} cy={y - 5} r="3" />
            <circle cx={centerX + 16} cy={y + 3} r="2" />
          </g>
        );
      default:
        return null;
    }
  };

  // Connection element (middle detail)
  const renderConnection = () => {
    const y = 80;

    switch (mouthStyle) {
      case "wave":
        return (
          <path
            d={`M${centerX - 25},${y} Q${centerX - 12},${y - 8} ${centerX},${y} Q${centerX + 12},${y + 8} ${centerX + 25},${y}`}
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case "straight":
        return (
          <line
            x1={centerX - 25}
            y1={y}
            x2={centerX + 25}
            y2={y}
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case "zigzag":
        return (
          <path
            d={`M${centerX - 25},${y} L${centerX - 12},${y - 8} L${centerX},${y} L${centerX + 12},${y - 8} L${centerX + 25},${y}`}
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case "curve":
        return (
          <path
            d={`M${centerX - 25},${y + 5} Q${centerX},${y - 15} ${centerX + 25},${y + 5}`}
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case "dashes":
        return (
          <g stroke={accentColor} strokeWidth="3" strokeLinecap="round">
            <line x1={centerX - 25} y1={y} x2={centerX - 15} y2={y} />
            <line x1={centerX - 5} y1={y} x2={centerX + 5} y2={y} />
            <line x1={centerX + 15} y1={y} x2={centerX + 25} y2={y} />
          </g>
        );
      case "none":
      default:
        return null;
    }
  };

  // Secondary shape (body/lower element)
  const renderSecondaryShape = () => {
    const y = 130;

    switch (bodyStyle) {
      case "blob":
        return (
          <ellipse cx={centerX} cy={y} rx={40} ry={30} fill={bodyColor} opacity="0.85" />
        );
      case "geometric":
        return (
          <g fill={bodyColor} opacity="0.85">
            <rect x={centerX - 35} y={y - 25} width="70" height="50" rx="8" />
          </g>
        );
      case "layered":
        return (
          <g fill={bodyColor}>
            <ellipse cx={centerX} cy={y + 15} rx={45} ry={20} opacity="0.4" />
            <ellipse cx={centerX} cy={y} rx={35} ry={18} opacity="0.7" />
            <ellipse cx={centerX} cy={y - 12} rx={25} ry={14} opacity="1" />
          </g>
        );
      case "fragmented":
        return (
          <g fill={bodyColor}>
            <rect x={centerX - 40} y={y - 20} width="25" height="35" rx="4" opacity="0.9" />
            <rect x={centerX - 10} y={y - 25} width="20" height="45" rx="4" opacity="0.8" />
            <rect x={centerX + 15} y={y - 15} width="25" height="30" rx="4" opacity="0.9" />
          </g>
        );
      case "minimal":
        return (
          <g fill={bodyColor} opacity="0.7">
            <circle cx={centerX - 20} cy={y} r="12" />
            <circle cx={centerX + 20} cy={y} r="12" />
          </g>
        );
      default:
        return <ellipse cx={centerX} cy={y} rx={40} ry={30} fill={bodyColor} opacity="0.85" />;
    }
  };

  // Base elements (bottom details)
  const renderBase = () => {
    const y = 175;

    switch (feetStyle) {
      case "orbs":
        return (
          <g fill={bodyColor}>
            <circle cx={centerX - 25} cy={y} r="10" opacity="0.7" />
            <circle cx={centerX + 25} cy={y} r="10" opacity="0.7" />
          </g>
        );
      case "bars":
        return (
          <g fill={bodyColor} opacity="0.7">
            <rect x={centerX - 40} y={y - 8} width="30" height="16" rx="4" />
            <rect x={centerX + 10} y={y - 8} width="30" height="16" rx="4" />
          </g>
        );
      case "triangles":
        return (
          <g fill={bodyColor} opacity="0.7">
            <polygon points={`${centerX - 30},${y + 10} ${centerX - 15},${y + 10} ${centerX - 22},${y - 8}`} />
            <polygon points={`${centerX + 15},${y + 10} ${centerX + 30},${y + 10} ${centerX + 22},${y - 8}`} />
          </g>
        );
      case "floating":
        return (
          <g fill={accentColor} opacity="0.5">
            <circle cx={centerX - 30} cy={y} r="4" />
            <circle cx={centerX - 10} cy={y + 5} r="3" />
            <circle cx={centerX + 10} cy={y + 5} r="3" />
            <circle cx={centerX + 30} cy={y} r="4" />
          </g>
        );
      case "none":
      default:
        return null;
    }
  };

  // Effects (overlays and extras)
  const renderEffect = () => {
    switch (accessory) {
      case "halo":
        return (
          <ellipse
            cx={centerX}
            cy={15}
            rx={35}
            ry={8}
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            opacity="0.6"
          />
        );
      case "orbits":
        return (
          <g fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.3">
            <ellipse cx={centerX} cy={centerY} rx={60} ry={25} />
            <ellipse cx={centerX} cy={centerY} rx={25} ry={60} />
          </g>
        );
      case "sparks":
        return (
          <g fill={accentColor} opacity="0.6">
            <circle cx={20} cy={40} r="3" />
            <circle cx={130} cy={50} r="2" />
            <circle cx={25} cy={150} r="2" />
            <circle cx={125} cy={160} r="3" />
            <circle cx={centerX} cy={185} r="2" />
          </g>
        );
      case "aura":
        return (
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={65}
            ry={85}
            fill={primaryColor}
            opacity="0.08"
          />
        );
      case "frame":
        return (
          <rect
            x="10"
            y="10"
            width="130"
            height="180"
            fill="none"
            stroke={primaryColor}
            strokeWidth="2"
            opacity="0.3"
            rx="8"
          />
        );
      case "glitch":
        return (
          <g opacity="0.4">
            <rect x={centerX - 50} y={60} width="100" height="3" fill={accentColor} />
            <rect x={centerX - 40} y={120} width="80" height="2" fill={primaryColor} />
            <rect x={centerX - 45} y={90} width="90" height="2" fill={accentColor} />
          </g>
        );
      case "none":
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 200"
      className={className}
    >
      {/* Background */}
      {renderBackground()}

      {/* Aura effect behind everything */}
      {accessory === "aura" && renderEffect()}

      {/* Base elements */}
      {renderBase()}

      {/* Secondary shape */}
      {renderSecondaryShape()}

      {/* Connection element */}
      {renderConnection()}

      {/* Primary shape */}
      {renderPrimaryShape()}

      {/* Accent elements */}
      {renderAccents()}

      {/* Effects on top */}
      {accessory !== "none" && accessory !== "aura" && renderEffect()}
    </svg>
  );
}

// Preset characters
export const CHARACTER_PRESETS = [
  { name: "Chairman", headStyle: "circle", eyeStyle: "dots", mouthStyle: "wave", bodyStyle: "blob", feetStyle: "orbs", accessory: "halo", primaryColor: "#fbbf24", tier: "chairman" },
  { name: "Governor", headStyle: "hexagon", eyeStyle: "rings", mouthStyle: "zigzag", bodyStyle: "layered", feetStyle: "triangles", accessory: "aura", primaryColor: "#a855f7", tier: "governor" },
  { name: "Director", headStyle: "square", eyeStyle: "lines", mouthStyle: "straight", bodyStyle: "geometric", feetStyle: "bars", accessory: "frame", primaryColor: "#3b82f6", tier: "director" },
  { name: "Member", headStyle: "diamond", eyeStyle: "arcs", mouthStyle: "curve", bodyStyle: "minimal", feetStyle: "floating", accessory: "none", primaryColor: "#10b981", tier: "member" },
  { name: "Citizen", headStyle: "circle", eyeStyle: "dots", mouthStyle: "wave", bodyStyle: "blob", feetStyle: "orbs", accessory: "none", primaryColor: "#6b7280", tier: "citizen" },
  { name: "Shadow", headStyle: "triangle", eyeStyle: "slits", mouthStyle: "none", bodyStyle: "fragmented", feetStyle: "none", accessory: "glitch", primaryColor: "#10b981", tier: "shadow" },
  { name: "Operative", headStyle: "ring", eyeStyle: "crosses", mouthStyle: "dashes", bodyStyle: "layered", feetStyle: "floating", accessory: "orbits", primaryColor: "#dc2626", tier: "special" },
  { name: "Enforcer", headStyle: "hexagon", eyeStyle: "scatter", mouthStyle: "zigzag", bodyStyle: "fragmented", feetStyle: "triangles", accessory: "sparks", primaryColor: "#f97316", tier: "special" },
] as const;

export default ShapeCharacter;
