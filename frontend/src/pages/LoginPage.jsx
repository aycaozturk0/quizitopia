import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { CircleHelp, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login } = useUser();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("E-posta ve şifre alanları zorunludur.");
      return;
    }
    setLoading(true);
    const result = await login(form.email, form.password);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
     
     {/* Logo */}
<div className="flex justify-center mb-8">

  <div className="flex items-center gap-3">

    <div className="relative flex items-center justify-center w-14 h-14">

      {/* dış halka */}
      <div
        className="
        absolute w-14 h-14 rounded-full
        border-2 border-neon-cyan
        opacity-60
      "
      />

      {/* iç ikon alanı */}
      <div
        className="
        w-10 h-10 rounded-xl
        bg-gradient-to-br
        from-neon-cyan
        to-neon-pink
        flex items-center justify-center
        rotate-12
      "
      >
        <CircleHelp
          size={22}
          className="text-dark-900 -rotate-12"
        />
      </div>

      {/* küçük parıltı */}
      <Sparkles
        size={13}
        className="
        absolute
        -top-1
        -right-1
        text-neon-cyan
        "
      />
    </div>

    <div className="leading-none">
      <div
        className="
        font-display
        font-extrabold
        text-3xl
        tracking-wider
        neon-text
      "
      >
        QUIZITOPIA
      </div>

      <div
        className="
        text-[9px]
        opacity-70
        tracking-[0.35em]
      "
      >
        PLAY • LEARN • LEVEL UP
      </div>
    </div>

  </div>

</div>

        <div className="card p-8 border border-white/10 space-y-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Giriş Yap</h1>
            <p className="text-white/40 text-sm font-body">Hesabına giriş yap ve quize devam et.</p>
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
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
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
                <LogIn size={16} />
              )}
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 font-body">
            Hesabın yok mu?{" "}
            <Link to="/register" className="text-neon-cyan hover:text-cyan-300 font-semibold transition-colors">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
