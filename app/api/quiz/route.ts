import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/quiz";

export async function GET() {
  await connectDB();
  const quizzes = await Quiz.find();
  return new Response(JSON.stringify(quizzes), { status: 200 });
}

export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();
  const quiz = await Quiz.create(data);
  return new Response(JSON.stringify(quiz), { status: 201 });
}

export async function DELETE(request: Request) {
  await connectDB();
  const { id } = await request.json();
  await Quiz.findByIdAndDelete(id);
  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
