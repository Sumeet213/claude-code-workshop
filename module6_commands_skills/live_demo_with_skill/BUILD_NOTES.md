# Stride — Profile Screen Build Notes

## File tree

```
live_demo_with_skill/
├── index.ts                          # root barrel
├── BUILD_NOTES.md
├── theme/
│   ├── colors.ts                     # dark palette tokens
│   ├── spacing.ts                    # xs..xxxl scale
│   ├── radii.ts                      # sm..pill
│   ├── typography.ts                 # display / body / caption (3 sizes)
│   ├── shadows.ts                    # card / raised, platform-aware
│   ├── motion.ts                     # spring config + press scales
│   └── index.ts
├── types/
│   ├── profile.ts                    # Profile, WeeklyStats, Workout, AsyncResource<T>
│   └── index.ts
├── hooks/
│   ├── useProfile.ts                 # stub hook, simulate populated|loading|empty|error
│   └── index.ts
├── primitives/                       # one component per file
│   ├── Text.tsx
│   ├── Button.tsx                    # haptics + reanimated press scale
│   ├── Card.tsx                      # variant: shadow | border (never both)
│   ├── Avatar.tsx                    # image w/ initials fallback
│   ├── Skeleton.tsx                  # opacity pulse, respects reduced motion
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── StatTile.tsx
│   ├── WorkoutRow.tsx
│   ├── Divider.tsx
│   └── index.ts
└── screens/
    ├── index.ts
    └── ProfileScreen/
        ├── ProfileScreen.tsx         # orchestrates loading / error / populated
        ├── ProfileHeader.tsx
        ├── StatsRow.tsx
        ├── RecentWorkouts.tsx        # populated list OR EmptyState inline
        ├── ProfileSkeleton.tsx       # mirrors final layout
        └── index.ts
```

## Drop-in usage

After installing peer deps (`expo-haptics`, `react-native-reanimated`,
`react-native-safe-area-context`) and wiring Reanimated's babel plugin:

```tsx
import { ProfileScreen } from './live_demo_with_skill';

export default function App() {
  return <ProfileScreen onEditProfile={() => {}} />;
}
```

To preview each async state during development:

```tsx
<ProfileScreen simulate="loading" />
<ProfileScreen simulate="empty" />
<ProfileScreen simulate="error" />
<ProfileScreen simulate="populated" />
```

## Which rule drove which decision

| Rule | Where it shows up |
|---|---|
| 1. Tokens, not magic numbers | All colours, spacing, radii, font sizes, shadows live in `theme/`. No hex literals appear in any component file (the only `#000` is the shadow colour inside `theme/shadows.ts` and `Card.tsx` shadow variant — kept as the single platform-shadow source). |
| 2. Strict typed props | Every component declares an `interface ...Props`. No `any`. Variants are string-literal unions: `Tone`, `Variant`, `Size`, `SimulatedState`. |
| 3. One primitive per file | `primitives/` has one component per file with matching filename, all re-exported through `index.ts`. The screen folder is also split: header / stats row / list / skeleton are separate files because `ProfileScreen.tsx` would otherwise cross the ~200 line guidance. |
| 4. Loading / empty / error on every screen | `ProfileScreen` branches on `isLoading → ProfileSkeleton`, `error → ErrorState`, `data → populated`. The skeleton mirrors the populated layout (avatar circle, name+tagline lines, three stat tiles, three list rows, button). The empty case is handled *inside* `RecentWorkouts` via the `EmptyState` primitive — that's the only sub-region that can be empty independent of the rest of the profile. |
| 5. Accessibility | Avatar has `accessibilityRole="image"` + label; header `Text` uses `accessibilityRole="header"`; `Button` is `role="button"` with label/hint/state and `hitSlop={8}` on top of `minHeight: 48`; `Skeleton` is hidden from a11y; `ErrorState` is `role="alert"`; `WorkoutRow` and `StatTile` expose composite accessible labels. `allowFontScaling` is on with a `maxFontSizeMultiplier` cap of 1.6 so dynamic text scales without breaking layout. |
| 6. Haptics | `Button` calls `Haptics.impactAsync(ImpactFeedbackStyle.Light)` gated on `Platform.OS !== 'web'`. Failure swallowed so the press still fires. |
| 7. Native animations | `Button` uses Reanimated `withSpring({ damping: 15, stiffness: 300, mass: 1 })` to scale to `0.96` on press-in. `Skeleton` runs an opacity pulse with `withRepeat(withTiming(...))`. Both check `useReducedMotion()` and skip the animation when set. |
| 8. Layout breathes | `spacing.xl` between blocks in `ProfileScreen`; cards use the **border** variant (never combined with shadow). Stat tiles use `gap: spacing.md` between siblings, `spacing.lg` padding inside. |
| 9. Typography hierarchy | Exactly three variants exist — `display`, `body`, `caption` — and the screen uses all three: display = name, body = section heading + button label, caption = tagline + secondary metadata. Secondary text everywhere uses `tone="secondary"` → `colors.textSecondary`. |
| 10. Platform branches sparingly | Two places: `Button` haptics gate on `Platform.OS !== 'web'`, and `theme/shadows.ts` chooses iOS shadow vs Android elevation. |
| 11. No narrating comments | None present. |
| 12. Stub data hook | `useProfile()` returns `{ data, isLoading, error, refetch }` and accepts a `simulate` flag for state previews. |

## Things skipped (and why)

- **Reanimated `entering` animations.** Considered animating in the populated state with `FadeIn`. Skipped — the screen mounts behind a skeleton, which is already a perceptual transition. Adding a fade on top would feel double-animated and would also need a reduced-motion gate per element.
- **Pull-to-refresh.** A `RefreshControl` would naturally pair with `refetch`, but it wasn't in the spec; the `ErrorState`'s "Try again" button already exposes `refetch`. Easy follow-up — wire `<RefreshControl onRefresh={refetch} refreshing={isLoading} />` onto the `ScrollView`.
- **An icon set.** `WorkoutRow` uses a coloured dot indicator instead of a per-workout icon to avoid pulling in `@expo/vector-icons` as a hard dependency. Trivial to swap once the host app picks an icon library.
- **Themed light mode.** Only the dark palette is defined. Adding light mode would mean wrapping the colour tokens in a `ThemeProvider` + `useTheme()` hook; the rest of the structure (one tokens file → typed exports) is already shaped for that swap.
- **Real avatar caching.** Falls back to initials on image error; no `expo-image` dependency assumed. The host app can swap `Image` for `expo-image` in one place.
- **Test files.** Not in scope for the deliverable; the typed props + small surface area make these straightforward to add later.
```
