/**
 * Dairesel geri sayım göstergesi.
 * Props:
 *   timeLeft   - kalan saniye
 *   totalTime  - başlangıç saniyesi
 *   size       - SVG boyutu (default 64)
 */
export default function TimerRing({ timeLeft, totalTime = 60, size = 64 }) {
  const radius      = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress    = timeLeft / totalTime;           // 1 → 0
  const strokeDash  = circumference * (1 - progress); // offset

  const color =
    timeLeft > totalTime * 0.5  ? "#00f5ff" :
    timeLeft > totalTime * 0.25 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
      </svg>
      {/* Number */}
      <div
        className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm"
        style={{ color }}
      >
        {timeLeft}
      </div>
    </div>
  );
}
