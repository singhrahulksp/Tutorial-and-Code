import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArticleBlock } from '../types';
import { parseMarkdownToBlocks } from '../utils/blockUtils';
import { CodeBlockView } from './CodeBlockView';
import { Quote as QuoteIcon } from 'lucide-react';

interface ArticleBlocksRendererProps {
  blocks?: ArticleBlock[];
  content?: string;
  className?: string;
}

export const ArticleBlocksRenderer: React.FC<ArticleBlocksRendererProps> = ({
  blocks,
  content,
  className = '',
}) => {
  // Resolve active blocks (either provided directly or parsed from markdown string)
  const activeBlocks: ArticleBlock[] =
    blocks && blocks.length > 0
      ? blocks
      : content
      ? parseMarkdownToBlocks(content)
      : [];

  if (activeBlocks.length === 0) {
    return null;
  }

  return (
    <div className={`article-body-blocks space-y-6 ${className}`}>
      {activeBlocks.map((block) => {
        switch (block.type) {
          case 'text':
            return (
              <div
                key={block.id}
                className="article-text-block prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed sm:leading-loose text-base sm:text-[17px]"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-8 mb-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 first:border-0 first:pt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                      return (
                        <h2
                          id={id}
                          className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mt-8 mb-4 scroll-mt-24"
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                      return (
                        <h3
                          id={id}
                          className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white tracking-tight mt-6 mb-3 scroll-mt-24"
                        >
                          {children}
                        </h3>
                      );
                    },
                    h4: ({ children }) => {
                      const text = String(children);
                      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                      return (
                        <h4
                          id={id}
                          className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tracking-tight mt-5 mb-2 scroll-mt-24"
                        >
                          {children}
                        </h4>
                      );
                    },
                    p: ({ children }) => (
                      <p className="my-4 text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-4 ml-6 list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-4 ml-6 list-decimal space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed pl-1">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-neutral-950 dark:text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => (
                      <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 font-mono text-xs border border-neutral-200 dark:border-neutral-700 font-medium">
                        {children}
                      </code>
                    ),
                    a: ({ href, children }) => {
                      const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
                      return (
                        <a
                          href={href}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 decoration-blue-300 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-colors"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {block.content}
                </ReactMarkdown>
              </div>
            );

          case 'image': {
            if (!block.url) return null;

            const alignmentClasses =
              block.alignment === 'full'
                ? 'w-full my-8'
                : block.alignment === 'left'
                ? 'md:float-left md:max-w-md md:mr-6 my-4'
                : block.alignment === 'right'
                ? 'md:float-right md:max-w-md md:ml-6 my-4'
                : 'max-w-4xl mx-auto my-8';

            return (
              <figure key={block.id} className={`article-image-block ${alignmentClasses}`}>
                <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-xs">
                  <img
                    src={block.url}
                    alt={block.altText || ''}
                    title={block.altText || undefined}
                    className="w-full h-auto object-cover max-h-[650px] mx-auto block"
                    loading="lazy"
                  />
                </div>
                {Boolean(block.caption && block.caption.trim()) && (
                  <figcaption className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400 italic">
                    {block.caption.trim()}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'code':
            return (
              <div key={block.id} className="article-code-block">
                <CodeBlockView code={block.code} language={block.language} />
              </div>
            );

          case 'quote':
            return (
              <figure
                key={block.id}
                className="article-quote-block my-8 pl-6 py-4 pr-6 border-l-4 border-blue-600 dark:border-blue-500 bg-neutral-50 dark:bg-neutral-900/50 rounded-r-xl relative"
              >
                <QuoteIcon className="w-6 h-6 text-blue-500/30 absolute top-3 right-4 pointer-events-none" />
                <blockquote className="text-lg sm:text-xl font-serif italic text-neutral-900 dark:text-neutral-100 leading-relaxed">
                  “{block.quote}”
                </blockquote>
                {block.author && (
                  <figcaption className="mt-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    — {block.author}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
