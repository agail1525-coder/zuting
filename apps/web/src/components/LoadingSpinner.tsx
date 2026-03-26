export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      {text && <p className="text-temple-400 text-sm">{text}</p>}
    </div>
  );
}
