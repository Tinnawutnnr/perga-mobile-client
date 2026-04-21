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
import { profileApi } from "../api/profile";
import PrimaryInput from "../components/primary-input";
import { AuthPalette, AuthRadius, AuthSpacing } from "../constants/auth-theme";
import { useAuth } from "../context/auth-context";
import { useColorScheme } from "../hooks/use-color-scheme";

const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username or email"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = AuthPalette[scheme];
  const [securePassword, setSecurePassword] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const { saveToken, saveRole, saveUsername, clearToken } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    try {
      const res = await authApi.login({
        username: data.username.trim(),
        password: data.password,
      });

      await saveToken(res.access_token);

      // Fetch role separately — if this fails, roll back the saved token so the
      // app doesn't end up in a partially-authenticated state on next launch.
      let status: { role: string };
      try {
        status = await profileApi.getStatus(res.access_token);
      } catch {
        await clearToken();
        setFormError("Signed in but couldn't load your profile. Please try again.");
        return;
      }

      await saveRole(status.role);
      await saveUsername(data.username.trim());
      if (status.role === "caregiver") {
        router.replace("/(tabs)/patient-selection");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      // Clear the password field — never leave credentials pre-filled after a failure
      setValue("password", "");

      if (error instanceof TypeError) {
        // fetch threw before a response arrived — network unreachable or timeout
        setFormError("Unable to connect. Check your internet connection and try again.");
      } else {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to sign in. Check your credentials and try again."
        );
      }
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
              Welcome back
            </Text>
            <Text style={[styles.subheading, { color: C.textSecondary }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username / email */}
            <Text style={[styles.label, { color: C.textLabel }]}>
              Username or email
            </Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. john.doe"
                  keyboardType="email-address"
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

            {/* Password label row */}
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: C.textLabel }]}>
                Password
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="link"
              >
                <Text style={[styles.forgotLink, { color: C.tint }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PrimaryInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Your password"
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
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={[styles.switchPrompt, { color: C.textMuted }]}>
                New to PERGA?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={[styles.switchLink, { color: C.tint }]}>
                  Create an account
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
    paddingBottom: AuthSpacing.xxl,
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
  form: {
    marginBottom: AuthSpacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    marginBottom: AuthSpacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AuthSpacing.sm,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "500",
  },
  fieldError: {
    fontSize: 13,
    marginTop: -10,
    marginBottom: AuthSpacing.md,
  },
  formErrorBox: {
    borderRadius: AuthRadius.md,
    padding: AuthSpacing.base,
    marginTop: AuthSpacing.sm,
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
  switchPrompt: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
