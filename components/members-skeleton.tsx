"use client";

import { motion } from "framer-motion";

export default function MembersSkeleton() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto animate-pulse">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="h-10 w-64 mx-auto bg-gray-300/30 rounded-lg mb-4" />
          <div className="h-5 w-96 mx-auto bg-gray-300/20 rounded-lg" />
        </motion.div>

        {/* Executive Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-20">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center">
              <div className="w-28 h-28 rounded-full bg-gray-300/30 mx-auto mb-4" />
              <div className="h-5 w-24 mx-auto bg-gray-300/20 rounded mb-2" />
              <div className="h-4 w-16 mx-auto bg-gray-300/20 rounded" />
            </div>
          ))}
        </div>

        {/* Departments Skeleton */}
        <div className="space-y-16">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 border border-gray-300/20">
              <div className="h-6 w-40 bg-gray-300/20 rounded mb-6 mx-auto" />
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:basis-[32%] glass-card rounded-2xl p-4 aspect-square flex flex-col items-center justify-center">
                  <div className="w-36 h-36 rounded-xl bg-gray-300/30 mb-2" />
                  <div className="h-4 w-20 bg-gray-300/20 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-300/20 rounded" />
                </div>
                <div className="md:basis-[68%] grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="glass-card rounded-xl p-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-300/30 mx-auto mb-2" />
                      <div className="h-3 w-20 mx-auto bg-gray-300/20 rounded mb-1" />
                      <div className="h-2 w-12 mx-auto bg-gray-300/20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
