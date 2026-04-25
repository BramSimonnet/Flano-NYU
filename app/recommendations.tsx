"use client";

import { useEffect, useRef, useState } from "react";
import { useOnboarding } from "./contexts/OnboardingContext";
import { getRecommendedEvents } from "./services/eventService";
import AIAssistantRegistrationModal from "./components/AIAssistantRegistrationModal";
import type { Event } from "./types";

interface RegistrationDetails {
  fullName: string;
  email: string;
}

export default function Recommendations() {
  const { location, preferences } = useOnboarding();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [registeredByEventId, setRegisteredByEventId] = useState<Record<string, RegistrationDetails>>({});
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationFullName, setRegistrationFullName] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const eventCardRef = useRef<HTMLDivElement | null>(null);
  const topLogo = (
    <button
      type="button"
      onClick={() => {
        window.location.href = "/";
      }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50"
      aria-label="Go to home"
    >
      <img
        src="/flanologo.png"
        alt="FLANO logo"
        className="w-[4.5rem] h-[4.5rem] object-contain"
      />
    </button>
  );

  useEffect(() => {
    if (location && preferences) {
      // Simulate loading delay for better UX
      setTimeout(() => {
        const recommendedEvents = getRecommendedEvents(location, preferences);
        setEvents(recommendedEvents);
        setLoading(false);
      }, 800);
    }
  }, [location, preferences]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F2EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col">
        {topLogo}
        <button
          onClick={() => window.location.href = "/"}
          className="text-left text-sm text-neutral-500 mb-10"
        >
          ← back
        </button>

        <div className="bg-[#FEF7FB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-sm border border-neutral-200">
          <section className="max-w-md mx-auto w-full flex flex-col gap-6 items-center justify-center min-h-100">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-12 bg-neutral-200 rounded-2xl"></div>
            <div className="h-32 bg-neutral-200 rounded-2xl"></div>
          </div>
          <p className="text-sm text-neutral-700">Finding perfect events for you...</p>
        </section>
        </div>
      </main>
    );
  }

  if (events.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F2EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col">
        {topLogo}
        <button
          onClick={() => window.location.href = "/"}
          className="text-left text-sm text-neutral-500 mb-10"
        >
          ← back
        </button>

        <div className="bg-[#FEF7FB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-sm border border-neutral-200">
          <section className="max-w-md mx-auto w-full flex flex-col gap-6 items-center justify-center min-h-100">
          <div className="text-center">
            <p className="text-3xl mb-2">😴</p>
            <h2 className="text-2xl font-serif mb-2">No events right now</h2>
            <p className="text-neutral-600">
              Try expanding your interests or time availability
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/"}
            className="mt-6 bg-[#57068C] text-white px-8 py-4 rounded-full font-medium"
          >
            Adjust preferences
          </button>
        </section>
        </div>
      </main>
    );
  }

  const currentEvent = events[currentEventIndex];
  const isCurrentEventRegistered = Boolean(registeredByEventId[currentEvent.id]);
  const registeredEvents = events.filter((event) => Boolean(registeredByEventId[event.id]));
  const displayedAttendeeCount = currentEvent.attendeeCount + (isCurrentEventRegistered ? 1 : 0);

  const formatTime = (date: Date): string => {
    const diff = date.getTime() - nowMs;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Starting now";
    if (minutes < 60) return `Starts in ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    return `Starts in ${hours}h ${minutes % 60}m`;
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-blue-100 text-blue-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-orange-100 text-orange-700";
  };

  const mapQuery = `${currentEvent.location.latitude},${currentEvent.location.longitude}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}${
    location
      ? `&origin=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`
      : ""
  }&travelmode=walking`;

  const resetRegistrationForm = () => {
    setRegistrationFullName("");
    setRegistrationEmail("");
    setRegistrationError("");
  };

  const openRegistrationModal = () => {
    resetRegistrationForm();
    setShowRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    resetRegistrationForm();
  };

  const handleRegisterCurrentEvent = () => {
    const fullName = registrationFullName.trim();
    const email = registrationEmail.trim();

    if (!fullName || !email) {
      setRegistrationError("Please enter your full name and email.");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setRegistrationError("Please enter a valid email address.");
      return;
    }

    setRegisteredByEventId((prev) => ({
      ...prev,
      [currentEvent.id]: {
        fullName,
        email,
      },
    }));
    closeRegistrationModal();
  };

  const handleUnregisterCurrentEvent = () => {
    setRegisteredByEventId((prev) => {
      const updated = { ...prev };
      delete updated[currentEvent.id];
      return updated;
    });
  };

  return (
    <main className="min-h-screen bg-[#F5F2EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 flex flex-col">
      {topLogo}
      <button
        onClick={() => window.location.href = "/"}
        className="text-left text-xs sm:text-sm md:text-base text-neutral-700 mb-6 sm:mb-10 md:mb-12"
      >
        ← back
      </button>

      <div className="bg-[#FEF7FB] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-sm border border-neutral-200">
        <section className="max-w-md md:max-w-2xl lg:max-w-6xl mx-auto w-full flex flex-col gap-3 sm:gap-4 md:gap-6">
        <div>
          {registeredEvents.length > 0 && (
            <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-3 py-2 sm:px-4">
              <p className="text-xs sm:text-sm font-medium text-green-800">
                Registered: {registeredEvents.map((event) => event.title).join(" • ")}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          {/* Main Event Card */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs sm:text-sm md:text-base text-neutral-700">
                ✨ FLANO picked your next move
              </p>
              <button
                onClick={() => setShowAIAgent(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#57068C] bg-white px-4 py-2 text-xs sm:text-sm font-medium text-[#57068C] hover:bg-[#57068C]/10 transition shrink-0"
              >
                ✨ AI assisted chat
              </button>
            </div>
            <div
              ref={eventCardRef}
              className="bg-white rounded-2xl sm:rounded-3xl md:rounded-4xl p-4 sm:p-6 md:p-10 shadow-sm border border-neutral-200"
            >
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 mt-1">
              {currentEventIndex + 1} of {events.length} recommendations
            </p>
            <div className={`inline-block px-3 sm:px-4 md:px-5 py-1 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold mb-3 sm:mb-4 md:mb-6 ${getMatchColor(currentEvent.matchScore)}`}>
              {currentEvent.matchScore}% Match
            </div>

            {/* Event Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif mt-2">{currentEvent.title}</h1>

            {/* Event Meta */}
            <p className="text-neutral-700 mt-2 sm:mt-3 text-xs sm:text-sm wrap-break-word">
              <span className="block sm:inline">{currentEvent.location.name}</span>
              <span className="hidden sm:inline"> · </span>
              <span className="block sm:inline">{formatTime(currentEvent.startTime)}</span>
              <span className="hidden sm:inline"> · </span>
              <span className="block sm:inline">takes {currentEvent.duration} min</span>
            </p>

            {/* Why This Event */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-neutral-50 rounded-lg sm:rounded-xl border border-neutral-200">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                <span className="font-semibold">Why you:</span> You&apos;re interested in {currentEvent.category.toLowerCase()}, it fits your time, and you&apos;re nearby.
              </p>
            </div>

            {/* Event Description */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-neutral-700 leading-relaxed">{currentEvent.description}</p>

            {/* Attendee Count */}
            <div className="mt-4 sm:mt-6 flex items-center gap-2">
              <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 bg-[#57068C] rounded-full shrink-0"></span>
              <p className="text-xs sm:text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">{displayedAttendeeCount}</span> people going
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-8 grid gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (!isCurrentEventRegistered) {
                    openRegistrationModal();
                  }
                }}
                disabled={isCurrentEventRegistered}
                className={`w-full py-3 sm:py-4 rounded-full font-medium transition text-sm sm:text-base ${
                  isCurrentEventRegistered
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-[#57068C] text-white hover:opacity-90"
                }`}
              >
                {isCurrentEventRegistered ? "Registered" : "I'm interested"}
              </button>
              {isCurrentEventRegistered && (
                <button
                  onClick={handleUnregisterCurrentEvent}
                  className="w-full py-3 sm:py-4 rounded-full font-medium transition text-sm sm:text-base bg-white text-[#57068C] border border-[#57068C] hover:bg-[#57068C]/5"
                >
                  Unregister
                </button>
              )}
            </div>

            {isCurrentEventRegistered && (
              <p className="mt-3 text-xs sm:text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                You&apos;re already registered for this event.
              </p>
            )}
            </div>
          </div>

          {/* Map + Directions Panel */}
          <aside className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200 h-fit lg:sticky lg:top-8">
            <p className="text-xs sm:text-sm font-semibold text-neutral-900">Event location</p>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              {currentEvent.location.name}
            </p>

            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
              <iframe
                title={`Map for ${currentEvent.title}`}
                src={mapEmbedUrl}
                className="h-52 sm:h-60 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#57068C] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
            >
              Get walking directions
            </a>
          </aside>
        </div>

        {/* Navigation */}
        {events.length > 1 && (
          <div className="flex gap-1 sm:gap-2 justify-center items-center">
            <button
              onClick={() =>
                setCurrentEventIndex(
                  currentEventIndex === 0 ? events.length - 1 : currentEventIndex - 1
                )
              }
              className="hidden sm:block px-3 sm:px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm hover:border-neutral-300"
            >
              ← Previous
            </button>

            <div className="flex-1 flex gap-1 sm:gap-2 justify-center">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentEventIndex(index)}
                  className={`rounded-full transition ${
                    index === currentEventIndex
                      ? "bg-[#57068C] w-4 sm:w-6 h-2 sm:h-2"
                      : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`Go to event ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentEventIndex(
                  currentEventIndex === events.length - 1 ? 0 : currentEventIndex + 1
                )
              }
              className="hidden sm:block px-3 sm:px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm hover:border-neutral-300"
            >
              Next →
            </button>
          </div>
        )}

        {/* Summary */}
        <p className="text-center text-xs sm:text-sm text-neutral-400 px-2">
          Personalized for your next {preferences?.maxDuration} minutes
        </p>
      </section>
      </div>

      {showAIAgent && (
        <AIAssistantRegistrationModal
          isOpen={showAIAgent}
          events={events}
          currentEvent={currentEvent}
          registeredEventIds={Object.keys(registeredByEventId)}
          userLocation={location}
          userPreferences={preferences}
          onClose={() => setShowAIAgent(false)}
          onAutoRegister={(eventId) => {
            setRegisteredByEventId((prev) =>
              prev[eventId]
                ? prev
                : {
                    ...prev,
                    [eventId]: {
                      fullName: "Auto-registered user",
                      email: "not-provided@example.com",
                    },
                  }
            );
          }}
          onSelectEvent={(index) => {
            setCurrentEventIndex(index);
            setShowAIAgent(false);
            window.setTimeout(() => {
              eventCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 200);
          }}
        />
      )}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#57068C] font-semibold">Register</p>
                <h2 className="text-lg font-serif text-neutral-900">{currentEvent.title}</h2>
              </div>
              <button
                onClick={closeRegistrationModal}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 transition"
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Full name</label>
                <input
                  value={registrationFullName}
                  onChange={(e) => {
                    setRegistrationFullName(e.target.value);
                    if (registrationError) setRegistrationError("");
                  }}
                  placeholder="e.g. Alex Johnson"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#57068C]"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={registrationEmail}
                  onChange={(e) => {
                    setRegistrationEmail(e.target.value);
                    if (registrationError) setRegistrationError("");
                  }}
                  placeholder="you@nyu.edu"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#57068C]"
                />
              </div>
              {registrationError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {registrationError}
                </p>
              )}
              <button
                onClick={handleRegisterCurrentEvent}
                className="w-full rounded-full bg-[#57068C] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Confirm registration
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
