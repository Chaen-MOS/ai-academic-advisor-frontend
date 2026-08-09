import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {colors, spacing, typography} from '../theme';

export default function AdminPortalScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Admin Portal
        </Text>

        <Text style={styles.description}>
          Administrative tools and knowledge
          management features will be available
          here.
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