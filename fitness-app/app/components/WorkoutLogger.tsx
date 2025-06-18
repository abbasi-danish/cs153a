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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutEntry {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
}

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Workout Logger</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Exercise</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bench Press"
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
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, editId ? styles.buttonEdit : null]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name={editId ? 'create-outline' : 'add-outline'}
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>{editId ? 'Save Changes' : 'Add Entry'}</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={log}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.exercise}</Text>
                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="create-outline" size={22} color="#6200ee" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={22} color="#b00020" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cardText}>{item.sets} sets × {item.reps} reps</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No entries yet. Start logging!</Text>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9',
    paddingBottom: Platform.OS === 'ios' ? 88 : 68,
  },
  inner: { 
    flex: 1, 
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#212121' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#616161', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  halfWidth: { flex: 0.48 },
  button: { backgroundColor: '#6200ee', borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  buttonEdit: { backgroundColor: '#018786' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { paddingBottom: 40 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#212121' },
  iconRow: { flexDirection: 'row' },
  iconButton: { marginLeft: 12, padding: 4 },
  cardText: { fontSize: 14, color: '#424242' },
  empty: { textAlign: 'center', color: '#9e9e9e', marginTop: 80, fontSize: 16, fontStyle: 'italic' },
}); 