"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="mb-6 text-3xl font-semibold">Welcome to BLIMP</h1>
        <p className="mb-10 text-muted-foreground">Get started by signing in</p>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  )
}


