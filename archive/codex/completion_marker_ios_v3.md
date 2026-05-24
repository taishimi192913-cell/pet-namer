# Sippomi iOS v3 Completion Marker

Date: 2026-05-07
Scope: Phase A-I
Status: Complete with runtime fallbacks

## What This Development Is

Sippomi iOS is the Expo / React Native version of Sippomi's pet-name diagnosis experience. It reuses the shared recommendation logic and provides an iOS flow where users move from Intro to condition input, then Like / Pass / Hold swipe diagnosis, then Results.

The product remains fully free. No payment or paid feature path was added.

## Completed

- Phase A: split Intro, Form, SwipeCard, Results, shared components, shared types, session helpers, and styles out of `App.tsx`.
- Phase B: added visual polish, pet illustrations, species cards, Like/Pass overlays, ranking badges, warm palette, and background dots.
- Phase C: added `NameDetailModal` and `PreferenceChart`.
- Phase D: added haptics for Like, Pass, and save-on-like.
- Phase E: added React Navigation native stack implementation, with a View-based fallback when native screen components are unavailable in the current dev-client runtime.
- Phase F: added Ionicons to primary controls and result affordances.
- Phase G: added AsyncStorage/Supabase persistence path, with a memory fallback when the current native runtime exposes `AsyncStorage` as null.
- Phase H: added theme support through `useColorScheme`, iOS appearance fallback probing, dark palette overrides, themed icons/buttons/charts/modal pieces, and native SVG fallback rendering.
- Phase I: ran compiler/export checks and simulator smoke verification.

## Runtime Compatibility Notes

The simulator's current development build did not expose several native view managers reliably despite CocoaPods/build output showing them compiled. To keep the app usable while preserving the intended dependencies, the app now falls back when native managers are absent:

- `react-native-svg` components fall back to plain `View` silhouettes/bars/background behavior.
- React Navigation native stack falls back to an internal route state machine if `RNSScreenStack` is unavailable.
- `react-native-safe-area-context` is no longer required at app startup; `ScreenSafeArea` uses React Native `SafeAreaView`.
- AsyncStorage is lazy-loaded only when `RNCAsyncStorage` exists; otherwise session data uses an in-memory fallback to avoid a red screen.

## Verification

- `npx tsc --noEmit`: pass
- `npx expo export --platform ios --clear`: pass
  - Latest: `iOS Bundled 8525ms index.ts (1079 modules)`
  - `Exported: dist`
- `git diff --check -- apps/ios/App.tsx apps/ios/app.json apps/ios/ios/petnamer/Info.plist apps/ios/src apps/ios/package.json apps/ios/package-lock.json progress.txt completion_marker_ios_v3.md tasks.json`: pass
- `npx expo start --dev-client --localhost --port 8081`: pass
  - Metro reached waiting state.
  - iOS bundle rebuilt from Metro without fatal errors.
- `npx expo run:ios --device "iPhone 17 Pro" --port 8081`: pass
  - CocoaPods install/build path completed.
  - `Build Succeeded`
  - `0 error(s), and 1 warning(s)`
- Simulator smoke verification:
  - Intro screen rendered.
  - Intro -> Form rendered after tapping start.
  - Species selection enabled the diagnosis start action.
  - Form -> Swipe rendered.
  - Like action updated the learning summary and candidate.
  - Swipe -> Results rendered, including conditions, learning summary, chart fallback bars, liked candidate, and saved candidate.
- Dark mode verification:
  - `xcrun simctl ui 295DE10A-1C7D-4873-A44F-F19A6CAF3D10 appearance`: `dark`
  - After relaunching `com.anonymous.pet-namer-ios`, Metro logged React Native appearance as `scheme: "dark"` / `Appearance.getColorScheme(): "dark"`.
  - Screenshot `/private/tmp/sippomi_dark_verify.png` confirmed the Intro screen rendered with the dark background, dark card surface, and light text.
  - Earlier mismatch was caused by checking `booted` while two simulators were running; the app was on `iPhone 17 Pro`, which was still in light appearance.

## Residual Risks

- The simulator shows a React Native warning because `SafeAreaView` is deprecated. This is intentionally accepted for the current runtime fallback because `react-native-safe-area-context` native components were unavailable in this dev-client path.
- Haptic physical feedback cannot be felt in the simulator; wiring is verified by build/runtime flow only.
- AsyncStorage persistence uses a native fallback guard. If `RNCAsyncStorage` is unavailable, data is kept in memory for that runtime session instead of persisted.
- Supabase insert was not verified because no logged-in Supabase session/env was provided.
