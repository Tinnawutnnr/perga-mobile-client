import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
import { AuthPalette, AuthRadius, AuthSpacing } from "../constants/auth-theme";
import { Fonts } from "../constants/fonts";
import { useColorScheme } from "../hooks/use-color-scheme";

const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "The code must be exactly 6 digits")
      .regex(/^\d{6}$/, "The code must contain only digits"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { token, email } = useLocalSearchParams<{
    token: string;
    email: string;
  }>();
  const scheme = useColorScheme() ?? "light";
  const C = AuthPalette[scheme];
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

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
      setFormError("Session expired. Please restart the reset flow.");
      return;
    }
    setFormError(null);
    try {
      await authApi.resetPassword({
        reset_session_token: token,
        otp: data.otp,
        new_password: data.new_password,
      });
      setResetSuccess(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password. Check the code and try again."
      );
    }
  };

  if (resetSuccess) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: C.background }]}
      >
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successIconWrap,
              { backgroundColor: C.tintPale },
            ]}
          >
            <Ionicons name="checkmark" size={28} color={C.tint} />
          </View>
          <Text style={[styles.successHeading, { color: C.textPrimary }]}>
            Password updated
          </Text>
          <Text style={[styles.successBody, { color: C.textSecondary }]}>
            Your password has been changed successfully. Sign in with your new
            password.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: C.tint }]}
            onPress={() => router.replace("/login")}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={C.tint} />
            <Text style={[styles.backLabel, { color: C.tint }]}>Back</Text>
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={[styles.heading, { color: C.textPrimary }]}>
              Check your email
            </Text>
            <Text style={[styles.subheading, { color: C.textSecondary }]}>
              {email
                ? `We sent a 6-digit code to ${email}`
                : "We sent a 6-digit code to your email address"}
              . Enter it below along with your new password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: C.textLabel }]}>
              Verification code
            </Text>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={(t) =>
                    onChange(t.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit code"
                  keyboardType="number-pad"
                  hasError={!!errors.otp}
                  maxLength={6}
                />
              )}
            />
            {errors.otp && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.otp.message}
              </Text>
            )}

            <Text style={[styles.label, { color: C.textLabel }]}>
              New password
            </Text>
            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="At least 8 characters"
                  secureTextEntry={secureNew}
                  rightText={secureNew ? "Show" : "Hide"}
                  onPressRight={() => setSecureNew((p) => !p)}
                  hasError={!!errors.new_password}
                />
              )}
            />
            {errors.new_password && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.new_password.message}
              </Text>
            )}

            <Text style={[styles.label, { color: C.textLabel }]}>
              Confirm new password
            </Text>
            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Re-enter your new password"
                  secureTextEntry={secureConfirm}
                  rightText={secureConfirm ? "Show" : "Hide"}
                  onPressRight={() => setSecureConfirm((p) => !p)}
                  hasError={!!errors.confirm_password}
                />
              )}
            />
            {errors.confirm_password && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.confirm_password.message}
              </Text>
            )}

            {formError && (
              <View
                style={[
                  styles.formErrorBox,
                  { backgroundColor: C.errorSubtle },
                ]}
              >
                <Text style={[styles.formErrorText, { color: C.error }]}>
                  {formError}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: isSubmitting ? C.buttonDisabled : C.tint },
              ]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Resetting…" : "Reset password"}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={[styles.switchPrompt, { color: C.textMuted }]}>
                Remember your password?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={[styles.switchLink, { color: C.tint }]}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: AuthSpacing.lg,
    paddingBottom: AuthSpacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: AuthSpacing.sm,
    paddingTop: AuthSpacing.lg,
    paddingBottom: AuthSpacing.xxl,
    alignSelf: "flex-start",
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  headingSection: {
    marginBottom: AuthSpacing.xl,
    gap: AuthSpacing.md,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: Fonts.heading,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 25,
  },
  form: {
    marginBottom: AuthSpacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    marginBottom: AuthSpacing.sm,
  },
  fieldError: {
    fontSize: 13,
    marginTop: -10,
    marginBottom: AuthSpacing.md,
  },
  formErrorBox: {
    borderRadius: AuthRadius.md,
    padding: AuthSpacing.base,
    marginTop: AuthSpacing.xs,
  },
  formErrorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: "auto",
    gap: AuthSpacing.base,
    paddingTop: AuthSpacing.lg,
  },
  primaryButton: {
    height: 56,
    borderRadius: AuthRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: AuthSpacing.sm,
  },
  switchPrompt: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "600" },

  // Success state
  successContainer: {
    flex: 1,
    paddingHorizontal: AuthSpacing.lg,
    justifyContent: "center",
    gap: AuthSpacing.base,
    paddingBottom: AuthSpacing.xxl,
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: AuthSpacing.sm,
  },
  successHeading: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    alignSelf: "center",
  },
  successBody: {
    fontSize: 16,
    lineHeight: 25,
    marginBottom: AuthSpacing.lg,
    textAlign: "center",
  },
});
