import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  placeholder?: string;
  onChange: (date: Date) => void;
  onClear?: () => void;
}

export function DatePickerField({
  label,
  value,
  placeholder = "Select a date",
  onChange,
  onClear,
}: DatePickerFieldProps) {
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (event.type === "set" && date) onChange(date);
    } else {
      if (date) setTempDate(date);
    }
  };

  const handleConfirm = () => {
    if (tempDate) onChange(tempDate);
    setTempDate(null);
    setOpen(false);
  };

  const handleTriggerPress = () => {
    if (open) {
      // Dismiss without confirming — discard tempDate
      setTempDate(null);
      setOpen(false);
    } else {
      setTempDate(value);
      setOpen(true);
    }
  };

  const formattedValue = value
    ? value.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <View style={styles.wrapper}>
      {/* ── Trigger field ── */}
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: cardColor,
            borderColor: open ? tintColor : borderColor,
            borderWidth: open ? 1.5 : 1,
          },
        ]}
        onPress={handleTriggerPress}
        activeOpacity={0.85}
        accessibilityLabel={
          formattedValue
            ? `${label}: ${formattedValue}. Double tap to ${open ? "close" : "change"}.`
            : `${label}: not set. Double tap to select.`
        }
        accessibilityRole="button"
      >
        {/* Date or placeholder */}
        <View style={styles.triggerContent}>
          {formattedValue ? (
            <Text style={[styles.dateValue, { color: C.text }]}>
              {formattedValue}
            </Text>
          ) : (
            <Text style={[styles.placeholder, { color: C.muted }]}>
              {placeholder}
            </Text>
          )}
        </View>

        {/* Right controls: clear (if set) + icon */}
        <View style={styles.rightControls}>
          {value && onClear && (
            <TouchableOpacity
              onPress={() => {
                setOpen(false);
                setTempDate(null);
                onClear();
              }}
              hitSlop={10}
              style={styles.clearButton}
              accessibilityLabel="Clear selected date"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
          <Ionicons
            name={
              open
                ? "chevron-up"
                : formattedValue
                ? "chevron-down"
                : "calendar-outline"
            }
            size={18}
            color={open ? tintColor : C.muted}
          />
        </View>
      </TouchableOpacity>

      {/* ── Picker panel ── */}
      {open && (
        <View style={[styles.pickerPanel, { backgroundColor: cardColor }]}>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.confirmRow, { borderBottomColor: borderColor }]}
            accessibilityRole="button"
            accessibilityLabel="Confirm selected date"
          >
            <Text style={[styles.confirmText, { color: tintColor }]}>
              Confirm
            </Text>
          </TouchableOpacity>
          <DateTimePicker
            value={tempDate ?? value ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            maximumDate={new Date()}
            accentColor={tintColor}
            textColor={scheme === "dark" ? "#E4F0F2" : "#0E1A1C"}
            style={{ alignSelf: "center" }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    gap: 8,
  },
  triggerContent: {
    flex: 1,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  placeholder: {
    fontSize: 16,
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearButton: {
    padding: 2,
  },
  pickerPanel: {
    borderRadius: 14,
    overflow: "hidden",
  },
  confirmRow: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
