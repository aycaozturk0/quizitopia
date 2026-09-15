import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

const LANGUAGE_LABELS = {
  cpp: "C++", java: "Java", python: "Python", sql: "SQL",
  html: "HTML", javascript: "JavaScript", c: "C", php: "PHP",
  csharp: "C#", ruby: "Ruby",
};

export default function CodeBlock({ code, language = "plaintext" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: "rgba(13, 18, 32, 0.8)",
      margin:     0,
      padding:    "1.25rem",
      fontSize:   "0.85rem",
      lineHeight: "1.7",
      fontFamily: "'JetBrains Mono', monospace",
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: "'JetBrains Mono', monospace",
    },
  };

  return (
    <div className="syntax-block rounded-xl border border-white/10 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Window dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="font-mono text-xs text-white/30 tracking-wider">
            {LANGUAGE_LABELS[language] || language.toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-mono text-white/30
                     hover:text-neon-cyan transition-colors duration-200"
        >
          {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers
        lineNumberStyle={{
          color: "rgba(255,255,255,0.15)",
          fontSize: "0.75rem",
          minWidth: "2.5em",
          userSelect: "none",
        }}
        wrapLongLines
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
