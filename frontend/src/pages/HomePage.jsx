import { Link } from "react-router-dom";
import { Zap, Brain, BarChart2, BookOpen, Trophy, ArrowRight } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { XPDisplay, BadgeGrid } from "../components/XPBadge.jsx";

const FEATURES = [
  {
    icon: Brain,
    title: "Zen Modu",
    desc:  "Dikkat dağıtıcısız, tam odaklı test deneyimi. Klavye kısayolları destekli.",
    color: "from-neon-cyan/20 to-cyan-600/10",
    border:"border-neon-cyan/20",
  },
  {
    icon: Zap,
    title: "XP & Rozetler",
    desc:  "Her doğru cevap XP kazandırır. Serideki doğrularla bonus XP yakala!",
    color: "from-neon-pink/20 to-pink-600/10",
    border:"border-neon-pink/20",
  },
  {
    icon: BarChart2,
    title: "Konu Analizi",
    desc:  "Hangi konuda ne kadar başarılısın? Dashboard'dan detaylı raporunu gör.",
    color: "from-purple-600/20 to-purple-800/10",
    border:"border-purple-500/20",
  },
  {
    icon: BookOpen,
    title: "Ders Notları",
    desc:  "Sınav öncesi hızlı tekrar için kategori bazlı ders özetleri.",
    color: "from-green-600/20 to-green-800/10",
    border:"border-green-500/20",
  },
];

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5
                        text-neon-cyan text-xs font-mono tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          YENİ NESIL EĞİTİM PLATFORMU
        </div>
<h1 className="font-display font-black text-5xl md:text-7xl tracking-tight">
          <span className="neon-text">Bilgini</span>
          <br />
          <span className="text-white/90">Test Et</span>
        </h1>

        <p className="text-white/50 font-body text-lg max-w-xl mx-auto leading-relaxed">
          Oyunlaştırılmış quiz deneyimi. XP kazan, rozet topla, liderlik tablosuna çık.
          Sorular otomatik döner, sen sadece odaklan.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/quiz" className="btn-primary flex items-center gap-2">
            <Zap size={18} />
            Quiz'e Başla
          </Link>
          <Link to="/notes" className="btn-ghost flex items-center gap-2">
            <BookOpen size={18} />
            Ders Notları
          </Link>
        </div>
      </section>

      {/* User card */}
      <section className="card p-6 md:p-8 border border-neon-cyan/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/3 to-transparent" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/30 to-neon-pink/30
                            border border-neon-cyan/30 flex items-center justify-center
                            font-display font-bold text-2xl text-neon-cyan">
              {user.username.charAt(0)}
            </div>
            <div>
              <p className="font-display font-bold text-xl text-white">{user.username}</p>
              <p className="text-white/40 text-sm font-mono mt-0.5">
                {user.quiz_count} soru çözüldü
              </p>
            </div>
          </div>
          <div className="w-full md:w-64">
            <XPDisplay xp={user.total_xp} level={user.level} size="md" />
          </div>
        </div>

        {user.badges.length > 0 && (
          <div className="relative mt-6 pt-6 border-t border-white/5">
            <BadgeGrid badges={user.badges} size="sm" />
          </div>
        )}
      </section>

      {/* Feature cards */}
      <section>
        <h2 className="font-display font-bold text-2xl text-white/80 mb-8">
          Özellikler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, border }) => (
            <div
              key={title}
              className={`card-glow p-6 bg-gradient-to-br ${color} ${border} space-y-3`}
            >
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                <Icon size={20} className="text-neon-cyan" />
              </div>
              <h3 className="font-display font-bold text-white">{title}</h3>
              <p className="text-white/50 text-sm font-body leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { to: "/quiz",        icon: Brain,    label: "Quiz Başlat",   sub: "300 soru" },
          { to: "/leaderboard", icon: Trophy,   label: "Liderlik",      sub: "Sıralamana bak" },
          { to: "/dashboard",   icon: BarChart2,label: "İstatistikler", sub: "Gelişimini gör" },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="card p-5 flex items-center gap-4 hover:border-neon-cyan/20 hover:bg-neon-cyan/3
                       transition-all duration-300 group"
          >
            <Icon size={20} className="text-white/30 group-hover:text-neon-cyan transition-colors" />
            <div>
              <p className="font-body font-medium text-white/70 group-hover:text-white transition-colors text-sm">
                {label}
              </p>
              <p className="text-xs text-white/30 font-mono">{sub}</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-white/20 group-hover:text-neon-cyan/60
                                             group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </section>
    </div>
  );
}
