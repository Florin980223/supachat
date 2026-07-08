"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createRoomSchema } from "../schemas/rooms"
import { getCurrentUser } from "../lib/getCurrentUser"
import { createAdminClient } from "../server"

export async function createRoom(
  unsafeData: z.infer<typeof createRoomSchema>
) {
  const { success, data } = createRoomSchema.safeParse(unsafeData)

  if (!success) {
    return { error: true, message: "Invalid room data" }
  }

  const currentUser = await getCurrentUser()

  if (currentUser == null) {
    return { error: true, message: "User not authenticated" }
  }

  const supabase = await createAdminClient()

  const { data: room, error: roomError } = await supabase
    .from("chat_room")
    .insert({
      name: data.name,
      is_public: data.isPublic,
      owner_id: currentUser.id,
    })
    .select("id")
    .single()

  if (roomError) {
    return { error: true, message: roomError.message }
  }

  const { error: memberError } = await supabase
    .from("chat_room_member")
    .insert({
      chat_room_id: room.id,
      member_id: currentUser.id,
    })

  if (memberError) {
    return { error: true, message: memberError.message }
  }

  redirect(`/rooms/${room.id}`)
}

export async function addUserToRoom({
  roomId,
  userId,
}: {
  roomId: string
  userId: string
}) {
  const currentUser = await getCurrentUser()

  if (currentUser == null) {
    return { error: true, message: "User not authenticated" }
  }

  if (!roomId || !userId) {
    return { error: true, message: "Invalid room or user" }
  }

  const supabase = await createAdminClient()

  const { data: roomMembership, error: roomMembershipError } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", roomId)
    .eq("member_id", currentUser.id)
    .maybeSingle()

  if (roomMembershipError || roomMembership == null) {
    return {
      error: true,
      message: "Current user is not a member of the room",
    }
  }

  const { data: userProfile, error: userProfileError } = await supabase
    .from("user_profile")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (userProfileError || userProfile == null) {
    return { error: true, message: "User not found" }
  }

  const { data: existingMembership, error: existingMembershipError } =
    await supabase
      .from("chat_room_member")
      .select("member_id")
      .eq("chat_room_id", roomId)
      .eq("member_id", userId)
      .maybeSingle()

  if (existingMembershipError) {
    return { error: true, message: existingMembershipError.message }
  }

  if (existingMembership != null) {
    return { error: true, message: "User is already a member of this room" }
  }

  const { error } = await supabase.from("chat_room_member").insert({
    chat_room_id: roomId,
    member_id: userId,
  })

  if (error) {
    return { error: true, message: error.message }
  }

  return { error: false }
}