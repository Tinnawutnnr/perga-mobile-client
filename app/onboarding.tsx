import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OnboardingScreen = () => {
  const currentIndex = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Onboarding image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Bottom content */}
        <View style={styles.contentContainer}>
          {/* Dots change picture (later) */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to PGAD</Text>
            <Text style={styles.subtitle}>
              Your personal gait and fall-risk companion.{"\n"}
              Monitor walking patterns, detect risks early, and keep your loved
              ones safer every day.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    flex: 0.6,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 0.4,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: "#ffffff",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: "#1E7C8A",
  },
  textContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    lineHeight: 20,
  },
  button: {
    marginTop: "auto",
    width: "100%",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4F7D81",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
