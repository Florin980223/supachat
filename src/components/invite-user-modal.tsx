"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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
        <UserPlusIcon className="size-4" />
        <span className="hidden sm:inline">Invite User</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlusIcon className="size-4 text-muted-foreground" />
              Invite User to Room
            </DialogTitle>
            <DialogDescription>
              Enter the user ID of the person you want to invite to this chat
              room.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.userId}>
                <FieldLabel htmlFor="user-id">User ID</FieldLabel>

                <Input
                  id="user-id"
                  placeholder="e.g. 3f1a9c2e-4b7d-4e2a-9c1a-6d2f8b0e1a2b"
                  {...form.register("userId")}
                  aria-invalid={!!form.formState.errors.userId}
                />

                <FieldDescription>
                  You can find a user&apos;s ID in their Supabase profile.
                </FieldDescription>

                {form.formState.errors.userId && (
                  <FieldError errors={[form.formState.errors.userId]} />
                )}
              </Field>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  <LoadingSwap
                    isLoading={form.formState.isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <UserPlusIcon className="size-4" />
                    Invite User
                  </LoadingSwap>
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}