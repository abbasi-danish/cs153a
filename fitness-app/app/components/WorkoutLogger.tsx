import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutEntry {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
}

const { width } = Dimensions.get('window');

export function WorkoutLogger() {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [log, setLog] = useState<WorkoutEntry[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  React.useEffect(() => {
    loadWorkoutLog();
  }, []);

  const loadWorkoutLog = async () => {
    try {
      const savedLog = await AsyncStorage.getItem('workoutLog');
      if (savedLog) {
        setLog(JSON.parse(savedLog));
      }
    } catch (error) {
      console.error('Error loading workout log:', error);
    }
  };

  const saveWorkoutLog = async (newLog: WorkoutEntry[]) => {
    try {
      await AsyncStorage.setItem('workoutLog', JSON.stringify(newLog));
    } catch (error) {
      console.error('Error saving workout log:', error);
    }
  };

  const handleSubmit = () => {
    if (!exercise.trim() || !sets.trim() || !reps.trim()) {
      return;
    }
    if (editId) {
      const updatedLog = log.map(item =>
        item.id === editId
          ? { ...item, exercise: exercise.trim(), sets: sets.trim(), reps: reps.trim() }
          : item
      );
      setLog(updatedLog);
      saveWorkoutLog(updatedLog);
      setEditId(null);
    } else {
      const newLog = [
        ...log,
        {
          id: Date.now().toString(),
          exercise: exercise.trim(),
          sets: sets.trim(),
          reps: reps.trim(),
        },
      ];
      setLog(newLog);
      saveWorkoutLog(newLog);
    }
    setExercise('');
    setSets('');
    setReps('');
  };

  const handleEdit = (item: WorkoutEntry) => {
    setExercise(item.exercise);
    setSets(item.sets);
    setReps(item.reps);
    setEditId(item.id);
  };

  const handleDelete = (id: string) => {
    const newLog = log.filter(item => item.id !== id);
    setLog(newLog);
    saveWorkoutLog(newLog);
  };

  const getExerciseColor = (exerciseName: string) => {
    const colors = [
      ['#FF6B6B', '#FF8E8E'], // Red
      ['#4ECDC4', '#6EE7DF'], // Teal
      ['#45B7D1', '#67C9E1'], // Blue
      ['#96CEB4', '#B8E0C8'], // Green
      ['#FFEAA7', '#FFF2C7'], // Yellow
      ['#DDA0DD', '#E8B5E8'], // Purple
    ] as const;
    const index = exerciseName.length % colors.length;
    return colors[index];
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.inner}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Workout Logger</Text>
              <Text style={styles.subtitle}>Track your fitness journey</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Exercise</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bench Press"
                  placeholderTextColor="#999"
                  value={exercise}
                  onChangeText={setExercise}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>  
                  <Text style={styles.label}>Sets</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    placeholderTextColor="#999"
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>  
                  <Text style={styles.label}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor="#999"
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={editId ? ['#FF6B6B', '#FF8E8E'] : ['#667eea', '#764ba2']}
                  style={styles.button}
                >
                  <Ionicons
                    name={editId ? 'create-outline' : 'add-outline'}
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>
                    {editId ? 'Save Changes' : 'Add Exercise'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <FlatList
              data={log}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const colors = getExerciseColor(item.exercise);
                return (
                  <View style={styles.card}>
                    <LinearGradient
                      colors={colors}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.exercise}</Text>
                        <View style={styles.iconRow}>
                          <TouchableOpacity 
                            onPress={() => handleEdit(item)} 
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="create-outline" size={22} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleDelete(item.id)} 
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="trash-outline" size={22} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.cardContent}>
                        <View style={styles.exerciseDetail}>
                          <Ionicons name="repeat-outline" size={16} color="#fff" />
                          <Text style={styles.cardText}>{item.sets} sets</Text>
                        </View>
                        <View style={styles.exerciseDetail}>
                          <Ionicons name="fitness-outline" size={16} color="#fff" />
                          <Text style={styles.cardText}>{item.reps} reps</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="fitness-outline" size={64} color="#fff" />
                  <Text style={styles.emptyTitle}>No exercises yet</Text>
                  <Text style={styles.emptyText}>Start logging your workouts to see them here!</Text>
                </View>
              }
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  inner: {
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
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    flex: 0.48,
  },
  buttonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
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