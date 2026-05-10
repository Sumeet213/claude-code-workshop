# Stride — Profile Screen (Build Notes)

## What was built

A self-contained React Native + TypeScript profile screen for a fitness app called **Stride**, designed to drop into a fresh Expo project. Includes:

- `App.tsx` — Expo entrypoint that mounts the profile screen inside a `SafeAreaProvider`.
- `src/screens/ProfileScreen.tsx` — The screen itself: avatar, name, tagline, weekly stats, recent workouts, edit button.
- `src/components/` — Reusable presentational components: `Avatar`, `StatCard`, `WorkoutListItem`, `PrimaryButton`.
- `src/types/profile.ts` — TypeScript types for `UserProfile`, `WeeklyStats`, `Workout`.
- `src/data/mockProfile.ts` — Mock profile fixture with 3 recent workouts.
- `src/theme/colors.ts` — Shared color, spacing, radius and typography tokens.
- `package.json` + `tsconfig.json` — Minimum config so the files run in a fresh Expo TypeScript template.

## File layout

```
live_demo_without_skill/
├── App.tsx
├── package.json
├── tsconfig.json
├── BUILD_NOTES.md
└── src/
    ├── components/
    │   ├── Avatar.tsx
    │   ├── PrimaryButton.tsx
    │   ├── StatCard.tsx
    │   └── WorkoutListItem.tsx
    ├── data/
    │   └── mockProfile.ts
    ├── screens/
    │   └── ProfileScreen.tsx
    ├── theme/
    │   └── colors.ts
    └── types/
        └── profile.ts
```

## Design decisions

- **Dark theme.** Fitness apps tend to skew dark/high-contrast for outdoor / gym readability. A deep navy background (`#0F1419`) with a mint-green primary (`#22D3A4`) reads as energetic without being neon.
- **Token-driven styling.** All colors / spacing / radii / type sizes live in `src/theme/colors.ts` so the look can be re-themed in one place. No magic numbers in components.
- **Composition over a monolith.** The screen is broken into small components (`Avatar`, `StatCard`, `WorkoutListItem`, `PrimaryButton`) so each piece can be tested, restyled, or swapped out independently. The screen file just composes them.
- **Typed props everywhere.** Every component takes a typed props object. The screen accepts an optional `profile` prop (defaulting to the mock) and an optional `onEditProfile` callback — so it's already wired for real data + a real handler.
- **Mock data is realistic.** The mock uses sensible weekly numbers (steps ~48k, distance 36.4km) and three different workout types (run, HIIT, yoga) so screenshots look believable.
- **Accessibility basics.** `accessibilityLabel`s on the stat cards, workout rows, avatar, and button. `Pressable` with a pressed-state opacity/scale on the primary button.
- **SafeAreaProvider + SafeAreaView.** Used so the header doesn't collide with the notch/status bar on iOS.
- **Date / duration formatting helpers.** Kept inline in `WorkoutListItem` for now since they're tiny and only used there; would extract to `src/utils/format.ts` once a second consumer appears.

## How to use

In a fresh Expo TypeScript app (`npx create-expo-app -t expo-template-blank-typescript`), drop these files in over the scaffold, then `npm install` and `npx expo start`. The `package.json` here lists the minimum runtime deps (`expo`, `react`, `react-native`, `react-native-safe-area-context`, `expo-status-bar`).

## What I'd add next

- Replace `console.log` in the edit handler with navigation to an `EditProfileScreen`.
- Pull profile data from a real source (React Query + a `/me` endpoint) instead of the mock.
- Add a loading skeleton + error state for the screen.
- Snapshot / RTL tests for the components.
- Light-mode variant by extending the theme with a `mode` switch.
