import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

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
  placeholder = "Tap to select",
  onChange,
  onClear,
}: DatePickerFieldProps) {
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const scheme = useColorScheme() ?? "light";

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && date) onChange(date);
    } else {
      // iOS spinner — เก็บค่าชั่วคราวใน tempDate ไม่ call onChange
      // เพื่อไม่ให้ parent re-render ระหว่าง scroll แล้วสีหาย
      if (date) setTempDate(date);
    }
  };

  const handleDone = () => {
    if (tempDate) onChange(tempDate);
    setTempDate(null);
    setShowPicker(false);
  };

  const handleOpen = () => {
    setTempDate(value);
    setShowPicker(true);
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
      {/* Card row */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardColor, flex: 1 }]}
          onPress={() => showPicker ? setShowPicker(false) : handleOpen()}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: tintColor + "22" }]}>
            <Ionicons name="calendar-outline" size={18} color={tintColor} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <ThemedText style={styles.subLabel}>
              {showPicker ? "Tap to close" : "Tap to change"}
            </ThemedText>
          </View>
          {/* วันที่ที่เลือก */}
          {formattedValue && (
            <ThemedText style={[styles.dateChip, { color: tintColor }]}>
              {formattedValue}
            </ThemedText>
          )}
          <Ionicons
            name={showPicker ? "chevron-up" : "chevron-down"}
            size={16}
            color={tintColor}
          />
        </TouchableOpacity>

        {/* Clear button */}
        {value && onClear && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: cardColor }]}
            onPress={() => {
              setShowPicker(false);
              onClear();
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close-outline"
              size={24}
              color={Colors[scheme].error}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Picker */}
      {showPicker && (
        <View
          style={[
            styles.pickerWrap,
            { backgroundColor: cardColor },
          ]}
        >
          {Platform.OS === "ios" && (
            <TouchableOpacity onPress={handleDone} style={styles.doneRow}>
              <ThemedText style={[styles.doneText, { color: tintColor }]}>
                Done
              </ThemedText>
            </TouchableOpacity>
          )}
          <DateTimePicker
            value={tempDate ?? value ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            maximumDate={new Date()}
            accentColor={tintColor}
            textColor={scheme === "dark" ? "#FFFFFF" : "#11181C"}
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
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  subLabel: {
    fontSize: 13,
    opacity: 0.4,
    marginTop: 2,
  },
  dateChip: {
    fontSize: 13,
    fontWeight: "600",
  },
  pickerWrap: {
    borderRadius: 16,
    overflow: "hidden",
  },
  doneRow: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#88888844",
  },
  doneText: {
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    width: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});