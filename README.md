# Skillio — Home Screen

Home screen for an English-learning app for students aged 10–20, built with React Native (Expo SDK 58), Expo Router and Reanimated.

## Run

```bash
npm install
npx expo start
```

In development, tap **🧪 States** (bottom right) to switch between demo states. On web you can also open a state directly, for example `/?state=noLessons`.

## Project structure

```
src/
├── app/                      # routes: _layout, index (home), practice
├── screens/Authenticated/    # HomeScreen, PracticeScreen
├── features/
│   ├── home/                 # types, mock data, store + home components
│   └── practice/             # questions + answer option
├── components/               # reusable UI: AppText, Button, ButtonRow, Card, Badge,
│                             # ProgressRing, AnimatedBar, CountUpText, Confetti, EmptyState
├── hooks/                    # useCountdown, useCountUp, useGreeting, useMotion, useResponsive
├── constants/theme.ts        # colors, spacing, radii, fonts
└── utils/                    # helpers
```

## States

| State | What it shows |
|---|---|
| `classSoon` | Class countdown with Join, practice not done yet |
| `noClassDone` | Book a class, practice done with View results |
| `live` | Class is live with a Join now button |
| `newStudent` | No skill data yet, placement check prompt |
| `noLessons` | No lessons left, Add lessons |
| `noSubscription` | No active plan, free-trial upsell |
| `expired` | Plan expired, Renew |

## Added fields

All fields from the brief are kept as they are. These were added for the design:

| Field | Why |
|---|---|
| `subscription.status`, `renewsOn`, `expiredOn` | Tell an expired plan apart from no plan, and show when lessons refill |
| `scheduledClass.startsInMin`, `durationMin`, `isLive` | Countdown and live state |
| `progress.lessonsToNextLevel` | Shows the progress percentage as a number of lessons |
| `skillSnapshot.lastCheckIn` | Context for `growthPercent` |
| `dailyPractice.streakDays`, `week` | Streak and weekly progress |
| `dailyPractice.tasks`, `estimatedMinutes`, `xpReward` | What today's practice contains |
| `dailyPractice.score` | Data for View results |
