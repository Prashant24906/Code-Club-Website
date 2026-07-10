"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Trophy, Clock, Users, Play, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ParticleBackground } from "@/components/particle-background"
import { Navbar } from "@/components/navbar"
import { PageHero } from "@/components/page-hero"
type Option = { id: string; text: string; isCorrect: boolean }
type Question = { id: string; text: string; options: Option[] }
type Quiz = { _id?: string; id?: string; title: string; description?: string; questions: Question[] }

export default function QuizPage() {
  const [quizEnabled, setQuizEnabled] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [score, setScore] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const adminSettings = localStorage.getItem("codeClubAdminSettings")
      if (adminSettings) {
        const settings = JSON.parse(adminSettings)
        setQuizEnabled(settings.quizEnabled || false)
      }
    } catch {}
  }, [])

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true)
      try {
        const res = await fetch("/api/quiz")
        const data = await res.json()
        setQuizzes(data.reverse().map((q: any) => ({
          _id: q._id, id: q._id || q.id, title: q.title,
          description: q.description, questions: q.questions || [],
        })))
      } catch {}
      setLoading(false)
    }
    fetchQuizzes()
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
    }
  }, [quizEnabled, showRegistration, showQuiz, showResults])

  const handleStartQuiz = () => {
    setShowRegistration(false)
    setShowQuiz(true)
    setCurrentQuestion(0)
    setShowResults(false)
    setUserAnswers([])
    setScore(0)
  }

  const handleNextQuestion = () => {
    if (!selectedQuiz) return
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      let correct = 0
      selectedQuiz.questions.forEach((q, i) => {
        const correctIdx = q.options.findIndex((o) => o.isCorrect)
        if (userAnswers[i] === correctIdx) correct++
      })
      setScore(correct)
      setShowResults(true)
      setShowQuiz(false)
    }
  }

  const handleSelectOption = (idx: number) => {
    setUserAnswers((prev) => { const arr = [...prev]; arr[currentQuestion] = idx; return arr })
  }

  if (!quizEnabled) {
    return (
      <main className="relative min-h-screen">
        <ParticleBackground />
        <Navbar />
        <div className="pt-20">
          <PageHero
            title="Test Your"
            highlight="Skills"
            subtitle="Participate in our regular coding quizzes and see where you stand."
            badge="Quiz"
          />
          <div className="container mx-auto px-4 pb-20">
            <div ref={containerRef} className="max-w-2xl mx-auto text-center mt-8">
            <div className="glass-card rounded-3xl p-12">
              <Brain className="h-16 w-16 text-gray-500 mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4 text-foreground">Quiz Section</h1>
              <p className="text-muted-foreground text-lg mb-6">The quiz section is currently not available. Please check back later.</p>
              <div className="text-sm text-muted-foreground">Quiz access is controlled by the admin panel.</div>
            </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <PageHero
          title="Test Your"
          highlight="Skills"
          subtitle="Participate in our regular coding quizzes and see where you stand."
          badge="Quiz"
        />
        <div className="container mx-auto px-4 pb-20">
          <div ref={containerRef} className="max-w-6xl mx-auto mt-8">

          {!showRegistration && !showQuiz && !showResults && !selectedQuiz && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Ready to Test Your Knowledge?</h3>
                <div className="space-y-4 mb-6">
                  {[{ icon: Clock, text: "30 minutes duration" }, { icon: Brain, text: "Multiple choice questions" }, { icon: Trophy, text: "Instant results and feedback" }, { icon: Users, text: "Compete with other members" }].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-purple-400" /><span className="text-foreground">{text}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => { if (quizzes.length > 0) { setSelectedQuiz(quizzes[0]); setShowRegistration(true) } }}
                  disabled={loading || quizzes.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition-shadow"
                >
                  <Play className="h-4 w-4 mr-2" />Start Quiz
                </Button>
              </div>
              <div className="glass-card rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-4 text-foreground">Sample Question</h4>
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <p className="text-lg mb-4 text-foreground">What does HTML stand for?</p>
                  <div className="space-y-2">
                    {["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"].map((option, index) => (
                      <div key={index} className={`p-3 rounded-lg cursor-pointer transition-colors ${index === 0 ? "bg-purple-600/20 border border-purple-500/50" : "bg-white/5 hover:bg-white/10"}`}>
                        <span className="text-foreground">{String.fromCharCode(65 + index)}. {option}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Click "Start Quiz" to begin the latest quiz!</div>
              </div>
            </div>
          )}

          {showRegistration && selectedQuiz && (
            <div className="max-w-md mx-auto">
              <Card className="glass-card p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-foreground">Quiz Registration</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" className="w-full glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground bg-background/50" />
                  <input type="email" placeholder="Email Address" className="w-full glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground bg-background/50" />
                  <input type="text" placeholder="Roll Number" className="w-full glass rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground bg-background/50" />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={handleStartQuiz} className="flex-1 bg-purple-600 hover:bg-purple-700">Start Quiz</Button>
                  <Button variant="outline" onClick={() => setShowRegistration(false)} className="flex-1">Cancel</Button>
                </div>
              </Card>
            </div>
          )}

          {showQuiz && selectedQuiz && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-foreground">Question {currentQuestion + 1} of {selectedQuiz.questions.length}</h3>
                  <div className="text-sm text-muted-foreground">Time: 25:30</div>
                </div>
                <div className="mb-6">
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}></div>
                  </div>
                </div>
                <div className="mb-8">
                  <h4 className="text-xl mb-6 text-foreground">{selectedQuiz.questions[currentQuestion].text}</h4>
                  <div className="space-y-3">
                    {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                      <div key={option.id} onClick={() => handleSelectOption(index)} className={`p-4 rounded-lg cursor-pointer transition-colors bg-background/20 hover:bg-background/30 border hover:scale-[1.01] ${userAnswers[currentQuestion] === index ? "border-purple-500/70 bg-purple-600/10" : "border-transparent"}`}>
                        <span className="text-foreground">{String.fromCharCode(65 + index)}. {option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((c) => Math.max(0, c - 1))}>Previous</Button>
                  <Button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-purple-700" disabled={userAnswers[currentQuestion] == null}>{currentQuestion === selectedQuiz.questions.length - 1 ? "Finish" : "Next"}</Button>
                </div>
              </Card>
            </div>
          )}

          {showResults && selectedQuiz && (
            <div className="max-w-2xl mx-auto text-center">
              <Card className="glass-card p-8">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4 text-foreground">Quiz Completed!</h3>
                <div className="text-6xl font-bold gradient-text mb-4">{selectedQuiz.questions.length > 0 ? Math.round((score / selectedQuiz.questions.length) * 100) : 0}%</div>
                <p className="text-xl text-muted-foreground mb-6">You scored {score} out of {selectedQuiz.questions.length}.</p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="glass rounded-lg p-4"><div className="text-2xl font-bold text-green-400">{score}</div><div className="text-sm text-muted-foreground">Correct</div></div>
                  <div className="glass rounded-lg p-4"><div className="text-2xl font-bold text-red-400">{selectedQuiz.questions.length - score}</div><div className="text-sm text-muted-foreground">Incorrect</div></div>
                  <div className="glass rounded-lg p-4"><div className="text-2xl font-bold text-blue-400">{selectedQuiz.questions.length}</div><div className="text-sm text-muted-foreground">Total</div></div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => { setShowResults(false); setShowQuiz(false); setShowRegistration(false); setSelectedQuiz(null) }} className="flex-1 bg-purple-600 hover:bg-purple-700">Take Another Quiz</Button>
                  <Button variant="outline" onClick={() => { setShowResults(false); setShowQuiz(false); setShowRegistration(false); setSelectedQuiz(null) }} className="flex-1">Back to Home</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
  )
}
