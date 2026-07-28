import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AcademicSelectField} from '../components/common/AcademicSelectField';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {
  academicStatusOptions,
  notificationPreferenceOptions,
  profileData,
  yearLevelOptions,
} from '../data/mockData';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type EditProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

export default function EditProfileScreen({navigation}: EditProfileScreenProps) {
  const [name, setName] = useState(profileData.name);
  const [email, setEmail] = useState(profileData.email);
  const [studentId, setStudentId] = useState(profileData.studentId);
  const [phone, setPhone] = useState(profileData.phone);
  const [program, setProgram] = useState(profileData.program);
  const [yearLevel, setYearLevel] = useState('year-2');
  const [academicStatus, setAcademicStatus] = useState('full-time');
  const [notificationPreference, setNotificationPreference] = useState(
    'courses-deadlines',
  );

  const handleSaveProfile = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={navigation.goBack}
              style={styles.backButton}>
              <Text style={styles.backText}>back</Text>
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change photo"
              style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          <ProfileSection title="Personal Information">
            <EditTextField label="Name" value={name} onChangeText={setName} />
            <EditTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <EditTextField
              label="Student ID"
              value={studentId}
              onChangeText={setStudentId}
            />
            <EditTextField
              label="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </ProfileSection>

          <ProfileSection title="Academic Information">
            <EditTextField
              label="Program"
              value={program}
              onChangeText={setProgram}
            />
            <AcademicSelectField
              label="Year Level"
              value={yearLevel}
              options={yearLevelOptions}
              onChange={setYearLevel}
            />
            <AcademicSelectField
              label="Academic Status"
              value={academicStatus}
              options={academicStatusOptions}
              onChange={setAcademicStatus}
            />
          </ProfileSection>

          <ProfileSection title="Preferences">
            <AcademicSelectField
              label="Notifications"
              value={notificationPreference}
              options={notificationPreferenceOptions}
              onChange={setNotificationPreference}
            />
          </ProfileSection>

          <PrimaryButton
            label="Save Changes"
            accessibilityLabel="Save profile changes"
            onPress={handleSaveProfile}
            variant="accent"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ProfileSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ProfileSection({title, children}: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionFields}>{children}</View>
    </View>
  );
}

type EditTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

function EditTextField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
}: EditTextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        selectionColor={colors.accent}
        style={styles.fieldInput}
      />
      <View style={styles.fieldLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 220,
    backgroundColor: colors.softCyan,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    minHeight: 36,
    justifyContent: 'center',
  },
  backText: {
    ...typography.small,
    color: colors.primaryText,
    fontWeight: '700',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: '700',
  },
  changePhotoButton: {
    marginTop: spacing.md,
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionFields: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xxs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.secondaryText,
  },
  fieldInput: {
    ...typography.input,
    color: colors.primaryText,
    padding: 0,
  },
  fieldLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputLine,
  },
});
