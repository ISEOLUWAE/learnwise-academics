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

// Convert plain-text math notation to LaTeX
function convertToLatex(text: string): string {
  let result = text;

  // Already has LaTeX delimiters — leave as-is
  if (/\$[\s\S]*?\$|\\[[\s\S]*?\\]|\\([\s\S]*?\\)/.test(result)) {
    return result;
  }

  // Already has LaTeX commands — just wrap
  if (/\\frac|\\sqrt|\\sum|\\int|\\lim|\\infty|\\pi|\\alpha|\\beta|\\gamma|\\theta/.test(result)) {
    return `$${result}$`;
  }

  // Detect plain-text math patterns and wrap them
  const hasMathPatterns = /\b(sin|cos|tan|log|ln|lim|sqrt|sum|integral|infinity|pi|theta|alpha|beta|gamma|delta)\b|[²³⁴⁵⁶⁷⁸⁹⁰¹±×÷≠≤≥≈∞∫∑∏√∂∇]|\^[\d{]|\/[a-z0-9]|[a-z0-9]\^|∫|Σ|dx\b|dy\b|dt\b|\bx\s*[²³]|\b\d+\/\d+\b|[a-z]\([a-z]\)|f\(x\)|g\(x\)|\|[a-z]\|/i.test(result);

  if (!hasMathPatterns) {
    return result; // No math detected
  }

  // Convert common plain-text patterns to LaTeX inline
  // Superscripts: x^2, x², x^{n}
  result = result.replace(/([a-zA-Z0-9])²/g, '$1^{2}');
  result = result.replace(/([a-zA-Z0-9])³/g, '$1^{3}');
  result = result.replace(/([a-zA-Z0-9])⁴/g, '$1^{4}');
  
  // Common functions
  result = result.replace(/\bsqrt\(([^)]+)\)/gi, '\\sqrt{$1}');
  result = result.replace(/\bln\|([^|]+)\|/g, '\\ln|$1|');
  result = result.replace(/\bln\(([^)]+)\)/gi, '\\ln($1)');
  result = result.replace(/\blog\(([^)]+)\)/gi, '\\log($1)');
  result = result.replace(/\bsin\(([^)]+)\)/gi, '\\sin($1)');
  result = result.replace(/\bcos\(([^)]+)\)/gi, '\\cos($1)');
  result = result.replace(/\btan\(([^)]+)\)/gi, '\\tan($1)');
  
  // Integral notation: integral of X dx → ∫ X dx
  result = result.replace(/integral\s+of\s+/gi, '\\int ');
  
  // Replace special Unicode symbols
  result = result.replace(/∫/g, '\\int ');
  result = result.replace(/Σ/g, '\\sum ');
  result = result.replace(/∞/g, '\\infty');
  result = result.replace(/π/g, '\\pi');
  result = result.replace(/θ/g, '\\theta');
  result = result.replace(/α/g, '\\alpha');
  result = result.replace(/β/g, '\\beta');
  result = result.replace(/γ/g, '\\gamma');
  result = result.replace(/δ/g, '\\delta');
  result = result.replace(/≠/g, '\\neq');
  result = result.replace(/≤/g, '\\leq');
  result = result.replace(/≥/g, '\\geq');
  result = result.replace(/±/g, '\\pm');
  result = result.replace(/×/g, '\\times');
  result = result.replace(/÷/g, '\\div');
  result = result.replace(/√/g, '\\sqrt');

  // Wrap the whole thing as inline math
  return `$${result}$`;
}

const MathRenderer = ({ children, inline = false }: MathRendererProps) => {
  const processedText = useMemo(() => {
    if (!children || children.trim().length === 0) return null;
    return convertToLatex(children);
  }, [children]);

  // If no conversion happened (returned unchanged), render as plain text
  if (processedText === null || processedText === children) {
    return <span>{children}</span>;
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <MathJax inline={inline}>{processedText}</MathJax>
    </MathJaxContext>
  );
};

export default MathRenderer;
