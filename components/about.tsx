"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Target, Lightbulb, Heart, Trophy } from "lucide-react"

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description: "Empowering students to become skilled developers and innovators in the tech industry.",
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "Fostering creativity and out-of-the-box thinking in every project we undertake.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Building lasting friendships and professional networks through shared passion for coding.",
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "Striving for the highest standards in code quality, design, and project execution.",
    },
  ]

  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Code Club</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            We are a passionate community of students dedicated to learning, building, and sharing knowledge in the
            world of technology and programming.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass-card rounded-2xl p-6 text-center group cursor-pointer"
            >
              <div className="mb-4 relative">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))` }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 glass-card rounded-3xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why Join Code Club?</h3>
              <div className="space-y-4">
                {[
                  "Learn cutting-edge technologies and programming languages",
                  "Work on real-world projects that make an impact",
                  "Network with like-minded students and industry professionals",
                  "Participate in hackathons and coding competitions",
                  "Access to exclusive workshops and tech talks",
                  "Build an impressive portfolio for your career",
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-blue)" }}></div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative ">
              <div className="glass rounded-2xl p-6 float bg-black">
                <div className="flex flex-col justify-center items-center gap-4">
                  <div
                    style={{
                      width: "180px",
                      height: "180px",
                      borderRadius: "1.5rem",
                      background: "rgba(0,0,0,0.3)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/codeclub1.png"
                      alt="Code Club Stats"
                      style={{ width: "140px", height: "140px", objectFit: "contain" }}
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-2xl font-bold ">CoDE Club</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
