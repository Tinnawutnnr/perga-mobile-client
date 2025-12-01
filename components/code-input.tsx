import React, { useEffect, useRef } from "react";
import {
    StyleSheet,
    TextInput
} from "react-native";

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

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyPress = ({ nativeEvent }: any) => {
    onKeyPress(nativeEvent.key);
  };

  const handleChange = (text: string) => {
    // รับแค่ตัวสุดท้าย
    const lastChar = text.slice(-1);
    onChangeText(lastChar);
  };

  return (
    <TextInput
      ref={inputRef}
      style={[styles.input, value !== "" && styles.inputFilled]}
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
    borderColor: "#E5E5E5",
    fontSize: 20,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },
  inputFilled: {
    borderColor: "#4F7D81",
  },
});