import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Enhanced markdown rendering for AI responses
  const renderContent = (text: string) => {
    let html = text;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4">$1</h1>');

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');

    // Convert `code` to <code>
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono dark:text-gray-300">$1</code>');

    // Convert bullet points with proper nesting
    const lines = html.split('\n');
    let inList = false;
    let processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check if line is a bullet point
      if (trimmedLine.match(/^[-*+] /)) {
        if (!inList) {
          processedLines.push('<ul class="list-disc list-inside space-y-1 my-2 ml-4">');
          inList = true;
        }
        const bulletContent = trimmedLine.replace(/^[-*+] /, '');
        processedLines.push(`<li class="text-gray-700 dark:text-gray-300">${bulletContent}</li>`);
      } else if (trimmedLine.match(/^\d+\. /)) {
        // Numbered lists
        if (!inList) {
          processedLines.push('<ol class="list-decimal list-inside space-y-1 my-2 ml-4">');
          inList = true;
        }
        const numberedContent = trimmedLine.replace(/^\d+\. /, '');
        processedLines.push(`<li class="text-gray-700 dark:text-gray-300">${numberedContent}</li>`);
      } else {
        // Close list if we were in one
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }

        // Add regular line
        if (trimmedLine === '') {
          processedLines.push('<br>');
        } else {
          processedLines.push(line);
        }
      }
    }

    // Close list if still open
    if (inList) {
      processedLines.push('</ul>');
    }

    html = processedLines.join('\n');

    // Convert remaining line breaks to <br> but preserve existing HTML
    html = html.replace(/\n(?![<])/g, '<br>');

    // Clean up multiple <br> tags
    html = html.replace(/(<br>\s*){3,}/g, '<br><br>');

    return html;
  };

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      style={{
        lineHeight: '1.6',
      }}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
};

export default MarkdownRenderer;