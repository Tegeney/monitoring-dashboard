import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_700Bold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";

const { width, height } = Dimensions.get("window");

export default function SplashScreenComponent() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80"
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>
        </View>
        {fontsLoaded && (
          <>
            <Text style={styles.title}>WALLPAPER</Text>
            <Text style={styles.subtitle}>ULTRA HD COLLECTION</Text>
          </>
        )}
      </Animated.View>

      {fontsLoaded && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Premium Quality Wallpapers</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00B86C",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#00B86C",
    letterSpacing: 2,
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
  footerText: {
    color: "#4B5563",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
