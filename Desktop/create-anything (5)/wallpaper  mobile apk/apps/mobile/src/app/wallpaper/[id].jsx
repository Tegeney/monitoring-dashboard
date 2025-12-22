import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import {
  ChevronLeft,
  Heart,
  Download,
  Share2,
  Info,
  Smartphone,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";

export default function WallpaperDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { height, width } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const { data: wallpaper, isLoading } = useQuery({
    queryKey: ["wallpaper", id],
    queryFn: async () => {
      const response = await fetch(`/api/wallpapers/${id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaper_id: parseInt(id, 10) }),
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallpaper", id] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const recordDownloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaper_id: parseInt(id, 10) }),
      });
      if (!response.ok) throw new Error("Failed to record download");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
  });

  const handleSetWallpaper = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    recordDownloadMutation.mutate();
    Alert.alert("Success", "Wallpaper set successfully! (Simulated)");
  };

  const handleDownloadImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      recordDownloadMutation.mutate();
      // Opening the URL in the browser allows the user to save the image
      await Linking.openURL(wallpaper.url);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not open download link");
    }
  };

  const handleShare = async () => {
    try {
      if (!wallpaper) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `Check out this awesome wallpaper: ${wallpaper.title}`,
        url: wallpaper.url,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#00B86C" />
      </View>
    );
  }

  if (!wallpaper) return null;

  // Responsive sizing
  const isSmallScreen = width < 380;
  const buttonSize = isSmallScreen ? 40 : 48;
  const iconSize = isSmallScreen ? 20 : 24;
  const bottomPadding = Math.max(insets.bottom, 20);

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      {/* Full Screen Image */}
      <Image
        source={{ uri: wallpaper.url }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* Top Navigation Bar */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <BlurView
            intensity={30}
            tint="dark"
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <ChevronLeft size={iconSize} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => toggleFavoriteMutation.mutate()}
            activeOpacity={0.7}
          >
            <BlurView
              intensity={30}
              tint="dark"
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Heart
                size={iconSize}
                color={wallpaper.isFavorited ? "#FF4B4B" : "#FFFFFF"}
                fill={wallpaper.isFavorited ? "#FF4B4B" : "transparent"}
              />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
            <BlurView
              intensity={30}
              tint="dark"
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Share2 size={iconSize - 4} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Action Area */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: bottomPadding + 16,
        }}
      >
        <BlurView
          intensity={40}
          tint="dark"
          style={{
            borderRadius: 24,
            padding: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: isSmallScreen ? 22 : 26,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginBottom: 6,
              }}
            >
              {wallpaper.title}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.15)",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    textTransform: "capitalize",
                  }}
                >
                  {wallpaper.category}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Info
                  size={14}
                  color="rgba(255,255,255,0.5)"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Ultra HD Quality
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleSetWallpaper}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: isSmallScreen ? 50 : 58,
                borderRadius: 16,
                backgroundColor: "#00B86C",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                shadowColor: "#00B86C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Smartphone
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                Set
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownloadImage}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: isSmallScreen ? 50 : 58,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.15)",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Download size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                Download
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}
