import { ArticleBlock, ArticleBlockType, TextBlock, ImageBlock, CodeBlockData, QuoteBlock } from '../types';

export interface LanguageOption {
  value: string;
  label: string;
  extension?: string;
}

export const PROGRAMMING_LANGUAGES: LanguageOption[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'jsx', label: 'React / JSX' },
  { value: 'other', label: 'Other' },
];

export function generateBlockId(): string {
  return `blk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export function createBlock(type: ArticleBlockType, overrides: Partial<ArticleBlock> = {}): ArticleBlock {
  const id = generateBlockId();
  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        content: '',
        ...overrides,
      } as TextBlock;
    case 'image':
      return {
        id,
        type: 'image',
        url: '',
        altText: '',
        caption: '',
        alignment: 'center',
        ...overrides,
      } as ImageBlock;
    case 'code':
      return {
        id,
        type: 'code',
        code: '',
        language: 'python',
        ...overrides,
      } as CodeBlockData;
    case 'quote':
      return {
        id,
        type: 'quote',
        quote: '',
        author: '',
        ...overrides,
      } as QuoteBlock;
  }
}

/**
 * Converts structured blocks into clean Markdown string for RSS, SEO, search and backwards compatibility
 */
export function serializeBlocksToMarkdown(blocks: ArticleBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'text':
          return block.content.trim();
        case 'image': {
          const caption = block.caption?.trim() ? `\n*${block.caption.trim()}*` : '';
          return `![${block.altText || 'Article image'}](${block.url})${caption}`;
        }
        case 'code':
          return `\`\`\`${block.language || 'text'}\n${block.code}\n\`\`\``;
        case 'quote': {
          const authorText = block.author?.trim() ? `\n> — ${block.author.trim()}` : '';
          const quoteLines = block.quote
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n');
          return `${quoteLines}${authorText}`;
        }
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Parses existing markdown text into structured ArticleBlock array
 */
export function parseMarkdownToBlocks(markdown: string): ArticleBlock[] {
  if (!markdown || !markdown.trim()) {
    return [createBlock('text', { content: '' })];
  }

  const blocks: ArticleBlock[] = [];
  const lines = markdown.split('\n');
  let currentTextLines: string[] = [];

  const flushTextBlock = () => {
    if (currentTextLines.length > 0) {
      const content = currentTextLines.join('\n').trim();
      if (content) {
        blocks.push(createBlock('text', { content }));
      }
      currentTextLines = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check for fenced code block ```language
    if (line.trim().startsWith('```')) {
      flushTextBlock();
      const langMatch = line.trim().match(/^```(\w+)?/);
      const language = langMatch && langMatch[1] ? langMatch[1].toLowerCase() : 'python';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push(
        createBlock('code', {
          code: codeLines.join('\n'),
          language,
        })
      );
      i++; // Skip closing ```
      continue;
    }

    // Check for standalone markdown image ![alt](url)
    const imageMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      flushTextBlock();
      const altText = imageMatch[1] || '';
      const url = imageMatch[2] || '';
      let caption = '';

      // Check next line for optional *caption*
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const captionMatch = nextLine.match(/^\*(.*?)\*$/) || nextLine.match(/^_([^_]+)_$/);
        if (captionMatch) {
          caption = captionMatch[1];
          i++; // consume caption line
        }
      }

      blocks.push(
        createBlock('image', {
          url,
          altText,
          caption,
          alignment: 'center',
        })
      );
      i++;
      continue;
    }

    // Check for blockquote > ...
    if (line.trim().startsWith('>')) {
      flushTextBlock();
      const quoteLines: string[] = [];
      let author = '';

      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const rawQuoteLine = lines[i].replace(/^>\s?/, '');
        // Check for author attribution format > — Author or > -- Author
        const authorMatch = rawQuoteLine.match(/^[—–-]{1,2}\s*(.+)$/);
        if (authorMatch) {
          author = authorMatch[1].trim();
        } else {
          quoteLines.push(rawQuoteLine);
        }
        i++;
      }

      blocks.push(
        createBlock('quote', {
          quote: quoteLines.join('\n').trim(),
          author,
        })
      );
      continue;
    }

    // Normal text line
    currentTextLines.push(line);
    i++;
  }

  flushTextBlock();

  if (blocks.length === 0) {
    blocks.push(createBlock('text', { content: '' }));
  }

  return blocks;
}

/**
 * Calculates word count and estimated reading time from structured blocks
 */
export function calculateBlocksStats(blocks: ArticleBlock[]): { wordCount: number; readingTime: number } {
  let totalWords = 0;

  blocks.forEach((block) => {
    switch (block.type) {
      case 'text': {
        const words = block.content.trim().split(/\s+/).filter(Boolean).length;
        totalWords += words;
        break;
      }
      case 'code': {
        const words = block.code.trim().split(/\s+/).filter(Boolean).length;
        totalWords += Math.round(words * 0.7); // code read rate
        break;
      }
      case 'quote': {
        const words = block.quote.trim().split(/\s+/).filter(Boolean).length;
        totalWords += words;
        break;
      }
      case 'image':
        totalWords += 10; // visual scan estimate
        break;
    }
  });

  const readingTime = Math.max(1, Math.ceil(totalWords / 200));
  return { wordCount: totalWords, readingTime };
}
