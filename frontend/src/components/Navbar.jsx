import { Link, useLocation } from "react-router-dom";
import { Brain, BarChart2, BookOpen, Trophy, Zap, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { api } from "../utils/api.js";
import { Sparkles, CircleHelp } from "lucide-react";


const NAV_LINKS = [
  { to: "/",            label: "Ana Sayfa",  icon: Zap },
  { to: "/quiz",        label: "Quiz",       icon: Brain },
  { to: "/notes",       label: "Notlar",     icon: BookOpen },
  { to: "/dashboard",   label: "Dashboard",  icon: BarChart2 },
  { to: "/leaderboard", label: "Liderlik",   icon: Trophy },
];

const LEVEL_COLORS = {
  "Çaylak":       "border-gray-500 text-gray-400",
  "Acemi":        "border-green-500 text-green-400",
  "Orta Seviye":  "border-blue-500 text-blue-400",
  "Uzman":        "border-purple-500 text-purple-400",
  "Usta":         "border-neon-pink text-neon-pink",
  "Efsane":       "border-neon-cyan text-neon-cyan",
};

export default function Navbar() {
  const { user, logout } = useUser();
  const location = useLocation();

  const progress = api.getLevelProgress(user.total_xp);
  const levelColor = LEVEL_COLORS[user.level] || "border-gray-500 text-gray-400";

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-dark-900/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
       {/* Logo */}
<Link to="/" className="flex items-center gap-3 flex-shrink-0">

          <div className="relative flex items-center justify-center w-12 h-12">

            {/* dış halka */}
            <div className="
      absolute w-12 h-12 rounded-full
      border-2 border-neon-cyan
      opacity-60
    "></div>

            {/* iç kutu */}
            <div className="
      w-9 h-9 rounded-xl
      bg-gradient-to-br
      from-neon-cyan
      to-neon-pink
      flex items-center justify-center
      rotate-12
    ">
              <CircleHelp
                size={18}
                className="text-dark-900 -rotate-12"
              />
            </div>

            {/* küçük yıldız */}
            <Sparkles
              size={12}
              className="
      absolute
      -top-1
      -right-1
      text-neon-cyan
      "
            />
          </div>

          <div className="leading-none">
            <div className="
      font-display
      font-extrabold
      text-2xl
      tracking-wider
      neon-text
    ">
              QUIZITOPIA
            </div>

            <div className="
      text-[8px]
      opacity-70
      tracking-[0.35em]
    ">
              PLAY • LEARN • LEVEL UP
            </div>
          </div>

        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-200
                  ${active
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* User XP */}
        <div className="flex items-center gap-3">
          {/* XP mini bar */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`level-badge ${levelColor}`}>
                {user.level}
              </span>
              <span className="text-white/40">{user.total_xp} XP</span>
            </div>
            <div className="w-32 xp-bar-track">
              <div
                className="xp-bar-fill transition-all duration-700"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-pink/30
                          border border-neon-cyan/30 flex items-center justify-center
                          font-display font-bold text-sm text-neon-cyan">
            {user.username.charAt(0).toUpperCase()}
          </div>

          {/* Logout */}
          {logout && (
            <button
              onClick={logout}
              title="Çıkış Yap"
              className="w-9 h-9 rounded-xl border border-white/10 bg-dark-700/50 flex items-center justify-center
                         text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all duration-200"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 px-2 pb-2 pt-1">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-body
                ${active ? "text-neon-cyan" : "text-white/40"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
