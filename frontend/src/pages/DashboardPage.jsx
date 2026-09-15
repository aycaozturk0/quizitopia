import { useState, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart2, Target, Zap, BookOpen } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { XPDisplay, BadgeGrid } from "../components/XPBadge.jsx";
import { api } from "../utils/api.js";

const CATEGORY_LABELS = {
  "C++":   "C++",  SQL: "SQL",  JAVA: "Java",
  BILGI:   "Güvenlik", PYSORU: "Python",
  PHP:     "PHP",  CSHARP: "C#", HT: "HTML",
  RUBY:    "Ruby", C: "C",
};

const NEON_COLORS = [
  "#00f5ff", "#ff2d9b", "#39ff14", "#bf00ff",
  "#ff6b00", "#00ff9f", "#ffdd00", "#4d79ff",
];

function StatCard({ icon: Icon, label, value, sub, color = "text-neon-cyan" }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs font-display tracking-widest uppercase">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className={`font-display font-black text-3xl ${color}`}>{value}</div>
      {sub && <div className="text-white/30 text-xs font-mono">{sub}</div>}
    </div>
  );
}

function TopicBar({ data }) {
  const chartData = Object.entries(data).map(([cat, vals], i) => ({
    name:    CATEGORY_LABELS[cat] || cat,
    doğru:   vals.correct,
    yanlış:  vals.total - vals.correct,
    pct:     vals.pct,
    color:   NEON_COLORS[i % NEON_COLORS.length],
  }));

  if (!chartData.length) return (
    <div className="text-center py-12 text-white/30 font-mono text-sm">
      Henüz veri yok. Quiz çözmeye başla!
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barSize={20} barGap={4}>
        <XAxis
          dataKey="name"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(13,18,32,0.95)",
            border:     "1px solid rgba(0,245,255,0.2)",
            borderRadius: "12px",
            fontFamily: "DM Sans",
            fontSize:   "12px",
            color:      "#fff",
          }}
          formatter={(value, name) => [value, name === "doğru" ? "✓ Doğru" : "✗ Yanlış"]}
        />
        <Bar dataKey="doğru"  radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.9} />
          ))}
        </Bar>
        <Bar dataKey="yanlış" radius={[4, 4, 0, 0]} fill="rgba(255,255,255,0.08)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopicRadar({ data }) {
  const chartData = Object.entries(data).slice(0, 8).map(([cat, vals]) => ({
    subject: CATEGORY_LABELS[cat] || cat,
    pct:     vals.pct,
    fullMark: 100,
  }));

  if (chartData.length < 3) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "DM Sans" }}
        />
        <Radar
          name="Başarı %"
          dataKey="pct"
          stroke="#00f5ff"
          fill="#00f5ff"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUserStats(user.id).then(s => {
      setStats(s);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-neon-cyan font-mono animate-pulse">
      İstatistikler yükleniyor...
    </div>
  );

  const accuracy  = stats?.accuracy ?? 0;
  const breakdown = stats?.topic_breakdown ?? {};

  // Weak topics (pct < 60)
  const weakTopics = Object.entries(breakdown)
    .filter(([, v]) => v.pct < 60)
    .sort((a, b) => a[1].pct - b[1].pct)
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-4xl neon-text">Dashboard</h1>
          <p className="text-white/40 font-body mt-2">Gelişim raporun</p>
        </div>
        <BarChart2 size={28} className="text-neon-cyan/30 mt-2" />
      </div>

      {/* XP Card */}
      <div className="card p-6 border border-neon-cyan/10">
        <XPDisplay xp={user.total_xp} level={user.level} size="lg" />
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-white/30">
          <span>Sonraki seviye için:</span>
          <span className="text-neon-cyan">
            {Math.round((1 - api.getLevelProgress(user.total_xp)) * 100)}% kaldı
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Target}
          label="Doğruluk"
          value={`${accuracy}%`}
          sub={`${stats?.correct_count ?? 0} doğru / ${stats?.quiz_count ?? 0} soru`}
          color={accuracy >= 70 ? "text-neon-green" : accuracy >= 50 ? "text-yellow-400" : "text-red-400"}
        />
        <StatCard
          icon={Zap}
          label="Toplam XP"
          value={(stats?.total_xp ?? 0).toLocaleString()}
          color="text-neon-cyan"
        />
        <StatCard
          icon={BookOpen}
          label="Çözülen Soru"
          value={stats?.quiz_count ?? 0}
          color="text-purple-400"
        />
        <StatCard
          icon={BarChart2}
          label="Seviye"
          value={user.level}
          color="text-neon-pink"
        />
      </div>

      {/* Charts */}
      {Object.keys(breakdown).length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-bold text-white/80 text-sm tracking-wider uppercase">
              Konu Bazlı Başarı
            </h2>
            <TopicBar data={breakdown} />
          </div>

          {Object.keys(breakdown).length >= 3 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-bold text-white/80 text-sm tracking-wider uppercase">
                Radar Analizi
              </h2>
              <TopicRadar data={breakdown} />
            </div>
          )}
        </div>
      )}

      {/* Topic breakdown table */}
      {Object.keys(breakdown).length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-display font-bold text-white/80 text-sm tracking-wider uppercase">
              Konu Detayları
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {Object.entries(breakdown)
              .sort((a, b) => b[1].pct - a[1].pct)
              .map(([cat, vals], i) => (
                <div key={cat} className="px-6 py-4 flex items-center gap-4">
                  <span className="text-white/30 font-mono text-xs w-5">{i + 1}</span>
                  <span className="font-body font-medium text-white/70 w-28 text-sm">
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <div className="flex-1 xp-bar-track">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${vals.pct}%`,
                        background: vals.pct >= 70
                          ? "#39ff14"
                          : vals.pct >= 50
                          ? "#fbbf24"
                          : "#f87171",
                      }}
                    />
                  </div>
                  <span className={`font-mono text-sm font-bold w-12 text-right
                    ${vals.pct >= 70 ? "text-neon-green" : vals.pct >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {vals.pct}%
                  </span>
                  <span className="text-white/20 font-mono text-xs w-16 text-right">
                    {vals.correct}/{vals.total}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div className="card p-6 border border-neon-pink/10 space-y-4">
          <h2 className="font-display font-bold text-neon-pink text-sm tracking-wider uppercase">
            ⚠ Güçlendirmen Gereken Konular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weakTopics.map(([cat, vals]) => (
              <div key={cat} className="p-4 rounded-xl bg-neon-pink/5 border border-neon-pink/10">
                <p className="font-display font-bold text-white/80 text-sm">
                  {CATEGORY_LABELS[cat] || cat}
                </p>
                <p className="text-red-400 font-mono text-2xl font-black mt-1">{vals.pct}%</p>
                <p className="text-white/30 font-mono text-xs">{vals.correct}/{vals.total} doğru</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display font-bold text-white/80 text-sm tracking-wider uppercase">
          Rozetlerim
        </h2>
        <BadgeGrid badges={user.badges} />
      </div>
    </div>
  );
}
