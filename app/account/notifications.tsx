import { ScrollView, StyleSheet, View, Pressable, Switch, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Notification settings structure
interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface NotificationSection {
  id: string;
  title: string;
  settings: NotificationSetting[];
}

const INITIAL_NOTIFICATIONS: NotificationSection[] = [
  {
    id: 'orders',
    title: 'Order Updates',
    settings: [
      {
        id: 'order_confirmation',
        title: 'Order Confirmation',
        description: 'Receive notifications when your order is placed',
        enabled: true,
      },
      {
        id: 'order_shipped',
        title: 'Order Shipped',
        description: 'Get notified when your order is out for delivery',
        enabled: true,
      },
      {
        id: 'order_delivered',
        title: 'Order Delivered',
        description: 'Receive confirmation when your order is delivered',
        enabled: true,
      },
    ],
  },
  {
    id: 'promotions',
    title: 'Promotions & Offers',
    settings: [
      {
        id: 'deals',
        title: 'Daily Deals',
        description: 'Get notified about exclusive daily deals',
        enabled: true,
      },
      {
        id: 'flash_sales',
        title: 'Flash Sales',
        description: 'Be the first to know about flash sales',
        enabled: false,
      },
      {
        id: 'personalized',
        title: 'Personalized Recommendations',
        description: 'Receive product recommendations based on your preferences',
        enabled: true,
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    settings: [
      {
        id: 'password_changes',
        title: 'Password Changes',
        description: 'Get alerts when your password is changed',
        enabled: true,
      },
      {
        id: 'login_alerts',
        title: 'Login Alerts',
        description: 'Receive notifications for new device logins',
        enabled: true,
      },
      {
        id: 'payment_updates',
        title: 'Payment Updates',
        description: 'Get notified about payment method changes',
        enabled: true,
      },
    ],
  },
  {
    id: 'reminders',
    title: 'Reminders',
    settings: [
      {
        id: 'cart_reminder',
        title: 'Abandoned Cart',
        description: 'Remind me about items left in my cart',
        enabled: true,
      },
      {
        id: 'restock',
        title: 'Restock Reminders',
        description: 'Get reminded to restock items you buy regularly',
        enabled: false,
      },
      {
        id: 'wishlist',
        title: 'Wishlist Price Drops',
        description: 'Notify when items in your wishlist go on sale',
        enabled: true,
      },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleToggle = (sectionId: string, settingId: string) => {
    setNotifications(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            settings: section.settings.map(setting => {
              if (setting.id === settingId) {
                return { ...setting, enabled: !setting.enabled };
              }
              return setting;
            }),
          };
        }
        return section;
      })
    );
  };

  const handleToggleAll = (sectionId: string, enabled: boolean) => {
    setNotifications(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            settings: section.settings.map(setting => ({
              ...setting,
              enabled,
            })),
          };
        }
        return section;
      })
    );
  };

  const getSectionEnabled = (sectionId: string): boolean => {
    const section = notifications.find(s => s.id === sectionId);
    return section?.settings.every(s => s.enabled) ?? false;
  };

  const getSectionPartial = (sectionId: string): boolean => {
    const section = notifications.find(s => s.id === sectionId);
    if (!section) return false;
    const enabledCount = section.settings.filter(s => s.enabled).length;
    return enabledCount > 0 && enabledCount < section.settings.length;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Channels */}
        <View style={styles.channelsSection}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <View style={styles.channelsCard}>
            <View style={styles.channelItem}>
              <View style={styles.channelInfo}>
                <View style={styles.channelIcon}>
                  <Icon name="notifications" size="md" color={tokens.colors.semantic.brand.primary.default} />
                </View>
                <View>
                  <Text style={styles.channelTitle}>Push Notifications</Text>
                  <Text style={styles.channelDescription}>Receive alerts on your device</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{
                  false: tokens.colors.semantic.surface.tertiary,
                  true: tokens.colors.semantic.brand.primary.default,
                }}
                thumbColor={tokens.colors.semantic.surface.primary}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.channelItem}>
              <View style={styles.channelInfo}>
                <View style={styles.channelIcon}>
                  <Icon name="mail" size="md" color={tokens.colors.semantic.brand.primary.default} />
                </View>
                <View>
                  <Text style={styles.channelTitle}>Email</Text>
                  <Text style={styles.channelDescription}>sarah.johnson@email.com</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{
                  false: tokens.colors.semantic.surface.tertiary,
                  true: tokens.colors.semantic.brand.primary.default,
                }}
                thumbColor={tokens.colors.semantic.surface.primary}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.channelItem}>
              <View style={styles.channelInfo}>
                <View style={styles.channelIcon}>
                  <Icon name="chatbubble" size="md" color={tokens.colors.semantic.brand.primary.default} />
                </View>
                <View>
                  <Text style={styles.channelTitle}>SMS</Text>
                  <Text style={styles.channelDescription}>+1 (415) 555-0123</Text>
                </View>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{
                  false: tokens.colors.semantic.surface.tertiary,
                  true: tokens.colors.semantic.brand.primary.default,
                }}
                thumbColor={tokens.colors.semantic.surface.primary}
              />
            </View>
          </View>
        </View>

        {/* Notification Preferences */}
        {notifications.map((section) => (
          <View key={section.id} style={styles.preferencesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Pressable
                style={styles.toggleAllButton}
                onPress={() => handleToggleAll(section.id, !getSectionEnabled(section.id))}
              >
                <Text style={styles.toggleAllText}>
                  {getSectionEnabled(section.id) ? 'Disable all' : 'Enable all'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.preferencesCard}>
              {section.settings.map((setting, index) => (
                <View key={setting.id}>
                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceTitle}>{setting.title}</Text>
                      <Text style={styles.preferenceDescription}>{setting.description}</Text>
                    </View>
                    <Switch
                      value={setting.enabled}
                      onValueChange={() => handleToggle(section.id, setting.id)}
                      trackColor={{
                        false: tokens.colors.semantic.surface.tertiary,
                        true: tokens.colors.semantic.brand.primary.default,
                      }}
                      thumbColor={tokens.colors.semantic.surface.primary}
                    />
                  </View>
                  {index < section.settings.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Icon name="information-circle" size="md" color={tokens.colors.semantic.text.tertiary} />
          <Text style={styles.infoText}>
            Some notifications are required for order updates and cannot be disabled.
          </Text>
        </View>

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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing[4],
  },
  // Channels Section
  channelsSection: {
    marginBottom: tokens.spacing[6],
  },
  sectionTitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[1],
  },
  channelsCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing[4],
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing[3],
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${tokens.colors.semantic.brand.primary.default}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  channelDescription: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginLeft: tokens.spacing[4],
  },
  // Preferences Section
  preferencesSection: {
    marginBottom: tokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[1],
  },
  toggleAllButton: {
    paddingVertical: tokens.spacing[1],
  },
  toggleAllText: {
    fontSize: 13,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  preferencesCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing[4],
  },
  preferenceInfo: {
    flex: 1,
    paddingRight: tokens.spacing[3],
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
});
