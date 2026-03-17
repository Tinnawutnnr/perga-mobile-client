import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../api/auth";
import PrimaryInput from "../components/primary-input";
import { useAuth } from "../context/auth-context";
import {
    doPasswordsMatch,
    isValidPassword,
    isValidUsername,
} from "../utils/validation";

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("caretaker");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { saveTempUsername, saveToken } = useAuth();

  const hasUsernameError = username.length > 0 && !isValidUsername(username);
  const hasPasswordError = password.length > 0 && !isValidPassword(password);
  const hasConfirmPasswordError =
    confirmPassword.length > 0 && !doPasswordsMatch(password, confirmPassword);

  const isFormValid =
    agreeToTerms &&
    isValidUsername(username) &&
    role.trim().length > 0 &&
    isValidPassword(password) &&
    doPasswordsMatch(password, confirmPassword);

  const handleRegister = async () => {
    if (!isValidPassword(password)) return;
    if (!doPasswordsMatch(password, confirmPassword)) return;
    if (!agreeToTerms) return;

    setIsLoading(true);
    try {
      const res = await authApi.register({ username, password, role });
      saveToken(res.access_token);
      saveTempUsername(username);
      router.push({ pathname: "/create-profile", params: { role } });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleTermsPress = () => {
    console.log("Open terms and conditions");
  };

  const handlePrivacyPress = () => {
    console.log("Open privacy policy");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg",
              }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Bottom content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            {/* Role input */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleToggle}>
                {["caretaker", "patient"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.roleOption,
                      role === option && styles.roleOptionSelected,
                    ]}
                    onPress={() => setRole(option)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        role === option && styles.roleOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <PrimaryInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username (3–20 characters)"
              keyboardType="default"
              hasError={hasUsernameError}
            />

            {/* Password input */}
            <PrimaryInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={securePassword}
              rightText={securePassword ? "Show" : "Hide"}
              onPressRight={() => setSecurePassword((prev) => !prev)}
              hasError={hasPasswordError}
            />

            {/* Confirm Password input */}
            <PrimaryInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry={secureConfirmPassword}
              rightText={secureConfirmPassword ? "Show" : "Hide"}
              onPressRight={() => setSecureConfirmPassword((prev) => !prev)}
              hasError={hasConfirmPasswordError}
            />

            {/* Terms and conditions checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeToTerms && styles.checkboxChecked,
                ]}
              >
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I agree to the </Text>
                <TouchableOpacity onPress={handleTermsPress}>
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity onPress={handlePrivacyPress}>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Register button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (!isFormValid || isLoading) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Login text */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    height: 200,
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#4F7D81",
    borderColor: "#4F7D81",
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  termsText: {
    fontSize: 14,
    color: "#808080",
    lineHeight: 20,
  },
  termsLink: {
    fontSize: 14,
    color: "#477E85",
    fontWeight: "600",
    lineHeight: 20,
  },
  registerButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: "#C4C4C4",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#808080",
  },
  loginLink: {
    fontSize: 14,
    color: "#477E85",
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    fontSize: 12,
    color: "#808080",
    marginHorizontal: 8,
  },
  socialWrapper: {
    alignItems: "center",
  },
  googleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 8,
  },
  roleToggle: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  roleOptionSelected: {
    backgroundColor: "#4F7D81",
  },
  roleOptionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#808080",
  },
  roleOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
