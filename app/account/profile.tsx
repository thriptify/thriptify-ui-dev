import { ScrollView, StyleSheet, View, Pressable, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useAppAuth } from '@/contexts/auth-context';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, firebaseUser, isLoading } = useAppAuth();

  // Form state initialized from Firebase user
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form values when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  // Check if form has changes
  const hasChanges = user && (
    firstName !== (user.firstName || '') ||
    lastName !== (user.lastName || '')
  );

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!firebaseUser) return;

    setIsSaving(true);
    try {
      // Update Firebase display name
      const displayName = `${firstName} ${lastName}`.trim();
      await updateProfile(firebaseUser, { displayName });
      router.back();
    } catch (err) {
      console.error('[Profile] Update error:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while auth is loading
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text variant="body" style={{ color: tokens.colors.semantic.text.secondary }}>
          Please sign in to view your profile
        </Text>
      </View>
    );
  }

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
            {user.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                width={100}
                height={100}
                borderRadius={50}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {(firstName?.[0] || '').toUpperCase()}{(lastName?.[0] || '').toUpperCase()}
                </Text>
              </View>
            )}
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
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.input, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>
                {user.email || 'No email'}
              </Text>
            </View>
            <Text style={styles.inputHint}>Email cannot be changed here</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '600',
    color: tokens.colors.semantic.surface.primary,
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
  readOnlyInput: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  readOnlyText: {
    fontSize: 16,
    color: tokens.colors.semantic.text.secondary,
  },
  inputHint: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    marginTop: tokens.spacing[1],
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
