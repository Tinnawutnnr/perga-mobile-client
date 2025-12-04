import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  TextInput
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";

interface CodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
  onKeyPress: (key: string) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChangeText,
  index,
  isFocused,
  onFocus,
  onKeyPress,
}) => {
  const inputRef = useRef<TextInput>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyPress = ({ nativeEvent }: any) => {
    onKeyPress(nativeEvent.key);
  };

  const handleChange = (text: string) => {
    // Accept only the last character
    const lastChar = text.slice(-1);
    onChangeText(lastChar);
  };

  return (
    <TextInput
      ref={inputRef}
      style={[
        styles.input,
        {
          borderColor: isFocused || value !== "" ? tintColor : borderColor,
          backgroundColor: backgroundColor,
          color: textColor,
        }
      ]}
      value={value}
      onChangeText={handleChange}
      onKeyPress={handleKeyPress}
      onFocus={onFocus}
      keyboardType="number-pad"
      maxLength={1}
      textAlign="center"
      autoFocus={index === 0}
      returnKeyType="next"
    />
  );
};

export default CodeInput;

const styles = StyleSheet.create({
  input: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 20,
    textAlign: "center",
  },
});