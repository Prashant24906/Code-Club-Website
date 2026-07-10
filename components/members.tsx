"use client";

import { motion } from "framer-motion";
import useSWR from "swr";
import { Users } from "lucide-react";

type Member = {
  _id: string;
  name: string;
  role: string;
  department: string;
  image: string;
  isHead: boolean;
};

type Department = {
  name: string;
  lead: Member | null;
  members: Member[];
  color: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Members() {
  const { data: members, error } = useSWR<Member[]>("/api/members", fetcher, {
    revalidateOnFocus: true, 
  });

  if (!members) return <p className="text-center mt-10">Loading members...</p>;
  if (error)
    return <p className="text-center mt-10">Failed to load members.</p>;

  const executiveTeam = members.filter(
    (m) => m.department === "Core Leadership"
  );
  const president =
    executiveTeam.find((member) => /president|predident/i.test(member.role)) ??
    executiveTeam.find((member) => member.isHead) ??
    executiveTeam[0] ??
    null;
  const executiveMembers = executiveTeam
    .filter((member) => member._id !== president?._id)
    .slice(0, 3);

  const groupedDepartments: Record<
    string,
    { name: string; lead: Member | null; members: Member[] }
  > = members
    .filter((m) => m.department !== "Core Leadership")
    .reduce((acc, member) => {
      const deptName = member.department || "Uncategorized";
      if (!acc[deptName])
        acc[deptName] = { name: deptName, lead: null, members: [] };
      if (member.isHead) acc[deptName].lead = member;
      else acc[deptName].members.push(member);
      return acc;
    }, {} as Record<string, { name: string; lead: Member | null; members: Member[] }>);

  const departmentColors = ["blue", "emerald", "indigo", "purple", "orange"];
  const departments: Department[] = Object.values(groupedDepartments).map(
    (dept, i) => ({
      ...dept,
      color: departmentColors[i % departmentColors.length],
    })
  );

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { stripe: string; badge: string; accent: string; border: string }
    > = {
      blue: {
        stripe: "from-blue-500/80 to-cyan-500/80",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
        accent: "text-blue-600 dark:text-blue-300",
        border: "border-blue-500/20",
      },
      emerald: {
        stripe: "from-emerald-500/80 to-teal-500/80",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        accent: "text-emerald-600 dark:text-emerald-300",
        border: "border-emerald-500/20",
      },
      indigo: {
        stripe: "from-indigo-500/80 to-sky-500/80",
        badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
        accent: "text-indigo-600 dark:text-indigo-300",
        border: "border-indigo-500/20",
      },
      purple: {
        stripe: "from-fuchsia-500/80 to-purple-500/80",
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
        accent: "text-purple-600 dark:text-purple-300",
        border: "border-purple-500/20",
      },
      orange: {
        stripe: "from-orange-500/80 to-amber-500/80",
        badge: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
        accent: "text-orange-600 dark:text-orange-300",
        border: "border-orange-500/20",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="members" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Meet Our <span className="gradient-text">Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Passionate individuals driving innovation and fostering a
            collaborative learning environment
          </p>
        </motion.div>

        {/* Executive Team */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl font-bold text-center mb-12 gradient-text"
          >
            Executive Leadership
          </motion.h3>

          {president && (
            <div className="max-w-5xl mx-auto mb-8">
              <motion.div
                key={president._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl p-4 sm:p-6 w-full min-h-[260px] sm:min-h-[320px] max-w-[520px] sm:max-w-none mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center h-full">
                  <img
                    src={president.image || "/placeholder.svg"}
                    loading="lazy"
                    alt={president.name}
                    className="w-[160px] h-[160px] sm:w-full sm:h-auto md:w-[240px] aspect-square rounded-xl object-cover mx-auto"
                  />
                  <div>
                    <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 mb-3">
                      President
                    </div>
                    <h4 className="text-2xl font-semibold text-foreground mb-1">
                      {president.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {president.role}
                    </p>
                    <p className="text-sm text-foreground/85">
                      Leading the executive team with vision, coordination, and accountability.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
            {executiveMembers.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl p-3 sm:p-3.5 h-full w-full"
              >
                <img
                  src={member.image || "/placeholder.svg"}
                  loading="lazy"
                  alt={member.name}
                  className="w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] rounded-xl object-cover mb-3 mx-auto"
                />
                <div className="flex justify-center mb-2.5">
                  <div className="inline-flex text-center items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300">
                    Executive Member
                  </div>
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1 text-center">
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground text-center">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="space-y-16 max-w-6xl mx-auto">
          {departments.map((dept, deptIndex) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + deptIndex * 0.2 }}
                className="relative"
              >
              <div className={`glass-card rounded-3xl border overflow-hidden ${getColorClasses(dept.color).border}`}>
                <div
                  className={`h-1 w-full bg-gradient-to-r ${getColorClasses(
                    dept.color
                  ).stripe}`}
                />
                <div className="p-5 md:p-7">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-2xl font-bold text-foreground">
                      {dept.name}
                    </h3>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getColorClasses(
                        dept.color
                      ).badge}`}
                    >
                      <Users className="h-4 w-4" />
                      <span>
                        {dept.members.length + (dept.lead ? 1 : 0)} Members
                      </span>
                    </div>
                  </div>

                  {dept.lead && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1 + deptIndex * 0.1,
                      }}
                      className="mb-6"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`glass-card rounded-2xl p-4 sm:p-5 border ${getColorClasses(dept.color).border} max-w-[380px] sm:max-w-none mx-auto`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-4 items-center">
                          <img
                            src={dept.lead.image || "/placeholder.svg"}
                            loading="lazy"
                            alt={dept.lead.name}
                            className="w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] aspect-square rounded-xl object-cover mx-auto"
                          />
                          <div className="min-w-0">
                            <p
                              className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-wider mb-3 ${getColorClasses(
                                dept.color
                              ).badge}`}
                            >
                              Department Lead
                            </p>
                            <h4 className="text-xl font-semibold text-foreground truncate">
                              {dept.lead.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate mb-3">
                              {dept.lead.role}
                            </p>
                            <p className="text-sm text-foreground/85">
                              Leading {dept.name} with focus on execution, mentoring, and quality outcomes.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + deptIndex * 0.1 }}
                  >
                    {dept.members.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
                        {dept.members.map((member) => (
                          <motion.div
                            key={member._id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35 }}
                            whileHover={{ y: -4 }}
                            className="glass-card rounded-2xl p-2.5 sm:p-3 border border-white/10 h-full w-full"
                          >
                            <div className="mb-3 flex justify-center">
                              <img
                                src={member.image || "/placeholder.svg"}
                                loading="lazy"
                                alt={member.name}
                                className="w-[120px] h-[120px] sm:w-[170px] sm:h-[170px] rounded-xl object-cover"
                              />
                            </div>
                            <h5 className="text-sm font-semibold text-foreground truncate mb-1 text-center">
                              {member.name}
                            </h5>
                            <p className="text-xs text-muted-foreground truncate text-center">
                              {member.role}
                            </p>
                            <p className={`text-xs mt-3 text-center ${getColorClasses(dept.color).accent}`}>
                              {dept.name}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/20 p-5 text-sm text-muted-foreground text-center">
                        No additional team members listed yet.
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
