"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
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

  async function handleSubmit(
    e?: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    e?.preventDefault()

    const text = message.trim()

    if (!text) return

    const id = crypto.randomUUID()

    setMessage("")
    onSend({ id, text })

    const result = await sendMessage({
      id,
      text,
      roomId,
    })

    if (result.error) {
      toast.error(result.message)
      onErrorSend(id)
      setMessage(text)
    } else {
      onSuccessfulSend(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <InputGroup>
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
          >
            <SendIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}