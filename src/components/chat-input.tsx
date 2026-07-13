"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { Message, sendMessage } from "@/services/supabase/actions/messages"
import { SendIcon } from "lucide-react"
import { FormEvent, KeyboardEvent, useState } from "react"
import { toast } from "sonner"

type Props = {
  roomId: string
  onSend: (message: { id: string; text: string }) => void
  onSuccessfulSend: (message: Message) => void
  onErrorSend: (id: string) => void
}

export function ChatInput({
  roomId,
  onSend,
  onSuccessfulSend,
  onErrorSend,
}: Props) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(
    e?: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    e?.preventDefault()

    const text = message.trim()

    if (!text || isSending) return

    const id = crypto.randomUUID()

    setMessage("")
    setIsSending(true)
    onSend({ id, text })

    const result = await sendMessage({
      id,
      text,
      roomId,
    })

    setIsSending(false)

    if (result.error) {
      toast.error(result.message)
      onErrorSend(id)
      setMessage(text)
    } else {
      onSuccessfulSend(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-3">
      <InputGroup className="rounded-2xl">
        <InputGroupTextarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="field-sizing-content min-h-auto"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSubmit(e)
            }
          }}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            aria-label="Send"
            title="Send"
            size="icon-sm"
            disabled={isSending || !message.trim()}
          >
            <LoadingSwap isLoading={isSending}>
              <SendIcon />
            </LoadingSwap>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
