import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  category: string;
  estimatedDuration: number;
}

const { width } = Dimensions.get('window');

const defaultTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Full Body Strength',
    category: 'Strength',
    estimatedDuration: 60,
    exercises: [
      { name: 'Squats', sets: 3, reps: 12 },
      { name: 'Push-ups', sets: 3, reps: 10 },
      { name: 'Dumbbell Rows', sets: 3, reps: 12 },
      { name: 'Plank', sets: 3, reps: 30 },
    ],
  },
  {
    id: '2',
    name: 'Upper Body Focus',
    category: 'Strength',
    estimatedDuration: 45,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Pull-ups', sets: 3, reps: 8 },
      { name: 'Overhead Press', sets: 3, reps: 10 },
      { name: 'Bicep Curls', sets: 3, reps: 12 },
      { name: 'Tricep Dips', sets: 3, reps: 12 },
    ],
  },
  {
    id: '3',
    name: 'Core & Abs',
    category: 'Core',
    estimatedDuration: 30,
    exercises: [
      { name: 'Crunches', sets: 3, reps: 20 },
      { name: 'Plank', sets: 3, reps: 45 },
      { name: 'Russian Twists', sets: 3, reps: 20 },
      { name: 'Leg Raises', sets: 3, reps: 15 },
    ],
  },
  {
    id: '4',
    name: 'Cardio HIIT',
    category: 'Cardio',
    estimatedDuration: 25,
    exercises: [
      { name: 'Burpees', sets: 4, reps: 10 },
      { name: 'Mountain Climbers', sets: 4, reps: 30 },
      { name: 'Jump Squats', sets: 3, reps: 15 },
      { name: 'High Knees', sets: 3, reps: 30 },
    ],
  },
  {
    id: '5',
    name: 'Lower Body Power',
    category: 'Strength',
    estimatedDuration: 50,
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: 8 },
      { name: 'Lunges', sets: 3, reps: 12 },
      { name: 'Calf Raises', sets: 4, reps: 20 },
      { name: 'Glute Bridges', sets: 3, reps: 15 },
    ],
  },
];

export function WorkoutTemplates() {
  const { isDark } = useTheme();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const savedTemplates = await AsyncStorage.getItem('workoutTemplates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      } else {
        setTemplates(defaultTemplates);
        await AsyncStorage.setItem('workoutTemplates', JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(defaultTemplates);
    }
  };

  const saveTemplates = async (newTemplates: WorkoutTemplate[]) => {
    try {
      await AsyncStorage.setItem('workoutTemplates', JSON.stringify(newTemplates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const handleUseTemplate = (template: WorkoutTemplate) => {
    Alert.alert(
      'Use Template',
      `Start "${template.name}" workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => console.log('Starting workout:', template.name) },
      ]
    );
  };

  const handleDeleteTemplate = (templateId: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(newTemplates);
            saveTemplates(newTemplates);
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Strength': ['#FF6B6B', '#FF8E8E'] as const,
      'Cardio': ['#4ECDC4', '#6EE7DF'] as const,
      'Core': ['#45B7D1', '#67C9E1'] as const,
      'Flexibility': ['#96CEB4', '#B8E0C8'] as const,
    };
    return colors[category as keyof typeof colors] || ['#667eea', '#764ba2'] as const;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Strength': 'fitness-outline' as const,
      'Cardio': 'heart-outline' as const,
      'Core': 'body-outline' as const,
      'Flexibility': 'body-outline' as const,
    };
    return icons[category as keyof typeof icons] || 'fitness-outline';
  };

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}>
      <LinearGradient
        colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Workout Templates</Text>
            <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>Choose your perfect workout</Text>
          </View>

          <View style={styles.categoryContainer}>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryButton}
                  onPress={() => setSelectedCategory(item)}
                >
                  <LinearGradient
                    colors={selectedCategory === item 
                      ? ['#FF6B6B', '#FF8E8E'] 
                      : isDark ? ['#232526', '#18181b'] : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
                    }
                    style={styles.categoryGradient}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === item && styles.selectedCategoryText,
                      { color: isDark ? '#fff' : '#fff' },
                    ]}>
                      {item}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
          </View>

          <FlatList
            data={filteredTemplates}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.templateList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const colors = getCategoryColor(item.category);
              return (
                <View style={styles.templateCard}>
                  <LinearGradient
                    colors={isDark ? ['#232526', '#18181b'] : colors}
                    style={styles.templateGradient}
                  >
                    <View style={styles.templateHeader}>
                      <View style={styles.templateInfo}>
                        <Text style={[styles.templateName, { color: '#fff' }]}>{item.name}</Text>
                        <View style={styles.templateMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons 
                              name={getCategoryIcon(item.category)} 
                              size={16} 
                              color="#fff" 
                            />
                            <Text style={[styles.metaText, { color: isDark ? '#fff' : '#fff' }]}>{item.category}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color="#fff" />
                            <Text style={[styles.metaText, { color: isDark ? '#fff' : '#fff' }]}>{item.estimatedDuration}m</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.templateActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleUseTemplate(item)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="play-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDeleteTemplate(item.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.exercisesContainer}>
                      <Text style={[styles.exercisesTitle, { color: isDark ? '#fff' : '#fff' }]}>Exercises:</Text>
                      {item.exercises.slice(0, 3).map((exercise, index) => (
                        <View key={index} style={styles.exerciseItem}>
                          <Text style={[styles.exerciseName, { color: isDark ? '#fff' : '#fff' }]}>• {exercise.name}</Text>
                          <Text style={[styles.exerciseDetails, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>
                            {exercise.sets} sets × {exercise.reps} reps
                          </Text>
                        </View>
                      ))}
                      {item.exercises.length > 3 && (
                        <Text style={[styles.moreExercises, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)' }] }>
                          +{item.exercises.length - 3} more exercises
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="fitness-outline" size={64} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255, 255, 255, 0.6)'} />
                <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#fff' }]}>No templates found</Text>
                <Text style={[styles.emptyText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }] }>
                  No templates match the selected category
                </Text>
              </View>
            }
          />
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryList: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  selectedCategoryText: {
    fontWeight: '700',
  },
  templateList: {
    paddingBottom: 40,
  },
  templateCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  templateGradient: {
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  exercisesContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  moreExercises: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 