import React from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from './components/ThemeContext';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#18181b' : '#fff' }]}> 
      <Text style={[styles.title, { color: isDark ? '#fff' : '#222' }]}>Settings</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#fff' : '#222' }]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 