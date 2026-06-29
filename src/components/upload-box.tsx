"use client";

import { useRef, useState } from "react";
import { LoaderCircle, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/providers";
import { acceptedUploadTypes, MAX_UPLOAD_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type UploadBoxProps = {
  label: string;
  folder: string;
  multiple?: boolean;
  value: string[];
  onChange: (urls: string[]) => void;
};

export function UploadBox({
  label,
  folder,
  multiple = false,
  value,
  onChange,
}: UploadBoxProps) {
  const { labels } = useLocale();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!acceptedUploadTypes.includes(file.type)) {
          throw new Error("Unsupported file type. Upload JPG, JPEG, PNG, WEBP, or PDF.");
        }

        if (file.size > MAX_UPLOAD_SIZE) {
          throw new Error("File exceeds the 4 MB upload limit.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as { success?: boolean; url?: string; error?: string };
        if (!response.ok || !payload.success || !payload.url) {
          throw new Error(payload.error ?? labels.actionFailed);
        }

        uploadedUrls.push(payload.url);
      }

      onChange(multiple ? [...value, ...uploadedUrls] : uploadedUrls.slice(0, 1));
      toast.success(labels.uploadsSaved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.actionFailed);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-sky-300 hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-900",
          "px-4 py-8 sm:px-6 sm:py-10",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        {isUploading ? (
          <LoaderCircle className="h-8 w-8 animate-spin text-sky-600" />
        ) : (
          <UploadCloud className="h-8 w-8 text-sky-600" />
        )}
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-50">{labels.uploadJpgPdf}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{labels.maxSize}</p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={(event) => void handleUpload(event.target.files)}
        className="hidden"
      />

      {value.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((url, index) => {
            const isPdf = url.split("?")[0].toLowerCase().endsWith(".pdf");
            return (
              <div key={`${url}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => onChange(value.filter((item) => item !== url))}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-1 text-slate-700 shadow dark:bg-slate-950/90 dark:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
                {isPdf ? (
                  <div className="flex h-36 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    {labels.pdfUploaded}
                  </div>
                ) : (
                  <div className="relative h-36">
                    <img src={url} alt="Upload preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
