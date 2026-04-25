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
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-between py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Logo */}
      <div className="text-xl sm:text-2xl font-serif tracking-wide">
        FLÂNO <span className="text-neutral-400 text-sm sm:text-base">@ NYU</span>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 text-center">
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">
          Make the most of your free time.
        </h1>

        <p className="text-neutral-500 max-w-xs sm:max-w-md text-sm sm:text-base leading-relaxed">
          Instantly match with the best thing to do on campus right now.
        </p>

        <button
          onClick={() => setShowOnboarding(true)}
          className="bg-[#7A5A45] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium hover:opacity-90 transition"
        >
          I'm free now
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs sm:text-sm text-neutral-400">
        Real-time campus matching
      </p>

    </main>
  );
}
