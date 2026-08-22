import React, { useState } from 'react';
import { CodeBlockData } from '../../types';
import { Code, Copy, Check, Terminal, Eye, Edit3 } from 'lucide-react';
import { PROGRAMMING_LANGUAGES } from '../../utils/blockUtils';
import { CodeBlockView } from '../../components/CodeBlockView';

interface CodeBlockEditorProps {
  block: CodeBlockData;
  onChange: (updated: CodeBlockData) => void;
}

export const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({ block, onChange }) => {
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = block.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key inside code block editor
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newCode = block.code.substring(0, start) + '  ' + block.code.substring(end);
      onChange({ ...block, code: newCode });

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const lineCount = (block.code.match(/\n/g) || []).length + 1;

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#0d1117] overflow-hidden shadow-lg space-y-0">
      {/* Code Header Bar with Language Selector & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#161b22] border-b border-neutral-800 text-xs text-neutral-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Language:
            </span>
          </div>

          {/* Programming Language Dropdown */}
          <select
            value={block.language || 'python'}
            onChange={(e) => onChange({ ...block, language: e.target.value })}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-[#0d1117] text-cyan-300 border border-neutral-700 rounded-md focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-[#161b22] text-neutral-200">
                {lang.label}
              </option>
            ))}
          </select>

          <span className="text-[10px] text-neutral-500 font-mono">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Header Right Actions: Copy, Edit/Preview Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!block.code.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[11px] font-medium disabled:opacity-50"
            title="Copy Pure Code to Clipboard"
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

          <div className="flex items-center bg-neutral-800/80 p-0.5 rounded text-[10px]">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                !previewMode
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                previewMode
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Highlighted</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor or Live Preview View */}
      {!previewMode ? (
        <div className="relative p-3 bg-[#0d1117] flex items-start gap-3 font-mono text-xs sm:text-sm">
          <textarea
            rows={Math.max(6, Math.min(25, lineCount + 1))}
            value={block.code}
            onChange={(e) => onChange({ ...block, code: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={`# Write or paste your ${block.language || 'code'} here...
def example_function():
    print("Hello from block editor!")`}
            spellCheck={false}
            className="w-full p-3 font-mono text-xs sm:text-sm leading-relaxed bg-[#0d1117] text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-y border-0 focus:ring-0 selection:bg-neutral-700"
          />
        </div>
      ) : (
        <div className="p-0">
          <CodeBlockView code={block.code || '# No code written yet'} language={block.language} />
        </div>
      )}
    </div>
  );
};
