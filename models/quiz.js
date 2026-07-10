import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  id: String,
  text: String,
  isCorrect: Boolean,
});

const QuestionSchema = new mongoose.Schema({
  id: String,
  text: String,
  options: [OptionSchema],
});

const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [QuestionSchema],
});

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
