import { useEffect, useState } from "react";

interface CodeRendererProps {
  children: string;
  language?: string;
}

const CodeRenderer = ({ children, language = "javascript" }: CodeRendererProps) => {
  const [highlightedCode, setHighlightedCode] = useState(children);

  useEffect(() => {
    // Simple syntax highlighting for common programming concepts
    let highlighted = children;

    // Keywords
    const keywords = [
      'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'return', 
      'class', 'import', 'export', 'from', 'true', 'false', 'null', 'undefined',
      'public', 'private', 'static', 'void', 'int', 'string', 'boolean'
    ];

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-medium">$1</span>`);
    });

    // Strings
    highlighted = highlighted.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="text-green-400">$1$2$1</span>'
    );

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-orange-400">$1</span>'
    );

    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span class="text-gray-400 italic">$1</span>'
    );

    // Functions
    highlighted = highlighted.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
      '<span class="text-yellow-400">$1</span>('
    );

    setHighlightedCode(highlighted);
  }, [children]);

  // Check if content looks like code
  const isCode = /[{}();=><]|function|class|import|const|let|var/.test(children);

  if (!isCode) {
    return <span>{children}</span>;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
      <pre>
        <code 
          className="text-gray-100"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeRenderer;