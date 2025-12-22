import { Tabs } from "expo-router";
import { useColorScheme, View } from "react-native";
import { Home, LayoutGrid, Heart, User, Shapes } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#262626" : "#EAEAEA",
          height: 70, // Increased height for better spacing
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#00B86C",
        tabBarInactiveTintColor: isDark ? "#6B7280" : "#9B9B9B",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused
                  ? "#00B86C"
                  : isDark
                    ? "#1E1E1E"
                    : "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -20, // Floating effect
                borderWidth: 4,
                borderColor: isDark ? "#121212" : "#FFFFFF",
                shadowColor: "#00B86C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: focused ? 0.3 : 0,
                shadowRadius: 8,
                elevation: focused ? 5 : 0,
              }}
            >
              <Shapes
                color={focused ? "#FFFFFF" : color}
                size={24}
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <Heart color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
