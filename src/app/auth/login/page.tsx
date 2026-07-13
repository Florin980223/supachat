import { LoginForm } from '@/services/supabase/components/login-form'

export default function Page() {
  return (
    <div className="relative flex min-h-screen-with-header w-full items-center justify-center overflow-hidden p-6 md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-start)]/20 blur-3xl"
      />

      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
