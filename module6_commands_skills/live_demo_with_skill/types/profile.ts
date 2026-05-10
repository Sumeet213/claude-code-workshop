export interface WeeklyStats {
  steps: number;
  calories: number;
  distanceKm: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  durationMinutes: number;
}

export interface Profile {
  id: string;
  name: string;
  tagline: string;
  avatarUrl: string | null;
  stats: WeeklyStats;
  recentWorkouts: Workout[];
}

export interface AsyncResource<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
