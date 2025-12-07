import { ScrollView, StyleSheet, View, Pressable, Platform, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';

// Mock user data
const USER_DATA = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (415) 555-0123',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  memberSince: 'January 2024',
};

// Menu sections
const ACCOUNT_MENU = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Edit Profile', icon: 'user', route: '/account/profile' },
      { id: 'addresses', label: 'Saved Addresses', icon: 'location', route: '/account/addresses', badge: '2' },
      { id: 'payments', label: 'Payment Methods', icon: 'card', route: '/account/payments', badge: '3' },
    ],
  },
  {
    title: 'Orders',
    items: [
      { id: 'orders', label: 'Order History', icon: 'document-text', route: '/account/orders' },
      { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/account/favorites' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/account/notifications', hasToggle: true },
      { id: 'help', label: 'Help & Support', icon: 'help-circle', route: '/account/help' },
      { id: 'about', label: 'About', icon: 'information-circle', route: '/account/about' },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleMenuPress = (item: typeof ACCOUNT_MENU[0]['items'][0]) => {
    if (item.hasToggle) {
      return; // Toggle is handled separately
    }
    router.push(item.route as any);
  };

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    // In a real app, this would clear auth state and navigate to login
    console.log('Logout pressed');
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Pressable
          style={styles.profileCard}
          onPress={() => router.push('/account/profile')}
        >
          <Image
            source={{ uri: USER_DATA.avatar }}
            width={64}
            height={64}
            borderRadius={32}
          />
          <View style={styles.profileInfo}>
            <Text variant="h4" style={styles.profileName}>{USER_DATA.name}</Text>
            <Text style={styles.profileEmail}>{USER_DATA.email}</Text>
            <Text style={styles.memberSince}>Member since {USER_DATA.memberSince}</Text>
          </View>
          <Icon name="chevron-right" size="md" color={tokens.colors.semantic.text.tertiary} />
        </Pressable>

        {/* Wallet Card */}
        <Pressable
          style={styles.walletCard}
          onPress={() => router.push('/account/wallet')}
        >
          <View style={styles.walletIconContainer}>
            <Icon name="wallet" size="lg" color={tokens.colors.semantic.surface.primary} />
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Thriptify Money</Text>
            <Text variant="h3" style={styles.walletBalance}>$24.50</Text>
          </View>
          <View style={styles.addMoneyButton}>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </View>
        </Pressable>

        {/* Menu Sections */}
        {ACCOUNT_MENU.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuItems}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <View style={styles.menuItemIcon}>
                    <Icon name={item.icon} size="md" color={tokens.colors.semantic.text.secondary} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.menuItemBadge}>
                      <Text style={styles.menuItemBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {item.hasToggle ? (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{
                        false: tokens.colors.semantic.surface.tertiary,
                        true: tokens.colors.semantic.brand.primary.default,
                      }}
                      thumbColor={tokens.colors.semantic.surface.primary}
                    />
                  ) : (
                    <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size="md" color={tokens.colors.semantic.status.error.default} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <Pressable
          style={[styles.floatingCartButton, { bottom: insets.bottom + 16 }]}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartIconContainer}>
            <Icon name="bag" size="md" color={tokens.colors.semantic.surface.primary} />
          </View>
          <View style={styles.cartButtonContent}>
            <Text style={styles.cartItemCount}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
            <Text style={styles.viewCartText}>View cart</Text>
          </View>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.surface.primary} />
        </Pressable>
      )}
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing[4],
  },
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  profileInfo: {
    flex: 1,
    marginLeft: tokens.spacing[4],
  },
  profileName: {
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  // Wallet Card
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 16,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    marginLeft: tokens.spacing[3],
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  walletBalance: {
    color: tokens.colors.semantic.surface.primary,
  },
  addMoneyButton: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 8,
  },
  addMoneyText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '600',
    fontSize: 14,
  },
  // Menu Sections
  menuSection: {
    marginBottom: tokens.spacing[6],
  },
  menuSectionTitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[1],
  },
  menuItems: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
  },
  menuItemBadge: {
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 10,
    marginRight: tokens.spacing[2],
  },
  menuItemBadgeText: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    fontWeight: '500',
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[2],
  },
  logoutText: {
    fontSize: 16,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    marginTop: tokens.spacing[4],
  },
  // Floating Cart Button
  floatingCartButton: {
    position: 'absolute',
    left: tokens.spacing[4],
    right: tokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 12,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  cartButtonContent: {
    flex: 1,
  },
  cartItemCount: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 12,
    opacity: 0.9,
  },
  viewCartText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
