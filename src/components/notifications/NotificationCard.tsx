import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors, radius, spacing, typography} from '../../theme';
import type {NotificationRecord} from '../../types/app';

type NotificationCardProps = {
  notification: NotificationRecord;
};

export function NotificationCard({notification}: NotificationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.category}>{notification.category}</Text>
        <Text style={styles.time}>{notification.timeLabel}</Text>
      </View>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.description}>{notification.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  time: {
    ...typography.small,
    color: colors.secondaryText,
  },
  title: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    marginTop: spacing.xxs,
    color: colors.secondaryText,
  },
});
