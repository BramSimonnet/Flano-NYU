export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface UserPreferences {
  maxDuration: number;
  interests: string[];
  radiusKm: number;
  minAttendees?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  startTime: Date;
  duration: number; // in minutes
  category: string;
  attendeeCount: number;
  matchScore: number; // 0-100, based on user preferences
  imageUrl?: string;
  organizer: string;
}

export interface RegistrationStatus {
  eventId: string;
  status: "interested" | "registered" | "attending" | "completed";
  registeredAt: Date;
}
