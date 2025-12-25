"use client"

import ApplicationLogo from "@/Components/ApplicationLogo"
import { Link } from "@inertiajs/react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { ShieldCheck, UserPlus, Lock, Mail, Zap, Users } from "lucide-react"
import { useState } from "react"
import Autoplay from "embla-carousel-autoplay"

export default function GuestLayout({ children, currentPage = "login" }) {
  const [api, setApi] = useState(null)

  const getCarouselContent = () => {
    const contentMap = {
      login: [
        {
          icon: ShieldCheck,
          title: "Welcome Back",
          description: "Securely access your InternTrack dashboard and manage your team.",
          action: { text: "Don't have an account?", linkText: "Sign up here", href: "/register" },
        },
        {
          icon: Zap,
          title: "Track Performance",
          description: "Monitor intern progress, evaluate performance, and provide real-time feedback.",
          action: null,
        },
        {
          icon: Users,
          title: "Manage Your Team",
          description: "Centralize all intern management tasks in one powerful dashboard.",
          action: null,
        },
      ],
      register: [
        {
          icon: UserPlus,
          title: "Join InternTrack",
          description: "Create your account and start managing your internship program today.",
          action: { text: "Already have an account?", linkText: "Log in here", href: "/login" },
        },
        {
          icon: ShieldCheck,
          title: "Secure & Reliable",
          description: "Your data is protected with enterprise-grade security and encryption.",
          action: null,
        },
        {
          icon: Zap,
          title: "Get Started Fast",
          description: "Set up your workspace in minutes and invite your team members instantly.",
          action: null,
        },
      ],
      "forgot-password": [
        {
          icon: Lock,
          title: "Reset Your Password",
          description: "Enter your email address and we will send you a secure reset link.",
          action: { text: "Remember your password?", linkText: "Log in here", href: "/login" },
        },
        {
          icon: Mail,
          title: "Check Your Email",
          description: "The password reset link will arrive within a few minutes.",
          action: null,
        },
        {
          icon: ShieldCheck,
          title: "Secure Process",
          description: "All password resets are encrypted and expire after 60 minutes for your security.",
          action: null,
        },
      ],
    }

    return contentMap[currentPage] || contentMap.login
  }

  const carouselSlides = getCarouselContent()

  return (
    <div className="min-h-screen w-full flex">
      {/* LEFT – BLURRED IMAGE BACKGROUND */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: "url('/interns.png')" }}
        />

        {/* HEAVY BLUR */}
        <div className="absolute inset-0 backdrop-blur-md  bg-black/60" />

        {/* CONTENT */}
        <div className="relative z-10 w-full flex items-center justify-center p-12 translate-y-[50px]">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000 })]}
            setApi={setApi}
            className="w-full max-w-lg"
          >
            <CarouselContent>
              {carouselSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center space-y-6 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <slide.icon className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
                      <p className="text-lg text-gray-200 leading-relaxed max-w-md">
                        {slide.description}
                      </p>
                    </div>

                    {slide.action && (
                      <div className="pt-4">
                        <p className="text-sm text-gray-300">
                          {slide.action.text}{" "}
                          <Link
                            href={slide.action.href}
                            className="text-primary-300 font-semibold hover:underline"
                          >
                            {slide.action.linkText}
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className="w-2 h-2 rounded-full bg-white/40 hover:bg-white transition-all"
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>

      {/* RIGHT – FORM */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50 p-2">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-2">
            <Link href="/">
              <ApplicationLogo size={25} />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
