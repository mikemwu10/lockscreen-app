import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardData } from '../hooks/useDashboardData';
import { GlassModule } from '../components/GlassModule';
import { format, parseISO } from 'date-fns';
import { Task } from '../utils/storage';

const CompletedTaskItem = ({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onToggle(task.id);
      opacity.setValue(1); 
    });
  };

  return (
    <Animated.View style={[styles.taskRow, { opacity }]}>
      <TouchableOpacity onPress={handleToggle} style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#4cd964" />
      </TouchableOpacity>
      <Text style={styles.taskText}>{task.text}</Text>
    </Animated.View>
  );
};

export default function CompletedTasksScreen() {
  const router = useRouter();
  const { tasks, toggleTask } = useDashboardData();

  const completedTasks = tasks.filter((t) => t.isCompleted);

  // Group by date
  const groupedTasks: { [date: string]: Task[] } = {};
  completedTasks.forEach(task => {
    const dateStr = task.completedAt ? format(parseISO(task.completedAt), 'MMMM do, yyyy') : 'Unknown Date';
    if (!groupedTasks[dateStr]) groupedTasks[dateStr] = [];
    groupedTasks[dateStr].push(task);
  });

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    // Basic string sort is fine here since date-fns format gives 'Month XX, YYYY', but ideally we sort by actual date
    // For simplicity, we just display as they come or reverse
    return b.localeCompare(a); 
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finished Tasks</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        {sortedDates.length === 0 ? (
           <GlassModule>
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={32} color="#ffffff" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>No finished tasks yet.{"\n"}Go conquer your day!</Text>
            </View>
           </GlassModule>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.section}>
              <Text style={styles.dateHeader}>{date}</Text>
              <GlassModule>
                {groupedTasks[date].map((task) => (
                  <CompletedTaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </GlassModule>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120, // Moved down for comfortable reach
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 15,
  },
  dateHeader: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 16,
    marginLeft: 15,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginRight: 15,
  },
  taskText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.6)', // faded look for completed
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
});
