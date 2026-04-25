"use client";

import { useState } from "react";
import Onboarding from "./onboarding";
import Recommendations from "./recommendations";
import { useOnboarding } from "./contexts/OnboardingContext";
import type { UserLocation, UserPreferences } from "./types";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isOnboarded, setOnboarding } = useOnboarding();

  const handleOnboardingComplete = (data: {
    location: UserLocation;
    preferences: UserPreferences;
  }) => {
    setOnboarding(data.location, data.preferences);
    setShowOnboarding(false);
  };

  // If user clicked "I'm free now" but hasn't completed onboarding yet
  if (showOnboarding && !isOnboarded) {
    return (
      <Onboarding onComplete={handleOnboardingComplete} />
    );
  }

  // After onboarding - show recommendations
  if (isOnboarded) {
    return <Recommendations />;
  }

  // Landing page
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
          onClick={() => setShowOnboarding(true)}
          className="bg-[#57068C] text-white px-12 py-4 rounded-full text-lg font-medium tracking-wide hover:opacity-90 transition"
        >
          I'm free now
        </button>
      </section>

      <p className="text-sm text-neutral-400 pb-6">
        Real-time campus matching
      </p>
    </main>
  );
}
