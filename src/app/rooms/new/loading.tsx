export default function Loading() {
  return (
    <div className="container mx-auto max-w-lg px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col gap-(--card-spacing) rounded-xl py-(--card-spacing) [--card-spacing:--spacing(4)] ring-1 ring-foreground/10">
        <div className="flex flex-col gap-2 px-(--card-spacing)">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>

        <div className="flex flex-col gap-5 px-(--card-spacing)">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-56 animate-pulse rounded bg-muted" />
          </div>

          <div className="flex gap-2">
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
