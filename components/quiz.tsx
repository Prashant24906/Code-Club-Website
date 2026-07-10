"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Trophy, Clock, Users, Play, Settings } from "lucide-react"

export function Quiz() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [quizEnabled, setQuizEnabled] = useState(true)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const sampleQuestions = [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlink and Text Markup Language",
      ],
      correct: 0,
    },
    {
      question: "Which of the following is a JavaScript framework?",
      options: ["React", "HTML", "CSS", "Python"],
      correct: 0,
    },
    {
      question: "What is the purpose of CSS?",
      options: ["To add interactivity", "To style web pages", "To create databases", "To handle server requests"],
      correct: 1,
    },
  ]

  const handleStartQuiz = () => {
    setShowRegistration(false)
    setShowQuiz(true)
    setCurrentQuestion(0)
    setShowResults(false)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
      setShowQuiz(false)
    }
  }

  if (!quizEnabled) {
    return (
      <section id="quiz" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-3xl p-12"
          >
            <Brain className="h-16 w-16 text-gray-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-gray-400">Quiz Section</h2>
            <p className="text-gray-500 mb-6">The quiz section is currently disabled by the admin.</p>
            <div className="flex justify-center">
              <Button
                onClick={() => setQuizEnabled(true)}
                className="glass border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Enable Quiz (Admin)
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Test Your <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto text-pretty">
            Challenge yourself with our coding quizzes and track your progress
          </p>
        </motion.div>

        {/* Admin Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Button
            onClick={() => setQuizEnabled(false)}
            className="glass border-red-500/50 text-red-400 hover:bg-red-500/10 mr-4"
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Disable Quiz (Admin)
          </Button>
        </motion.div>

        {!showRegistration && !showQuiz && !showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Quiz Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Ready to Test Your Knowledge?</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-400" />
                    <span>30 minutes duration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span>Multiple choice questions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-5 w-5 text-purple-400" />
                    <span>Instant results and feedback</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span>Compete with other members</span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowRegistration(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition-shadow"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </motion.div>

            {/* Quiz Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card rounded-2xl p-8"
            >
              <h4 className="text-xl font-bold mb-4">Sample Question</h4>
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <p className="text-lg mb-4">What does HTML stand for?</p>
                <div className="space-y-2">
                  {[
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Home Tool Markup Language",
                    "Hyperlink and Text Markup Language",
                  ].map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        index === 0 ? "bg-purple-600/20 border border-purple-500/50" : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-400">This is just a preview. Register to take the full quiz!</div>
            </motion.div>
          </div>
        )}

        {/* Registration Form */}
        {showRegistration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Card className="glass-card p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Quiz Registration</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Roll Number"
                  className="w-full glass rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={handleStartQuiz} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Start Quiz
                </Button>
                <Button variant="outline" onClick={() => setShowRegistration(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quiz Interface */}
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="glass-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  Question {currentQuestion + 1} of {sampleQuestions.length}
                </h3>
                <div className="text-sm text-gray-400">Time: 25:30</div>
              </div>

              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl mb-6">{sampleQuestions[currentQuestion].question}</h4>
                <div className="space-y-3">
                  {sampleQuestions[currentQuestion].options.map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg cursor-pointer transition-colors bg-white/5 hover:bg-white/10 border border-transparent hover:border-purple-500/50"
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" disabled={currentQuestion === 0}>
                  Previous
                </Button>
                <Button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-purple-700">
                  {currentQuestion === sampleQuestions.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card className="glass-card p-8">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Quiz Completed!</h3>
              <div className="text-6xl font-bold gradient-text mb-4">85%</div>
              <p className="text-xl text-gray-400 mb-6">Great job! You scored 85% on this quiz.</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">2</div>
                  <div className="text-sm text-gray-400">Correct</div>
                </div>
                <div className="glass rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">1</div>
                  <div className="text-sm text-gray-400">Incorrect</div>
                </div>
                <div className="glass rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">3</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowResults(false)
                    setShowRegistration(true)
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Take Another Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false)
                    setShowQuiz(false)
                    setShowRegistration(false)
                  }}
                  className="flex-1"
                >
                  Back to Home
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  )
}
