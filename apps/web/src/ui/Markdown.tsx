import { marked } from 'marked';
import { useMemo } from 'react';
import { cx } from './cx.ts';

marked.setOptions({ gfm: true, breaks: false });

/**
 * Renders first-party Markdown from /content (never user input).
 * Raw HTML in content is escaped to keep the CSP and the content format honest.
 */
const renderer = new marked.Renderer();
renderer.html = ({ text }) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = useMemo(() => marked.parse(source, { async: false, renderer }) as string, [source]);
  return (
    <div
      className={cx('prose-echo max-w-prose text-base text-fg-muted', className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, bundled first-party content with HTML escaped
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
