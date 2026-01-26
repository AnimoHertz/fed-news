"use client";

import React from "react";

export type HeadStyle = "round" | "square" | "pointed" | "split" | "horns" | "flat";
export type EyeStyle = "quarter" | "half" | "slit" | "dot" | "wide" | "wink" | "angry";
export type BodyStyle = "round" | "square" | "wide" | "tall" | "split";
export type FeetStyle = "pill" | "split" | "square" | "round" | "none";
export type Accessory = "none" | "badge" | "antenna" | "mark" | "glow";

export interface CharacterProps {
  headStyle?: HeadStyle;
  eyeStyle?: EyeStyle;
  bodyStyle?: BodyStyle;
  feetStyle?: FeetStyle;
  accessory?: Accessory;
  primaryColor?: string;
  accentColor?: string;
  size?: number;
  className?: string;
}

export function ShapeCharacter({
  headStyle = "round",
  eyeStyle = "quarter",
  bodyStyle = "round",
  feetStyle = "pill",
  accessory = "none",
  primaryColor = "#dc2626",
  accentColor = "#ffffff",
  size = 200,
  className = "",
}: CharacterProps) {
  // Head + Eyes combined (eyes are cutouts in the head)
  const renderHead = () => {
    const eyeY = 58;

    // Eye definitions based on style
    const leftEye = (() => {
      switch (eyeStyle) {
        case "quarter":
          return (
            <g>
              <rect x="30" y={eyeY} width="38" height="28" fill={accentColor} />
              <circle cx="68" cy={eyeY} r="28" fill="#0a0a0a" />
            </g>
          );
        case "half":
          return <path d={`M30,${eyeY + 28} A19,19 0 0 1 68,${eyeY + 28} Z`} fill={accentColor} />;
        case "slit":
          return <rect x="30" y={eyeY + 8} width="38" height="10" rx="5" fill={accentColor} />;
        case "dot":
          return <circle cx="49" cy={eyeY + 12} r="12" fill={accentColor} />;
        case "wide":
          return <rect x="28" y={eyeY + 2} width="42" height="22" rx="3" fill={accentColor} />;
        case "wink":
          return (
            <g>
              <rect x="30" y={eyeY} width="38" height="28" fill={accentColor} />
              <circle cx="68" cy={eyeY} r="28" fill="#0a0a0a" />
            </g>
          );
        case "angry":
          return <polygon points={`30,${eyeY + 28} 35,${eyeY + 5} 68,${eyeY + 15} 63,${eyeY + 28}`} fill={accentColor} />;
        default:
          return <circle cx="49" cy={eyeY + 12} r="12" fill={accentColor} />;
      }
    })();

    const rightEye = (() => {
      switch (eyeStyle) {
        case "quarter":
          return (
            <g>
              <rect x="82" y={eyeY} width="38" height="28" fill={accentColor} />
              <circle cx="82" cy={eyeY} r="28" fill="#0a0a0a" />
            </g>
          );
        case "half":
          return <path d={`M82,${eyeY + 28} A19,19 0 0 1 120,${eyeY + 28} Z`} fill={accentColor} />;
        case "slit":
          return <rect x="82" y={eyeY + 8} width="38" height="10" rx="5" fill={accentColor} />;
        case "dot":
          return <circle cx="101" cy={eyeY + 12} r="12" fill={accentColor} />;
        case "wide":
          return <rect x="80" y={eyeY + 2} width="42" height="22" rx="3" fill={accentColor} />;
        case "wink":
          return <path d={`M85,${eyeY + 14} Q101,${eyeY + 5} 117,${eyeY + 14}`} stroke={accentColor} strokeWidth="5" fill="none" strokeLinecap="round" />;
        case "angry":
          return <polygon points={`120,${eyeY + 28} 115,${eyeY + 5} 82,${eyeY + 15} 87,${eyeY + 28}`} fill={accentColor} />;
        default:
          return <circle cx="101" cy={eyeY + 12} r="12" fill={accentColor} />;
      }
    })();

    // Head shapes that contain the eyes
    switch (headStyle) {
      case "round":
        return (
          <g>
            <circle cx="49" cy="42" r="32" fill={primaryColor} />
            <circle cx="101" cy="42" r="32" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
      case "square":
        return (
          <g>
            <rect x="22" y="15" width="50" height="55" rx="6" fill={primaryColor} />
            <rect x="78" y="15" width="50" height="55" rx="6" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
      case "pointed":
        return (
          <g>
            <polygon points="49,8 78,70 20,70" fill={primaryColor} />
            <polygon points="101,8 130,70 72,70" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
      case "split":
        return (
          <g>
            <rect x="18" y="20" width="28" height="50" rx="8" fill={primaryColor} />
            <rect x="50" y="30" width="20" height="40" rx="6" fill={primaryColor} />
            <rect x="80" y="30" width="20" height="40" rx="6" fill={primaryColor} />
            <rect x="104" y="20" width="28" height="50" rx="8" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
      case "horns":
        return (
          <g>
            <path d="M25,72 Q15,35 38,12 Q60,35 50,72" fill={primaryColor} />
            <path d="M100,72 Q90,35 112,12 Q135,35 125,72" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
      case "flat":
        return (
          <g>
            <rect x="20" y="35" width="110" height="38" rx="8" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
      default:
        return (
          <g>
            <circle cx="49" cy="42" r="32" fill={primaryColor} />
            <circle cx="101" cy="42" r="32" fill={primaryColor} />
            {leftEye}
            {rightEye}
          </g>
        );
    }
  };

  // Body shapes
  const renderBody = () => {
    const y = 95;
    switch (bodyStyle) {
      case "round":
        return <rect x="25" y={y} width="100" height="58" rx="18" fill={primaryColor} />;
      case "square":
        return <rect x="28" y={y} width="94" height="55" rx="6" fill={primaryColor} />;
      case "wide":
        return <rect x="15" y={y + 5} width="120" height="48" rx="14" fill={primaryColor} />;
      case "tall":
        return <rect x="35" y={y - 5} width="80" height="68" rx="16" fill={primaryColor} />;
      case "split":
        return (
          <g>
            <rect x="22" y={y} width="45" height="58" rx="12" fill={primaryColor} />
            <rect x="83" y={y} width="45" height="58" rx="12" fill={primaryColor} />
          </g>
        );
      default:
        return <rect x="25" y={y} width="100" height="58" rx="18" fill={primaryColor} />;
    }
  };

  // Feet shapes
  const renderFeet = () => {
    const y = 168;
    switch (feetStyle) {
      case "pill":
        return <rect x="40" y={y} width="70" height="28" rx="14" fill={primaryColor} />;
      case "split":
        return (
          <g>
            <rect x="30" y={y} width="35" height="25" rx="10" fill={primaryColor} />
            <rect x="85" y={y} width="35" height="25" rx="10" fill={primaryColor} />
          </g>
        );
      case "square":
        return <rect x="38" y={y} width="74" height="26" rx="5" fill={primaryColor} />;
      case "round":
        return <ellipse cx="75" cy={y + 14} rx="40" ry="14" fill={primaryColor} />;
      case "none":
        return null;
      default:
        return <rect x="40" y={y} width="70" height="28" rx="14" fill={primaryColor} />;
    }
  };

  // Accessories
  const renderAccessory = () => {
    switch (accessory) {
      case "badge":
        return (
          <g>
            <circle cx="130" cy="20" r="10" fill="#0a0a0a" stroke={accentColor} strokeWidth="2" />
            <path d="M126,20 L129,23 L135,17" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      case "antenna":
        return (
          <g>
            <line x1="75" y1="15" x2="75" y2="-2" stroke={primaryColor} strokeWidth="3" />
            <circle cx="75" cy="-5" r="5" fill={primaryColor} />
          </g>
        );
      case "mark":
        return <circle cx="120" cy="120" r="6" fill={accentColor} />;
      case "glow":
        return <ellipse cx="75" cy="100" rx="65" ry="45" fill={primaryColor} opacity="0.12" />;
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
      {/* Pure black background */}
      <rect x="0" y="0" width="150" height="200" fill="#0a0a0a" />

      {/* Glow renders first */}
      {accessory === "glow" && renderAccessory()}

      {/* Head with integrated eyes */}
      {renderHead()}

      {/* Body */}
      {renderBody()}

      {/* Feet */}
      {renderFeet()}

      {/* Other accessories */}
      {accessory !== "none" && accessory !== "glow" && renderAccessory()}
    </svg>
  );
}

// Preset characters
export const CHARACTER_PRESETS = [
  { name: "Chairman", headStyle: "round", eyeStyle: "quarter", bodyStyle: "round", feetStyle: "pill", accessory: "badge", primaryColor: "#fbbf24", tier: "chairman" },
  { name: "Governor", headStyle: "horns", eyeStyle: "angry", bodyStyle: "wide", feetStyle: "split", accessory: "glow", primaryColor: "#a855f7", tier: "governor" },
  { name: "Director", headStyle: "square", eyeStyle: "wide", bodyStyle: "square", feetStyle: "square", accessory: "mark", primaryColor: "#3b82f6", tier: "director" },
  { name: "Member", headStyle: "split", eyeStyle: "half", bodyStyle: "tall", feetStyle: "pill", accessory: "none", primaryColor: "#10b981", tier: "member" },
  { name: "Citizen", headStyle: "round", eyeStyle: "dot", bodyStyle: "round", feetStyle: "round", accessory: "none", primaryColor: "#6b7280", tier: "citizen" },
  { name: "Shadow", headStyle: "pointed", eyeStyle: "slit", bodyStyle: "split", feetStyle: "none", accessory: "glow", primaryColor: "#10b981", tier: "shadow" },
  { name: "Operative", headStyle: "flat", eyeStyle: "wink", bodyStyle: "wide", feetStyle: "pill", accessory: "badge", primaryColor: "#dc2626", tier: "special" },
  { name: "Enforcer", headStyle: "horns", eyeStyle: "angry", bodyStyle: "tall", feetStyle: "split", accessory: "antenna", primaryColor: "#f97316", tier: "special" },
] as const;

export default ShapeCharacter;
