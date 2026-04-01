"use client";

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function InkAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const h = nameHash(name);
  const char = name.charAt(0);
  const hue1 = (h % 60) + 20;
  const hue2 = ((h >> 8) % 40) + 30;
  const brushX = 30 + (h % 40);
  const brushY = 25 + ((h >> 4) % 30);
  const r1 = 15 + (h % 20);
  const r2 = 10 + ((h >> 6) % 15);
  const opacity1 = 0.15 + ((h % 10) / 40);
  const opacity2 = 0.1 + (((h >> 3) % 10) / 50);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-full">
      <defs>
        <radialGradient id={`ink-${h}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 30%, 92%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2}, 25%, 85%)`} />
        </radialGradient>
        <filter id={`blur-${h}`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#ink-${h})`} />
      <circle cx={brushX} cy={brushY} r={r1} fill={`hsla(${hue1}, 20%, 40%, ${opacity1})`} filter={`url(#blur-${h})`} />
      <circle cx={100 - brushX} cy={100 - brushY} r={r2} fill={`hsla(${hue2}, 15%, 50%, ${opacity2})`} filter={`url(#blur-${h})`} />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="36"
        fontFamily="serif"
        fill="#2C1810"
        opacity="0.85"
      >
        {char}
      </text>
    </svg>
  );
}
