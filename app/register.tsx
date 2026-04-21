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
import { useAuth } from "../context/auth-context";
import { useColorScheme } from "../hooks/use-color-scheme";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address, e.g. name@example.com"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["caregiver", "patient"]),
    agreeToTerms: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.agreeToTerms, {
    message: "You must agree to the terms to continue",
    path: ["agreeToTerms"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES = [
  {
    value: "caregiver" as const,
    label: "Caregiver",
    description: "Monitor a patient's gait and fall risk",
  },
  {
    value: "patient" as const,
    label: "Patient",
    description: "Track your own walking patterns",
  },
];

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = AuthPalette[scheme];
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
    try {
      const res = await authApi.register({
        email: data.email.trim().toLowerCase(),
        username: data.username.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      });
      await saveToken(res.access_token);
      saveTempUsername(data.username.trim().toLowerCase());
      router.push({ pathname: "/create-profile", params: { role: data.role } });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
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
          {/* Brand mark */}
          <View style={styles.brandRow}>
            <Text style={[styles.brand, { color: C.tint }]}>PERGA</Text>
          </View>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={[styles.heading, { color: C.textPrimary }]}>
              Create your account
            </Text>
            <Text style={[styles.subheading, { color: C.textSecondary }]}>
              Choose how you'll use PERGA
            </Text>
          </View>

          {/* Role tiles */}
          <View style={styles.roleTiles}>
            {ROLES.map((r) => {
              const selected = role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[
                    styles.roleTile,
                    {
                      backgroundColor: selected ? C.tint : C.surface,
                      borderColor: selected ? C.tint : C.border,
                    },
                  ]}
                  onPress={() => setValue("role", r.value)}
                  activeOpacity={0.85}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${r.label}: ${r.description}`}
                >
                  <Text
                    style={[
                      styles.roleTileLabel,
                      { color: selected ? "#FFFFFF" : C.textPrimary },
                    ]}
                  >
                    {r.label}
                  </Text>
                  <Text
                    style={[
                      styles.roleTileDesc,
                      {
                        color: selected
                          ? "rgba(255,255,255,0.72)"
                          : C.textSecondary,
                      },
                    ]}
                  >
                    {r.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form fields */}
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

            <Text style={[styles.label, { color: C.textLabel }]}>Username</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="3–20 characters"
                  autoCapitalize="none"
                  hasError={!!errors.username}
                />
              )}
            />
            {errors.username && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.username.message}
              </Text>
            )}

            <Text style={[styles.label, { color: C.textLabel }]}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="At least 8 characters"
                  secureTextEntry={securePassword}
                  rightText={securePassword ? "Show" : "Hide"}
                  onPressRight={() => setSecurePassword((p) => !p)}
                  hasError={!!errors.password}
                />
              )}
            />
            {errors.password && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.password.message}
              </Text>
            )}

            <Text style={[styles.label, { color: C.textLabel }]}>
              Confirm password
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Re-enter your password"
                  secureTextEntry={secureConfirm}
                  rightText={secureConfirm ? "Show" : "Hide"}
                  onPressRight={() => setSecureConfirm((p) => !p)}
                  hasError={!!errors.confirmPassword}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.confirmPassword.message}
              </Text>
            )}

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setValue("agreeToTerms", !agreeToTerms)}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeToTerms }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreeToTerms ? C.tint : "transparent",
                    borderColor: agreeToTerms ? C.tint : C.border,
                  },
                ]}
              >
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.termsText, { color: C.textSecondary }]}>
                I agree to the{" "}
                <Text style={[styles.termsLink, { color: C.tint }]}>
                  Terms & Conditions
                </Text>{" "}
                and{" "}
                <Text style={[styles.termsLink, { color: C.tint }]}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.agreeToTerms && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                {errors.agreeToTerms.message}
              </Text>
            )}

            {/* Form-level error */}
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
                {isSubmitting ? "Creating account…" : "Create account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={[styles.switchPrompt, { color: C.textMuted }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
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
  brandRow: {
    paddingTop: AuthSpacing.lg,
    paddingBottom: AuthSpacing.xl,
  },
  brand: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 4,
  },
  headingSection: {
    marginBottom: AuthSpacing.xl,
    gap: AuthSpacing.xs,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Role tiles
  roleTiles: {
    flexDirection: "row",
    gap: AuthSpacing.md,
    marginBottom: AuthSpacing.xl,
  },
  roleTile: {
    flex: 1,
    paddingVertical: AuthSpacing.base,
    paddingHorizontal: AuthSpacing.md,
    borderRadius: AuthRadius.lg,
    borderWidth: 1.5,
    minHeight: 88,
    gap: AuthSpacing.xs,
  },
  roleTileLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  roleTileDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Form
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

  // Terms
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: AuthSpacing.md,
    marginBottom: AuthSpacing.base,
    paddingVertical: AuthSpacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: AuthRadius.sm,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  termsLink: {
    fontWeight: "600",
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

  // Actions
  actions: {
    gap: AuthSpacing.base,
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
  switchPrompt: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
