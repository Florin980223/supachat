'use client'

import { useState } from 'react'
import { LogInIcon, TriangleAlertIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/services/supabase/client'
import { Button } from '@/components/ui/button'
import { LoadingSwap } from '@/components/ui/loading-swap'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/protected`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('glow-ring flex flex-col gap-6 rounded-xl', className)} {...props}>
      <Card>
        <CardHeader className="items-center text-center sm:items-start sm:text-left">
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[var(--brand-end)] shadow-[0_8px_20px_-8px_var(--brand-glow)]">
            <LogInIcon className="size-5 text-white" />
          </div>

          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSocialLogin}>
            <div className="flex flex-col gap-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                <LoadingSwap isLoading={isLoading} className="flex items-center gap-2">
                  <LogInIcon className="size-4" />
                  Continue with GitHub
                </LoadingSwap>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
