"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import {
  quickSave,
  checkSaved,
  removeFromCollection,
  type CollectionEntityType,
} from "@/lib/api";

interface SaveButtonProps {
  entityType: CollectionEntityType;
  entityId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 16, padding: "p-1.5" },
  md: { icon: 20, padding: "p-2" },
  lg: { icon: 24, padding: "p-2.5" },
};

export default function SaveButton({
  entityType,
  entityId,
  size = "md",
  className = "",
}: SaveButtonProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [savedCollectionId, setSavedCollectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Check saved state on mount (only when logged in)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    checkSaved(entityType, entityId)
      .then((res) => {
        if (cancelled) return;
        setSaved(res.saved);
        if (res.saved && res.collections.length > 0) {
          setSavedCollectionId(res.collections[0].id);
        }
      })
      .catch((err) => { console.error('Check saved status failed:', err); });
    return () => { cancelled = true; };
  }, [user, entityType, entityId]);

  const handleClick = async () => {
    if (!user) {
      toast.warning(t("save.loginRequired"));
      return;
    }
    if (loading) return;

    // Animate press
    setPressed(true);
    setTimeout(() => setPressed(false), 200);

    setLoading(true);
    try {
      if (!saved) {
        // Quick-save to default collection
        const item = await quickSave(entityType, entityId);
        setSaved(true);
        setSavedItemId(item.id);
        // The quick-save endpoint returns the item; we need collection id from check
        // Re-check to get collection id
        const check = await checkSaved(entityType, entityId);
        if (check.collections.length > 0) {
          setSavedCollectionId(check.collections[0].id);
        }
        toast.success(t("save.saved"));
      } else {
        // Remove from collection
        if (savedCollectionId && savedItemId) {
          await removeFromCollection(savedCollectionId, savedItemId);
        } else {
          // Fallback: re-check to find the item
          const check = await checkSaved(entityType, entityId);
          if (check.collections.length > 0) {
            setSavedCollectionId(check.collections[0].id);
          }
        }
        setSaved(false);
        setSavedItemId(null);
        toast.success(t("save.unsaved"));
      }
    } catch {
      toast.error(t("save.error"));
    } finally {
      setLoading(false);
    }
  };

  const { icon: iconSize, padding } = SIZE_MAP[size];

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={saved ? t("save.unsaved") : t("save.saved")}
        className={`
          inline-flex items-center justify-center rounded-full
          bg-white/90 backdrop-blur-sm border border-gray-200
          hover:bg-white hover:border-gray-300
          shadow-sm hover:shadow-md
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${padding}
          ${pressed ? "scale-75" : "scale-100"}
          ${className}
        `}
        style={{ transition: "transform 0.15s ease" }}
      >
        {saved ? (
          // Filled heart (saved)
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="#ef4444"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ) : (
          // Outline heart (not saved)
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </button>

    </div>
  );
}
