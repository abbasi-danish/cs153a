import React from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from './components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}> 
      <LinearGradient
        colors={isDark ? ['#232526', '#18181b'] : ['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>Settings</Text>
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(36,36,40,0.95)' : 'rgba(255,255,255,0.95)' }]}> 
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#222' }]}>Dark Mode</Text>
              <Switch value={isDark} onValueChange={toggleTheme} thumbColor={isDark ? '#667eea' : '#fff'} trackColor={{ false: '#ccc', true: '#667eea' }} />
            </View>
            <Text style={[styles.desc, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Toggle between light and dark mode for the app interface.</Text>
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
}); 