"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content) {
      setHtml("");
      return;
    }

    const convertMarkdown = async () => {
      // Configure marked renderer for better code blocks
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
                <span class="copy-text">Copy</span>
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

      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
        renderer: renderer,
      });

      const htmlContent = await marked(content);
      setHtml(htmlContent);
    };

    convertMarkdown();
  }, [content]);

  // Handle anchor clicks and copy code buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle anchor links
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        if (id && previewRef.current) {
          const element = previewRef.current.querySelector(`#${id}`);
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
        const code = button.getAttribute('data-code');
        if (code) {
          // Unescape HTML entities
          const textarea = document.createElement('textarea');
          textarea.innerHTML = code;
          const decodedCode = textarea.value;

          // Copy to clipboard
          navigator.clipboard.writeText(decodedCode).then(() => {
            // Show success feedback
            const copyIcon = button.querySelector('.copy-icon');
            const checkIcon = button.querySelector('.check-icon');
            const copyText = button.querySelector('.copy-text');

            if (copyIcon && checkIcon && copyText) {
              copyIcon.classList.add('hidden');
              checkIcon.classList.remove('hidden');
              copyText.textContent = 'Copied!';

              // Reset after 2 seconds
              setTimeout(() => {
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                copyText.textContent = 'Copy';
              }, 2000);
            }
          }).catch(err => {
            console.error('Failed to copy code:', err);
          });
        }
      }
    };

    const previewElement = previewRef.current;
    if (previewElement) {
      previewElement.addEventListener('click', handleClick);
      return () => previewElement.removeEventListener('click', handleClick);
    }
  }, [html]);

  return (
    <ScrollArea className="h-full w-full">
      <div ref={previewRef} className="flex justify-center w-full min-h-full px-4 py-6 sm:p-6 md:p-8">
        <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl dark:prose-invert w-full max-w-none sm:max-w-2xl md:max-w-3xl lg:max-w-4xl markdown-preview mobile-reading">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
              <div className="text-center">
                <p className="text-4xl mb-4">✨</p>
                <h2 className="text-xl font-semibold mb-2">Welcome to MDParadise</h2>
                <p>Select a file to start editing</p>
              </div>
            </div>
          )}
        </div>
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

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}
