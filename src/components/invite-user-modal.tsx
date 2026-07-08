"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { addUserToRoom } from "@/services/supabase/actions/rooms"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required").trim(),
})

type FormData = z.infer<typeof formSchema>

export function InviteUserModal({ roomId }: { roomId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  })

  async function onSubmit(data: FormData) {
    const res = await addUserToRoom({
      roomId,
      userId: data.userId,
    })

    if (res.error) {
      toast.error(res.message)
      return
    }

    toast.success("User invited")
    form.reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <UserPlusIcon className="w-4 h-4" />
        Invite User
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User to Room</DialogTitle>
            <DialogDescription>
              Enter the user ID of the person you want to invite to this chat
              room.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="user-id" className="text-sm font-medium">
                User ID
              </label>

              <Input
                id="user-id"
                {...form.register("userId")}
                aria-invalid={!!form.formState.errors.userId}
              />

              {form.formState.errors.userId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.userId.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="grow"
                disabled={form.formState.isSubmitting}
              >
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  Invite User
                </LoadingSwap>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}