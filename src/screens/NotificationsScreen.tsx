import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ScreenHeader} from '../components/common/ScreenHeader';
import {NotificationCard} from '../components/notifications/NotificationCard';
import {notificationCategories, notifications} from '../data/mockData';
import {colors, radius, spacing, typography} from '../theme';
import type {NotificationCategory, NotificationRecord} from '../types/app';
import type {RootStackParamList} from '../types/navigation';

type NotificationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Notifications'
>;

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>('All');

  const filteredNotifications = useMemo(
    () =>
      selectedCategory === 'All'
        ? notifications
        : notifications.filter(item => item.category === selectedCategory),
    [selectedCategory],
  );

  const renderNotification = ({item}: {item: NotificationRecord}) => (
    <View>
      <Text style={styles.dateLabel}>{item.dateLabel}</Text>
      <NotificationCard notification={item} />
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScreenHeader title="Notifications" onBackPress={navigation.goBack} />

      <View style={styles.filters}>
        {notificationCategories.map(category => {
          const isSelected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              accessibilityLabel={`Show ${category} notifications`}
              onPress={() => setSelectedCategory(category)}
              style={[styles.chip, isSelected && styles.chipSelected]}>
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chip: {
    minHeight: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.softCyan,
    backgroundColor: colors.softCyan,
  },
  chipText: {
    ...typography.small,
    color: colors.secondaryText,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: colors.primaryText,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  dateLabel: {
    ...typography.small,
    marginBottom: spacing.xs,
    color: colors.secondaryText,
    fontWeight: '700',
  },
});
