interface InfoItem {
  icon: string;
  label: string;
  value: string;
}

interface Props {
  items: InfoItem[];
}

export default function InfoCard({ items }: Props) {
  const visible = items.filter((i) => i.value);
  if (visible.length === 0) return null;

  return (
    <div className="mx-4 mt-4 bg-white rounded-xl shadow-sm p-4 grid grid-cols-2 gap-3">
      {visible.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-base flex-shrink-0">{item.icon}</span>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400">{item.label}</p>
            <p className="text-xs font-medium text-gray-800 truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
