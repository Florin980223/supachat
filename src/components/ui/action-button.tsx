"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { ComponentProps, ReactNode, useState, useTransition } from "react"

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
  const [confirmOpen, setConfirmOpen] = useState(false)

  function performAction() {
    startTransition(async () => {
      const data = await action()

      if (data?.error) {
        alert(data.message ?? "Error")
      }
    })
  }

  return (
    <>
      <Button
        {...props}
        disabled={disabled || isLoading}
        onClick={() => {
          if (requireAreYouSure) {
            setConfirmOpen(true)
            return
          }

          performAction()
        }}
      >
        <LoadingSwap isLoading={isLoading}>{children}</LoadingSwap>
      </Button>

      {requireAreYouSure && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {areYouSureDescription ?? "This action cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setConfirmOpen(false)
                  performAction()
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
