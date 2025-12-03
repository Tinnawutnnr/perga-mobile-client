// components/PrimaryInput.tsx
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
  return (
    <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
      <TextInput
        style={[styles.input, (rightText || rightIcon) && { paddingRight: 48 }]}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
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
              <Ionicons name="eye" size={20} color="#666666" />
            ) : rightIcon === "eye-off" ? (
              <Ionicons name="eye-off" size={20} color="#666666" />
            ) : (
              <Text style={styles.rightText}>{rightIcon}</Text>
            )
          ) : (
            <Text style={styles.rightText}>{rightText}</Text>
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
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    height: 56,
  },
  inputWrapperError: {
    borderColor: "#FF4444",
    borderWidth: 2,
  },
  input: {
    fontSize: 16,
    color: "#000000",
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
    color: "#666666",
    fontWeight: "500",
  },
});
