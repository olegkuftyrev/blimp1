"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContextSWR"
import PulsingBorderShader from "./components/pulsing-border-shader"
import { ArrowRight, Sparkles } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't show landing page if user is authenticated (will redirect)
  if (user) {
    return null
  }
  return (<>
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left: Text */}
          <div className="space-y-8 lg:pr-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm">
              <Sparkles className="w-4 h-4" />
              Kitchen Ops Platform
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Run a faster
                {" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  kitchen
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Real-time orders, precise timers, and performance insights in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full group">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={{ pathname: "/auth", query: { requestAccess: "1" } }}>
                <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg rounded-full bg-transparent">
                  Request access
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Always on
              </div>
              <div>No setup required</div>
              <div>Role-based access</div>
            </div>
          </div>

          {/* Right: Shader visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl scale-110" />
              <div className="relative">
                <PulsingBorderShader />
              </div>
              <div className="absolute -top-4 -right-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="absolute top-1/3 -left-6 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-1/4 -right-8 w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "2s" }} />
            </div>
          </div>
        </div>

        {/* Role cards retained below the hero for scannability */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <span className="text-2xl">👩‍🍳</span>
                Kitchen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Live queue and batch size only. Stay focused.</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <span className="text-2xl">📋</span>
                Managers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Today’s orders, SLAs, incidents—at a glance.</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <span className="text-2xl">🧑‍🍽️</span>
                Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">My shifts, tasks, and training progress.</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎯</span>
                HR & Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Assessments due and competency gaps.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2024 BLIMP. Streamlining restaurant operations.</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
    
    {/* Features Section - Kitchen domain */}
    <section className="bg-black text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            BLIMP Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Kitchen operations, simplified</h2>
          <p className="mt-4 text-gray-400">
            Tools your team actually uses—fast order flow, clear batching, and built‑in performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Live order queue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Real-time orders with statuses and ETA highlights for quick triage.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Batching made clear</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Surface batch size only on cards—no meal labels—so cooks stay focused.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Kitchen timers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Precision timers with audible cues to nail every cook window.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Performance & IDP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Competency tracking and assessments to grow skills on the line.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Audit trail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Automatic logs for actions and changes to keep ops transparent.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Role-based access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">SSO-ready permissions so each role sees exactly what they need.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <Link href="/auth">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-6">Get started</Button>
          </Link>
          <Link href="#more">
            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900 rounded-full px-6">See more</Button>
          </Link>
        </div>
      </div>
    </section>
    </>)
}