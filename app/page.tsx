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
    <main className="min-h-screen bg-[#F5F2EA] flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-4xl rounded-[2rem] border border-[#1F1F1F] bg-[#FEF7FB] px-6 sm:px-10 py-6 sm:py-8 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-2">
          <img
            src="/flanologo.png"
            alt="FLÂNO @ NYU"
            className="h-40 w-auto mx-auto"
          />
        </div>

        {/* Hero */}
        <section className="mt-20 w-full flex flex-col items-center justify-center text-center gap-6">
          <h1 className="mt-0 text-xl sm:text-2xl font-sans font-medium tracking-tight leading-[1.15] text-neutral-900">
            Your next best move at NYU.
          </h1>

          <button
            onClick={() => setShowOnboarding(true)}
            className="bg-[#57068C] text-white px-8 py-2.5 rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition"
          >
            Send me somewhere
          </button>

          <div className="mt-12 space-y-1 text-center">
            <p className="text-sm sm:text-[0.95rem] font-medium tracking-tight text-black">
              Discover what&apos;s happening around you - right now.
            </p>
            <p className="text-xs sm:text-sm font-normal text-black">
              Find events, spaces, and opportunities in real time.
            </p>
          </div>
        </section>

        <div className="mt-0 pb-2">
          <img
            src="/whistle.png"
            alt=""
            aria-hidden="true"
            className="w-36 h-36 object-contain"
          />
        </div>

        <div className="pb-2 text-sm text-neutral-500">
          <p>Real-time campus matching</p>
        </div>
      </div>
    </main>
  );
}
