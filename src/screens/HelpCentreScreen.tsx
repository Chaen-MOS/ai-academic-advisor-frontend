import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  MessageCircle,
  MessagesSquare,
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
    'HelpCentre'
  >;

export default function HelpCentreScreen({
  navigation,
}: Props) {
  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}>
      <ScreenHeader
        title="Help Centre"
        onBackPress={() =>
          navigation.goBack()
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        <View style={styles.intro}>
          <View style={styles.iconBox}>
            <CircleHelp
              size={25}
              color={colors.accent}
            />
          </View>

          <Text style={styles.title}>
            How can we help?
          </Text>

          <Text style={styles.description}>
            Contact someone for additional support.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          HELP & GUIDANCE
        </Text>

        <HelpRow
          icon={BookOpen}
          title="Academic Questions"
          description="Ask the AI advisor"
          onPress={() =>
            navigation.navigate('Home')
          }
        />

        <HelpRow
          icon={MessageCircle}
          title="Contact Advisor"
          description="Send a support request"
          onPress={() =>
            navigation.navigate(
              'ContactAdvisor',
            )
          }
        />

        <Text style={styles.sectionTitle}>
          SUPPORT REQUESTS
        </Text>

        <HelpRow
          icon={MessagesSquare}
          title="My Support Requests"
          description="View your support requests."
          onPress={() =>
            navigation.navigate(
              'MySupportRequests',
            )
          }
        />

      </ScrollView>
    </SafeAreaView>
  );
}

type HelpRowProps = {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
  onPress: () => void;
};

function HelpRow({
  icon: Icon,
  title,
  description,
  onPress,
}: HelpRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        pressed && styles.pressed,
      ]}>
      <View style={styles.rowIcon}>
        <Icon
          size={20}
          strokeWidth={1.8}
          color={colors.accent}
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowDescription}>
          {description}
        </Text>
      </View>

      <ChevronRight
        size={18}
        color={colors.secondaryText}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  intro: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.softCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  title: {
    ...typography.authHeading,
    color: colors.primaryText,
    textAlign: 'center',
  },

  description: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 300,
  },

  sectionTitle: {
    ...typography.small,
    color: colors.secondaryText,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  row: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardBackground,
  },

  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.softCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowContent: {
    flex: 1,
  },

  rowTitle: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
  },

  rowDescription: {
    ...typography.small,
    color: colors.secondaryText,
    marginTop: spacing.xxs,
    lineHeight: 17,
  },

  pressed: {
    opacity: 0.72,
  },
});