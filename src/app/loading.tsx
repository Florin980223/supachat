function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
    </div>
  )
}

function SkeletonSection() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      <SkeletonSection />
      <SkeletonSection />
    </div>
  )
}
