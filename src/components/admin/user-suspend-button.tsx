"use client";

import { ApiActionButton } from "@/components/api-action-button";
import { useLocale } from "@/components/providers";

export function UserSuspendButton({
  userId,
  isSuspended,
}: {
  userId: string;
  isSuspended: boolean;
}) {
  const { labels } = useLocale();

  return (
    <ApiActionButton
      endpoint={`/api/admin/users/${userId}`}
      payload={{ action: isSuspended ? "UNSUSPEND" : "SUSPEND" }}
      label={isSuspended ? labels.unsuspend : labels.suspend}
      successMessage={isSuspended ? labels.userRestored : labels.userSuspended}
      variant={isSuspended ? "outline" : "danger"}
    />
  );
}
