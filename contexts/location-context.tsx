import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useAppAuth } from '@/contexts/auth-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.thriptify.com';

// Storage keys
const STORAGE_KEYS = {
  DELIVERY_ADDRESS: '@thriptify/delivery_address',
  ZONE_INFO: '@thriptify/zone_info',
  LOCATION_PERMISSION: '@thriptify/location_permission',
};

// Types
export interface DeliveryAddress {
  id?: string;
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  label?: 'home' | 'work' | 'other';
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export interface ZoneInfo {
  id: string;
  name: string;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  freeDeliveryMinimum: number;
  minimumOrderAmount: number;
}

export interface LocationState {
  // Current delivery address
  deliveryAddress: DeliveryAddress | null;

  // Zone info for current address
  zoneInfo: ZoneInfo | null;

  // Is user in a deliverable zone?
  isInZone: boolean;

  // Is user in browse-only mode?
  isBrowseMode: boolean;

  // Has user completed location setup?
  hasSetLocation: boolean;

  // Loading/error states
  isLoading: boolean;
  isCheckingZone: boolean;
  error: string | null;
}

interface LocationContextType extends LocationState {
  // Actions
  setDeliveryAddress: (address: DeliveryAddress) => Promise<void>;
  checkZone: (latitude: number, longitude: number) => Promise<ZoneInfo | null>;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<{ latitude: number; longitude: number } | null>;
  enterBrowseMode: () => void;
  clearLocation: () => Promise<void>;

  // Computed
  formattedDeliveryTime: string;
  formattedDeliveryFee: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const { isAuthenticated, getToken } = useAppAuth();
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [isInZone, setIsInZone] = useState(false);
  const [isBrowseMode, setIsBrowseMode] = useState(false);
  const [hasSetLocation, setHasSetLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingZone, setIsCheckingZone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previous sign-in state to detect sign-in events
  const wasSignedInRef = useRef<boolean | undefined>(undefined);
  const hasSyncedRef = useRef(false);

  // Load saved location on mount
  useEffect(() => {
    loadSavedLocation();
  }, []);

  // Sync addresses from backend when user is signed in
  // For signed-in users, backend is source of truth - sync even if local data exists
  useEffect(() => {
    const syncAddressesFromBackend = async () => {
      // Sync if user is signed in and we haven't synced yet this session
      if (isAuthenticated && !isLoading && !hasSyncedRef.current) {
        console.log('[Location] User signed in, syncing from backend...');
        hasSyncedRef.current = true;

        try {
          const token = await getToken();
          if (!token) {
            console.log('[Location] No token available, skipping sync');
            return;
          }

          const response = await fetch(`${API_BASE_URL}/api/v1/customer/addresses`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.warn('[Location] Failed to fetch addresses:', response.status);
            return;
          }

          const data = await response.json();
          const addresses = data.addresses || [];

          if (addresses.length > 0) {
            // Find default address, or use the first one
            const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];

            console.log('[Location] Found saved address, setting up:', defaultAddress.addressLine1);

            // Convert API address format to DeliveryAddress format
            const deliveryAddr: DeliveryAddress = {
              id: defaultAddress.id,
              streetAddress: defaultAddress.addressLine1,
              secondaryAddress: defaultAddress.addressLine2 || undefined,
              city: defaultAddress.city,
              state: defaultAddress.state,
              zip: defaultAddress.postalCode,
              latitude: defaultAddress.latitude || 0,
              longitude: defaultAddress.longitude || 0,
              label: defaultAddress.label?.toLowerCase() as 'home' | 'work' | 'other',
              isDefault: defaultAddress.isDefault,
              deliveryInstructions: defaultAddress.deliveryInstructions || undefined,
            };

            // Check zone and save to AsyncStorage
            if (deliveryAddr.latitude && deliveryAddr.longitude) {
              const zone = await checkZoneInternal(deliveryAddr.latitude, deliveryAddr.longitude);

              await AsyncStorage.setItem(
                STORAGE_KEYS.DELIVERY_ADDRESS,
                JSON.stringify(deliveryAddr)
              );
              setDeliveryAddressState(deliveryAddr);
              setHasSetLocation(true);

              if (zone) {
                await AsyncStorage.setItem(STORAGE_KEYS.ZONE_INFO, JSON.stringify(zone));
                setZoneInfo(zone);
                setIsInZone(true);
                setIsBrowseMode(false);
              } else {
                setIsInZone(false);
                setIsBrowseMode(true);
              }
            } else {
              // No coordinates, just save the address
              await AsyncStorage.setItem(
                STORAGE_KEYS.DELIVERY_ADDRESS,
                JSON.stringify(deliveryAddr)
              );
              setDeliveryAddressState(deliveryAddr);
              setHasSetLocation(true);
              setIsBrowseMode(true);
            }
          } else {
            console.log('[Location] No addresses found in backend');
          }
        } catch (err) {
          console.error('[Location] Error syncing addresses:', err);
        }
      }

      // Reset sync flag when user signs out
      if (!isAuthenticated && wasSignedInRef.current === true) {
        hasSyncedRef.current = false;
      }

      wasSignedInRef.current = isAuthenticated;
    };

    syncAddressesFromBackend();
  }, [isAuthenticated, isLoading, getToken]);

