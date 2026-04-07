interface Props {
  priceLabel?: string;
  price?: string;
  primaryLabel: string;
  onPrimary: () => void;
  badges?: string[];
}

export default function ActionBar({ priceLabel, price, primaryLabel, onPrimary, badges }: Props) {
  return (
    <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {badges && badges.length > 0 && (
        <div className="flex gap-3 mb-2">
          {badges.map((b, i) => (
            <span key={i} className="text-[10px] text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              {b}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        {price ? (
          <div>
            <span className="text-[10px] text-gray-400">{priceLabel}</span>
            <span className="text-xl font-bold text-orange-600 ml-1">¥{price}</span>
          </div>
        ) : <div />}
        <button
          onClick={onPrimary}
          className="px-8 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-full active:opacity-80"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
