"use client";

import { useRef, useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 20 }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const tools = [
    { label: "B", title: "粗体", action: () => insertMarkdown("**", "**") },
    { label: "I", title: "斜体", action: () => insertMarkdown("*", "*") },
    { label: "H", title: "标题", action: () => insertMarkdown("\n## ", "\n") },
    { label: "—", title: "引用", action: () => insertMarkdown("\n> ", "\n") },
    { label: "•", title: "列表", action: () => insertMarkdown("\n- ", "\n") },
    { label: "1.", title: "有序列表", action: () => insertMarkdown("\n1. ", "\n") },
    { label: "🔗", title: "链接", action: () => insertMarkdown("[", "](url)") },
    { label: "📷", title: "图片", action: () => insertMarkdown("![", "](url)") },
    { label: "`", title: "代码", action: () => insertMarkdown("`", "`") },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={tool.action}
              title={tool.title}
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              {tool.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            preview ? "bg-[#0066FF] text-white" : "text-gray-500 hover:bg-gray-200"
          }`}
        >
          {preview ? "编辑" : "预览"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="px-4 py-3 min-h-[300px] prose prose-sm max-w-none text-gray-700">
          <MarkdownPreview content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
        />
      )}

      {/* Footer */}
      <div className="flex justify-between px-3 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        <span>支持 Markdown 语法</span>
        <span>{value.length} 字</span>
      </div>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  if (!content) return <p className="text-gray-400">无内容</p>;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-bold mt-4 mb-2">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold mt-4 mb-2">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2">{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-gray-300 pl-4 my-2 text-gray-600 italic">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(<li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\.\s/, ""))}</li>);
    } else if (line.startsWith("![")) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        // eslint-disable-next-line @next/next/no-img-element
        elements.push(<img key={i} src={match[2]} alt={match[1]} className="rounded-lg max-w-full my-2" />);
      }
    } else if (line.trim() === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(<p key={i} className="my-1">{renderInline(line)}</p>);
    }
  }

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Process bold, italic, code, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);
    // Code
    const codeMatch = remaining.match(/`(.+?)`/);
    // Link
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      boldMatch && { type: "bold", match: boldMatch },
      italicMatch && { type: "italic", match: italicMatch },
      codeMatch && { type: "code", match: codeMatch },
      linkMatch && { type: "link", match: linkMatch },
    ].filter(Boolean).sort((a, b) => (a!.match!.index ?? 0) - (b!.match!.index ?? 0));

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const idx = first.match!.index!;
    if (idx > 0) parts.push(remaining.slice(0, idx));

    if (first.type === "bold") {
      parts.push(<strong key={key++}>{first.match![1]}</strong>);
    } else if (first.type === "italic") {
      parts.push(<em key={key++}>{first.match![1]}</em>);
    } else if (first.type === "code") {
      parts.push(<code key={key++} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{first.match![1]}</code>);
    } else if (first.type === "link") {
      parts.push(<a key={key++} href={first.match![2]} className="text-[#0066FF] underline" target="_blank" rel="noreferrer">{first.match![1]}</a>);
    }

    remaining = remaining.slice(idx + first.match![0].length);
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}
