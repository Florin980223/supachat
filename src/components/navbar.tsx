"use client"

import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/services/supabase/components/logout-button"
import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser"
import { MessagesSquareIcon, User2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const { user, isLoading } = useCurrentUser()

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = user?.user_metadata?.preferred_username || user?.email

  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-md shadow-[0_8px_30px_-24px_var(--brand-glow)] supports-backdrop-filter:bg-background/60 h-header">
      <nav className="container mx-auto max-w-6xl px-4 sm:px-6 flex justify-between items-center h-full gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight sm:text-xl"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[var(--brand-end)] shadow-[0_6px_16px_-6px_var(--brand-glow)]">
            <MessagesSquareIcon className="size-4 text-white" />
          </span>
          <span className="text-gradient-brand">Supachat</span>
        </Link>

        {isLoading ? (
          <div className="size-8 rounded-full bg-muted animate-pulse" />
        ) : user == null ? (
          <Button asChild size="sm">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName ?? "User avatar"}
                  width={28}
                  height={28}
                  className="size-7 shrink-0 rounded-full ring-1 ring-border"
                />
              ) : (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                  <User2Icon className="size-4" />
                </div>
              )}

              <span className="max-w-40 truncate text-sm text-muted-foreground">
                {displayName}
              </span>
            </div>

            <LogoutButton />
          </div>
        )}
      </nav>
    </div>
  )
}