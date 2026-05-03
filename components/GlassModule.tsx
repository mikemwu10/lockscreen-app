import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface GlassModuleProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const GlassModule: React.FC<GlassModuleProps> = ({ children, style, contentStyle }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Base: translucent dark layer — low opacity so wallpaper bleeds through */}
      <View style={styles.base} />
      {/* Top specular highlight — simulates light catching the top glass edge */}
      <View style={styles.topEdge} />
      {/* Bottom depth shadow — creates the illusion the glass has thickness */}
      <View style={styles.bottomEdge} />

      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 26,
    overflow: 'hidden',
    marginVertical: 10,
    width: '100%',
    // Outer border acts as the glass rim — bright on top via the specular layer inside
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    // Deep soft shadow lifts the card off the wallpaper
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 28,
    elevation: 12,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    // Warm-tinted dark at 46% — lets wallpaper color bleed through, not a black box
    backgroundColor: 'rgba(22, 22, 40, 0.46)',
  },
  topEdge: {
    // Bright specular line at the top — simulates overhead light hitting glass
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  bottomEdge: {
    // Subtle darkening at the bottom — gives the glass physical depth/thickness
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  content: {
    padding: 20,
  },
});
