# Live demo comparison — Skills make the difference

**Setup:** two `general-purpose` sub-agents were spawned in parallel from the same root prompt — *"Build a React Native profile screen for a fitness app called Stride."* The only difference: the **with_skill** agent received the team's `frontend-design` rules in its prompt; the **without_skill** agent did not.

Both agents had the same model, same tools, same time budget, same blank working directory. Neither was told what "good" looks like beyond what was in its prompt.

## What each one produced (raw counts)

| | `with_skill/` | `without_skill/` |
|---|---|---|
| Total source files | **32** | **12** |
| Theme / token files | 7 (`colors`, `spacing`, `radii`, `typography`, `shadows`, `motion`, `index`) | 1 (`colors.ts` containing everything) |
| Reusable primitives | 10 (Button, Card, Avatar, Skeleton, EmptyState, ErrorState, StatTile, WorkoutRow, Text, Divider) | 4 (Avatar, StatCard, WorkoutListItem, PrimaryButton) |
| Screen split into sub-components | 4 (`ProfileHeader`, `StatsRow`, `RecentWorkouts`, `ProfileSkeleton`) | 0 (single screen file) |
| Loading state | ✅ skeleton mirroring layout | ❌ none — renders `mockProfile` immediately |
| Error state | ✅ `ErrorState` primitive + retry wired to `refetch` | ❌ none |
| Empty state | ✅ `EmptyState` shown when zero workouts | ❌ none |
| Async data hook | ✅ `useProfile()` returning `{data, isLoading, error, refetch}` | ❌ static import of `mockProfile` |
| Accessibility | ✅ `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` on every interactive | ⚠️ minimal — relies on RN defaults |
| Haptics on press | ✅ `Haptics.impactAsync` gated on `Platform.OS !== 'web'` | ❌ none |
| Reanimated press-scale | ✅ `withSpring(0.96)` on button, respects reduced motion | ❌ none |
| Reduced-motion respect | ✅ `useReducedMotion()` checked in animations and Skeleton | ❌ none |
| Tokens vs magic numbers | ✅ zero raw hex outside `theme/colors.ts` | ⚠️ tokens used, but values like `size={104}` and `marginHorizontal: -spacing.xs` leak |
| Card shadow XOR border | ✅ enforced (Card primitive accepts one OR the other) | ❌ no Card primitive |
| Typography sizes per screen | ✅ 3 (per the rule) | ⚠️ `h1`, `h2`, `body`, plus inline overrides |
| BUILD_NOTES traceability | ✅ rule-by-rule provenance + explicit skips with reasoning | ⚠️ generic "decisions" section |

## What this means

The skill is not "more code." It's **a forcing function for the four async states, accessibility, and a real component vocabulary** — the things experienced devs *know* matter but skip when nobody is enforcing them.

A blank-slate agent will always write the happy path. A skill-equipped agent writes the path you'd actually ship.

## How to run this demo live in 90 seconds

1. Show the file trees side by side: `tree live_demo_with_skill && tree live_demo_without_skill`.
2. Open `live_demo_without_skill/src/screens/ProfileScreen.tsx` — point out: no loading, no error, no haptics.
3. Open `live_demo_with_skill/screens/ProfileScreen/ProfileScreen.tsx` — point out: `useProfile` hook, three branches (`isLoading` → Skeleton, `error` → ErrorState, `data` → populated), the `simulate` prop that lets you preview every state.
4. Open both `BUILD_NOTES.md` files. The with-skill one cites which rule drove which decision. The without-skill one is a generic "what I built" summary.
5. Ask the room: *"On Monday, which one of these gets through code review faster?"*

## Predict-before-reveal prompt for participants

Before you show the artifacts:

> Both of these agents got the same prompt: build a fitness profile screen. One had access to a `frontend-design` skill with our team's rules. The other didn't. **In one minute, write down three things you predict will be different.** Then we open the files.

Common predictions: "the with-skill one will be longer," "it will use design tokens," "it will be more accessible." Most groups *under-predict* the structural difference (10 vs 4 primitives, async-state branching, reduced-motion handling).
