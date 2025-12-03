import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
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

const LoginScreen = () => {
  const { saveTempEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);

  const hasEmailError = email.length > 0 && !isValidEmail(email);
  const hasPasswordError = password.length > 0 && password.length < 8;

  const handleLogin = () => {
    if (!isValidEmail(email)) {
      //add modal later
      console.log("Please enter a valid email address");
      return;
    }
    
    if (password.length < 8) {
      //add modal later
      console.log("Password must be at least 8 characters");
      return;
    }

    console.log("Login:", { email, password });
    saveTempEmail(email);
    router.push("/confirmation-code");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleRegister = () => {
    router.push("/register")
  };

  const handleGoogleLogin = () => {
    console.log("Login with Google");
    // TODO: Implement Google OAuth flow and retrieve user's email before saving
    router.push("/confirmation-code");
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
                uri: "https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg",
              }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Bottom content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Welcome!</Text>

            {/* email input */}
            <PrimaryInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@email.com"
              keyboardType="email-address"
              hasError={hasEmailError}
            />

            {/* Password input */}
            <PrimaryInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={securePassword}
              rightIcon={securePassword ? "eye" : "eye-off"}
              onPressRight={() => setSecurePassword((prev) => !prev)}
              hasError={hasPasswordError}
            />

            {/* Forgot password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotWrapper}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Register text */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Not a member? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Register now</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            {/* <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* Google button */}
            {/* <View style={styles.socialWrapper}>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    height: 260,
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
  },
  forgotWrapper: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: "#477E85",
    fontWeight: "500",
  },
  loginButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4F7D81",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#808080",
  },
  registerLink: {
    fontSize: 14,
    color: "#477E85",
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    fontSize: 12,
    color: "#808080",
    marginHorizontal: 8,
  },
  socialWrapper: {
    alignItems: "center",
  },
  googleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
});