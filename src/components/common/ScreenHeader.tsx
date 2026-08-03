import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Bell,
  Menu,
  Settings,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react-native';
import {colors, spacing, typography} from '../../theme';

type HeaderIconName =
  | 'menu'
  | 'bell'
  | 'settings'
  | 'back';

type ScreenHeaderProps = {
  title?: string;
  leftIcon?: HeaderIconName;
  rightIcon?: HeaderIconName;
  onBackPress?: () => void;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  cyan?: boolean;
};

const iconMap: Record<HeaderIconName, LucideIcon> = {
  menu: Menu,
  bell: Bell,
  settings: Settings,
  back: ArrowLeft,
};

export function ScreenHeader({
  title,
  leftIcon,
  rightIcon,
  onBackPress,
  onLeftPress,
  onRightPress,
  cyan = false,
}: ScreenHeaderProps) {
  const LeftIcon = leftIcon ? iconMap[leftIcon] : null;
  const RightIcon = rightIcon ? iconMap[rightIcon] : null;

  return (
    <SafeAreaView edges={['top']} style={cyan && styles.cyanArea}>
      <View style={[styles.container, cyan && styles.cyanContainer]}>
        <View style={styles.iconSlot}>
        {LeftIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={leftIcon}
            hitSlop={spacing.sm}
            onPress={onLeftPress}
            style={({pressed}) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}>
            <LeftIcon
              size={22}
              strokeWidth={1.8}
              color={colors.primaryText}
            />
          </Pressable>
        ) : null}
      </View>

        {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.title} />}

        <View style={styles.iconSlot}>
        {RightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightIcon}
            hitSlop={spacing.sm}
            onPress={onRightPress}
            style={({pressed}) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}>
            <RightIcon
              size={22}
              strokeWidth={1.8}
              color={colors.primaryText}
            />
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
    width: 40,
    height: 40,
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
  iconSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
