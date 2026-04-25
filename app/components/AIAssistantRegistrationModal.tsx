"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Event, UserLocation, UserPreferences } from "../types";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const createAssistantMessage = (text: string): ChatMessage => ({
  id: `assistant-${crypto.randomUUID()}`,
  role: "assistant",
  text,
});

const createUserMessage = (text: string): ChatMessage => ({
  id: `user-${crypto.randomUUID()}`,
  role: "user",
  text,
});

export default function AIAssistantRegistrationModal({
  isOpen,
  events,
  currentEvent,
  registeredEventIds,
  userLocation,
  userPreferences,
  onClose,
  onAutoRegister,
  onSelectEvent,
}: {
  isOpen: boolean;
  events: Event[];
  currentEvent: Event;
  registeredEventIds: string[];
  userLocation: UserLocation | null;
  userPreferences: UserPreferences | null;
  onClose: () => void;
  onAutoRegister: (eventId: string) => void;
  onSelectEvent: (index: number) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createAssistantMessage(
      "Hi! I'm your FLANO AI assistant. I can search events, summarize your plan, and auto-register from chat.\nTry: 'What other events am I registered for?', 'register me for a hackathon near me', or 'what starts the soonest?'.\nCurrent event pool is clickable below - tap any event to jump there."
    ),
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const addAssistant = (text: string) => {
    setMessages((prev) => [...prev, createAssistantMessage(text)]);
  };

  const getDistanceKm = (event: Event): number | null => {
    if (!userLocation) return null;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latDelta = toRadians(event.location.latitude - userLocation.latitude);
    const lonDelta = toRadians(event.location.longitude - userLocation.longitude);
    const lat1 = toRadians(userLocation.latitude);
    const lat2 = toRadians(event.location.latitude);
    const a =
      Math.sin(latDelta / 2) ** 2 +
      Math.sin(lonDelta / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const getDistanceText = (event: Event): string => {
    const distanceKm = getDistanceKm(event);
    if (distanceKm === null) return "distance unavailable";
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
    return `${distanceKm.toFixed(2)} km away`;
  };

  const getMinutesUntilStart = (event: Event): number => {
    const diffMs = event.startTime.getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  const getStartText = (event: Event): string => {
    const minutes = getMinutesUntilStart(event);
    if (minutes < 1) return "starting now";
    if (minutes < 60) return `starts in ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `starts in ${hours}h ${minutes % 60}m`;
  };

  const getRegisteredEvents = (): Event[] =>
    events.filter((event) => registeredEventIds.includes(event.id));

  const findEventByQuery = (query: string): Event | undefined => {
    const text = query.toLowerCase();
    const exact = events.find((event) => {
      const haystack = `${event.title} ${event.category} ${event.location.name}`.toLowerCase();
      return haystack.includes(text) || text.includes(event.title.toLowerCase());
    });
    if (exact) return exact;

    const queryTokens = text.split(/[^a-z0-9]+/).filter((token) => token.length > 2);
    if (queryTokens.length === 0) return undefined;

    const scored = events
      .map((event) => {
        const haystack = `${event.title} ${event.category} ${event.location.name}`.toLowerCase();
        const score = queryTokens.reduce(
          (count, token) => count + (haystack.includes(token) ? 1 : 0),
          0
        );
        return { event, score };
      })
      .sort((a, b) => b.score - a.score);

    if ((scored[0]?.score ?? 0) > 0) {
      return scored[0].event;
    }

    return undefined;
  };

  const getTopMatchEvent = (): Event => {
    return [...events].sort((a, b) => b.matchScore - a.matchScore)[0] ?? currentEvent;
  };

  const getSoonestEvent = (): Event => {
    return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0] ?? currentEvent;
  };

  const getMostPopularEvent = (): Event => {
    return [...events].sort((a, b) => b.attendeeCount - a.attendeeCount)[0] ?? currentEvent;
  };

  const getLeastPopularEvent = (): Event => {
    return [...events].sort((a, b) => a.attendeeCount - b.attendeeCount)[0] ?? currentEvent;
  };

  const getTravelEstimateText = (event: Event): string => {
    const distanceKm = getDistanceKm(event);
    if (distanceKm === null) return "I can't estimate travel time without your location.";
    const walkingMinutes = Math.max(2, Math.round(distanceKm * 12));
    return `Estimated walking time is about ${walkingMinutes} minutes (${getDistanceText(event)}).`;
  };

  const getAvailabilityFitText = (): string => {
    if (!userPreferences) return "I don't have your preference window yet.";
    const fittingEvents = events.filter((event) => event.duration <= userPreferences.maxDuration);
    if (fittingEvents.length === 0) {
      return `None of the current options fully fit your ${userPreferences.maxDuration}-minute availability window.`;
    }
    return `${fittingEvents.length} out of ${events.length} events fit your ${userPreferences.maxDuration}-minute availability.`;
  };

  const pickBestEventFromIntent = (query: string): Event => {
    const text = query.toLowerCase();

    const registerTech = /hackathon|startup|pitch|code|ai|tech/.test(text);
    const wantsNearest = /near me|nearby|closest|walking distance/.test(text);

    const titleMatched = events.find((event) =>
      text.includes(event.title.toLowerCase())
    );
    if (titleMatched) return titleMatched;

    const sortedByMatch = [...events].sort((a, b) => b.matchScore - a.matchScore);

    if (registerTech) {
      const techCandidate = sortedByMatch.find((event) => {
        const haystack = `${event.title} ${event.category}`.toLowerCase();
        return /hackathon|startup|pitch|code|ai|tech/.test(haystack);
      });

      if (techCandidate) return techCandidate;
    }

    if (wantsNearest) {
      return sortedByMatch[0] ?? currentEvent;
    }

    return currentEvent;
  };

  const handleSubmit = (eventForm: FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();

    const value = input.trim();
    if (!value) return;

    setMessages((prev) => [...prev, createUserMessage(value)]);
    setInput("");

    const lower = value.toLowerCase();

    if (
      /(what|which|show|list).*(registered|registration|signed up)|am i registered/.test(lower)
    ) {
      const registeredEvents = getRegisteredEvents();
      if (registeredEvents.length === 0) {
        addAssistant(
          "You are not registered for any events yet. If you want, I can register you for your top match right now."
        );
        return;
      }

      const registeredList = registeredEvents
        .map(
          (event, index) =>
            `${index + 1}. ${event.title} (${event.location.name}, ${getStartText(event)})`
        )
        .join("\n");
      addAssistant(`You're currently registered for:\n${registeredList}`);
      return;
    }

    if (/(how far|distance|how close|near me|nearby)/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(
        `${referenced.title} is ${getDistanceText(referenced)} from your current location. ${getTravelEstimateText(
          referenced
        )}`
      );
      return;
    }

    if (/(what|which).*(soonest|next|earliest)|starts? first/.test(lower)) {
      const soonestEvent = getSoonestEvent();
      addAssistant(
        `The soonest event is ${soonestEvent.title} at ${soonestEvent.location.name} - ${getStartText(
          soonestEvent
        )}.`
      );
      return;
    }

    if (/(best|top).*(match|option)|highest match/.test(lower)) {
      const bestMatch = getTopMatchEvent();
      addAssistant(
        `Your top match is ${bestMatch.title} (${bestMatch.matchScore}% match) at ${bestMatch.location.name}.`
      );
      return;
    }

    if (/(why|reason).*(match|recommended|this event)|why this/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(
        `${referenced.title} is recommended because it has a ${referenced.matchScore}% match, is ${getDistanceText(
          referenced
        )}, and ${getStartText(referenced)}.`
      );
      return;
    }

    if (/(where|location).*(is|for)|where is/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(
        `${referenced.title} is at ${referenced.location.name}. It ${getStartText(
          referenced
        )} and lasts ${referenced.duration} minutes.`
      );
      return;
    }

    if (/(organizer|who.*host|who.*running|hosted by)/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(`${referenced.title} is organized by ${referenced.organizer}.`);
      return;
    }

    if (/(description|details|tell me more|about this event|summary)/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(
        `${referenced.title}: ${referenced.description}\nCategory: ${referenced.category}\nOrganizer: ${referenced.organizer}`
      );
      return;
    }

    if (/(how long|duration|how much time)/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(
        `${referenced.title} takes about ${referenced.duration} minutes and ${getStartText(
          referenced
        )}.`
      );
      return;
    }

    if (/(category|type of event|what kind)/.test(lower)) {
      const referenced = findEventByQuery(value) ?? currentEvent;
      addAssistant(`${referenced.title} is in the ${referenced.category} category.`);
      return;
    }

    if (/(attendees|attendance|people going|how many people|popular)/.test(lower)) {
      const referenced = findEventByQuery(value);
      if (referenced) {
        addAssistant(
          `${referenced.title} currently has ${referenced.attendeeCount} people going.`
        );
        return;
      }

      const mostPopular = getMostPopularEvent();
      const leastPopular = getLeastPopularEvent();
      addAssistant(
        `Most popular right now: ${mostPopular.title} (${mostPopular.attendeeCount} attendees).\nSmaller group option: ${leastPopular.title} (${leastPopular.attendeeCount} attendees).`
      );
      return;
    }

    if (/(fit|within|available time|time window|max duration)/.test(lower)) {
      addAssistant(getAvailabilityFitText());
      return;
    }

    if (/(compare|difference|vs|versus)/.test(lower)) {
      const bestMatch = getTopMatchEvent();
      const soonest = getSoonestEvent();
      addAssistant(
        `Quick comparison:\nTop match: ${bestMatch.title} (${bestMatch.matchScore}% match, ${getDistanceText(
          bestMatch
        )})\nSoonest: ${soonest.title} (${getStartText(soonest)}, ${soonest.duration} min)`
      );
      return;
    }

    if (/(categories|types|kind of events|what categories)/.test(lower)) {
      const categories = Array.from(new Set(events.map((event) => event.category))).join(", ");
      addAssistant(`Current categories in your feed: ${categories}.`);
      return;
    }

    if (/(events in|anything in|show.*category)/.test(lower)) {
      const categoryMatch = Array.from(new Set(events.map((event) => event.category))).find(
        (category) => lower.includes(category.toLowerCase())
      );
      if (!categoryMatch) {
        addAssistant("Tell me a category name and I can list matching events.");
        return;
      }

      const categoryEvents = events.filter((event) => event.category === categoryMatch).slice(0, 3);
      if (categoryEvents.length === 0) {
        addAssistant(`No events found in ${categoryMatch} right now.`);
        return;
      }
      const list = categoryEvents
        .map((event) => `- ${event.title} (${event.location.name}, ${getStartText(event)})`)
        .join("\n");
      addAssistant(`Here are ${categoryMatch} events:\n${list}`);
      return;
    }

    if (/(show|list|what).*(event|options)/.test(lower)) {
      addAssistant("Here are your current matches. Tap any event button below to jump there.");
      return;
    }

    if (/(register|sign me up|join|book)/.test(lower)) {
      const targetEvent = pickBestEventFromIntent(value);
      onAutoRegister(targetEvent.id);
      addAssistant(
        `Registered. I picked ${targetEvent.title} for you based on your request and proximity/match signals.`
      );
      addAssistant(
        `Details: ${targetEvent.location.name}, starts soon, ${targetEvent.matchScore}% match.`
      );
      addAssistant("You can ask me to register for a different event anytime.");
      return;
    }

    addAssistant(
      "I can answer event details like distance, start time, match score, attendees, duration, location, organizer, and registration status.\nTry:\n- How far is this event?\n- Why is this recommended?\n- Who is organizing this?\n- What other events am I registered for?\n- Compare my top match vs soonest event."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#57068C] font-semibold">AI Assisted</p>
            <h2 className="text-lg sm:text-xl font-serif text-neutral-900">FLANO Chat Agent</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 transition"
          >
            Close
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto bg-neutral-50 px-4 py-4 sm:px-6 sm:py-5 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm sm:text-base leading-relaxed ${
                message.role === "assistant"
                  ? "bg-white border border-neutral-200 text-neutral-800"
                  : "ml-auto bg-[#57068C] text-white"
              }`}
            >
              {message.text}
            </div>
          ))}

          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Current event pool
            </p>
            <div className="mt-2 grid gap-2">
              {events.map((event, index) => (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent(index)}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-800 transition hover:border-[#57068C] hover:bg-[#57068C]/5"
                >
                  <span className="font-medium">{index + 1}. {event.title}</span>
                  <span className="block text-xs text-neutral-600">
                    {event.location.name} - {event.matchScore}% match
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-neutral-200 bg-white p-4 sm:p-5">
          <label className="block text-xs sm:text-sm text-neutral-600 mb-2">Ask the AI assistant anything about event registration</label>
          <div className="flex gap-2 sm:gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type: I wanna register for a hackathon near me"
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm sm:text-base text-neutral-900 outline-none focus:border-[#57068C]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#57068C] px-5 py-2.5 text-sm sm:text-base font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
