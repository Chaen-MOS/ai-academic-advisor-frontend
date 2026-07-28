import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AuthHero} from '../../components/auth/AuthHero';
import {AuthScreen} from '../../components/auth/AuthScreen';
import {AuthTextField} from '../../components/auth/AuthTextField';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {colors, radius, spacing, typography} from '../../theme';
import type {RootStackParamList} from '../../types/navigation';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({navigation}: SignUpScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('123@gmail.com');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSignUp = () => {
    Alert.alert('Sign up', 'Account creation will be connected to the backend later.');
  };

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
              keyboardType="email-address"
            />
            <AuthTextField
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter your mobile"
              keyboardType="phone-pad"
            />
            <AuthTextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
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
              label="Sign Up"
              accessibilityLabel="Create account"
              onPress={handleSignUp}
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
