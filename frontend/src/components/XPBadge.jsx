import { api } from "../utils/api.js";

const LEVEL_STYLES = {
  "Çaylak":      { gradient: "from-gray-600 to-gray-500",    glow: "shadow-gray-500/30",    text: "text-gray-300" },
  "Acemi":       { gradient: "from-green-700 to-green-500",  glow: "shadow-green-500/40",   text: "text-green-300" },
  "Orta Seviye": { gradient: "from-blue-700 to-blue-500",    glow: "shadow-blue-500/40",    text: "text-blue-300" },
  "Uzman":       { gradient: "from-purple-700 to-purple-500",glow: "shadow-purple-500/40",  text: "text-purple-300" },
  "Usta":        { gradient: "from-neon-pink to-pink-500",   glow: "shadow-neon-pink/40",   text: "text-pink-300" },
  "Efsane":      { gradient: "from-neon-cyan to-cyan-400",   glow: "shadow-neon/40",        text: "text-neon-cyan" },
};

export function XPDisplay({ xp, level, showBar = true, size = "md" }) {
  const progress = api.getLevelProgress(xp);
  const style    = LEVEL_STYLES[level] || LEVEL_STYLES["Çaylak"];

  const sizes = {
    sm: { text: "text-sm", xp: "text-xs", bar: "h-1.5" },
    md: { text: "text-base", xp: "text-sm", bar: "h-2" },
    lg: { text: "text-xl", xp: "text-base", bar: "h-3" },
  };
  const s = sizes[size];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`font-display font-bold ${s.text} ${style.text}`}>
          {level}
        </span>
        <span className={`font-mono ${s.xp} text-white/50`}>
          {xp.toLocaleString()} XP
        </span>
      </div>
      {showBar && (
        <div className={`xp-bar-track ${s.bar}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

const BADGE_DEFS = {
  "İlk Adım":                { icon: "🎯", color: "border-blue-500/40 bg-blue-500/10" },
  "İlk 100":                 { icon: "💯", color: "border-yellow-500/40 bg-yellow-500/10" },
  "Hatasız Seri":            { icon: "🔥", color: "border-orange-500/40 bg-orange-500/10" },
  "Demir Zihin":             { icon: "🧠", color: "border-purple-500/40 bg-purple-500/10" },
  "SQL Uzmanı":              { icon: "🗄️", color: "border-cyan-500/40 bg-cyan-500/10" },
  "Bilgi Güvenliği Uzmanı":  { icon: "🛡️", color: "border-green-500/40 bg-green-500/10" },
  "C++ Gurusu":              { icon: "⚡", color: "border-neon-cyan/40 bg-neon-cyan/10" },
  "Java Ustası":             { icon: "☕", color: "border-amber-500/40 bg-amber-500/10" },
  "Hız Yıldızı":             { icon: "⚡", color: "border-yellow-400/40 bg-yellow-400/10" },
  "Efsane":                  { icon: "👑", color: "border-neon-cyan/60 bg-neon-cyan/10" },
};

export function BadgeGrid({ badges, size = "md" }) {
  if (!badges?.length) return (
    <p className="text-white/30 text-sm font-body text-center py-6">
      Henüz rozet kazanılmadı. Test çözmeye başla!
    </p>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => {
        const def = BADGE_DEFS[badge] || { icon: "⭐", color: "border-white/20 bg-white/5" };
        return (
          <div
            key={i}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-body
              font-medium transition-all duration-200 hover:scale-105 ${def.color}`}
            title={badge}
          >
            <span className="text-base">{def.icon}</span>
            {size !== "sm" && <span className="text-white/80">{badge}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function StreakBadge({ streak }) {
  if (streak < 2) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                    bg-orange-500/10 border border-orange-500/30 text-orange-400
                    font-display font-bold text-xs animate-pulse-neon">
      🔥 {streak} Seri
    </div>
  );
}
