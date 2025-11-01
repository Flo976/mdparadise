"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "@/lib/i18n/provider";

interface MarkdownPreviewProps {
  content: string;
  onChange?: (content: string) => void;
}

export function MarkdownPreview({ content, onChange }: MarkdownPreviewProps) {
  const t = useTranslations();
  const [html, setHtml] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content) {
      setHtml("");
      return;
    }

    const convertMarkdown = async () => {
      // Configure marked options first
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      // Enable task lists
      marked.use({
        gfm: true,
        breaks: true,
      });

      // Configure marked renderer for better code blocks
      const renderer = new marked.Renderer();

      renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
        const language = lang || 'text';
        const escapedCode = escapeHtml(text);
        const copyText = t('preview.copyCode');
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
                <span class="copy-text">${copyText}</span>
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

      // Make external links open in new tab
      renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
        const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
        const isAnchor = href.startsWith('#');

        if (isExternal) {
          const titleAttr = title ? ` title="${title}"` : '';
          return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        } else if (isAnchor) {
          const titleAttr = title ? ` title="${title}"` : '';
          return `<a href="${href}"${titleAttr} class="anchor-link">${text}</a>`;
        } else {
          const titleAttr = title ? ` title="${title}"` : '';
          return `<a href="${href}"${titleAttr}>${text}</a>`;
        }
      };

      // Custom list item renderer to make checkboxes clickable
      renderer.listitem = ({ text, task, checked }: { text: string; task?: boolean; checked?: boolean }) => {
        if (task) {
          // Create clickable checkbox without disabled attribute
          const checkboxHtml = `<input type="checkbox" ${checked ? 'checked' : ''} />`;
          // The text parameter is already HTML parsed by marked, just remove the disabled checkbox
          const textWithoutCheckbox = text.replace(/<input[^>]*?disabled[^>]*>/, '').replace(/<input[^>]*>/, '');
          return `<li class="task-list-item">${checkboxHtml}${textWithoutCheckbox}</li>\n`;
        }
        return `<li>${text}</li>\n`;
      };

      // Apply custom renderer
      marked.setOptions({
        breaks: true,
        gfm: true,
        renderer: renderer,
      });

      const htmlContent = await marked(content);
      setHtml(htmlContent);
    };

    convertMarkdown();
  }, [content, t]);

  // Handle anchor clicks, copy code buttons, and checklist toggles
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle checklist checkbox clicks
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
        const checkbox = target as HTMLInputElement;

        if (onChange) {
          // Get all checkboxes to find the index
          const allCheckboxes = previewRef.current?.querySelectorAll('input[type="checkbox"]');
          const checkboxIndex = allCheckboxes ? Array.from(allCheckboxes).indexOf(checkbox) : -1;

          if (checkboxIndex !== -1) {
            // Toggle the checkbox in the markdown source
            const lines = content.split('\n');
            let currentCheckboxIndex = 0;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              // Match task list items: - [ ] or - [x] or * [ ] or * [x]
              const taskListMatch = line.match(/^(\s*[-*]\s+)\[([ xX])\]/);

              if (taskListMatch) {
                if (currentCheckboxIndex === checkboxIndex) {
                  // Toggle this checkbox
                  const isChecked = taskListMatch[2].toLowerCase() === 'x';
                  const newCheckState = isChecked ? ' ' : 'x';
                  lines[i] = line.replace(/\[([ xX])\]/, `[${newCheckState}]`);
                  onChange(lines.join('\n'));
                  return;
                }
                currentCheckboxIndex++;
              }
            }
          }
        }
        return;
      }

      // Handle anchor links (internal links with #)
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href?.startsWith('#')) {
          e.preventDefault();
          const id = href.slice(1);
          if (id && previewRef.current) {
            const element = previewRef.current.querySelector(`#${id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
          return;
        }
        // For external links, let them open normally (target="_blank" is already set)
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
                copyText.textContent = t('preview.copyCodeSuccess');

                // Reset after 2 seconds
                setTimeout(() => {
                  copyIcon.classList.remove('hidden');
                  checkIcon.classList.add('hidden');
                  copyText.textContent = t('preview.copyCode');
                }, 2000);
              }
            } catch (err) {
              console.error('Failed to copy code:', err);
              alert(t('errors.copyFailed'));
            }
          };

          copyToClipboard();
        }
      }
    };

    const previewElement = previewRef.current;
    if (previewElement) {
      previewElement.addEventListener('click', handleClick);
      return () => previewElement.removeEventListener('click', handleClick);
    }
  }, [html, content, onChange, t]);

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
                <h2 className="text-xl font-semibold mb-2">{t('editor.welcome')}</h2>
                <p>{t('editor.selectFile')}</p>
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
