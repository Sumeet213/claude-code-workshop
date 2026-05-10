export type WeeklyStats = {
  steps: number;
  calories: number;
  distanceKm: number;
};

export type Workout = {
  id: string;
  name: string;
  date: string; // ISO date string
  durationMinutes: number;
};

export type UserProfile = {
  id: string;
  name: string;
  tagline: string;
  avatarUrl: string;
  weeklyStats: WeeklyStats;
  recentWorkouts: Workout[];
};
