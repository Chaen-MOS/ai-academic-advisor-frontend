import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Alert} from 'react-native';
import {AuthFooterLink} from '../../components/auth/AuthFooterLink';
import {AuthHero} from '../../components/auth/AuthHero';
import {AuthScreen} from '../../components/auth/AuthScreen';
import {AuthTextField} from '../../components/auth/AuthTextField';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {colors, spacing, typography} from '../../theme';
import type {RootStackParamList} from '../../types/navigation';
import {useAuth} from '../../contexts/AuthContext';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({navigation}: LoginScreenProps) {
  const {signIn} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);

      await signIn(normalizedEmail, password);

    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to sign in.';

      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleForgotPasswordPress = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  const handleRememberPress = () => {
    setRememberMe(currentValue => !currentValue);
  };

  return (
    <AuthScreen>
      <View style={styles.screen}>
        <AuthHero height={284} />

        <View style={styles.formArea}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Sign in</Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.fields}>
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthTextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.optionRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="Remember me"
              accessibilityState={{checked: rememberMe}}
              hitSlop={spacing.xs}
              onPress={handleRememberPress}
              style={styles.rememberButton}>
              <View
                style={[
                  styles.rememberIndicator,
                  rememberMe && styles.rememberIndicatorActive,
                ]}
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              hitSlop={spacing.xs}
              onPress={handleForgotPasswordPress}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={isSubmitting ? 'Signing In...' : 'Sign In'}
            accessibilityLabel="Sign in"
            onPress={handleLogin}
            disabled={isSubmitting}
          />
          <AuthFooterLink
            prompt="Don't have an Account?"
            actionLabel="Sign Up"
            accessibilityLabel="Go to sign up"
            onPress={handleSignUpPress}
          />
        </View>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 720,
    backgroundColor: colors.background,
  },
  formArea: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
  },
  titleGroup: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.primaryText,
  },
  titleUnderline: {
    width: 92,
    height: 2,
    marginTop: 5,
    backgroundColor: colors.accent,
  },
  fields: {
    gap: spacing.lg,
  },
  optionRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rememberIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.divider,
  },
  rememberIndicatorActive: {
    backgroundColor: colors.accent,
  },
  rememberText: {
    ...typography.small,
    color: colors.primaryText,
  },
  forgotText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.accent,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  loginButton: {
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
});
