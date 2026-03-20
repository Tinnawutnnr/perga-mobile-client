import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
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

// ── Zod schema ──────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ── Screen ──────────────────────────────────────────────────────────────
const ForgotPasswordScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await authApi.forgotPassword({ email: data.email });
      router.push({
        pathname: "/reset-password",
        params: { token: res.reset_session_token, email: data.email },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      Alert.alert("Error", message);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
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
                uri: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg",
              }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#4F7D81" />
            </TouchableOpacity>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a verification code to
              reset your password.
            </Text>

            {/* Email input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <>
                  <PrimaryInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="name@email.com"
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
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </Text>
            </TouchableOpacity>

            {/* Back to login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
    height: 240,
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginTop: 48,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#808080",
    lineHeight: 24,
    marginBottom: 32,
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
    marginTop: 16,
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
