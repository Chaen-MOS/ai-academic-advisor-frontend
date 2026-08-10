import React, {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {
  ArrowLeft,
} from 'lucide-react-native';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';
import type {RootStackParamList} from '../types/navigation';
import {
  getKnowledgeDocuments,
  setKnowledgeDocumentEnabled,
  uploadKnowledgePdf,
  deleteKnowledgeDocument,
  updateKnowledgeDocumentAccess,
  type KnowledgeDocument,
  type KnowledgeAccessRole,
} from '../services/knowledgeApi';
import {
  KnowledgeUploadCard,
  type SelectedPdf,
} from '../components/admin/KnowledgeUploadCard';
import {
  KnowledgeDocumentList,
  type KnowledgeFilterKey,
} from '../components/admin/KnowledgeDocumentList';
import {
  pick,
  types,
} from '@react-native-documents/picker';
import {
  EditKnowledgeAccessModal,
} from '../components/admin/EditKnowledgeAccessModal';

type AdminPortalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AdminPortal'
>;

export default function AdminPortalScreen({
  navigation,
}: AdminPortalScreenProps) {
  const [selectedPdf, setSelectedPdf] =
    useState<SelectedPdf | null>(null);

  const [
    accessibleStudents,
    setAccessibleStudents,
  ] = useState(false);

  const [
    accessibleAdmins,
    setAccessibleAdmins,
  ] = useState(false);

  const [
    accessibleLecturers,
    setAccessibleLecturers,
  ] = useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedFilter, setSelectedFilter] =
    useState<KnowledgeFilterKey>('ALL');

  const [documents, setDocuments] =
  useState<KnowledgeDocument[]>([]);

  const [
  isLoadingDocuments,
  setIsLoadingDocuments,
  ] = useState(true);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    selectedAccessDocument,
    setSelectedAccessDocument,
  ] = useState<KnowledgeDocument | null>(null);

  const [
    isAccessModalVisible,
    setIsAccessModalVisible,
  ] = useState(false);

  const [
    isSavingAccess,
    setIsSavingAccess,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
        let isActive = true;

        async function loadDocuments() {
        try {
            setIsLoadingDocuments(true);

            const result =
            await getKnowledgeDocuments();

            if (!isActive) {
            return;
            }

            setDocuments(result);
        } catch (error) {
            console.error(
            'Failed to load knowledge documents:',
            error,
            );

            if (isActive) {
            Alert.alert(
                'Unable to Load Documents',
                error instanceof Error
                ? error.message
                : 'Failed to load knowledge documents.',
            );
            }
        } finally {
            if (isActive) {
            setIsLoadingDocuments(false);
            }
        }
        }

        void loadDocuments();

        return () => {
        isActive = false;
        };
    }, []),
    );

  const handleChooseFile = async () => {
    try {
        const [file] = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
        });

        setSelectedPdf({
        name:
            file.name ??
            'document.pdf',

        uri:
            file.uri,

        type:
            file.type ??
            'application/pdf',

        size:
            file.size ?? null,
        });
    } catch (error) {
        console.log(
        'PDF selection cancelled or failed:',
        error,
        );
    }
  };

  const handleUploadPdf = async () => {
    if (!selectedPdf) {
        Alert.alert(
        'PDF Required',
        'Please select a PDF file first.',
        );

        return;
    }

    const accessibleRoles: KnowledgeAccessRole[] = [];

    if (accessibleStudents) {
        accessibleRoles.push('STUDENT');
        }

        if (accessibleLecturers) {
        accessibleRoles.push('LECTURER');
        }

        if (accessibleAdmins) {
        accessibleRoles.push('ADMIN');
        }

    if (accessibleRoles.length === 0) {
        Alert.alert(
        'Access Required',
        'Please select at least one accessible role.',
        );

        return;
    }

    try {
        setIsUploading(true);

        const result =
        await uploadKnowledgePdf({
            file: {
            uri: selectedPdf.uri,
            name: selectedPdf.name,
            type: selectedPdf.type,
            },

            title:
            selectedPdf.name.replace(
                /\.pdf$/i,
                '',
            ),

            accessibleRoles,
        });

        setDocuments(current => [
        result.document,
        ...current.filter(
            document =>
            document.id !==
            result.document.id,
        ),
        ]);

        setSelectedPdf(null);

        Alert.alert(
        'Upload Complete',
        `${result.document.title} was uploaded successfully with ${result.chunkCount} knowledge chunks.`,
        );
    } catch (error) {
        console.error(
        'Knowledge upload failed:',
        error,
        );

        Alert.alert(
        'Upload Failed',
        error instanceof Error
            ? error.message
            : 'Unable to upload PDF.',
        );
    } finally {
        setIsUploading(false);
    }
  };

  const handleToggleDocument = async (
    documentId: string,
    value: boolean,
    ) => {
    const previousDocuments = documents;

    setDocuments(current =>
        current.map(document =>
        document.id === documentId
            ? {
                ...document,
                is_enabled: value,
            }
            : document,
        ),
    );

    try {
        const updatedDocument =
        await setKnowledgeDocumentEnabled(
            documentId,
            value,
        );

        setDocuments(current =>
        current.map(document =>
            document.id === documentId
            ? updatedDocument
            : document,
        ),
        );
    } catch (error) {
        // Roll back optimistic UI update.
        setDocuments(previousDocuments);

        console.error(
        'Failed to update knowledge document:',
        error,
        );

        Alert.alert(
        'Update Failed',
        error instanceof Error
            ? error.message
            : 'Unable to update document.',
        );
    }
    };

  const handleOpenDocumentMenu = (
    document: KnowledgeDocument,
  ) => {
    const displayName =
      document.title ||
      document.file_name;

    Alert.alert(
      displayName,
      'Choose an action for this document.',
      [
        {
          text: 'Edit Access',
          onPress: () => {
            setSelectedAccessDocument(
              document,
            );

            setIsAccessModalVisible(
              true,
            );
          },
        },

        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            confirmDeleteDocument(
              document,
            ),
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleSaveDocumentAccess = async (
    accessibleRoles: KnowledgeAccessRole[],
  ) => {
    if (!selectedAccessDocument) {
      return;
    }

    try {
      setIsSavingAccess(true);

      const updatedDocument =
        await updateKnowledgeDocumentAccess(
          selectedAccessDocument.id,
          accessibleRoles,
        );

      setDocuments(current =>
        current.map(document =>
          document.id ===
          updatedDocument.id
            ? updatedDocument
            : document,
        ),
      );

      setSelectedAccessDocument(
        updatedDocument,
      );

      setIsAccessModalVisible(
        false,
      );

      setSelectedAccessDocument(
        null,
      );
    } catch (error) {
      console.error(
        'Failed to update document access:',
        error,
      );

      Alert.alert(
        'Update Failed',
        error instanceof Error
          ? error.message
          : 'Unable to update document access.',
      );
    } finally {
      setIsSavingAccess(false);
    }
  };

  const handleCloseAccessModal = () => {
    if (isSavingAccess) {
      return;
    }

    setIsAccessModalVisible(false);
    setSelectedAccessDocument(null);
  };

  const confirmDeleteDocument = (
    document: KnowledgeDocument,
    ) => {
    const displayName =
        document.title ||
        document.file_name;

    Alert.alert(
        'Delete PDF?',
        `Are you sure you want to permanently delete "${displayName}"?\n\nThis document will no longer be available to the AI advisor.`,
        [
        {
            text: 'Cancel',
            style: 'cancel',
        },
        {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
            void handleDeleteDocument(
                document,
            );
            },
        },
        ],
    );
  };

  const handleDeleteDocument = async (
    document: KnowledgeDocument,
    ) => {
    try {
        await deleteKnowledgeDocument(
        document.id,
        );

        setDocuments(current =>
        current.filter(
            item =>
            item.id !== document.id,
        ),
        );

        Alert.alert(
        'Deleted',
        'The PDF has been deleted successfully.',
        );
    } catch (error) {
        console.error(
        'Failed to delete knowledge document:',
        error,
        );

        Alert.alert(
        'Delete Failed',
        error instanceof Error
            ? error.message
            : 'Unable to delete the PDF.',
        );
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <ArrowLeft
              color={colors.primaryText}
              size={24}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>

        <View style={styles.sheet}>
          <View style={styles.pageTitleBlock}>
            <Text style={styles.kicker}>
              ADMIN PORTAL
            </Text>

            <Text style={styles.title}>
              Knowledge Base Management
            </Text>
          </View>

            <KnowledgeUploadCard
                selectedPdf={selectedPdf}
                isUploading={isUploading}
                accessibleStudents={
                    accessibleStudents
                }
                accessibleAdmins={
                    accessibleAdmins
                }
                accessibleLecturers={
                    accessibleLecturers
                }
                onChooseFile={
                    handleChooseFile
                }
                onUpload={
                    handleUploadPdf
                }
                onToggleStudents={() =>
                    setAccessibleStudents(
                    current => !current,
                    )
                }
                onToggleAdmins={() =>
                    setAccessibleAdmins(
                    current => !current,
                    )
                }
                onToggleLecturers={() =>
                    setAccessibleLecturers(
                    current => !current,
                    )
                }
                />
          <KnowledgeDocumentList
            documents={documents}
            isLoading={isLoadingDocuments}
            searchQuery={searchQuery}
            selectedFilter={selectedFilter}
            onSearchChange={setSearchQuery}
            onFilterChange={
                setSelectedFilter
            }
            onToggleDocument={
                handleToggleDocument
            }
            onOpenDocumentMenu={
                handleOpenDocumentMenu
            }
            />
        </View>
      </ScrollView>
      <EditKnowledgeAccessModal
        visible={isAccessModalVisible}
        document={selectedAccessDocument}
        isSaving={isSavingAccess}
        onClose={
          handleCloseAccessModal
        }
        onSave={
          handleSaveDocumentAccess
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.softCyan,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.softCyan,
  },

  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },

  sheet: {
    flex: 1,
    width: '100%',
    gap: spacing.xl,

    backgroundColor: colors.background,

    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,

    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
  },

  pageTitleBlock: {
    gap: spacing.xxs,
  },

  kicker: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 16,
  },

  title: {
    ...typography.cardHeading,
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },

});