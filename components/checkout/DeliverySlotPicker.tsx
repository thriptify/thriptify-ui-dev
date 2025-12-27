import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  isPremium: boolean;
  premiumFee: number;
}

interface DeliverySlotPickerProps {
  slots: DeliverySlot[];
  selectedSlotId: string | null;
  onSlotSelect: (slotId: string) => void;
  isLoading?: boolean;
}

// Group slots by date
function groupSlotsByDate(slots: DeliverySlot[]): Map<string, DeliverySlot[]> {
  const grouped = new Map<string, DeliverySlot[]>();

  for (const slot of slots) {
    const dateSlots = grouped.get(slot.date) || [];
    dateSlots.push(slot);
    grouped.set(slot.date, dateSlots);
  }

  // Sort slots within each date by start time
  for (const [date, dateSlots] of grouped) {
    grouped.set(
      date,
      dateSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
  }

  return grouped;
}

// Format date for display
function formatDate(dateString: string): { dayName: string; dayNum: string; month: string; isToday: boolean; isTomorrow: boolean } {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.getTime() === today.getTime();
  const isTomorrow = date.getTime() === tomorrow.getTime();

  return {
    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    isToday,
    isTomorrow,
  };
}

// Format time slot
function formatTimeSlot(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${period}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function DeliverySlotPicker({
  slots,
  selectedSlotId,
  onSlotSelect,
  isLoading,
}: DeliverySlotPickerProps) {
  // Group slots by date
  const slotsByDate = useMemo(() => groupSlotsByDate(slots), [slots]);
  const dates = useMemo(() => Array.from(slotsByDate.keys()).sort(), [slotsByDate]);

  // Selected date (default to first date with available slots)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Set initial date
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      // Find the date of the selected slot, or first date with available slots
      if (selectedSlotId) {
        const selectedSlot = slots.find((s) => s.id === selectedSlotId);
        if (selectedSlot) {
          setSelectedDate(selectedSlot.date);
          return;
        }
      }

      // Default to first date with available slots
      const firstAvailableDate = dates.find((date) => {
        const dateSlots = slotsByDate.get(date);
        return dateSlots?.some((s) => s.available);
      });
      setSelectedDate(firstAvailableDate || dates[0]);
    }
  }, [dates, selectedDate, selectedSlotId, slots, slotsByDate]);

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return slotsByDate.get(selectedDate) || [];
  }, [selectedDate, slotsByDate]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={tokens.colors.semantic.brand.primary.default} />
        <Text style={styles.loadingText}>Loading delivery slots...</Text>
      </View>
    );
  }

  if (dates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="calendar" size="lg" color={tokens.colors.semantic.text.tertiary} />
        <Text style={styles.emptyText}>No delivery slots available</Text>
        <Text style={styles.emptySubtext}>Please check back later</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Selector - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContainer}
      >
        {dates.map((date) => {
          const { dayName, dayNum, month, isToday, isTomorrow } = formatDate(date);
          const isSelected = date === selectedDate;
          const dateSlots = slotsByDate.get(date) || [];
          const availableCount = dateSlots.filter((s) => s.available).length;

          return (
            <Pressable
              key={date}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateLabel,
                  isSelected && styles.dateLabelSelected,
                ]}
              >
                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayName}
              </Text>
              <Text
                style={[
                  styles.dateNum,
                  isSelected && styles.dateNumSelected,
                ]}
              >
                {dayNum}
              </Text>
              <Text
                style={[
                  styles.dateMonth,
                  isSelected && styles.dateMonthSelected,
                ]}
              >
                {month}
              </Text>
              {availableCount > 0 && (
                <View style={[styles.slotsBadge, isSelected && styles.slotsBadgeSelected]}>
                  <Text style={[styles.slotsBadgeText, isSelected && styles.slotsBadgeTextSelected]}>
                    {availableCount} slots
                  </Text>
                </View>
              )}
              {availableCount === 0 && (
                <Text style={styles.fullyBooked}>Full</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Time Slots Grid */}
      <View style={styles.timeSlotsContainer}>
        <Text variant="bodySmall" weight="semibold" style={styles.timeSlotsTitle}>
          Available Time Slots
        </Text>
        <View style={styles.timeSlotsGrid}>
          {slotsForSelectedDate.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            const isAvailable = slot.available;

            return (
              <Pressable
                key={slot.id}
                style={[
                  styles.timeSlot,
                  isSelected && styles.timeSlotSelected,
                  !isAvailable && styles.timeSlotUnavailable,
                ]}
                onPress={() => isAvailable && onSlotSelect(slot.id)}
                disabled={!isAvailable}
              >
                <View style={styles.timeSlotContent}>
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected && styles.timeSlotTextSelected,
                      !isAvailable && styles.timeSlotTextUnavailable,
                    ]}
                  >
                    {formatTimeSlot(slot.startTime, slot.endTime)}
                  </Text>
                  {slot.isPremium && isAvailable && (
                    <View style={styles.premiumBadge}>
                      <Icon name="flash" size="xs" color={tokens.colors.semantic.status.warning.default} />
                      <Text style={styles.premiumText}>+${slot.premiumFee.toFixed(2)}</Text>
                    </View>
                  )}
                  {!isAvailable && (
                    <Text style={styles.unavailableText}>Fully booked</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Icon name="checkmark" size="xs" color={tokens.colors.semantic.surface.primary} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Icon name="info" size="sm" color={tokens.colors.semantic.text.tertiary} />
        <Text style={styles.infoText}>
          Evening slots (5PM-9PM) have a small premium for priority delivery
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: tokens.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing[2],
    color: tokens.colors.semantic.text.secondary,
    fontSize: 14,
  },
  emptyContainer: {
    padding: tokens.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
  },
  emptyText: {
    marginTop: tokens.spacing[3],
    color: tokens.colors.semantic.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: tokens.spacing[1],
    color: tokens.colors.semantic.text.tertiary,
    fontSize: 14,
  },

  // Date Selector
  dateScrollContainer: {
    paddingHorizontal: tokens.spacing[1],
    paddingVertical: tokens.spacing[2],
    gap: tokens.spacing[2],
  },
  dateCard: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  dateCardSelected: {
    borderColor: tokens.colors.semantic.status.success.default,
    backgroundColor: tokens.colors.semantic.status.success.subtle,
  },
  dateLabel: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 2,
  },
  dateLabelSelected: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  dateNum: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  dateNumSelected: {
    color: tokens.colors.semantic.status.success.default,
  },
  dateMonth: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
  },
  dateMonthSelected: {
    color: tokens.colors.semantic.status.success.default,
  },
  slotsBadge: {
    marginTop: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    borderRadius: 4,
  },
  slotsBadgeSelected: {
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  slotsBadgeText: {
    fontSize: 10,
    color: tokens.colors.semantic.text.tertiary,
    fontWeight: '500',
  },
  slotsBadgeTextSelected: {
    color: tokens.colors.semantic.surface.primary,
  },
  fullyBooked: {
    marginTop: tokens.spacing[2],
    fontSize: 10,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: '500',
  },

  // Time Slots
  timeSlotsContainer: {
    marginTop: tokens.spacing[4],
  },
  timeSlotsTitle: {
    marginBottom: tokens.spacing[3],
  },
  timeSlotsGrid: {
    gap: tokens.spacing[2],
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    borderColor: tokens.colors.semantic.status.success.default,
    backgroundColor: tokens.colors.semantic.status.success.subtle,
  },
  timeSlotUnavailable: {
    opacity: 0.5,
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  timeSlotContent: {
    flex: 1,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  timeSlotTextSelected: {
    color: tokens.colors.semantic.status.success.default,
  },
  timeSlotTextUnavailable: {
    color: tokens.colors.semantic.text.tertiary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  premiumText: {
    fontSize: 12,
    color: tokens.colors.semantic.status.warning.default,
    fontWeight: '500',
  },
  unavailableText: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.status.success.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    padding: tokens.spacing[3],
    borderRadius: 8,
    marginTop: tokens.spacing[4],
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    lineHeight: 16,
  },
});
