import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Download } from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";

export default function DownloadsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const response = await fetch("/api/downloads");
      if (!response.ok) throw new Error("Failed to fetch downloads");
      return response.json();
    },
  });

  if (!fontsLoaded) return null;

  const columnCount = width > 600 ? 3 : 2;
  const spacing = 16;
  const totalSpacing = spacing * (columnCount + 1);
  const itemWidth = (width - totalSpacing) / columnCount;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <ChevronLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          My Downloads
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#00B86C" />
        </View>
      ) : downloads.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <Download
            size={48}
            color={isDark ? "#333333" : "#E5E7EB"}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 8,
            }}
          >
            No downloads yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              textAlign: "center",
            }}
          >
            Wallpapers you download or set will appear here for quick access.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing,
            paddingBottom: insets.bottom + 20,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
          showsVerticalScrollIndicator={false}
        >
          {downloads.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              onPress={() => router.push(`/wallpaper/${item.id}`)}
              style={{
                width: itemWidth,
                height: itemWidth * 1.5,
                borderRadius: 16,
                marginBottom: spacing,
                marginLeft: index % columnCount === 0 ? 0 : spacing,
                overflow: "hidden",
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              }}
            >
              <Image
                source={{ uri: item.url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={300}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 12,
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
