import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PrimaryInput from "../components/primary-input";
import { useAuth } from "../context/auth-context";
import { isValidEmail } from "../utils/validation";

const ForgotPasswordScreen = () => {
  const { saveTempEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const hasEmailError = email.length > 0 && !isValidEmail(email);

  const handleSubmit = () => {
    if (!isValidEmail(email)) {
      console.log("Please enter a valid email address");
      return;
    }
    
    // Show success modal
    setShowSuccessModal(true);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    saveTempEmail(email);
    router.push("/confirmation-code");
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
              Enter your email address and we&apos;ll send you a verification code to reset your password
            </Text>

            {/* Email input */}
            <PrimaryInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@email.com"
              keyboardType="email-address"
              hasError={hasEmailError}
            />

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!email || !isValidEmail(email)) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!email || !isValidEmail(email)}
            >
              <Text style={styles.submitButtonText}>Send Reset Code</Text>
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

        {/* Success Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              </View>
              
              <Text style={styles.modalTitle}>Code Sent!</Text>
              <Text style={styles.modalMessage}>
                We&apos;ve sent a verification code to {email}. Please check your email and enter the code on the next screen.
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#808080",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  modalButton: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
