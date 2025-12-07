import { ScrollView, StyleSheet, View, Pressable, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Mock user data
const INITIAL_USER_DATA = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (415) 555-0123',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(INITIAL_USER_DATA.name);
  const [email, setEmail] = useState(INITIAL_USER_DATA.email);
  const [phone, setPhone] = useState(INITIAL_USER_DATA.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = name !== INITIAL_USER_DATA.name ||
    email !== INITIAL_USER_DATA.email ||
    phone !== INITIAL_USER_DATA.phone;

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    // In a real app, this would update the user data
    router.back();
  };

  const handleChangeAvatar = () => {
    // In a real app, this would open image picker
    console.log('Change avatar pressed');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: INITIAL_USER_DATA.avatar }}
              width={100}
              height={100}
              borderRadius={50}
            />
            <Pressable style={styles.changeAvatarButton} onPress={handleChangeAvatar}>
              <Icon name="camera" size="sm" color={tokens.colors.semantic.surface.primary} />
            </Pressable>
          </View>
          <Pressable onPress={handleChangeAvatar}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Delete Account */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Pressable style={styles.deleteButton}>
            <Icon name="trash" size="md" color={tokens.colors.semantic.status.error.default} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </Pressable>
          <Text style={styles.deleteWarning}>
            This action cannot be undone. All your data will be permanently removed.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + tokens.spacing[4] }]}>
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
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
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.spacing[3],
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.semantic.surface.secondary,
  },
  changePhotoText: {
    fontSize: 14,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  // Form Section
  formSection: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  },
  inputGroup: {
    marginBottom: tokens.spacing[4],
  },
  inputLabel: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
    fontWeight: '500',
  },
  input: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  // Danger Section
  dangerSection: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
  },
  dangerTitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing[3],
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    padding: tokens.spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.error.default,
    marginBottom: tokens.spacing[2],
  },
  deleteButtonText: {
    fontSize: 16,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: '500',
  },
  deleteWarning: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    lineHeight: 18,
  },
  // Footer
  footer: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    padding: tokens.spacing[4],
  },
  saveButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 12,
    padding: tokens.spacing[4],
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
