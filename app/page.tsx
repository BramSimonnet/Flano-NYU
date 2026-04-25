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
      <div className="w-full max-w-4xl rounded-[2rem] border border-[#1F1F1F] bg-[#F5F2EA] px-6 sm:px-10 py-8 sm:py-10 flex flex-col items-center text-center">
        {/* Comic Strip */}
        <div className="w-full h-56 sm:h-64 overflow-hidden">
          <img
            src="/comicII.png"
            alt="FLANO comic strip"
            className="w-full h-full object-contain object-center"
          />
        </div>

        {/* Logo */}
        <div className="-mt-8 text-2xl font-serif tracking-wide">
          FLÂNO <span className="text-[#57068C] text-base">@ NYU</span>
        </div>

        {/* Hero */}
        <section className="mt-12 w-full flex flex-col items-center justify-center text-center gap-10">
          <h1 className="mt-0 text-2xl sm:text-[1.95rem] font-sans font-medium tracking-tight leading-[1.15] text-neutral-900">
            Your next best move at NYU.
          </h1>

          <button
            onClick={() => setShowOnboarding(true)}
            className="bg-[#57068C] text-white px-10 py-3 rounded-full text-base font-medium tracking-wide hover:opacity-90 transition"
          >
            Send me somewhere
          </button>

          <div className="mt-20 space-y-1 text-center">
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
