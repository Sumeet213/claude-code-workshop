import { useCallback, useEffect, useState } from 'react';
import type { AsyncResource, Profile } from '../types';

export type SimulatedState = 'populated' | 'empty' | 'error' | 'loading';

const MOCK_PROFILE: Profile = {
  id: 'u_1',
  name: 'Avery Chen',
  tagline: 'Trail runs, sunrise lifts, slow Sundays.',
  avatarUrl: 'https://i.pravatar.cc/240?img=47',
  stats: {
    steps: 58420,
    calories: 12380,
    distanceKm: 42.7,
  },
  recentWorkouts: [
    {
      id: 'w_1',
      name: 'Morning Trail Run',
      date: '2026-05-09',
      durationMinutes: 48,
    },
    {
      id: 'w_2',
      name: 'Upper Body Strength',
      date: '2026-05-08',
      durationMinutes: 35,
    },
    {
      id: 'w_3',
      name: 'Recovery Yoga',
      date: '2026-05-07',
      durationMinutes: 25,
    },
  ],
};

const EMPTY_PROFILE: Profile = {
  ...MOCK_PROFILE,
  stats: { steps: 0, calories: 0, distanceKm: 0 },
  recentWorkouts: [],
};

interface UseProfileOptions {
  simulate?: SimulatedState;
  delayMs?: number;
}

export function useProfile(options: UseProfileOptions = {}): AsyncResource<Profile> {
  const { simulate = 'populated', delayMs = 600 } = options;
  const [data, setData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setData(null);

    const handle = setTimeout(() => {
      if (cancelled) return;
      if (simulate === 'loading') return;
      if (simulate === 'error') {
        setError(new Error('Could not load your profile. Check your connection.'));
        setIsLoading(false);
        return;
      }
      setData(simulate === 'empty' ? EMPTY_PROFILE : MOCK_PROFILE);
      setIsLoading(false);
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [simulate, delayMs, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}
