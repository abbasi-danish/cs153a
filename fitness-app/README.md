# Work-Now 🏋️‍♂️

A modern, comprehensive fitness tracking mobile application built with React Native and Expo. Work-Now helps you track workouts, manage stretching routines, monitor progress, and achieve your fitness goals with a beautiful, intuitive interface.

## ✨ Features

### 🏠 Home Screen
- **Real-time stats dashboard** showing your fitness journey progress
- **Live workout and stretch statistics** that update instantly
- **Recent activity feed** displaying your latest workouts and stretches
- **Quick action buttons** for immediate access to logging workouts or starting stretches
- **Pull-to-refresh** functionality for manual data updates
- **Beautiful gradient design** with dark/light mode support

### 💪 Workout Logger
- **Comprehensive exercise tracking** with exercise name, sets, and reps
- **Real-time data persistence** using AsyncStorage
- **Edit and delete functionality** for managing workout history
- **Modern card-based UI** with gradient backgrounds
- **Instant home screen updates** when data changes

### ⏱️ Stretch Timer
- **Customizable stretch durations** (30s, 1m, 2m, 5m)
- **Visual circular countdown timer** with smooth animations
- **Vibration alerts** when stretch sessions complete
- **Stretch history tracking** with timestamps
- **Clear history functionality** with confirmation dialogs
- **Real-time progress updates** on home screen

### 📚 Workout Templates
- **Dynamic workout generation** using ExerciseDB API
- **8 workout categories**: Chest, Back, Arms, Legs, Shoulders, Core, Cardio, Full Body
- **Smart exercise filtering** based on muscle groups
- **Real exercise data** with body part and target muscle information
- **Automatic duration calculation** based on exercise count
- **Local template storage** for offline access
- **Use and delete templates** functionality

### 📸 Progress Photos
- **Take photos** directly within the app
- **Import from gallery** for existing photos
- **Local photo storage** with AsyncStorage
- **Photo gallery view** with delete functionality
- **Dark mode support** for photo viewing
- **Progress tracking** with photo count statistics

### ⚙️ Settings & Data Export
- **Dark/Light mode toggle** with system-wide theme support
- **Comprehensive data export** functionality
- **Share fitness reports** via native sharing or clipboard
- **Detailed workout summaries** including:
  - Total workouts and stretches completed
  - Exercise statistics and progress
  - Recent activity history
  - Workout template information
  - Motivational messages

### 🔄 Real-Time Updates
- **Automatic data synchronization** across all screens
- **Focus-based updates** when returning to home screen
- **Instant stat calculations** for workouts and stretches
- **Live activity feeds** showing recent progress
- **Seamless navigation** between features

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation and routing
- **AsyncStorage** - Local data persistence
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Expo Image Picker** - Camera and gallery integration
- **Expo Sharing** - Native file sharing
- **Expo File System** - File operations
- **Expo Clipboard** - Clipboard functionality
- **Ionicons** - Comprehensive icon library
- **ExerciseDB API** - Free fitness exercise database

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Physical device with Expo Go app (optional)

### Installation

1. **Clone the repository:**
```bash
git clone [repository-url]
cd fitness-app
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Start the development server:**
```bash
npx expo start
```

4. **Run on your preferred platform:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## 📱 App Structure

### Navigation Tabs
1. **🏠 Home** - Dashboard with stats and quick actions
2. **💪 Workout Logger** - Log and manage exercises
3. **⏱️ Stretch Timer** - Timer and stretch tracking
4. **📚 Templates** - Generated workout templates
5. **📸 Progress Photos** - Photo tracking and gallery
6. **⚙️ Settings** - App settings and data export

### Project Structure
```
fitness-app/
├── app/
│   ├── _layout.tsx              # Tab navigation configuration
│   ├── index.tsx                # Home screen with real-time stats
│   ├── workout-logger.tsx       # Workout logging screen
│   ├── stretch-timer.tsx        # Stretch timer screen
│   ├── templates.tsx            # Workout templates screen
│   ├── progress-photos.tsx      # Progress photos screen
│   └── settings.tsx             # Settings and export screen
├── components/
│   ├── WorkoutLogger.tsx        # Workout logging component
│   ├── StretchTimer.tsx         # Stretch timer component
│   ├── WorkoutTemplates.tsx     # Templates with API integration
│   ├── ProgressPhotos.tsx       # Photo management component
│   └── ThemeContext.tsx         # Dark/light mode context
├── assets/                      # Images and fonts
└── package.json
```

## 🎨 Design Features

### Modern UI/UX
- **Gradient backgrounds** throughout the app
- **Card-based layouts** with shadows and rounded corners
- **Smooth animations** and transitions
- **Responsive design** for all screen sizes
- **Intuitive navigation** with clear visual hierarchy

### Dark/Light Mode
- **System-wide theme support** across all screens
- **Automatic theme switching** based on system preferences
- **Consistent color schemes** in both modes
- **Optimized readability** in all lighting conditions

### Accessibility
- **Touch-friendly buttons** with proper hit areas
- **Clear visual feedback** for all interactions
- **Readable typography** with appropriate contrast
- **Intuitive gestures** like pull-to-refresh

## 📊 Data Management

### Local Storage
- **AsyncStorage** for all user data
- **Automatic data persistence** across app sessions
- **Efficient data loading** with error handling
- **Data backup** through export functionality

### API Integration
- **ExerciseDB API** for workout template generation
- **Free tier access** with generous rate limits
- **Fallback data** for offline functionality
- **Smart caching** for optimal performance

## 🔧 Development

### Key Features Implemented
- ✅ Real-time data synchronization
- ✅ API integration for workout templates
- ✅ Progress photo tracking
- ✅ Comprehensive data export
- ✅ Dark/light mode theming
- ✅ Pull-to-refresh functionality
- ✅ Modern UI with gradients
- ✅ Responsive design
- ✅ Error handling and fallbacks

### Performance Optimizations
- **Efficient data loading** with focus-based updates
- **Optimized re-renders** with proper state management
- **Memory management** with cleanup functions
- **Smooth animations** with native drivers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add proper error handling
- Test on both iOS and Android
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo** for the amazing development platform
- **ExerciseDB API** for providing free fitness data
- **Ionicons** for the comprehensive icon library
- **React Navigation** for seamless navigation
- **React Native community** for excellent documentation and support

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

---

**Work-Now** - Your Personal Fitness Companion 🏋️‍♂️💪
