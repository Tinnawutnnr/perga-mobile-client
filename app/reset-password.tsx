import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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

// ── Zod schema ──────────────────────────────────────────────────────────
const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only digits"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ── Screen ──────────────────────────────────────────────────────────────
const ResetPasswordScreen = () => {
  const { token, email } = useLocalSearchParams<{
    token: string;
    email: string;
  }>();
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", new_password: "", confirm_password: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      Alert.alert("Error", "Missing session token. Please restart the flow.");
      return;
    }
    try {
      const res = await authApi.resetPassword({
        reset_session_token: token,
        otp: data.otp,
        new_password: data.new_password,
      });
      Alert.alert("Success", res.message ?? "Password reset successfully.", [
        { text: "Sign In", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      Alert.alert("Error", message);
    }
  };

  const handleBack = () => {
    router.back();
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
          <View style={styles.contentContainer}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#4F7D81" />
            </TouchableOpacity>

            {/* Header icon */}
            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={40} color="#4F7D81" />
              </View>
            </View>

            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {email
                ? `Enter the 6-digit code sent to ${email} and your new password.`
                : "Enter the 6-digit code sent to your email and your new password."}
            </Text>

            {/* OTP input */}
            <Text style={styles.fieldLabel}>Verification Code</Text>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={(text) =>
                      onChange(text.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    hasError={!!errors.otp}
                    maxLength={6}
                  />
                  {errors.otp && (
                    <Text style={styles.errorText}>{errors.otp.message}</Text>
                  )}
                </>
              )}
            />

            {/* New Password */}
            <Text style={styles.fieldLabel}>New Password</Text>
            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Min 8 characters"
                    secureTextEntry={secureNew}
                    rightText={secureNew ? "Show" : "Hide"}
                    onPressRight={() => setSecureNew((prev) => !prev)}
                    hasError={!!errors.new_password}
                  />
                  {errors.new_password && (
                    <Text style={styles.errorText}>
                      {errors.new_password.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Confirm Password */}
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Re-enter new password"
                    secureTextEntry={secureConfirm}
                    rightText={secureConfirm ? "Show" : "Hide"}
                    onPressRight={() => setSecureConfirm((prev) => !prev)}
                    hasError={!!errors.confirm_password}
                  />
                  {errors.confirm_password && (
                    <Text style={styles.errorText}>
                      {errors.confirm_password.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>

            {/* Back to login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEF4F5",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#808080",
    lineHeight: 22,
    marginBottom: 32,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#C4C4C4",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
});
