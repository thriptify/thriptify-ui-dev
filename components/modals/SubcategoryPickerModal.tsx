/**
 * Subcategory Picker Modal
 *
 * A drill-down modal that shows subcategories when a category is selected.
 * User selects a subcategory to navigate to the category detail page.
 *
 * Pattern: "Drill-down Modal" / "Subcategory Picker"
 * Use this pattern when you want an intermediate selection step before navigation.
 */

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryGrid } from '../shared';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  children: SubcategoryItem[];
}

interface SubcategoryPickerModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** The category with its subcategories */
  category: CategoryWithSubcategories | null;
  /** Called when modal is dismissed */
  onClose: () => void;
  /** Called when a subcategory is selected */
  onSelectSubcategory: (subcategoryId: string, subcategoryName: string) => void;
  /** Called when "View All" is pressed */
  onViewAll?: (categoryId: string) => void;
}

export function SubcategoryPickerModal({
  visible,
  category,
  onClose,
  onSelectSubcategory,
  onViewAll,
}: SubcategoryPickerModalProps) {
  const insets = useSafeAreaInsets();

  if (!category) return null;

  const handleSubcategoryPress = (subcategory: SubcategoryItem) => {
    onSelectSubcategory(subcategory.id, subcategory.name);
    onClose();
  };

  const handleViewAllPress = () => {
    onViewAll?.(category.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.titleRow}>
              <Text variant="h2" style={styles.title}>{category.name}</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size="md" color={tokens.colors.semantic.text.secondary} />
              </Pressable>
            </View>
          </View>

          {/* Subcategories Grid */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <CategoryGrid
              items={category.children.map((child) => ({
                id: child.id,
                title: child.name,
                image: child.imageUrl || '',
              }))}
              size="sm"
              onCategoryPress={(id) => {
                const subcategory = category.children.find(c => c.id === id);
                if (subcategory) {
                  handleSubcategoryPress(subcategory);
                }
              }}
            />
          </ScrollView>

          {/* View All Button */}
          {onViewAll && (
            <Pressable style={styles.viewAllButton} onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View All {category.name}</Text>
              <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.colors.semantic.border.default,
    borderRadius: 2,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: tokens.spacing[4],
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollView: {
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[1],
  },
  viewAllText: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: '600',
    color: tokens.colors.semantic.brand.primary.default,
  },
});

export default SubcategoryPickerModal;
