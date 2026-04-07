import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  title?: string;
  items: FAQItem[];
}

export default function FAQSection({ title, items }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mx-4 mt-6">
      {title && <h3 className="text-base font-bold text-gray-900 mb-3">{title}</h3>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-medium text-gray-900 pr-4">{item.question}</span>
              <svg
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
