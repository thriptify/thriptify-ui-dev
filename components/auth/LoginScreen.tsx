import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@thriptify/tokens/react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppAuth } from '@/contexts/auth-context';
import { applyReferralCode, claimSignupBonus } from '@/hooks/use-loyalty';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

interface LoginScreenProps {
  onSkip?: () => void;
  showSkip?: boolean;
  onContinueAsGuest?: () => void;
}

export function LoginScreen({ onSkip, showSkip = false, onContinueAsGuest }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { pendingReferralCode, clearPendingReferralCode } = useAppAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleEmailAuth = async () => {
    console.log('[Auth] handleEmailAuth called', { mode, email, hasPassword: !!password, name });

    if (mode === 'login') {
      if (!email || !password) {
        console.log('[Auth] Validation failed - missing fields for login');
        setError('Please enter your email and password');
        return;
      }
    } else {
      if (!email || !password || !name) {
        console.log('[Auth] Validation failed - missing fields for signup');
        setError('Please fill in all fields');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        console.log('[Auth] Attempting sign in with Firebase...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('[Auth] Firebase sign in successful:', userCredential.user.email);

        // Ensure user record exists in database (idempotent)
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        const idToken = await userCredential.user.getIdToken();
        console.log('[Auth] Ensuring user record exists...');

        const signupResponse = await fetch(`${apiUrl}/api/v1/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: userCredential.user.email || email,
            displayName: userCredential.user.displayName || email.split('@')[0],
          }),
        });

        if (!signupResponse.ok) {
          console.error('[Auth] Failed to ensure user record:', await signupResponse.text());
          // Continue anyway - the user is authenticated in Firebase
        } else {
          console.log('[Auth] User record verified/created');
        }
        // Auth context will automatically update via onAuthStateChanged
      } else {
        console.log('[Auth] Attempting sign up with Firebase...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('[Auth] Firebase sign up successful:', userCredential.user.email);

        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        console.log('[Auth] Profile updated with display name:', name);

        // Create user record in the database
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        const idToken = await userCredential.user.getIdToken();
        console.log('[Auth] Calling API to create user record...');

        const signupResponse = await fetch(`${apiUrl}/api/v1/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: email,
            displayName: name,
          }),
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json().catch(() => ({}));
          console.error('[Auth] API signup failed:', errorData);
          throw new Error(errorData.error?.message || 'Failed to create account');
        }

        console.log('[Auth] User record created in database');

        // Apply referral code if present (from deep link)
        if (pendingReferralCode) {
          console.log('[Auth] Applying referral code:', pendingReferralCode);
          try {
            await applyReferralCode(idToken, pendingReferralCode);
            console.log('[Auth] Referral code applied successfully');
            clearPendingReferralCode();
          } catch (referralError) {
            console.error('[Auth] Failed to apply referral code:', referralError);
            // Continue with signup even if referral fails
          }
        }

        // Claim signup bonus (generates user's own referral code)
        console.log('[Auth] Claiming signup bonus...');
        try {
          await claimSignupBonus(idToken);
          console.log('[Auth] Signup bonus claimed');
        } catch (bonusError) {
          console.error('[Auth] Failed to claim signup bonus:', bonusError);
          // Continue with signup even if bonus claim fails
        }

        // Send email verification
        await sendEmailVerification(userCredential.user);
        console.log('[Auth] Verification email sent');
        setPendingVerification(true);
      }
    } catch (err: any) {
      console.log('[Auth] Firebase error:', err.code, err.message);

      // Map Firebase error codes to user-friendly messages
      let errorMessage = 'Authentication failed';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account already exists with this email';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
        default:
          errorMessage = err.message || 'Authentication failed';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        console.log('[Auth] Verification email resent');
        setError(''); // Clear any previous error
      }
    } catch (err: any) {
      console.log('[Auth] Resend error:', err.code, err.message);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#EEF2FF', '#E0E7FF', '#C7D2FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button */}
      {showSkip && (
        <Pressable
          style={[styles.skipButton, { top: insets.top + 10 }]}
          onPress={onSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
        </Pressable>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[
                  tokens.colors.semantic.brand.primary.default,
                  tokens.colors.semantic.brand.primary.hover,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoEmoji}>🛒</Text>
              </LinearGradient>
            </View>
            <Text style={styles.welcomeText}>
              {pendingVerification
                ? 'Check your email'
                : mode === 'login'
                  ? 'Welcome back!'
                  : 'Create account'}
            </Text>
            <Text style={styles.subtitleText}>
              {pendingVerification
                ? 'We sent a verification link to your email'
                : mode === 'login'
                  ? 'Sign in to continue shopping'
                  : 'Join Thriptify for fresh groceries'}
            </Text>
          </Animated.View>

          {/* Auth Card */}
          <Animated.View
            style={[
              styles.authCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="light" style={styles.cardBlur}>
                <View style={styles.cardContent}>
                  {pendingVerification ? renderVerificationContent() : renderCardContent()}
                </View>
              </BlurView>
            ) : (
              <View style={[styles.cardContent, styles.cardAndroid]}>
                {pendingVerification ? renderVerificationContent() : renderCardContent()}
              </View>
            )}
          </Animated.View>

          {/* Terms */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  function renderVerificationContent() {
    return (
      <>
        <View style={styles.verificationHeader}>
          <Icon
            name="mail"
            size="lg"
            color={tokens.colors.semantic.brand.primary.default}
          />
          <Text style={styles.verificationTitle}>Verify your email</Text>
          <Text style={styles.verificationSubtitle}>
            We sent a verification link to{'\n'}
            <Text style={styles.verificationEmail}>{email}</Text>
          </Text>
          <Text style={styles.verificationHint}>
            Click the link in the email, then come back here to sign in.
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="info-circle" size="sm" color={tokens.colors.semantic.status.error.default} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Resend & Back */}
        <View style={styles.verificationActions}>
          <Pressable onPress={handleResendVerification} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={tokens.colors.semantic.brand.primary.default} />
            ) : (
              <Text style={styles.toggleLink}>Resend email</Text>
            )}
          </Pressable>
          <Text style={styles.toggleText}> • </Text>
          <Pressable onPress={() => {
            setPendingVerification(false);
            setMode('login');
            setError('');
          }}>
            <Text style={styles.toggleLink}>Sign in</Text>
          </Pressable>
        </View>
      </>
    );
  }

  function renderCardContent() {
    return (
      <>
        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="info-circle" size="sm" color={tokens.colors.semantic.status.error.default} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        {mode === 'signup' && (
          <View
            style={[
              styles.inputContainer,
              focusedInput === 'name' && styles.inputContainerFocused,
            ]}
          >
            <Icon
              name="user"
              size="sm"
              color={focusedInput === 'name'
                ? tokens.colors.semantic.brand.primary.default
                : tokens.colors.semantic.text.tertiary}
            />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            focusedInput === 'email' && styles.inputContainerFocused,
          ]}
        >
          <Icon
            name="mail"
            size="sm"
            color={focusedInput === 'email'
              ? tokens.colors.semantic.brand.primary.default
              : tokens.colors.semantic.text.tertiary}
          />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={tokens.colors.semantic.text.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View
          style={[
            styles.inputContainer,
            focusedInput === 'password' && styles.inputContainerFocused,
          ]}
        >
          <Icon
            name="lock"
            size="sm"
            color={focusedInput === 'password'
              ? tokens.colors.semantic.brand.primary.default
              : tokens.colors.semantic.text.tertiary}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={tokens.colors.semantic.text.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={8}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size="sm"
              color={tokens.colors.semantic.text.tertiary}
            />
          </Pressable>
        </View>

        {mode === 'login' && (
          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>
        )}

        {/* Primary Button */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            isLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleEmailAuth}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[
              tokens.colors.semantic.brand.primary.default,
              tokens.colors.semantic.brand.primary.hover,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>

        {/* Toggle Mode */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <Pressable onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}>
            <Text style={styles.toggleLink}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Text>
          </Pressable>
        </View>

        {/* Continue as Guest */}
        {onContinueAsGuest && (
          <Pressable
            style={styles.guestButton}
            onPress={onContinueAsGuest}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </Pressable>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingItem: {
    position: 'absolute',
    zIndex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    gap: 4,
  },
  skipText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing[5],
  },
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing[6],
  },
  logoContainer: {
    marginBottom: tokens.spacing[4],
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.colors.semantic.brand.primary.default,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[2],
  },
  subtitleText: {
    fontSize: 16,
    color: tokens.colors.semantic.text.secondary,
    textAlign: 'center',
  },
  authCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: tokens.spacing[6],
  },
  cardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardContent: {
    padding: tokens.spacing[5],
  },
  cardAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.error.subtle,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderRadius: 12,
    marginBottom: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  errorText: {
    flex: 1,
    color: tokens.colors.semantic.status.error.default,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 14,
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: tokens.colors.semantic.brand.primary.default,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
    paddingVertical: tokens.spacing[4],
    marginLeft: tokens.spacing[3],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: tokens.spacing[4],
    marginTop: -tokens.spacing[1],
  },
  forgotPasswordText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: tokens.spacing[2],
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonGradient: {
    paddingVertical: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: tokens.spacing[5],
  },
  toggleText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 15,
  },
  toggleLink: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 15,
    fontWeight: '700',
  },
  termsText: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.tertiary,
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '600',
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: tokens.spacing[5],
    gap: tokens.spacing[2],
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    marginTop: tokens.spacing[2],
  },
  verificationSubtitle: {
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  verificationEmail: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '600',
  },
  verificationHint: {
    fontSize: 14,
    color: tokens.colors.semantic.text.tertiary,
    textAlign: 'center',
    marginTop: tokens.spacing[2],
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing[5],
  },
  guestButton: {
    marginTop: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  guestButtonText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
