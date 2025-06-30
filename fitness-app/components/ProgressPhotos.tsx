import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';

const STORAGE_KEY = 'progressPhotos';

export default function ProgressPhotos() {
  const { isDark } = useTheme();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setPhotos(JSON.parse(saved));
    } catch (e) {}
    setLoading(false);
  };

  const savePhotos = async (newPhotos: string[]) => {
    setPhotos(newPhotos);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPhotos));
  };

  const addPhoto = async (fromCamera: boolean) => {
    let result;
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Media library permission is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    }
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const newPhotos = [result.assets[0].uri, ...photos];
      await savePhotos(newPhotos);
    }
  };

  const deletePhoto = (uri: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const newPhotos = photos.filter(p => p !== uri);
        await savePhotos(newPhotos);
      }}
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}> 
      <LinearGradient
        colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Progress Photos</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => addPhoto(true)}>
              <Ionicons name="camera" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => addPhoto(false)}>
              <Ionicons name="images" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Pick from Gallery</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={{ color: isDark ? '#fff' : '#222', marginTop: 32 }}>Loading...</Text>
          ) : photos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={64} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)'} />
              <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#222' }]}>No progress photos yet</Text>
              <Text style={[styles.emptyText, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Start tracking your fitness journey visually!</Text>
            </View>
          ) : (
            <FlatList
              data={photos}
              keyExtractor={uri => uri}
              numColumns={2}
              contentContainerStyle={styles.gallery}
              renderItem={({ item }) => (
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: item }} style={styles.photo} />
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deletePhoto(item)}>
                    <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { flex: 1 },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 32, textAlign: 'center', letterSpacing: 0.5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#667eea', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18, marginHorizontal: 4 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  gallery: { paddingBottom: 40 },
  photoWrapper: { margin: 8, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  photo: { width: 150, height: 200, borderRadius: 16 },
  deleteButton: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 12 },
}); 