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
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  function ChatMessage({ text, author, created_at, status }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 rounded-lg mx-2 px-2 py-2 transition-colors hover:bg-accent/50",
          status === "pending" && "opacity-60",
          status === "error" && "bg-destructive/10 hover:bg-destructive/10"
        )}
      >
        <div className="shrink-0">
          {author.image_url != null ? (
            <Image
              src={author.image_url}
              alt={author.name}
              width={40}
              height={40}
              className="rounded-full size-10"
            />
          ) : (
            <div className="size-10 rounded-full flex items-center justify-center border bg-muted text-muted-foreground overflow-hidden">
              <User2Icon className="size-[30px] mt-2" />
            </div>
          )}
        </div>

        <div className="grow space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{author.name}</span>

            <span className="text-xs text-muted-foreground">
              {DATE_FORMATTER.format(new Date(created_at))}
            </span>

            {status === "pending" && (
              <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
            )}
          </div>

          <p className="text-sm wrap-break-word whitespace-pre">{text}</p>

          {status === "error" && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <CircleAlertIcon className="size-3" />
              Failed to send
            </p>
          )}
        </div>
      </div>
    )
  }
)