import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ScreenHeader} from '../components/common/ScreenHeader';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type ContactAdvisorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ContactAdvisor'
>;

type AdvisorOption = 'lecturer' | 'academicAdvisor';

export default function ContactAdvisorScreen({
  navigation,
}: ContactAdvisorScreenProps) {
  const [selectedAdvisor, setSelectedAdvisor] =
    useState<AdvisorOption>('academicAdvisor');

  const handleContactNow = () => {
    navigation.navigate('ChatHistory');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScreenHeader title="Contact Advisor" onBackPress={navigation.goBack} />

      <View style={styles.content}>
        <View style={styles.illustration}>
          <View style={styles.illustrationCircle}>
            <Text style={styles.illustrationText}>advisor</Text>
          </View>
          <View style={styles.illustrationLine} />
        </View>

        <View style={styles.copyArea}>
          <Text style={styles.title}>Need more help?</Text>
          <Text style={styles.description}>
            Share this chat context with a lecturer or academic advisor for
            human guidance.
          </Text>
        </View>

        <View style={styles.options}>
          <AdvisorChoice
            label="Lecturer"
            description="Best for course-specific feedback and assessment questions."
            selected={selectedAdvisor === 'lecturer'}
            onPress={() => setSelectedAdvisor('lecturer')}
          />
          <AdvisorChoice
            label="Academic Advisor"
            description="Best for degree planning, academic standing, and next steps."
            selected={selectedAdvisor === 'academicAdvisor'}
            onPress={() => setSelectedAdvisor('academicAdvisor')}
          />
        </View>

        <Text style={styles.privacyNote}>
          Your selected advisor will receive the recent chat summary and profile
          details needed to respond.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="Contact Now"
            accessibilityLabel="Contact selected advisor"
            onPress={handleContactNow}
            variant="accent"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to chat"
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}>
            <Text style={styles.backText}>Back to Chat</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

type AdvisorChoiceProps = {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

function AdvisorChoice({
  label,
  description,
  selected,
  onPress,
}: AdvisorChoiceProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{checked: selected}}
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}>
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <View style={styles.optionTextArea}>
        <Text style={styles.optionTitle}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
    </Pressable>
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
  illustration: {
    height: 150,
    borderRadius: radius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.softCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  illustrationLine: {
    width: 130,
    height: 2,
    marginTop: spacing.md,
    backgroundColor: colors.divider,
  },
  copyArea: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.authHeading,
    color: colors.primaryText,
  },
  description: {
    ...typography.body,
    marginTop: spacing.xs,
    color: colors.secondaryText,
  },
  options: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  optionCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.softCyan,
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.secondaryText,
    marginTop: 3,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  optionTextArea: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
  },
  optionDescription: {
    ...typography.small,
    marginTop: spacing.xxs,
    color: colors.secondaryText,
  },
  privacyNote: {
    ...typography.small,
    marginTop: spacing.lg,
    color: colors.secondaryText,
  },
  actions: {
    marginTop: 'auto',
    gap: spacing.md,
  },
  backButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '700',
  },
});
