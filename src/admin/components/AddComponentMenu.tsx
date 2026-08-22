import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Image as ImageIcon, Code, Quote, X } from 'lucide-react';
import { ArticleBlockType } from '../../types';

interface AddComponentMenuProps {
  onSelect: (type: ArticleBlockType) => void;
  label?: string;
  isCompact?: boolean;
}

export const AddComponentMenu: React.FC<AddComponentMenuProps> = ({
  onSelect,
  label = 'Add Component',
  isCompact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const componentsList: {
    type: ArticleBlockType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'text',
      title: 'Text / Rich Text',
      description: 'Standard paragraphs, lists, bold, italic, and inline links',
      icon: <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      color: 'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
    },
    {
      type: 'image',
      title: 'Image',
      description: 'Upload from device with Alt text, caption, and alignment',
      icon: <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      color: 'hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
    },
    {
      type: 'code',
      title: 'Code Block',
      description: 'Syntax-highlighted code editor for programming tutorials',
      icon: <Code className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      color: 'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
    },
    {
      type: 'quote',
      title: 'Quote',
      description: 'Highlighted callout quote with author/source attribution',
      icon: <Quote className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      color: 'hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30',
    },
  ];

  const handleSelect = (type: ArticleBlockType) => {
    onSelect(type);
    setIsOpen(false);
  };

  return (
    <div className={`relative my-3 flex justify-center group/add ${isOpen ? 'z-40' : 'z-10'}`} ref={menuRef}>
      {/* Decorative center line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-200 dark:bg-zinc-800 group-hover/add:bg-blue-400 dark:group-hover/add:bg-blue-600 transition-colors" />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all shadow-xs ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-600 scale-105'
            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
        } ${isCompact ? 'text-[11px]' : 'text-xs font-bold'}`}
      >
        {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        <span className="uppercase tracking-wider font-extrabold">{label}</span>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute top-full mt-2 z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1 mb-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span>Select Content Component</span>
            <span>4 Options</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {componentsList.map((comp) => (
              <button
                key={comp.type}
                type="button"
                onClick={() => handleSelect(comp.type)}
                className={`w-full p-2.5 rounded-lg border border-transparent text-left flex items-start gap-3 transition-all ${comp.color}`}
              >
                <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                  {comp.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>{comp.title}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                    {comp.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
