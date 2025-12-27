import { ScrollView, StyleSheet, View, Pressable, Platform, Switch, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '@/contexts/cart-context';
import { useAppAuth } from '@/contexts/auth-context';
import { useAddresses, useOrders } from '@/hooks/use-api';
import { useLocation } from '@/contexts/location-context';

type MenuItem = {
  id: string;
  type?: 'divider';
  label?: string;
  icon?: string;
  route?: string;
  badge?: string;
  value?: string;
  hasToggle?: boolean;
};

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const { signOut, isAuthenticated, isGuest, exitGuestMode, user } = useAppAuth();
  const { clearLocation } = useLocation();
  const { clearCart } = useCart();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch addresses to show count (only if signed in)
  const { data: addresses } = useAddresses();
  const { data: ordersData } = useOrders();

  // Active orders count (pending, confirmed, picking, packed, out_for_delivery)
  const activeOrdersCount = useMemo(() => {
    if (!ordersData?.orders) return 0;
    const activeStatuses = ['pending', 'confirmed', 'picking', 'packed', 'out_for_delivery'];
    return ordersData.orders.filter(o => activeStatuses.includes(o.status)).length;
  }, [ordersData?.orders]);

  // Build menu items with dynamic data
  const menuItems: MenuItem[] = useMemo(() => [
    // Account section
    { id: 'profile', label: 'Edit Profile', icon: 'user', route: '/account/profile' },
    { id: 'addresses', label: 'Addresses', icon: 'location', route: '/account/addresses', badge: addresses?.length ? String(addresses.length) : undefined },
    { id: 'payments', label: 'Payment Methods', icon: 'card', route: '/account/payments' },
    { id: 'divider1', type: 'divider' },
    // Orders section
    { id: 'orders', label: 'My Orders', icon: 'bag', route: '/account/orders', badge: activeOrdersCount > 0 ? String(activeOrdersCount) : undefined },
    { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/account/favorites' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet', route: '/account/wallet' },
    { id: 'rewards', label: 'Rewards', icon: 'gift', route: '/rewards' },
    { id: 'divider2', type: 'divider' },
    // Settings section
    { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/account/notifications', hasToggle: true },
    { id: 'help', label: 'Help & Support', icon: 'help-circle', route: '/account/help' },
    { id: 'about', label: 'About', icon: 'information-circle', route: '/account/about' },
    { id: 'divider3', type: 'divider' },
    // Dev section
    { id: 'security', label: 'Security & Tokens', icon: 'key', route: '/account/security-test' },
  ], [addresses?.length, activeOrdersCount]);

  // Show sign-in prompt if not authenticated (guest or not signed in)
  const showSignInPrompt = isGuest || !isAuthenticated;

  const handleMenuPress = (item: MenuItem) => {
    if (item.hasToggle || item.type === 'divider') return;
    router.push(item.route as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              // Clear local data before signing out
              await clearLocation();
              clearCart();
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // Sign-in prompt for guests and unauthenticated users
  if (showSignInPrompt) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <Text variant="h3" style={styles.headerTitle}>Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.guestContainer}>
          <LinearGradient
            colors={[tokens.colors.semantic.brand.primary.default, tokens.colors.semantic.brand.primary.hover]}
            style={styles.guestAvatar}
          >
            <Icon name="user" size="xl" color="#FFF" />
          </LinearGradient>

          <Text variant="h3" style={styles.guestTitle}>Welcome!</Text>
          <Text style={styles.guestSubtitle}>Sign in to track orders, save addresses, and earn rewards</Text>

          <Pressable style={styles.loginBtn} onPress={() => exitGuestMode()}>
            <Text style={styles.loginBtnText}>Sign In or Create Account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const userName = user?.firstName || 'User';
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userAvatar = user?.imageUrl;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: itemCount > 0 ? 120 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Row */}
        <Pressable style={styles.profileRow} onPress={() => router.push('/account/profile')}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} width={56} height={56} borderRadius={28} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{userEmail}</Text>
          </View>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
        </Pressable>

        {/* Menu List */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return <View key={item.id} style={styles.divider} />;
            }

            return (
              <Pressable
                key={item.id}
                style={styles.menuRow}
                onPress={() => handleMenuPress(item)}
              >
                <View style={[styles.iconCircle, { backgroundColor: getIconBg(item.icon!) }]}>
                  <Icon name={item.icon!} size="sm" color="#FFF" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>

                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}

                {item.value && (
                  <Text style={styles.valueText}>{item.value}</Text>
                )}

                {item.hasToggle ? (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{
                      false: tokens.colors.semantic.surface.tertiary,
                      true: tokens.colors.semantic.brand.primary.default,
                    }}
                    thumbColor="#FFF"
                    style={{ transform: [{ scale: 0.85 }] }}
                  />
                ) : (
                  <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.quaternary} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Logout */}
        <Pressable
          style={styles.logoutRow}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>{isLoggingOut ? 'Logging out...' : 'Log Out'}</Text>
        </Pressable>

        <Text style={styles.version}>Thriptify v1.0.0</Text>
      </ScrollView>

      {/* Floating Cart */}
      {itemCount > 0 && (
        <Pressable
          style={[styles.cartBar, { bottom: insets.bottom + 16 }]}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <Text style={styles.cartText}>View Cart</Text>
          <Icon name="arrow-right" size="sm" color="#FFF" />
        </Pressable>
      )}
    </View>
  );
}

// Icon background colors
function getIconBg(icon: string): string {
  const colors: Record<string, string> = {
    user: '#6366F1',
    location: '#F59E0B',
    card: '#10B981',
    bag: '#3B82F6',
    heart: '#EF4444',
    wallet: '#8B5CF6',
    gift: '#FF6B6B',
    bell: '#F97316',
    'help-circle': '#6B7280',
    'information-circle': '#64748B',
    key: '#78716C',
  };
  return colors[icon] || tokens.colors.semantic.brand.primary.default;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    color: tokens.colors.semantic.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },

  // Profile Row
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 1 },
    }),
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },

  // Menu Card
  menuCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 1 },
    }),
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginLeft: 52,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
  },
  badge: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
    marginRight: 6,
  },

  // Logout
  logoutRow: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 1 },
    }),
  },
  logoutText: {
    fontSize: 16,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: tokens.colors.semantic.text.quaternary,
    marginTop: 20,
  },

  // Cart Bar
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Guest
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    color: tokens.colors.semantic.text.primary,
    marginBottom: 8,
  },
  guestSubtitle: {
    color: tokens.colors.semantic.text.secondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  loginBtn: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
