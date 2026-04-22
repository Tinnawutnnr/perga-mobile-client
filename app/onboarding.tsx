import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthRadius, AuthSpacing, WelcomeColors } from "../constants/auth-theme";
import { Fonts } from "../constants/fonts";

const C = WelcomeColors;

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wordmarkSection}>
        <Text style={styles.wordmark}>PERGA</Text>
        <View style={styles.rule} />
        <Text style={styles.tagline}>
          Gait monitoring for{"\n"} people who matter.
        </Text>
      </View>

      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/register")}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Get started — create a new account"
        >
          <Text style={styles.primaryButtonText}>Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => router.replace("/login")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign in to an existing account"
        >
          <Text style={styles.ghostButtonText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: AuthSpacing.lg,
  },
  wordmarkSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: AuthSpacing.xxl,
  },
  wordmark: {
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: 10,
    color: C.wordmark,
    marginBottom: AuthSpacing.lg,
    fontFamily: Fonts.display,
  },
  rule: {
    height: 1,
    backgroundColor: C.divider,
    marginBottom: AuthSpacing.lg,
  },
  tagline: {
    fontSize: 17,
    fontWeight: "400",
    color: C.tagline,
    lineHeight: 27,
  },
  ctaSection: {
    paddingBottom: AuthSpacing.lg,
    gap: AuthSpacing.md,
  },
  primaryButton: {
    height: 56,
    backgroundColor: C.buttonPrimaryBg,
    borderRadius: AuthRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: C.buttonPrimaryText,
    letterSpacing: 0.2,
  },
  ghostButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  ghostButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: C.buttonGhostText,
  },
});
