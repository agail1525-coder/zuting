import { useTranslation } from "@/lib/i18n";

interface Props {
  icon?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = "📭", message, action }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-gray-400 text-sm">{message || t("common.noData")}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
