# Ductivity App — Project Conversation Log

**Date:** March 30 - April 2, 2026
**Developer:** Anindya Banerjee
**AI Assistant:** Claude Opus 4.6
**GitHub:** https://github.com/anindyabanerjee/ductivity_app
**EAS Project:** https://expo.dev/accounts/anindyaexpo101/projects/ductivity-app

---

## Project Overview

**Ductivity** is a React Native (Expo) productivity tracking app that lets users log their activities every 30 minutes via push notifications. It stores data in Firebase Firestore, visualizes productivity through charts, and supports time-based filtering.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo SDK 54), TypeScript |
| Backend | Firebase Firestore |
| Auth | Anonymous (single-user, `default_user`) |
| Notifications | expo-notifications (local scheduled) |
| Charts | react-native-chart-kit |
| Navigation | @react-navigation/native (bottom tabs) |
| State | React Context (UserContext), AsyncStorage |
| Haptics | expo-haptics |
| Build | EAS Build (cloud, APK) |

---

## Build Session Timeline

### Phase 1: Project Setup
- Initialized Expo project with TypeScript template
- Installed all dependencies (Firebase, navigation, charts, notifications, etc.)
- Set up Firebase config with user's credentials
- Created Firestore data model: `activities/{docId}` with userId, activity, category, timestamp

### Phase 2: Core Screens
- **WelcomeScreen** — Onboarding with name input, persisted via AsyncStorage
- **TaskScreen** — 8 activity cards in a grid layout
- **DashboardScreen** — Charts with 7 time filters (3H to Monthly)
- **SplashScreen** — Animated brand intro (2.5s)

### Phase 3: Activity Definitions
| # | Activity | Category |
|---|----------|----------|
| 1 | Personal Work | productive |
| 2 | Office Work | productive |
| 3 | Relaxing | semi-productive |
| 4 | Baal Bichi | non-productive |
| 5 | Resting | productive |
| 6 | Learning | productive |
| 7 | Eating | productive |
| 8 | Playing CS2 | meh |

### Phase 4: Firebase Integration
- Connected to Firebase project: `ductivity` (ductivity.firebaseapp.com)
- Created Firestore composite index: `userId` (Ascending) + `timestamp` (Descending)
- CRUD operations: logActivity, getActivities, deleteActivity

### Phase 5: Fluid UI Attempt
- Attempted react-native-reanimated — **FAILED** in Expo Go (TurboModule crash)
- Attempted reanimated v3 downgrade — **FAILED** (NativeProxy NullPointerException)
- **Solution:** Replaced with React Native built-in `Animated` API
- Created: AnimatedButton, useFadeInUp, FadeInCard components

### Phase 6: Animation Bug Fixes
- **Bug:** Activity cards vanished after logging (cards 3-6 disappeared)
- **Root cause 1:** `useStaggeredList` called `useRef` inside a loop (violated Rules of Hooks)
- **Fix 1:** Replaced with `FadeInCard` component (self-contained per card)
- **Bug persisted** even with FadeInCard
- **Root cause 2:** `AnimatedButton` wrapper's `Animated.View` lost content on re-render
- **Fix 2:** Replaced with plain `TouchableOpacity` — no animations on cards
- **Bug persisted** even with TouchableOpacity
- **Root cause 3:** Flex-wrap grid with percentage widths (`'47%'`) caused layout issues on re-render
- **Final fix:** Replaced with `FlatList` + `numColumns={2}` + `React.memo` on ActivityCard + `Dimensions`-based fixed pixel widths

### Phase 7: Push Notifications
- expo-notifications removed from Expo Go in SDK 53
- **Fix:** Added `Constants.appOwnership === 'expo'` guard — all notification code skipped in Expo Go
- Notifications only work in the APK build
- Scheduled as individual DATE triggers (not TIME_INTERVAL) for Expo Go compat
- 1-minute interval for testing (configurable via Settings)

### Phase 8: Settings Screen
- Notification frequency selector: 1m, 2m, 3m, 5m, 30m, 1h, 3h
- Sleep mode: toggle + time picker (e.g., 23:00 - 07:00)
- Do Not Disturb: toggle + time picker
- Clear Data section: Clear Activities, Reset Settings, Clear All Data
- Save & Apply navigates back to Log Activity tab

### Phase 9: Features Added
- **Custom Toast** — replaced native Alert with themed slide-down toast + Undo button
- **Undo** — deletes last logged activity from Firestore, clears cooldown
- **Cooldown timer** — one activity per notification frequency, live countdown
- **Cooldown syncs with settings** — recalculates when user returns from Settings
- **Notification listener** — navigates to Task tab + shows reminder banner when notification fires
- **Dashboard chart slider** — Pie, Bar, Timeline, Progress views
- **Timeline view** — recent activities as a vertical timeline with colored dots
- **Word of the Day** — 31 curated words, rotates daily
- **Haptic feedback** — on tab switches, button presses, activity logging
- **Personalization** — "Hey {name}" on TaskScreen, "{name}'s Dashboard"

### Phase 10: Optimizations
- `constants.ts` — centralized magic numbers
- `timeUtils.ts` — shared time parsing (eliminated duplication in notificationService + settingsService)
- `queryCache.ts` — 30s TTL in-memory cache for Firestore dashboard queries
- `useMemo` on chart aggregations (categoryCounts, activityCounts, productivePercent)
- `React.memo` on Toast, SkeletonLoader, WordOfTheDay
- Cooldown timer pauses when TaskScreen is unfocused

