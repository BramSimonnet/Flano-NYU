import type { Event, UserLocation, UserPreferences } from "./types";

// Mock events around NYU Washington Square
export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "AI Club Study Session",
    description: "Weekly AI/ML discussions and project work",
    location: {
      name: "Warren Weaver Hall, Room 101",
      latitude: 40.7296,
      longitude: -73.9967,
    },
    startTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    duration: 45,
    category: "Tech & Innovation",
    attendeeCount: 12,
    matchScore: 0,
    organizer: "AI Society",
  },
  {
    id: "2",
    title: "Basketball Pick-up Game",
    description: "Casual basketball at the gym",
    location: {
      name: "NYU Gym, Court 3",
      latitude: 40.7256,
      longitude: -73.9894,
    },
    startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    duration: 60,
    category: "Sports & Fitness",
    attendeeCount: 8,
    matchScore: 0,
    organizer: "Sports Club",
  },
  {
    id: "3",
    title: "Coffee & Code",
    description: "Developers meet for coffee and coding",
    location: {
      name: "Café Grumpy",
      latitude: 40.7308,
      longitude: -73.9976,
    },
    startTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    duration: 30,
    category: "Tech & Innovation",
    attendeeCount: 5,
    matchScore: 0,
    organizer: "Dev Community",
  },
  {
    id: "4",
    title: "Contemporary Art Discussion",
    description: "Explore modern art movements and techniques",
    location: {
      name: "Gray Art Gallery",
      latitude: 40.7296,
      longitude: -73.9952,
    },
    startTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    duration: 90,
    category: "Arts & Culture",
    attendeeCount: 15,
    matchScore: 0,
    organizer: "Art Society",
  },
  {
    id: "5",
    title: "Pizza & Networking",
    description: "Free pizza with CS students",
    location: {
      name: "CIMS Lounge",
      latitude: 40.7289,
      longitude: -73.9965,
    },
    startTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
    duration: 60,
    category: "Social Events",
    attendeeCount: 20,
    matchScore: 0,
    organizer: "Computer Science Club",
  },
  {
    id: "6",
    title: "Yoga Session",
    description: "Relaxing yoga for stress relief",
    location: {
      name: "Wellness Center",
      latitude: 40.7288,
      longitude: -73.9941,
    },
    startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    duration: 45,
    category: "Sports & Fitness",
    attendeeCount: 10,
    matchScore: 0,
    organizer: "Wellness Club",
  },
  {
    id: "7",
    title: "Startup Pitch Competition",
    description: "Student startups pitch their ideas",
    location: {
      name: "Entrepreneurship Hub",
      latitude: 40.7301,
      longitude: -73.9958,
    },
    startTime: new Date(Date.now() + 40 * 60 * 1000), // 40 minutes from now
    duration: 120,
    category: "Tech & Innovation",
    attendeeCount: 25,
    matchScore: 0,
    organizer: "Startup Club",
  },
];

// Calculate distance between two coordinates in km
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate match score based on multiple factors
const calculateMatchScore = (
  event: Event,
  userLocation: UserLocation,
  userPreferences: UserPreferences
): number => {
  let score = 0;

  // 1. Distance proximity (40 points max)
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    event.location.latitude,
    event.location.longitude
  );

  if (distance <= userPreferences.radiusKm) {
    const proximityScore = (1 - distance / userPreferences.radiusKm) * 40;
    score += proximityScore;
  } else {
    // Event is too far
    return -1;
  }

  // 2. Time availability (30 points max)
  // Events that fit within the user's available time score higher
  if (event.duration <= userPreferences.maxDuration) {
    const timeScore = (1 - event.duration / userPreferences.maxDuration) * 30;
    score += timeScore;
  } else {
    // Event is too long
    return -1;
  }

  // 3. Interest match (30 points max)
  if (userPreferences.interests.includes(event.category)) {
    score += 30;
  }

  // 4. Temporal factor - events starting sooner score higher (0-5 points)
  const timeUntilEvent =
    (event.startTime.getTime() - Date.now()) / (1000 * 60); // minutes
  if (timeUntilEvent >= 0 && timeUntilEvent <= 60) {
    const temporalScore = (1 - timeUntilEvent / 60) * 5;
    score += temporalScore;
  }

  // 5. Popularity bonus (0-5 points)
  if (event.attendeeCount > 15) {
    score += 5;
  } else if (event.attendeeCount > 10) {
    score += 3;
  }

  return Math.round(score);
};

// Get recommended events based on user location and preferences
export const getRecommendedEvents = (
  userLocation: UserLocation,
  userPreferences: UserPreferences
): Event[] => {
  // Calculate match scores for all events
  const scoredEvents = MOCK_EVENTS.map((event) => ({
    ...event,
    matchScore: calculateMatchScore(event, userLocation, userPreferences),
  }));

  // Filter valid events (matchScore >= 0) and sort by score (descending)
  return scoredEvents
    .filter((event) => event.matchScore >= 0)
    .sort((a, b) => b.matchScore - a.matchScore);
};
