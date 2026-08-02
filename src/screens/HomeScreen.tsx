import React, {useRef, useState} from 'react';
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
import {sendChatMessage} from '../services/chatApi';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'completed' | 'failed';
};

export default function AcademicAdvisorHomeScreen({
  navigation,
}: HomeScreenProps) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const hasConversation = chatMessages.length > 0;

  const handleQuickQuestionPress = (question: string) => {
    setMessage(question);
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
      const result = await sendChatMessage('2201234', trimmedMessage);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        status: 'completed',
      };

      setChatMessages(previous => [...previous, assistantMessage]);
    } catch (error) {
      const failedMessage: ChatMessage = {
        id: `failed-${Date.now()}`,
        role: 'assistant',
        content:
          'I could not connect to the academic advisor service. Please try again.',
        status: 'failed',
      };

      setChatMessages(previous => [...previous, failedMessage]);

      console.error(
        'Chat request failed:',
        error instanceof Error ? error.message : error,
      );
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            item.status === 'failed' && styles.failedBubble,
          ]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.userMessageText]}>
              {item.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>
              {item.content}
            </Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}>
        <ScreenHeader
          cyan
          leftLabel="menu"
          rightLabel="bell"
          onLeftPress={() => navigation.navigate('ChatHistory')}
          onRightPress={() => navigation.navigate('Notifications')}
        />

        {!hasConversation ? (
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
              isSending ? (
                <View style={styles.typingArea}>
                  <ActivityIndicator size="small" color={colors.accent} />
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
              editable={!isSending}
              style={styles.input}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={isSending || !message.trim()}
              hitSlop={spacing.xs}
              onPress={handleSubmitMessage}
              style={({pressed}) => [
                styles.sendButton,
                pressed && styles.pressed,
                (isSending || !message.trim()) && styles.disabledButton,
              ]}>
              <Text style={styles.sendText}>
                {isSending ? '...' : 'send'}
              </Text>
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
    minWidth: 48,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
});

