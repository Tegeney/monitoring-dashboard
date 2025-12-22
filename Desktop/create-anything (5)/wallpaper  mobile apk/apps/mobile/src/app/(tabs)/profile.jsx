import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Download,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const { data: downloads = [], isLoading: downloadsLoading } = useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const response = await fetch("/api/downloads");
      if (!response.ok) throw new Error("Failed to fetch downloads");
      return response.json();
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) throw new Error("Failed to fetch favorites");
      return response.json();
    },
  });

  if (!fontsLoaded) return null;

  const handleToggleNotifications = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(value);
  };

  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      color: "#6366F1",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Settings", "Settings functionality coming soon!");
      },
    },
    {
      icon: Bell,
      label: "Notifications",
      color: "#F59E0B",
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: "#767577", true: "#00B86C" }}
        />
      ),
    },
    {
      icon: Shield,
      label: "Privacy",
      color: "#10B981",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Privacy", "Privacy policy and data settings coming soon!");
      },
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      color: "#3B82F6",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Support", "Contacting support...");
      },
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View
          style={{
            paddingTop: insets.top + 40,
            paddingHorizontal: 20,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <View style={{ position: "relative", marginBottom: 16 }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
              }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#00B86C",
                borderWidth: 3,
                borderColor: isDark ? "#121212" : "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <User size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Alex Johnson
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            alex.j@example.com
          </Text>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingHorizontal: 20,
            marginBottom: 32,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/favorites");
            }}
            style={{ alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {favorites.length}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              Favorites
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: isDark ? "#333333" : "#E5E7EB",
            }}
          />
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/downloads");
            }}
            style={{ alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              {downloads.length}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              Downloads
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: isDark ? "#333333" : "#E5E7EB",
            }}
          />
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              12
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              Uploads
            </Text>
          </View>
        </View>

        {/* Recent Downloads Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#9CA3AF" : "#6B7280",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Recent Downloads
            </Text>
            {downloads.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/downloads");
                }}
              >
                <Text
                  style={{
                    color: "#00B86C",
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                  }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {downloadsLoading ? (
            <ActivityIndicator color="#00B86C" />
          ) : downloads.length === 0 ? (
            <View
              style={{
                padding: 20,
                backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Download
                size={24}
                color={isDark ? "#4B5563" : "#9CA3AF"}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                }}
              >
                No downloads yet
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {downloads.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/wallpaper/${item.id}`)}
                  style={{ marginRight: 12 }}
                >
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: 100, height: 150, borderRadius: 12 }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Menu */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#9CA3AF" : "#6B7280",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Account Settings
          </Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              disabled={!item.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: index === menuItems.length - 1 ? 0 : 1,
                borderBottomColor: isDark ? "#1E1E1E" : "#F3F4F6",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <item.icon size={20} color={item.color} />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                {item.label}
              </Text>
              {item.rightElement || (
                <ChevronRight
                  size={20}
                  color={isDark ? "#4B5563" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              marginTop: 24,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <LogOut size={20} color="#EF4444" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#EF4444",
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
