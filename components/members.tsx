"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, UserX } from "lucide-react";
import { useCachedMembersByDept } from "@/lib/data-cache";
import OptionWheel from "./OptionWheel";

gsap.registerPlugin(ScrollTrigger);

type Member = { _id: string; name: string; role: string; department: string; image: string; isHead: boolean };
type Department = { name: string; lead: Member | null; coHead: Member | null; members: Member[]; color: string };

export function Members() {
  const membersByDept = useCachedMembersByDept();
  const cachedMembers = membersByDept ? Object.values(membersByDept).flat() : null;
  const [members, setMembers] = useState<Member[]>(cachedMembers ?? []);
  const [loading, setLoading] = useState(cachedMembers === null);
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedMembers !== null) {
      setMembers(cachedMembers);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membersByDept]);

  // Animate heading on scroll
  useEffect(() => {
    if (!members.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".members-heading", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".members-heading", start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [members]);

  // Animate panel when department changes
  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" }
    );
  }, [selectedDeptIndex]);

  if (loading) return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-12 w-72 bg-muted/40 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 bg-muted/30 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="w-24 h-24 rounded-xl bg-muted/40 mx-auto mb-3" />
              <div className="h-4 bg-muted/40 rounded mx-auto w-3/4 mb-2" />
              <div className="h-3 bg-muted/30 rounded mx-auto w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!members.length) return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Meet Our <span className="gradient-text">Team</span></h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">Passionate individuals driving innovation and fostering a collaborative learning environment</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border border-dashed border-white/20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: "linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))" }}>
            <UserX className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No Members Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            The team roster is being set up. Check back soon to meet the people behind CoDE Club.
          </p>
        </div>
      </div>
    </section>
  );

  const executiveTeam = members.filter((m) => m.department === "Core Leadership");
  const president = executiveTeam.find((m) => /president|predident/i.test(m.role)) ?? executiveTeam.find((m) => m.isHead) ?? executiveTeam[0] ?? null;
  const executiveMembers = executiveTeam.filter((m) => m._id !== president?._id).slice(0, 3);

  const isCoHead = (m: Member) => /co[\s-]?(head|lead)/i.test(m.role);

  const deptColor = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("tech"))    return "blue";
    if (n.includes("market"))  return "purple";
    if (n.includes("doc"))     return "emerald";
    if (n.includes("event") || n.includes("logistic")) return "indigo";
    if (n.includes("design")) return "rose";
    return "orange";
  };

  const groupedDepartments: Record<string, { name: string; lead: Member | null; coHead: Member | null; members: Member[] }> = members
    .filter((m) => m.department !== "Core Leadership")
    .reduce((acc, member) => {
      const deptName = member.department || "Uncategorized";
      if (!acc[deptName]) acc[deptName] = { name: deptName, lead: null, coHead: null, members: [] };
      if (member.isHead) {
        acc[deptName].lead = member;
      } else if (!acc[deptName].coHead && isCoHead(member)) {
        acc[deptName].coHead = member;
      } else {
        acc[deptName].members.push(member);
      }
      return acc;
    }, {} as Record<string, { name: string; lead: Member | null; coHead: Member | null; members: Member[] }>);

  const deptRank = (name: string): number => {
    const n = name.toLowerCase();
    if (n.includes("tech"))    return 0;
    if (n.includes("market"))  return 1;
    if (n.includes("doc"))     return 2;
    if (n.includes("event") || n.includes("logistic")) return 3;
    if (n.includes("design")) return 4;
    return 99;
  };

  const departments: Department[] = Object.values(groupedDepartments)
    .sort((a, b) => {
      const diff = deptRank(a.name) - deptRank(b.name);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    })
    .map((dept) => ({ ...dept, color: deptColor(dept.name) }));

  const getColorClasses = (color: string) => {
    const colors: Record<string, { stripe: string; badge: string; accent: string; border: string; glow: string }> = {
      blue:    { stripe: "from-blue-500/80 to-cyan-500/80",       badge: "bg-blue-500/10 text-blue-600 dark:text-blue-300",         accent: "text-blue-600 dark:text-blue-300",       border: "border-blue-500/20",    glow: "#38bdf8" },
      emerald: { stripe: "from-emerald-500/80 to-teal-500/80",    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", accent: "text-emerald-600 dark:text-emerald-300", border: "border-emerald-500/20", glow: "#34d399" },
      indigo:  { stripe: "from-indigo-500/80 to-sky-500/80",      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",   accent: "text-indigo-600 dark:text-indigo-300",   border: "border-indigo-500/20",  glow: "#818cf8" },
      purple:  { stripe: "from-fuchsia-500/80 to-purple-500/80",  badge: "bg-purple-500/10 text-purple-600 dark:text-purple-300",   accent: "text-purple-600 dark:text-purple-300",   border: "border-purple-500/20",  glow: "#c084fc" },
      orange:  { stripe: "from-orange-500/80 to-amber-500/80",    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-300",   accent: "text-orange-600 dark:text-orange-300",   border: "border-orange-500/20",  glow: "#fb923c" },
      rose:    { stripe: "from-rose-500/80 to-pink-500/80",       badge: "bg-rose-500/10 text-rose-600 dark:text-rose-300",         accent: "text-rose-600 dark:text-rose-300",       border: "border-rose-500/20",    glow: "#fb7185" },
    };
    return colors[color] || colors.blue;
  };

  const dept = departments[Math.min(selectedDeptIndex, departments.length - 1)];
  const cc = dept ? getColorClasses(dept.color) : getColorClasses("blue");
  const wheelItems = departments.map((d) => d.name);

  return (
    <section id="members" ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="members-heading text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Meet Our <span className="gradient-text">Team</span></h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">Passionate individuals driving innovation and fostering a collaborative learning environment</p>
        </div>

        {/* ── Executive Team ───────────────────────────────────────── */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 gradient-text">Executive Leadership</h3>

          {president && (
            <div className="max-w-5xl mx-auto mb-8">
              <div className="glass-card rounded-2xl p-4 sm:p-6 w-full min-h-[260px] sm:min-h-[320px] max-w-[520px] sm:max-w-none mx-auto hover:-translate-y-1.5 transition-transform duration-300">
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center h-full">
                  <img src={president.image || "/placeholder.svg"} loading="lazy" alt={president.name} className="w-[160px] h-[160px] sm:w-full sm:h-auto md:w-[240px] aspect-square rounded-xl object-cover mx-auto" />
                  <div>
                    <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 mb-3">President</div>
                    <h4 className="text-2xl font-semibold text-foreground mb-1">{president.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{president.role}</p>
                    <p className="text-sm text-foreground/85">Leading the executive team with vision, coordination, and accountability.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
            {executiveMembers.map((member) => (
              <div key={member._id} className="glass-card rounded-2xl p-3 sm:p-3.5 h-full w-full hover:-translate-y-1.5 transition-transform duration-300">
                <img src={member.image || "/placeholder.svg"} loading="lazy" alt={member.name} className="w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] rounded-xl object-cover mb-3 mx-auto" />
                <div className="flex justify-center mb-2.5">
                  <div className="inline-flex text-center items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300">Executive Member</div>
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1 text-center">{member.name}</h4>
                <p className="text-xs text-muted-foreground text-center">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Departments: fixed wheel + panel ─────────────────────── */}
        {departments.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold text-center mb-10 gradient-text">Departments</h3>

            {/* Fixed left wheel — only on lg+ screens */}
            <div
              className="hidden lg:block fixed left-0 top-0 z-40 pointer-events-auto"
              style={{ width: 220, height: '100vh' }}
            >
              {/* Subtle centre-line indicator */}
              <div
                className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 h-[1.5px] rounded-full opacity-25 transition-all duration-500"
                style={{ background: cc.glow }}
              />
              <div
                className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 h-12 rounded-xl transition-all duration-500"
                style={{ background: `${cc.glow}12` }}
              />

              <OptionWheel
                items={wheelItems}
                defaultSelected={0}
                onChange={(idx) => setSelectedDeptIndex(idx)}
                textColor="rgba(255,255,255,0.65)"
                activeColor="#ffffff"
                side="left"
                fontSize={1.5}
                spacing={2.4}
                curve={0.5}
                tilt={5}
                blur={1.2}
                fade={0.32}
                minOpacity={0.18}
                smoothing={180}
                inset={18}
              />
            </div>

            {/* Mobile: wheel inline at top */}
            <div
              className="lg:hidden relative mb-8"
              style={{ height: Math.min(departments.length * 56 + 60, 300) }}
            >
              <div
                className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 h-[1.5px] rounded-full opacity-20 transition-all duration-500"
                style={{ background: cc.glow }}
              />
              <OptionWheel
                items={wheelItems}
                defaultSelected={0}
                onChange={(idx) => setSelectedDeptIndex(idx)}
                textColor="rgba(255,255,255,0.65)"
                activeColor="#ffffff"
                side="left"
                fontSize={1.25}
                spacing={2.0}
                curve={0.5}
                tilt={5}
                blur={1.2}
                fade={0.32}
                minOpacity={0.18}
                smoothing={180}
                inset={16}
              />
            </div>

            {/* Members panel — pushed right on desktop to clear fixed wheel */}
            <div ref={panelRef} className="lg:pl-56 lg:pr-56">
              {dept && (
                <div className={`glass-card rounded-3xl border overflow-hidden ${cc.border}`}>
                  <div className={`h-1 w-full bg-gradient-to-r ${cc.stripe}`} />
                    <div className="p-5 md:p-7">

                      {/* Header */}
                      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-2xl font-bold text-foreground">{dept.name}</h3>
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${cc.badge}`}>
                          <Users className="h-4 w-4" />
                          <span>{dept.members.length + (dept.lead ? 1 : 0) + (dept.coHead ? 1 : 0)} Members</span>
                        </div>
                      </div>

                      {/* Head */}
                      {dept.lead && (
                        <div className="mb-4">
                          <div className={`glass-card rounded-2xl p-4 sm:p-5 border ${cc.border} max-w-[380px] sm:max-w-none mx-auto hover:-translate-y-1 transition-transform duration-300`}>
                            <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-4 items-center">
                              <img src={dept.lead.image || "/placeholder.svg"} loading="lazy" alt={dept.lead.name} className="w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] aspect-square rounded-xl object-cover mx-auto" />
                              <div className="min-w-0">
                                <p className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-wider font-semibold mb-3 ${cc.badge}`}>Head</p>
                                <h4 className="text-xl font-semibold text-foreground truncate">{dept.lead.name}</h4>
                                <p className="text-sm text-muted-foreground truncate mb-3">{dept.lead.role}</p>
                                <p className="text-sm text-foreground/85">Leading {dept.name} with focus on execution, mentoring, and quality outcomes.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Co-Head */}
                      {dept.coHead && (
                        <div className="mb-5">
                          <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 max-w-[340px] sm:max-w-none mx-auto hover:-translate-y-1 transition-transform duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 items-center">
                              <img src={dept.coHead.image || "/placeholder.svg"} loading="lazy" alt={dept.coHead.name} className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] aspect-square rounded-xl object-cover mx-auto" />
                              <div className="min-w-0">
                                <p className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-wider font-semibold mb-2 ${cc.badge} opacity-80`}>Co-Head</p>
                                <h4 className="text-lg font-semibold text-foreground truncate">{dept.coHead.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">{dept.coHead.role}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Regular members grid */}
                      {dept.members.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
                          {dept.members.map((member) => (
                            <div key={member._id} className="glass-card rounded-2xl p-2.5 sm:p-3 border border-white/10 h-full w-full hover:-translate-y-1 transition-transform duration-300">
                              <div className="mb-3 flex justify-center">
                                <img src={member.image || "/placeholder.svg"} loading="lazy" alt={member.name} className="w-[120px] h-[120px] sm:w-[170px] sm:h-[170px] rounded-xl object-cover" />
                              </div>
                              <h5 className="text-sm font-semibold text-foreground truncate mb-1 text-center">{member.name}</h5>
                              <p className="text-xs text-muted-foreground truncate text-center">{member.role}</p>
                              <p className={`text-xs mt-3 text-center ${cc.accent}`}>{dept.name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        !dept.lead && !dept.coHead && (
                          <div className="rounded-2xl border border-dashed border-white/20 p-5 text-sm text-muted-foreground text-center">
                            No additional team members listed yet.
                          </div>
                        )
                      )}

                    </div>
                  </div>
                )}
              </div>
          </div>
        )}

      </div>
    </section>
  );
}
