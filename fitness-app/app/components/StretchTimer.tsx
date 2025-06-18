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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StretchEntry {
  id: string;
  duration: number;
  date: string;
}

export function StretchTimer() {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [stretchHistory, setStretchHistory] = useState<StretchEntry[]>([]);
  const [actualDuration, setActualDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadStretchHistory();
  }, []);

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

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
        setActualDuration((prev) => prev + 1);
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
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stretch Timer</Text>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        <View style={styles.durationSelector}>
          <TouchableOpacity
            style={[styles.durationButton, selectedDuration === 30 && styles.selectedDuration]}
            onPress={() => setSelectedDuration(30)}
          >
            <Text style={[styles.durationText, selectedDuration === 30 && styles.selectedDurationText]}>
              30s
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.durationButton, selectedDuration === 60 && styles.selectedDuration]}
            onPress={() => setSelectedDuration(60)}
          >
            <Text style={[styles.durationText, selectedDuration === 60 && styles.selectedDurationText]}>
              60s
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {!isActive ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Clear History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Stretches</Text>
          {stretchHistory.slice(-5).map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyText}>
                {new Date(item.date).toLocaleDateString()} - {item.duration}s
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingBottom: Platform.OS === 'ios' ? 88 : 68,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#6200ee',
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDuration: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  durationText: {
    fontSize: 16,
    color: '#212121',
  },
  selectedDurationText: {
    color: '#fff',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b00020',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyContainer: {
    marginTop: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyText: {
    fontSize: 14,
    color: '#424242',
  },
}); 