import React from 'react';

// A simple, secure Markdown to React elements parser
export default function MarkdownText({ content }) {
  if (!content) return null;

  // Split content by double newlines for paragraphs/blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm">
      {blocks.map((block, index) => {
        const lines = block.split('\n');
        
        // Check for headings (e.g. ## Heading)
        if (lines[0].startsWith('#')) {
          const level = lines[0].match(/^#+/)[0].length;
          const text = lines[0].replace(/^#+\s*/, '');
          const parsedText = parseInline(text);
          
          if (level === 1) return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{parsedText}</h1>;
          if (level === 2) return <h2 key={index} className="text-lg font-bold mt-3 mb-2">{parsedText}</h2>;
          return <h3 key={index} className="text-base font-bold mt-2 mb-1">{parsedText}</h3>;
        }

        // Check for unordered lists (e.g. * item or - item)
        if (lines.every(line => line.trim().match(/^[-*]\s+/))) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-1">
              {lines.map((line, i) => (
                <li key={i}>{parseInline(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        // Check for ordered lists (e.g. 1. item)
        if (lines.every(line => line.trim().match(/^\d+\.\s+/))) {
          return (
            <ol key={index} className="list-decimal pl-5 space-y-1">
              {lines.map((line, i) => (
                <li key={i}>{parseInline(line.replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }

        // Otherwise, it's a paragraph
        return (
          <p key={index} className="leading-relaxed">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {parseInline(line)}
                {i < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// Parses inline markdown like **bold**, *italic*, and `code`
function parseInline(text) {
  // Use a regex tokenizer to safely parse inline styles without dangerouslySetInnerHTML
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
