import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Pencil, Settings} from 'lucide-react-native';

import {colors, spacing, typography} from '../../theme';
import type {ProfileData} from '../../types/app';

type ProfileHeaderProps = {
  profile: Pick<ProfileData, 'name' | 'email'> & {
    avatarUrl?: string | null;
  };
  title?: string;
  showSettings?: boolean;
  showEdit?: boolean;
  onSettingsPress?: () => void;
  onEditPress?: () => void;
};

export function ProfileHeader({
  profile,
  title,
  showSettings = false,
  showEdit = false,
  onSettingsPress,
  onEditPress,
}: ProfileHeaderProps) {
  const displayName = profile.name.trim() || 'Student';
  const avatarInitial =
    displayName.charAt(0).toUpperCase() || '?';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {title ? (
          <Text style={styles.screenTitle}>{title}</Text>
        ) : null}

        <View style={styles.topRow}>
          <View style={styles.avatar}>
            {profile.avatarUrl ? (
              <Image
                source={{uri: profile.avatarUrl}}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {avatarInitial}
              </Text>
            )}
          </View>

          {showSettings ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={spacing.xs}
              onPress={onSettingsPress}
              style={({pressed}) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}>
              <Settings
                size={22}
                strokeWidth={1.8}
                color={colors.primaryText}
              />
            </Pressable>
          ) : (
            <View style={styles.iconButtonPlaceholder} />
          )}
        </View>

        <View style={styles.infoArea}>
          <View style={styles.nameRow}>
            <Text
              style={styles.name}
              numberOfLines={1}>
              {displayName}
            </Text>

            {showEdit ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                hitSlop={spacing.xs}
                onPress={onEditPress}
                style={({pressed}) => [
                  styles.editButton,
                  pressed && styles.pressed,
                ]}>
                <Pencil
                  size={18}
                  strokeWidth={2}
                  color={colors.primaryText}
                />
              </Pressable>
            ) : null}
          </View>

          <Text
            style={styles.email}
            numberOfLines={1}>
            {profile.email}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.softCyan,
  },
  container: {
    minHeight: 190,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.softCyan,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9FD6D6',
  },
  screenTitle: {
    ...typography.authHeading,
    color: colors.primaryText,
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.accent,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 42,
    height: 42,
  },
  editButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoArea: {
    marginTop: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    flexShrink: 1,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: colors.primaryText,
  },
  email: {
    ...typography.body,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.6,
  },
});