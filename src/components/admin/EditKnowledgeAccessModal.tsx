import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Check,
  X,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import type {
  KnowledgeAccessRole,
  KnowledgeDocument,
} from '../../services/knowledgeApi';

type Props = {
  visible: boolean;
  document: KnowledgeDocument | null;
  isSaving: boolean;

  onClose: () => void;

  onSave: (
    roles: KnowledgeAccessRole[],
  ) => void;
};

const ROLE_OPTIONS: {
  role: KnowledgeAccessRole;
  label: string;
}[] = [
  {
    role: 'STUDENT',
    label: 'Students',
  },
  {
    role: 'LECTURER',
    label: 'Lecturers',
  },
  {
    role: 'ADMIN',
    label: 'Admins',
  },
];

export function EditKnowledgeAccessModal({
  visible,
  document,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const [
    selectedRoles,
    setSelectedRoles,
  ] = useState<KnowledgeAccessRole[]>([]);

  useEffect(() => {
    if (document) {
      setSelectedRoles(
        document.accessible_roles ?? [],
      );
    }
  }, [document]);

  const toggleRole = (
    role: KnowledgeAccessRole,
  ) => {
    setSelectedRoles(current =>
      current.includes(role)
        ? current.filter(
            item => item !== role,
          )
        : [...current, role],
    );
  };

  const canSave =
    selectedRoles.length > 0 &&
    !isSaving;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
                Edit Access
              </Text>

              <Text
                numberOfLines={1}
                style={styles.documentName}>
                {document?.title ??
                  document?.file_name ??
                  ''}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Close"
              disabled={isSaving}
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}>
              <X
                size={20}
                color={
                  colors.secondaryText
                }
              />
            </Pressable>
          </View>

          <Text style={styles.helper}>
            Choose who can access this
            document through the AI
            advisor.
          </Text>

          <View style={styles.roles}>
            {ROLE_OPTIONS.map(
              ({role, label}) => {
                const selected =
                  selectedRoles.includes(
                    role,
                  );

                return (
                  <Pressable
                    key={role}
                    disabled={isSaving}
                    onPress={() =>
                      toggleRole(role)
                    }
                    style={styles.roleRow}>
                    <View
                      style={[
                        styles.checkbox,
                        selected &&
                          styles.checkboxSelected,
                      ]}>
                      {selected ? (
                        <Check
                          size={12}
                          strokeWidth={3}
                          color={
                            colors.white
                          }
                        />
                      ) : null}
                    </View>

                    <Text
                      style={
                        styles.roleLabel
                      }>
                      {label}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>

          {selectedRoles.length === 0 ? (
            <Text style={styles.errorText}>
              At least one role must be
              selected.
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              disabled={isSaving}
              onPress={onClose}
              style={styles.cancelButton}>
              <Text
                style={
                  styles.cancelButtonText
                }>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={!canSave}
              onPress={() =>
                onSave(selectedRoles)
              }
              style={[
                styles.saveButton,
                !canSave &&
                  styles.disabled,
              ]}>
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={
                    colors.primaryText
                  }
                />
              ) : (
                <Text
                  style={
                    styles.saveButtonText
                  }>
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor:
      'rgba(0, 0, 0, 0.35)',
  },

  modal: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },

  title: {
    ...typography.cardHeading,
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700',
  },

  documentName: {
    marginTop: 4,
    color: colors.secondaryText,
    fontSize: 12,
  },

  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helper: {
    marginTop: spacing.lg,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },

  roles: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  roleRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  checkbox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: colors.secondaryText,
    backgroundColor: colors.white,
  },

  checkboxSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },

  roleLabel: {
    color: colors.primaryText,
    fontSize: 14,
  },

  errorText: {
    marginTop: spacing.md,
    fontSize: 11,
    color: colors.destructive,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },

  cancelButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  cancelButtonText: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },

  saveButton: {
    minWidth: 120,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },

  saveButtonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.45,
  },
});