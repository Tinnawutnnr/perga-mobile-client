import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
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
import { useColorScheme } from "../hooks/use-color-scheme";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Enter a valid email address, e.g. name@example.com")
    .transform((v) => v.trim().toLowerCase()),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = AuthPalette[scheme];
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setFormError(null);
    try {
      const res = await authApi.forgotPassword({ email: data.email });
      router.push({
        pathname: "/reset-password",
        params: { token: res.reset_session_token, email: data.email },
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn't send a reset code. Check your connection and try again."
      );
    }
  };

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
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
          >
            <Ionicons name="arrow-back" size={22} color={C.tint} />
            <Text style={[styles.backLabel, { color: C.tint }]}>Sign in</Text>
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={[styles.heading, { color: C.textPrimary }]}>
              Reset your password
            </Text>
            <Text style={[styles.subheading, { color: C.textSecondary }]}>
              Enter your email address and we'll send you a 6-digit code to
              reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: C.textLabel }]}>
              Email address
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  hasError={!!errors.email}
                />
              )}
            />
            {errors.email && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.email.message}
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
                {isSubmitting ? "Sending…" : "Send reset code"}
              </Text>
            </TouchableOpacity>
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
});
