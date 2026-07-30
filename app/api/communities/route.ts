import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Community from "@/models/community";
import { checkAuth } from "@/lib/auth-check";

// Seed data to pre-populate if collection is empty
const SEED_COMMUNITIES = [
  { id: "general", name: "CoDE Club General", description: "The main hub for all CoDE Club members. Announcements, events, discussions, and everything in between.", color: "#38bdf8", members: "200+", tags: ["Announcements", "General", "Events"], whatsappLink: "https://chat.whatsapp.com/", isMain: true, iconName: "MessageCircle" },
  { id: "webdev", name: "Web Development", description: "Deep-dive into HTML, CSS, JavaScript, React, Next.js, and modern web frameworks. Share projects and get code reviews.", color: "#34d399", members: "80+", tags: ["React", "Next.js", "CSS", "JavaScript"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Globe" },
  { id: "dsa", name: "DSA & Competitive Coding", description: "Practice data structures, algorithms, and competitive programming. Daily challenges and contest prep discussions.", color: "#a78bfa", members: "120+", tags: ["LeetCode", "Algorithms", "CP", "Interviews"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Code2" },
  { id: "aiml", name: "AI / ML & Data Science", description: "Explore machine learning, deep learning, data science, and AI research. Share papers, projects, and resources.", color: "#fb7185", members: "95+", tags: ["Python", "PyTorch", "Data Science", "LLMs"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Cpu" },
  { id: "appdev", name: "App Development", description: "Build mobile and desktop apps using Flutter, React Native, Android, iOS, and more.", color: "#fbbf24", members: "60+", tags: ["Flutter", "React Native", "Android", "iOS"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Layers" },
  { id: "cybersec", name: "Cybersecurity", description: "Ethical hacking, CTF challenges, network security, and bug bounties.", color: "#f87171", members: "50+", tags: ["CTF", "Ethical Hacking", "Networking", "OSINT"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Shield" },
  { id: "opensource", name: "Open Source & Projects", description: "Collaborate on open-source contributions and club projects.", color: "#34d399", members: "70+", tags: ["GitHub", "Collaboration", "Open Source"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Rocket" },
  { id: "devops", name: "DevOps & Cloud", description: "CI/CD pipelines, Docker, Kubernetes, AWS, GCP, and Azure.", color: "#38bdf8", members: "40+", tags: ["Docker", "AWS", "CI/CD", "Kubernetes"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "Zap" },
  { id: "resources", name: "Learning Resources", description: "Curated courses, tutorials, books, and roadmaps for every tech topic.", color: "#a78bfa", members: "150+", tags: ["Courses", "Tutorials", "Roadmaps", "Books"], whatsappLink: "https://chat.whatsapp.com/", isMain: false, iconName: "BookOpen" },
];

export async function GET() {
  await connectDB();
  let communities = await Community.find().sort({ createdAt: 1 });
  // Seed if empty
  if (communities.length === 0) {
    await Community.insertMany(SEED_COMMUNITIES);
    communities = await Community.find().sort({ createdAt: 1 });
  }
  return NextResponse.json(communities);
}

export async function POST(req: NextRequest) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const data = await req.json();
  const community = await Community.create(data);
  return NextResponse.json(community, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { _id, ...data } = await req.json();
  const updated = await Community.findByIdAndUpdate(_id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { _id } = await req.json();
  await Community.findByIdAndDelete(_id);
  return NextResponse.json({ message: "Deleted" });
}
