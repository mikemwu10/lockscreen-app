import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface GlassModuleProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const GlassModule: React.FC<GlassModuleProps> = ({ children, style, contentStyle }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.blurView}>
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  blurView: {
    width: '100%',
    backgroundColor: 'rgba(20, 20, 20, 0.45)', // dark glass base
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // subtle edge highlight
    borderRadius: 24,
  },
  content: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // slight white tint
  },
});
