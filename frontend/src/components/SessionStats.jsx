import { Zap, Target, Clock, TrendingUp } from "lucide-react";

/**
 * Oturum içi anlık istatistik şeridi.
 * ZenMode'un altına veya QuizPage sidebar'ına konabilir.
 */
export default function SessionStats({ score, total, streak, sessionXP, accuracy }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      <Stat icon={Target}    label="Doğruluk"  value={`${pct}%`}      color="text-neon-green" />
      <Stat icon={TrendingUp} label="Seri"     value={streak}          color="text-orange-400" />
      <Stat icon={Zap}        label="XP"       value={`+${sessionXP}`} color="text-neon-cyan" />
      <Stat icon={Clock}      label="Cevap"    value={`${score}/${total}`} color="text-purple-400" />
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className={`${color} opacity-70`} />
      <div>
        <div className={`font-display font-bold text-sm ${color}`}>{value}</div>
        <div className="text-white/25 font-mono text-[10px]">{label}</div>
      </div>
    </div>
  );
}
