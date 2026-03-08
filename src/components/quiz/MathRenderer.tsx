import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useMemo } from "react";

interface MathRendererProps {
  children: string;
  inline?: boolean;
}

const mathJaxConfig = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
  },
  svg: {
    fontCache: 'global'
  }
};

const MathRenderer = ({ children, inline = false }: MathRendererProps) => {
  const processedText = useMemo(() => {
    // Check if the text contains LaTeX math expressions
    const hasMath = /\$\$[\s\S]*?\$\$|\$[^$]+\$|\\[[\s\S]*?\\]|\\([\s\S]*?\\)|\\frac|\\sqrt|\\sum|\\int|\\lim|\\infty|\\pi|\\alpha|\\beta|\\gamma|\\theta|\^{|_{/.test(children);

    if (!hasMath) {
      return null; // Signal to render as plain text
    }

    let text = children;

    // If the text doesn't have explicit math delimiters but has LaTeX commands, wrap it
    if (!text.includes('$') && !text.includes('\\[') && !text.includes('\\(')) {
      // Check for LaTeX commands
      if (/\\frac|\\sqrt|\\sum|\\int|\\lim|\\infty|\\pi|\\alpha|\\beta|\\gamma|\\theta|\^{|_{/.test(text)) {
        text = inline ? `$${text}$` : `$$${text}$$`;
      }
    }

    return text;
  }, [children, inline]);

  if (processedText === null) {
    return <span>{children}</span>;
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <MathJax inline={inline}>{processedText}</MathJax>
    </MathJaxContext>
  );
};

export default MathRenderer;
