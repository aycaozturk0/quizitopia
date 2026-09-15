import { useState, useEffect } from "react";
import { BookOpen, ChevronRight, ChevronDown, Search } from "lucide-react";
import { api } from "../utils/api.js";

const DERS_ICONS = {
  "Bilgi Güvenliği":         "🛡️",
  "Bilgisayar Ağları":       "🌐",
  "Bilgisayar Teknolojileri":"💻",
  "Gömülü Sistemler":        "⚙️",
  "Nesne Programlama":       "🧩",
  "Veri Tabanı":             "🗄️",
  "Web Tasarım Ve Betik Dili":"🌈",
};

function AccordionItem({ baslik, metin, index }) {
  const [open, setOpen] = useState(index === 0);

  // Format metin: bold for lines ending with :
  const formatted = metin
    .replace(/\n/g, "<br/>")
    .replace(/([^<]+):/g, (m, p1) => {
      // Only bold if short (likely a heading)
      if (p1.length < 40) return `<strong class="text-white/90">${p1}:</strong>`;
      return m;
    });

  return (
    <div className={`border border-white/5 rounded-xl overflow-hidden transition-all duration-300
      ${open ? "border-neon-cyan/20" : "hover:border-white/10"}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors
          ${open ? "bg-neon-cyan/5" : "bg-dark-700/30 hover:bg-dark-700/50"}`}
      >
        <span className="font-body font-medium text-sm text-white/80 pr-4">{baslik}</span>
        {open
          ? <ChevronDown size={16} className="text-neon-cyan flex-shrink-0" />
          : <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 py-4 bg-dark-800/40 border-t border-white/5">
          <div
            className="font-body text-sm text-white/60 leading-relaxed space-y-1 font-mono"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  const [dersListesi, setDersListesi] = useState([]);
  const [selectedDers, setSelectedDers] = useState(null);
  const [dersData,     setDersData]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [noteLoading,  setNoteLoading]  = useState(false);

  useEffect(() => {
    api.getNotes().then(d => { setDersListesi(d); setLoading(false); });
  }, []);

  const handleSelectDers = async (dersAdi) => {
    setSelectedDers(dersAdi);
    setNoteLoading(true);
    setSearch("");
    const data = await api.getNote(dersAdi);
    setDersData(data);
    setNoteLoading(false);
  };

  const filteredIcerikler = dersData?.icerikler?.filter(ic =>
    !search ||
    ic.baslik.toLowerCase().includes(search.toLowerCase()) ||
    ic.metin.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start gap-2 mb-8">
        <div>
          <h1 className="font-display font-black text-4xl neon-text">Ders Notları</h1>
          <p className="text-white/40 font-body mt-2">Hızlı tekrar için yapılandırılmış özetler</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0 space-y-2">
          <p className="text-xs font-display tracking-widest text-white/30 uppercase px-2 mb-3">Dersler</p>

          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-dark-700/50 animate-pulse" />
              ))
            : dersListesi.map(d => (
                <button
                  key={d.ders_adi}
                  onClick={() => handleSelectDers(d.ders_adi)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200
                    ${selectedDers === d.ders_adi
                      ? "bg-neon-cyan/10 border border-neon-cyan/30 shadow-neon"
                      : "bg-dark-700/30 border border-white/5 hover:border-white/15 hover:bg-dark-700/50"
                    }`}
                >
                  <span className="text-xl">{DERS_ICONS[d.ders_adi] || "📚"}</span>
                  <div>
                    <p className={`text-sm font-body font-medium
                      ${selectedDers === d.ders_adi ? "text-neon-cyan" : "text-white/70"}`}>
                      {d.ders_adi}
                    </p>
                    <p className="text-white/30 font-mono text-xs">{d.konu_sayisi} konu</p>
                  </div>
                </button>
              ))
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {!selectedDers ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center gap-4">
              <BookOpen size={48} className="text-white/10" />
              <p className="text-white/30 font-body">Soldan bir ders seç</p>
            </div>
          ) : noteLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-dark-700/50 animate-pulse" />
              ))}
            </div>
          ) : dersData ? (
            <div className="space-y-4 animate-slide-up">
              {/* Ders header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{DERS_ICONS[dersData.ders_adi] || "📚"}</span>
                  <div>
                    <h2 className="font-display font-bold text-xl text-white">
                      {dersData.ders_adi}
                    </h2>
                    <p className="text-white/30 font-mono text-xs">
                      {filteredIcerikler.length} / {dersData.icerikler.length} konu
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Konularda ara..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700/50 border border-white/10
                             text-white/80 font-body text-sm placeholder:text-white/20
                             focus:outline-none focus:border-neon-cyan/30 focus:bg-dark-700/80
                             transition-all duration-200"
                />
              </div>

              {/* Accordion */}
              <div className="space-y-2">
                {filteredIcerikler.map((ic, i) => (
                  <AccordionItem
                    key={i}
                    index={i}
                    baslik={ic.baslik}
                    metin={ic.metin}
                  />
                ))}
                {filteredIcerikler.length === 0 && (
                  <div className="text-center py-10 text-white/30 font-mono text-sm">
                    "{search}" için sonuç bulunamadı
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
