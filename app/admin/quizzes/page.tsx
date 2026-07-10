"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminNavbar } from "@/components/admin-navbar"

type Option = { id: string; text: string; isCorrect: boolean }
type Question = { id: string; text: string; options: Option[] }
type Quiz = { id: string; title: string; description?: string; questions: Question[] }




export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true)
      try {
        const res = await fetch("/api/quiz")
        const data = await res.json()
        setQuizzes(data.map((q: any) => ({
          id: q._id || q.id,
          title: q.title,
          description: q.description,
          questions: q.questions || [],
        })))
      } catch {}
      setLoading(false)
    }
    fetchQuizzes()
  }, [])

  const canSave = useMemo(
    () =>
      title.trim().length > 2 &&
      questions.length > 0 &&
      questions.every((q) => q.text.trim() && q.options.length >= 2 && q.options.some((o) => o.isCorrect)),
    [title, questions],
  )

  function addQuestion() {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())
    setQuestions((prev) => [...prev, { id, text: "", options: [] }])
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function addOption(qid: string) {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: [...q.options, { id, text: "", isCorrect: q.options.length === 0 }] } : q,
      ),
    )
  }

  function updateOption(qid: string, oid: string, patch: Partial<Option>) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, ...patch } : o)) } : q,
      ),
    )
  }

  function markCorrect(qid: string, oid: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === oid })) } : q,
      ),
    )
  }

  function removeOption(qid: string, oid: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, options: q.options.filter((o) => o.id !== oid) } : q)),
    )
  }

  async function saveQuiz() {
    if (!canSave) return
    setLoading(true)
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, questions }),
      })
      const created = await res.json()
      setQuizzes((prev) => [{
        id: created._id || created.id,
        title: created.title,
        description: created.description,
        questions: created.questions || [],
      }, ...prev])
      setTitle("")
      setDescription("")
      setQuestions([])
    } catch {}
    setLoading(false)
  }

  async function deleteQuiz(id: string) {
    setLoading(true)
    try {
      await fetch("/api/quiz", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setQuizzes((prev) => prev.filter((q) => q.id !== id))
    } catch {}
    setLoading(false)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-24 pb-8">
      <AdminNavbar />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Quiz</h1>
        <Button asChild variant="outline">
          <Link href="/admin">← Back to Admin</Link>
        </Button>
      </div>

      <Card className="glass-card mb-8 rounded-xl p-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Coding Challenge"
              className="glass rounded-md px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="desc" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary (optional)"
              className="glass min-h-24 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card mb-8 rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          <Button onClick={addQuestion} className="bg-sky-600 hover:bg-sky-700">
            Add Question
          </Button>
        </div>
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions yet. Add your first question.</p>
        )}
        <div className="grid gap-6">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <label className="text-sm font-medium">Question {qi + 1}</label>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => addOption(q.id)}>
                    Add Option
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeQuestion(q.id)}>
                    Remove
                  </Button>
                </div>
              </div>
              <input
                className="mb-4 glass w-full rounded-md px-3 py-2"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Type your question..."
              />
              <div className="grid gap-3">
                {q.options.length === 0 && <p className="text-xs text-muted-foreground">Add at least two options.</p>}
                {q.options.map((o, oi) => (
                  <div key={o.id} className="flex items-center gap-3">
                    <input
                      aria-label="Correct option"
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={o.isCorrect}
                      onChange={() => markCorrect(q.id, o.id)}
                      className="h-4 w-4 accent-cyan-500"
                    />
                    <input
                      value={o.text}
                      onChange={(e) => updateOption(q.id, o.id, { text: e.target.value })}
                      placeholder={`Option ${oi + 1}`}
                      className="glass flex-1 rounded-md px-3 py-2"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeOption(q.id, o.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-10">
        <Button onClick={saveQuiz} disabled={!canSave} className="bg-sky-600 hover:bg-sky-700">
          Save Quiz
        </Button>
      </div>

      <Card className="glass-card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Saved Quizzes</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quizzes yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {quizzes.map((q) => (
              <li key={q.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-sm text-muted-foreground">{q.questions.length} questions</div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteQuiz(q.id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  )
}

