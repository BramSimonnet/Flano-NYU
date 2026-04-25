"use client";

import { useState } from "react";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UserPreferences {
  maxDuration: number;
  interests: string[];
  radiusKm: number;
}

const INTEREST_OPTIONS = [
  "Academic Clubs",
  "Sports & Fitness",
  "Arts & Culture",
  "Social Events",
  "Tech & Innovation",
  "Food & Dining",
  "Volunteering",
  "Music & Entertainment",
  "Study Groups",
  "Workshops",
];

const DURATION_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2+ hours", value: 120 },
];

// Auto-calculate radius based on time available (temporal parameter)
// More time = can go further
const getAutoRadius = (durationMinutes: number): number => {
  if (durationMinutes <= 15) return 0.2; // On my building (~2 min walk)
  if (durationMinutes <= 30) return 0.4; // Walking distance (~5 min walk)
  if (durationMinutes <= 60) return 1.0; // Campus-wide (~15 min walk)
  return 2.0; // Nearby area (~30 min walk)
};

const getRadiusDescription = (radiusKm: number): string => {
  if (radiusKm <= 0.2) return "your building";
  if (radiusKm <= 0.4) return "5-minute walk away";
  if (radiusKm <= 1.0) return "campus-wide";
  return "nearby areas";
};

export default function Onboarding({
  onComplete,
}: {
  onComplete: (data: { location: UserLocation; preferences: UserPreferences }) => void;
}) {
  const [step, setStep] = useState<"location" | "interests" | "duration">("location");
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences>({
    maxDuration: 30,
    interests: [],
    radiusKm: 1.0,
  });

  // Request Location
  const requestLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const userLocation: UserLocation = {
          latitude,
          longitude,
          accuracy,
        };
        setLocation(userLocation);
        setLoadingLocation(false);
        setStep("interests");
      },
      (error) => {
        let errorMessage = "Unable to access location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable it in settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Interest Selection
  const toggleInterest = (interest: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Duration Selection - Auto-calculate radius based on time and complete onboarding
  const handleDurationSelect = (duration: number) => {
    const autoRadius = getAutoRadius(duration);

    if (location) {
      onComplete({
        location,
        preferences: {
          maxDuration: duration,
          interests: preferences.interests,
          radiusKm: autoRadius,
        },
      });
    }
  };

  // Location Step
  if (step === "location") {
    return (
      <main className="min-h-screen bg-[#F5F2EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col">
        <section className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div>
            <p className="text-xs sm:text-sm md:text-base text-neutral-700 mb-2">Step 1 of 3</p>
            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-serif">Let&apos;s find what&apos;s nearby</h1>
          </div>

          <div className="bg-[#FEF7FB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-sm border border-neutral-200 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div>
                <p className="text-xs sm:text-sm md:text-base text-neutral-600">
                  We&apos;ll use your location to find events near you
                </p>
                <p className="text-xs sm:text-sm md:text-base text-neutral-600 mt-2">
                  Your location is private and only used for matching
                </p>
              </div>
              <button
                onClick={requestLocation}
                disabled={loadingLocation}
                className="mt-3 sm:mt-4 bg-[#57068C] text-white px-10 sm:px-12 py-3 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50 text-sm sm:text-base md:text-lg"
              >
                {loadingLocation ? "Getting location..." : "Share my location"}
              </button>
            </div>

            {locationError && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-xs sm:text-sm md:text-base text-red-700">{locationError}</p>
              </div>
            )}

            <div className="flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-neutral-600 text-center px-2">
              You can change this anytime in settings
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Interests Step
  if (step === "interests") {
    return (
      <main className="min-h-screen bg-[#F5F2EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col">
        <section className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div>
            <p className="text-xs sm:text-sm md:text-base text-neutral-700 mb-2">Step 2 of 3</p>
            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-serif">What are you into?</h1>
            <p className="text-neutral-700 mt-2 text-xs sm:text-sm md:text-base">
              Select at least one category (or let us surprise you!)
            </p>
          </div>

          <div className="bg-[#FEF7FB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-sm border border-neutral-200 flex flex-col gap-3 sm:gap-4 md:gap-6">
            {/* Surprise Me Button */}
            <div className="bg-gradient-to-r from-[#57068C] to-[#7B2CBF] rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 text-white">
              <button
                onClick={() => {
                  const randomCategories = INTEREST_OPTIONS.sort(
                    () => Math.random() - 0.5
                  ).slice(0, 3);
                  setPreferences((prev) => ({
                    ...prev,
                    interests: randomCategories,
                  }));
                  setStep("duration");
                }}
                className="w-full text-left group"
              >
                <p className="font-semibold text-sm sm:text-base md:text-lg">✨ Surprise me!</p>
                <p className="text-xs sm:text-sm md:text-base text-white/80 mt-1">
                  Don&apos;t know what you want? Let&apos;s explore 3 random categories
                </p>
              </button>
            </div>

            {/* Category Grid */}
            <div>
              <p className="text-xs md:text-sm text-neutral-700 mb-2 sm:mb-3 md:mb-4">BROWSE BY INTEREST</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base font-medium transition ${
                      preferences.interests.includes(interest)
                        ? "bg-[#57068C] text-white"
                        : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <button
                onClick={() => setStep("duration")}
                disabled={preferences.interests.length === 0}
                className="w-full bg-[#57068C] text-white py-3 sm:py-4 md:py-5 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50 text-sm sm:text-base md:text-lg"
              >
                Next
              </button>
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm md:text-base text-blue-900 leading-relaxed">
                💡 <span className="font-semibold">Tip:</span> Most students are exploring Tech, Sports & Social events right now
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Duration Step - Final step
  if (step === "duration") {
    return (
      <main className="min-h-screen bg-[#F5F2EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col">
        <section className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div>
            <p className="text-xs sm:text-sm md:text-base text-neutral-700 mb-2">Step 3 of 3</p>
            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-serif">How much time do you have?</h1>
            <p className="text-neutral-700 mt-2 text-xs sm:text-sm md:text-base">
              We&apos;ll automatically search {getRadiusDescription(getAutoRadius(DURATION_OPTIONS[1].value))} based on your availability
            </p>
          </div>

          <div className="bg-[#FEF7FB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-sm border border-neutral-200 flex flex-col gap-3 sm:gap-4 md:gap-6">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDurationSelect(option.value)}
                  className="w-full bg-white border-2 border-neutral-200 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 text-left hover:border-[#57068C] transition group"
                >
                  <p className="font-medium text-sm sm:text-base md:text-lg text-neutral-900">{option.label}</p>
                </button>
              ))}
            </div>

            <p className="text-xs sm:text-sm md:text-base text-neutral-600 text-center px-2">
              ✨ Smart radius automatically adjusts based on your time
            </p>
          </div>
        </section>
      </main>
    );
  }

  return null;
}
