import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/quiz";
import { checkAuth } from "@/lib/auth-check";

export async function GET() {
  await connectDB();
  const quizzes = await Quiz.find();
  return new Response(JSON.stringify(quizzes), { status: 200 });
}

export async function POST(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const data = await request.json();
  const quiz = await Quiz.create(data);
  return new Response(JSON.stringify(quiz), { status: 201 });
}

export async function DELETE(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { id } = await request.json();
  await Quiz.findByIdAndDelete(id);
  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
