import { useTranslation } from "@/lib/i18n";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-4xl mb-3">⚠️</span>
      <p className="text-gray-500 text-sm mb-4">{message || t("common.error")}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full">
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}
