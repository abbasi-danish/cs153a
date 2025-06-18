import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
  }[];
  icon: string;
}

const TEMPLATES: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Full Body',
    description: 'Complete body workout targeting all major muscle groups',
    icon: 'body-outline',
    exercises: [
      { name: 'Push-ups', sets: '3', reps: '12' },
      { name: 'Squats', sets: '3', reps: '15' },
      { name: 'Plank', sets: '3', reps: '30s' },
      { name: 'Lunges', sets: '3', reps: '10' },
      { name: 'Mountain Climbers', sets: '3', reps: '20' },
    ],
  },
  {
    id: '2',
    name: 'Upper Body',
    description: 'Focus on chest, back, shoulders, and arms',
    icon: 'barbell-outline',
    exercises: [
      { name: 'Bench Press', sets: '4', reps: '10' },
      { name: 'Pull-ups', sets: '3', reps: '8' },
      { name: 'Shoulder Press', sets: '3', reps: '12' },
      { name: 'Bicep Curls', sets: '3', reps: '12' },
      { name: 'Tricep Dips', sets: '3', reps: '15' },
    ],
  },
  {
    id: '3',
    name: 'Lower Body',
    description: 'Target legs, glutes, and core',
    icon: 'walk-outline',
    exercises: [
      { name: 'Squats', sets: '4', reps: '12' },
      { name: 'Deadlifts', sets: '4', reps: '10' },
      { name: 'Lunges', sets: '3', reps: '12' },
      { name: 'Calf Raises', sets: '3', reps: '15' },
      { name: 'Glute Bridges', sets: '3', reps: '15' },
    ],
  },
  {
    id: '4',
    name: 'Core Focus',
    description: 'Strengthen your core and abs',
    icon: 'fitness-outline',
    exercises: [
      { name: 'Crunches', sets: '3', reps: '20' },
      { name: 'Plank', sets: '3', reps: '45s' },
      { name: 'Russian Twists', sets: '3', reps: '20' },
      { name: 'Leg Raises', sets: '3', reps: '15' },
      { name: 'Mountain Climbers', sets: '3', reps: '30' },
    ],
  },
];

export function WorkoutTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
  };

  const handleAddToLog = async (template: WorkoutTemplate) => {
    try {
      // Get existing workout log
      const existingLog = await AsyncStorage.getItem('workoutLog');
      const currentLog = existingLog ? JSON.parse(existingLog) : [];

      // Add all exercises from the template
      const newExercises = template.exercises.map(exercise => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        exercise: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
      }));

      const updatedLog = [...currentLog, ...newExercises];
      await AsyncStorage.setItem('workoutLog', JSON.stringify(updatedLog));

      Alert.alert(
        'Success!',
        `${template.name} workout has been added to your log.`,
        [
          {
            text: 'OK',
            onPress: () => setSelectedTemplate(null),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding template to log:', error);
      Alert.alert('Error', 'Failed to add workout to log. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout Templates</Text>
          <Text style={styles.subtitle}>Quick-start your workout with these pre-defined routines</Text>
        </View>

        <View style={styles.templatesContainer}>
          {TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate?.id === template.id && styles.selectedTemplate,
              ]}
              onPress={() => handleTemplateSelect(template)}
            >
              <View style={styles.templateHeader}>
                <Ionicons
                  name={template.icon as any}
                  size={24}
                  color={selectedTemplate?.id === template.id ? '#fff' : '#6200ee'}
                />
                <Text
                  style={[
                    styles.templateName,
                    selectedTemplate?.id === template.id && styles.selectedText,
                  ]}
                >
                  {template.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.templateDescription,
                  selectedTemplate?.id === template.id && styles.selectedText,
                ]}
              >
                {template.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTemplate && (
          <View style={styles.exercisesContainer}>
            <Text style={styles.exercisesTitle}>Exercises in this template:</Text>
            {selectedTemplate.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} sets × {exercise.reps}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToLog(selectedTemplate)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add to Workout Log</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingBottom: Platform.OS === 'ios' ? 88 : 68,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    lineHeight: 22,
  },
  templatesContainer: {
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTemplate: {
    backgroundColor: '#6200ee',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 12,
  },
  templateDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  selectedText: {
    color: '#fff',
  },
  exercisesContainer: {
    padding: 24,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseName: {
    fontSize: 16,
    color: '#424242',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#757575',
  },
  addButton: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 