"use client";

import { useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <main className="min-h-screen bg-neutral-100 px-6 py-12 flex flex-col">
        <button
          onClick={() => setStarted(false)}
          className="text-left text-sm text-neutral-500 mb-10"
        >
          ← back
        </button>

        <section className="max-w-md mx-auto w-full flex flex-col gap-6">
          <p className="text-sm text-neutral-500">
            FLANO picked your next move
          </p>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
            <p className="text-sm text-[#7A5A45] font-semibold">
              Best match right now
            </p>

            <h1 className="text-3xl font-serif mt-3">
              Help set up AI Club
            </h1>

            <p className="text-neutral-500 mt-2">
              Leslie eLab · starts in 10 min · takes 30 min
            </p>

            <p className="mt-6 text-neutral-700">
              You’re nearby, they need people urgently, and this fits your
              current availability.
            </p>

            <button className="mt-8 w-full bg-[#7A5A45] text-white py-4 rounded-2xl font-medium">
              Take me there
            </button>
          </div>

          <p className="text-center text-sm text-neutral-500">
            Optimized for your next 30 minutes
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-between py-16 px-6">
      
      {/* Logo */}
      <div className="text-2xl font-serif tracking-wide">
        FLÂNO <span className="text-neutral-400 text-base">@ NYU</span>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-8 text-center">
        
        <h1 className="text-4xl font-serif">
          Make the most of your free time.
        </h1>

        <p className="text-neutral-500 max-w-xs">
          Instantly match with the best thing to do on campus right now.
        </p>

        <button
          onClick={() => setStarted(true)}
          className="bg-[#7A5A45] text-white px-8 py-4 rounded-2xl text-lg font-medium hover:opacity-90 transition"
        >
          I’m free now
        </button>
      </div>

      {/* Footer */}
      <p className="text-sm text-neutral-400">
        Real-time campus matching
      </p>

    </main>
  );
}