import React from 'react';

interface AshokaChakraProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * 24-Spoke Ashoka Chakra Pure SVG Component
 * Represents the Dharma Chakra emblem in clean statutory navy blue.
 */
export function AshokaChakra({
  className = '',
  size = 24,
  color = '#1e3a8a', // Deep statutory navy
}: AshokaChakraProps) {
  // Generate 24 spokes (360 / 24 = 15 degrees per spoke)
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Ashoka Chakra Emblem"
    >
      {/* Outer Ring */}
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="4" />
      {/* Intermediate Rim Ring */}
      <circle cx="50" cy="50" r="41" stroke={color} strokeWidth="1.5" strokeDasharray="1.5 2.5" />
      {/* Inner Hub Outer Rim */}
      <circle cx="50" cy="50" r="14" stroke={color} strokeWidth="2.5" />
      {/* Center Hub Solid Dot */}
      <circle cx="50" cy="50" r="6" fill={color} />

      {/* 24 Spokes */}
      {spokes.map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="8"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Subtle spoke arrowhead detail */}
          <circle cx="50" cy="11" r="1.2" fill={color} />
        </g>
      ))}
    </svg>
  );
}
