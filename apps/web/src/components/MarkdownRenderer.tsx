"use client";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-3">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-[#0066FF]/30 pl-4 my-4 text-gray-600 italic bg-blue-50/50 py-2 rounded-r-lg">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-6 list-disc text-gray-700 leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-6 list-decimal text-gray-700 leading-relaxed">
          {renderInline(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
    } else if (line.startsWith("![")) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        elements.push(
          <figure key={i} className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={match[2]} alt={match[1]} className="rounded-xl w-full shadow-sm" />
            {match[1] && <figcaption className="text-xs text-gray-400 text-center mt-2">{match[1]}</figcaption>}
          </figure>
        );
      }
    } else if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={i} className="my-6 border-gray-200" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="text-gray-700 leading-relaxed my-2">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <div className="markdown-content">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      boldMatch && { type: "bold" as const, match: boldMatch },
      italicMatch && { type: "italic" as const, match: italicMatch },
      codeMatch && { type: "code" as const, match: codeMatch },
      linkMatch && { type: "link" as const, match: linkMatch },
    ].filter(Boolean).sort((a, b) => (a!.match!.index ?? 0) - (b!.match!.index ?? 0));

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const idx = first.match!.index!;
    if (idx > 0) parts.push(remaining.slice(0, idx));

    if (first.type === "bold") {
      parts.push(<strong key={key++} className="font-bold text-gray-900">{first.match![1]}</strong>);
    } else if (first.type === "italic") {
      parts.push(<em key={key++} className="italic">{first.match![1]}</em>);
    } else if (first.type === "code") {
      parts.push(<code key={key++} className="px-1.5 py-0.5 bg-gray-100 text-[#0066FF] rounded text-sm font-mono">{first.match![1]}</code>);
    } else if (first.type === "link") {
      parts.push(<a key={key++} href={first.match![2]} className="text-[#0066FF] hover:underline" target="_blank" rel="noreferrer">{first.match![1]}</a>);
    }

    remaining = remaining.slice(idx + first.match![0].length);
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}
