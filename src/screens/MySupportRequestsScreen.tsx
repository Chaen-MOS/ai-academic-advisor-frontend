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
  View,
} from 'react-native';

import {
  CheckCircle2,
  Clock3,
  MessageSquareText,
  MoreVertical,
  UserRound,
} from 'lucide-react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ScreenHeader,
} from '../components/common/ScreenHeader';

import {
  deleteSupportTicket,
  getMySupportTickets,
  resolveSupportTicket,
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
    'MySupportRequests'
  >;

export default function MySupportRequestsScreen({
  navigation,
}: Props) {
  const [
    tickets,
    setTickets,
  ] = useState<SupportTicket[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadTickets() {
        try {
          setIsLoading(true);

          const result =
            await getMySupportTickets();

          if (isActive) {
            setTickets(result);
          }
        } catch (error) {
          console.error(
            'Failed to load support requests:',
            error,
          );

          if (isActive) {
            Alert.alert(
              'Unable to Load Requests',
              error instanceof Error
                ? error.message
                : 'Unable to load your support requests.',
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadTickets();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleOpenMenu = (
    ticket: SupportTicket,
  ) => {
    const actions: any[] = [];

    if (
      ticket.status !==
      'RESOLVED'
    ) {
      actions.push({
        text: 'Mark as Resolved',
        onPress: () =>
          confirmResolve(ticket),
      });
    }

    actions.push(
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          confirmDelete(ticket),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    );

    Alert.alert(
      ticket.subject,
      'Choose an action.',
      actions,
    );
  };

  const confirmResolve = (
    ticket: SupportTicket,
  ) => {
    Alert.alert(
      'Mark as Resolved?',
      'This request will be marked as solved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark Resolved',
          onPress: () => {
            void handleResolve(ticket);
          },
        },
      ],
    );
  };

  const handleResolve = async (
    ticket: SupportTicket,
  ) => {
    try {
      const updatedTicket =
        await resolveSupportTicket(
          ticket.id,
        );

      setTickets(current =>
        current.map(item =>
          item.id ===
          updatedTicket.id
            ? {
                ...updatedTicket,
                assignedToName:
                  ticket.assignedToName,
              }
            : item,
        ),
      );
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error instanceof Error
          ? error.message
          : 'Unable to resolve this request.',
      );
    }
  };

  const confirmDelete = (
    ticket: SupportTicket,
  ) => {
    Alert.alert(
      'Delete Request?',
      `Delete "${ticket.subject}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void handleDelete(
              ticket,
            );
          },
        },
      ],
    );
  };

  const handleDelete = async (
    ticket: SupportTicket,
  ) => {
    try {
      await deleteSupportTicket(
        ticket.id,
      );

      setTickets(current =>
        current.filter(
          item =>
            item.id !==
            ticket.id,
        ),
      );
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error instanceof Error
          ? error.message
          : 'Unable to delete this request.',
      );
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}>
      <ScreenHeader
        title="My Support Requests"
        onBackPress={() =>
          navigation.goBack()
        }
      />

      {isLoading ? (
        <View
          style={styles.loading}>
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
            Loading requests...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }>
          {tickets.length === 0 ? (
            <View
              style={
                styles.emptyState
              }>
              <MessageSquareText
                size={34}
                strokeWidth={1.7}
                color={
                  colors.secondaryText
                }
              />

              <Text
                style={
                  styles.emptyTitle
                }>
                No support requests
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                Questions you send to an
                advisor will appear here.
              </Text>

              <Pressable
                onPress={() =>
                  navigation.navigate(
                    'ContactAdvisor',
                  )
                }
                style={
                  styles.askButton
                }>
                <Text
                  style={
                    styles.askButtonText
                  }>
                  Ask a Question
                </Text>
              </Pressable>
            </View>
          ) : (
            tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpenMenu={
                  handleOpenMenu
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TicketCard({
  ticket,
  onOpenMenu,
}: {
  ticket: SupportTicket;
  onOpenMenu: (
    ticket: SupportTicket,
  ) => void;
}) {
  const handlerLabel =
    ticket.status ===
    'RESOLVED'
      ? 'Solved by'
      : 'Assigned to';

  return (
    <View
      style={styles.card}>
      <View
        style={styles.cardTop}>
        <View style={styles.flex}>
          <Text
            style={
              styles.subject
            }>
            {ticket.subject}
          </Text>

          <Text
            style={
              styles.createdAt
            }>
            {formatCreatedAt(
              ticket.created_at,
            )}
          </Text>
        </View>

        <StatusBadge
          status={
            ticket.status
          }
        />

        <Pressable
          hitSlop={8}
          onPress={() =>
            onOpenMenu(ticket)
          }
          style={
            styles.moreButton
          }>
          <MoreVertical
            size={19}
            color={
              colors.secondaryText
            }
          />
        </Pressable>
      </View>

      <View
        style={
          styles.messageBlock
        }>
        <Text
          style={
            styles.blockLabel
          }>
          Your question
        </Text>

        <Text
          style={
            styles.messageText
          }>
          {ticket.message}
        </Text>
      </View>

      {ticket.assignedToName ? (
        <View
          style={
            styles.metaRow
          }>
          <UserRound
            size={14}
            color={
              colors.secondaryText
            }
          />

          <Text
            style={
              styles.metaText
            }>
            {handlerLabel}:{' '}
            {ticket.assignedToName}
          </Text>
        </View>
      ) : ticket.status ===
        'OPEN' ? (
        <View
          style={
            styles.metaRow
          }>
          <Clock3
            size={14}
            color={
              colors.secondaryText
            }
          />

          <Text
            style={
              styles.metaText
            }>
            Waiting for lecturer
          </Text>
        </View>
      ) : null}

      {ticket.lecturer_reply ? (
        <View
          style={
            styles.replyBlock
          }>
          <Text
            style={
              styles.replyLabel
            }>
            Advisor reply
          </Text>

          <Text
            style={
              styles.replyText
            }>
            {
              ticket.lecturer_reply
            }
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function StatusBadge({
  status,
}: {
  status:
    SupportTicket['status'];
}) {
  const label =
    status === 'IN_PROGRESS'
      ? 'IN PROGRESS'
      : status;

  return (
    <View
      style={[
        styles.statusBadge,
        status === 'OPEN' &&
          styles.openBadge,
        status ===
          'IN_PROGRESS' &&
          styles.progressBadge,
        status ===
          'RESOLVED' &&
          styles.resolvedBadge,
      ]}>
      {status === 'RESOLVED' ? (
        <CheckCircle2
          size={10}
          strokeWidth={2.4}
          color={colors.accent}
        />
      ) : null}

      <Text
        style={
          styles.statusText
        }>
        {label}
      </Text>
    </View>
  );
}

function formatCreatedAt(
  value: string,
) {
  const date =
    new Date(value);

  return date.toLocaleString(
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

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    flex: {
      flex: 1,
    },

    content: {
      padding: spacing.lg,
      paddingBottom: 40,
    },

    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      gap: spacing.sm,
    },

    loadingText: {
      color:
        colors.secondaryText,
      fontSize: 12,
    },

    card: {
      padding: spacing.md,
      marginBottom:
        spacing.md,
      borderRadius:
        radius.lg,
      borderWidth: 1,
      borderColor:
        colors.divider,
      backgroundColor:
        colors.cardBackground,
    },

    cardTop: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: spacing.xs,
    },

    subject: {
      ...typography.body,
      color:
        colors.primaryText,
      fontWeight: '700',
    },

    createdAt: {
      ...typography.small,
      marginTop:
        spacing.xxs,
      color:
        colors.secondaryText,
    },

    statusBadge: {
      minHeight: 22,
      paddingHorizontal: 8,
      borderRadius:
        radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },

    openBadge: {
      backgroundColor:
        '#F2F5F5',
    },

    progressBadge: {
      backgroundColor:
        colors.softCyan,
    },

    resolvedBadge: {
      backgroundColor:
        colors.softCyan,
    },

    statusText: {
      color:
        colors.primaryText,
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.5,
    },

    moreButton: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    messageBlock: {
      marginTop:
        spacing.md,
    },

    blockLabel: {
      ...typography.small,
      color:
        colors.secondaryText,
      fontWeight: '700',
    },

    messageText: {
      ...typography.body,
      marginTop:
        spacing.xxs,
      color:
        colors.primaryText,
      lineHeight: 19,
    },

    metaRow: {
      marginTop:
        spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    metaText: {
      ...typography.small,
      color:
        colors.secondaryText,
    },

    replyBlock: {
      marginTop:
        spacing.md,
      padding: spacing.md,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.softCyan,
    },

    replyLabel: {
      ...typography.small,
      color:
        colors.primaryText,
      fontWeight: '700',
    },

    replyText: {
      ...typography.body,
      marginTop:
        spacing.xxs,
      color:
        colors.primaryText,
      lineHeight: 19,
    },

    emptyState: {
      minHeight: 420,
      alignItems: 'center',
      justifyContent:
        'center',
      padding: spacing.xl,
    },

    emptyTitle: {
      marginTop:
        spacing.md,
      color:
        colors.primaryText,
      fontSize: 14,
      fontWeight: '700',
    },

    emptyText: {
      marginTop:
        spacing.xs,
      color:
        colors.secondaryText,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
    },

    askButton: {
      minHeight: 42,
      marginTop:
        spacing.lg,
      paddingHorizontal:
        spacing.lg,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius:
        radius.md,
      backgroundColor:
        colors.accent,
    },

    askButtonText: {
      color:
        colors.primaryText,
      fontSize: 12,
      fontWeight: '700',
    },
  });