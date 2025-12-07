import { ScrollView, StyleSheet, View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Mock addresses data
const INITIAL_ADDRESSES = [
  {
    id: '1',
    type: 'Home',
    icon: 'home',
    name: 'Sarah Johnson',
    address: '123 Main Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    phone: '+1 (415) 555-0123',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Work',
    icon: 'briefcase',
    name: 'Sarah Johnson',
    address: '456 Market Street, Suite 200',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    phone: '+1 (415) 555-0456',
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleAddAddress = () => {
    // In a real app, this would navigate to an address form
    console.log('Add new address');
  };

  const handleEditAddress = (id: string) => {
    console.log('Edit address:', id);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Saved Addresses</Text>
        <Pressable style={styles.addButton} onPress={handleAddAddress}>
          <Icon name="plus" size="md" color={tokens.colors.semantic.brand.primary.default} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Add New Address Button */}
        <Pressable style={styles.addNewCard} onPress={handleAddAddress}>
          <View style={styles.addNewIcon}>
            <Icon name="plus" size="md" color={tokens.colors.semantic.brand.primary.default} />
          </View>
          <View style={styles.addNewContent}>
            <Text style={styles.addNewTitle}>Add New Address</Text>
            <Text style={styles.addNewSubtitle}>Save a new delivery location</Text>
          </View>
          <Icon name="chevron-right" size="md" color={tokens.colors.semantic.text.tertiary} />
        </Pressable>

        {/* Address Cards */}
        <View style={styles.addressList}>
          {addresses.map((address) => (
            <Pressable
              key={address.id}
              style={[
                styles.addressCard,
                address.isDefault && styles.addressCardDefault,
              ]}
              onPress={() => setSelectedAddress(selectedAddress === address.id ? null : address.id)}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  <View style={[styles.addressTypeIcon, address.isDefault && styles.addressTypeIconDefault]}>
                    <Icon
                      name={address.icon}
                      size="sm"
                      color={address.isDefault ? tokens.colors.semantic.brand.primary.default : tokens.colors.semantic.text.secondary}
                    />
                  </View>
                  <View>
                    <View style={styles.addressTypeRow}>
                      <Text style={styles.addressType}>{address.type}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressName}>{address.name}</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.moreButton}
                  onPress={() => setSelectedAddress(selectedAddress === address.id ? null : address.id)}
                >
                  <Icon
                    name={selectedAddress === address.id ? 'chevron-up' : 'chevron-down'}
                    size="sm"
                    color={tokens.colors.semantic.text.tertiary}
                  />
                </Pressable>
              </View>

              <View style={styles.addressBody}>
                <Text style={styles.addressText}>{address.address}</Text>
                <Text style={styles.addressText}>{address.city}, {address.state} {address.zip}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </View>

              {/* Expanded Actions */}
              {selectedAddress === address.id && (
                <View style={styles.addressActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address.id)}
                  >
                    <Icon name="edit" size="sm" color={tokens.colors.semantic.text.secondary} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>

                  {!address.isDefault && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Icon name="checkmark-circle" size="sm" color={tokens.colors.semantic.text.secondary} />
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={[styles.actionButton, styles.actionButtonDelete]}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Icon name="trash" size="sm" color={tokens.colors.semantic.status.error.default} />
                    <Text style={[styles.actionButtonText, styles.actionButtonTextDelete]}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Empty State */}
        {addresses.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="location" size="xl" color={tokens.colors.semantic.text.tertiary} />
            <Text variant="h4" style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add your first delivery address to get started.
            </Text>
            <Pressable style={styles.emptyButton} onPress={handleAddAddress}>
              <Text style={styles.emptyButtonText}>Add Address</Text>
            </Pressable>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing[4],
  },
  // Add New Card
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.semantic.brand.primary.default,
    borderStyle: 'dashed',
  },
  addNewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${tokens.colors.semantic.brand.primary.default}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  addNewContent: {
    flex: 1,
  },
  addNewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.brand.primary.default,
    marginBottom: 2,
  },
  addNewSubtitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  // Address List
  addressList: {
    gap: tokens.spacing[3],
  },
  addressCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  addressCardDefault: {
    borderColor: tokens.colors.semantic.brand.primary.default,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing[3],
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
  },
  addressTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTypeIconDefault: {
    backgroundColor: `${tokens.colors.semantic.brand.primary.default}15`,
  },
  addressTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  defaultBadge: {
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addressName: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    paddingLeft: tokens.spacing[12],
  },
  addressText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginTop: tokens.spacing[1],
  },
  // Address Actions
  addressActions: {
    flexDirection: 'row',
    paddingTop: tokens.spacing[3],
    marginTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 8,
    gap: tokens.spacing[1],
  },
  actionButtonDelete: {
    backgroundColor: `${tokens.colors.semantic.status.error.default}10`,
  },
  actionButtonText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    fontWeight: '500',
  },
  actionButtonTextDelete: {
    color: tokens.colors.semantic.status.error.default,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: tokens.spacing[16],
    paddingHorizontal: tokens.spacing[8],
  },
  emptyTitle: {
    marginTop: tokens.spacing[4],
    color: tokens.colors.semantic.text.primary,
  },
  emptyText: {
    marginTop: tokens.spacing[2],
    textAlign: 'center',
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
  },
  emptyButton: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
