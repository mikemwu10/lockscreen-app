import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDashboardData } from '../hooks/useDashboardData';
import { GlassModule } from './GlassModule';
import { HorizontalEditMenu } from './HorizontalEditMenu';

interface QuoteWidgetProps {
  activeQuote: string | null;
}

export const QuoteWidget: React.FC<QuoteWidgetProps> = ({ activeQuote }) => {
  const router = useRouter();
  const { setActiveQuote, quotes } = useDashboardData();

  const targetRef = useRef<View>(null);
  const [menuAnchorY, setMenuAnchorY] = useState<number | null>(null);

  const handleLongPress = () => {
    targetRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
      setMenuAnchorY(pageY - 50); // Mount horizontal popup correctly dynamically over the widget bounds
    });
  };

  const menuActions = [
    { label: 'Change Library', onPress: () => router.push('/manageQuotes' as any) }
  ];

  // If the library is completely empty, always show the motivational fallback
  // regardless of whatever activeQuoteState was last persisted in Firestore.
  const displayQuote =
    quotes.length === 0 || !activeQuote
      ? 'Fuel a New Day with a New Motivation. ✨'
      : activeQuote;

  return (
    <GlassModule style={styles.container}>
      <View ref={targetRef} collapsable={false}>
        <TouchableOpacity
          style={styles.row}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <Ionicons name="sunny-outline" size={28} color="#f0f0f0" style={styles.icon} />
          <Text style={styles.text}>{displayQuote}</Text>
        </TouchableOpacity>
      </View>

      <HorizontalEditMenu
        visible={menuAnchorY !== null}
        actions={menuActions}
        onDismiss={() => setMenuAnchorY(null)}
        anchorY={menuAnchorY}
      />
    </GlassModule>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  text: {
    flex: 1,
    color: '#ffffff',
    fontSize: 22, // slightly decreased font size further
    fontFamily: 'Quicksand_600SemiBold',
    lineHeight: 32,
  },
});
