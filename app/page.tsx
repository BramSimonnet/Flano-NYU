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
          ← Back
        </button>

        <section className="max-w-md mx-auto w-full flex flex-col gap-6">
          <p className="text-sm text-neutral-500">FLANO picked your next move</p>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
            <p className="text-sm text-[#57068C] font-semibold tracking-widest uppercase">
              Best match
            </p>

            <h1 className="text-3xl font-serif mt-3">Help set up AI Club</h1>

            <p className="text-neutral-500 mt-2">
              Leslie eLab · starts in 10 min · takes 30 min
            </p>

            <p className="mt-6 text-neutral-700">
              You’re nearby, they need people urgently, and this fits your
              current availability.
            </p>

            <button className="mt-8 w-full bg-[#57068C] text-white py-4 rounded-full font-medium tracking-wide">
              Take me there →
            </button>
          </div>

          <p className="text-center text-sm text-neutral-500">
            Highest-value use of your next 30 minutes.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center px-6 py-10">
      {/* Comic Strip */}
      <div className="w-full max-w-4xl h-36 overflow-hidden">
        <img
          src="/comic.png"
          alt="FLANO comic strip"
          className="w-full h-full object-cover object-[24%_62%]"
        />
      </div>

      {/* Logo */}
      <div className="mt-16 text-2xl font-serif tracking-wide">
        FLÂNO <span className="text-[#57068C] text-base">@ NYU</span>
      </div>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center gap-10">
        <h1 className="text-5xl font-serif leading-tight">
          Your next best move at NYU.
        </h1>

        <button
          onClick={() => setStarted(true)}
          className="bg-[#57068C] text-white px-12 py-4 rounded-full text-lg font-medium tracking-wide hover:opacity-90 transition"
        >
          I’m free now
        </button>
      </section>

      <p className="text-sm text-neutral-400 pb-6">
        Real-time campus matching
      </p>
    </main>
  );
}