import { Inter_300Light, Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Quicksand_400Regular, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ClockWidget } from '../../components/ClockWidget';
import { QuoteWidget } from '../../components/QuoteWidget';
import { TodoWidget } from '../../components/TodoWidget';
import { useDashboardData } from '../../hooks/useDashboardData';

export default function LockScreenIndex() {
  const { tasks, activeQuote, toggleTask, addTask, updateTask, loading } = useDashboardData();

  let [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if ((!fontsLoaded && !fontError) || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ClockWidget />
        <QuoteWidget activeQuote={activeQuote} />
        <TodoWidget
          tasks={tasks || []}
          onToggle={toggleTask || (async () => { })}
          onAddTask={addTask || (async () => { })}
          onUpdateTask={updateTask || (async () => { })}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 110, // Lifted upward for better view
    paddingBottom: 110, // Increased bottom padding to prevent cutoff
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
