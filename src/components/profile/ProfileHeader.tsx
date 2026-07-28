import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors, spacing, typography} from '../../theme';
import type {ProfileData} from '../../types/app';

type ProfileHeaderProps = {
  profile: Pick<ProfileData, 'name' | 'email'>;
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
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          {showSettings ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={onSettingsPress}
              style={styles.iconButton}>
              <Text style={styles.icon}>set</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.infoArea}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            {showEdit ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                hitSlop={spacing.xs}
                onPress={onEditPress}>
                <Text style={styles.editIcon}>edit</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.email}>{profile.email}</Text>
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
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontSize: 36,
    lineHeight: 40,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.accent,
    fontSize: 28,
    lineHeight: 30,
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
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: colors.primaryText,
  },
  editIcon: {
    color: colors.primaryText,
    fontSize: 18,
  },
  email: {
    ...typography.body,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontWeight: '500',
  },
});
