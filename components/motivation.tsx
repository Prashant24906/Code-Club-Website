"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

type Teacher = {
  name: string;
  role: string;
  image: string;
  motivation: string;
};

const hod: Teacher = {
  name: "Dr. Mrs. S. S. Bhavsar",
  role: "HOD, IT and AIML Department",
  image: "/motivation-teacher-hod.svg",
  motivation:
    "Great engineers are made through discipline, ethics, and the courage to keep learning.",
};

const teachers: Teacher[] = [
  {
    name: "Mrs. P. L. Rakibe",
    role: "Activity Coordinator",
    image: "/motivation-teacher-3.svg",
    motivation:
      "Participation in activities builds leadership, confidence, and communication skills.",
  },
  {
    name: "Mrs. S. A. Kulkarni",
    role: "Academic Coordinator",
    image: "/motivation-teacher-1.svg",
    motivation:
      "Strong fundamentals and consistent revision create long-term confidence in technology.",
  },
  {
    name: "Mrs. S. D. Bhirud",
    role: "Academic Coordinator",
    image: "/motivation-teacher-2.svg",
    motivation:
      "Structured guidance and regular practice turn students into dependable professionals.",
  },
  {
    name: "Ms. G. V. Mathad",
    role: "Code Club Coordinator & Activity Incharge",
    image: "/motivation-teacher-4.svg",
    motivation:
      "Real growth starts when students build together and turn ideas into working projects.",
  },
];

export function Motivation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="motivation" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
            Our <span className="gradient-text">Motivation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Faculty mentors who guide and motivate us to stay curious, disciplined, and impactful.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="glass-card rounded-2xl p-4 sm:p-6 border border-cyan-400/30 w-full min-h-[260px] sm:min-h-[320px] max-w-[520px] sm:max-w-none mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center h-full">
              <img
                src={hod.image}
                alt={hod.name}
                className="w-[160px] h-[160px] sm:w-full sm:h-auto md:w-[240px] aspect-square rounded-xl object-cover mx-auto"
              />
              <div>
                <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-cyan-500/15 text-cyan-300 mb-3">
                  HOD
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-1">{hod.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{hod.role}</p>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 mt-0.5 text-cyan-400 shrink-0" />
                    <p className="text-sm leading-relaxed text-foreground/90">{hod.motivation}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto justify-items-center">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 h-full w-full max-w-[240px]"
            >
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-full aspect-square rounded-xl object-cover mb-3"
              />
              <h3 className="text-base font-semibold text-foreground mb-1 text-center">{teacher.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center">{teacher.role}</p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                  <p className="text-xs leading-relaxed text-foreground/90">{teacher.motivation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
