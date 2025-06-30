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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  gifUrl: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  estimatedDuration: number;
  exercises: Exercise[];
}

const { width } = Dimensions.get('window');

// Predefined workout categories with their target muscle groups
const workoutCategories = {
  'Chest': ['chest'],
  'Back': ['back'],
  'Arms': ['biceps', 'triceps', 'forearms'],
  'Legs': ['upper legs', 'lower legs'],
  'Shoulders': ['shoulders'],
  'Core': ['waist'],
  'Cardio': ['cardio'],
  'Full Body': ['chest', 'back', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'shoulders', 'waist'],
};

export function WorkoutTemplates() {
  const { isDark } = useTheme();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadTemplates();
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Try a simpler approach first - use the API without headers
      const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=50');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      
      // Fallback: Use a simpler API or mock data
      const fallbackExercises = [
        { id: '1', name: 'Push-ups', bodyPart: 'chest', equipment: 'body weight', target: 'pectoralis major', gifUrl: '' },
        { id: '2', name: 'Pull-ups', bodyPart: 'back', equipment: 'body weight', target: 'lats', gifUrl: '' },
        { id: '3', name: 'Squats', bodyPart: 'upper legs', equipment: 'body weight', target: 'gluteus maximus', gifUrl: '' },
        { id: '4', name: 'Lunges', bodyPart: 'upper legs', equipment: 'body weight', target: 'gluteus maximus', gifUrl: '' },
        { id: '5', name: 'Plank', bodyPart: 'waist', equipment: 'body weight', target: 'abs', gifUrl: '' },
        { id: '6', name: 'Burpees', bodyPart: 'cardio', equipment: 'body weight', target: 'cardiovascular system', gifUrl: '' },
        { id: '7', name: 'Mountain Climbers', bodyPart: 'cardio', equipment: 'body weight', target: 'cardiovascular system', gifUrl: '' },
        { id: '8', name: 'Jump Squats', bodyPart: 'upper legs', equipment: 'body weight', target: 'gluteus maximus', gifUrl: '' },
        { id: '9', name: 'Bicep Curls', bodyPart: 'upper arms', equipment: 'dumbbell', target: 'biceps brachii', gifUrl: '' },
        { id: '10', name: 'Tricep Dips', bodyPart: 'upper arms', equipment: 'body weight', target: 'triceps brachii', gifUrl: '' },
        { id: '11', name: 'Shoulder Press', bodyPart: 'shoulders', equipment: 'dumbbell', target: 'deltoids', gifUrl: '' },
        { id: '12', name: 'Deadlifts', bodyPart: 'back', equipment: 'barbell', target: 'erector spinae', gifUrl: '' },
        { id: '13', name: 'Bench Press', bodyPart: 'chest', equipment: 'barbell', target: 'pectoralis major', gifUrl: '' },
        { id: '14', name: 'Rows', bodyPart: 'back', equipment: 'barbell', target: 'lats', gifUrl: '' },
        { id: '15', name: 'Crunches', bodyPart: 'waist', equipment: 'body weight', target: 'abs', gifUrl: '' },
        { id: '16', name: 'Russian Twists', bodyPart: 'waist', equipment: 'body weight', target: 'abs', gifUrl: '' },
        { id: '17', name: 'Leg Raises', bodyPart: 'waist', equipment: 'body weight', target: 'abs', gifUrl: '' },
        { id: '18', name: 'Calf Raises', bodyPart: 'lower legs', equipment: 'body weight', target: 'gastrocnemius', gifUrl: '' },
        { id: '19', name: 'Lateral Raises', bodyPart: 'shoulders', equipment: 'dumbbell', target: 'deltoids', gifUrl: '' },
        { id: '20', name: 'Hammer Curls', bodyPart: 'upper arms', equipment: 'dumbbell', target: 'biceps brachii', gifUrl: '' },
      ];
      setExercises(fallbackExercises);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutTemplate = (category: string, exercises: Exercise[]): WorkoutTemplate => {
    const targetMuscles = workoutCategories[category as keyof typeof workoutCategories] || [];
    
    const categoryExercises = exercises.filter(exercise => 
      targetMuscles.some(muscle => 
        exercise.bodyPart.toLowerCase().includes(muscle.toLowerCase()) ||
        exercise.target.toLowerCase().includes(muscle.toLowerCase())
      )
    );

    // Take up to 6 exercises for the template
    const selectedExercises = categoryExercises.slice(0, 6);
    
    return {
      id: `${category}-${Date.now()}`,
      name: `${category} Workout`,
      category: category,
      estimatedDuration: Math.max(30, selectedExercises.length * 8), // 8 minutes per exercise, minimum 30
      exercises: selectedExercises,
    };
  };

  const loadTemplates = async () => {
    try {
      const saved = await AsyncStorage.getItem('workoutTemplates');
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplates = async (newTemplates: WorkoutTemplate[]) => {
    try {
      await AsyncStorage.setItem('workoutTemplates', JSON.stringify(newTemplates));
      setTemplates(newTemplates);
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
        { text: 'Start', onPress: () => {
          // Here you could navigate to the workout logger with the template exercises
          Alert.alert('Workout Started', 'Template loaded! You can now log your exercises.');
        }}
      ]
    );
  };

  const handleDeleteTemplate = (id: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          const newTemplates = templates.filter(t => t.id !== id);
          saveTemplates(newTemplates);
        }}
      ]
    );
  };

  const handleGenerateTemplate = async (category: string) => {
    if (exercises.length === 0) {
      Alert.alert('Error', 'No exercises available. Please try again later.');
      return;
    }

    const newTemplate = generateWorkoutTemplate(category, exercises);
    const newTemplates = [...templates, newTemplate];
    await saveTemplates(newTemplates);
    
    Alert.alert('Success', `Generated new ${category} workout template!`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Chest': ['#FF6B6B', '#FF8E8E'] as const,
      'Back': ['#4ECDC4', '#6EE7DF'] as const,
      'Arms': ['#45B7D1', '#67C9E1'] as const,
      'Legs': ['#96CEB4', '#B8E0C8'] as const,
      'Shoulders': ['#FFB347', '#FFC675'] as const,
      'Core': ['#DDA0DD', '#E6B3E6'] as const,
      'Cardio': ['#98D8C8', '#B8E8D8'] as const,
      'Full Body': ['#667eea', '#764ba2'] as const,
    };
    return colors[category as keyof typeof colors] || ['#667eea', '#764ba2'] as const;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Chest': 'body-outline' as const,
      'Back': 'body-outline' as const,
      'Arms': 'fitness-outline' as const,
      'Legs': 'fitness-outline' as const,
      'Shoulders': 'body-outline' as const,
      'Core': 'body-outline' as const,
      'Cardio': 'heart-outline' as const,
      'Full Body': 'fitness-outline' as const,
    };
    return icons[category as keyof typeof icons] || 'fitness-outline';
  };

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const categories = ['All', ...Object.keys(workoutCategories)];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}>
        <LinearGradient
          colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
          style={styles.gradientBackground}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Workout Templates</Text>
              <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>Loading exercises from API...</Text>
            </View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#fff' }]}>Fetching workout data...</Text>
            </View>
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Workout Templates</Text>
            <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }]}>Generate workouts from {exercises.length} exercises</Text>
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
                  onPress={() => {
                    if (item === 'All') {
                      setSelectedCategory(item);
                    } else {
                      handleGenerateTemplate(item);
                    }
                  }}
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
                      {item === 'All' ? item : `Generate ${item}`}
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
                            {exercise.bodyPart} • {exercise.target}
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
                <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#fff' }]}>No templates yet</Text>
                <Text style={[styles.emptyText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }] }>
                  Tap a category above to generate your first workout template!
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
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
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    marginLeft: 16,
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