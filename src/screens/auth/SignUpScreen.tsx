import React, {useState} from 'react';
import {Alert,  Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../contexts/AuthContext';
import {AuthHero} from '../../components/auth/AuthHero';
import {AuthScreen} from '../../components/auth/AuthScreen';
import {AuthTextField} from '../../components/auth/AuthTextField';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {colors, radius, spacing, typography} from '../../theme';
import type {RootStackParamList} from '../../types/navigation';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({navigation}: SignUpScreenProps) {
  const {signUp} = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  async function handleSignUp() {
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobileNumber = mobileNumber.trim();

    if (!normalizedUsername) {
      Alert.alert('Missing Username', 'Please enter your username.');
      return;
    }

    if (!normalizedEmail) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!normalizedMobileNumber) {
      Alert.alert(
        'Missing Mobile Number',
        'Please enter your mobile number.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Your password must contain at least 6 characters.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'The confirmation password does not match.',
      );
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        'Terms Required',
        'You must agree to the Terms & Conditions before signing up.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await signUp(
        normalizedEmail,
        password,
        {
          username: normalizedUsername,
          mobileNumber: normalizedMobileNumber,
        },
      );

      setUsername('');
      setEmail('');
      setMobileNumber('');
      setPassword('');
      setAcceptedTerms(false);

      if (!result.session) {
        Alert.alert(
          'Check Your Email',
          'Your account was created. Please verify your email before logging in.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );

        return;
      }

      Alert.alert(
        'Account Created',
        'Your account is ready.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to create your account.';

      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleTermsPress = () => {
    setAcceptedTerms(currentValue => !currentValue);
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <AuthScreen>
      <View style={styles.screen}>
        <AuthHero height={275} />

        <View style={styles.content}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.fields}>
            <AuthTextField
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="words"
            />
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="123@example.com"
              keyboardType="email-address"
            />
            <AuthTextField
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="0123456789"
              keyboardType="phone-pad"
            />
            <AuthTextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
            <AuthTextField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
            />
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Agree with Terms and Conditions"
            accessibilityState={{checked: acceptedTerms}}
            hitSlop={spacing.xs}
            onPress={handleTermsPress}
            style={styles.termsRow}>
            <View
              style={[styles.radio, acceptedTerms && styles.radioSelected]}
            />
            <Text style={styles.termsText}>Agree with Terms & Conditions</Text>
          </Pressable>

          <View style={styles.actions}>
            <PrimaryButton
              label={isSubmitting ? 'Creating Account...' : 'Sign Up'}
              accessibilityLabel="Create account"
              onPress={handleSignUp}
              disabled={isSubmitting}
              style={styles.signUpButton}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to login"
              hitSlop={spacing.xs}
              onPress={handleBackToLogin}>
              <Text style={styles.backText}>Back to Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    minHeight: 820,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 30,
  },
  titleGroup: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.authHeading,
    color: colors.primaryText,
  },
  titleUnderline: {
    width: 145,
    height: 2,
    marginTop: 6,
    backgroundColor: colors.accent,
  },
  fields: {
    gap: spacing.lg,
  },
  termsRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.secondaryText,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  termsText: {
    ...typography.small,
    color: colors.secondaryText,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  signUpButton: {
    width: '88%',
    maxWidth: 320,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
});
