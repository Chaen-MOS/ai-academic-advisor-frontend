import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {AuthScreen} from '../../components/auth/AuthScreen';
import {AuthTextField} from '../../components/auth/AuthTextField';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {supabase} from '../../config/supabase';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';
import type {RootStackParamList} from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

type ResetPasswordScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    'ResetPassword'
  >;

export default function ResetPasswordScreen({
  navigation,
}: ResetPasswordScreenProps) {
  const [password, setPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [isUpdating, setIsUpdating] =
    useState(false);
  const { isPasswordRecovery, setIsPasswordRecovery,} = useAuth();


  const handleResetPassword = async () => {
    if (!isPasswordRecovery) {
        Alert.alert(
        'Invalid recovery session',
        'Please request a new password reset link.',
        );
        return;
    }

    if (password.length < 8) {
        Alert.alert(
        'Invalid password',
        'Password must contain at least 8 characters.',
        );
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert(
        'Passwords do not match',
        'Please make sure both passwords are the same.',
        );
        return;
    }

    try {
        setIsUpdating(true);

        const {error} =
        await supabase.auth.updateUser({
            password,
        });

        if (error) {
        throw error;
        }

        // Recovery mode is finished.
        setIsPasswordRecovery(false);

        // Sign out so the user logs in normally
        // using the newly changed password.
        await supabase.auth.signOut();

        Alert.alert(
        'Password updated',
        'Your password has been reset successfully.',
        [
            {
            text: 'Sign in',
            },
        ],
        );
    } catch (error) {
        console.error(
        'Password update failed:',
        error,
        );

        Alert.alert(
        'Unable to reset password',
        error instanceof Error
            ? error.message
            : 'Please try again.',
        );
    } finally {
        setIsUpdating(false);
    }
    };

  return (
    <AuthScreen>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>
            Reset your password
          </Text>

          <Text style={styles.description}>
            Enter a new password for your account.
          </Text>

          <View style={styles.fieldArea}>
            <AuthTextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.fieldSpacing}>
              <AuthTextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <PrimaryButton
            label={
                isUpdating
                ? 'UPDATING...'
                : 'RESET PASSWORD'
            }
            accessibilityLabel="Reset password"
            onPress={handleResetPassword}
            variant="accent"
            style={styles.resetButton}
            disabled={isUpdating}
            />
        </View>
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
    minHeight: 340,
    marginTop: 160,
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

  fieldSpacing: {
    marginTop: spacing.md,
  },

  resetButton: {
    marginTop: spacing.xl,
  },
});