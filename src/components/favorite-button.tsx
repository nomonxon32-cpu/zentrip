"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  vehicleId,
  initialFavorite = false,
  isAuthenticated,
}: {
  vehicleId: string;
  initialFavorite?: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const { labels } = useLocale();
  const [isFavorited, setIsFavorited] = useState(initialFavorite);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <button
      type="button"
      aria-label={isFavorited ? labels.savedCars : labels.savedCars}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        try {
          setIsSaving(true);
          const nextFavorited = !isFavorited;
          const response = await fetch("/api/favorites", {
            method: nextFavorited ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId }),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? labels.actionFailed);
          }

          setIsFavorited(nextFavorited);
          toast.success(
            nextFavorited
              ? (labels.savedCars === "Saqlangan avtomobillar"
                  ? "Sevimlilar saqlandi"
                  : labels.savedCars === "Сохраненные авто"
                    ? "Авто сохранено"
                    : "Saved to favorites")
              : (labels.savedCars === "Saqlangan avtomobillar"
                  ? "Sevimlilardan olib tashlandi"
                  : labels.savedCars === "Сохраненные авто"
                    ? "Удалено из избранного"
                    : "Removed from favorites"),
          );
        } catch (error) {
          toast.error(error instanceof Error ? error.message : labels.actionFailed);
        } finally {
          setIsSaving(false);
        }
      }}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-700 shadow-lg transition hover:scale-[1.02] hover:bg-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:bg-slate-950 dark:disabled:border-slate-700 dark:disabled:bg-slate-900 dark:disabled:text-slate-500",
        isFavorited && "text-rose-600",
      )}
      disabled={isSaving}
    >
      <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
    </button>
  );
}
