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
import { authApi } from "../api/auth";
import { profileApi } from "../api/profile";
import PrimaryInput from "../components/primary-input";
import { useAuth } from "../context/auth-context";
import { isValidPassword, isValidUsername } from "../utils/validation";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { saveToken, saveRole, saveUsername } = useAuth();

  const hasUsernameError = username.length > 0 && !isValidUsername(username);
  const hasPasswordError = password.length > 0 && !isValidPassword(password);

  const isFormValid = isValidUsername(username) && isValidPassword(password);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ username, password });
      await saveToken(res.access_token);
      const status = await profileApi.getStatus(res.access_token);
      await saveRole(status.role);
      await saveUsername(username);
      if (status.role === "caretaker") {
        router.replace("/(tabs)/patient-selection");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleRegister = () => {
    router.push("/register");
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

            {/* Username input */}
            <PrimaryInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              keyboardType="default"
              hasError={hasUsernameError}
            />

            {/* Password input */}
            <PrimaryInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={securePassword}
              rightIcon={securePassword ? "eye-off" : "eye"}
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
              style={[
                styles.loginButton,
                (!isFormValid || isLoading) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Register text */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Not a member? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Register now</Text>
              </TouchableOpacity>
            </View>
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
  loginButtonDisabled: {
    backgroundColor: "#C4C4C4",
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
});
