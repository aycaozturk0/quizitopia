import { useNavigate }    from "react-router-dom";
import { RotateCcw }      from "lucide-react";
import QuizConfig         from "../components/QuizConfig.jsx";
import ZenMode            from "../components/ZenMode.jsx";
import { XPDisplay }      from "../components/XPBadge.jsx";
import { useQuiz }        from "../hooks/useQuiz.js";
import { useUser }        from "../context/UserContext.jsx";

function QuizResult({ score, total, xpGained, onRestart, onDashboard }) {
  const pct   = total ? Math.round((score / total) * 100) : 0;
  const grade =
    pct >= 90 ? "Mükemmel! 🏆" :
    pct >= 70 ? "Harika! 🔥"   :
    pct >= 50 ? "İyi! 👍"      : "Tekrar dene! 💪";

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-8 animate-pop px-6">
      <div className="font-display font-black text-7xl neon-text">{pct}%</div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{grade}</p>
        <p className="text-white/50 font-mono mt-2">{score} / {total} doğru</p>
        {xpGained > 0 && (
          <p className="text-neon-cyan font-display font-bold text-lg mt-3">
            +{xpGained} XP kazandın!
          </p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={onRestart} className="btn-primary flex items-center gap-2">
          <RotateCcw size={16} /> Tekrar
        </button>
        <button onClick={onDashboard} className="btn-ghost">Dashboard</button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { user, zenMode, toggleZenMode } = useUser();

  const {
    phase, currentQuestion, currentIdx, totalQuestions,
    selectedAnswer, answered, result, streak, sessionXP,
    score, loading, timeLeft,
    startQuiz, submitAnswer, nextQuestion, resetQuiz,
  } = useQuiz();

  const handleStart = async (config) => {
    await startQuiz(config);
    if (!zenMode) toggleZenMode();
  };

  const handleNext = () => {
    const isLast = currentIdx + 1 >= totalQuestions;
    nextQuestion();
    if (isLast && zenMode) toggleZenMode();
  };

  const handleExit = () => {
    if (zenMode) toggleZenMode();
    resetQuiz();
  };

  if (zenMode && phase === "quiz" && currentQuestion) {
    return (
      <ZenMode
        question={currentQuestion}
        questionIndex={currentIdx}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        selectedAnswer={selectedAnswer}
        answered={answered}
        onSelectAnswer={submitAnswer}
        onNext={handleNext}
        onExit={handleExit}
        result={result}
        streak={streak}
      />
    );
  }

  if (phase === "config") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 animate-slide-up">
        <div>
          <h1 className="font-display font-black text-4xl neon-text">Quiz</h1>
          <p className="text-white/40 font-body mt-2">Kategori ve zorluk seç, Zen Modda başla.</p>
        </div>
        <div className="card p-8">
          {loading ? (
            <div className="text-center py-10 text-neon-cyan font-mono animate-pulse">Sorular yükleniyor...</div>
          ) : (
            <QuizConfig onStart={handleStart} />
          )}
        </div>
        <div className="card p-6">
          <XPDisplay xp={user.total_xp} level={user.level} />
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <QuizResult
        score={score}
        total={totalQuestions}
        xpGained={sessionXP}
        onRestart={resetQuiz}
        onDashboard={() => navigate("/dashboard")}
      />
    );
  }

  return null;
}
