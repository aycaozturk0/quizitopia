import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Geri sayım zamanlayıcısı.
 * @param {number} seconds - Başlangıç süresi (saniye)
 * @param {function} onExpire - Süre dolduğunda çağrılır
 */
export function useTimer(seconds, onExpire) {
  const [timeLeft,  setTimeLeft]  = useState(seconds);
  const [running,   setRunning]   = useState(false);
  const intervalRef = useRef(null);
  const expireRef   = useRef(onExpire);
  expireRef.current = onExpire;

  const start = useCallback(() => {
    setTimeLeft(seconds);
    setRunning(true);
  }, [seconds]);

  const stop = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTimeLeft(seconds);
  }, [stop, seconds]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          expireRef.current?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = timeLeft / seconds; // 1.0 → 0.0

  return { timeLeft, running, progress, start, stop, reset };
}
