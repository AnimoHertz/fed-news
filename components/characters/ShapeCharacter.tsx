"use client";

import React from "react";

export type HeadStyle = "round" | "square" | "pointed" | "split" | "horns" | "flat";
export type EyeStyle = "round" | "half" | "slit" | "dot" | "wide" | "wink" | "angry";
export type MouthStyle = "smile" | "neutral" | "open" | "smirk" | "frown" | "teeth";
export type BodyStyle = "round" | "square" | "wide" | "tall" | "split";
export type FeetStyle = "pill" | "split" | "square" | "round" | "none";
export type Accessory = "none" | "badge" | "antenna" | "mark" | "glow" | "hat" | "glasses";
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
  accentColor?: string;
  size?: number;
  className?: string;
}

export function ShapeCharacter({
  headStyle = "round",
  eyeStyle = "round",
  mouthStyle = "smile",
  bodyStyle = "round",
  feetStyle = "pill",
  accessory = "none",
  bgStyle = "solid",
  primaryColor = "#dc2626",
  accentColor = "#ffffff",
  size = 200,
  className = "",
}: CharacterProps) {

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
                <path d="M 15 0 L 0 0 0 15" fill="none" stroke={bgAccent} strokeWidth="0.5" strokeOpacity="0.2" />
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
                <circle cx="6" cy="6" r="1.5" fill={bgAccent} fillOpacity="0.2" />
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
            <g stroke={bgAccent} strokeOpacity="0.15" strokeWidth="1" fill="none">
              <path d="M0,40 H40 V80 H80" />
              <path d="M150,60 H110 V100 H70" />
              <path d="M30,200 V160 H70 V120" />
              <path d="M120,200 V170 H90 V140" />
              <circle cx="40" cy="40" r="3" fill={bgAccent} fillOpacity="0.2" />
              <circle cx="80" cy="80" r="3" fill={bgAccent} fillOpacity="0.2" />
              <circle cx="110" cy="60" r="3" fill={bgAccent} fillOpacity="0.2" />
              <circle cx="70" cy="100" r="3" fill={bgAccent} fillOpacity="0.2" />
              <circle cx="70" cy="120" r="3" fill={bgAccent} fillOpacity="0.2" />
              <circle cx="90" cy="140" r="3" fill={bgAccent} fillOpacity="0.2" />
            </g>
          </>
        );
      case "stars":
        return (
          <>
            <rect x="0" y="0" width="150" height="200" fill={bgBase} />
            <g fill={bgAccent} fillOpacity="0.4">
              <circle cx="20" cy="25" r="1" />
              <circle cx="45" cy="15" r="1.5" />
              <circle cx="80" cy="30" r="1" />
              <circle cx="120" cy="20" r="1.2" />
              <circle cx="135" cy="45" r="1" />
              <circle cx="15" cy="70" r="1.3" />
              <circle cx="130" cy="85" r="1" />
              <circle cx="25" cy="120" r="1" />
              <circle cx="140" cy="130" r="1.5" />
              <circle cx="10" cy="160" r="1" />
              <circle cx="50" cy="175" r="1.2" />
              <circle cx="100" cy="165" r="1" />
              <circle cx="125" cy="185" r="1.3" />
            </g>
          </>
        );
      case "solid":
      default:
        return <rect x="0" y="0" width="150" height="200" fill={bgBase} />;
    }
  };

  // Main face/head - single unified head with facial features
  const renderHead = () => {
    const headY = 15;
    const headHeight = 75;
    const headWidth = 90;
    const centerX = 75;

    // Head shape
    const headShape = (() => {
      switch (headStyle) {
        case "round":
          return <ellipse cx={centerX} cy={headY + headHeight/2} rx={headWidth/2} ry={headHeight/2} fill={primaryColor} />;
        case "square":
          return <rect x={centerX - headWidth/2} y={headY} width={headWidth} height={headHeight} rx="12" fill={primaryColor} />;
        case "pointed":
          return (
            <path
              d={`M${centerX},${headY} L${centerX + headWidth/2 + 5},${headY + headHeight} L${centerX - headWidth/2 - 5},${headY + headHeight} Z`}
              fill={primaryColor}
            />
          );
        case "split":
          return (
            <g>
              <ellipse cx={centerX - 20} cy={headY + headHeight/2} rx={30} ry={headHeight/2} fill={primaryColor} />
              <ellipse cx={centerX + 20} cy={headY + headHeight/2} rx={30} ry={headHeight/2} fill={primaryColor} />
            </g>
          );
        case "horns":
          return (
            <g>
              <ellipse cx={centerX} cy={headY + headHeight/2 + 8} rx={headWidth/2 - 5} ry={headHeight/2 - 5} fill={primaryColor} />
              <path d={`M${centerX - 30},${headY + 20} Q${centerX - 40},${headY - 15} ${centerX - 25},${headY - 5}`} fill={primaryColor} />
              <path d={`M${centerX + 30},${headY + 20} Q${centerX + 40},${headY - 15} ${centerX + 25},${headY - 5}`} fill={primaryColor} />
            </g>
          );
        case "flat":
          return <rect x={centerX - headWidth/2 - 10} y={headY + 15} width={headWidth + 20} height={headHeight - 20} rx="20" fill={primaryColor} />;
        default:
          return <ellipse cx={centerX} cy={headY + headHeight/2} rx={headWidth/2} ry={headHeight/2} fill={primaryColor} />;
      }
    })();

    // Eye positions
    const eyeY = headY + 28;
    const leftEyeX = centerX - 18;
    const rightEyeX = centerX + 18;
    const eyeSize = 12;

    // Eyes
    const renderEyes = () => {
      switch (eyeStyle) {
        case "round":
          return (
            <g>
              <circle cx={leftEyeX} cy={eyeY} r={eyeSize} fill={accentColor} />
              <circle cx={rightEyeX} cy={eyeY} r={eyeSize} fill={accentColor} />
              <circle cx={leftEyeX + 3} cy={eyeY - 2} r={4} fill="#0a0a0a" />
              <circle cx={rightEyeX + 3} cy={eyeY - 2} r={4} fill="#0a0a0a" />
            </g>
          );
        case "half":
          return (
            <g>
              <path d={`M${leftEyeX - eyeSize},${eyeY + 5} A${eyeSize},${eyeSize} 0 0 1 ${leftEyeX + eyeSize},${eyeY + 5}`} fill={accentColor} />
              <path d={`M${rightEyeX - eyeSize},${eyeY + 5} A${eyeSize},${eyeSize} 0 0 1 ${rightEyeX + eyeSize},${eyeY + 5}`} fill={accentColor} />
            </g>
          );
        case "slit":
          return (
            <g>
              <rect x={leftEyeX - 10} y={eyeY - 3} width="20" height="6" rx="3" fill={accentColor} />
              <rect x={rightEyeX - 10} y={eyeY - 3} width="20" height="6" rx="3" fill={accentColor} />
            </g>
          );
        case "dot":
          return (
            <g>
              <circle cx={leftEyeX} cy={eyeY} r={6} fill={accentColor} />
              <circle cx={rightEyeX} cy={eyeY} r={6} fill={accentColor} />
            </g>
          );
        case "wide":
          return (
            <g>
              <ellipse cx={leftEyeX} cy={eyeY} rx={14} ry={10} fill={accentColor} />
              <ellipse cx={rightEyeX} cy={eyeY} rx={14} ry={10} fill={accentColor} />
              <circle cx={leftEyeX + 4} cy={eyeY} r={5} fill="#0a0a0a" />
              <circle cx={rightEyeX + 4} cy={eyeY} r={5} fill="#0a0a0a" />
            </g>
          );
        case "wink":
          return (
            <g>
              <circle cx={leftEyeX} cy={eyeY} r={eyeSize} fill={accentColor} />
              <circle cx={leftEyeX + 3} cy={eyeY - 2} r={4} fill="#0a0a0a" />
              <path d={`M${rightEyeX - 10},${eyeY} Q${rightEyeX},${eyeY - 8} ${rightEyeX + 10},${eyeY}`} stroke={accentColor} strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          );
        case "angry":
          return (
            <g>
              <ellipse cx={leftEyeX} cy={eyeY + 2} rx={12} ry={9} fill={accentColor} />
              <ellipse cx={rightEyeX} cy={eyeY + 2} rx={12} ry={9} fill={accentColor} />
              <rect x={leftEyeX - 14} y={eyeY - 12} width="20" height="8" fill="#0a0a0a" transform={`rotate(15, ${leftEyeX}, ${eyeY - 8})`} />
              <rect x={rightEyeX - 6} y={eyeY - 12} width="20" height="8" fill="#0a0a0a" transform={`rotate(-15, ${rightEyeX}, ${eyeY - 8})`} />
              <circle cx={leftEyeX + 2} cy={eyeY + 2} r={4} fill="#0a0a0a" />
              <circle cx={rightEyeX + 2} cy={eyeY + 2} r={4} fill="#0a0a0a" />
            </g>
          );
        default:
          return (
            <g>
              <circle cx={leftEyeX} cy={eyeY} r={eyeSize} fill={accentColor} />
              <circle cx={rightEyeX} cy={eyeY} r={eyeSize} fill={accentColor} />
            </g>
          );
      }
    };

    // Mouth position
    const mouthY = headY + 55;

    // Mouth
    const renderMouth = () => {
      switch (mouthStyle) {
        case "smile":
          return (
            <path
              d={`M${centerX - 15},${mouthY} Q${centerX},${mouthY + 12} ${centerX + 15},${mouthY}`}
              stroke={accentColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          );
        case "neutral":
          return (
            <line
              x1={centerX - 12}
              y1={mouthY + 3}
              x2={centerX + 12}
              y2={mouthY + 3}
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        case "open":
          return (
            <ellipse
              cx={centerX}
              cy={mouthY + 5}
              rx={10}
              ry={8}
              fill="#0a0a0a"
              stroke={accentColor}
              strokeWidth="2"
            />
          );
        case "smirk":
          return (
            <path
              d={`M${centerX - 12},${mouthY + 5} Q${centerX + 5},${mouthY + 2} ${centerX + 15},${mouthY - 3}`}
              stroke={accentColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          );
        case "frown":
          return (
            <path
              d={`M${centerX - 15},${mouthY + 8} Q${centerX},${mouthY - 4} ${centerX + 15},${mouthY + 8}`}
              stroke={accentColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          );
        case "teeth":
          return (
            <g>
              <rect x={centerX - 15} y={mouthY} width="30" height="12" rx="3" fill="#0a0a0a" stroke={accentColor} strokeWidth="2" />
              <line x1={centerX - 8} y1={mouthY} x2={centerX - 8} y2={mouthY + 12} stroke={accentColor} strokeWidth="1" />
              <line x1={centerX} y1={mouthY} x2={centerX} y2={mouthY + 12} stroke={accentColor} strokeWidth="1" />
              <line x1={centerX + 8} y1={mouthY} x2={centerX + 8} y2={mouthY + 12} stroke={accentColor} strokeWidth="1" />
            </g>
          );
        default:
          return (
            <path
              d={`M${centerX - 15},${mouthY} Q${centerX},${mouthY + 12} ${centerX + 15},${mouthY}`}
              stroke={accentColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          );
      }
    };

    return (
      <g>
        {headShape}
        {renderEyes()}
        {renderMouth()}
      </g>
    );
  };

  // Body with arms
  const renderBody = () => {
    const bodyY = 95;
    const centerX = 75;

    // Arms
    const renderArms = () => (
      <g>
        {/* Left arm */}
        <ellipse cx={centerX - 55} cy={bodyY + 25} rx={12} ry={18} fill={primaryColor} />
        {/* Right arm */}
        <ellipse cx={centerX + 55} cy={bodyY + 25} rx={12} ry={18} fill={primaryColor} />
      </g>
    );

    switch (bodyStyle) {
      case "round":
        return (
          <g>
            {renderArms()}
            <ellipse cx={centerX} cy={bodyY + 30} rx={45} ry={35} fill={primaryColor} />
          </g>
        );
      case "square":
        return (
          <g>
            {renderArms()}
            <rect x={centerX - 42} y={bodyY} width="84" height="60" rx="8" fill={primaryColor} />
          </g>
        );
      case "wide":
        return (
          <g>
            <ellipse cx={centerX - 60} cy={bodyY + 25} rx={10} ry={16} fill={primaryColor} />
            <ellipse cx={centerX + 60} cy={bodyY + 25} rx={10} ry={16} fill={primaryColor} />
            <ellipse cx={centerX} cy={bodyY + 28} rx={55} ry={32} fill={primaryColor} />
          </g>
        );
      case "tall":
        return (
          <g>
            {renderArms()}
            <rect x={centerX - 35} y={bodyY - 5} width="70" height="70" rx="15" fill={primaryColor} />
          </g>
        );
      case "split":
        return (
          <g>
            <ellipse cx={centerX - 50} cy={bodyY + 30} rx={10} ry={15} fill={primaryColor} />
            <ellipse cx={centerX + 50} cy={bodyY + 30} rx={10} ry={15} fill={primaryColor} />
            <ellipse cx={centerX - 22} cy={bodyY + 30} rx={28} ry={35} fill={primaryColor} />
            <ellipse cx={centerX + 22} cy={bodyY + 30} rx={28} ry={35} fill={primaryColor} />
          </g>
        );
      default:
        return (
          <g>
            {renderArms()}
            <ellipse cx={centerX} cy={bodyY + 30} rx={45} ry={35} fill={primaryColor} />
          </g>
        );
    }
  };

  // Feet
  const renderFeet = () => {
    const feetY = 165;
    const centerX = 75;

    switch (feetStyle) {
      case "pill":
        return (
          <g>
            <ellipse cx={centerX - 20} cy={feetY + 12} rx={18} ry={12} fill={primaryColor} />
            <ellipse cx={centerX + 20} cy={feetY + 12} rx={18} ry={12} fill={primaryColor} />
          </g>
        );
      case "split":
        return (
          <g>
            <ellipse cx={centerX - 28} cy={feetY + 12} rx={15} ry={10} fill={primaryColor} />
            <ellipse cx={centerX + 28} cy={feetY + 12} rx={15} ry={10} fill={primaryColor} />
          </g>
        );
      case "square":
        return (
          <g>
            <rect x={centerX - 38} y={feetY} width="28" height="22" rx="4" fill={primaryColor} />
            <rect x={centerX + 10} y={feetY} width="28" height="22" rx="4" fill={primaryColor} />
          </g>
        );
      case "round":
        return (
          <g>
            <circle cx={centerX - 22} cy={feetY + 12} r={14} fill={primaryColor} />
            <circle cx={centerX + 22} cy={feetY + 12} r={14} fill={primaryColor} />
          </g>
        );
      case "none":
        return null;
      default:
        return (
          <g>
            <ellipse cx={centerX - 20} cy={feetY + 12} rx={18} ry={12} fill={primaryColor} />
            <ellipse cx={centerX + 20} cy={feetY + 12} rx={18} ry={12} fill={primaryColor} />
          </g>
        );
    }
  };

  // Accessories
  const renderAccessory = () => {
    const centerX = 75;

    switch (accessory) {
      case "badge":
        return (
          <g>
            <circle cx="125" cy="25" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <text x="125" y="29" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0a0a0a">$</text>
          </g>
        );
      case "antenna":
        return (
          <g>
            <line x1={centerX} y1="15" x2={centerX} y2="-5" stroke={primaryColor} strokeWidth="4" />
            <circle cx={centerX} cy="-8" r="6" fill={accentColor} />
          </g>
        );
      case "mark":
        return <circle cx="115" cy="115" r="8" fill={accentColor} opacity="0.8" />;
      case "glow":
        return <ellipse cx={centerX} cy="100" rx="70" ry="55" fill={primaryColor} opacity="0.15" />;
      case "hat":
        return (
          <g>
            <rect x={centerX - 35} y="5" width="70" height="15" rx="3" fill="#1a1a1a" />
            <rect x={centerX - 25} y="-10" width="50" height="20" rx="5" fill="#1a1a1a" />
          </g>
        );
      case "glasses":
        return (
          <g>
            <circle cx={centerX - 18} cy="43" r="14" fill="none" stroke="#1a1a1a" strokeWidth="3" />
            <circle cx={centerX + 18} cy="43" r="14" fill="none" stroke="#1a1a1a" strokeWidth="3" />
            <line x1={centerX - 4} y1="43" x2={centerX + 4} y2="43" stroke="#1a1a1a" strokeWidth="3" />
            <line x1={centerX - 32} y1="43" x2={centerX - 40} y2="40" stroke="#1a1a1a" strokeWidth="2" />
            <line x1={centerX + 32} y1="43" x2={centerX + 40} y2="40" stroke="#1a1a1a" strokeWidth="2" />
          </g>
        );
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

      {/* Glow renders first */}
      {accessory === "glow" && renderAccessory()}

      {/* Feet (behind body) */}
      {renderFeet()}

      {/* Body with arms */}
      {renderBody()}

      {/* Head with face */}
      {renderHead()}

      {/* Accessories on top */}
      {accessory !== "none" && accessory !== "glow" && renderAccessory()}
    </svg>
  );
}

// Preset characters
export const CHARACTER_PRESETS = [
  { name: "Chairman", headStyle: "round", eyeStyle: "round", mouthStyle: "smile", bodyStyle: "round", feetStyle: "pill", accessory: "badge", primaryColor: "#fbbf24", tier: "chairman" },
  { name: "Governor", headStyle: "horns", eyeStyle: "angry", mouthStyle: "teeth", bodyStyle: "wide", feetStyle: "split", accessory: "glow", primaryColor: "#a855f7", tier: "governor" },
  { name: "Director", headStyle: "square", eyeStyle: "wide", mouthStyle: "neutral", bodyStyle: "square", feetStyle: "square", accessory: "glasses", primaryColor: "#3b82f6", tier: "director" },
  { name: "Member", headStyle: "split", eyeStyle: "half", mouthStyle: "smirk", bodyStyle: "tall", feetStyle: "pill", accessory: "none", primaryColor: "#10b981", tier: "member" },
  { name: "Citizen", headStyle: "round", eyeStyle: "dot", mouthStyle: "smile", bodyStyle: "round", feetStyle: "round", accessory: "none", primaryColor: "#6b7280", tier: "citizen" },
  { name: "Shadow", headStyle: "pointed", eyeStyle: "slit", mouthStyle: "frown", bodyStyle: "split", feetStyle: "none", accessory: "glow", primaryColor: "#10b981", tier: "shadow" },
  { name: "Operative", headStyle: "flat", eyeStyle: "wink", mouthStyle: "smirk", bodyStyle: "wide", feetStyle: "pill", accessory: "hat", primaryColor: "#dc2626", tier: "special" },
  { name: "Enforcer", headStyle: "horns", eyeStyle: "angry", mouthStyle: "teeth", bodyStyle: "tall", feetStyle: "split", accessory: "antenna", primaryColor: "#f97316", tier: "special" },
] as const;

export default ShapeCharacter;
