import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from './ThemeContext';

interface StretchEntry {
  id: string;
  duration: number;
  date: string;
}

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width, height) * 0.3;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StretchTimer() {
  const { isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [stretchHistory, setStretchHistory] = useState<StretchEntry[]>([]);
  const [actualDuration, setActualDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStretchHistory();
  }, []);

  // Update timeLeft when selectedDuration changes
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(selectedDuration);
    }
  }, [selectedDuration, isActive]);

  const loadStretchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('stretchHistory');
      if (history) {
        setStretchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading stretch history:', error);
    }
  };

  const saveStretchHistory = async (newHistory: StretchEntry[]) => {
    try {
      await AsyncStorage.setItem('stretchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving stretch history:', error);
    }
  };

  const animateProgress = (progress: number) => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
        setActualDuration((prev) => prev + 1);
        
        // Update progress animation - only when timer is active
        const progress = ((selectedDuration - timeLeft + 1) / selectedDuration) * 100;
        animateProgress(progress);
      }, 1000);
    } else if (timeLeft === 0 || !isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (actualDuration > 0) {
        Vibration.vibrate([0, 500, 200, 500]);
        Alert.alert('Stretch Complete!', 'Great job! Take a short break before the next stretch.');
        
        const newHistory = [...stretchHistory, {
          id: Date.now().toString(),
          duration: actualDuration,
          date: new Date().toISOString(),
        }];
        setStretchHistory(newHistory);
        saveStretchHistory(newHistory);
        setActualDuration(0);
        // Reset progress to 0 when timer stops
        animateProgress(0);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(selectedDuration);
    setActualDuration(0);
    // Start with 0 progress
    animateProgress(0);
    animateButtonPress();
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration);
    // Reset progress to 0 when stopped
    animateProgress(0);
    animateButtonPress();
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all stretch history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('stretchHistory');
              setStretchHistory([]);
            } catch (error) {
              console.error('Error clearing stretch history:', error);
            }
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animate SVG progress
  const animatedStroke = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}>
      <LinearGradient
        colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Stretch Timer</Text>
            <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>Stay flexible and healthy</Text>
          </View>
          
          <View style={styles.timerContainer}>
            <View style={styles.circleContainer}>
              <View style={styles.circle}>
                {/* SVG Circular Progress */}
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
                  {/* Background track */}
                  <Circle
                    stroke={isDark ? '#33343a' : '#e6e6e6'}
                    fill="none"
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                  />
                  {/* Progress arc */}
                  <AnimatedCircle
                    stroke={isDark ? '#fff' : '#fff'}
                    fill="none"
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
                    strokeDashoffset={animatedStroke}
                    strokeLinecap="round"
                  />
                </Svg>
                
                {/* Timer text - positioned to avoid overlap */}
                <View style={styles.timerTextContainer}>
                  <Text style={[styles.timerText, { color: isDark ? '#fff' : '#fff' }]}>{formatTime(timeLeft)}</Text>
                  <Text style={[styles.timerLabel, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>
                    {isActive ? 'Stretching...' : 'Ready to start'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.durationSelector}>
            {[30, 60, 120, 300].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={styles.durationButton}
                onPress={() => setSelectedDuration(duration)}
              >
                <LinearGradient
                  colors={selectedDuration === duration 
                    ? ['#FF6B6B', '#FF8E8E'] 
                    : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
                  }
                  style={styles.durationGradient}
                >
                  <Text style={[
                    styles.durationText,
                    selectedDuration === duration && styles.selectedDurationText,
                  ]}>
                    {duration < 60 ? `${duration}s` : `${duration / 60}m`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
                {!isActive ? (
                  <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                    <LinearGradient
                      colors={['#4ECDC4', '#6EE7DF']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="play" size={24} color="#fff" />
                      <Text style={styles.buttonText}>Start</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8E8E']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="stop" size={24} color="#fff" />
                      <Text style={styles.buttonText}>Stop</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </Animated.View>
              
              <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.clearButtonGradient}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.clearButtonText}>Clear History</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Stretches</Text>
            {stretchHistory.slice(-5).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.historyGradient}
                >
                  <View style={styles.historyContent}>
                    <Ionicons name="time-outline" size={20} color="#fff" />
                    <Text style={styles.historyText}>
                      {new Date(item.date).toLocaleDateString()} - {item.duration}s
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
            {stretchHistory.length === 0 && (
              <View style={styles.emptyHistory}>
                <Ionicons name="timer-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.emptyHistoryText}>No stretch history yet</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// AnimatedCircle helper
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20, // Reduced padding for mobile
  },
  header: {
    alignItems: 'center',
    marginBottom: 30, // Reduced for mobile
    marginTop: 10, // Reduced for mobile
  },
  title: {
    fontSize: 32, // Smaller for mobile
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6, // Reduced for mobile
  },
  subtitle: {
    fontSize: 14, // Smaller for mobile
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30, // Reduced for mobile
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: CIRCLE_SIZE * 0.7, // Increased text area
    height: CIRCLE_SIZE * 0.7,
    paddingHorizontal: 10, // Add padding to prevent text cutoff
  },
  timerText: {
    fontSize: Math.min(CIRCLE_SIZE * 0.15, 32), // Dynamic font size based on circle size
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: Math.min(CIRCLE_SIZE * 0.18, 36), // Dynamic line height
    includeFontPadding: false, // Remove extra font padding on Android
  },
  timerLabel: {
    fontSize: Math.min(CIRCLE_SIZE * 0.05, 10), // Dynamic font size
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
    includeFontPadding: false, // Remove extra font padding on Android
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40, // Reduced for mobile
    flexWrap: 'wrap',
    paddingHorizontal: 10, // Reduced for mobile
  },
  durationButton: {
    marginHorizontal: 8, // Reduced for mobile
    marginVertical: 6, // Reduced for mobile
    borderRadius: 18, // Smaller for mobile
    overflow: 'hidden',
  },
  durationGradient: {
    paddingHorizontal: 20, // Reduced for mobile
    paddingVertical: 12, // Reduced for mobile
    borderRadius: 18, // Smaller for mobile
  },
  durationText: {
    fontSize: 14, // Smaller for mobile
    color: '#fff',
    fontWeight: '600',
  },
  selectedDurationText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40, // Reduced for mobile
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20, // Reduced for mobile
  },
  startButton: {
    borderRadius: 22, // Smaller for mobile
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    borderRadius: 22, // Smaller for mobile
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28, // Reduced for mobile
    paddingVertical: 16, // Reduced for mobile
  },
  buttonText: {
    color: '#fff',
    fontSize: 16, // Smaller for mobile
    fontWeight: '600',
    marginLeft: 6, // Reduced for mobile
  },
  clearButton: {
    borderRadius: 18, // Smaller for mobile
    overflow: 'hidden',
  },
  clearButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, // Reduced for mobile
    paddingVertical: 14, // Reduced for mobile
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 13, // Smaller for mobile
    fontWeight: '500',
    marginLeft: 6, // Reduced for mobile
  },
  historyContainer: {
    flex: 1,
    marginTop: 15, // Reduced for mobile
  },
  historyTitle: {
    fontSize: 18, // Smaller for mobile
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15, // Reduced for mobile
  },
  historyItem: {
    marginBottom: 12, // Reduced for mobile
    borderRadius: 10, // Smaller for mobile
    overflow: 'hidden',
  },
  historyGradient: {
    padding: 16, // Reduced for mobile
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    fontSize: 13, // Smaller for mobile
    color: '#fff',
    marginLeft: 12, // Reduced for mobile
    fontWeight: '500',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30, // Reduced for mobile
  },
  emptyHistoryText: {
    fontSize: 14, // Smaller for mobile
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12, // Reduced for mobile
    fontWeight: '500',
  },
}); 