# Fitness App

A React Native mobile application for tracking workouts and managing stretching routines. Built with Expo and TypeScript.

## Features

### Workout Logger
- Log your exercises with details including:
  - Exercise name
  - Number of sets
  - Repetitions per set
  - Weight used
- View and manage your workout history
- Edit or delete previous workout entries
- Data persistence using AsyncStorage

### Stretch Timer
- Customizable stretch duration (30s, 1m, 2m, 5m)
- Visual countdown timer
- Vibration alerts when stretch is complete
- Track stretch history
- Clear stretch history functionality

### Workout Templates
- Pre-defined workout routines:
  - Full Body Workout
  - Upper Body Focus
  - Lower Body Focus
  - Core Focus
- Quick-add templates to your workout log
- Detailed exercise breakdowns with sets and reps

## Tech Stack

- React Native
- Expo
- TypeScript
- AsyncStorage for data persistence
- React Navigation for routing
- Ionicons for UI icons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd fitness-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
fitness-app/
├── app/
│   ├── components/
│   │   ├── StretchTimer.tsx
│   │   ├── WorkoutLogger.tsx
│   │   └── WorkoutTemplates.tsx
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── stretch-timer.tsx
│   └── templates.tsx
├── assets/
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Expo
- Icons provided by Ionicons
- Navigation powered by React Navigation
