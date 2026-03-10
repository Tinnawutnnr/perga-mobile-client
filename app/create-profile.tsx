import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { profileApi } from "../api/profile";
import PrimaryInput from "../components/primary-input";
import { useAuth } from "../context/auth-context";
import {
  isValidAge,
  isValidHeight,
  isValidName,
  isValidWeight,
} from "../utils/validation";

const CreateProfileScreen = () => {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { token, clearToken, clearTempUsername } = useAuth();
  const isPatient = role === "patient";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      clearTempUsername();
      await clearToken();
      router.replace("/login");
    } catch (error) {
      console.error("Profile creation failed:", error);
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Your Profile</Text>
            <Text style={styles.subtitle}>
              {isPatient ? "Tell us about yourself" : "A few more details"}
            </Text>

            <PrimaryInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              keyboardType="default"
              hasError={hasFirstNameError}
            />
            <PrimaryInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              keyboardType="default"
              hasError={hasLastNameError}
            />

            {isPatient && (
              <>
                <PrimaryInput
                  value={age}
                  onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
                  placeholder="Age"
                  keyboardType="numeric"
                  hasError={hasAgeError}
                />
                <PrimaryInput
                  value={height}
                  onChangeText={(t) => setHeight(t.replace(/[^0-9.]/g, ""))}
                  placeholder="Height in cm"
                  keyboardType="numeric"
                  hasError={hasHeightError}
                />
                <PrimaryInput
                  value={weight}
                  onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ""))}
                  placeholder="Weight in kg"
                  keyboardType="numeric"
                  hasError={hasWeightError}
                />
              </>
            )}

            <TouchableOpacity
              style={[
                styles.continueButton,
                (!isFormValid || isLoading) && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateProfileScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1, backgroundColor: "#FFFFFF" },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#000000", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#808080", marginBottom: 24 },
  continueButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  continueButtonDisabled: { backgroundColor: "#C4C4C4" },
  continueButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
