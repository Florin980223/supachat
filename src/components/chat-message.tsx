import { Message } from "@/services/supabase/actions/messages"
import { cn } from "@/lib/utils"
import { CircleAlertIcon, Loader2Icon, User2Icon } from "lucide-react"
import Image from "next/image"
import { forwardRef } from "react"

const DATE_FORMATTER = new Intl.DateTimeFormat("ro-RO", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
})

type ChatMessageProps = Message & {
  status?: "pending" | "error" | "success"
  isOwnMessage?: boolean
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  function ChatMessage(
    { text, author, created_at, status, isOwnMessage = false },
    ref
  ) {
    const bubbleClass =
      status === "error"
        ? "bg-destructive/15 text-destructive ring-1 ring-destructive/30"
        : isOwnMessage
          ? "bg-gradient-to-br from-primary to-[var(--brand-end)] text-white"
          : "bg-card text-card-foreground ring-1 ring-foreground/10"

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-end gap-2 px-3 py-1",
          isOwnMessage ? "flex-row-reverse" : "flex-row",
          status === "pending" && "opacity-60"
        )}
      >
        {!isOwnMessage && (
          <div className="shrink-0">
            {author.image_url != null ? (
              <Image
                src={author.image_url}
                alt={author.name}
                width={32}
                height={32}
                className="size-8 rounded-full"
              />
            ) : (
              <div className="flex size-8 items-center justify-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
                <User2Icon className="size-5" />
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex max-w-[75%] flex-col gap-0.5 sm:max-w-[65%]",
            isOwnMessage ? "items-end" : "items-start"
          )}
        >
          {!isOwnMessage && (
            <span className="px-1 text-xs font-medium text-muted-foreground">
              {author.name}
            </span>
          )}

          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm wrap-break-word whitespace-pre",
              isOwnMessage ? "rounded-br-sm" : "rounded-bl-sm",
              bubbleClass
            )}
          >
            {text}
          </div>

          <div className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
            {DATE_FORMATTER.format(new Date(created_at))}

            {status === "pending" && (
              <Loader2Icon className="size-3 animate-spin" />
            )}

            {status === "error" && (
              <span className="flex items-center gap-0.5 text-destructive">
                <CircleAlertIcon className="size-3" />
                Failed to send
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
)
