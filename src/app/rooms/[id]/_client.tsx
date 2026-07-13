"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { InviteUserModal } from "@/components/invite-user-modal"
import { Message } from "@/services/supabase/actions/messages"
import { createClient } from "@/services/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"
import { Loader2Icon, MessagesSquareIcon } from "lucide-react"
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
    <div className="container mx-auto max-w-4xl h-screen-with-header border border-y-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 p-4 border-b bg-background">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">
            {room.name}
          </h1>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {connectedUsers} {connectedUsers === 1 ? "user" : "users"} online
          </p>
        </div>

        <InviteUserModal roomId={room.id} />
      </div>

      <div className="chat-scroll grow overflow-y-auto flex flex-col-reverse">
        <div className="py-2">
          {status === "loading" && (
            <p className="flex items-center justify-center gap-2 py-3 text-center text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading more messages...
            </p>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <p className="text-sm text-destructive">
                Error loading messages...
              </p>

              <Button onClick={loadMoreMessages} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          )}

          {visibleMessages.length === 0 && status !== "loading" ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessagesSquareIcon />
                </EmptyMedia>

                <EmptyTitle>No messages yet</EmptyTitle>
                <EmptyDescription>
                  Say hi to get the conversation started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            visibleMessages.map((message, index) => (
              <ChatMessage
                key={message.id}
                {...message}
                ref={index === 0 && status === "idle" ? triggerQueryRef : null}
              />
            ))
          )}
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