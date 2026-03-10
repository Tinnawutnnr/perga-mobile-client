import { profileApi } from "@/api/profile";
import PrimaryInput from "@/components/primary-input";
import { useAuth } from "@/context/auth-context";
import {
  isValidAge,
  isValidHeight,
  isValidName,
  isValidWeight,
} from "@/utils/validation";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MyInfoScreen = () => {
  const { token, role } = useAuth();
  const isPatient = role === "patient";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token) return;
    profileApi
      .getMe(token)
      .then((data) => {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        if (isPatient) {
          setAge(data.age != null ? String(data.age) : "");
          setHeight(data.height != null ? String(data.height) : "");
          setWeight(data.weight != null ? String(data.weight) : "");
        }
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setIsLoading(false));
  }, [token, isPatient]);

  const hasFirstNameError =
    isEditing && firstName.length > 0 && !isValidName(firstName);
  const hasLastNameError =
    isEditing && lastName.length > 0 && !isValidName(lastName);
  const hasAgeError = isEditing && age.length > 0 && !isValidAge(age);
  const hasHeightError =
    isEditing && height.length > 0 && !isValidHeight(height);
  const hasWeightError =
    isEditing && weight.length > 0 && !isValidWeight(weight);

  const isFormValid =
    isValidName(firstName) &&
    isValidName(lastName) &&
    (!isPatient ||
      (isValidAge(age) && isValidHeight(height) && isValidWeight(weight)));

  const handleSave = async () => {
    if (!token || !isFormValid) return;
    setIsSaving(true);
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
      await profileApi.updateMe(body, token);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ flex: 1 }} color="#4F7D81" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                <Text style={styles.editText}>
                  {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>My Info</Text>
            <Text style={styles.subtitle}>
              {isEditing ? "Update your details" : "Your profile information"}
            </Text>

            <Text style={styles.label}>First Name</Text>
            <PrimaryInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              editable={isEditing}
              hasError={hasFirstNameError}
            />

            <Text style={styles.label}>Last Name</Text>
            <PrimaryInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              editable={isEditing}
              hasError={hasLastNameError}
            />

            {isPatient && (
              <>
                <Text style={styles.label}>Age</Text>
                <PrimaryInput
                  value={age}
                  onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
                  placeholder="Age"
                  keyboardType="numeric"
                  editable={isEditing}
                  hasError={hasAgeError}
                />

                <Text style={styles.label}>Height (cm)</Text>
                <PrimaryInput
                  value={height}
                  onChangeText={(t) => setHeight(t.replace(/[^0-9.]/g, ""))}
                  placeholder="Height in cm"
                  keyboardType="numeric"
                  editable={isEditing}
                  hasError={hasHeightError}
                />

                <Text style={styles.label}>Weight (kg)</Text>
                <PrimaryInput
                  value={weight}
                  onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ""))}
                  placeholder="Weight in kg"
                  keyboardType="numeric"
                  editable={isEditing}
                  hasError={hasWeightError}
                />
              </>
            )}

            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MyInfoScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1, backgroundColor: "#FFFFFF" },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backText: { fontSize: 15, color: "#4F7D81", fontWeight: "500" },
  editText: { fontSize: 15, color: "#4F7D81", fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700", color: "#000000", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#808080", marginBottom: 24 },
  label: { fontSize: 13, color: "#808080", marginBottom: 4, marginTop: 4 },
  cancelButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#808080" },
});
