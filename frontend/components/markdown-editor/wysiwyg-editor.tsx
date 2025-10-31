"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const isUpdatingRef = useRef(false);

  // Convert markdown to HTML
  useEffect(() => {
    if (isUpdatingRef.current) return;

    const convertMarkdown = async () => {
      const renderer = new marked.Renderer();
      renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
        const language = lang || 'text';
        const escapedCode = escapeHtml(text);
        return `
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">${language}</span>
              <button class="copy-code-button" data-code="${escapeHtml(text).replace(/"/g, '&quot;')}" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copier</span>
              </button>
            </div>
            <pre class="code-block"><code class="language-${language}">${escapedCode}</code></pre>
          </div>
        `;
      };
      renderer.codespan = ({ text }: { text: string }) => {
        return `<code class="inline-code">${escapeHtml(text)}</code>`;
      };

      // Add IDs to headers for anchor links
      renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
        const id = generateId(text);
        return `<h${depth} id="${id}">${text}</h${depth}>`;
      };

      marked.setOptions({
        breaks: true,
        gfm: true,
        renderer: renderer,
      });

      const htmlContent = await marked(value);
      setHtml(htmlContent);

      if (editorRef.current && !editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = htmlContent;
      }
    };

    convertMarkdown();
  }, [value]);

  // Handle content changes
  const handleInput = () => {
    if (!editorRef.current) return;

    isUpdatingRef.current = true;
    const htmlContent = editorRef.current.innerHTML;
    const markdown = htmlToMarkdown(htmlContent);
    onChange(markdown);

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  };

  // Handle anchor clicks and copy code buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle anchor links
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        if (id && editorRef.current) {
          const element = editorRef.current.querySelector(`#${id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        return;
      }

      // Handle copy code buttons
      const button = target.closest('.copy-code-button') as HTMLButtonElement;
      if (button) {
        e.preventDefault();
        e.stopPropagation(); // Prevent contentEditable from capturing this event
        const code = button.getAttribute('data-code');
        if (code) {
          // Unescape HTML entities
          const textarea = document.createElement('textarea');
          textarea.innerHTML = code;
          const decodedCode = textarea.value;

          // Copy to clipboard with fallback
          const copyToClipboard = async () => {
            try {
              // Try modern clipboard API
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(decodedCode);
              } else {
                // Fallback for older browsers or insecure contexts
                const textArea = document.createElement('textarea');
                textArea.value = decodedCode;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
              }

              // Show success feedback
              const copyIcon = button.querySelector('.copy-icon');
              const checkIcon = button.querySelector('.check-icon');
              const copyText = button.querySelector('.copy-text');

              if (copyIcon && checkIcon && copyText) {
                copyIcon.classList.add('hidden');
                checkIcon.classList.remove('hidden');
                copyText.textContent = 'Copié !';

                // Reset after 2 seconds
                setTimeout(() => {
                  copyIcon.classList.remove('hidden');
                  checkIcon.classList.add('hidden');
                  copyText.textContent = 'Copier';
                }, 2000);
              }
            } catch (err) {
              console.error('Failed to copy code:', err);
              alert('Impossible de copier le code dans le presse-papiers');
            }
          };

          copyToClipboard();
        }
      }
    };

    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
      return () => editorElement.removeEventListener('click', handleClick);
    }
  }, [html]);

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex justify-center w-full min-h-full p-4 sm:p-6 md:p-8">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="prose prose-base md:prose-lg lg:prose-xl dark:prose-invert w-full max-w-none sm:max-w-2xl md:max-w-3xl lg:max-w-4xl markdown-preview focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ScrollArea>
  );
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Simple HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Remove contentEditable artifacts
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<div>/gi, '\n');
  markdown = markdown.replace(/<\/div>/gi, '');

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

  // Bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');

  // Lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`);
  });

  // Code blocks (with wrapper)
  markdown = markdown.replace(/<div class="code-block-wrapper">[\s\S]*?<pre class="code-block"><code[^>]*>([\s\S]*?)<\/code><\/pre>[\s\S]*?<\/div>/gi, (match, code) => {
    const unescaped = unescapeHtml(code);
    return '\n```\n' + unescaped + '\n```\n';
  });

  // Code blocks (without wrapper - backward compatibility)
  markdown = markdown.replace(/<pre class="code-block"><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    const unescaped = unescapeHtml(code);
    return '\n```\n' + unescaped + '\n```\n';
  });

  // Inline code
  markdown = markdown.replace(/<code class="inline-code">(.*?)<\/code>/gi, (match, code) => {
    const unescaped = unescapeHtml(code);
    return '`' + unescaped + '`';
  });

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    return content.split('\n').map((line: string) => '> ' + line).join('\n') + '\n';
  });

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
}

function unescapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (m) => map[m]);
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}
