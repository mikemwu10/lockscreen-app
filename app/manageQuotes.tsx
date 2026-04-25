import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassModule } from '../components/GlassModule';
import { HorizontalEditMenu } from '../components/HorizontalEditMenu';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRouter } from 'expo-router';

export default function QuotesScreen() {
  const router = useRouter();
  const { quotes, activeQuote, addQuote, updateQuote, deleteQuote, setActiveQuote } = useDashboardData();
  const [newQuote, setNewQuote] = useState('');
  
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');

  const handleAddQuote = () => {
    if (newQuote.trim()) {
      addQuote(newQuote);
      setNewQuote('');
    }
  };

  const handleSaveEditQuote = () => {
    if (editQuoteText.trim() && editingQuoteId) {
      updateQuote(editingQuoteId, editQuoteText);
      setEditingQuoteId(null);
      setEditQuoteText('');
    }
  };

  // Sort quotes alphabetically
  const sortedQuotes = [...quotes].sort((a, b) => a.text.localeCompare(b.text));

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Motivational Quotes</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <GlassModule style={styles.module}>
          <Text style={styles.subtitle}>Tap a quote from the library to set it as your active lock screen quote manually, otherwise it randomly changes every day!</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a new quote..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newQuote}
              onChangeText={setNewQuote}
              onSubmitEditing={handleAddQuote}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddQuote}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {sortedQuotes.length > 0 && (
            <View style={styles.listContainer}>
              {sortedQuotes.map((item) => {
                const isActive = item.text === activeQuote;
                
                if (editingQuoteId === item.id) {
                  return (
                    <View key={item.id} style={styles.listItem}>
                      <TextInput
                        style={styles.editInput}
                        value={editQuoteText}
                        onChangeText={setEditQuoteText}
                        onSubmitEditing={handleSaveEditQuote}
                        autoFocus
                      />
                      <TouchableOpacity onPress={handleSaveEditQuote} style={styles.iconButton}>
                        <Ionicons name="checkmark" size={24} color="#34C759" />
                      </TouchableOpacity>
                    </View>
                  );
                }

                return (
                  <QuoteItem 
                    key={item.id} 
                    item={item} 
                    isActive={isActive} 
                    onEdit={() => { setEditingQuoteId(item.id); setEditQuoteText(item.text); }}
                    onDelete={() => deleteQuote(item.id)}
                    onSetActive={(text: string) => setActiveQuote(text, true)}
                  />
                );
              })}
            </View>
          )}
        </GlassModule>
      </ScrollView>
    </KeyboardAvoidingView>
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
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
  },
  module: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#34C759', // success green
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeListItem: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  listItemText: {
    flex: 1,
    color: '#ffffff',
    fontFamily: 'Quicksand_500Medium',
    fontSize: 15,
  },
  activeListItemText: {
    fontFamily: 'Quicksand_700Bold', // Highlight the active quote
  },
  editInput: {
    flex: 1,
    color: '#ffffff',
    fontFamily: 'Quicksand_500Medium',
    fontSize: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
  },
});

const QuoteItem = ({ item, isActive, onEdit, onDelete, onSetActive }: any) => {
  const targetRef = React.useRef<View>(null);
  const [menuAnchorY, setMenuAnchorY] = React.useState<number | null>(null);

  const handleTap = () => {
    targetRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
      setMenuAnchorY(pageY - 50);
    });
  };

  return (
    <View ref={targetRef} collapsable={false}>
      <TouchableOpacity 
        style={[styles.listItem, isActive && styles.activeListItem]} 
        onPress={handleTap}
        activeOpacity={0.7}
      >
        <Text style={[styles.listItemText, isActive && styles.activeListItemText]}>
          {item.text}
        </Text>
        
        <View style={styles.actionsBox}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <Ionicons name="pencil-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      <HorizontalEditMenu 
        visible={menuAnchorY !== null} 
        actions={[{ label: 'Set Active', onPress: () => onSetActive(item.text) }]} 
        onDismiss={() => setMenuAnchorY(null)} 
        anchorY={menuAnchorY} 
      />
    </View>
  );
};
