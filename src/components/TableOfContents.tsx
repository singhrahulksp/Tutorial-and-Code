import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse markdown headings (## and ###)
    const lines = content.split('\n');
    const items: TOCItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,5})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`]/g, '').trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        items.push({ id, text, level });
      }
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPos = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        if (headingElements[i].offsetTop <= scrollPos) {
          setActiveId(headingElements[i].id);
          return;
        }
      }

      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 sticky top-24">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        <List className="w-3.5 h-3.5" />
        <span>Table of Contents</span>
      </div>

      <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1 text-xs">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full text-left py-1 transition-colors leading-snug rounded px-2 ${
                item.level === 2
                  ? 'font-bold text-xs'
                  : item.level === 3
                  ? 'pl-4 text-xs font-medium'
                  : item.level === 4
                  ? 'pl-6 text-[11px] font-medium text-neutral-500'
                  : 'pl-8 text-[10px] text-neutral-400'
              } ${
                isActive
                  ? 'text-neutral-950 dark:text-white bg-neutral-200/70 dark:bg-neutral-800 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850'
              }`}
            >
              {item.text}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
