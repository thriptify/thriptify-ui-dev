import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { tokens } from '@thriptify/tokens/react-native';

const { colors, spacing, typography, radius } = tokens;

// Message types
interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'driver';
  timestamp: Date;
}

interface DriverChatProps {
  orderId: string;
  driverName: string;
  driverPhone?: string;
  onBack: () => void;
  // In production, these would come from a real-time service (WebSocket/Firebase)
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
}

export function DriverChat({
  orderId,
  driverName,
  driverPhone,
  onBack,
  initialMessages = [],
  onSendMessage,
}: DriverChatProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'customer',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    onSendMessage?.(inputText.trim());
    setInputText('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCustomer = item.sender === 'customer';

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={[
          styles.messageContainer,
          isCustomer ? styles.customerMessage : styles.driverMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCustomer ? styles.customerBubble : styles.driverBubble,
          ]}
        >
          <Animated.Text
            style={[
              styles.messageText,
              isCustomer ? styles.customerText : styles.driverText,
            ]}
          >
            {item.text}
          </Animated.Text>
        </View>
        <Animated.Text style={[styles.timestamp, isCustomer && styles.timestampRight]}>
          {formatTime(item.timestamp)}
        </Animated.Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Animated.Text style={styles.backIcon}>←</Animated.Text>
        </TouchableOpacity>
        <Animated.Text style={styles.headerTitle}>Message</Animated.Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Driver Info */}
      <View style={styles.driverInfo}>
        <View style={styles.driverAvatar}>
          <Animated.Text style={styles.driverAvatarText}>
            {driverName.charAt(0).toUpperCase()}
          </Animated.Text>
        </View>
        <View style={styles.driverDetails}>
          <Animated.Text style={styles.driverName}>{driverName}</Animated.Text>
          <Animated.Text style={styles.driverRole}>Delivery Driver</Animated.Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type something..."
              placeholderTextColor={colors.semantic.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Animated.Text style={styles.sendIcon}>➤</Animated.Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.surface.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.semantic.text.primary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.semantic.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.border.primary,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.semantic.brand.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.semantic.text.inverse,
  },
  driverDetails: {
    marginLeft: spacing[3],
  },
  driverName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.semantic.text.primary,
  },
  driverRole: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: colors.semantic.text.secondary,
    marginTop: spacing[1],
  },
  messagesList: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  messageContainer: {
    marginBottom: spacing[4],
  },
  customerMessage: {
    alignItems: 'flex-end',
  },
  driverMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.xl,
  },
  customerBubble: {
    backgroundColor: colors.semantic.brand.primary.default,
    borderBottomRightRadius: radius.sm,
  },
  driverBubble: {
    backgroundColor: colors.semantic.surface.secondary,
    borderBottomLeftRadius: radius.sm,
  },
  messageText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
  customerText: {
    color: colors.semantic.text.inverse,
  },
  driverText: {
    color: colors.semantic.text.primary,
  },
  timestamp: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: colors.semantic.text.tertiary,
    marginTop: spacing[1],
  },
  timestampRight: {
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.semantic.border.primary,
    backgroundColor: colors.semantic.surface.primary,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.semantic.surface.secondary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[3],
    maxHeight: 100,
  },
  input: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    color: colors.semantic.text.primary,
    minHeight: 24,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.semantic.brand.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: colors.semantic.text.inverse,
  },
});

export default DriverChat;
