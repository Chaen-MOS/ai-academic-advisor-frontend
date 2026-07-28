import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ProfileHeader} from '../components/profile/ProfileHeader';
import {profileData} from '../data/mockData';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type ChatHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ChatHistory'
>;

export default function ChatHistoryScreen({navigation}: ChatHistoryScreenProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ProfileHeader
        profile={profileData}
        showSettings
        onSettingsPress={() => navigation.navigate('Settings')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Chat history</Text>
        <View style={styles.emptyArea}>
          <Text style={styles.emptyText}>No chat record.{'\n'}Start your chat now.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start chat"
          onPress={() => navigation.navigate('Home')}
          style={({pressed}) => [styles.chatButton, pressed && styles.pressed]}>
          <Text style={styles.chatIcon}>chat</Text>
          <Text style={styles.chatText}>Chat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.primaryText,
  },
  emptyArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
    textAlign: 'center',
  },
  chatButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.softCyan,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chatIcon: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  chatText: {
    ...typography.button,
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.72,
  },
});
