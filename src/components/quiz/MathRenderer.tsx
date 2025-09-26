import { MathJax, MathJaxContext } from "better-react-mathjax";

interface MathRendererProps {
  children: string;
  inline?: boolean;
}

const MathRenderer = ({ children, inline = false }: MathRendererProps) => {
  // Check if the text contains LaTeX math expressions
  const hasMath = /\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\[[\s\S]*?\\]|\\([\s\S]*?\\)/.test(children);
  
  if (!hasMath) {
    return <span>{children}</span>;
  }

  // Convert common math expressions to LaTeX if not already formatted
  let processedText = children;
  
  // Handle fractions like 1/2 -> \frac{1}{2}
  processedText = processedText.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
  
  // Handle powers like x^2 -> x^{2}
  processedText = processedText.replace(/([a-zA-Z]+)\^(\d+)/g, '$1^{$2}');
  
  // Handle square roots like sqrt(x) -> \sqrt{x}
  processedText = processedText.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  
  // Wrap math expressions properly
  if (!processedText.includes('$') && !processedText.includes('\\[') && !processedText.includes('\\(')) {
    processedText = inline ? `$${processedText}$` : `$$${processedText}$$`;
  }

  return (
    <MathJaxContext
      config={{
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
        },
        svg: {
          fontCache: 'global'
        }
      }}
    >
      <MathJax>{processedText}</MathJax>
    </MathJaxContext>
  );
};

export default MathRenderer;