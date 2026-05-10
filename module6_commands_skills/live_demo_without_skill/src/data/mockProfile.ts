import { UserProfile } from '../types/profile';

export const mockProfile: UserProfile = {
  id: 'u_001',
  name: 'Alex Morgan',
  tagline: 'Run more. Sit less. Repeat.',
  avatarUrl: 'https://i.pravatar.cc/300?img=12',
  weeklyStats: {
    steps: 48230,
    calories: 12450,
    distanceKm: 36.4,
  },
  recentWorkouts: [
    {
      id: 'w_001',
      name: 'Morning Run',
      date: '2026-05-09',
      durationMinutes: 42,
    },
    {
      id: 'w_002',
      name: 'HIIT Session',
      date: '2026-05-08',
      durationMinutes: 28,
    },
    {
      id: 'w_003',
      name: 'Evening Yoga',
      date: '2026-05-07',
      durationMinutes: 55,
    },
  ],
};
