import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {colors, spacing, typography} from '../theme';

export default function LecturerPortalScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Lecturer Portal
        </Text>

        <Text style={styles.description}>
          Lecturer tools and student support
          features will be available here.
        </Text>
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
    padding: spacing.lg,
  },

  title: {
    ...typography.title,
    color: colors.primaryText,
  },

  description: {
    ...typography.body,
    marginTop: spacing.sm,
    color: colors.secondaryText,
  },
});