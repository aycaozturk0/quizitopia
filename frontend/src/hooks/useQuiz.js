import { useState, useCallback, useRef } from "react";
import { api } from "../utils/api.js";
import { useUser } from "../context/UserContext.jsx";

const TIMER_SECONDS = 60;

/**
 * Quiz oturumu için tam state makinesi.
 * QuizPage bu hook'u kullanır; ZenMode sadece prop alır.
 */
export function useQuiz() {
  const { user, updateUserXP } = useUser();

  const [questions,      setQuestions]      = useState([]);
  const [currentIdx,     setCurrentIdx]     = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered,       setAnswered]       = useState(false);
  const [result,         setResult]         = useState(null);
  const [streak,         setStreak]         = useState(0);
  const [sessionXP,      setSessionXP]      = useState(0);
  const [score,          setScore]          = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [phase,          setPhase]          = useState("config"); // config | quiz | result

  // Timer state (controlled externally via timerRef tick)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  // ── Start quiz ─────────────────────────────────────────────────────────────
  const startQuiz = useCallback(async (config) => {
    setLoading(true);
    const qs = await api.getQuestions(config);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setSessionXP(0);
    setStreak(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setResult(null);
    setPhase("quiz");
    startTimer();
    setLoading(false);
  }, [startTimer]);

  // ── Submit answer ──────────────────────────────────────────────────────────
  const submitAnswer = useCallback(async (letter) => {
    if (answered) return;
    stopTimer();
    setSelectedAnswer(letter);
    setAnswered(true);

    const q         = questions[currentIdx];
    const timeSpent = TIMER_SECONDS - timeLeft;

    const res = await api.submitAnswer({
      user_id:     user.id,
      question_id: q.id,
      answer:      letter,
      time_spent:  timeSpent,
      question:    q,
    });

    setResult(res);

    if (res.correct) {
      setScore(p => p + 1);
      setStreak(p => p + 1);
    } else {
      setStreak(0);
    }

    setSessionXP(p => p + (res.xp_earned || 0));
    updateUserXP(
      res.xp_earned,
      res.badges_earned || [],
      res.current_xp,
      res.current_level,
    );
  }, [answered, questions, currentIdx, timeLeft, user.id, updateUserXP, stopTimer]);

  // ── Next question ──────────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setPhase("result");
      return;
    }
    setCurrentIdx(p => p + 1);
    setSelectedAnswer(null);
    setAnswered(false);
    setResult(null);
    startTimer();
  }, [currentIdx, questions.length, startTimer]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetQuiz = useCallback(() => {
    stopTimer();
    setPhase("config");
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setResult(null);
    setStreak(0);
    setSessionXP(0);
    setScore(0);
  }, [stopTimer]);

  return {
    // State
    phase, questions, currentIdx,
    currentQuestion: questions[currentIdx] ?? null,
    selectedAnswer, answered, result,
    streak, sessionXP, score, loading,
    timeLeft,
    totalQuestions: questions.length,
    // Actions
    startQuiz, submitAnswer, nextQuestion, resetQuiz,
  };
}
