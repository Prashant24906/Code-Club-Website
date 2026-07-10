"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type Teacher = { name: string; role: string; image: string; motivation: string };

const hod: Teacher = {
  name: "Dr. Mrs. S. S. Bhavsar",
  role: "HOD, IT and AIML Department",
  image: "/motivation-teacher-hod.svg",
  motivation: "Great engineers are made through discipline, ethics, and the courage to keep learning.",
};

const teachers: Teacher[] = [
  { name: "Mrs. P. L. Rakibe", role: "Activity Coordinator", image: "/motivation-teacher-3.svg", motivation: "Participation in activities builds leadership, confidence, and communication skills." },
  { name: "Mrs. S. A. Kulkarni", role: "Academic Coordinator", image: "/motivation-teacher-1.svg", motivation: "Strong fundamentals and consistent revision create long-term confidence in technology." },
  { name: "Mrs. S. D. Bhirud", role: "Academic Coordinator", image: "/motivation-teacher-2.svg", motivation: "Structured guidance and regular practice turn students into dependable professionals." },
  { name: "Ms. G. V. Mathad", role: "Code Club Coordinator & Activity Incharge", image: "/motivation-teacher-4.svg", motivation: "Real growth starts when students build together and turn ideas into working projects." },
];

export function Motivation() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const hodRef = useRef<HTMLDivElement>(null);
  const teachersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
      });
      gsap.fromTo(hodRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: hodRef.current, start: "top 80%" },
      });
      gsap.fromTo(Array.from(teachersRef.current?.children ?? []), { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: teachersRef.current, start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="motivation" ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div ref={headingRef} className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
            Our <span className="gradient-text">Motivation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Faculty mentors who guide and motivate us to stay curious, disciplined, and impactful.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-8">
          <div
            ref={hodRef}
            className="glass-card rounded-2xl p-4 sm:p-6 border border-cyan-400/30 w-full min-h-[260px] sm:min-h-[320px] max-w-[520px] sm:max-w-none mx-auto hover:-translate-y-1.5 transition-transform duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center h-full">
              <img src={hod.image} alt={hod.name} className="w-[160px] h-[160px] sm:w-full sm:h-auto md:w-[240px] aspect-square rounded-xl object-cover mx-auto" />
              <div>
                <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-cyan-500/15 text-cyan-300 mb-3">HOD</div>
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
          </div>
        </div>

        <div ref={teachersRef} className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto justify-items-center">
          {teachers.map((teacher) => (
            <div key={teacher.name} className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 h-full w-full max-w-[240px] hover:-translate-y-1.5 transition-transform duration-300">
              <img src={teacher.image} alt={teacher.name} className="w-full aspect-square rounded-xl object-cover mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1 text-center">{teacher.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center">{teacher.role}</p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                  <p className="text-xs leading-relaxed text-foreground/90">{teacher.motivation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
