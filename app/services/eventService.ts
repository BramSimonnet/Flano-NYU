import type { Event, UserLocation, UserPreferences } from "../types";

const toTime = (minutesFromNow: number): Date =>
  new Date(Date.now() + minutesFromNow * 60 * 1000);

const baseLocation = { latitude: 40.7294, longitude: -73.9965 };

const event = (
  id: string,
  title: string,
  category: string,
  locationName: string,
  latOffset: number,
  lonOffset: number,
  minutesFromNow: number,
  duration: number,
  attendeeCount: number,
  organizer: string,
  description: string
): Event => ({
  id,
  title,
  description,
  location: {
    name: locationName,
    latitude: baseLocation.latitude + latOffset,
    longitude: baseLocation.longitude + lonOffset,
  },
  startTime: toTime(minutesFromNow),
  duration,
  category,
  attendeeCount,
  matchScore: 0,
  organizer,
});

// Presentation-safe mock catalog with varied categories, distances, durations, and group sizes.
export const MOCK_EVENTS: Event[] = [
  event("1", "AI Club Study Session", "Tech & Innovation", "Warren Weaver Hall, Room 101", 0.0002, -0.0002, 10, 45, 12, "AI Society", "Weekly AI/ML discussions and project work."),
  event("2", "Basketball Pick-up Game", "Sports & Fitness", "NYU Gym, Court 3", -0.0038, 0.0071, 15, 60, 8, "Sports Club", "Casual basketball at the gym."),
  event("3", "Coffee & Code", "Tech & Innovation", "Cafe Grumpy", 0.0014, -0.0011, 5, 30, 5, "Dev Community", "Developers meet for coffee and coding."),
  event("4", "Contemporary Art Discussion", "Arts & Culture", "Gray Art Gallery", 0.0002, 0.0013, 20, 90, 15, "Art Society", "Explore modern art movements and techniques."),
  event("5", "Pizza & Networking", "Social Events", "CIMS Lounge", -0.0005, 0.0, 25, 60, 20, "Computer Science Club", "Free pizza and networking with students."),
  event("6", "Yoga Session", "Sports & Fitness", "Wellness Center", -0.0006, 0.0024, 30, 45, 10, "Wellness Club", "Relaxing yoga for stress relief."),
  event("7", "Startup Pitch Competition", "Tech & Innovation", "Entrepreneurship Hub", 0.0007, 0.0007, 40, 120, 25, "Startup Club", "Student startups pitch their ideas."),
  event("8", "Open Mic Night", "Music & Entertainment", "Kimmel Center Stage", 0.0001, -0.0006, 18, 75, 36, "Student Arts Board", "Live performances from student musicians and poets."),
  event("9", "Campus Volunteering Sprint", "Volunteering", "Student Resource Center", -0.0012, -0.0009, 12, 30, 14, "Service Council", "Join a quick local volunteering action."),
  event("10", "Midterm Study Pods", "Study Groups", "Bobst Library, Floor 6", 0.0003, 0.0002, 8, 50, 18, "Academic Success Team", "Focused study circles for shared classes."),
  event("11", "Frontend Workshop", "Workshops", "Tandon Learning Lab", -0.0024, 0.0033, 35, 90, 22, "Build@NYU", "Hands-on frontend workshop with mentors."),
  event("12", "Food Crawl Meetup", "Food & Dining", "Washington Sq Park Arch", -0.0008, -0.0005, 28, 70, 16, "Foodie Collective", "Explore nearby food spots as a group."),
  event("13", "Intramural Soccer Drills", "Sports & Fitness", "Paulson Field", -0.0046, 0.0068, 22, 45, 24, "Rec Sports", "Fast-paced drills and mini games."),
  event("14", "Museum Night Plan", "Arts & Culture", "Stern Lobby", 0.0011, -0.0018, 55, 25, 7, "Culture Crew", "Small group heading to evening exhibits."),
  event("15", "Women in Tech Mixer", "Social Events", "Stern Tisch Hall", 0.0008, 0.0001, 50, 60, 40, "WiT NYU", "Networking mixer with founders and alumni."),
  event("16", "Live Jazz Jam", "Music & Entertainment", "Mercer Street Lounge", -0.0013, 0.0016, 45, 90, 28, "Jazz Collective", "Bring instruments or just listen."),
  event("17", "Sustainability Action Hour", "Volunteering", "Silver Center Courtyard", 0.0005, 0.0019, 14, 60, 12, "Green NYU", "Climate action planning and outreach."),
  event("18", "Design Sprint Lab", "Workshops", "Makerspace Studio", -0.003, 0.0047, 26, 120, 11, "Design Lab", "Prototype ideas with cross-disciplinary teams."),
  event("19", "Quick Lunch Meetup", "Food & Dining", "Kimmel Cafeteria", -0.0001, 0.0003, 6, 20, 9, "Campus Connect", "Grab lunch with people from new majors."),
  event("20", "Bioinformatics Coding Circle", "Study Groups", "Meyer Hall, Room 220", 0.0025, -0.0022, 32, 80, 13, "BioTech Union", "Study group for coding-heavy biology courses."),
  event("21", "Late Night Hack Session", "Tech & Innovation", "Third North Lounge", -0.0045, 0.0085, 75, 180, 44, "HackNYU", "Collaborative coding sprint for side projects."),
  event("22", "Community Garden Shift", "Volunteering", "Hudson Green Patch", -0.009, -0.004, 65, 90, 6, "Urban Roots", "Help maintain local community gardens."),
  event("23", "Global Cinema Screening", "Arts & Culture", "Cantor Film Room", 0.0015, -0.0009, 90, 110, 19, "Cinema Circle", "International short films and discussion."),
  event("24", "Rooftop Sunset Social", "Social Events", "Palladium Terrace", -0.0068, 0.0062, 52, 50, 30, "Residence Life", "Casual social with music and mocktails."),
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

// Approximate one-way walking time in minutes for a given distance.
const estimateTravelMinutes = (distanceKm: number): number => {
  const WALKING_MINUTES_PER_KM = 12; // ~5 km/h walking pace
  return distanceKm * WALKING_MINUTES_PER_KM;
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
  // Enforce that travel + event duration fits the user's selected time budget.
  const totalTimeNeeded = event.duration + estimateTravelMinutes(distance);
  if (totalTimeNeeded <= userPreferences.maxDuration) {
    const timeScore = (1 - totalTimeNeeded / userPreferences.maxDuration) * 30;
    score += timeScore;
  } else {
    // Event does not fit the user's total available time.
    return -1;
  }

  // 3. Interest match (30 points max)
  if (
    userPreferences.interests.length === 0 ||
    userPreferences.interests.includes(event.category)
  ) {
    score += 30;
  }

  // 3.5 Optional attendee floor for denser events
  if (
    typeof userPreferences.minAttendees === "number" &&
    event.attendeeCount < userPreferences.minAttendees
  ) {
    return -1;
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
  const eventFitsConstraints = (event: Event): boolean => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      event.location.latitude,
      event.location.longitude
    );

    if (distance > userPreferences.radiusKm) {
      return false;
    }

    const totalTimeNeeded = event.duration + estimateTravelMinutes(distance);
    return totalTimeNeeded <= userPreferences.maxDuration;
  };

  // Calculate match scores for all events
  const scoredEvents = MOCK_EVENTS.map((event) => ({
    ...event,
    matchScore: calculateMatchScore(event, userLocation, userPreferences),
  }));

  const strictMatches = scoredEvents
    .filter((event) => event.matchScore >= 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  if (strictMatches.length > 0) {
    return strictMatches;
  }

  // Presentation fallback: keep demo flow moving even with narrow filters.
  const relaxedMatches = MOCK_EVENTS
    .filter(eventFitsConstraints)
    .map((event) => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      event.location.latitude,
      event.location.longitude
    );

    const distanceScore = Math.max(0, 40 - distance * 18);
      const totalTimeNeeded = event.duration + estimateTravelMinutes(distance);
      const durationScore = Math.max(
        0,
        30 - Math.max(0, totalTimeNeeded - userPreferences.maxDuration) * 0.45
      );
    const interestScore =
      userPreferences.interests.length === 0 ||
      userPreferences.interests.includes(event.category)
        ? 30
        : 8;
    const fallbackScore = Math.max(35, Math.round(distanceScore + durationScore + interestScore));

    return {
      ...event,
      matchScore: fallbackScore,
    };
  })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);

  return relaxedMatches;
};
