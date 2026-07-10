"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Linkedin, Instagram, Send, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  message: "",
}

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/codeclubaiml/", label: "LinkedIn", color: "hover:text-blue-500" },
    { icon: Instagram, href: "https://www.instagram.com/codeclub_pesmcoe?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", label: "Instagram", color: "hover:text-pink-400" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Message sent successfully!")
        setFormData(initialFormData)
        setIsSubmitted(true)
      } else {
        toast.error("Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Have questions? Want to join our community? We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-8">
              {isSubmitted ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-400 mb-5">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">We received your message</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for contacting us. We will get back to you soon.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full md:w-auto px-6 py-3"
                    style={{ background: `linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))` }}
                  >
                    Submit Another Response
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                      />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                    />
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                    />
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all resize-none"
                    />
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3"
                        style={{ background: `linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))` }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isLoading ? "Sending..." : "Send Message"}
                      </Button>
                    </motion.div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
         {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 glass-card rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
              <p className="text-muted-foreground">Follow us for updates, events, and highlights.</p>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  aria-label={social.label}
                  className={`inline-flex items-center justify-center h-11 w-11 rounded-full glass hover:bg-white/10 transition-all ${social.color}`}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
