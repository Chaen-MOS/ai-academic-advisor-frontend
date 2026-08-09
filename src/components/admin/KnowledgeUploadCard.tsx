import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Check,
  CloudUpload,
  FileText,
  GraduationCap,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
} from '../../theme';

export type SelectedPdf = {
  name: string;
  uri: string;
  type: string;
  size: number | null;
};

type KnowledgeUploadCardProps = {
  selectedPdf: SelectedPdf | null;

  isUploading: boolean;

  accessibleStudents: boolean;
  accessibleAdmins: boolean;
  accessibleLecturers: boolean;

  onChooseFile: () => void;
  onUpload: () => void;

  onToggleStudents: () => void;
  onToggleAdmins: () => void;
  onToggleLecturers: () => void;
};

const knowledgeColors = {
  outline: '#BDC8CE',
  muted: '#6D797E',
  iconMuted: '#9AA6AA',
};

export function KnowledgeUploadCard({
  selectedPdf,
  isUploading,
  accessibleStudents,
  accessibleAdmins,
  accessibleLecturers,
  onChooseFile,
  onUpload,
  onToggleStudents,
  onToggleAdmins,
  onToggleLecturers,
}: KnowledgeUploadCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        Upload New PDF
      </Text>

      <View style={styles.uploadDropzone}>
        {isUploading ? (
            <View style={styles.uploadingState}>
            <ActivityIndicator
                size="large"
                color={colors.accent}
            />

            <Text style={styles.uploadingTitle}>
                Processing PDF...
            </Text>

            <Text style={styles.uploadingText}>
                Uploading and preparing this document
                for the AI knowledge base.
            </Text>
            </View>
        ) : (
            <>
            <View style={styles.pdfIconBox}>
                <FileText
                color={colors.accent}
                fill={colors.accent}
                size={30}
                strokeWidth={2}
                />

                <Text style={styles.pdfIconText}>
                PDF
                </Text>
            </View>

            {selectedPdf ? (
                <>
                <Text
                    numberOfLines={1}
                    style={styles.selectedFileName}>
                    {selectedPdf.name}
                </Text>

                <Text style={styles.fileSize}>
                    {formatFileSize(
                    selectedPdf.size,
                    )}
                </Text>
                </>
            ) : (
                <>
                <Text style={styles.selectedFileName}>
                    Select a PDF document
                </Text>

                <Text style={styles.fileSize}>
                    PDF files only
                </Text>
                </>
            )}

            <Pressable
                accessibilityLabel={
                selectedPdf
                    ? 'Change selected PDF file'
                    : 'Choose PDF file'
                }
                accessibilityRole="button"
                disabled={isUploading}
                onPress={onChooseFile}
                style={styles.changeFileButton}>
                <Text style={styles.changeFileText}>
                {selectedPdf
                    ? 'Change File'
                    : 'Choose File'}
                </Text>
            </Pressable>
            </>
        )}
        </View>

      <View style={styles.accessHeader}>
        <Text style={styles.label}>
          Accessible To
        </Text>

        <Text style={styles.helperText}>
          You can select multiple options
        </Text>
      </View>

      <View style={styles.roleGrid}>
        <RoleOption
          icon="student"
          label="Students"
          selected={
            accessibleStudents
          }
          onPress={
            onToggleStudents
          }
        />

        <RoleOption
          icon="admin"
          label="Admins"
          selected={
            accessibleAdmins
          }
          onPress={
            onToggleAdmins
          }
        />

        <RoleOption
          icon="lecturer"
          label="Lecturers"
          selected={
            accessibleLecturers
          }
          onPress={
            onToggleLecturers
          }
        />
      </View>

      <Pressable
        accessibilityLabel="Upload PDF"
        accessibilityRole="button"
        accessibilityState={{
          disabled: !selectedPdf || isUploading
        }}
        disabled={
          !selectedPdf ||
          isUploading
        }
        onPress={onUpload}
        style={({pressed}) => [
        styles.uploadButton,
        (!selectedPdf || isUploading) &&
            styles.uploadButtonDisabled,
        pressed &&
            selectedPdf &&
            !isUploading &&
            styles.pressed,
        ]}>
        <CloudUpload
          color={colors.primaryText}
          size={18}
          strokeWidth={2}
        />

        <Text style={styles.uploadButtonText}>
        {isUploading
            ? 'Uploading...'
            : 'Upload PDF'}
        </Text>
      </Pressable>
    </View>
  );
}

function RoleOption({
  icon,
  label,
  onPress,
  selected,
}: {
  icon:
    | 'student'
    | 'admin'
    | 'lecturer';
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const Icon =
    icon === 'student'
      ? UserRound
      : icon === 'admin'
        ? ShieldCheck
        : GraduationCap;

  const iconColor = selected
    ? colors.accent
    : knowledgeColors.iconMuted;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={[
        styles.roleOption,
        !selected &&
          styles.roleOptionInactive,
      ]}>
      <View
        style={[
          styles.checkbox,
          selected &&
            styles.checkboxSelected,
        ]}>
        {selected ? (
          <Check
            color={colors.white}
            size={12}
            strokeWidth={3}
          />
        ) : null}
      </View>

      <Icon
        color={iconColor}
        size={14}
        strokeWidth={2}
      />

      <Text style={styles.roleLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function formatFileSize(
  bytes: number | null,
) {
  if (
    bytes === null ||
    bytes <= 0
  ) {
    return 'Unknown size';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor:
      'rgba(189, 200, 206, 0.55)',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },

  cardTitle: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  uploadDropzone: {
    alignItems: 'center',
    backgroundColor:
      'rgba(243, 251, 250, 0.45)',
    borderColor:
      knowledgeColors.outline,
    borderRadius: radius.sm,
    borderStyle: 'dashed',
    borderWidth: 1,
    minHeight: 188,
    paddingHorizontal: 18,
    paddingVertical: 26,
  },

  pdfIconBox: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    marginBottom: 15,
    width: 38,
  },

  pdfIconText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '700',
    marginTop: -25,
  },

  selectedFileName: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    maxWidth: '90%',
  },

  fileSize: {
    color: colors.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  changeFileButton: {
    alignItems: 'center',
    borderColor:
      knowledgeColors.outline,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },

  changeFileText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },

  accessHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginTop: 30,
  },

  label: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginBottom: spacing.xs,
  },

  helperText: {
    color: knowledgeColors.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 10,
  },

  roleOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    minHeight: 22,
  },

  roleOptionInactive: {
    opacity: 0.72,
  },

  checkbox: {
    alignItems: 'center',
    backgroundColor:
      colors.white,
    borderColor:
      knowledgeColors.outline,
    borderRadius: 2,
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },

  checkboxSelected: {
    backgroundColor:
      colors.accent,
    borderColor: colors.accent,
  },

  roleLabel: {
    color: colors.primaryText,
    fontSize: 14,
    lineHeight: 20,
  },

  uploadButton: {
    alignItems: 'center',
    backgroundColor:
      colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 40,
    justifyContent: 'center',
    marginTop: 36,
  },

  uploadButtonDisabled: {
    opacity: 0.45,
  },

  uploadButtonText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },

  pressed: {
    opacity: 0.72,
  },
  uploadingState: {
    flex: 1,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  uploadingTitle: {
    marginTop: spacing.sm,
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },

  uploadingText: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});