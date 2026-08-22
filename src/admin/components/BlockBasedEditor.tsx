import React from 'react';
import { ArticleBlock, ArticleBlockType } from '../../types';
import { createBlock, calculateBlocksStats } from '../../utils/blockUtils';
import { AddComponentMenu } from './AddComponentMenu';
import { TextBlockEditor } from './TextBlockEditor';
import { ImageBlockEditor } from './ImageBlockEditor';
import { CodeBlockEditor } from './CodeBlockEditor';
import { QuoteBlockEditor } from './QuoteBlockEditor';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Type,
  Image as ImageIcon,
  Code,
  Quote,
  Clock,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BlockBasedEditorProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}

export const BlockBasedEditor: React.FC<BlockBasedEditorProps> = ({ blocks, onChange }) => {
  const stats = calculateBlocksStats(blocks);

  // Add block at specific index
  const handleAddBlock = (type: ArticleBlockType, insertIndex: number) => {
    const newBlock = createBlock(type);
    const updated = [...blocks];
    updated.splice(insertIndex, 0, newBlock);
    onChange(updated);
  };

  // Update specific block
  const handleUpdateBlock = (index: number, updatedBlock: ArticleBlock) => {
    const updated = [...blocks];
    updated[index] = updatedBlock;
    onChange(updated);
  };

  // Delete specific block
  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      // If deleting the only block, reset to a single empty text block
      onChange([createBlock('text')]);
      return;
    }
    const updated = blocks.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated);
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated);
  };

  // Duplicate block
  const handleDuplicateBlock = (index: number) => {
    const target = blocks[index];
    const cloned = createBlock(target.type, { ...target });
    const updated = [...blocks];
    updated.splice(index + 1, 0, cloned);
    onChange(updated);
  };

  const getBlockIcon = (type: ArticleBlockType) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'code':
        return <Code className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'quote':
        return <Quote className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getBlockTypeName = (block: ArticleBlock) => {
    switch (block.type) {
      case 'text':
        return 'Text / Rich Text';
      case 'image':
        return 'Image Component';
      case 'code':
        return `Code Block (${block.language?.toUpperCase() || 'PYTHON'})`;
      case 'quote':
        return 'Quote Block';
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Top Bar Info & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
        <div className="flex items-center gap-3 font-semibold text-neutral-800 dark:text-neutral-200">
          <span className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{blocks.length} {blocks.length === 1 ? 'Component' : 'Components'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <FileText className="w-3.5 h-3.5" />
            <span>{stats.wordCount} words</span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{stats.readingTime} min read</span>
          </span>
        </div>

        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Click <strong>+ Add Component</strong> anywhere to insert</span>
        </div>
      </div>

      {/* Top Add Component Menu */}
      <AddComponentMenu onSelect={(type) => handleAddBlock(type, 0)} label="Add Component to Top" isCompact />

      {/* Component Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, index) => {
          const isFirst = index === 0;
          const isLast = index === blocks.length - 1;

          return (
            <div key={block.id} className="group/block">
              {/* Individual Block Container */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d1117] overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                
                {/* Block Header Strip */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80 text-xs">
                  {/* Left: Type Badge & Index */}
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px] font-black font-mono text-zinc-600 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                      {getBlockIcon(block.type)}
                      <span className="text-[11px] uppercase tracking-wider">
                        {getBlockTypeName(block)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Block Controls (Move Up, Move Down, Duplicate, Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      title="Move Component Up"
                      className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      title="Move Component Down"
                      className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateBlock(index)}
                      title="Duplicate Component"
                      className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(index)}
                      title="Delete Component"
                      className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Content Editor */}
                <div className="p-4">
                  {block.type === 'text' && (
                    <TextBlockEditor
                      block={block}
                      onChange={(updated) => handleUpdateBlock(index, updated)}
                    />
                  )}
                  {block.type === 'image' && (
                    <ImageBlockEditor
                      block={block}
                      onChange={(updated) => handleUpdateBlock(index, updated)}
                    />
                  )}
                  {block.type === 'code' && (
                    <CodeBlockEditor
                      block={block}
                      onChange={(updated) => handleUpdateBlock(index, updated)}
                    />
                  )}
                  {block.type === 'quote' && (
                    <QuoteBlockEditor
                      block={block}
                      onChange={(updated) => handleUpdateBlock(index, updated)}
                    />
                  )}
                </div>
              </div>

              {/* In-Between Add Component Button */}
              <AddComponentMenu
                onSelect={(type) => handleAddBlock(type, index + 1)}
                label="Add Component"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
