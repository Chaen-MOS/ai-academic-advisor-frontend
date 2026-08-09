import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  FileText,
  Search,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import {
  KnowledgeDocumentRow,
} from './KnowledgeDocumentRow';

import type {
  KnowledgeDocument,
} from '../../services/knowledgeApi';

export type KnowledgeFilterKey =
  | 'ALL'
  | 'READY'
  | 'DISABLED'
  | 'FAILED';

type KnowledgeDocumentListProps = {
  documents: KnowledgeDocument[];
  isLoading: boolean;

  searchQuery: string;
  selectedFilter: KnowledgeFilterKey;

  onSearchChange: (
    value: string,
  ) => void;

  onFilterChange: (
    filter: KnowledgeFilterKey,
  ) => void;

  onToggleDocument: (
    documentId: string,
    value: boolean,
  ) => void;

  onOpenDocumentMenu: (
    document: KnowledgeDocument,
  ) => void;
};

const filters: Array<{
  label: string;
  value: KnowledgeFilterKey;
}> = [
  {
    label: 'All',
    value: 'ALL',
  },
  {
    label: 'Ready',
    value: 'READY',
  },
  {
    label: 'Disabled',
    value: 'DISABLED',
  },
  {
    label: 'Failed',
    value: 'FAILED',
  },
];

const knowledgeColors = {
  surfaceContainerLow: '#EDF5F5',
  divider: '#ECF0F1',
  muted: '#6D797E',
  iconMuted: '#9AA6AA',
};

export function KnowledgeDocumentList({
  documents,
  isLoading,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterChange,
  onToggleDocument,
  onOpenDocumentMenu,
}: KnowledgeDocumentListProps) {
  const filteredDocuments =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      return documents.filter(
        document => {
          const matchesSearch =
            document.title
              .toLowerCase()
              .includes(
                normalizedQuery,
              ) ||
            document.file_name
              .toLowerCase()
              .includes(
                normalizedQuery,
              );

          let matchesFilter = true;

          if (
            selectedFilter === 'READY'
          ) {
            matchesFilter =
              document.processing_status ===
                'READY' &&
              document.is_enabled;
          }

          if (
            selectedFilter ===
            'DISABLED'
          ) {
            matchesFilter =
              !document.is_enabled;
          }

          if (
            selectedFilter ===
            'FAILED'
          ) {
            matchesFilter =
              document.processing_status ===
              'FAILED';
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      documents,
      searchQuery,
      selectedFilter,
    ]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        PDF List
      </Text>

      <View style={styles.searchBox}>
        <Search
          color={
            knowledgeColors.muted
          }
          size={22}
          strokeWidth={2}
          style={styles.searchIcon}
        />

        <TextInput
          accessibilityLabel="Search documents"
          onChangeText={
            onSearchChange
          }
          placeholder="Search documents..."
          placeholderTextColor={
            knowledgeColors.muted
          }
          returnKeyType="search"
          style={styles.searchInput}
          value={searchQuery}
        />
      </View>

      <View style={styles.filters}>
        {filters.map(filter => {
          const selected =
            selectedFilter ===
            filter.value;

          return (
            <Pressable
              accessibilityLabel={`Filter by ${filter.label}`}
              accessibilityRole="button"
              accessibilityState={{
                selected,
              }}
              key={filter.value}
              onPress={() =>
                onFilterChange(
                  filter.value,
                )
              }
              style={
                styles.filterButton
              }>
              <Text
                style={[
                  styles.filterText,
                  selected &&
                    styles.filterTextSelected,
                ]}>
                {filter.label}
              </Text>

              {selected ? (
                <View
                  style={
                    styles.filterUnderline
                  }
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.documentList}>
        {isLoading ? (
          <View
            style={
              styles.documentLoading
            }>
            <ActivityIndicator
              size="small"
              color={colors.accent}
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading documents...
            </Text>
          </View>
        ) : filteredDocuments.length >
          0 ? (
          filteredDocuments.map(
            (document, index) => (
              <KnowledgeDocumentRow
                key={document.id}
                document={document}
                isLast={
                  index ===
                  filteredDocuments.length -
                    1
                }
                onOpenMenu={
                  onOpenDocumentMenu
                }
                onToggle={
                  onToggleDocument
                }
              />
            ),
          )
        ) : (
          <View
            style={
              styles.emptyState
            }>
            <FileText
              color={
                knowledgeColors.iconMuted
              }
              size={28}
              strokeWidth={1.7}
            />

            <Text
              style={
                styles.emptyStateText
              }>
              No documents found
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      colors.white,
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

  searchBox: {
    alignItems: 'center',
    backgroundColor:
      knowledgeColors.surfaceContainerLow,
    borderRadius: radius.sm,
    flexDirection: 'row',
    height: 40,
    marginBottom: 12,
  },

  searchIcon: {
    marginLeft: 14,
    marginRight: 8,
  },

  searchInput: {
    color: colors.primaryText,
    flex: 1,
    fontSize: 14,
    height: '100%',
    lineHeight: 20,
    padding: 0,
    paddingRight: 12,
  },

  filters: {
    borderBottomColor:
      knowledgeColors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
    minHeight: 25,
  },

  filterButton: {
    alignItems: 'center',
    justifyContent:
      'flex-start',
  },

  filterText: {
    color:
      colors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },

  filterTextSelected: {
    color: colors.accent,
  },

  filterUnderline: {
    backgroundColor:
      colors.accent,
    height: 2,
    marginTop: 5,
    width: '100%',
  },

  documentList: {
    marginTop: 6,
  },

  documentLoading: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  loadingText: {
    ...typography.body,
    color:
      colors.secondaryText,
    fontSize: 12,
  },

  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 120,
  },

  emptyStateText: {
    color:
      colors.secondaryText,
    fontSize: 12,
  },
});