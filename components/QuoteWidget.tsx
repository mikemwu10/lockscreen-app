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
  const { quotes } = useDashboardData();
  const targetRef = useRef<View>(null);
  const [menuAnchorY, setMenuAnchorY] = useState<number | null>(null);

  const handleLongPress = () => {
    targetRef.current?.measure((_x, _y, _w, _h, _px, pageY) => {
      setMenuAnchorY(pageY - 50);
    });
  };

  const menuActions = [
    { label: 'Manage Quote Library', onPress: () => router.push('/manageQuotes' as any) },
  ];

  const displayQuote =
    quotes.length === 0 || !activeQuote
      ? 'Fuel a new day with a new motivation.'
      : activeQuote;

  return (
    <GlassModule style={styles.container}>
      <View ref={targetRef} collapsable={false}>
        <TouchableOpacity onLongPress={handleLongPress} delayLongPress={500} activeOpacity={0.75}>
          <Text style={styles.label}>TODAY'S INSPIRATION</Text>
          <Text style={styles.quoteDecor}>"</Text>
          <Text style={styles.text}>{displayQuote}</Text>
          <Text style={styles.hint}>Hold to manage quotes</Text>
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
  label: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#A78BFA',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  quoteDecor: {
    fontSize: 50,
    lineHeight: 34,
    color: '#A78BFA',
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 8,
    opacity: 0.75,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  hint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.28)',
    fontFamily: 'Quicksand_500Medium',
    marginTop: 12,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
});
