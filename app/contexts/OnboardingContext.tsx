"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UserPreferences {
  maxDuration: number;
  interests: string[];
  radiusKm: number;
  minAttendees?: number;
}

interface OnboardingContextType {
  location: UserLocation | null;
  preferences: UserPreferences | null;
  isOnboarded: boolean;
  setOnboarding: (location: UserLocation, preferences: UserPreferences) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const setOnboarding = (loc: UserLocation, prefs: UserPreferences) => {
    setLocation(loc);
    setPreferences(prefs);
    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "flano_onboarding",
        JSON.stringify({
          location: loc,
          preferences: prefs,
          timestamp: new Date().toISOString(),
        })
      );
    }
  };

  const resetOnboarding = () => {
    setLocation(null);
    setPreferences(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("flano_onboarding");
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        location,
        preferences,
        isOnboarded: !!(location && preferences),
        setOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

export type { UserLocation, UserPreferences, OnboardingContextType };
