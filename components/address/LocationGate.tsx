import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useAppAuth } from '@/contexts/auth-context';
import { useLocation, DeliveryAddress } from '@/contexts/location-context';
import { AddressEntry } from './AddressEntry';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.thriptify.com';

interface LocationGateProps {
  onComplete: () => void;
}

type Screen = 'choice' | 'address' | 'out-of-zone' | 'success';

export function LocationGate({ onComplete }: LocationGateProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, getToken } = useAppAuth();
  const {
    setDeliveryAddress,
    isInZone,
    deliveryAddress,
    zoneInfo,
    enterBrowseMode,
    formattedDeliveryTime,
    formattedDeliveryFee,
  } = useLocation();

  const [screen, setScreen] = useState<Screen>('choice');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleAddressVerified = async (address: DeliveryAddress) => {
    try {
      await setDeliveryAddress(address);
      setShowAddressModal(false);

      // Check if in zone
      if (isInZone) {
        setScreen('success');
      } else {
        setScreen('out-of-zone');
      }
    } catch (error) {
      console.error('[LocationGate] Error setting address:', error);
    }
  };

  const handleStartShopping = () => {
    onComplete();
  };

  const handleBrowseProducts = () => {
    enterBrowseMode();
    onComplete();
  };

  // Skip with default Overland Park location
  const handleUseDefaultLocation = async () => {
    const defaultAddress: DeliveryAddress = {
      streetAddress: '7500 W 119th St',
      city: 'Overland Park',
      state: 'KS',
      zip: '66213',
      latitude: 38.9108,
      longitude: -94.6639,
      label: 'home',
      isDefault: true,
    };

    try {
      // If signed in, save address to backend
      if (isAuthenticated) {
        try {
          const token = await getToken();
          if (token) {
            const response = await fetch(`${API_BASE_URL}/api/v1/customer/addresses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                label: 'home',
                addressLine1: defaultAddress.streetAddress,
                city: defaultAddress.city,
                state: defaultAddress.state,
                postalCode: defaultAddress.zip,
                country: 'US',
                latitude: defaultAddress.latitude,
                longitude: defaultAddress.longitude,
                isDefault: true,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              // Update local address with the backend ID
              defaultAddress.id = data.address?.id;
              console.log('[LocationGate] Address saved to backend:', data.address?.id);
            }
          }
        } catch (err) {
          console.warn('[LocationGate] Failed to save address to backend:', err);
        }
      }

      await setDeliveryAddress(defaultAddress);
      onComplete();
    } catch (error) {
      console.error('[LocationGate] Error setting default address:', error);
      // Even if zone check fails, allow browsing
      enterBrowseMode();
      onComplete();
    }
  };

  const handleTryDifferentAddress = () => {
    setScreen('choice');
    setShowAddressModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + tokens.spacing[4] }]}>
      {/* Choice Screen */}
      {screen === 'choice' && (
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text variant="h1" style={styles.logo}>Thriptify</Text>
            </View>
            <Text variant="h2" style={styles.heroTitle}>
              Fresh Indian Groceries
            </Text>
            <Text style={styles.heroSubtitle}>
              Delivered to your door in the Kansas City metro area
            </Text>
          </View>

          <View style={styles.actionSection}>
            <Text variant="h3" style={styles.actionTitle}>
              Where should we deliver?
            </Text>

            <Pressable
              style={styles.optionCard}
              onPress={() => setShowAddressModal(true)}
            >
              <View style={styles.optionIcon}>
                <Icon name="home" size="lg" color={tokens.colors.semantic.brand.primary.default} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Enter Delivery Address</Text>
                <Text style={styles.optionSubtitle}>
                  Type your address to check if we deliver to you
                </Text>
              </View>
              <Icon name="chevron-right" size="md" color={tokens.colors.semantic.text.tertiary} />
            </Pressable>

            <Pressable
              style={styles.optionCard}
              onPress={handleUseDefaultLocation}
            >
              <View style={[styles.optionIcon, styles.optionIconSecondary]}>
                <Icon name="location" size="lg" color={tokens.colors.semantic.status.success.default} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Use Overland Park</Text>
                <Text style={styles.optionSubtitle}>
                  Skip for now and start browsing
                </Text>
              </View>
              <Icon name="chevron-right" size="md" color={tokens.colors.semantic.text.tertiary} />
            </Pressable>

            <View style={styles.serviceArea}>
              <Icon name="info" size="sm" color={tokens.colors.semantic.text.tertiary} />
              <Text style={styles.serviceAreaText}>
                We currently deliver within 20 miles of Overland Park, KS including Lenexa, Olathe, Shawnee, and surrounding areas.
              </Text>
            </View>

            <Pressable style={styles.browseLink} onPress={handleBrowseProducts}>
              <Text style={styles.browseLinkText}>Just browse products →</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Success Screen - In Zone */}
      {screen === 'success' && deliveryAddress && (
        <View style={styles.content}>
          <View style={styles.resultSection}>
            <View style={styles.successIconContainer}>
              <Icon name="checkmark" size="xl" color="#fff" />
            </View>

            <Text variant="h2" style={styles.resultTitle}>
              Great news!
            </Text>
            <Text style={styles.resultSubtitle}>
              We deliver to your area
            </Text>

            <View style={styles.addressSummary}>
              <Icon name="location" size="md" color={tokens.colors.semantic.brand.primary.default} />
              <View style={styles.addressSummaryText}>
                <Text style={styles.addressCity}>
                  {deliveryAddress.city}, {deliveryAddress.state}
                </Text>
                <Text style={styles.addressStreet}>
                  {deliveryAddress.streetAddress}
                </Text>
              </View>
            </View>

            {zoneInfo && (
              <View style={styles.deliveryInfo}>
                <View style={styles.deliveryInfoRow}>
                  <Icon name="time" size="sm" color={tokens.colors.semantic.text.secondary} />
                  <Text style={styles.deliveryInfoText}>
                    Est. delivery: {formattedDeliveryTime}
                  </Text>
                </View>
                <View style={styles.deliveryInfoRow}>
                  <Icon name="car" size="sm" color={tokens.colors.semantic.text.secondary} />
                  <Text style={styles.deliveryInfoText}>
                    Delivery fee: {formattedDeliveryFee}
                    {zoneInfo.freeDeliveryMinimum > 0 &&
                      ` (Free on orders $${zoneInfo.freeDeliveryMinimum}+)`}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.bottomActions}>
            <Pressable style={styles.primaryButton} onPress={handleStartShopping}>
              <Text style={styles.primaryButtonText}>Start Shopping</Text>
              <Icon name="chevron-right" size="sm" color="#fff" />
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleTryDifferentAddress}>
              <Text style={styles.secondaryButtonText}>Change Address</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Out of Zone Screen */}
      {screen === 'out-of-zone' && deliveryAddress && (
        <View style={styles.content}>
          <View style={styles.resultSection}>
            <View style={styles.outOfZoneIconContainer}>
              <Icon name="location" size="xl" color="#fff" />
            </View>

            <Text variant="h2" style={styles.resultTitle}>
              We're not in your area yet
            </Text>
            <Text style={styles.resultSubtitle}>
              {deliveryAddress.city}, {deliveryAddress.state} is outside our current delivery zone
            </Text>

            <View style={styles.outOfZoneOptions}>
              <Pressable style={styles.outOfZoneOption} onPress={handleTryDifferentAddress}>
                <Icon name="location" size="md" color={tokens.colors.semantic.brand.primary.default} />
                <View style={styles.outOfZoneOptionText}>
                  <Text style={styles.outOfZoneOptionTitle}>Try Different Address</Text>
                  <Text style={styles.outOfZoneOptionSubtitle}>
                    Enter another delivery location
                  </Text>
                </View>
              </Pressable>

              <Pressable style={styles.outOfZoneOption} onPress={handleBrowseProducts}>
                <Icon name="search" size="md" color={tokens.colors.semantic.text.secondary} />
                <View style={styles.outOfZoneOptionText}>
                  <Text style={styles.outOfZoneOptionTitle}>Browse Products</Text>
                  <Text style={styles.outOfZoneOptionSubtitle}>
                    Explore our catalog (ordering disabled)
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.expansionNote}>
              <Text style={styles.expansionNoteText}>
                We're expanding soon! Leave your email to get notified when we reach your area.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Address Entry Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <AddressEntry
            onAddressVerified={handleAddressVerified}
            onCancel={() => setShowAddressModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[6],
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
  },
  logoContainer: {
    marginBottom: tokens.spacing[4],
  },
  logo: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 32,
    fontWeight: '700',
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  heroSubtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    fontSize: 16,
  },

  // Action Section
  actionSection: {
    flex: 1,
  },
  actionTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing[6],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    gap: tokens.spacing[4],
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: `${tokens.colors.semantic.brand.primary.default}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSecondary: {
    backgroundColor: `${tokens.colors.semantic.status.success.default}15`,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
  serviceArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginTop: tokens.spacing[4],
  },
  serviceAreaText: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
  browseLink: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[4],
    marginTop: tokens.spacing[2],
  },
  browseLinkText: {
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
    textDecorationLine: 'underline',
  },

  // Result Screens
  resultSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: tokens.spacing[12],
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.semantic.status.success.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[6],
  },
  outOfZoneIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.semantic.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[6],
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  resultSubtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    fontSize: 16,
    marginBottom: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[4],
  },

  // Address Summary
  addressSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    gap: tokens.spacing[3],
    width: '100%',
    marginBottom: tokens.spacing[4],
  },
  addressSummaryText: {
    flex: 1,
  },
  addressCity: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  addressStreet: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },

  // Delivery Info
  deliveryInfo: {
    width: '100%',
    gap: tokens.spacing[2],
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  deliveryInfoText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },

  // Out of Zone Options
  outOfZoneOptions: {
    width: '100%',
    gap: tokens.spacing[3],
  },
  outOfZoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    gap: tokens.spacing[4],
  },
  outOfZoneOptionText: {
    flex: 1,
  },
  outOfZoneOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  outOfZoneOptionSubtitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  expansionNote: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[4],
  },
  expansionNoteText: {
    textAlign: 'center',
    fontSize: 14,
    color: tokens.colors.semantic.text.tertiary,
  },

  // Bottom Actions
  bottomActions: {
    paddingBottom: tokens.spacing[8],
    gap: tokens.spacing[3],
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 12,
    paddingVertical: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
  },
  secondaryButtonText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 15,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
});

export default LocationGate;
