import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LogOut} from 'lucide-react-native';
import {useAuth} from '../contexts/AuthContext';
import {ProfileHeader} from '../components/profile/ProfileHeader';
import {SettingSection} from '../components/settings/SettingSection';
import {settingsSections} from '../data/mockData';
import {getProfile, updateProfile} from '../services/profileApi';
import {colors, radius, spacing, typography} from '../theme';
import type {SettingRowItem} from '../types/app';
import type {RootStackParamList} from '../types/navigation';

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

type HeaderProfile = {
  name: string;
  email: string;
  avatarUrl:string|null;
};

export default function SettingsScreen({
  navigation,
}: SettingsScreenProps) {
  const {logout, user} = useAuth();
  const [chatMemoryEnabled, setChatMemoryEnabled] = useState(true);
  const [profile, setProfile] = useState<HeaderProfile>({
    name:
      user?.user_metadata?.username ??
      user?.email?.split('@')[0] ??
      'Student',
    email: user?.email ?? '',
    avatarUrl: null,
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProfile() {
        try {
          setIsLoadingProfile(true);

          const result = await getProfile();
          const storedProfile = result.profile;

          if (!isActive) {
            return;
          }

          setProfile({
          name:
            storedProfile.preferred_name ||
            storedProfile.full_name ||
            user?.user_metadata?.username ||
            user?.email?.split('@')[0] ||
            'Student',
          email: user?.email ?? '',
          avatarUrl: storedProfile.avatar_url ?? null,
        });
        setChatMemoryEnabled(
          storedProfile.chat_memory_enabled,
        );
        } catch (error) {
          console.error('Failed to load settings profile:', error);

          if (isActive) {
            setProfile({
              name:
                user?.user_metadata?.username ||
                user?.email?.split('@')[0] ||
                'Student',
              email: user?.email ?? '',
              avatarUrl: null,
            });
          }
        } finally {
          if (isActive) {
            setIsLoadingProfile(false);
          }
        }
      }

      loadProfile();

      return () => {
        isActive = false;
      };
    }, [
      user?.email,
      user?.user_metadata?.username,
    ]),
  );

  const handleRowPress = (item: SettingRowItem) => {
    if (item.target) {
      navigation.navigate(item.target);
      return;
    }

    Alert.alert(
      'Coming Soon',
      `${item.label} will be available in a later update.`,
    );
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

  const handleToggleMemory = async (
    value: boolean,
  ) => {
    
    setChatMemoryEnabled(value);

    try {
      await updateProfile({
        chatMemoryEnabled: value,
      });
    } catch (error) {
  
      setChatMemoryEnabled(!value);

      console.error(
        'Failed to update chat memory setting:',
        error,
      );
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      {isLoadingProfile ? (
        <View style={styles.profileLoadingArea}>
          <ActivityIndicator
            size="small"
            color={colors.accent}
          />
        </View>
      ) : (
        <ProfileHeader
          title="Settings"
          profile={profile}
          showEdit
          onEditPress={() =>
            navigation.navigate('EditProfile')
          }
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {settingsSections.map(section => (
          <SettingSection
            key={section.title}
            title={section.title}
            rows={section.rows}
            onRowPress={handleRowPress}
            chatMemoryEnabled={chatMemoryEnabled}
            onToggleChatMemory={handleToggleMemory}
          />
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          disabled={isLoggingOut}
          onPress={handleLogout}
          style={({pressed}) => [
            styles.logoutButton,
            pressed && !isLoggingOut && styles.pressed,
            isLoggingOut && styles.disabled,
          ]}>
          <LogOut
            size={20}
            strokeWidth={1.8}
            color={colors.destructive}
          />

          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Text>
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
  profileLoadingArea: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softCyan,
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
  logoutText: {
    ...typography.body,
    color: colors.destructive,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
});