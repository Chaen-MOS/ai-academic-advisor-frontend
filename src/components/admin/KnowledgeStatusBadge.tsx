import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RotateCw} from 'lucide-react-native';

import {colors} from '../../theme';

export type KnowledgeDocumentProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

type KnowledgeStatusBadgeProps = {
  processingStatus:
    KnowledgeDocumentProcessingStatus;
  isEnabled: boolean;
};

const knowledgeColors = {
  readyBackground: '#DDF8FB',
  processingBackground: '#E6ECEC',
  disabledBackground: '#E8EEEE',
  errorBackground: '#FFDAD6',
  errorText: '#93000A',
  muted: '#6D797E',
};

export function KnowledgeStatusBadge({
  processingStatus,
  isEnabled,
}: KnowledgeStatusBadgeProps) {
  if (
    processingStatus === 'READY' &&
    !isEnabled
  ) {
    return (
      <View
        style={[
          styles.statusBadge,
          styles.disabledBadge,
        ]}>
        <Text
          style={[
            styles.statusBadgeText,
            styles.disabledBadgeText,
          ]}>
          DISABLED
        </Text>
      </View>
    );
  }

  const badgeStyles = {
    PENDING: styles.processingBadge,
    PROCESSING: styles.processingBadge,
    READY: styles.readyBadge,
    FAILED: styles.failedBadge,
  };

  const textStyles = {
    PENDING: styles.processingBadgeText,
    PROCESSING:
      styles.processingBadgeText,
    READY: styles.readyBadgeText,
    FAILED: styles.failedBadgeText,
  };

  return (
    <View
      style={[
        styles.statusBadge,
        badgeStyles[
          processingStatus
        ],
      ]}>
      {processingStatus ===
        'PROCESSING' ||
      processingStatus ===
        'PENDING' ? (
        <RotateCw
          color={
            knowledgeColors.muted
          }
          size={9}
          strokeWidth={2.4}
        />
      ) : null}

      <Text
        style={[
          styles.statusBadgeText,
          textStyles[
            processingStatus
          ],
        ]}>
        {processingStatus}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    minHeight: 17,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 11,
  },

  readyBadge: {
    backgroundColor:
      knowledgeColors.readyBackground,
  },

  processingBadge: {
    backgroundColor:
      knowledgeColors.processingBackground,
  },

  disabledBadge: {
    backgroundColor:
      knowledgeColors.disabledBackground,
  },

  failedBadge: {
    backgroundColor:
      knowledgeColors.errorBackground,
  },

  readyBadgeText: {
    color: colors.accent,
  },

  processingBadgeText: {
    color: colors.secondaryText,
  },

  disabledBadgeText: {
    color: knowledgeColors.muted,
  },

  failedBadgeText: {
    color: knowledgeColors.errorText,
  },
});