"use client";

import { useRef } from "react";

type ConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "danger" | "default";
};

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition"
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        className="surface-card w-full max-w-md rounded-[2rem] p-0 backdrop:bg-slate-950/45 dark:bg-slate-900"
      >
        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                await onConfirm();
                dialogRef.current?.close();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                variant === "danger"
                  ? "btn-danger"
                  : "btn-primary",
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
