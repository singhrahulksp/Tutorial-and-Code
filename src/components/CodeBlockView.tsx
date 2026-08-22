import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { PROGRAMMING_LANGUAGES } from '../utils/blockUtils';

interface CodeBlockViewProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

// Token categories for lightweight syntax highlighting
function highlightCodeTokens(code: string, language: string = 'text'): React.ReactNode {
  const lang = language.toLowerCase();

  // Keyword sets based on language
  const commonKeywords = new Set([
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
    'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return',
    'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void',
    'while', 'with', 'yield', 'let', 'static', 'enum', 'interface', 'type',
    'from', 'as', 'def', 'elif', 'except', 'pass', 'lambda', 'is', 'not',
    'and', 'or', 'public', 'private', 'protected', 'void', 'int', 'float',
    'double', 'string', 'boolean', 'struct', 'impl', 'fn', 'mut', 'match',
    'select', 'insert', 'update', 'delete', 'where', 'join', 'group', 'by',
    'order', 'having', 'create', 'table', 'alter', 'drop', 'echo', 'die',
  ]);

  const booleanOrNull = new Set(['true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil']);

  const lines = code.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => {
        // Line-level comment check
        const trimmed = line.trim();
        const isComment =
          (lang === 'python' || lang === 'bash' || lang === 'yaml')
            ? trimmed.startsWith('#')
            : (lang === 'sql')
            ? trimmed.startsWith('--')
            : trimmed.startsWith('//');

        if (isComment) {
          return (
            <div key={lineIndex} className="table-row">
              <span className="text-neutral-500 dark:text-neutral-500 italic font-mono selection:bg-neutral-800">
                {line || ' '}
              </span>
            </div>
          );
        }

        // Tokenize line with regex (strings, numbers, words, punctuation)
        const regex = /(".*?"|'.*?'|`.*?`|\/\/.*$|#.*$|--.*$|[a-zA-Z_$][a-zA-Z0-9_$]*|\b\d+(?:\.\d+)?\b|[{}()[\].,;:+\-*/%=<>!&|^~]+|\s+)/g;
        const tokens: React.ReactNode[] = [];
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(line)) !== null) {
          const token = match[0];
          const key = `${lineIndex}-${tokens.length}`;

          if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
            tokens.push(
              <span key={key} className="text-amber-300 dark:text-amber-300 font-medium">
                {token}
              </span>
            );
          } else if (token.startsWith('//') || token.startsWith('#') || token.startsWith('--')) {
            tokens.push(
              <span key={key} className="text-neutral-500 italic">
                {token}
              </span>
            );
          } else if (/^\d+(?:\.\d+)?$/.test(token)) {
            tokens.push(
              <span key={key} className="text-purple-400 dark:text-purple-400">
                {token}
              </span>
            );
          } else if (booleanOrNull.has(token)) {
            tokens.push(
              <span key={key} className="text-rose-400 font-semibold">
                {token}
              </span>
            );
          } else if (commonKeywords.has(token) || (lang === 'python' && ['print', 'len', 'range', 'self'].includes(token))) {
            tokens.push(
              <span key={key} className="text-cyan-400 dark:text-cyan-300 font-semibold">
                {token}
              </span>
            );
          } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(token)) {
            // Types / Classes
            tokens.push(
              <span key={key} className="text-emerald-300 dark:text-emerald-300 font-medium">
                {token}
              </span>
            );
          } else {
            tokens.push(<span key={key}>{token}</span>);
          }

          lastIndex = regex.lastIndex;
        }

        if (tokens.length === 0) {
          tokens.push(<span key="empty"> </span>);
        }

        return (
          <div key={lineIndex} className="table-row leading-relaxed">
            <span className="font-mono">{tokens}</span>
          </div>
        );
      })}
    </>
  );
}

export const CodeBlockView: React.FC<CodeBlockViewProps> = ({
  code,
  language = 'python',
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const matchedLang = PROGRAMMING_LANGUAGES.find(
    (l) => l.value.toLowerCase() === language.toLowerCase()
  );
  const displayLanguage = matchedLang ? matchedLang.label : language.toUpperCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = (code.match(/\n/g) || []).length + 1;

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-[#0d1117] overflow-hidden shadow-lg text-neutral-200">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-[#161b22] text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] font-bold tracking-wider text-neutral-300 uppercase">
            {displayLanguage}
          </span>
          <span className="text-[10px] text-neutral-500 font-normal">
            ({lineCount} {lineCount === 1 ? 'line' : 'lines'})
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy pure code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[11px] font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-[#0d1117] selection:bg-neutral-800 flex items-start gap-4">
        {showLineNumbers && (
          <div className="select-none text-neutral-600 font-mono text-right shrink-0 pr-2 border-r border-neutral-800/80 space-y-0 text-xs">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-x-auto">
          <pre className="text-neutral-100 font-mono m-0 p-0 bg-transparent border-0">
            {highlightCodeTokens(code, language)}
          </pre>
        </div>
      </div>
    </div>
  );
};
