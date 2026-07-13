import { JoinRoomButton } from "@/components/join-room-button"
import { LeaveRoomButton } from "@/components/leave-room-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser"
import { createAdminClient } from "@/services/supabase/server"
import { MessagesSquareIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

type Room = {
  id: string
  name: string
  memberCount: number
}

export default async function Home() {
  const user = await getCurrentUser()

  if (user == null) {
    redirect("/auth/login")
  }

  const [publicRooms, joinedRooms] = await Promise.all([
    getPublicRooms(),
    getJoinedRooms(user.id),
  ])

  const availablePublicRooms = publicRooms.filter(
    (room) => !joinedRooms.some((joinedRoom) => joinedRoom.id === room.id)
  )

  if (publicRooms.length === 0 && joinedRooms.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-gradient-to-br from-primary to-[var(--brand-end)] text-white"
            >
              <MessagesSquareIcon />
            </EmptyMedia>

            <EmptyTitle>No Chat Rooms</EmptyTitle>

            <EmptyDescription>
              Create a new chat room to get started
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Button asChild>
              <Link href="/rooms/new">Create Room</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-gradient-brand text-2xl font-semibold tracking-tight sm:text-3xl">
          Chat Rooms
        </h1>
        <p className="text-sm text-muted-foreground">
          Jump back into a room you&apos;ve joined, or discover a new one.
        </p>
      </div>

      <RoomList
        title="Your Rooms"
        rooms={joinedRooms}
        isJoined
        emptyMessage="You haven't joined any rooms yet."
      />

      <RoomList
        title="Public Rooms"
        rooms={availablePublicRooms}
        emptyMessage="No public rooms available right now."
      />
    </div>
  )
}

function RoomList({
  title,
  rooms,
  isJoined = false,
  emptyMessage,
}: {
  title: string
  rooms: Room[]
  isJoined?: boolean
  emptyMessage: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

        <Button asChild size="sm" className="self-start sm:self-auto">
          <Link href="/rooms/new">Create Room</Link>
        </Button>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          {rooms.map((room) => (
            <RoomCard {...room} key={room.id} isJoined={isJoined} />
          ))}
        </div>
      )}
    </div>
  )
}

function RoomCard({
  id,
  name,
  memberCount,
  isJoined,
}: Room & {
  isJoined: boolean
}) {
  return (
    <Card className="group/room-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-24px_var(--brand-glow)] hover:ring-primary/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[var(--brand-end)] text-sm font-semibold text-white shadow-[0_4px_12px_-4px_var(--brand-glow)]">
            {name.trim().charAt(0).toUpperCase() || "#"}
          </div>

          <CardTitle className="truncate">{name}</CardTitle>
        </div>

        <CardDescription>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
              isJoined
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardFooter className="gap-2">
        {isJoined ? (
          <>
            <Button asChild className="grow" size="sm">
              <Link href={`/rooms/${id}`}>Enter</Link>
            </Button>

            <LeaveRoomButton roomId={id} size="sm" variant="destructive">
              Leave
            </LeaveRoomButton>
          </>
        ) : (
          <JoinRoomButton
            roomId={id}
            variant="outline"
            className="grow"
            size="sm"
          >
            Join
          </JoinRoomButton>
        )}
      </CardFooter>
    </Card>
  )
}

async function getPublicRooms() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member(count)")
    .eq("is_public", true)
    .order("name", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  return data.map((room) => ({
    id: room.id,
    name: room.name,
    memberCount: room.chat_room_member[0]?.count ?? 0,
  }))
}

async function getJoinedRooms(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member(member_id)")
    .order("name", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  return data
    .filter((room) =>
      room.chat_room_member.some((member) => member.member_id === userId)
    )
    .map((room) => ({
      id: room.id,
      name: room.name,
      memberCount: room.chat_room_member.length,
    }))
}