### Phase 11: Documentation
- Added JSDoc comments to all 18 source files
- Created `react-native-guide.html` — interactive React Native learning page with 12 sections
- Created `architecture-guide.html` — interactive architecture diagrams with 9 sections

---

## EAS Build History

| Build | Status | Issue | Fix |
|-------|--------|-------|-----|
| 1-3 | FAILED | Tar extraction permission errors | OneDrive file metadata corrupted tar — moved to `C:\dev\ductivity_build` |
| 4 | FAILED | `npm ci` lockfile mismatch | Regenerated `package-lock.json` without `--legacy-peer-deps` |
| 5 | FAILED | Missing `babel-preset-expo` | Added as explicit dependency |
| 6+ | SUCCESS | — | Build from `C:\dev\ductivity_build` with clean `npm install` |

**Build workflow:**
```
1. Sync files: cp from OneDrive project → C:\dev\ductivity_build
2. Clean install: rm -rf node_modules package-lock.json && npm install
3. Commit: git add -A && git commit
4. Build: eas build -p android --profile preview --non-interactive --no-wait
```

---

## Key Learnings & Gotchas

1. **OneDrive + EAS Build don't mix** — OneDrive adds file metadata that breaks tar extraction on Linux build servers. Always build from a non-OneDrive directory.

2. **react-native-reanimated doesn't work in Expo Go** — TurboModule compatibility issues. Use the built-in `Animated` API instead.

3. **Push notifications removed from Expo Go in SDK 53** — Guard all notification code with `Constants.appOwnership === 'expo'`.

4. **Don't call hooks inside loops** — `useRef` inside `Array.from()` violates Rules of Hooks and causes unpredictable behavior.

5. **Don't reset animations on `useFocusEffect`** — Resetting animated values on tab focus causes content to disappear when state changes trigger re-renders. Animate once on mount only.

6. **FlatList > flex-wrap for grids** — FlatList with `numColumns` handles re-renders much better than a flex-wrap View with percentage widths.

7. **`React.memo` prevents cascade re-renders** — Memoize card components in lists so only the changed card re-renders.

8. **Cache invalidation matters** — Clear the query cache whenever data is written (log or undo) so the dashboard shows fresh data.

---

## File Structure (Final)

```
ductivity_app/
├── App.tsx                           # Root: splash → welcome → tabs + notification context
├── app.json                          # Expo config
├── babel.config.js                   # Babel preset (no reanimated plugin)
├── eas.json                          # EAS Build profiles
├── .easignore                        # Excludes .claude, .git, .expo from builds
├── react-native-guide.html           # Interactive RN learning page
├── architecture-guide.html           # Interactive architecture diagrams
├── src/
│   ├── types/index.ts                # CategoryType, Activity, ActivityLog, TimeFilter
│   ├── config/
│   │   ├── constants.ts              # Centralized magic numbers
│   │   ├── activities.ts             # 8 activity definitions
│   │   └── firebase.ts               # Firebase init + Firestore instance
│   ├── context/
│   │   └── UserContext.tsx            # User name storage via AsyncStorage
│   ├── utils/
│   │   ├── animations.tsx            # AnimatedButton, useFadeInUp, FadeInCard
│   │   ├── haptics.ts               # Light, medium, success haptic wrappers
│   │   └── timeUtils.ts             # parseTime, isMinuteInRange, formatCountdown
│   ├── services/
│   │   ├── activityService.ts        # Firestore CRUD + query cache integration
│   │   ├── notificationService.ts    # Push notification scheduling + Expo Go guard
│   │   ├── settingsService.ts        # AppSettings read/write via AsyncStorage
│   │   └── queryCache.ts             # 30s TTL in-memory Firestore query cache
│   ├── components/
│   │   ├── ActivityChart.tsx          # Pie, Bar, Timeline, Progress charts
│   │   ├── Toast.tsx                 # Slide-down toast with Undo button
│   │   ├── SkeletonLoader.tsx        # Shimmer loading placeholder
│   │   └── WordOfTheDay.tsx          # Daily rotating vocabulary card
│   └── screens/
│       ├── SplashScreen.tsx          # Animated brand splash (2.5s)
│       ├── WelcomeScreen.tsx         # Name input + onboarding
│       ├── TaskScreen.tsx            # 8 activity cards + toast + cooldown
│       ├── DashboardScreen.tsx       # Charts + filters + Word of the Day
│       └── SettingsScreen.tsx        # Frequency, sleep, DND, clear data
```

---

## Firebase Config

```
Project: ductivity
Auth Domain: ductivity.firebaseapp.com
Project ID: ductivity
Collection: activities
Index: userId (ASC) + timestamp (DESC)
```

---

## Commands Reference

```bash
# Start dev server
npx expo start -c

# Build APK (from C:\dev\ductivity_build)
eas build -p android --profile preview --non-interactive

# TypeScript check
npx tsc --noEmit

# Push to GitHub
git add -A && git commit -m "message" && git push origin main
```

---

*This log was auto-generated to preserve the full project conversation context.*
