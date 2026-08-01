import { connectDB } from "@/lib/mongodb";
import Member from "@/models/members";

// Fixed display order — departments outside this list are appended alphabetically
const DEPT_ORDER = ["Core Leadership", "Tech", "Marketing", "Documentation","Events"];

// Lightweight public endpoint — returns only the distinct department names.
// Uses MongoDB's built-in distinct() which is a single indexed scan.
export async function GET() {
  await connectDB();
  const departments: string[] = await Member.distinct("department");
  const known = DEPT_ORDER.filter((d) => departments.includes(d));
  const unknown = departments
    .filter((d) => d && !DEPT_ORDER.includes(d))
    .sort();
  return new Response(JSON.stringify([...known, ...unknown]), { status: 200 });
}
