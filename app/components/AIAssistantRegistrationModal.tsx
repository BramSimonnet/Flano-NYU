"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Event } from "../types";

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
  onClose,
  onAutoRegister,
}: {
  isOpen: boolean;
  events: Event[];
  currentEvent: Event;
  onClose: () => void;
  onAutoRegister: (eventId: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const eventsDigest = useMemo(
    () =>
      events
        .map(
          (event, index) =>
            `${index + 1}. ${event.title} (${event.category}) at ${event.location.name} - ${event.matchScore}% match`
        )
        .join("\n"),
    [events]
  );

  useEffect(() => {
    if (!isOpen) return;

    setInput("");
    setMessages([
      createAssistantMessage(
        "Hi! I'm your FLANO AI assistant. I can search events and auto-register you from chat."
      ),
      createAssistantMessage(
        "Try: 'I wanna register for a hackathon near me' or 'register me for the best event right now'."
      ),
      createAssistantMessage(`Current event pool:\n${eventsDigest}`),
    ]);
  }, [eventsDigest, isOpen]);

  if (!isOpen) return null;

  const addAssistant = (text: string) => {
    setMessages((prev) => [...prev, createAssistantMessage(text)]);
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

    if (/(show|list|what).*(event|options)/.test(lower)) {
      addAssistant(`Here are your current matches:\n${eventsDigest}`);
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
      "I can help with registration. Try saying: 'register me for a hackathon near me' or 'show my events'."
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
