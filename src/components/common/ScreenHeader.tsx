import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors, spacing, typography} from '../../theme';

type ScreenHeaderProps = {
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
  onBackPress?: () => void;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  cyan?: boolean;
};

export function ScreenHeader({
  title,
  leftLabel = '<',
  rightLabel,
  onBackPress,
  onLeftPress,
  onRightPress,
  cyan = false,
}: ScreenHeaderProps) {
  const handleLeftPress = onBackPress ?? onLeftPress;

  return (
    <SafeAreaView edges={['top']} style={cyan && styles.cyanArea}>
      <View style={[styles.container, cyan && styles.cyanContainer]}>
        <View style={styles.side}>
          {handleLeftPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={onBackPress ? 'Go back' : 'Open menu'}
              hitSlop={spacing.sm}
              onPress={handleLeftPress}
              style={styles.iconButton}>
              <Text style={styles.iconText}>{leftLabel}</Text>
            </Pressable>
          ) : null}
        </View>

        {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.title} />}

        <View style={styles.side}>
          {rightLabel && onRightPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={rightLabel}
              hitSlop={spacing.sm}
              onPress={onRightPress}
              style={styles.iconButton}>
              <Text style={styles.iconText}>{rightLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cyanArea: {
    backgroundColor: colors.softCyan,
  },
  container: {
    minHeight: 50,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  cyanContainer: {
    backgroundColor: colors.softCyan,
  },
  side: {
    width: 44,
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.primaryText,
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '700',
  },
  title: {
    ...typography.body,
    flex: 1,
    color: colors.primaryText,
    fontWeight: '700',
    textAlign: 'center',
  },
});
