import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert, Animated, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Task } from '../utils/storage';
import { GlassModule } from './GlassModule';

interface TodoWidgetProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask: (text: string) => void;
  onUpdateTask: (id: string, newText: string) => void;
}

const TodoItem = ({
  task, onToggle, onUpdateTask,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onUpdateTask: (id: string, text: string) => void;
}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isChecking, setIsChecking] = useState(false);

  const handleToggle = () => {
    setIsChecking(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 360, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 16, duration: 360, useNativeDriver: true }),
    ]).start(() => {
      onToggle(task.id);
      setIsChecking(false);
      opacity.setValue(1);
      translateX.setValue(0);
    });
  };

  const handleSaveEdit = () => {
    if (editText.trim()) onUpdateTask(task.id, editText);
    setIsEditing(false);
  };

  return (
    <Animated.View style={[styles.taskRow, { opacity, transform: [{ translateX }] }]}>
      <TouchableOpacity onPress={handleToggle} style={styles.checkboxTouch} activeOpacity={0.6}>
        <View style={[styles.checkbox, isChecking && styles.checkboxDone]}>
          {isChecking && <Ionicons name="checkmark" size={13} color="#fff" />}
        </View>
      </TouchableOpacity>

      {isEditing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            onSubmitEditing={handleSaveEdit}
            autoFocus
          />
          <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
            <Ionicons name="checkmark" size={20} color="#34C759" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsEditing(true)} activeOpacity={0.6}>
          <Text style={styles.taskText}>{task.text}</Text>
          <Text style={styles.taskHint}>Tap to edit</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export const TodoWidget: React.FC<TodoWidgetProps> = ({
  tasks, onToggle, onAddTask, onUpdateTask,
}) => {
  const router = useRouter();
  const [newTask, setNewTask] = useState('');

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const displayTasks = activeTasks.slice(0, 10);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    if (activeTasks.length >= 10) {
      Alert.alert('Focus up ✨', "Finish what's on your plate first!", [{ text: 'Got it' }]);
      return;
    }
    onAddTask(newTask);
    setNewTask('');
  };

  return (
    <GlassModule style={{ marginBottom: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TODAY'S TASKS</Text>
        {displayTasks.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{displayTasks.length}</Text>
          </View>
        )}
      </View>

      {displayTasks.length > 0 ? (
        <View style={styles.taskList}>
          {displayTasks.map((task) => (
            <TodoItem key={task.id} task={task} onToggle={onToggle} onUpdateTask={onUpdateTask} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptySubtitle}>Add a task below to get started.</Text>
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="What do you want to get done?"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask} activeOpacity={0.8}>
          <Ionicons name="add" size={17} color="#ffffff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Completed tasks link */}
      <TouchableOpacity
        style={styles.completedLink}
        onPress={() => router.push('/completed' as any)}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-done-outline" size={14} color="#5B8DEF" />
        <Text style={styles.completedLinkText}>View completed tasks</Text>
        <Ionicons name="chevron-forward" size={13} color="#5B8DEF" />
      </TouchableOpacity>
    </GlassModule>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#5B8DEF',
    letterSpacing: 2.5,
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#5B8DEF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
  },
  taskList: {
    marginBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkboxTouch: {
    marginRight: 14,
    padding: 3,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  taskText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  taskHint: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontFamily: 'Quicksand_500Medium',
    marginTop: 2,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(91, 141, 239, 0.6)',
    paddingVertical: 2,
  },
  saveButton: {
    marginLeft: 10,
    padding: 4,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 14,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    color: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  addButton: {
    backgroundColor: '#5B8DEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontFamily: 'Quicksand_700Bold',
    fontSize: 14,
  },
  completedLink: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  completedLinkText: {
    color: '#5B8DEF',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
});
