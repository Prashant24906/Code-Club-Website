import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import {connectDB} from "@/lib/mongodb"
import Settings from "@/models/settings"

function isAdminAuthed(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value
  if (!token) return false
  return !!verifyToken(token)
}

// Public GET — quiz/events pages read this
export async function GET() {
  await connectDB()
  // findOneAndUpdate with upsert ensures the document exists
  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { key: "global" } },
    { upsert: true, new: true }
  )
  return NextResponse.json({
    quizEnabled: settings.quizEnabled,
    eventsEnabled: settings.eventsEnabled,
  })
}

// Admin-only PUT — admin page saves settings
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  const { quizEnabled, eventsEnabled } = await req.json()
  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $set: { quizEnabled, eventsEnabled } },
    { upsert: true, new: true }
  )
  return NextResponse.json({
    quizEnabled: settings.quizEnabled,
    eventsEnabled: settings.eventsEnabled,
  })
}
