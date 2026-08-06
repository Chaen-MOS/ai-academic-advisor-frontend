import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ArrowLeft, MessageCirclePlus, Settings} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ProfileHeader} from '../components/profile/ProfileHeader';
import {useAuth} from '../contexts/AuthContext';
import {
  deleteConversation,
  getConversations,
  type ConversationListItem,
} from '../services/conversationApi';
import {getProfile} from '../services/profileApi';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type ChatHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ChatHistory'
>;

type HeaderProfile = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

function formatConversationDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function ChatHistoryScreen({
  navigation,
}: ChatHistoryScreenProps) {
  const {user} = useAuth();

  const [profile, setProfile] = useState<HeaderProfile>({
    name:
      user?.user_metadata?.username ??
      user?.email?.split('@')[0] ??
      'Student',
    email: user?.email ?? '',
    avatarUrl: null,
  });

  const [conversations, setConversations] = useState<
    ConversationListItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadScreenData = useCallback(async () => {
    try {
      setLoadError(null);

      const [profileResult, conversationResult] =
        await Promise.all([
          getProfile(),
          getConversations(),
        ]);

      const storedProfile = profileResult.profile;

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

      setConversations(conversationResult);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load chat history.',
      );
    }
  }, [
    user?.email,
    user?.user_metadata?.username,
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function load() {
        try {
          setIsLoading(true);

          if (isActive) {
            await loadScreenData();
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      load();

      return () => {
        isActive = false;
      };
    }, [loadScreenData]),
  );

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadScreenData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConversationPress = (
    conversation: ConversationListItem,
  ) => {
    navigation.navigate('Home', {
      conversationId: conversation.id,
    });
  };

  const handleConversationLongPress = (
    conversation: ConversationListItem,
  ) => {
    Alert.alert(
      'Delete Conversation',
      `Delete "${conversation.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(
                conversation.id,
              );

              setConversations(current =>
                current.filter(
                  item =>
                    item.id !==
                    conversation.id,
                ),
              );
            } catch (error) {
              Alert.alert(
                'Delete Failed',
                error instanceof Error
                  ? error.message
                  : 'Unable to delete conversation.',
              );
            }
          },
        },
      ],
    );
  };

  const handleNewChat = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Home',
        },
      ],
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderConversation = ({
    item,
  }: {
    item: ConversationListItem;
  }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open conversation ${item.title}`}
      onPress={() => handleConversationPress(item)}
      onLongPress={() =>
        handleConversationLongPress(item)
      }
      delayLongPress={500}
      style={({pressed}) => [
        styles.conversationCard,
        pressed && styles.pressed,
      ]}>
      <View style={styles.conversationHeader}>
        <Text
          style={styles.conversationTitle}
          numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.conversationDate}>
          {formatConversationDate(item.lastMessageAt)}
        </Text>
      </View>

      <Text
        style={styles.conversationPreview}
        numberOfLines={2}>
        {item.lastMessagePreview ||
          'Continue this conversation'}
      </Text>

      <Text style={styles.messageCount}>
        {item.messageCount}{' '}
        {item.messageCount === 1 ? 'message' : 'messages'}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ProfileHeader
        profile={profile}
        showSettings
        onSettingsPress={() =>
          navigation.navigate('Settings')
        }
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Chat history</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerArea}>
            <ActivityIndicator
              size="large"
              color={colors.accent}
            />
            <Text style={styles.loadingText}>
              Loading conversations...
            </Text>
          </View>
        ) : loadError ? (
          <View style={styles.centerArea}>
            <Text style={styles.errorText}>
              {loadError}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading chat history"
              onPress={handleRefresh}
              style={({pressed}) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={item => item.id}
            renderItem={renderConversation}
            contentContainerStyle={[
              styles.list,
              conversations.length === 0 &&
                styles.emptyList,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              <View style={styles.centerArea}>
                <Text style={styles.emptyText}>
                  No chat record.{'\n'}
                  Start your chat now.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.floatingActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}>
            <ArrowLeft
              size={20}
              strokeWidth={2}
              color={colors.primaryText}
            />

            <Text style={styles.actionText}>Back</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start new chat"
            onPress={handleNewChat}
            style={({pressed}) => [
              styles.newChatButton,
              pressed && styles.pressed,
            ]}>
            <MessageCirclePlus
              size={21}
              strokeWidth={1.8}
              color={colors.primaryText}
            />
            <Text style={styles.actionText}>New Chat</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.primaryText,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: 96,
    gap: spacing.sm,
  },
  emptyList: {
    flexGrow: 1,
  },
  conversationCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  conversationTitle: {
    ...typography.body,
    flex: 1,
    color: colors.primaryText,
    fontWeight: '700',
  },
  conversationDate: {
    ...typography.small,
    color: colors.secondaryText,
  },
  conversationPreview: {
    ...typography.small,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  messageCount: {
    ...typography.small,
    marginTop: spacing.xs,
    color: colors.mutedText,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.sm,
    color: colors.secondaryText,
  },
  emptyText: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.destructive,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 42,
    marginTop: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.softCyan,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...typography.button,
    color: colors.primaryText,
  },
  floatingActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  backButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  newChatButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.softCyan,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  actionText: {
    ...typography.button,
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.72,
  },
});