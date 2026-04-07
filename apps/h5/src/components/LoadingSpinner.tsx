export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-7 h-7";
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${px} border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
