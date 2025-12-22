import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) throw new Error("Failed to fetch");
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

      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          Favorites
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#00B86C" />
        </View>
      ) : favorites.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Heart size={32} color={isDark ? "#4B5563" : "#9CA3AF"} />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            No favorites yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
              textAlign: "center",
            }}
          >
            Start exploring and save your favorite wallpapers here
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
          {favorites.map((item, index) => (
            <TouchableOpacity
              key={item.id}
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
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
