import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native';
import {getProfile} from '../services/profileApi';
import {useAuth} from '../contexts/AuthContext';
import {ProfileHeader} from '../components/profile/ProfileHeader';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';
import {MessageCircle} from 'lucide-react-native';

type ChatHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ChatHistory'
>;

export default function ChatHistoryScreen({navigation}: ChatHistoryScreenProps) {
  const {user} = useAuth();

  const [profile, setProfile] = useState({
    name:
      user?.user_metadata?.username ??
      user?.email?.split('@')[0] ??
      'Student',
    email: user?.email ?? '',
    avatarUrl: null as string | null,
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProfile() {
        try {
          setIsLoadingProfile(true);

          const result = await getProfile();
          const storedProfile=result.profile;

          if (!active) {
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
        } catch (error) {
          console.error(error);
        } finally {
          if (active) {
            setIsLoadingProfile(false);
          }
        }
      }

      loadProfile();

      return () => {
        active = false;
      };
    }, [user?.email]),
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      {isLoadingProfile ? (
        <View style={styles.loadingHeader}>
          <ActivityIndicator
            size="small"
            color={colors.accent}
          />
        </View>
      ) : (
        <ProfileHeader
          profile={profile}
          showSettings
          onSettingsPress={() =>
            navigation.navigate('Settings')
          }
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>Chat history</Text>
        <View style={styles.emptyArea}>
          <Text style={styles.emptyText}>No chat record.{'\n'}Start your chat now.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start chat"
          onPress={() => navigation.navigate('Home')}
          style={({pressed}) => [styles.chatButton, pressed && styles.pressed]}>
          <MessageCircle
              size={22}
              strokeWidth={1.8}
              color={colors.primaryText}
            />
          <Text style={styles.chatText}>Chat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.primaryText,
  },
  emptyArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
    textAlign: 'center',
  },
  chatButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.softCyan,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chatIcon: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  chatText: {
    ...typography.button,
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.72,
  },
  loadingHeader: {
    minHeight: 190,
    backgroundColor: colors.softCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
