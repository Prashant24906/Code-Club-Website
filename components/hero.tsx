"use client"

import { motion } from "framer-motion"
import { Code, Users, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
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
            A vibrant community of developers, designers, and tech enthusiasts. Learn, create, and innovate
            together.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: Code, title: "Explore Tech", desc: "Discover new tools, trends, and technologies" },
            { icon: Users, title: "Build Together", desc: "Collaborate on exciting projects with peers" },
            { icon: Zap, title: "Innovate", desc: "Create solutions that make a difference" },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card rounded-2xl p-6 text-center float"
              style={{ animationDelay: `${index * 2}s` }}
            >
              <item.icon className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--accent-indigo)" }} />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
