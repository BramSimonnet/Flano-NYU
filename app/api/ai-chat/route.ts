import { NextResponse } from "next/server";

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

interface EventInput {
  id: string;
  title: string;
  description: string;
  category: string;
  organizer: string;
  duration: number;
  attendeeCount: number;
  matchScore: number;
  startTime: string | Date;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface AiChatRequest {
  query?: string;
  conversation?: ChatMessage[];
  currentEventId?: string;
  events?: EventInput[];
  registeredEventIds?: string[];
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  userPreferences?: {
    maxDuration: number;
    interests: string[];
    radiusKm: number;
    minAttendees?: number;
  } | null;
}

const SYSTEM_PROMPT = `You are FLANO's AI event assistant for NYU students.
Answer user questions using only the provided context.

Rules:
1) Be concise, helpful, and specific.
2) If you do not have enough context, say so briefly.
3) If the user asks to register/join/sign up for an event, set autoRegisterEventId to the best matching event id from the event list.
4) If no registration intent exists, autoRegisterEventId must be null.
5) Never invent event ids or event data.
6) Return ONLY valid JSON with this exact shape:
{"answer":"string","autoRegisterEventId":"string|null"}
`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY on server." },
      { status: 500 }
    );
  }

  let body: AiChatRequest;
  try {
    body = (await request.json()) as AiChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events : [];
  const validEventIds = new Set(events.map((event) => event.id));
  const selectedCurrentEventId = body.currentEventId ?? null;
  const registeredEventIds = Array.isArray(body.registeredEventIds)
    ? body.registeredEventIds.filter((eventId) => validEventIds.has(eventId))
    : [];
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];

  const contextPayload = {
    query,
    currentEventId: selectedCurrentEventId,
    events: events.map((event) => ({
      ...event,
      startTime:
        typeof event.startTime === "string"
          ? event.startTime
          : new Date(event.startTime).toISOString(),
    })),
    registeredEventIds,
    userLocation: body.userLocation ?? null,
    userPreferences: body.userPreferences ?? null,
    previousConversation: conversation.slice(-12),
  };

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(contextPayload),
        },
      ],
    }),
  });

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    return NextResponse.json(
      { error: "Groq request failed.", details: errorText },
      { status: 502 }
    );
  }

  const completion = (await groqResponse.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const rawContent = completion.choices?.[0]?.message?.content?.trim();
  if (!rawContent) {
    return NextResponse.json({ error: "Empty LLM response." }, { status: 502 });
  }

  let parsed: { answer?: string; autoRegisterEventId?: string | null };
  try {
    parsed = JSON.parse(rawContent) as { answer?: string; autoRegisterEventId?: string | null };
  } catch {
    return NextResponse.json(
      { error: "Non-JSON LLM response.", raw: rawContent },
      { status: 502 }
    );
  }

  const answer =
    typeof parsed.answer === "string" && parsed.answer.trim().length > 0
      ? parsed.answer.trim()
      : "I could not produce a valid answer for that request.";

  const autoRegisterEventId =
    typeof parsed.autoRegisterEventId === "string" &&
    validEventIds.has(parsed.autoRegisterEventId)
      ? parsed.autoRegisterEventId
      : null;

  return NextResponse.json({ answer, autoRegisterEventId });
}
