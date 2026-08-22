import React from 'react';
import { QuoteBlock } from '../../types';
import { Quote, User } from 'lucide-react';

interface QuoteBlockEditorProps {
  block: QuoteBlock;
  onChange: (updated: QuoteBlock) => void;
}

export const QuoteBlockEditor: React.FC<QuoteBlockEditorProps> = ({ block, onChange }) => {
  return (
    <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-2">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-black uppercase tracking-wider text-purple-950 dark:text-purple-300">
            Quote / Callout Block
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900/70 dark:text-purple-300/70 mb-1">
          Quote Text
        </label>
        <textarea
          rows={3}
          value={block.quote}
          onChange={(e) => onChange({ ...block, quote: e.target.value })}
          placeholder="“Simplicity is prerequisite for reliability.”"
          className="w-full p-3 font-serif italic text-base leading-relaxed bg-white dark:bg-zinc-950 border border-purple-200 dark:border-purple-900/80 rounded-lg text-neutral-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900/70 dark:text-purple-300/70 mb-1 flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>Author / Attribution (Optional)</span>
        </label>
        <input
          type="text"
          value={block.author || ''}
          onChange={(e) => onChange({ ...block, author: e.target.value })}
          placeholder="e.g. Edsger W. Dijkstra, Turing Award Winner"
          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-purple-200 dark:border-purple-900/80 rounded-lg text-neutral-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-500"
        />
      </div>
    </div>
  );
};
