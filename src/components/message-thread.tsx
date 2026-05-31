import { cn, formatDate } from "@/lib/utils";

export function MessageThread({
  messages,
  currentUserId,
  composer,
}: {
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    senderId: string;
    sender: { name: string };
  }>;
  currentUserId: string;
  composer?: React.ReactNode;
}) {
  return (
    <div className="surface-card space-y-4 rounded-[2rem] p-5 dark:bg-slate-900">
      <div className="space-y-3">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-[1.5rem] px-4 py-3 text-sm shadow-sm",
                  isOwnMessage
                    ? "bg-slate-950 !text-white dark:bg-white dark:!text-slate-950"
                    : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
                )}
              >
                <p
                  className={cn(
                    "mb-1 text-xs font-semibold",
                    isOwnMessage
                      ? "text-slate-200 dark:text-slate-700"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  {message.sender.name} / {formatDate(message.createdAt, "dd MMM, HH:mm")}
                </p>
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>
      {composer}
    </div>
  );
}
