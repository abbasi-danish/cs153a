import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface WorkoutEntry {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
}

interface StretchEntry {
  id: string;
  duration: number;
  date: string;
}

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalStretches: 0,
    totalWorkoutTime: 0,
    totalStretchTime: 0,
    recentWorkouts: [] as WorkoutEntry[],
    recentStretches: [] as StretchEntry[],
  });

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Load workout data
      const workoutLog = await AsyncStorage.getItem('workoutLog');
      const workouts: WorkoutEntry[] = workoutLog ? JSON.parse(workoutLog) : [];
      
      // Load stretch data
      const stretchHistory = await AsyncStorage.getItem('stretchHistory');
      const stretches: StretchEntry[] = stretchHistory ? JSON.parse(stretchHistory) : [];
      
      // Calculate stats
      const totalWorkoutTime = workouts.length * 45; // Estimate 45 minutes per workout
      const totalStretchTime = stretches.reduce((total, stretch) => total + stretch.duration, 0);
      
      setStats({
        totalWorkouts: workouts.length,
        totalStretches: stretches.length,
        totalWorkoutTime,
        totalStretchTime,
        recentWorkouts: workouts.slice(-3).reverse(),
        recentStretches: stretches.slice(-3).reverse(),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserStats();
    setRefreshing(false);
  };

  // Use focus effect to refresh data whenever user returns to this screen
  useFocusEffect(
    React.useCallback(() => {
      loadUserStats();
    }, [])
  );

  // Initial load
  useEffect(() => {
    loadUserStats();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatStretchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleLogWorkout = () => {
    navigation.navigate('workout-logger' as never);
  };

  const handleStartStretch = () => {
    navigation.navigate('stretch-timer' as never);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}>
        <LinearGradient
          colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#fff' }]}>Loading your fitness journey...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}>
      <LinearGradient
        colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#fff' : '#fff'}
              colors={[isDark ? '#fff' : '#fff']}
              progressBackgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)'}
            />
          }
        >
          <View style={styles.content}>
            {/* App Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="fitness" size={40} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={[styles.appName, { color: isDark ? '#fff' : '#fff' }]}>Work-Now</Text>
              <Text style={[styles.tagline, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>
                Your Personal Fitness Companion
              </Text>
            </View>

            {/* Welcome Message */}
            <View style={[styles.welcomeCard, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}>
              <Text style={[styles.welcomeTitle, { color: isDark ? '#fff' : '#222' }]}>
                Welcome back! 🎉
              </Text>
              <Text style={[styles.welcomeText, { color: isDark ? 'rgba(255,255,255,0.8)' : '#666' }]}>
                Ready to crush your fitness goals today? Let's get moving!
              </Text>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#fff' }]}>Your Fitness Journey</Text>
              
              <View style={styles.statsGrid}>
                {/* Workout Stats */}
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                  <LinearGradient
                    colors={['#4ECDC4', '#6EE7DF']}
                    style={styles.statIconContainer}
                  >
                    <Ionicons name="fitness-outline" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#222' }]}>{stats.totalWorkouts}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Workouts</Text>
                  <Text style={[styles.statSubtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#999' }]}>
                    {formatTime(stats.totalWorkoutTime)} total
                  </Text>
                </View>

                {/* Stretch Stats */}
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                  <LinearGradient
                    colors={['#FFB347', '#FFC675']}
                    style={styles.statIconContainer}
                  >
                    <Ionicons name="timer-outline" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#222' }]}>{stats.totalStretches}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Stretches</Text>
                  <Text style={[styles.statSubtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#999' }]}>
                    {formatStretchTime(stats.totalStretchTime)} total
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#fff' }]}>Recent Activity</Text>
              
              {/* Recent Workouts */}
              {stats.recentWorkouts.length > 0 && (
                <View style={[styles.activityCard, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                  <View style={styles.activityHeader}>
                    <Ionicons name="fitness-outline" size={20} color={isDark ? '#4ECDC4' : '#4ECDC4'} />
                    <Text style={[styles.activityTitle, { color: isDark ? '#fff' : '#222' }]}>Recent Workouts</Text>
                  </View>
                  {stats.recentWorkouts.map((workout, index) => (
                    <View key={workout.id} style={styles.activityItem}>
                      <Text style={[styles.activityText, { color: isDark ? 'rgba(255,255,255,0.9)' : '#333' }]}>
                        {workout.exercise}
                      </Text>
                      <Text style={[styles.activitySubtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                        {workout.sets} sets × {workout.reps} reps
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Recent Stretches */}
              {stats.recentStretches.length > 0 && (
                <View style={[styles.activityCard, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                  <View style={styles.activityHeader}>
                    <Ionicons name="timer-outline" size={20} color={isDark ? '#FFB347' : '#FFB347'} />
                    <Text style={[styles.activityTitle, { color: isDark ? '#fff' : '#222' }]}>Recent Stretches</Text>
                  </View>
                  {stats.recentStretches.map((stretch, index) => (
                    <View key={stretch.id} style={styles.activityItem}>
                      <Text style={[styles.activityText, { color: isDark ? 'rgba(255,255,255,0.9)' : '#333' }]}>
                        Stretch Session
                      </Text>
                      <Text style={[styles.activitySubtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                        {formatStretchTime(stretch.duration)} • {new Date(stretch.date).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Empty State */}
              {stats.recentWorkouts.length === 0 && stats.recentStretches.length === 0 && (
                <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                  <Ionicons name="fitness-outline" size={48} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)'} />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#222' }]}>No activity yet</Text>
                  <Text style={[styles.emptyText, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>
                    Start your fitness journey by logging your first workout or stretch!
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#fff' }]}>Quick Actions</Text>
              
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleLogWorkout}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="add-outline" size={24} color="#fff" />
                    <Text style={styles.actionText}>Log Workout</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleStartStretch}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#6EE7DF']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="timer-outline" size={24} color="#fff" />
                    <Text style={styles.actionText}>Start Stretch</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  activitySection: {
    marginBottom: 32,
  },
  activityCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  activityText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  activitySubtext: {
    fontSize: 14,
    fontWeight: '400',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
