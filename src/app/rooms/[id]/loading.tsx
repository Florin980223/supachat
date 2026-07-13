function SkeletonMessage({ align = "start" }: { align?: "start" | "end" }) {
  return (
    <div
      className={
        "flex gap-3 mx-2 px-2 py-2" +
        (align === "end" ? " flex-row-reverse" : "")
      }
    >
      <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex grow flex-col gap-1.5">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl h-screen-with-header border border-y-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 p-4 border-b">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-8 w-8 animate-pulse rounded-md bg-muted sm:w-28" />
      </div>

      <div className="grow overflow-hidden flex flex-col-reverse py-2">
        <div>
          <SkeletonMessage />
          <SkeletonMessage />
          <SkeletonMessage />
        </div>
      </div>

      <div className="border-t p-3">
        <div className="h-10 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  )
}
