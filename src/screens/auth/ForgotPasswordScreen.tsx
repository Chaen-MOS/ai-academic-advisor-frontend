import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AuthHero} from '../../components/auth/AuthHero';
import {AuthScreen} from '../../components/auth/AuthScreen';
import {AuthTextField} from '../../components/auth/AuthTextField';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {colors, radius, spacing, typography} from '../../theme';
import type {RootStackParamList} from '../../types/navigation';

type ForgotPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPassword'
>;

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('123@gmail.com');

  const handleRequestReset = () => {
    Alert.alert(
      'Password reset',
      'Password reset requests will be connected to the backend later.',
    );
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <AuthScreen>
      <View style={styles.screen}>
        <AuthHero height={300} />

        <View style={styles.card}>
          <Text style={styles.title}>Forgot your password</Text>
          <Text style={styles.description}>
            Please enter the email address you would like your password reset
            information sent to.
          </Text>

          <View style={styles.fieldArea}>
            <AuthTextField
              label="Enter email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <PrimaryButton
            label="REQUEST RESET LINK"
            accessibilityLabel="Request password reset link"
            onPress={handleRequestReset}
            variant="accent"
            style={styles.resetButton}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          hitSlop={spacing.xs}
          onPress={handleBackToLogin}
          style={styles.backLink}>
          <Text style={styles.chevron}>{'<'}</Text>
          <Text style={styles.backText}>Back to Sign in</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    minHeight: 760,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  card: {
    width: '78%',
    maxWidth: 330,
    minHeight: 300,
    marginTop: -125,
    borderRadius: radius.md,
    backgroundColor: colors.softCyan,
    paddingHorizontal: spacing.md,
    paddingVertical: 18,
  },
  title: {
    ...typography.cardHeading,
    color: colors.primaryText,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    marginTop: spacing.xs + 2,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  fieldArea: {
    marginTop: spacing.xl,
  },
  resetButton: {
    marginTop: 'auto',
  },
  backLink: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  chevron: {
    color: colors.indigoLink,
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '700',
  },
  backText: {
    ...typography.body,
    color: colors.indigoLink,
    fontWeight: '700',
  },
});
