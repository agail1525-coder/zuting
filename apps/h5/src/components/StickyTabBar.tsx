import { useRef, useEffect } from "react";

interface Tab {
  key: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function StickyTabBar({ tabs, activeTab, onTabChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const btn = activeRef.current;
      const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="sticky top-11 z-30 bg-white border-b border-gray-100 flex overflow-x-auto scrollbar-hide"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          ref={tab.key === activeTab ? activeRef : undefined}
          onClick={() => onTabChange(tab.key)}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
              : "text-gray-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
