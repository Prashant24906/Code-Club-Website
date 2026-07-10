"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Code, Users, Zap } from "lucide-react"

export function Hero() {
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.4 }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-6xl mx-auto text-center">
        <div ref={headingRef} className="mb-8">
          <div className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4" style={{ color: "var(--accent-indigo)" }} />
            <span className="text-sm text-muted-foreground">PES Modern College of Engineering</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Build the <span className="gradient-text">Future</span>
            <br />
            with CoDE
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            A vibrant community of developers, designers, and tech enthusiasts. Learn, create, and innovate together.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Code, title: "Explore Tech", desc: "Discover new tools, trends, and technologies" },
            { icon: Users, title: "Build Together", desc: "Collaborate on exciting projects with peers" },
            { icon: Zap, title: "Innovate", desc: "Create solutions that make a difference" },
          ].map((item, index) => (
            <div
              key={item.title}
              className="glass-card rounded-2xl p-6 text-center float hover:scale-105 hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 2}s` }}
            >
              <item.icon className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--accent-indigo)" }} />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
