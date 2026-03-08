import { useMemo } from "react";
import DOMPurify from "dompurify";

interface CodeRendererProps {
  children: string;
  language?: string;
}

const CodeRenderer = ({ children, language }: CodeRendererProps) => {
  // Extract code blocks (```...```) and render them properly
  const parts = useMemo(() => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const segments: { type: 'text' | 'code'; content: string; lang?: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(children)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: children.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'code', content: match[2].trim(), lang: match[1] || language || 'python' });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < children.length) {
      const remaining = children.slice(lastIndex);
      // Check if the entire remaining text looks like inline code
      const hasCodeIndicators = /[{}();=><]|function |class |import |const |let |var |def |print\(|return /.test(remaining);
      if (hasCodeIndicators && !remaining.includes('\n\n')) {
        segments.push({ type: 'code', content: remaining.trim(), lang: language || detectLanguage(remaining) });
      } else {
        segments.push({ type: 'text', content: remaining });
      }
    }

    return segments;
  }, [children, language]);

  // If there are no code segments, just render text
  if (parts.every(p => p.type === 'text')) {
    // Check if the whole thing is code-like (question with embedded code but no backticks)
    const hasCode = /\n```|```\n|def |print\(|function |class |#include|import /.test(children);
    if (!hasCode) {
      return <span>{children}</span>;
    }
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) =>
        part.type === 'code' ? (
          <HighlightedCode key={i} code={part.content} lang={part.lang || 'python'} />
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </div>
  );
};

function detectLanguage(code: string): string {
  if (/def |print\(|elif |import |from /.test(code)) return 'python';
  if (/function |const |let |var |=>/.test(code)) return 'javascript';
  if /#include|int main|printf|iostream/.test(code)) return 'c';
  if (/public class|System\.out/.test(code)) return 'java';
  return 'python';
}

const KEYWORDS: Record<string, string[]> = {
  python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'try', 'except', 'finally', 'with', 'as', 'pass', 'break', 'continue', 'lambda', 'yield', 'print', 'range', 'len', 'self'],
  javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'from', 'true', 'false', 'null', 'undefined', 'new', 'this', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof'],
  c: ['int', 'float', 'double', 'char', 'void', 'if', 'else', 'for', 'while', 'return', 'struct', 'typedef', 'include', 'define', 'printf', 'scanf', 'main', 'NULL', 'sizeof'],
  java: ['public', 'private', 'protected', 'class', 'static', 'void', 'int', 'String', 'boolean', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'import', 'try', 'catch', 'finally', 'throw', 'extends', 'implements'],
};

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const highlighted = useMemo(() => {
    let html = escapeHtml(code);
    const keywords = KEYWORDS[lang] || KEYWORDS.python;

    // Highlight strings first (to avoid keyword matches inside strings)
    html = html.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="text-green-400">$1$2$1</span>'
    );

    // Highlight comments
    if (lang === 'python') {
      html = html.replace(/(#.*)$/gm, '<span class="text-gray-500 italic">$1</span>');
    } else {
      html = html.replace(/(\/\/.*)$/gm, '<span class="text-gray-500 italic">$1</span>');
      html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');
    }

    // Highlight keywords (word boundary)
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b(?![^<]*>)`, 'g');
      html = html.replace(regex, '<span class="text-purple-400 font-semibold">$1</span>');
    });

    // Highlight numbers
    html = html.replace(/\b(\d+\.?\d*)\b(?![^<]*>)/g, '<span class="text-orange-400">$1</span>');

    // Highlight function calls
    html = html.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\((?![^<]*>)/g, '<span class="text-yellow-300">$1</span>(');

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['span', 'pre', 'code'],
      ALLOWED_ATTR: ['class']
    });
  }, [code, lang]);

  return (
    <div className="bg-[#1e1e2e] rounded-lg p-4 font-mono text-sm overflow-x-auto border border-white/10 my-2">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{lang}</span>
      </div>
      <pre className="whitespace-pre-wrap break-words">
        <code
          className="text-gray-100 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default CodeRenderer;
