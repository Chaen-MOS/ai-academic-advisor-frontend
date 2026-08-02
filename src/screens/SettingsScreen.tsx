import React, { useState } from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Alert} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import {ProfileHeader} from '../components/profile/ProfileHeader';
import {SettingSection} from '../components/settings/SettingSection';
import {profileData, settingsSections} from '../data/mockData';
import {colors, radius, spacing, typography} from '../theme';
import type {SettingRowItem} from '../types/app';
import type {RootStackParamList} from '../types/navigation';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({navigation}: SettingsScreenProps) {
  const {logout} = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRowPress = (item: SettingRowItem) => {
    if (item.target) {
      navigation.navigate(item.target);
    }
  };

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();

    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to sign out.';

      Alert.alert('Logout Failed', errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ProfileHeader
        title="Settings"
        profile={profileData}
        showEdit
        onEditPress={() => navigation.navigate('EditProfile')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {settingsSections.map(section => (
          <SettingSection
            key={section.title}
            title={section.title}
            rows={section.rows}
            onRowPress={handleRowPress}
          />
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={handleLogout}
          style={({pressed}) => [styles.logoutButton, pressed && styles.pressed]}>
          <Text style={styles.logoutIcon}>logout</Text>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.destructive,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  logoutIcon: {
    ...typography.small,
    color: colors.destructive,
    fontWeight: '700',
  },
  logoutText: {
    ...typography.body,
    color: colors.destructive,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
