import { notFound } from "next/navigation"
import { RoomClient } from "./_client"
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { createAdminClient } from "@/services/supabase/server"
import { Message } from "@/services/supabase/actions/messages"

const LIMIT = 25

type Room = {
  id: string
  name: string
}

type ChatRoomRow = {
  id: string
  name: string
  owner_id: string | null
}

type UserProfile = {
  id: string
  name: string
  image_url: string | null
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const currentUser = await getCurrentUser()

  if (currentUser == null) {
    return notFound()
  }

  const [room, user, messages] = await Promise.all([
    getRoom(id, currentUser.id),
    getUser(currentUser.id),
    getMessages(id),
  ])

  if (room == null || user == null) {
    return notFound()
  }

  return <RoomClient room={room} user={user} messages={messages} />
}

async function getRoom(id: string, currentUserId: string): Promise<Room | null> {
  const supabase = await createAdminClient()

  const { data: roomData, error: roomError } = await supabase
    .from("chat_room")
    .select("id, name, owner_id")
    .eq("id", id)
    .maybeSingle()

  if (roomError || roomData == null) {
    return null
  }

  const room = roomData as unknown as ChatRoomRow

  if (room.owner_id === currentUserId) {
    return {
      id: room.id,
      name: room.name,
    }
  }

  const { data: membershipData, error: membershipError } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", id)
    .eq("member_id", currentUserId)
    .limit(1)

  if (membershipError || membershipData == null || membershipData.length === 0) {
    return null
  }

  return {
    id: room.id,
    name: room.name,
  }
}

async function getUser(currentUserId: string): Promise<UserProfile | null> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("user_profile")
    .select("id, name, image_url:image")
    .eq("id", currentUserId)
    .maybeSingle()

  if (error || data == null) {
    return null
  }

  const userProfile = data as unknown as UserProfile

  return {
    id: userProfile.id,
    name: userProfile.name,
    image_url: userProfile.image_url,
  }
}

async function getMessages(roomId: string): Promise<Message[]> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("message")
    .select(
      "id, text, created_at, author_id, author:user_profile(name, image_url:image)"
    )
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(LIMIT)

  if (error || data == null) {
    return []
  }

  return data as unknown as Message[]
}