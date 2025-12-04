// components/primary-input.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

interface PrimaryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightText?: string;
  rightIcon?: string; // Add rightIcon prop
  onPressRight?: () => void;
  hasError?: boolean;
}

const PrimaryInput: React.FC<PrimaryInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  rightText,
  rightIcon,
  onPressRight,
  hasError = false,
}) => {

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#B0B0B0', dark: '#666666' }, 'tabIconDefault');
  const iconColor = useThemeColor({ light: '#666666', dark: '#999999' }, 'tabIconDefault');

  return (
    <View style={[
      styles.inputWrapper,
      {
        backgroundColor: backgroundColor,
        borderColor: hasError ? '#FF4444' : borderColor,
      }
    ]}>
      <TextInput
        style={[
          styles.input,
          { color: textColor },
          (rightText || rightIcon) && { paddingRight: 48 }
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {(rightText || rightIcon) && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onPressRight}
          activeOpacity={0.7}
        >
          {rightIcon ? (
            rightIcon === "eye" ? (
              <Ionicons name="eye" size={20} color={iconColor} />
            ) : rightIcon === "eye-off" ? (
              <Ionicons name="eye-off" size={20} color={iconColor} />
            ) : (
              <Text style={[styles.rightText, { color: iconColor }]}>{rightIcon}</Text>
            )
          ) : (
            <Text style={[styles.rightText, { color: iconColor }]}>{rightText}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PrimaryInput;

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    justifyContent: "center",
    height: 56,
  },
  input: {
    fontSize: 16,
  },
  rightButton: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  rightText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
