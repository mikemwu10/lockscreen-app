import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useDashboardData } from '../hooks/useDashboardData';
import { HorizontalEditMenu } from './HorizontalEditMenu';

export const ClockWidget: React.FC = () => {
  const { appSettings, toggle24HourMode } = useDashboardData();
  const [now, setNow] = useState(new Date());
  const targetRef = useRef<View>(null);
  const [menuAnchorY, setMenuAnchorY] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLongPress = () => {
    targetRef.current?.measure((_x, _y, _w, _h, _px, pageY) => {
      setMenuAnchorY(pageY - 55);
    });
  };

  const menuActions = [
    { label: appSettings.is24Hour ? 'Switch to 12h' : 'Switch to 24h', onPress: toggle24HourMode },
  ];

  return (
    <View style={styles.container}>
      <View ref={targetRef} collapsable={false}>
        <TouchableOpacity activeOpacity={0.85} onLongPress={handleLongPress} delayLongPress={500}>
          <View style={styles.timeRow}>
            <Text style={styles.time}>
              {format(now, appSettings.is24Hour ? 'HH:mm' : 'h:mm')}
            </Text>
            {!appSettings.is24Hour && (
              <Text style={styles.ampm}>{format(now, 'a')}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{format(now, 'EEEE, MMMM do').toUpperCase()}</Text>

      <HorizontalEditMenu
        visible={menuAnchorY !== null}
        actions={menuActions}
        onDismiss={() => setMenuAnchorY(null)}
        anchorY={menuAnchorY}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 28,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 90,
    lineHeight: 90,
    color: '#1ecbe1', // Vibrant cyan
    fontFamily: 'Inter_300Light',
    letterSpacing: -3,
    textShadowColor: 'rgba(30, 203, 225, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  ampm: {
    fontSize: 22,
    color: '#ffb300', // Gold accent
    fontFamily: 'Inter_300Light',
    letterSpacing: 2,
    marginLeft: 8,
    marginBottom: 11,
  },
  date: {
    fontSize: 12,
    color: '#1a2236', // Deep blue-gray
    fontFamily: 'Inter_400Regular',
    marginTop: 10,
    letterSpacing: 2.5,
    textShadowColor: 'rgba(30, 203, 225, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
