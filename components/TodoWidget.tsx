import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Task } from '../utils/storage';
import { GlassModule } from './GlassModule';

interface TodoWidgetProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask: (text: string) => void;
  onUpdateTask: (id: string, newText: string) => void;
}

const TodoItem = ({ task, onToggle, onUpdateTask }: { task: Task; onToggle: (id: string) => void; onUpdateTask: (id: string, text: string) => void }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

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

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdateTask(task.id, editText);
    }
    setIsEditing(false);
  };

  return (
    <Animated.View style={[styles.taskRow, { opacity }]}>
      <TouchableOpacity onPress={handleToggle} style={styles.iconContainer}>
        <Ionicons name="ellipse-outline" size={24} color="#f0f0f0" />
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
          <TouchableOpacity onPress={handleSaveEdit} style={styles.saveIconButton}>
            <Ionicons name="checkmark" size={24} color="#34C759" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsEditing(true)}>
          <Text style={styles.taskText}>{task.text}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export const TodoWidget: React.FC<TodoWidgetProps> = ({ tasks, onToggle, onAddTask, onUpdateTask }) => {
  const router = useRouter();
  const [newTask, setNewTask] = useState('');

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  // Display only first 10
  const displayTasks = activeTasks.slice(0, 10);

  const handleAddTask = () => {
    if (newTask.trim() === '') return;

    if (activeTasks.length >= 10) {
      Alert.alert(
        "Gentle Reminder ✨",
        "Let's focus on finishing your current tasks on hand first!",
        [{ text: "Got it" }]
      );
      return;
    }

    onAddTask(newTask);
    setNewTask('');
  };

  return (
    <GlassModule style={{ marginBottom: 20 }}>
      {displayTasks.length > 0 ? (
        <View>
          {displayTasks.map((task) => (
            <TodoItem key={task.id} task={task} onToggle={onToggle} onUpdateTask={onUpdateTask} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={32} color="#ffffff" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyText}>Great job!{"\n"}No task left unfinished!</Text>
        </View>
      )}

      {/* Embedded Input Field right above completed tasks */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={24} color="rgba(52, 199, 89, 0.7)" />
        </TouchableOpacity>
      </View>

      {/* Hidden button to navigate to completed tasks */}
      <TouchableOpacity
        style={styles.completedLink}
        onPress={() => router.push('/completed' as any)}
        activeOpacity={0.6}
      >
        <Text style={styles.completedLinkText}>View Completed Tasks</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </GlassModule>
  );
};

const styles = StyleSheet.create({
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
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  editInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 2,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveIconButton: {
    marginLeft: 10,
    padding: 2,
  },
  emptyContainer: {
    paddingVertical: 20,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  addButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedLink: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedLinkText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    marginRight: 5,
  }
});
