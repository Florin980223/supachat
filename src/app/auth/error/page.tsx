import { TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen-with-header w-full items-center justify-center p-6 md:p-10">
      <div className="glow-ring w-full max-w-sm rounded-xl">
        <Card>
          <CardHeader className="items-center text-center sm:items-start sm:text-left">
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TriangleAlertIcon className="size-5" />
            </div>

            <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
          </CardHeader>

          <CardContent>
            {params?.error ? (
              <p className="text-sm text-muted-foreground">Code error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
            )}
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
