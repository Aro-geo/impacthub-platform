import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse markdown content and convert to JSX
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (line.trim() === '') {
        elements.push(<br key={`br-${currentIndex++}`} />);
        continue;
      }

      // Main headers (##)
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${currentIndex++}`} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
        continue;
      }

      // Subheaders (###)
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${currentIndex++}`} className="text-lg font-semibold text-gray-800 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        continue;
      }

      // Bullet points (-)
      if (line.startsWith('- ')) {
        // Check if we need to start a new list or continue existing one
        const bulletContent = line.replace('- ', '');
        const nextLine = lines[i + 1];
        const isLastBullet = !nextLine || !nextLine.startsWith('- ');
        
        // Collect all consecutive bullet points
        const bulletPoints = [bulletContent];
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('- ')) {
          bulletPoints.push(lines[j].replace('- ', ''));
          j++;
        }
        
        // Create the bullet list
        elements.push(
          <ul key={`ul-${currentIndex++}`} className="list-disc list-inside space-y-1 mb-3 ml-4">
            {bulletPoints.map((point, index) => (
              <li key={`li-${currentIndex++}-${index}`} className="text-gray-700">
                {parseInlineFormatting(point)}
              </li>
            ))}
          </ul>
        );
        
        // Skip the lines we've already processed
        i = j - 1;
        continue;
      }

      // Numbered lists (1., 2., etc.)
      if (/^\d+\.\s/.test(line)) {
        const numberContent = line.replace(/^\d+\.\s/, '');
        const nextLine = lines[i + 1];
        
        // Collect all consecutive numbered points
        const numberedPoints = [numberContent];
        let j = i + 1;
        while (j < lines.length && /^\d+\.\s/.test(lines[j])) {
          numberedPoints.push(lines[j].replace(/^\d+\.\s/, ''));
          j++;
        }
        
        // Create the numbered list
        elements.push(
          <ol key={`ol-${currentIndex++}`} className="list-decimal list-inside space-y-1 mb-3 ml-4">
            {numberedPoints.map((point, index) => (
              <li key={`li-${currentIndex++}-${index}`} className="text-gray-700">
                {parseInlineFormatting(point)}
              </li>
            ))}
          </ol>
        );
        
        // Skip the lines we've already processed
        i = j - 1;
        continue;
      }

      // Regular paragraphs
      if (line.trim()) {
        elements.push(
          <p key={`p-${currentIndex++}`} className="text-gray-700 mb-3 leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Parse inline formatting like **bold**, *italic*, etc.
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Handle bold text (**text**)
    let result: React.ReactNode = text;
    
    // Bold formatting
    result = text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`bold-${index}`} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // If result is an array, we need to handle italic formatting on each part
    if (Array.isArray(result)) {
      return result.map((part, index) => {
        if (typeof part === 'string') {
          // Handle italic formatting (*text*)
          return part.split(/(\*.*?\*)/).map((subPart, subIndex) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && !subPart.startsWith('**')) {
              return (
                <em key={`italic-${index}-${subIndex}`} className="italic">
                  {subPart.slice(1, -1)}
                </em>
              );
            }
            return subPart;
          });
        }
        return part;
      });
    }

    return result;
  };

  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;