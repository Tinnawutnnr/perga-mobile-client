import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
import { profileApi } from "../api/profile";
import PrimaryInput from "../components/primary-input";
import { AuthPalette, AuthRadius, AuthSpacing } from "../constants/auth-theme";
import { Fonts } from "../constants/fonts";
import { useAuth } from "../context/auth-context";
import { useColorScheme } from "../hooks/use-color-scheme";
import {
  isValidAge,
  isValidHeight,
  isValidName,
  isValidWeight,
} from "../utils/validation";

export default function CreateProfileScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { token, tempUsername, clearTempUsername, saveRole, saveUsername } =
    useAuth();
  const scheme = useColorScheme() ?? "light";
  const C = AuthPalette[scheme];

  const isPatient = role === "patient";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const hasFirstNameError = firstName.length > 0 && !isValidName(firstName);
  const hasLastNameError = lastName.length > 0 && !isValidName(lastName);
  const hasAgeError = age.length > 0 && !isValidAge(age);
  const hasHeightError = height.length > 0 && !isValidHeight(height);
  const hasWeightError = weight.length > 0 && !isValidWeight(weight);

  const isFormValid =
    isValidName(firstName) &&
    isValidName(lastName) &&
    (!isPatient ||
      (isValidAge(age) && isValidHeight(height) && isValidWeight(weight)));

  const handleContinue = async () => {
    if (!token) return;
    setFormError(null);
    setIsLoading(true);
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        ...(isPatient && {
          age: Number(age),
          height: Number(height),
          weight: Number(weight),
        }),
      };
      await profileApi.createProfile(body, token);

      // Fetch role from server and navigate directly — no re-login required
      const status = await profileApi.getStatus(token);
      await saveRole(status.role);
      if (tempUsername) {
        await saveUsername(tempUsername);
      }
      clearTempUsername();

      if (status.role === "caregiver") {
        router.replace("/(tabs)/patient-selection");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
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
            <Text style={[styles.stepLabel, { color: C.textMuted }]}>
              {isPatient ? "Step 2 of 2" : "Last step"}
            </Text>
            <Text style={[styles.heading, { color: C.textPrimary }]}>
              {isPatient ? "About you" : "Your details"}
            </Text>
            <Text style={[styles.subheading, { color: C.textSecondary }]}>
              {isPatient
                ? "These help us calibrate your gait analysis"
                : "A few more details to complete your account"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: C.textLabel }]}>
              First name
            </Text>
            <PrimaryInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
              hasError={hasFirstNameError}
            />
            {hasFirstNameError && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                Please enter a valid first name
              </Text>
            )}

            <Text style={[styles.label, { color: C.textLabel }]}>
              Last name
            </Text>
            <PrimaryInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Your last name"
              hasError={hasLastNameError}
            />
            {hasLastNameError && (
              <Text style={[styles.fieldError, { color: C.error }]}>
                Please enter a valid last name
              </Text>
            )}

            {isPatient && (
              <>
                <View style={[styles.divider, { backgroundColor: C.border }]} />

                <Text style={[styles.sectionNote, { color: C.textMuted }]}>
                  Used to personalise your gait baseline
                </Text>

                <Text style={[styles.label, { color: C.textLabel }]}>
                  Age
                </Text>
                <PrimaryInput
                  value={age}
                  onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
                  placeholder="Years"
                  keyboardType="number-pad"
                  hasError={hasAgeError}
                />
                {hasAgeError && (
                  <Text style={[styles.fieldError, { color: C.error }]}>
                    Please enter a valid age
                  </Text>
                )}

                <Text style={[styles.label, { color: C.textLabel }]}>
                  Height
                </Text>
                <PrimaryInput
                  value={height}
                  onChangeText={(t) => setHeight(t.replace(/[^0-9.]/g, ""))}
                  placeholder="Centimetres (e.g. 165)"
                  keyboardType="decimal-pad"
                  hasError={hasHeightError}
                />
                {hasHeightError && (
                  <Text style={[styles.fieldError, { color: C.error }]}>
                    Please enter a valid height in cm
                  </Text>
                )}

                <Text style={[styles.label, { color: C.textLabel }]}>
                  Weight
                </Text>
                <PrimaryInput
                  value={weight}
                  onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ""))}
                  placeholder="Kilograms (e.g. 68)"
                  keyboardType="decimal-pad"
                  hasError={hasWeightError}
                />
                {hasWeightError && (
                  <Text style={[styles.fieldError, { color: C.error }]}>
                    Please enter a valid weight in kg
                  </Text>
                )}
              </>
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

          {/* CTA */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor:
                    !isFormValid || isLoading ? C.buttonDisabled : C.tint,
                },
              ]}
              onPress={handleContinue}
              activeOpacity={0.85}
              disabled={!isFormValid || isLoading}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isFormValid || isLoading }}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? "Saving…" : "Continue"}
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
  stepLabel: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: AuthSpacing.xs,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: Fonts.heading,
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
  fieldError: {
    fontSize: 13,
    marginTop: -10,
    marginBottom: AuthSpacing.md,
  },
  divider: {
    height: 1,
    marginVertical: AuthSpacing.lg,
  },
  sectionNote: {
    fontSize: 13,
    marginBottom: AuthSpacing.base,
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
