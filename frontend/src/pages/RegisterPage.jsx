import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { CircleHelp, Sparkles } from "lucide-react";
export default function RegisterPage() {
  const { register } = useUser();
  const quiztopiaLogo = "";

  const [step, setStep] = useState("form"); // "form" | "verify"
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.email || !form.password) {
      setError("Tüm alanlar zorunludur.");
      return;
    }
    if (form.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const result = await register(form.email, form.password, form.username.trim());
    if (result?.error) {
      setError(result.error);
    } else {
      setStep("verify");
    }
    setLoading(false);
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex justify-center mb-8">
            <img src={quiztopiaLogo} alt="Quiztopia" className="h-20 w-auto" />
          </div>
          <div className="card p-8 border border-white/10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30
                            flex items-center justify-center mx-auto">
              <Mail size={28} className="text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">E-postanı Doğrula</h1>
              <p className="text-white/50 text-sm font-body leading-relaxed">
                <span className="text-neon-cyan font-semibold">{form.email}</span> adresine bir
                doğrulama bağlantısı gönderdik. Gelen kutunu kontrol et ve bağlantıya tıkla.
              </p>
            </div>
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 text-left">
              <CheckCircle size={15} className="text-neon-cyan flex-shrink-0 mt-0.5" />
              <p className="text-white/50 text-xs font-body leading-relaxed">
                Doğrulama e-postası bazen spam klasörüne düşebilir. Bulamazsan spam kutunu kontrol et.
              </p>
            </div>
            <p className="text-center text-sm text-white/40 font-body">
              Zaten hesabın var mı?{" "}
              <Link to="/login" className="text-neon-cyan hover:text-cyan-300 font-semibold transition-colors">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex justify-center mb-8">
          <img src={quiztopiaLogo} alt="Quiztopia" className="h-20 w-auto" />
        </div>

        <div className="card p-8 border border-white/10 space-y-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Kayıt Ol</h1>
            <p className="text-white/40 text-sm font-body">Ücretsiz hesap oluştur, quize başla.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="QuizMaster42"
                className="w-full px-4 py-3 rounded-xl bg-dark-700/80 border border-white/10
                           text-white placeholder-white/20 text-sm font-body
                           focus:outline-none focus:border-neon-cyan/50 focus:bg-dark-700
                           transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-2">
                E-posta
              </label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 rounded-xl bg-dark-700/80 border border-white/10
                           text-white placeholder-white/20 text-sm font-body
                           focus:outline-none focus:border-neon-cyan/50 focus:bg-dark-700
                           transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="En az 6 karakter"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-dark-700/80 border border-white/10
                             text-white placeholder-white/20 text-sm font-body
                             focus:outline-none focus:border-neon-cyan/50 focus:bg-dark-700
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-display font-semibold tracking-widest text-white/40 uppercase mb-2">
                Şifre Tekrar
              </label>
              <input
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-dark-700/80 border border-white/10
                           text-white placeholder-white/20 text-sm font-body
                           focus:outline-none focus:border-neon-cyan/50 focus:bg-dark-700
                           transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider
                         bg-gradient-to-r from-neon-cyan via-cyan-400 to-neon-pink text-dark-900
                         hover:shadow-neon transition-all duration-300 hover:scale-[1.02]
                         active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 font-body">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="text-neon-cyan hover:text-cyan-300 font-semibold transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
