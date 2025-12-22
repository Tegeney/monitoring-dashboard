import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { TextInput } from "react-native";
import * as Haptics from "expo-haptics";

const CATEGORIES = [
  "All",
  "Nature",
  "Abstract",
  "Minimal",
  "City",
  "Space",
  "Animals",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || "All",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Update selected category if param changes (e.g. from Categories tab)
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const {
    data: wallpapers = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["wallpapers", selectedCategory, searchQuery],
    queryFn: async () => {
      let url =
        selectedCategory === "All"
          ? "/api/wallpapers"
          : `/api/wallpapers?category=${encodeURIComponent(selectedCategory)}`;

      if (searchQuery) {
        const separator = url.includes("?") ? "&" : "?";
        url += `${separator}search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  if (!fontsLoaded) return null;

  const columnCount = width > 600 ? 3 : 2;
  const spacing = 16;
  const totalSpacing = spacing * (columnCount + 1);
  const itemWidth = (width - totalSpacing) / columnCount;

  const handleSearchToggle = (visible) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchVisible(visible);
    if (!visible) {
      setSearchQuery("");
    }
  };

  const handleCategorySelect = (cat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(cat);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {!isSearchVisible ? (
          <>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Wallpapers
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleSearchToggle(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Search size={20} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          </>
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 44,
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                borderRadius: 22,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
              }}
            >
              <Search size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <TextInput
                autoFocus
                placeholder="Search wallpapers..."
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: isDark ? "#FFFFFF" : "#000000",
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSearchQuery("");
                  }}
                >
                  <X size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => handleSearchToggle(false)}>
              <Text
                style={{
                  color: "#00B86C",
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Category Filter */}
      <View style={{ marginBottom: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategorySelect(cat)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedCategory === cat
                    ? "#00B86C"
                    : isDark
                      ? "#1E1E1E"
                      : "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color:
                    selectedCategory === cat
                      ? "#FFFFFF"
                      : isDark
                        ? "#9CA3AF"
                        : "#6B7280",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#00B86C" />
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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#00B86C"
            />
          }
        >
          {wallpapers.length === 0 ? (
            <View
              style={{
                width: "100%",
                paddingVertical: 40,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontFamily: "Inter_400Regular",
                }}
              >
                No wallpapers found in this category
              </Text>
            </View>
          ) : (
            wallpapers.map((item, index) => (
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
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
