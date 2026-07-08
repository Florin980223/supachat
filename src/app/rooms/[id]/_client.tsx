"use client"

import { Button } from "@/components/ui/button"
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { InviteUserModal } from "@/components/invite-user-modal"
import { Message } from "@/services/supabase/actions/messages"
import { createClient } from "@/services/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useCallback, useEffect, useRef, useState } from "react"

const LIMIT = 25

type MessageStatus = "pending" | "error" | "success"

type RealtimeMessage = Message & {
  status?: MessageStatus
}

export function RoomClient({
  room,
  user,
  messages: startingMessages,
}: {
  room: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    image_url: string | null
  }
  messages: Message[]
}) {
  const {
    connectedUsers,
    messages: realtimeMessages,
  } = useRealtimeChat({
    roomId: room.id,
    userId: user.id,
  })

  const {
    loadMoreMessages,
    messages: oldMessages,
    status,
    triggerQueryRef,
  } = useInfiniteScrollChat({
    startingMessages: [...startingMessages].reverse(),
    roomId: room.id,
  })

  const [sentMessages, setSentMessages] = useState<RealtimeMessage[]>([])

  const visibleMessages = [...oldMessages]
    .reverse()
    .concat(
      realtimeMessages,
      sentMessages.filter(
        (message) =>
          !realtimeMessages.find(
            (realtimeMessage) => realtimeMessage.id === message.id
          )
      )
    )

  return (
    <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>

          <p className="text-muted-foreground text-sm">
            {connectedUsers} {connectedUsers === 1 ? "user" : "users"} online
          </p>
        </div>

        <InviteUserModal roomId={room.id} />
      </div>

      <div
        className="grow overflow-y-auto flex flex-col-reverse"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        <div>
          {status === "loading" && (
            <p className="text-center text-sm text-muted-foreground py-2">
              Loading more messages...
            </p>
          )}

          {status === "error" && (
            <div className="text-center py-2">
              <p className="text-sm text-destructive py-2">
                Error loading messages...
              </p>

              <Button onClick={loadMoreMessages} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {visibleMessages.map((message, index) => (
            <ChatMessage
              key={message.id}
              {...message}
              ref={index === 0 && status === "idle" ? triggerQueryRef : null}
            />
          ))}
        </div>
      </div>

      <ChatInput
        roomId={room.id}
        onSend={(message) => {
          setSentMessages((prev) => [
            ...prev,
            {
              id: message.id,
              text: message.text,
              created_at: new Date().toISOString(),
              author_id: user.id,
              author: {
                name: user.name,
                image_url: user.image_url,
              },
              status: "pending",
            },
          ])
        }}
        onSuccessfulSend={(message) => {
          setSentMessages((prev) =>
            prev.map((m) =>
              m.id === message.id
                ? {
                    ...message,
                    status: "success",
                  }
                : m
            )
          )
        }}
        onErrorSend={(id) => {
          setSentMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    status: "error",
                  }
                : m
            )
          )
        }}
      />
    </div>
  )
}

function useRealtimeChat({
  roomId,
  userId,
}: {
  roomId: string
  userId: string
}) {
  const [connectedUsers, setConnectedUsers] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const supabase = createClient()
    let newChannel: RealtimeChannel | undefined
    let isMounted = true

    supabase.realtime.setAuth().then(() => {
      if (!isMounted) return

      newChannel = supabase.channel(`room:${roomId}:messages`, {
        config: {
          private: true,
          presence: {
            key: userId,
          },
        },
      })

      newChannel
        .on("presence", { event: "sync" }, () => {
          if (newChannel == null) return

          setConnectedUsers(Object.keys(newChannel.presenceState()).length)
        })
        .on("broadcast", { event: "INSERT" }, (payload) => {
          const record = payload.payload.record

          const newMessage: Message = {
            id: record.id,
            text: record.text,
            created_at: record.created_at,
            author_id: record.author_id,
            author: {
              name: record.author_name,
              image_url: record.author_image_url,
            },
          }

          setMessages((prevMessages) => {
            if (prevMessages.find((message) => message.id === newMessage.id)) {
              return prevMessages
            }

            return [...prevMessages, newMessage]
          })
        })
        .subscribe((status) => {
          if (status !== "SUBSCRIBED") return
          if (newChannel == null) return

          newChannel.track({
            userId,
          })
        })
    })

    return () => {
      isMounted = false
      newChannel?.unsubscribe()
    }
  }, [roomId, userId])

  return {
    connectedUsers,
    messages,
  }
}

function useInfiniteScrollChat({
  startingMessages,
  roomId,
}: {
  startingMessages: Message[]
  roomId: string
}) {
  const [messages, setMessages] = useState<Message[]>(startingMessages)
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    startingMessages.length === 0 ? "done" : "idle"
  )

  const observerRef = useRef<IntersectionObserver | null>(null)

  async function loadMoreMessages() {
    if (status === "done" || status === "loading") return

    const oldestMessage = messages[0]

    if (oldestMessage == null) {
      setStatus("done")
      return
    }

    const supabase = createClient()

    setStatus("loading")

    const { data, error } = await supabase
      .from("message")
      .select(
        "id, text, created_at, author_id, author:user_profile(name, image_url:image)"
      )
      .eq("chat_room_id", roomId)
      .lt("created_at", oldestMessage.created_at)
      .order("created_at", { ascending: false })
      .limit(LIMIT)

    if (error) {
      setStatus("error")
      return
    }

    const newMessages = [...((data ?? []) as unknown as Message[])].reverse()

    setMessages((prevMessages) => [...newMessages, ...prevMessages])

    if (newMessages.length < LIMIT) {
      setStatus("done")
    } else {
      setStatus("idle")
    }
  }

  const triggerQueryRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node == null) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target === node) {
              observer.unobserve(node)
              loadMoreMessages()
            }
          })
        },
        {
          rootMargin: "50px",
        }
      )

      observer.observe(node)

      observerRef.current = observer

      return () => {
        observer.disconnect()
      }
    },
    [messages, status]
  )

  return {
    loadMoreMessages,
    messages,
    status,
    triggerQueryRef,
  }
}