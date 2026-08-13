import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CheckCircle2,
  MessageSquareText,
} from 'lucide-react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ScreenHeader,
} from '../components/common/ScreenHeader';

import {
  getStaffSupportTickets,
  updateSupportTicketAsStaff,
  type SupportTicket,
} from '../services/supportApi';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';

import type {
  RootStackParamList,
} from '../types/navigation';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'SupportReply'
  >;

export default function SupportReplyScreen({
  navigation,
  route,
}: Props) {
  const {ticketId} =
    route.params;

  const [
    ticket,
    setTicket,
  ] = useState<SupportTicket | null>(
    null,
  );

  const [
    reply,
    setReply,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isResolving,
    setIsResolving,
  ] = useState(false);

  const [
    isResolved,
    setIsResolved,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadTicket() {
        try {
          setIsLoading(true);

          const tickets =
            await getStaffSupportTickets();

          const selectedTicket =
            tickets.find(
              item =>
                item.id ===
                ticketId,
            );

          if (!selectedTicket) {
            throw new Error(
              'Support request not found.',
            );
          }

          if (!isActive) {
            return;
          }

          setTicket(
            selectedTicket,
          );

          setReply(
            selectedTicket.lecturer_reply ??
              '',
          );

          setIsResolved(
            selectedTicket.status ===
              'RESOLVED',
          );
        } catch (error) {
          console.error(
            'Failed to load support request:',
            error,
          );

          if (isActive) {
            Alert.alert(
              'Unable to Load Request',
              error instanceof Error
                ? error.message
                : 'Unable to load this support request.',
              [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.goBack(),
                },
              ],
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadTicket();

      return () => {
        isActive = false;
      };
    }, [
      ticketId,
      navigation,
    ]),
  );

  const handleResolve =
    async () => {
      if (
        !ticket ||
        !reply.trim()
      ) {
        Alert.alert(
          'Reply Required',
          'Please write a reply before resolving this request.',
        );

        return;
      }

      Alert.alert(
        'Resolve Request?',
        'Your reply will be sent to the student and this request will be marked as resolved.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Resolve',
            onPress: () => {
              void resolveRequest();
            },
          },
        ],
      );
    };

  const resolveRequest =
    async () => {
      if (!ticket) {
        return;
      }

      try {
        setIsResolving(true);

        const updated =
          await updateSupportTicketAsStaff(
            ticket.id,
            {
              lecturerReply:
                reply.trim(),

              status:
                'RESOLVED',
            },
          );

        setTicket(updated);
        setIsResolved(true);
      } catch (error) {
        console.error(
          'Failed to resolve support request:',
          error,
        );

        Alert.alert(
          'Resolve Failed',
          error instanceof Error
            ? error.message
            : 'Unable to resolve this request.',
        );
      } finally {
        setIsResolving(false);
      }
    };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={styles.screen}>
        <ScreenHeader
          title="Student Request"
          onBackPress={() =>
            navigation.goBack()
          }
        />

        <View
          style={
            styles.loading
          }>
          <ActivityIndicator
            size="large"
            color={
              colors.accent
            }
          />

          <Text
            style={
              styles.loadingText
            }>
            Loading request...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return null;
  }

  if (isResolved) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={styles.screen}>
        <ScreenHeader
          title="Student Request"
          onBackPress={() =>
            navigation.goBack()
          }
        />

        <View
          style={
            styles.successContainer
          }>
          <View
            style={
              styles.successIcon
            }>
            <CheckCircle2
              size={42}
              strokeWidth={1.8}
              color={
                colors.accent
              }
            />
          </View>

          <Text
            style={
              styles.successTitle
            }>
            Request resolved
          </Text>

          <Text
            style={
              styles.successDescription
            }>
            Your reply has been
            submitted. The student can
            now view your response in
            My Support Requests.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.doneButton
            }>
            <Text
              style={
                styles.doneButtonText
              }>
              Back to Requests
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}>
      <ScreenHeader
        title="Reply to Student"
        onBackPress={() =>
          navigation.goBack()
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }>
        <View
          style={
            styles.pageTitleBlock
          }>
          <Text
            style={
              styles.kicker
            }>
            STUDENT REQUEST
          </Text>

          <Text
            style={
              styles.title
            }>
            {ticket.subject}
          </Text>

          <Text
            style={
              styles.createdAt
            }>
            Submitted{' '}
            {formatCreatedAt(
              ticket.created_at,
            )}
          </Text>
        </View>

        <View
          style={
            styles.questionCard
          }>
          <View
            style={
              styles.questionHeader
            }>
            <MessageSquareText
              size={18}
              strokeWidth={1.8}
              color={
                colors.accent
              }
            />

            <Text
              style={
                styles.questionLabel
              }>
              Student Question
            </Text>
          </View>

          <Text
            style={
              styles.questionText
            }>
            {ticket.message}
          </Text>
        </View>

        <View
          style={
            styles.replySection
          }>
          <Text
            style={
              styles.replyLabel
            }>
            Your Reply
          </Text>

          <Text
            style={
              styles.replyHelper
            }>
            This response will be shown
            to the student after you
            resolve the request.
          </Text>

          <TextInput
            editable={
              !isResolving
            }
            multiline
            value={reply}
            onChangeText={
              setReply
            }
            placeholder="Write your response..."
            placeholderTextColor={
              colors.secondaryText
            }
            style={
              styles.replyInput
            }
            textAlignVertical="top"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={
            isResolving ||
            !reply.trim()
          }
          onPress={
            handleResolve
          }
          style={[
            styles.resolveButton,

            (!reply.trim() ||
              isResolving) &&
              styles.disabled,
          ]}>
          {isResolving ? (
            <ActivityIndicator
              size="small"
              color={
                colors.primaryText
              }
            />
          ) : (
            <>
              <CheckCircle2
                size={18}
                strokeWidth={2}
                color={
                  colors.primaryText
                }
              />

              <Text
                style={
                  styles.resolveButtonText
                }>
                Resolve Request
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatCreatedAt(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleString(
    'en-MY',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    flexGrow: 1,
    padding:
      spacing.lg,
    paddingBottom: 40,
  },

  pageTitleBlock: {
    gap:
      spacing.xxs,
    marginBottom:
      spacing.xl,
  },

  kicker: {
    color:
      colors.secondaryText,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 16,
  },

  title: {
    ...typography.cardHeading,
    color:
      colors.primaryText,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },

  createdAt: {
    ...typography.small,
    color:
      colors.secondaryText,
    marginTop:
      spacing.xxs,
  },

  questionCard: {
    padding:
      spacing.lg,

    borderWidth: 1,

    borderColor:
      'rgba(189, 200, 206, 0.55)',

    borderRadius:
      radius.md,

    backgroundColor:
      colors.white,
  },

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  questionLabel: {
    ...typography.body,
    color:
      colors.primaryText,
    fontWeight: '700',
  },

  questionText: {
    ...typography.body,
    marginTop:
      spacing.md,
    color:
      colors.primaryText,
    lineHeight: 21,
  },

  replySection: {
    marginTop:
      spacing.xl,
  },

  replyLabel: {
    ...typography.body,
    color:
      colors.primaryText,
    fontWeight: '700',
  },

  replyHelper: {
    ...typography.small,
    marginTop:
      spacing.xxs,
    color:
      colors.secondaryText,
    lineHeight: 17,
  },

  replyInput: {
    minHeight: 200,

    marginTop:
      spacing.sm,

    padding:
      spacing.md,

    borderWidth: 1,

    borderColor:
      'rgba(189, 200, 206, 0.75)',

    borderRadius:
      radius.md,

    backgroundColor:
      colors.white,

    color:
      colors.primaryText,

    fontSize: 13,

    lineHeight: 20,
  },

  resolveButton: {
    minHeight: 48,

    marginTop:
      spacing.xl,

    borderRadius:
      radius.md,

    backgroundColor:
      colors.accent,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',

    gap:
      spacing.xs,
  },

  resolveButtonText: {
    ...typography.body,
    color:
      colors.primaryText,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.45,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
    gap:
      spacing.sm,
  },

  loadingText: {
    color:
      colors.secondaryText,
    fontSize: 12,
  },

  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
    padding:
      spacing.xl,
  },

  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,

    backgroundColor:
      colors.softCyan,

    alignItems: 'center',
    justifyContent:
      'center',

    marginBottom:
      spacing.lg,
  },

  successTitle: {
    ...typography.cardHeading,
    color:
      colors.primaryText,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  successDescription: {
    ...typography.body,
    marginTop:
      spacing.sm,
    color:
      colors.secondaryText,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },

  doneButton: {
    minHeight: 46,
    width: '100%',

    marginTop:
      spacing.xl,

    borderRadius:
      radius.md,

    backgroundColor:
      colors.accent,

    alignItems: 'center',
    justifyContent:
      'center',
  },

  doneButtonText: {
    ...typography.body,
    color:
      colors.primaryText,
    fontWeight: '700',
  },
});