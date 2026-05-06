import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export interface MenuAction {
  label: string;
  onPress: () => void;
}

interface HorizontalEditMenuProps {
  visible: boolean;
  actions: MenuAction[];
  onDismiss: () => void;
  anchorY: number | null;
}

export const HorizontalEditMenu: React.FC<HorizontalEditMenuProps> = ({ visible, actions, onDismiss, anchorY }) => {
  if (!visible || anchorY === null) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.alignmentWrapper, { top: anchorY }]}>
              <View style={{ alignItems: 'center' }}>
                <View style={styles.menuContainer}>
                  {actions.map((action, index) => (
                    <React.Fragment key={action.label}>
                      <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => {
                          action.onPress();
                          onDismiss();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionText}>{action.label}</Text>
                      </TouchableOpacity>
                      {index < actions.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </View>
                <View style={styles.triangle} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  alignmentWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  menuContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 28, 36, 0.96)', // Deep blue, modern, less transparent
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 54, 70, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  divider: {
    width: 1,
    height: 24, // Explicit height so it looks identically to standard iOS internal UI
    backgroundColor: '#444444',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(24, 28, 36, 0.96)', // Deep blue, modern, less transparent
    marginTop: -1,
  }
});
