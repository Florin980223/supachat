function SkeletonBubble({
  align = "start",
  width = "w-40",
}: {
  align?: "start" | "end"
  width?: string
}) {
  const isEnd = align === "end"

  return (
    <div
      className={
        "flex items-end gap-2 px-3 py-1" + (isEnd ? " flex-row-reverse" : "")
      }
    >
      {!isEnd && (
        <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
      )}

      <div className={`h-9 ${width} animate-pulse rounded-2xl bg-muted`} />
    </div>
  )
}

export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl h-screen-with-header border border-y-0 flex flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />

        <div className="flex flex-col gap-2">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>

        <div className="ml-auto h-8 w-8 animate-pulse rounded-md bg-muted sm:w-28" />
      </div>

      <div className="grow overflow-hidden flex flex-col-reverse py-2">
        <div>
          <SkeletonBubble align="start" width="w-48" />
          <SkeletonBubble align="end" width="w-32" />
          <SkeletonBubble align="start" width="w-56" />
          <SkeletonBubble align="start" width="w-24" />
          <SkeletonBubble align="end" width="w-44" />
        </div>
      </div>

      <div className="border-t p-3">
        <div className="h-10 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  )
}
