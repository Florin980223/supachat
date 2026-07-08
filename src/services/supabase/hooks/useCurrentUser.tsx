"use client"

import { createClient } from "@/services/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user)
      })
      .finally(() => {
        setIsLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}