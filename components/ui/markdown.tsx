"use client";

import { cn } from "@/lib/utils";

type MarkdownProps = {
  content?: string;
  className?: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(input: string) {
  let text = input;
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  return text;
}

function markdownToHtml(raw: string) {
  const src = escapeHtml(raw || "").replace(/\r\n/g, "\n");
  const lines = src.split("\n");
  const out: string[] = [];

  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeBuffer: string[] = [];

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      closeLists();
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        out.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
        inCode = false;
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (!line.trim()) {
      closeLists();
      continue;
    }

    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      closeLists();
      const level = hMatch[1].length;
      out.push(`<h${level}>${renderInline(hMatch[2])}</h${level}>`);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!inUl) {
        if (inOl) {
          out.push("</ol>");
          inOl = false;
        }
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inOl) {
        if (inUl) {
          out.push("</ul>");
          inUl = false;
        }
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    closeLists();
    out.push(`<p>${renderInline(line)}</p>`);
  }

  closeLists();
  if (inCode && codeBuffer.length > 0) {
    out.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
  }

  return out.join("");
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-muted-foreground",
        "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mb-2",
        "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-2",
        "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-1.5",
        "[&_p]:mb-2 last:[&_p]:mb-0",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
        "[&_li]:mb-1",
        "[&_a]:underline [&_a]:underline-offset-2 [&_a]:text-primary",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:text-foreground",
        "[&_pre]:p-3 [&_pre]:rounded-md [&_pre]:bg-muted/70 [&_pre]:overflow-x-auto [&_pre]:mb-2",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content || "") }}
    />
  );
}

