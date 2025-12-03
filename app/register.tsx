import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryInput from "../components/primary-input";
import { useAuth } from "../context/auth-context";
import { doPasswordsMatch, isValidEmail, isValidPassword } from "../utils/validation";

const RegisterScreen = () => {
  const { saveTempEmail } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Check if form fields have errors
  const hasFullNameError = fullName.length > 0 && fullName.trim().length === 0;
  const hasEmailError = email.length > 0 && !isValidEmail(email);
  const hasPasswordError = password.length > 0 && !isValidPassword(password);
  const hasConfirmPasswordError = confirmPassword.length > 0 && !doPasswordsMatch(password, confirmPassword);

  // Check if form is valid for submission
  const isFormValid = agreeToTerms && 
                     fullName && 
                     email && 
                     password && 
                     confirmPassword && 
                     isValidPassword(password) && 
                     isValidEmail(email);

  const handleRegister = () => {
    if (!isValidEmail(email)) {
      console.log("Please enter a valid email address");
      return;
    }
    if (!isValidPassword(password)) {
      console.log("Password must be at least 8 characters");
      return;
    }
    if (!doPasswordsMatch(password, confirmPassword)) {
      console.log("Passwords don't match");
      return;
    }
    if (!agreeToTerms) {
      console.log("Must agree to terms");
      return;
    }
    console.log("Register:", { fullName, email, password });
    // redirect to confirmation
    saveTempEmail(email);
    router.push("/confirmation-code");
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

            {/* Full name input */}
            <PrimaryInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              keyboardType="default"
              hasError={hasFullNameError}
            />

            {/* Email input */}
            <PrimaryInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@email.com"
              keyboardType="email-address"
              hasError={hasEmailError}
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
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
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
                !isFormValid && styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={!isFormValid}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Login text */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            {/* <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* Google button */}
            {/* <View style={styles.socialWrapper}>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleRegister}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View> */}
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
});
