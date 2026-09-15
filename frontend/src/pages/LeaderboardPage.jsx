import { useState, useEffect } from "react";
import { Trophy, Crown, Zap } from "lucide-react";
import { api } from "../utils/api.js";
import { useUser } from "../context/UserContext.jsx";

const PERIOD_OPTIONS = [
  { value: "weekly",  label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
  { value: "alltime", label: "Tüm Zamanlar" },
];

const RANK_STYLES = {
  1: { bg: "from-yellow-600/20 to-yellow-800/10", border: "border-yellow-500/40",  icon: "🥇", text: "text-yellow-400" },
  2: { bg: "from-gray-500/20 to-gray-700/10",     border: "border-gray-400/40",    icon: "🥈", text: "text-gray-300" },
  3: { bg: "from-amber-700/20 to-amber-900/10",   border: "border-amber-600/40",   icon: "🥉", text: "text-amber-500" },
};

export default function LeaderboardPage() {
  const { user }    = useUser();
  const [period,    setPeriod]    = useState("weekly");
  const [board,     setBoard]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(period).then(data => {
      setBoard(data);
      setLoading(false);
    });
  }, [period]);

  const top3  = board.slice(0, 3);
  const rest  = board.slice(3);
  const myRank = board.findIndex(e => e.username === user.username) + 1;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-4xl neon-text">Liderlik</h1>
          <p className="text-white/40 font-body mt-2">En yüksek XP'ye sahip oyuncular</p>
        </div>
        <Trophy size={28} className="text-yellow-400/50 mt-2" />
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map(o => (
          <button
            key={o.value}
            onClick={() => setPeriod(o.value)}
            className={`px-4 py-2 rounded-xl text-sm font-display font-semibold tracking-wider
              border transition-all duration-200
              ${period === o.value
                ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-dark-700/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3 animate-slide-up">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
                const actualRank = entry.rank;
                const style = RANK_STYLES[actualRank];
                const isCenter = actualRank === 1;
                return (
                  <div
                    key={entry.username}
                    className={`card bg-gradient-to-b ${style.bg} ${style.border}
                      flex flex-col items-center justify-end text-center p-4
                      ${isCenter ? "col-start-2 row-start-1" : ""}
                      transition-all hover:scale-105`}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className={`w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center
                                    font-display font-bold text-lg mb-2 border ${style.border} ${style.text}`}>
                      {entry.username.charAt(0)}
                    </div>
                    <p className={`font-display font-bold text-sm ${style.text}`}>{entry.username}</p>
                    <p className="font-mono text-xs text-white/40 mt-0.5">{entry.xp.toLocaleString()} XP</p>
                    {entry.badges?.slice(0, 2).map((b, bi) => (
                      <span key={bi} className="text-sm">{b}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
              <span className="text-xs font-display tracking-widest text-white/30 uppercase">Sıralama</span>
            </div>
            <div className="divide-y divide-white/5">
              {board.map((entry) => {
                const isMe = entry.username === user.username;
                return (
                  <div
                    key={entry.username}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors
                      ${isMe ? "bg-neon-cyan/5" : "hover:bg-dark-700/30"}`}
                  >
                    {/* Rank */}
                    <div className={`w-8 text-center font-display font-bold text-sm
                      ${entry.rank === 1 ? "text-yellow-400" :
                        entry.rank === 2 ? "text-gray-300" :
                        entry.rank === 3 ? "text-amber-600" : "text-white/30"}`}>
                      {entry.rank <= 3
                        ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                        : entry.rank
                      }
                    </div>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                      font-display font-bold text-sm
                      ${isMe
                        ? "bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan"
                        : "bg-dark-600 border border-white/10 text-white/60"
                      }`}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + level */}
                    <div className="flex-1">
                      <p className={`font-body font-medium text-sm ${isMe ? "text-neon-cyan" : "text-white/80"}`}>
                        {entry.username}
                        {isMe && <span className="ml-2 text-xs text-neon-cyan/50">(sen)</span>}
                      </p>
                      <p className="text-white/30 font-mono text-xs">{entry.level}</p>
                    </div>

                    {/* Badges */}
                    <div className="hidden sm:flex gap-1">
                      {(entry.badges || []).slice(0, 3).map((b, i) => (
                        <span key={i} className="text-sm">{b}</span>
                      ))}
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="font-display font-bold text-sm text-neon-cyan flex items-center gap-1">
                        <Zap size={12} />
                        {entry.xp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My rank callout */}
          {myRank > 0 && (
            <div className="card p-4 border border-neon-cyan/20 bg-neon-cyan/5 text-center">
              <p className="text-neon-cyan font-display font-bold text-sm">
                Sen şu an <Crown size={14} className="inline mx-1" /> #{myRank}. sıradasın!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
