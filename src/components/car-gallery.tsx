"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function CarGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.filter(Boolean);
  const galleryImages = safeImages.length ? safeImages : ["/cars/default-car.jpg"];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-900">
        <img
          src={galleryImages[activeIndex]}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {galleryImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl border transition",
              activeIndex === index ? "border-slate-950 dark:border-slate-100" : "border-slate-200 dark:border-slate-800",
            )}
          >
            <img
              src={image}
              alt={`${title} ${index + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
