import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';

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

interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  estimatedDuration: number;
  exercises: any[];
}

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);

  const generateWorkoutReport = async () => {
    setExporting(true);
    try {
      // Fetch all data from AsyncStorage
      const workoutLog = await AsyncStorage.getItem('workoutLog');
      const stretchHistory = await AsyncStorage.getItem('stretchHistory');
      const workoutTemplates = await AsyncStorage.getItem('workoutTemplates');
      const progressPhotos = await AsyncStorage.getItem('progressPhotos');

      const workouts: WorkoutEntry[] = workoutLog ? JSON.parse(workoutLog) : [];
      const stretches: StretchEntry[] = stretchHistory ? JSON.parse(stretchHistory) : [];
      const templates: WorkoutTemplate[] = workoutTemplates ? JSON.parse(workoutTemplates) : [];
      const photos: string[] = progressPhotos ? JSON.parse(progressPhotos) : [];

      // Generate comprehensive report
      const report = generateComprehensiveReport(workouts, stretches, templates, photos);
      
      // Share the report
      await shareReport(report);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const generateComprehensiveReport = (workouts: WorkoutEntry[], stretches: StretchEntry[], templates: WorkoutTemplate[], photos: string[]) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let report = `🏋️ FITNESS JOURNEY REPORT\n`;
    report += `Generated on: ${dateStr}\n`;
    report += `📊 SUMMARY\n`;
    report += `• Total Workouts: ${workouts.length}\n`;
    report += `• Total Stretches: ${stretches.length}\n`;
    report += `• Workout Templates: ${templates.length}\n`;
    report += `• Progress Photos: ${photos.length}\n\n`;

    // Workout History
    if (workouts.length > 0) {
      report += `💪 WORKOUT HISTORY\n`;
      report += `Total exercises logged: ${workouts.length}\n\n`;
      
      // Group by exercise type
      const exerciseStats: { [key: string]: { count: number, totalSets: number, totalReps: number } } = {};
      workouts.forEach(workout => {
        if (!exerciseStats[workout.exercise]) {
          exerciseStats[workout.exercise] = { count: 0, totalSets: 0, totalReps: 0 };
        }
        exerciseStats[workout.exercise].count++;
        exerciseStats[workout.exercise].totalSets += parseInt(workout.sets) || 0;
        exerciseStats[workout.exercise].totalReps += parseInt(workout.reps) || 0;
      });

      Object.entries(exerciseStats).forEach(([exercise, stats]) => {
        report += `• ${exercise}\n`;
        report += `  - Sessions: ${stats.count}\n`;
        report += `  - Total Sets: ${stats.totalSets}\n`;
        report += `  - Total Reps: ${stats.totalReps}\n\n`;
      });

      // Recent workouts
      const recentWorkouts = workouts.slice(-10).reverse();
      report += `📝 RECENT WORKOUTS (Last 10)\n`;
      recentWorkouts.forEach((workout, index) => {
        report += `${index + 1}. ${workout.exercise} - ${workout.sets} sets × ${workout.reps} reps\n`;
      });
      report += `\n`;
    }

    // Stretch History
    if (stretches.length > 0) {
      report += `🧘 STRETCH HISTORY\n`;
      report += `Total stretches completed: ${stretches.length}\n`;
      
      const totalStretchTime = stretches.reduce((total, stretch) => total + stretch.duration, 0);
      const avgStretchTime = Math.round(totalStretchTime / stretches.length);
      
      report += `• Total stretch time: ${Math.round(totalStretchTime / 60)} minutes\n`;
      report += `• Average stretch duration: ${avgStretchTime} seconds\n\n`;

      // Recent stretches
      const recentStretches = stretches.slice(-5).reverse();
      report += `📝 RECENT STRETCHES (Last 5)\n`;
      recentStretches.forEach((stretch, index) => {
        const date = new Date(stretch.date).toLocaleDateString();
        report += `${index + 1}. ${date} - ${stretch.duration} seconds\n`;
      });
      report += `\n`;
    }

    // Workout Templates
    if (templates.length > 0) {
      report += `📋 WORKOUT TEMPLATES\n`;
      report += `Total templates created: ${templates.length}\n\n`;
      
      templates.forEach((template, index) => {
        report += `${index + 1}. ${template.name}\n`;
        report += `   Category: ${template.category}\n`;
        report += `   Duration: ${template.estimatedDuration} minutes\n`;
        report += `   Exercises: ${template.exercises.length}\n`;
        if (template.exercises.length > 0) {
          report += `   - ${template.exercises.slice(0, 3).map(e => e.name).join(', ')}`;
          if (template.exercises.length > 3) {
            report += ` +${template.exercises.length - 3} more`;
          }
        }
        report += `\n\n`;
      });
    }

    // Progress Photos
    if (photos.length > 0) {
      report += `📸 PROGRESS PHOTOS\n`;
      report += `Total photos taken: ${photos.length}\n`;
      report += `(Photos are stored locally and cannot be exported in this report)\n\n`;
    }

    // Motivational message
    report += `🎯 KEEP UP THE GREAT WORK!\n`;
    report += `Your fitness journey is unique and inspiring. Continue pushing your limits and achieving your goals!\n\n`;
    report += `Generated by Fitness App`;

    return report;
  };

  const shareReport = async (report: string) => {
    try {
      // Create a temporary file
      const fileName = `fitness-report-${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write the report to the file
      await FileSystem.writeAsStringAsync(fileUri, report, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Your Fitness Journey',
          UTI: 'public.plain-text'
        });
      } else {
        // Fallback: Show the report in an alert with copy option
        Alert.alert(
          'Fitness Report Generated!', 
          'Your fitness journey report has been generated successfully. You can copy the text and share it manually.',
          [
            { 
              text: 'Copy to Clipboard', 
              onPress: async () => {
                try {
                  await Clipboard.setStringAsync(report);
                  Alert.alert('Success!', 'Your fitness report has been copied to clipboard. You can now paste it anywhere to share with friends!');
                } catch (error) {
                  Alert.alert('Copy Failed', 'There was an error copying the report. Please try again.');
                }
              }
            },
            { 
              text: 'View Report', 
              onPress: () => {
                Alert.alert(
                  'Your Fitness Journey Report',
                  report.substring(0, 1000) + (report.length > 1000 ? '\n\n... (Report truncated for display)' : ''),
                  [
                    { text: 'Copy Full Report', onPress: async () => {
                      try {
                        await Clipboard.setStringAsync(report);
                        Alert.alert('Success', 'Full report copied to clipboard!');
                      } catch (error) {
                        Alert.alert('Copy Failed', 'There was an error copying the report.');
                      }
                    }},
                    { text: 'OK' }
                  ]
                );
              }
            },
            { text: 'Cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Sharing Failed', 'There was an error sharing your report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}> 
      <LinearGradient
        colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Settings</Text>
          
          {/* Dark Mode Setting */}
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}> 
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#222' }]}>Dark Mode</Text>
              <Switch value={isDark} onValueChange={toggleTheme} thumbColor={isDark ? '#667eea' : '#fff'} trackColor={{ false: '#ccc', true: '#667eea' }} />
            </View>
            <Text style={[styles.desc, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Toggle between light and dark mode for the app interface.</Text>
          </View>

          {/* Export Data Feature */}
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}> 
            <View style={styles.exportHeader}>
              <Ionicons name="share-outline" size={24} color={isDark ? '#667eea' : '#667eea'} />
              <Text style={[styles.label, { color: isDark ? '#fff' : '#222', marginLeft: 12 }]}>Export & Share Data</Text>
            </View>
            <Text style={[styles.desc, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>
              Export your complete fitness journey including workouts, stretches, templates, and progress summary to share with friends or keep as a record.
            </Text>
            
            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: isDark ? '#667eea' : '#667eea' }]}
              onPress={generateWorkoutReport}
              disabled={exporting}
              activeOpacity={0.8}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.exportButtonText}>Generate & Share Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 