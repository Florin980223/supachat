"use client"

import { ActionButton } from "@/components/ui/action-button"
import { createClient } from "@/services/supabase/client"
import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser"
import { useRouter } from "next/navigation"
import { ComponentProps, ReactNode } from "react"

export function LeaveRoomButton({
  children,
  roomId,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & {
  children: ReactNode
  roomId: string
}) {
  const { user } = useCurrentUser()
  const router = useRouter()

  async function leaveRoom() {
    if (user == null) {
      return { error: true, message: "User not logged in" }
    }

    const supabase = createClient()

    const { error } = await supabase
      .from("chat_room_member")
      .delete()
      .eq("chat_room_id", roomId)
      .eq("member_id", user.id)

    if (error) {
      return {
        error: true,
        message: error.message || "Failed to leave room",
      }
    }

    router.refresh()
    router.push("/")

    return { error: false }
  }

  return (
    <ActionButton
      {...props}
      action={leaveRoom}
      requireAreYouSure
      areYouSureDescription="You will need to join this room again before you can send messages."
    >
      {children}
    </ActionButton>
  )
}