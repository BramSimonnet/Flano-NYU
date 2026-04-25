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
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const addAssistant = (text: string) => {
    setMessages((prev) => [...prev, createAssistantMessage(text)]);
  };
  const handleSubmit = async (eventForm: FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();

    const value = input.trim();
    if (!value || isSending) return;

    setMessages((prev) => [...prev, createUserMessage(value)]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: value,
          conversation: messages,
          currentEventId: currentEvent.id,
          events,
          registeredEventIds,
          userLocation,
          userPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        answer?: string;
        autoRegisterEventId?: string;
      };

      if (data.autoRegisterEventId) {
        onAutoRegister(data.autoRegisterEventId);
      }

      addAssistant(
        data.answer?.trim() ||
          "I couldn't generate a response just now. Please try asking again."
      );
    } catch {
      addAssistant(
        "I couldn't reach the AI service right now. Please check your Groq API key and try again."
      );
    } finally {
      setIsSending(false);
    }
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
              disabled={isSending}
              className="rounded-full bg-[#57068C] px-5 py-2.5 text-sm sm:text-base font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
