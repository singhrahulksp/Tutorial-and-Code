import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'code';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-md text-neutral-200">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900/90 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="uppercase text-[11px] font-semibold tracking-wider text-neutral-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-emerald-300 dark:text-emerald-400 bg-neutral-950 selection:bg-neutral-800">
        <code>{codeString}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="article-body prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed sm:leading-loose text-base sm:text-[17px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-10 mb-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 first:border-0 first:pt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h2 id={id} className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mt-9 mb-4 scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h3 id={id} className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white tracking-tight mt-7 mb-3 scroll-mt-24">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h4 id={id} className="text-base sm:text-lg font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-200 mt-6 mb-2.5 scroll-mt-24">
                {children}
              </h4>
            );
          },
          h5: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <h5 id={id} className="text-xs sm:text-sm font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mt-5 mb-2 scroll-mt-24">
                {children}
              </h5>
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
          blockquote: ({ children }) => (
            <blockquote className="my-6 pl-4 border-l-2 border-neutral-900 dark:border-white italic text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900/50 py-3 pr-4 rounded-r-lg font-serif text-base sm:text-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-100 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-white">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold uppercase text-[11px] tracking-wider text-neutral-700 dark:text-neutral-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
              {children}
            </td>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 font-mono text-xs border border-neutral-200 dark:border-neutral-700 font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          hr: () => (
            <hr className="my-8 border-t border-neutral-200 dark:border-neutral-800" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-neutral-950 dark:text-white font-medium underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-950 dark:hover:decoration-white transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
