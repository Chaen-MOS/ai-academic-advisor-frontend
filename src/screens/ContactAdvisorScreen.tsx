import React, {
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CheckCircle2,
  Mail,
} from 'lucide-react-native';

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
  PrimaryButton,
} from '../components/common/PrimaryButton';

import {
  createSupportTicket,
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

type ContactAdvisorScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    'ContactAdvisor'
  >;

export default function ContactAdvisorScreen({
  navigation,
}: ContactAdvisorScreenProps) {
  const [
    subject,
    setSubject,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isSubmitted,
    setIsSubmitted,
  ] = useState(false);

  const envelopeTranslateX =
    useRef(
      new Animated.Value(0),
    ).current;

  const envelopeTranslateY =
    useRef(
      new Animated.Value(0),
    ).current;

  const envelopeScale =
    useRef(
      new Animated.Value(1),
    ).current;

  const envelopeOpacity =
    useRef(
      new Animated.Value(1),
    ).current;

  const successOpacity =
    useRef(
      new Animated.Value(0),
    ).current;

  const canSubmit =
    subject.trim().length > 0 &&
    message.trim().length > 0 &&
    !isSubmitting;

  const animateSubmission =
    () => {
      Animated.parallel([
        Animated.timing(
          envelopeTranslateX,
          {
            toValue: 85,
            duration: 650,
            easing:
              Easing.in(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          envelopeTranslateY,
          {
            toValue: -140,
            duration: 650,
            easing:
              Easing.in(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          envelopeScale,
          {
            toValue: 0.55,
            duration: 650,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          envelopeOpacity,
          {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        setIsSubmitted(true);

        Animated.timing(
          successOpacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ).start();
      });
    };

  const handleSubmit =
    async () => {
      if (!canSubmit) {
        return;
      }

      try {
        setIsSubmitting(true);

        await createSupportTicket({
          subject:
            subject.trim(),

          message:
            message.trim(),
        });

        animateSubmission();
      } catch (error) {
        console.error(
          'Support ticket submission failed:',
          error,
        );

        Alert.alert(
          'Submission Failed',
          error instanceof Error
            ? error.message
            : 'Unable to submit your question.',
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  if (isSubmitted) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={styles.screen}>
        <ScreenHeader
          title="Contact Advisor"
          onBackPress={() =>
            navigation.goBack()
          }
        />

        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity:
                successOpacity,
            },
          ]}>
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
            Your question has been
            submitted.
          </Text>

          <Text
            style={
              styles.successDescription
            }>
            Please wait for a reply
            from a lecturer or academic
            advisor. You can check the
            status of your request at
            any time.
          </Text>

          <View
            style={
              styles.successActions
            }>
            <PrimaryButton
              label="View My Requests"
              accessibilityLabel="View my support requests"
              onPress={() =>
                navigation.navigate(
                  'MySupportRequests',
                )
              }
              variant="accent"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to chat"
              onPress={() =>
                navigation.navigate(
                  'Home',
                )
              }
              style={
                styles.secondaryButton
              }>
              <Text
                style={
                  styles.secondaryButtonText
                }>
                Back to Chat
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}>
      <ScreenHeader
        title="Contact Advisor"
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
            styles.intro
          }>
          <Animated.View
            style={[
              styles.envelopeCircle,
              {
                opacity:
                  envelopeOpacity,

                transform: [
                  {
                    translateX:
                      envelopeTranslateX,
                  },
                  {
                    translateY:
                      envelopeTranslateY,
                  },
                  {
                    scale:
                      envelopeScale,
                  },
                ],
              },
            ]}>
            <Mail
              size={34}
              strokeWidth={1.8}
              color={
                colors.accent
              }
            />
          </Animated.View>

          <Text
            style={
              styles.title
            }>
            Leave your question
          </Text>

          <Text
            style={
              styles.description
            }>
            Tell us what you need help
            with. A lecturer or academic
            advisor will review your
            request and reply when
            available.
          </Text>
        </View>

        <View
          style={
            styles.form
          }>
          <Text
            style={
              styles.label
            }>
            Subject
          </Text>

          <TextInput
            editable={
              !isSubmitting
            }
            value={subject}
            onChangeText={
              setSubject
            }
            placeholder="e.g. Course overload request"
            placeholderTextColor={
              colors.secondaryText
            }
            style={
              styles.subjectInput
            }
          />

          <Text
            style={[
              styles.label,
              styles.questionLabel,
            ]}>
            Your Question
          </Text>

          <TextInput
            editable={
              !isSubmitting
            }
            multiline
            value={message}
            onChangeText={
              setMessage
            }
            placeholder="Describe your question or concern..."
            placeholderTextColor={
              colors.secondaryText
            }
            style={
              styles.messageInput
            }
            textAlignVertical="top"
          />
        </View>

        <View
          style={
            styles.infoCard
          }>
          <Text
            style={
              styles.infoText
            }>
            Your request will be sent
            securely to the support
            team. You can track replies
            in My Support Requests.
          </Text>
        </View>

        <View
          style={
            styles.actions
          }>
          <PrimaryButton
            label={
              isSubmitting
                ? 'Submitting...'
                : 'Submit Question'
            }
            accessibilityLabel="Submit question"
            onPress={
              handleSubmit
            }
            variant="accent"
            disabled={
              !canSubmit
            }
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to chat"
            disabled={
              isSubmitting
            }
            onPress={() =>
              navigation.navigate(
                'Home',
              )
            }
            style={
              styles.secondaryButton
            }>
            <Text
              style={
                styles.secondaryButtonText
              }>
              Back to Chat
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
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
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: 40,
    },

    intro: {
      alignItems: 'center',
      paddingTop:
        spacing.lg,
    },

    envelopeCircle: {
      width: 82,
      height: 82,
      borderRadius: 41,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        colors.softCyan,
      marginBottom:
        spacing.lg,
    },

    title: {
      ...typography.authHeading,
      color:
        colors.primaryText,
      textAlign: 'center',
    },

    description: {
      ...typography.body,
      color:
        colors.secondaryText,
      textAlign: 'center',
      marginTop:
        spacing.xs,
      maxWidth: 320,
    },

    form: {
      marginTop:
        spacing.xl,
    },

    label: {
      ...typography.small,
      color:
        colors.primaryText,
      fontWeight: '700',
      marginBottom:
        spacing.xs,
    },

    questionLabel: {
      marginTop:
        spacing.lg,
    },

    subjectInput: {
      minHeight: 46,
      borderWidth: 1,
      borderColor:
        colors.divider,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.cardBackground,
      paddingHorizontal:
        spacing.md,
      color:
        colors.primaryText,
      fontSize: 13,
    },

    messageInput: {
      minHeight: 180,
      borderWidth: 1,
      borderColor:
        colors.divider,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.cardBackground,
      padding:
        spacing.md,
      color:
        colors.primaryText,
      fontSize: 13,
      lineHeight: 20,
    },

    infoCard: {
      marginTop:
        spacing.lg,
      padding:
        spacing.md,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.softCyan,
    },

    infoText: {
      ...typography.small,
      color:
        colors.secondaryText,
      lineHeight: 17,
    },

    actions: {
      marginTop: 'auto',
      paddingTop:
        spacing.xl,
      gap: spacing.md,
    },

    secondaryButton: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    secondaryButtonText: {
      ...typography.body,
      color:
        colors.accent,
      fontWeight: '700',
    },

    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      padding: spacing.xl,
    },

    successIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        colors.softCyan,
      marginBottom:
        spacing.lg,
    },

    successTitle: {
      ...typography.authHeading,
      color:
        colors.primaryText,
      textAlign: 'center',
      maxWidth: 300,
    },

    successDescription: {
      ...typography.body,
      color:
        colors.secondaryText,
      textAlign: 'center',
      lineHeight: 21,
      marginTop:
        spacing.sm,
      maxWidth: 320,
    },

    successActions: {
      width: '100%',
      marginTop:
        spacing.xl,
      gap: spacing.md,
    },
  });