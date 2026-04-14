import { Fragment } from "react";

interface Props {
  content: string;
  className?: string;
}

function renderInline(text: string, key: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={`${key}-${i++}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) parts.push(<em key={`${key}-${i++}`}>{tok.slice(1, -1)}</em>);
    else if (tok.startsWith("`")) parts.push(<code key={`${key}-${i++}`} className="px-1 py-0.5 bg-gray-100 rounded text-xs">{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function MarkdownRenderer({ content, className = "" }: Props) {
  const blocks = content.split(/\n\n+/);
  return (
    <div className={`max-w-none ${className}`}>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        if (block.startsWith("### ")) return <h3 key={key} className="text-base font-semibold mt-4 mb-2 text-gray-900">{renderInline(block.slice(4), key)}</h3>;
        if (block.startsWith("## ")) return <h2 key={key} className="text-lg font-semibold mt-5 mb-2 text-gray-900">{renderInline(block.slice(3), key)}</h2>;
        if (block.startsWith("# ")) return <h1 key={key} className="text-xl font-bold mt-6 mb-3 text-gray-900">{renderInline(block.slice(2), key)}</h1>;
        const lines = block.split("\n");
        return (
          <p key={key} className="text-sm leading-relaxed text-gray-700 my-2">
            {lines.map((ln, j) => (
              <Fragment key={`${key}-l${j}`}>
                {renderInline(ln, `${key}-l${j}`)}
                {j < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
