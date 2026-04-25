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
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-between py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      
      {/* Logo */}
      <div className="text-xl sm:text-2xl md:text-3xl font-serif tracking-wide">
        FLÂNO <span className="text-[#57068C] text-sm sm:text-base md:text-xl font-semibold">@ NYU</span>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-8 sm:gap-10 md:gap-12 text-center max-w-5xl">
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-tight text-neutral-900">
          Your next best move at NYU.
        </h1>

        <p className="text-neutral-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
          Instantly match with the best thing to do on campus right now.
        </p>

        <button
          onClick={() => setShowOnboarding(true)}
          className="bg-[#57068C] text-white px-8 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 rounded-full text-base sm:text-lg md:text-xl font-medium hover:opacity-90 transition tracking-wide"
        >
          I'm free now
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs sm:text-sm md:text-base text-neutral-600">
        Real-time campus matching
      </p>

    </main>
  );
}
