import { useEffect, useCallback } from "react";
import { Minimize2, Zap } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import CodeBlock from "./CodeBlock.jsx";
import TimerRing from "./TimerRing.jsx";

// Detect if question contains code
function detectLanguage(text) {
  if (/int\s+main\s*\(/.test(text) || /#include/.test(text))   return "cpp";
  if (/public\s+static\s+void\s+main/.test(text))               return "java";
  if (/def\s+\w+\s*\(/.test(text) || /print\s*\(/.test(text)) return "python";
  if (/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/.test(text))       return "sql";
  if (/<[a-z]+[\s>]/.test(text) || /<!DOCTYPE/.test(text))      return "html";
  if (/function\s+\w+\s*\(|const\s+\w+\s*=/.test(text))        return "javascript";
  return null;
}

function splitQuestionAndCode(soru) {
  // Look for code block patterns
  const codePatterns = [
    /```(\w+)?\n([\s\S]+?)```/,
    /((?:int\s+main|public\s+static|def\s+\w+|SELECT\s+\*)[^]*?)(?:\n\n|$)/,
  ];

  for (const pat of codePatterns) {
    const m = soru.match(pat);
    if (m) {
      const code = m[2] || m[1];
      const text = soru.replace(m[0], "").trim();
      return { text: text || soru, code };
    }
  }
  return { text: soru, code: null };
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function ZenMode({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
  selectedAnswer,
  answered,
  onSelectAnswer,
  onNext,
  onExit,
  result,
  streak,
}) {
  const { user } = useUser();

  // Keyboard shortcuts
  const handleKey = useCallback((e) => {
    if (answered) {
      if (e.key === "Enter" || e.key === "ArrowRight") onNext?.();
      return;
    }
    const keys = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
    const idx = keys[e.key.toLowerCase()];
    if (idx !== undefined && question?.secenekler[idx]) {
      onSelectAnswer(OPTION_LETTERS[idx]);
    }
  }, [answered, onSelectAnswer, onNext, question]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!question) return null;

  const { text, code } = splitQuestionAndCode(question.soru);
  const lang = code ? detectLanguage(question.soru) : null;

  const DIFFICULTY_STYLE = {
    Kolay: "text-green-400 border-green-500/40 bg-green-500/10",
    Orta:  "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
    Zor:   "text-red-400 border-red-500/40 bg-red-500/10",
  };

  const CATEGORY_ICONS = {
    "C++": "⚡", SQL: "🗄️", JAVA: "☕", BILGI: "🛡️",
    PYSORU: "🐍", PHP: "🐘", CSHARP: "💠", HT: "🌐",
    RUBY: "💎", C: "🔧",
  };

  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="zen-mode-active flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-white/40">
            {questionIndex + 1} / {totalQuestions}
          </span>
          <div className="w-48 h-1 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Center info */}
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 text-orange-400 font-display text-sm font-bold">
              <Zap size={14} className="animate-pulse" />
              {streak} seri
            </div>
          )}
          <span className={`level-badge text-xs ${DIFFICULTY_STYLE[question.zorluk]}`}>
            {question.zorluk}
          </span>
          <span className="text-lg">{CATEGORY_ICONS[question.kategori] || "📚"}</span>
          <span className="font-mono text-xs text-white/40">{question.kategori}</span>
        </div>

        {/* Timer + Exit */}
        <div className="flex items-center gap-4">
          {timeLeft !== null && <TimerRing timeLeft={timeLeft} totalTime={60} size={52} />}
          <button
            onClick={onExit}
            className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
            title="Zen Moddan çık (Esc)"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      {/* Question body */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 max-w-3xl mx-auto w-full gap-8">
        {/* Question text */}
        <div className="w-full animate-slide-up">
          <p className="text-xl md:text-2xl font-body font-medium text-white/90 leading-relaxed text-center">
            {text}
          </p>

          {/* Code block */}
          {code && lang && (
            <div className="mt-6">
              <CodeBlock code={code} language={lang} />
            </div>
          )}
        </div>

        {/* Answer options */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.secenekler.map((opt, i) => {
            const letter  = OPTION_LETTERS[i];
            const isSelected = selectedAnswer === letter;
            const correctLetter = question.dogru_cevap?.toUpperCase().replace(/[).]/g, "");
            const isCorrect  = answered && letter === correctLetter;
            const isWrong    = answered && isSelected && letter !== correctLetter;

            return (
              <button
                key={i}
                onClick={() => !answered && onSelectAnswer(letter)}
                disabled={answered}
                className={`relative flex items-start gap-4 p-5 rounded-xl border text-left
                  font-body text-base transition-all duration-200 group
                  ${!answered
                    ? "border-white/10 bg-dark-700/50 hover:border-neon-cyan/40 hover:bg-neon-cyan/5 cursor-pointer"
                    : ""
                  }
                  ${isCorrect ? "answer-correct border-neon-green bg-neon-green/10" : ""}
                  ${isWrong   ? "answer-wrong border-red-500 bg-red-500/10" : ""}
                  ${isSelected && !answered ? "border-neon-cyan/60 bg-neon-cyan/10" : ""}
                `}
              >
                {/* Letter badge */}
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                  font-display font-bold text-sm border transition-colors
                  ${isCorrect  ? "border-neon-green text-neon-green bg-neon-green/20" :
                    isWrong    ? "border-red-400 text-red-400 bg-red-400/20" :
                    isSelected ? "border-neon-cyan text-neon-cyan bg-neon-cyan/20" :
                                 "border-white/20 text-white/50 group-hover:border-neon-cyan/40"}`}>
                  {letter}
                </span>
                <span className={`text-sm leading-relaxed mt-0.5
                  ${isCorrect ? "text-neon-green" : isWrong ? "text-red-300" : "text-white/80"}`}>
                  {/* Strip leading letter prefix from option text */}
                  {opt.replace(/^[a-dA-D][).]?\s*/, "")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result + Next */}
        {answered && (
          <div className="w-full animate-pop">
            <div className={`flex items-center justify-between p-5 rounded-2xl border
              ${result?.correct
                ? "bg-neon-green/5 border-neon-green/30"
                : "bg-red-500/5 border-red-500/30"
              }`}>
              <div>
                <p className={`font-display font-bold text-lg
                  ${result?.correct ? "text-neon-green" : "text-red-400"}`}>
                  {result?.correct ? "✓ Doğru!" : "✗ Yanlış"}
                </p>
                {result?.xp_earned > 0 && (
                  <p className="text-neon-cyan text-sm font-mono mt-1">
                    +{result.xp_earned} XP kazandın
                  </p>
                )}
                {result?.badges_earned?.length > 0 && (
                  <p className="text-neon-pink text-sm mt-1">
                    🏅 {result.badges_earned.join(", ")}
                  </p>
                )}
              </div>

              <button
                onClick={onNext}
                className="btn-primary flex items-center gap-2"
                autoFocus
              >
                {questionIndex + 1 >= totalQuestions ? "Bitir" : "Sonraki →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="py-3 text-center">
        <p className="text-xs font-mono text-white/20">
          {answered ? "Enter → sonraki" : "A B C D veya 1 2 3 4 tuşlarını kullanabilirsin"}
        </p>
      </div>
    </div>
  );
}
