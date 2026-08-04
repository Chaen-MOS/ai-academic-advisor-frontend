import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator, 
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ArrowLeft} from 'lucide-react-native';
import {AcademicSelectField} from '../components/common/AcademicSelectField';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {
  academicStatusOptions,
  notificationPreferenceOptions,
  yearLevelOptions,
} from '../data/mockData';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';
import {
  getProfile,
  updateProfile,
} from '../services/profileApi';
import {useAuth} from '../contexts/AuthContext';
import {decode} from 'base64-arraybuffer';
import {supabase} from '../config/supabase';

type EditProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

export default function EditProfileScreen({navigation}: EditProfileScreenProps) {
  const {user} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('year-1');
  const [academicStatus, setAcademicStatus] = useState('NORMAL');
  const [notificationPreference, setNotificationPreference] = useState(
    'courses-deadlines',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const avatarInitial =
  name.trim().charAt(0).toUpperCase() || '?';
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);

        const result = await getProfile();
        const profile = result.profile;

        if (!isMounted) {
          return;
        }

        setName(profile.full_name ?? '');
        setEmail(user?.email ?? '');
        setStudentId(profile.student_id ?? '');
        setPhone(profile.mobile_number ?? '');
        setProgram(profile.programme ?? '');
        setAvatarUri(profile.avatar_url ?? null);
        setYearLevel(
          profile.current_year
            ? `year-${profile.current_year}`
            : 'year-1',
        );
        setAcademicStatus(
          profile.academic_standing ?? 'NORMAL',
        );
      } catch (error) {
        Alert.alert(
          'Profile Error',
          error instanceof Error
            ? error.message
            : 'Unable to load profile.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const handleSaveProfile = async () => {
    const parsedYear = Number(yearLevel.replace('year-', ''));

    try {
      setIsSaving(true);

      await updateProfile({
        fullName: name.trim(),
        studentId: studentId.trim(),
        programme: program.trim(),
        currentYear: Number.isNaN(parsedYear) ? null : parsedYear,
        academicStanding: academicStatus as
          | 'NORMAL'
          | 'PROBATION'
          | 'WARNING'
          | 'TERMINATED'
          | 'GRADUATED',
        mobileNumber: phone.trim() || null,
        avatarUrl: avatarUri,
      });

      Alert.alert('Profile Updated', 'Your profile was saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save profile.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        maxWidth: 512,
        maxHeight: 512,
        includeBase64: true,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        throw new Error(
          result.errorMessage ?? 'Unable to select photo.',
        );
      }

      const asset = result.assets?.[0];

      if (!asset?.uri || !asset.base64) {
        throw new Error('No valid image was selected.');
      }

      const avatarUrl = await uploadAvatar(
        asset.base64,
        asset.type ?? 'image/jpeg',
      );

      setAvatarUri(avatarUrl);

      await updateProfile({
        avatarUrl,
      });
    } catch (error) {
      Alert.alert(
        'Photo Error',
        error instanceof Error
          ? error.message
          : 'Unable to update photo.',
      );
    }
  };

  async function uploadAvatar(base64: string, mimeType: string) {
    if (!user) {
      throw new Error('You must be signed in.');
    }

    const extension =
      mimeType === 'image/png' ? 'png' : 'jpg';

    const filePath = `${user.id}/avatar.${extension}`;

    const {error: uploadError} = await supabase.storage
      .from('avatars')
      .upload(filePath, decode(base64), {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: {publicUrl},
    } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={({pressed}) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}>
              <ArrowLeft
                size={22}
                strokeWidth={2}
                color={colors.primaryText}
              />
            </Pressable>
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image
                    source={{uri: avatarUri}}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {avatarInitial}
                  </Text>
                )}
              </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              onPress={handleChangePhoto}
              style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>
                Change Photo
              </Text>
            </Pressable>
          </View>

          <ProfileSection title="Personal Information">
            <EditTextField label="Name" value={name} onChangeText={setName} />
            <EditTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={false}
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
              onChange={value => setAcademicStatus(value)}
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

          <View style={styles.saveButtonContainer}>
            <PrimaryButton
              label={isSaving ? 'Saving...' : 'Save Changes'}
              accessibilityLabel="Save profile changes"
              onPress={handleSaveProfile}
              disabled={isSaving}
              variant="cyan"
              style={styles.saveButton}
            />
          </View>
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
  editable?: boolean;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

function EditTextField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  editable = true,
}: EditTextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        selectionColor={colors.accent}
        style={[
          styles.fieldInput,
          !editable && styles.disabledInput,
        ]}
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
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondaryText,
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xxl + 48,
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
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    overflow: 'hidden',
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
  pressed: {
    opacity: 0.6,
  },
  disabledInput: {
    color: colors.mutedText,
  },
  saveButtonContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  saveButton: {
    width: '100%',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
});