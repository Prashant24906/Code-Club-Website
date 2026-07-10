// Event Interface
export interface EventType {
  _id?: string;
  image: string;
  title: string;
  date: string; // ISO string
  description: string;
  location?: string;
  googleFormLink?: string;
}

// Member Interface
export interface MemberType {
  _id?: string;
  image: string;
  name: string;
  role: string;
  department: string;
  isHead: boolean;
}

// Quiz Question Interface
export interface QuizQuestion {
  question: string;
  options: string[]; // ["A", "B", "C", "D"]
  answer: string;    // "A", "B", etc.
}

// Quiz Interface
export interface QuizType {
  _id?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}
