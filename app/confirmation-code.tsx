import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CodeInput from "../components/code-input";
import { useAuth } from "../context/auth-context";

const CODE_LENGTH = 4;

const ConfirmationCodeScreen = () => {
  const { tempEmail, clearTempEmail } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);

  // useEffect(() => {
  //   // wait for component mount
  //   const timer = setTimeout(() => {
  //     if (tempEmail) {
  //       setEmail(tempEmail);
  //     } else {
  //       router.replace("/login");
  //     }
  //   }, 100); 

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      // if website platform component stable
      const timer = setTimeout(() => {
        if (!tempEmail) {
          router.replace("/login");
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      
      // others
      if (!tempEmail) {
        router.replace("/login");
      }
    }

    if (tempEmail) {
      setEmail(tempEmail);
    }
  }, [tempEmail]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < CODE_LENGTH - 1) {
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && code[index] === "" && index > 0) {
      setFocusedIndex(index - 1);
    }
  };

  const handleResend = () => {
    console.log("Resend code");
    // TODO: call API resend
  };

  const handleContinue = () => {
    const finalCode = code.join("");
    if (finalCode.length === 4) {
      console.log("Confirm code:", finalCode);
      clearTempEmail(); // Clear temp
      router.replace("/(tabs)/summary");
    }
  };

  const isComplete = code.join("").length === CODE_LENGTH;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Enter confirmation code</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            A 4-digit code was sent to{"\n"}
            <Text style={styles.subtitleBold}>{email || "Loading..."}</Text>
          </Text>

          {/* Code boxes */}
          <View style={styles.codeRow}>
            {code.map((value, index) => (
              <CodeInput
                key={index}
                value={value}
                onChangeText={(text) => handleChange(text, index)}
                index={index}
                isFocused={focusedIndex === index}
                onFocus={() => setFocusedIndex(index)}
                onKeyPress={(key) => handleKeyPress(key, index)}
              />
            ))}
          </View>

          {/* Resend link */}
          <TouchableOpacity onPress={handleResend} style={styles.resendWrapper}>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.button, !isComplete && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!isComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConfirmationCodeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  subtitleBold: {
    fontWeight: "500",
    color: "#555555",
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  resendWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#4F7D81",
    fontWeight: "500",
  },
  button: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9FB6B9",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});