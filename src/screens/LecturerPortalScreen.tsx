import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  ChevronRight,
  MessageSquareText,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';

import type {RootStackParamList} from '../types/navigation';

type LecturerPortalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LecturerPortal'
>;

export default function LecturerPortalScreen({
  navigation,
}: LecturerPortalScreenProps) {
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <ArrowLeft
              color={colors.primaryText}
              size={24}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>

        <View style={styles.sheet}>
          <View style={styles.pageTitleBlock}>
            <Text style={styles.kicker}>
              LECTURER PORTAL
            </Text>

            <Text style={styles.title}>
              Student Support
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open support requests"
            onPress={() =>
              navigation.navigate(
                'SupportRequests',
              )
            }
            style={({pressed}) => [
              styles.supportCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.supportIcon}>
              <MessageSquareText
                size={34}
                color={colors.accent}
                strokeWidth={1.8}
              />
            </View>

            <Text style={styles.supportTitle}>
              Support Requests
            </Text>

            <Text style={styles.supportDescription}>
              View student requests,
              take over cases and
              provide replies.
            </Text>

            <View style={styles.openButton}>
              <Text style={styles.openButtonText}>
                Open Requests
              </Text>

              <ChevronRight
                size={18}
                color={colors.primaryText}
              />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.softCyan,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.softCyan,
  },

  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },

  sheet: {
    flex: 1,
    width: '100%',
    gap: spacing.xl,

    backgroundColor: colors.background,

    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,

    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
  },

  pageTitleBlock: {
    gap: spacing.xxs,
  },

  kicker: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 16,
  },

  title: {
    ...typography.cardHeading,
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },

  supportCard: {
    borderWidth: 1,
    borderColor: 'rgba(189, 200, 206, 0.55)',
    borderRadius: radius.lg,
    backgroundColor: colors.white,

    padding: spacing.xl,

    alignItems: 'center',
  },

  supportIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,

    backgroundColor: colors.softCyan,

    alignItems: 'center',
    justifyContent: 'center',
  },

  supportTitle: {
    ...typography.cardHeading,

    color: colors.primaryText,

    marginTop: spacing.lg,

    textAlign: 'center',
  },

  supportDescription: {
    ...typography.body,

    color: colors.secondaryText,

    marginTop: spacing.sm,

    textAlign: 'center',

    lineHeight: 20,
  },

  openButton: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: spacing.xs,

    marginTop: spacing.xl,

    minHeight: 48,

    width: '100%',

    borderRadius: radius.md,

    backgroundColor: colors.softCyan,
  },

  openButtonText: {
    ...typography.body,

    color: colors.primaryText,

    fontWeight: '700',
  },

  pressed: {
    opacity: 0.72,
  },
});