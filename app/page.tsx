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
            <p className="text-sm text-[#57068C] font-semibold">
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

            <button className="mt-8 w-full bg-[#57068C] text-white py-4 rounded-full font-medium tracking-wide">
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
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-between py-10 px-6">
      
      {/* Comic Banner */}
      <div className="w-full h-28 relative overflow-hidden rounded-xl mb-6 border border-neutral-200">
        <img
          src="/comic.png"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent" />
      </div>

      {/* Logo */}
      <div className="text-2xl font-serif tracking-wide">
        FLÂNO <span className="text-[#57068C] text-base">@ NYU</span>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center gap-8 text-center mt-12">
        
        <h1 className="text-5xl font-serif leading-tight">
          Your next best move at NYU.
        </h1>

        <button
          onClick={() => setStarted(true)}
          className="bg-[#57068C] text-white px-10 py-4 rounded-full text-lg font-medium tracking-wide hover:opacity-90 transition"
        >
          I’m free now
        </button>
      </div>

      {/* Footer */}
      <p className="text-sm text-neutral-400 mt-10">
        Real-time campus matching
      </p>

    </main>
  );
}