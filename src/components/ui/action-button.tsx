"use client"

import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { ComponentProps, ReactNode, useTransition } from "react"

type ActionResult =
  | {
      error: boolean
      message?: string
    }
  | undefined
  | void

export function ActionButton({
  action,
  children,
  disabled,
  requireAreYouSure,
  areYouSureDescription,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  action: () => Promise<ActionResult>
  children: ReactNode
  requireAreYouSure?: boolean
  areYouSureDescription?: ReactNode
}) {
  const [isLoading, startTransition] = useTransition()

  function performAction() {
    startTransition(async () => {
      const data = await action()

      if (data?.error) {
        alert(data.message ?? "Error")
      }
    })
  }

  return (
    <Button {...props} disabled={disabled || isLoading} onClick={performAction}>
      <LoadingSwap isLoading={isLoading}>{children}</LoadingSwap>
    </Button>
  )
}