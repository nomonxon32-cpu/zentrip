import { Star } from "lucide-react";

import { formatDate } from "@/lib/utils";

export function ReviewCard({
  review,
}: {
  review: {
    rating: number;
    comment: string;
    createdAt: Date | string;
    author: { name: string };
  };
}) {
  return (
    <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950 dark:text-slate-50">{review.author.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(review.createdAt)}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {review.rating}.0
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.comment}</p>
    </div>
  );
}
