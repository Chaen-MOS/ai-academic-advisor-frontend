import React from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  GraduationCap,
  MoreVertical,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import {colors} from '../../theme';

import {
  KnowledgeStatusBadge,
} from './KnowledgeStatusBadge';

import type {
  KnowledgeDocument,
  KnowledgeAccessRole,
} from '../../services/knowledgeApi';

type KnowledgeDocumentRowProps = {
  document: KnowledgeDocument;
  isLast: boolean;

  onOpenMenu: (
    document: KnowledgeDocument,
  ) => void;

  onToggle: (
    documentId: string,
    value: boolean,
  ) => void;
};

const knowledgeColors = {
  divider: '#ECF0F1',
  muted: '#6D797E',
  switchOnTrack: '#B8E8EF',
  switchOffTrack: '#E5EAEB',
  switchOffThumb: '#D3DCDB',
  iconMuted: '#9AA6AA',
};

export function KnowledgeDocumentRow({
  document,
  isLast,
  onOpenMenu,
  onToggle,
}: KnowledgeDocumentRowProps) {
  const isDimmed =
    !document.is_enabled;

  const displayName =
    document.title ||
    document.file_name;

  const cannotToggle =
    document.processing_status ===
      'PROCESSING' ||
    document.processing_status ===
      'PENDING' ||
    document.processing_status ===
      'FAILED';

  return (
    <View
      style={[
        styles.documentRow,
        isLast &&
          styles.documentRowLast,
      ]}>
      <View
        style={[
          styles.documentInfo,
          isDimmed &&
            styles.dimmed,
        ]}>
        <Text
          numberOfLines={1}
          style={styles.documentName}>
          {displayName}
        </Text>

        <View
          style={styles.documentMeta}>
          <Text
            style={styles.uploadDate}>
            {formatUploadDate(
              document.created_at,
            )}
          </Text>

          <KnowledgeStatusBadge
            isEnabled={
              document.is_enabled
            }
            processingStatus={
              document.processing_status
            }
          />
          <RoleIndicators
            roles={document.accessible_roles}
            />
        </View>
      </View>

      <View
        style={styles.rowActions}>
        <Switch
          accessibilityLabel={`${displayName} enabled`}
          accessibilityRole="switch"
          accessibilityState={{
            checked:
              document.is_enabled,
            disabled:
              cannotToggle,
          }}
          disabled={cannotToggle}
          ios_backgroundColor={
            knowledgeColors.switchOffTrack
          }
          onValueChange={value =>
            onToggle(
              document.id,
              value,
            )
          }
          thumbColor={
            document.is_enabled
              ? colors.accent
              : knowledgeColors.switchOffThumb
          }
          trackColor={{
            false:
              knowledgeColors.switchOffTrack,
            true:
              knowledgeColors.switchOnTrack,
          }}
          value={
            document.is_enabled
          }
          style={styles.switch}
        />

        <Pressable
          accessibilityLabel={`Open menu for ${displayName}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() =>
            onOpenMenu(document)
          }
          style={
            styles.moreButton
          }>
          <MoreVertical
            color={
              knowledgeColors.muted
            }
            size={20}
            strokeWidth={2.5}
          />
        </Pressable>
      </View>
    </View>
  );
}

function formatUploadDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function RoleIndicators({
  roles,
}: {
  roles: KnowledgeAccessRole[];
}) {
  const roleIcons = [
    {
      role: 'STUDENT' as const,
      Icon: UserRound,
    },
    {
      role: 'ADMIN' as const,
      Icon: ShieldCheck,
    },
    {
      role: 'LECTURER' as const,
      Icon: GraduationCap,
    },
  ];

  return (
    <View style={styles.roleIndicators}>
      {roleIcons.map(({role, Icon}) => {
        const hasAccess =
          roles.includes(role);

        return (
          <Icon
            key={role}
            size={13}
            strokeWidth={2}
            color={
              hasAccess
                ? colors.accent
                : knowledgeColors.iconMuted
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  documentRow: {
    alignItems: 'center',
    borderBottomColor:
      knowledgeColors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    minHeight: 72,
    paddingVertical: 12,
  },

  documentRowLast: {
    borderBottomWidth: 0,
  },

  documentInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  dimmed: {
    opacity: 0.72,
  },

  documentName: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginBottom: 5,
  },

  documentMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  uploadDate: {
    color:
      colors.secondaryText,
    fontSize: 11,
    lineHeight: 16,
  },

  rowActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  switch: {
    transform: [
      {scaleX: 0.72},
      {scaleY: 0.72},
    ],
  },

  moreButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 24,
  },
  roleIndicators: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
});