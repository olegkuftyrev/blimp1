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
import { ArrowRight, Sparkles, ArrowLeft } from "lucide-react"
import { useRef } from "react"
import GetStartedButton from "@/components/GetStartedButton"

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const testimonialsRef = useRef<HTMLDivElement | null>(null)

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
    <div className="relative min-h-screen bg-black text-white overflow-hidden" data-theme="dark">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] sm:min-h-[80vh]">
          {/* Left: Text */}
          <div className="space-y-6 sm:space-y-8 lg:pr-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm">
              <Sparkles className="w-4 h-4" />
              Kitchen Ops Platform
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Run a smarter
                {" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  store
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Real-time orders, precise timers, and performance insights in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link href="/auth">
                <GetStartedButton />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-6 sm:pt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Always on
              </div>
              <div>No setup required</div>
              <div>Role-based access</div>
            </div>
          </div>

          {/* Right: Shader visual */}
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl scale-110" />
              <div className="relative">
                <PulsingBorderShader />
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="absolute top-1/3 -left-3 sm:-left-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-1/4 -right-4 sm:-right-8 w-3 h-3 sm:w-4 sm:h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "2s" }} />
            </div>
          </div>
        </div>

        {/* Role cards retained below the hero for scannability */}
    

   
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
    
    {/* Features Section - Kitchen domain */}
    <section className="bg-black text-white dark:bg-black dark:text-white" data-theme="dark">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            BLIMP Features
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Complete operations platform</h2>
          <p className="mt-4 text-gray-400 text-sm sm:text-base">
            Everything you need to run a successful business—from kitchen operations to staff management and analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Kitchen Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Real-time order queue, precision timers, and batching tools to streamline kitchen workflow.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Complete staff oversight with scheduling, performance tracking, and role-based permissions.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Analytics & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Comprehensive insights with profit/loss tracking, performance metrics, and operational analytics.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Learning & Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">IDP tracking, competency assessments, and skill development programs for team growth.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Inventory & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Streamlined inventory management with compliance tracking and automated audit trails.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b0c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Customer & Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">End-to-end customer management with delivery coordination and customer service tools.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          <Link href="/auth">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-6 w-full sm:w-auto">Get started</Button>
          </Link>
          <Link href="#more">
            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900 rounded-full px-6 w-full sm:w-auto">See more</Button>
          </Link>
        </div>
      </div>
    </section>
    {/* FAQs (moved to end) */}
    <section className="bg-black text-white dark:bg-black dark:text-white" data-theme="dark">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            FAQs
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Frequently asked questions</h3>
          <p className="mt-4 text-gray-400 text-sm sm:text-base">Advice and answers from our team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[
            {
              q: "What industries can benefit from BLIMP?",
              a: "Restaurants and hospitality teams of all sizes—kitchens, FOH, and multi-location ops.",
            },
            {
              q: "How do you ensure data privacy and security?",
              a: "We adhere to strict data privacy practices and implement robust security measures.",
            },
            {
              q: "Can BLIMP be customized to fit our needs?",
              a: "Yes. Roles, views, and workflows are configurable to match your operation.",
            },
            {
              q: "Do you provide ongoing support?",
              a: "We offer comprehensive support to ensure smooth operation and adoption.",
            },
            {
              q: "How do we get started?",
              a: "Sign in or request access to schedule a quick onboarding session.",
            },
            {
              q: "Is it hard to implement?",
              a: "No. Most teams are live in days with minimal setup required.",
            },
          ].map((i) => (
            <Card key={i.q} className="bg-[#0b0b0c] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-xl leading-snug">{i.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">{i.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    

    {/* Testimonials */}
    <section className="bg-[#0b0b0c] text-white dark:bg-[#0b0b0c] dark:text-white" data-theme="dark">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold">What our clients say</h3>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-900"
              size="icon"
              onClick={() => testimonialsRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-900"
              size="icon"
              onClick={() => testimonialsRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={testimonialsRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* hide scrollbar on WebKit */}
          <style jsx>{`
            section :global(div::-webkit-scrollbar) { display: none; }
          `}</style>
          {[{
            quote: "Our team's productivity soared. The simple, focused queue kept everyone aligned during service.",
            name: "Emily Rodriguez",
            role: "Ops Manager, PinPoint",
            initials: "ER",
          }, {
            quote: "Timers and batching removed chaos. We spend less time navigating and more time cooking.",
            name: "David Patel",
            role: "Head Chef, Hues",
            initials: "DP",
          }, {
            quote: "Remarkable results since adopting BLIMP—automated tasks and clear insights from our line.",
            name: "Rachel Kim",
            role: "GM, Greenish",
            initials: "RK",
          },{
            quote: "Order history and audit trail gave us clarity during rush hours—no more guesswork.",
            name: "Liam Chen",
            role: "Owner, Riverhouse",
            initials: "LC",
          },{
            quote: "Role-based access kept the line clean. Staff only sees what matters.",
            name: "Sara Lopez",
            role: "FOH Lead, Vista",
            initials: "SL",
          }].map((t) => (
            <div key={t.name} className="min-w-[280px] sm:min-w-[300px] md:min-w-[420px] lg:min-w-[520px] snap-start">
              <Card className="h-full bg-black border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed">"{t.quote}"</p>
                </CardContent>
                <div className="border-t border-gray-800">
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-semibold">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm text-white">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>)
}