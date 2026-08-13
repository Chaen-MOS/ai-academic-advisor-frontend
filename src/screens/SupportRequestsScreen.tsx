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
  ChevronRight,
  MessageSquareText,
  UserRound,
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
    'SupportRequests'
  >;

export default function SupportRequestsScreen({
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

  const [
    takingOverId,
    setTakingOverId,
  ] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadTickets() {
        try {
          setIsLoading(true);

          const result =
            await getStaffSupportTickets();

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
                : 'Unable to load support requests.',
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

  const handlePressTicket = (
    ticket: SupportTicket,
  ) => {
    if (
      ticket.status === 'RESOLVED'
    ) {
      Alert.alert(
        'Request Resolved',
        'This request has already been resolved.',
      );

      return;
    }

    if (
      ticket.status === 'IN_PROGRESS'
    ) {
      navigation.navigate(
        'SupportReply',
        {
          ticketId: ticket.id,
        },
      );

      return;
    }

    Alert.alert(
      'Take Over Request?',
      'This request will be assigned to you.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Over',
          onPress: () => {
            void handleTakeOver(
              ticket,
            );
          },
        },
      ],
    );
  };

  const handleTakeOver = async (
    ticket: SupportTicket,
  ) => {
    try {
      setTakingOverId(
        ticket.id,
      );

      const updatedTicket =
        await updateSupportTicketAsStaff(
          ticket.id,
          {
            assignToMe: true,
          },
        );

      setTickets(current =>
        current.map(item =>
          item.id ===
          updatedTicket.id
            ? updatedTicket
            : item,
        ),
      );

      navigation.navigate(
        'SupportReply',
        {
          ticketId:
            updatedTicket.id,
        },
      );
    } catch (error) {
      Alert.alert(
        'Take Over Failed',
        error instanceof Error
          ? error.message
          : 'Unable to take over this request.',
      );
    } finally {
      setTakingOverId(null);
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}>
      <ScreenHeader
        title="Support Requests"
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
          <View
            style={
              styles.pageTitleBlock
            }>
            <Text
              style={
                styles.kicker
              }>
              STUDENT REQUESTS
            </Text>

            <Text
              style={
                styles.title
              }>
              Support Queue
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Select an open request
              to take ownership and
              reply to the student.
            </Text>
          </View>

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
                New student requests
                will appear here.
              </Text>
            </View>
          ) : (
            tickets.map(ticket => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isTakingOver={
                  takingOverId ===
                  ticket.id
                }
                onPress={() =>
                  handlePressTicket(
                    ticket,
                  )
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TicketRow({
  ticket,
  isTakingOver,
  onPress,
}: {
  ticket: SupportTicket;
  isTakingOver: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${ticket.subject}`}
      disabled={isTakingOver}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        pressed &&
          styles.pressed,
        isTakingOver &&
          styles.disabled,
      ]}>
      <View
        style={
          styles.cardTop
        }>
        <View
          style={
            styles.cardContent
          }>
          <Text
            numberOfLines={1}
            style={
              styles.subject
            }>
            {ticket.subject}
          </Text>

          <Text
            numberOfLines={2}
            style={
              styles.preview
            }>
            {ticket.message}
          </Text>
        </View>

        <StatusBadge
          status={
            ticket.status
          }
        />
      </View>

      <View
        style={
          styles.footer
        }>
        <View
          style={
            styles.footerInfo
          }>
          <Text
            style={
              styles.createdAt
            }>
            {formatCreatedAt(
              ticket.created_at,
            )}
          </Text>

          {ticket.assignedToName ? (
            <View
              style={
                styles.assignedRow
              }>
              <UserRound
                size={12}
                color={
                  colors.secondaryText
                }
              />

              <Text
                style={
                  styles.assignedText
                }>
                {
                  ticket.assignedToName
                }
              </Text>
            </View>
          ) : null}
        </View>

        {isTakingOver ? (
          <ActivityIndicator
            size="small"
            color={colors.accent}
          />
        ) : (
          <ChevronRight
            size={18}
            color={
              colors.secondaryText
            }
          />
        )}
      </View>
    </Pressable>
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

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      padding:
        spacing.lg,
      paddingBottom: 40,
    },

    pageTitleBlock: {
      gap: spacing.xxs,
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

    subtitle: {
      ...typography.body,
      color:
        colors.secondaryText,
      fontSize: 12,
      lineHeight: 18,
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
      padding:
        spacing.md,

      marginBottom:
        spacing.md,

      borderWidth: 1,

      borderColor:
        'rgba(189, 200, 206, 0.55)',

      borderRadius:
        radius.md,

      backgroundColor:
        colors.white,
    },

    cardTop: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: spacing.sm,
    },

    cardContent: {
      flex: 1,
      minWidth: 0,
    },

    subject: {
      ...typography.body,
      color:
        colors.primaryText,
      fontWeight: '700',
    },

    preview: {
      ...typography.small,
      marginTop:
        spacing.xxs,
      color:
        colors.secondaryText,
      lineHeight: 17,
    },

    statusBadge: {
      minHeight: 22,
      justifyContent:
        'center',
      paddingHorizontal: 8,
      borderRadius:
        radius.pill,
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

    footer: {
      marginTop:
        spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    footerInfo: {
      flex: 1,
      gap: 4,
    },

    createdAt: {
      ...typography.small,
      color:
        colors.secondaryText,
    },

    assignedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    assignedText: {
      ...typography.small,
      color:
        colors.secondaryText,
    },

    emptyState: {
      minHeight: 320,
      alignItems: 'center',
      justifyContent:
        'center',
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
    },

    pressed: {
      opacity: 0.72,
    },

    disabled: {
      opacity: 0.5,
    },
  });