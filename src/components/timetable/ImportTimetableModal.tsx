import React, {
  useState,
} from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image
} from 'react-native';

import {
  ClipboardPaste,
  X,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

type Props = {
  visible: boolean;
  isPreviewing: boolean;

  onClose: () => void;

  onPreview: (
    rawText: string,
  ) => void;
};

export function ImportTimetableModal({
  visible,
  isPreviewing,
  onClose,
  onPreview,
}: Props) {
  const [
    rawText,
    setRawText,
  ] = useState('');

  const canPreview =
    rawText.trim().length > 0 &&
    !isPreviewing;

  const handleClose = () => {
    if (isPreviewing) {
      return;
    }

    setRawText('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={
        handleClose
      }>
      <SafeAreaView
        edges={['top', 'bottom']}
        style={styles.screen}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text
              style={
                styles.headerTitle
              }>
              Import Timetable
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              From UTAR Portal
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Close"
            disabled={isPreviewing}
            hitSlop={8}
            onPress={handleClose}
            style={
              styles.closeButton
            }>
            <X
              size={21}
              color={
                colors.secondaryText
              }
            />
          </Pressable>
        </View>

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
              styles.instructionCard
            }>
            <ClipboardPaste
              size={24}
              color={colors.accent}
              strokeWidth={2}
            />

            <View
              style={
                styles.instructionText
              }>
              <Text
                style={
                  styles.instructionTitle
                }>
                Copy your timetable
              </Text>

              <Text style={styles.instructionBody}>
                Open your timetable in UTAR Portal
                and copy the timetable table as shown below.
              </Text>
            </View>
          </View>

          <View style={styles.steps}>
            <Text style={styles.step}>
                1. Open your timetable in UTAR Portal.
            </Text>

            <Text style={styles.step}>
                2. Select and copy the timetable table as shown below.
            </Text>

            <Text style={styles.step}>
                3. Paste the copied table below.
            </Text>
          </View>

          <View style={styles.exampleSection}>
            <Text style={styles.exampleLabel}>
                Example
            </Text>

            <View style={styles.exampleImageContainer}>
                <Image
                source={require('../../assets/timetable-import-example.png')}
                style={styles.exampleImage}
                resizeMode="contain"
                />
            </View>

            <Text style={styles.exampleHint}>
                Select the entire timetable table, including
                the column headings.
            </Text>
          </View>
          <Text
            style={styles.inputLabel}>
            Paste timetable
          </Text>

          <TextInput
            editable={!isPreviewing}
            multiline
            onChangeText={
              setRawText
            }
            placeholder={
              'Paste your copied timetable here...'
            }
            placeholderTextColor={
              colors.secondaryText
            }
            style={
              styles.textInput
            }
            textAlignVertical="top"
            value={rawText}
          />

          <Pressable
            disabled={!canPreview}
            onPress={() =>
              onPreview(
                rawText.trim(),
              )
            }
            style={[
              styles.previewButton,
              !canPreview &&
                styles.disabled,
            ]}>
            {isPreviewing ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.primaryText
                }
              />
            ) : (
              <Text
                style={
                  styles.previewButtonText
                }>
                Preview Timetable
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  header: {
    minHeight: 58,
    paddingHorizontal:
      spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor:
      colors.softCyan,
  },

  headerTitle: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700',
  },

  headerSubtitle: {
    marginTop: 2,
    color:
      colors.secondaryText,
    fontSize: 11,
  },

  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  instructionCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor:
      colors.softCyan,
  },

  instructionText: {
    flex: 1,
  },

  instructionTitle: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },

  instructionBody: {
    marginTop: 3,
    color:
      colors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
  },

  steps: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },

  step: {
    ...typography.body,
    color:
      colors.secondaryText,
    fontSize: 12,
    lineHeight: 19,
  },

  inputLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  textInput: {
    minHeight: 180,
    maxHeight: 300,
    padding: spacing.md,
    borderWidth: 1,
    borderColor:
      'rgba(189, 200, 206, 0.75)',
    borderRadius: radius.md,
    color: colors.primaryText,
    backgroundColor:
      colors.white,
    fontSize: 12,
    lineHeight: 18,
  },

  previewButton: {
    minHeight: 44,
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor:
      colors.accent,
  },

  previewButtonText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.45,
  },
  exampleSection: {
    marginTop: spacing.lg,
  },

  exampleLabel: {
    marginBottom: spacing.xs,
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  exampleImageContainer: {
    width: '100%',
    padding: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(189, 200, 206, 0.55)',
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  exampleImage: {
    width: '100%',
    height: 110,
  },

  exampleHint: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 11,
    lineHeight: 16,
  },
});