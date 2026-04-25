import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRouter } from 'expo-router';
import { HorizontalEditMenu } from './HorizontalEditMenu';

export const ClockWidget: React.FC = () => {
  const { appSettings, toggle24HourMode } = useDashboardData();
  const router = useRouter();
  const [now, setNow] = useState(new Date());

  const targetRef = useRef<View>(null);
  const [menuAnchorY, setMenuAnchorY] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLongPress = () => {
    targetRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuAnchorY(pageY - 55); // Mount exactly 55 pixels horizontally above bounds!
    });
  };

  const menuActions = [
    { label: appSettings.is24Hour ? 'Change to 12h' : 'Change to 24h', onPress: toggle24HourMode }
  ];

  return (
    <View style={styles.container}>
      <View ref={targetRef} collapsable={false}>
        <TouchableOpacity activeOpacity={0.8} onLongPress={handleLongPress} delayLongPress={500}>
          <Text style={styles.time}>{format(now, appSettings.is24Hour ? 'HH:mm' : 'h:mm a')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.date}>{format(now, 'EEEE, MMMM do')}</Text>
      
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
    marginVertical: 40,
  },
  time: {
    fontSize: 84,
    color: '#ffffff',
    fontFamily: 'Quicksand_400Regular', // Gentle and soft to match Quotes widget
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  date: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Quicksand_400Regular',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
