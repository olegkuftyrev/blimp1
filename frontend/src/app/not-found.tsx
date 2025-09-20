import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-destructive">404</CardTitle>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <Button className="w-full">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/kitchen">
              <Button variant="outline" className="w-full">
                Go to Kitchen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
