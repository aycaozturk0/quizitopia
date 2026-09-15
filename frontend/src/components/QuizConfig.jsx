import { useState, useEffect } from "react";
import { Zap, Shield, Filter, Shuffle } from "lucide-react";
import { api } from "../utils/api.js";

const CATEGORY_META = {
  "C++":          { icon: "⚡", color: "text-cyan-400" },
  SQL:            { icon: "🗄️", color: "text-blue-400" },
  JAVA:           { icon: "☕", color: "text-amber-400" },
  BILGI:          { icon: "🛡️", color: "text-green-400" },
  PYSORU:         { icon: "🐍", color: "text-yellow-400" },
  "PYSORUORTAA.HTML": { icon: "🐍", color: "text-yellow-400" },
  PHP:            { icon: "🐘", color: "text-purple-400" },
  CSHARP:         { icon: "💠", color: "text-blue-300" },
  HT:             { icon: "🌐", color: "text-orange-400" },
  RUBY:           { icon: "💎", color: "text-red-400" },
  C:              { icon: "🔧", color: "text-gray-400" },
};

const DIFFICULTIES = [
  { value: "",      label: "Tümü",  color: "text-white/70" },
  { value: "Kolay", label: "Kolay", color: "text-green-400" },
  { value: "Orta",  label: "Orta",  color: "text-yellow-400" },
  { value: "Zor",   label: "Zor",   color: "text-red-400" },
];

const ALL_COUNTS = [5, 10, 20, 30];

export default function QuizConfig({ onStart }) {
  const [categories,    setCategories]    = useState([]);
  const [selected,      setSelected]      = useState({ kategori: "", zorluk: "", count: 10 });
  const [availableCount, setAvailableCount] = useState(null); // null = henüz hesaplanmadı

  // Kategorileri yükle
  useEffect(() => {
    api.getCategories().then(cats => setCategories(cats.filter(c => !c.includes("."))));
  }, []);

  // Kategori veya zorluk değişince mevcut soru sayısını hesapla
  useEffect(() => {
    let cancelled = false;
    api.getQuestions({
      kategori: selected.kategori || undefined,
      zorluk:   selected.zorluk   || undefined,
      limit:    1000,
      shuffle:  false,
    }).then(questions => {
      if (cancelled) return;
      const total = questions?.length ?? 0;
      setAvailableCount(total);

      // Eğer seçili count artık geçerli değilse en yakın geçerli değere ayarla
      setSelected(prev => {
        const validCounts = ALL_COUNTS.filter(n => n <= total);
        if (validCounts.length === 0) return { ...prev, count: 0 };
        if (!validCounts.includes(prev.count)) {
          return { ...prev, count: validCounts[validCounts.length - 1] };
        }
        return prev;
      });
    });
    return () => { cancelled = true; };
  }, [selected.kategori, selected.zorluk]);

  // Geçerli count seçenekleri: availableCount'u aşmayanlar
  const validCounts = availableCount !== null
    ? ALL_COUNTS.filter(n => n <= availableCount)
    : ALL_COUNTS;

  const handleStart = () => {
    onStart({
      kategori: selected.kategori || undefined,
      zorluk:   selected.zorluk   || undefined,
      limit:    selected.count,
    });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Category grid */}
      <div>
        <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-4">
          <Filter size={12} className="inline mr-2" />
          Kategori
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {/* All option */}
          <button
            onClick={() => setSelected(p => ({ ...p, kategori: "" }))}
            className={`p-4 rounded-xl border text-left transition-all duration-200
              ${!selected.kategori
                ? "border-neon-cyan/50 bg-neon-cyan/10 shadow-neon"
                : "border-white/10 bg-dark-700/50 hover:border-white/20"
              }`}
          >
            <div className="text-2xl mb-1">🎲</div>
            <div className="text-xs font-display font-semibold text-white/70">Karışık</div>
          </button>

          {categories.map(cat => {
            const meta = CATEGORY_META[cat] || { icon: "📚", color: "text-white/60" };
            const active = selected.kategori === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelected(p => ({ ...p, kategori: cat }))}
                className={`p-4 rounded-xl border text-left transition-all duration-200
                  ${active
                    ? "border-neon-cyan/50 bg-neon-cyan/10 shadow-neon"
                    : "border-white/10 bg-dark-700/50 hover:border-white/20"
                  }`}
              >
                <div className="text-2xl mb-1">{meta.icon}</div>
                <div className={`text-xs font-display font-semibold ${active ? "text-neon-cyan" : meta.color}`}>
                  {cat}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-4">
          <Shield size={12} className="inline mr-2" />
          Zorluk Seviyesi
        </label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              onClick={() => setSelected(p => ({ ...p, zorluk: d.value }))}
              className={`px-5 py-2.5 rounded-xl border text-sm font-display font-semibold tracking-wider
                transition-all duration-200
                ${selected.zorluk === d.value
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                  : `border-white/10 bg-dark-700/50 ${d.color} hover:border-white/20`
                }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div>
        <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-4">
          <Shuffle size={12} className="inline mr-2" />
          Soru Sayısı
          {availableCount !== null && (
            <span className="ml-2 normal-case font-mono text-white/25 text-[10px]">
              (bu filtre için {availableCount} soru mevcut)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_COUNTS.map(n => {
            const disabled = availableCount !== null && n > availableCount;
            return (
              <button
                key={n}
                disabled={disabled}
                onClick={() => !disabled && setSelected(p => ({ ...p, count: n }))}
                className={`px-6 py-2.5 rounded-xl border text-sm font-display font-bold
                  transition-all duration-200
                  ${disabled
                    ? "border-white/5 bg-dark-700/20 text-white/20 cursor-not-allowed"
                    : selected.count === n
                      ? "border-neon-pink/50 bg-neon-pink/10 text-neon-pink shadow-neon-pink"
                      : "border-white/10 bg-dark-700/50 text-white/60 hover:border-white/20"
                  }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!validCounts.length}
        className="w-full py-4 rounded-2xl font-display font-bold text-base tracking-wider
                   bg-gradient-to-r from-neon-cyan via-cyan-400 to-neon-pink text-dark-900
                   hover:shadow-neon transition-all duration-300 hover:scale-[1.02]
                   active:scale-[0.98] flex items-center justify-center gap-3
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Zap size={20} />
        Zen Modda Başla
      </button>
    </div>
  );
}