  const loadSavedLocation = async () => {
    try {
      setIsLoading(true);
      const [addressJson, zoneJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_ADDRESS),
        AsyncStorage.getItem(STORAGE_KEYS.ZONE_INFO),
      ]);

      if (addressJson) {
        const address = JSON.parse(addressJson) as DeliveryAddress;
        setDeliveryAddressState(address);
        setHasSetLocation(true);

        if (zoneJson) {
          const zone = JSON.parse(zoneJson) as ZoneInfo;
          setZoneInfo(zone);
          setIsInZone(true);
        } else {
          // Re-check zone in case it changed
          const zone = await checkZoneInternal(address.latitude, address.longitude);
          if (zone) {
            setZoneInfo(zone);
            setIsInZone(true);
          } else {
            setIsBrowseMode(true);
          }
        }
      }
    } catch (err) {
      console.error('[Location] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkZoneInternal = async (
    latitude: number,
    longitude: number
  ): Promise<ZoneInfo | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/zones/check?latitude=${latitude}&longitude=${longitude}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Out of zone
          return null;
        }
        throw new Error(`Zone check failed: ${response.status}`);
      }

      const data = await response.json();

      // API returns { result: { inServiceArea, zone, store } }
      if (!data.result?.inServiceArea || !data.result?.zone) {
        return null;
      }

      const zone = data.result.zone;
      return {
        id: zone.id,
        name: zone.name,
        deliveryTimeMinutes: zone.deliveryTimeMinutes,
        deliveryFee: Number(zone.deliveryFee),
        freeDeliveryMinimum: zone.freeDeliveryMinimum ? Number(zone.freeDeliveryMinimum) : 0,
        minimumOrderAmount: zone.minimumOrderAmount ? Number(zone.minimumOrderAmount) : 0,
      };
    } catch (err) {
      console.error('[Location] Zone check error:', err);
      return null;
    }
  };

  const checkZone = useCallback(
    async (latitude: number, longitude: number): Promise<ZoneInfo | null> => {
      setIsCheckingZone(true);
      setError(null);
      try {
        const zone = await checkZoneInternal(latitude, longitude);
        return zone;
      } finally {
        setIsCheckingZone(false);
      }
    },
    []
  );

  const setDeliveryAddress = useCallback(
    async (address: DeliveryAddress) => {
      setIsLoading(true);
      setError(null);

      try {
        // Check zone
        const zone = await checkZoneInternal(address.latitude, address.longitude);

        // Save address
        await AsyncStorage.setItem(
          STORAGE_KEYS.DELIVERY_ADDRESS,
          JSON.stringify(address)
        );
        setDeliveryAddressState(address);
        setHasSetLocation(true);

        if (zone) {
          // In zone - save zone info
          await AsyncStorage.setItem(STORAGE_KEYS.ZONE_INFO, JSON.stringify(zone));
          setZoneInfo(zone);
          setIsInZone(true);
          setIsBrowseMode(false);
        } else {
          // Out of zone - enter browse mode
          await AsyncStorage.removeItem(STORAGE_KEYS.ZONE_INFO);
          setZoneInfo(null);
          setIsInZone(false);
          setIsBrowseMode(true);
        }
      } catch (err) {
        console.error('[Location] Set address error:', err);
        setError('Failed to set delivery address');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      await AsyncStorage.setItem(
        STORAGE_KEYS.LOCATION_PERMISSION,
        granted ? 'granted' : 'denied'
      );
      return granted;
    } catch (err) {
      console.error('[Location] Permission error:', err);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (err) {
      console.error('[Location] Get current location error:', err);
      return null;
    }
  }, []);

  const enterBrowseMode = useCallback(() => {
    setIsBrowseMode(true);
    setIsInZone(false);
  }, []);

  const clearLocation = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.DELIVERY_ADDRESS),
        AsyncStorage.removeItem(STORAGE_KEYS.ZONE_INFO),
      ]);
      setDeliveryAddressState(null);
      setZoneInfo(null);
      setIsInZone(false);
      setIsBrowseMode(false);
      setHasSetLocation(false);
    } catch (err) {
      console.error('[Location] Clear error:', err);
    }
  }, []);

  // Computed values
  const formattedDeliveryTime = useMemo(() => {
    if (!zoneInfo) return '';

    const minutes = zoneInfo.deliveryTimeMinutes;
    const minTime = minutes;
    const maxTime = minutes + 60; // Add buffer

    if (maxTime < 120) {
      return `${minTime} min - ${maxTime} min`;
    }

    const minHours = Math.floor(minTime / 60);
    const maxHours = Math.ceil(maxTime / 60);

    if (minHours === maxHours) {
      return `${minHours} hr`;
    }

    return `${minHours} - ${maxHours} hrs`;
  }, [zoneInfo]);

  const formattedDeliveryFee = useMemo(() => {
    if (!zoneInfo) return '';

    if (zoneInfo.deliveryFee === 0) {
      return 'Free';
    }

    return `$${zoneInfo.deliveryFee.toFixed(2)}`;
  }, [zoneInfo]);

  const value = useMemo(
    () => ({
      // State
      deliveryAddress,
      zoneInfo,
      isInZone,
      isBrowseMode,
      hasSetLocation,
      isLoading,
      isCheckingZone,
      error,

      // Actions
      setDeliveryAddress,
      checkZone,
      requestLocationPermission,
      getCurrentLocation,
      enterBrowseMode,
      clearLocation,

      // Computed
      formattedDeliveryTime,
      formattedDeliveryFee,
    }),
    [
      deliveryAddress,
      zoneInfo,
      isInZone,
      isBrowseMode,
      hasSetLocation,
      isLoading,
      isCheckingZone,
      error,
      setDeliveryAddress,
      checkZone,
      requestLocationPermission,
      getCurrentLocation,
      enterBrowseMode,
      clearLocation,
      formattedDeliveryTime,
      formattedDeliveryFee,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

/**
 * Hook to check if cart operations should be disabled (browse mode)
 */
export function useCanAddToCart(): boolean {
  const { isInZone, isBrowseMode } = useLocation();
  return isInZone && !isBrowseMode;
}

/**
 * Format address for display (single line)
 */
export function formatAddressShort(address: DeliveryAddress | null): string {
  if (!address) return '';
  return `${address.city}, ${address.state}`;
}

/**
 * Format address for display (full)
 */
export function formatAddressFull(address: DeliveryAddress | null): string {
  if (!address) return '';

  let line1 = address.streetAddress;
  if (address.secondaryAddress) {
    line1 += `, ${address.secondaryAddress}`;
  }

  return `${line1}\n${address.city}, ${address.state} ${address.zip}`;
}
