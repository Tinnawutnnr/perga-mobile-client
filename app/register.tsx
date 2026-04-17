import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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
import { z } from "zod";
import { authApi } from "../api/auth";
import PrimaryInput from "../components/primary-input";
import { useAuth } from "../context/auth-context";

// ── Zod schema ──────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["caregiver", "patient"]),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.agreeToTerms, {
    message: "You must agree to the terms",
    path: ["agreeToTerms"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Screen ──────────────────────────────────────────────────────────────
const RegisterScreen = () => {
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const { saveTempUsername, saveToken } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "caregiver",
      agreeToTerms: false,
    },
  });

  const role = watch("role");
  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: RegisterFormData) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim().toLowerCase();

    try {
      const res = await authApi.register({
        email: normalizedEmail,
        username: normalizedUsername,
        password: data.password,
        role: data.role,
      });
      await saveToken(res.access_token);
      saveTempUsername(normalizedUsername);
      router.push({ pathname: "/create-profile", params: { role: data.role } });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      Alert.alert("Registration Failed", message);
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

            {/* Role toggle */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleToggle}>
                {(["caregiver", "patient"] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.roleOption,
                      role === option && styles.roleOptionSelected,
                    ]}
                    onPress={() => setValue("role", option)}
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

            {/* Email input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    hasError={!!errors.email}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </>
              )}
            />

            {/* Username input */}
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Username (3–20 characters)"
                    keyboardType="default"
                    autoCapitalize="none"
                    hasError={!!errors.username}
                  />
                  {errors.username && (
                    <Text style={styles.errorText}>
                      {errors.username.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Password input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Password (min 8 characters)"
                    secureTextEntry={securePassword}
                    rightText={securePassword ? "Show" : "Hide"}
                    onPressRight={() => setSecurePassword((prev) => !prev)}
                    hasError={!!errors.password}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Confirm Password input */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Confirm Password"
                    secureTextEntry={secureConfirmPassword}
                    rightText={secureConfirmPassword ? "Show" : "Hide"}
                    onPressRight={() =>
                      setSecureConfirmPassword((prev) => !prev)
                    }
                    hasError={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Terms and conditions checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setValue("agreeToTerms", !agreeToTerms)}
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
            {errors.agreeToTerms && (
              <Text style={[styles.errorText, { marginTop: -16 }]}>
                {errors.agreeToTerms.message}
              </Text>
            )}

            {/* Register button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isSubmitting && styles.registerButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.registerButtonText}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
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
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
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
