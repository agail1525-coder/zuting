import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  right?: React.ReactNode;
  transparent?: boolean;
}

export default function PageHeader({ title, right, transparent }: Props) {
  const nav = useNavigate();
  return (
    <header className={`sticky top-0 z-40 flex items-center h-11 px-4 ${transparent ? "bg-transparent" : "bg-white border-b border-gray-100"}`}>
      <button onClick={() => nav(-1)} className="w-8 h-8 flex items-center justify-center -ml-2">
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <h1 className="flex-1 text-center font-semibold text-base text-gray-900 truncate">{title}</h1>
      <div className="w-8 flex items-center justify-center">{right}</div>
    </header>
  );
}
