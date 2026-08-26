import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Markdown from 'react-native-markdown-display';
import {ScreenHeader} from '../components/common/ScreenHeader';
import {QuickQuestionButton} from '../components/home/QuickQuestionButton';
import {quickQuestions} from '../data/mockData';
import {sendChatMessage, type ChatApiError,} from '../services/chatApi';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';
import {RotateCcw,SendHorizontal} from 'lucide-react-native';
import {getConversationMessages, retryAssistantMessage} from '../services/conversationApi';




type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'streaming' | 'completed' | 'failed';
  isRetrying?: boolean;
};

export default function AcademicAdvisorHomeScreen({
  navigation,
  route,
}: HomeScreenProps) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const hasConversation = chatMessages.length > 0;
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const handleQuickQuestionPress = (question: string) => { setMessage(question); };
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const fullStreamingContentRef = useRef('');

  useEffect(() => {
  return () => {
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }
  };
}, []);

useEffect(() => {
  const routeConversationId =
    route.params?.conversationId;

  if (
    typeof routeConversationId !== 'string' ||
    !routeConversationId
  ) {
    return;
  }

  let isMounted = true;

  async function loadConversation(
    conversationId: string,
  ) {
    try {
      setIsLoadingConversation(true);

      const result =
        await getConversationMessages(
          conversationId,
        );

      if (!isMounted) {
        return;
      }

      const loadedMessages: ChatMessage[] =
        result.messages
          .filter(
            item =>
              item.processingStatus === 'COMPLETED' ||
              item.processingStatus === 'FAILED',
          )
          .map(item => ({
            id: item.id,
            role:
              item.role === 'USER'
                ? 'user'
                : 'assistant',
            content:
              item.content ||
              (item.processingStatus === 'FAILED'
                ? 'The previous response failed. Please try again.'
                : ''),
            status:
              item.processingStatus === 'FAILED'
                ? 'failed'
                : 'completed',
          }));

      setCurrentConversationId(
        result.conversation.id,
      );

      setChatMessages(loadedMessages);
    } catch (error) {
      console.error(
        'Unable to load conversation:',
        error,
      );
    } finally {
      if (isMounted) {
        setIsLoadingConversation(false);
      }
    }
  }

  void loadConversation(routeConversationId);

  return () => {
    isMounted = false;
  };
}, [route.params?.conversationId]);
  const handleNewChat = () => {
    setCurrentConversationId(null);
    setChatMessages([]);
    setMessage('');

    navigation.setParams({
      conversationId: undefined,
    });
  };
  const animateAssistantMessage = (
    assistantMessageId: string,
    fullContent: string,
  ): Promise<void> => {
    return new Promise(resolve => {
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }

      streamingMessageIdRef.current =
        assistantMessageId;

      fullStreamingContentRef.current =
        fullContent;

      setIsStreaming(true);

      setChatMessages(current => [
        ...current,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          status: 'streaming',
        },
      ]);

      let currentIndex = 0;

      streamingTimerRef.current =
        setInterval(() => {
          currentIndex += 10;

          const visibleContent =
            fullContent.slice(0, currentIndex);

          setChatMessages(current =>
            current.map(item =>
              item.id === assistantMessageId
                ? {
                    ...item,
                    content: visibleContent,
                  }
                : item,
            ),
          );

          listRef.current?.scrollToEnd({
            animated: true,
          });

          if (currentIndex >= fullContent.length) {
            if (streamingTimerRef.current) {
              clearInterval(
                streamingTimerRef.current,
              );
            }

            streamingTimerRef.current = null;

            setChatMessages(current =>
              current.map(item =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      content: fullContent,
                      status: 'completed',
                    }
                  : item,
              ),
            );

            setIsStreaming(false);
            streamingMessageIdRef.current = null;
            fullStreamingContentRef.current = '';

            resolve();
          }
        }, 5);
    });
  };
  const handleSubmitMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    if (trimmedMessage.toLowerCase().includes('advisor')) {
      navigation.navigate('ContactAdvisor');
      setMessage('');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
      status: 'completed',
    };

    setChatMessages(previous => [...previous, userMessage]);
    setMessage('');
    setIsSending(true);

    try {
      const result = await sendChatMessage(
        trimmedMessage,
        currentConversationId,
      );

      if (!result?.conversation?.id) {
        console.error('Unexpected chat API response:', result);
        throw new Error(
          'The chat API returned an invalid conversation response.',
        );
      }

      if (!result?.assistantMessage?.content) {
        console.error('Missing assistant message:', result);
        throw new Error(
          'The chat API did not return an assistant response.',
        );
      }

      setCurrentConversationId(result.conversation.id);

      await animateAssistantMessage(
        result.assistantMessage.id,
        result.assistantMessage.content,
      );
    } catch (error) {
        const apiError = error as ChatApiError;

        if (apiError.conversationId) {
          setCurrentConversationId(apiError.conversationId);
        }

        const failedMessage: ChatMessage = {
          id:
            apiError.assistantMessageId ??
            `failed-${Date.now()}`,
          role: 'assistant',
          content:
            'I could not connect to the academic advisor service. Please try again.',
          status: 'failed',
        };

        setChatMessages(previous => [
          ...previous,
          failedMessage,
        ]);

        console.error(
          'Chat request failed:',
          apiError.message,
        );
      } finally {
        setIsSending(false);
      }
  };

  const handleRetry = async (
    assistantMessageId: string,
  ) => {
    if (!currentConversationId) {
      return;
    }

    try {
      setChatMessages(current =>
        current.map(item =>
          item.id === assistantMessageId
            ? {...item, isRetrying: true}
            : item,
        ),
      );

      const retried =
        await retryAssistantMessage(
          currentConversationId,
          assistantMessageId,
        );

      setChatMessages(current =>
        current.map(item =>
          item.id === assistantMessageId
            ? {
                id: retried.id,
                role: 'assistant',
                content: retried.content,
                status: 'completed',
                isRetrying: false,
              }
            : item,
        ),
      );
    } catch (error) {
      setChatMessages(current =>
        current.map(item =>
          item.id === assistantMessageId
            ? {...item, isRetrying: false}
            : item,
        ),
      );
    }
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUser = item.role === 'user';
    const isFailedAssistant =
      !isUser && item.status === 'failed';

    return (
      <View
        style={[
          styles.messageRow,
          isUser
            ? styles.userMessageRow
            : styles.assistantMessageRow,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : styles.assistantBubble,
            item.status === 'failed' &&
              styles.failedBubble,
          ]}>
          {isUser ? (
            <Text
              style={[
                styles.messageText,
                styles.userMessageText,
              ]}>
              {item.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>
              {item.content}
            </Markdown>
          )}
        </View>

        {isFailedAssistant ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry failed response"
            disabled={item.isRetrying}
            onPress={() => handleRetry(item.id)}
            style={({pressed}) => [
              styles.retryMessageButton,
              pressed &&
                !item.isRetrying &&
                styles.pressed,
              item.isRetrying &&
                styles.retryMessageButtonDisabled,
            ]}>
            {item.isRetrying ? (
              <ActivityIndicator
                size="small"
                color={colors.secondaryText}
              />
            ) : (
              <RotateCcw
                size={15}
                strokeWidth={2}
                color={colors.secondaryText}
              />
            )}

            <Text style={styles.retryMessageText}>
              {item.isRetrying
                ? 'Retrying...'
                : 'Retry'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const handleStopStreaming = () => {
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }

    const messageId =
      streamingMessageIdRef.current;

    if (messageId) {
      setChatMessages(current =>
        current.map(item =>
          item.id === messageId
            ? {
                ...item,
                content:
                  fullStreamingContentRef.current,
                status: 'completed',
              }
            : item,
        ),
      );
    }

    setIsStreaming(false);
    streamingMessageIdRef.current = null;
    fullStreamingContentRef.current = '';
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}>
        <ScreenHeader
          cyan
          leftIcon="menu"
          rightIcon="bell"
          onLeftPress={() => navigation.navigate('ChatHistory')}
          onRightPress={() => navigation.navigate('Notifications')}
        />

        {isLoadingConversation ? (
          <View style={styles.centerArea}>
            <ActivityIndicator
              size="large"
              color={colors.accent}
            />
            <Text style={styles.loadingConversationText}>
              Loading conversation...
            </Text>
          </View>
        ) : !hasConversation ? (
          <View style={styles.content}>
            <View style={styles.greetingArea}>
              <Text style={styles.greeting}>
                How can I help you{'\n'}today?
              </Text>

              <Text style={styles.subtitle}>
                Ask anything about your academic journey.
              </Text>
            </View>

            <View style={styles.quickGrid}>
              {quickQuestions.map(question => (
                <QuickQuestionButton
                  key={question}
                  label={question}
                  onPress={() => handleQuickQuestionPress(question)}
                />
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={chatMessages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              listRef.current?.scrollToEnd({animated: true});
            }}
            onLayout={() => {
              listRef.current?.scrollToEnd({animated: false});
            }}
            ListFooterComponent={
              isSending && !isStreaming ? (
                <View style={styles.typingArea}>
                  <ActivityIndicator
                    size="small"
                    color={colors.accent}
                  />
                  <Text style={styles.typingText}>
                    Academic advisor is thinking...
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputShell}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSubmitMessage}
              placeholder="Type your question..."
              placeholderTextColor={colors.mutedText}
              returnKeyType="send"
              selectionColor={colors.accent}
              editable={
                !isSending &&
                !isStreaming &&
                !isLoadingConversation
              }
              style={styles.input}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isStreaming
                  ? 'Stop response animation'
                  : 'Send message'
              }
              disabled={
                !isStreaming &&
                (
                  isSending ||
                  isLoadingConversation ||
                  !message.trim()
                )
              }
              onPress={
                isStreaming
                  ? handleStopStreaming
                  : handleSubmitMessage
              }
              style={({pressed}) => [
                styles.sendButton,
                pressed && styles.pressed,
                !isStreaming &&
                  (
                    isSending ||
                    isLoadingConversation ||
                    !message.trim()
                  ) &&
                  styles.disabledButton,
              ]}>
              {isStreaming ? (
                <View style={styles.stopIcon} />
              ) : isSending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryText}
                />
              ) : (
                <View style={styles.iconOffset}>
                  <SendHorizontal
                    size={19}
                    strokeWidth={1.8}
                    color={colors.primaryText}
                  />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {
    ...typography.body,
    color: colors.primaryText,
    lineHeight: 21,
    marginTop: 0,
    marginBottom: 0,
  },
  strong: {
    fontWeight: '700' as const,
    color: colors.primaryText,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing.xs,
  },
  bullet_list: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  ordered_list: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  list_item: {
    marginBottom: spacing.xs,
  },
  code_inline: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: colors.softCyan,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  hr: {
    backgroundColor: colors.divider,
    height: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  heading1: {
    ...typography.body,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700' as const,
    color: colors.primaryText,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  heading2: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700' as const,
    color: colors.primaryText,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  heading3: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700' as const,
    color: colors.primaryText,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingConversationText: {
    ...typography.body,
    marginTop: spacing.sm,
    color: colors.secondaryText,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  greetingArea: {
    marginTop: '20%',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chatContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  assistantMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.softCyan,
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubble: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.softCyan,
    borderBottomLeftRadius: spacing.xs,
  },
  failedBubble: {
    opacity: 0.7,
  },
  messageText: {
    ...typography.body,
    lineHeight: 21,
  },
  userMessageText: {
    color: colors.primaryText,
  },
  assistantMessageText: {
    color: colors.primaryText,
  },

  typingArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  typingText: {
    ...typography.small,
    color: colors.secondaryText,
  },

  inputArea: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  inputShell: {
    minHeight: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.softCyan,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.primaryText,
    paddingVertical: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  sendText: {
    ...typography.small,
    color: colors.primaryText,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.68,
  },
  disabledButton: {
    opacity: 0.4,
  },
  iconOffset: {
    transform: [{translateY: 1}],
  },
  retryMessageButton: {
    marginTop: spacing.xs,
    minHeight: 30,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },

  retryMessageButtonDisabled: {
    opacity: 0.6,
  },

  retryMessageText: {
    ...typography.small,
    color: colors.secondaryText,
    fontWeight: '700',
  },
  stopIcon: {
    width: 13,
    height: 13,
    borderRadius: 2,
    backgroundColor: colors.primaryText,
  },
});
