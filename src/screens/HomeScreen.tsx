import React, {useState} from 'react';
import {
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

import {ScreenHeader} from '../components/common/ScreenHeader';
import {QuickQuestionButton} from '../components/home/QuickQuestionButton';
import {quickQuestions} from '../data/mockData';
import {colors, radius, spacing, typography} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function AcademicAdvisorHomeScreen({
  navigation,
}: HomeScreenProps) {
  const [message, setMessage] = useState('');

  const handleQuickQuestionPress = (question: string) => {
    setMessage(question);
  };

  const handleSubmitMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (trimmedMessage.toLowerCase().includes('advisor')) {
      navigation.navigate('ContactAdvisor');
      setMessage('');
      return;
    }

    setMessage('');
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

        <View style={styles.content}>
          <View style={styles.greetingArea}>
            <Text style={styles.greeting}>How can I help you{'\n'}today?</Text>
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
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              hitSlop={spacing.xs}
              onPress={handleSubmitMessage}
              style={({pressed}) => [
                styles.sendButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.sendText}>send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
});
