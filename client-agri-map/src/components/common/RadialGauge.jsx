import { useId } from "react";

/**
 * RadialGauge -- a circular progress ring for a single 0-1 score.
 *
 * This is the dashboard's one recurring visual motif: every card that
 * represents a *verified* measurement (vegetation health, soil risk,
 * carbon confidence, finance readiness) reads through the same ring shape,
 * so the eye learns "ring = something AgriMap independently verified"
 * versus the flat list bars used for raw field-to-field comparison.
 */
export default function RadialGauge({
  value, // 0-1
  size = 88,
  strokeWidth = 8,
  color = "#16a34a",
  trackColor = "#e5e7eb",
  children,
}) {
  const gradientId = useId();
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}