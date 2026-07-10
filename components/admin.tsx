"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Lock,
  Settings,
  Users,
  Calendar,
  Brain,
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"

export function Admin() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [quizEnabled, setQuizEnabled] = useState(true)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggedIn(true)
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "events", label: "Events", icon: Calendar },
    { id: "quiz", label: "Quiz", icon: Brain },
    { id: "members", label: "Members", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const mockEvents = [
    { id: 1, title: "React Workshop", date: "2024-03-15", attendees: 45, status: "upcoming" },
    { id: 2, title: "AI Hackathon", date: "2024-03-22", attendees: 120, status: "upcoming" },
    { id: 3, title: "Tech Talk", date: "2024-02-28", attendees: 200, status: "completed" },
  ]

  const mockQuestions = [
    { id: 1, question: "What does HTML stand for?", difficulty: "Easy", category: "Web Dev" },
    { id: 2, question: "Explain React hooks", difficulty: "Medium", category: "React" },
    { id: 3, question: "What is Big O notation?", difficulty: "Hard", category: "Algorithms" },
  ]

  if (!isLoggedIn) {
    return (
      <section id="admin" className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="glass-card p-8">
              <div className="text-center mb-8">
                <Lock className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Admin Login</h2>
                <p className="text-gray-400">Access the admin dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    className="w-full glass rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full glass rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition-shadow"
                >
                  Login to Dashboard
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="admin" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Admin <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-xl text-gray-400">Manage your Code Club efficiently</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="glass-card p-6">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button onClick={() => setIsLoggedIn(false)} variant="outline" className="w-full">
                  Logout
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass-card p-6 text-center">
                    <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-gray-400">Total Members</div>
                  </Card>
                  <Card className="glass-card p-6 text-center">
                    <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">25</div>
                    <div className="text-gray-400">Events Hosted</div>
                  </Card>
                  <Card className="glass-card p-6 text-center">
                    <Brain className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">1,200</div>
                    <div className="text-gray-400">Quiz Attempts</div>
                  </Card>
                </div>

                <Card className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>New member registration: John Doe</span>
                      <span className="text-sm text-gray-400">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>Event registration: React Workshop</span>
                      <span className="text-sm text-gray-400">4 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>Quiz completed: JavaScript Basics</span>
                      <span className="text-sm text-gray-400">6 hours ago</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Manage Events</h3>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>

                <Card className="glass-card p-6">
                  <div className="space-y-4">
                    {mockEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-gray-400">
                            {event.date} • {event.attendees} attendees
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              event.status === "upcoming" ? "bg-green-600" : "bg-gray-600"
                            }`}
                          >
                            {event.status}
                          </span>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Quiz Tab */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Quiz Management</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Quiz Section:</span>
                      <button onClick={() => setQuizEnabled(!quizEnabled)} className="flex items-center">
                        {quizEnabled ? (
                          <ToggleRight className="h-6 w-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>

                <Card className="glass-card p-6">
                  <div className="space-y-4">
                    {mockQuestions.map((question) => (
                      <div key={question.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div>
                          <h4 className="font-semibold">{question.question}</h4>
                          <p className="text-sm text-gray-400">
                            {question.category} • {question.difficulty}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <Card className="glass-card p-6">
                <h3 className="text-2xl font-bold mb-6">Member Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">AC</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Alex Chen</h4>
                        <p className="text-sm text-gray-400">President • alex@university.edu</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">SJ</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Sarah Johnson</h4>
                        <p className="text-sm text-gray-400">Vice President • sarah@university.edu</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card className="glass-card p-6">
                <h3 className="text-2xl font-bold mb-6">Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Club Information</h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Club Name"
                        defaultValue="Code Club"
                        className="w-full glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                      />
                      <textarea
                        placeholder="Club Description"
                        defaultValue="A vibrant community of developers and tech enthusiasts"
                        className="w-full glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="email"
                        placeholder="Email"
                        defaultValue="codeclub@university.edu"
                        className="glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        defaultValue="+1 (555) 123-4567"
                        className="glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <Button className="bg-purple-600 hover:bg-purple-700">Save Settings</Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
