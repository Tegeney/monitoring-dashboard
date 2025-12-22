import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Upload, X, CheckCircle2 } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";

const categories = [
  "Nature",
  "Abstract",
  "Minimal",
  "City",
  "Space",
  "Animals",
];

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();
  const [uploadFile] = useUpload();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const createWallpaperMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/wallpapers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create wallpaper");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      Alert.alert("Success", "Wallpaper uploaded successfully!");
      setTitle("");
      setImage(null);
      setCategory(categories[0]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!title || !image || !category) {
      Alert.alert("Error", "Please fill all fields and select an image");
      return;
    }

    try {
      setIsUploading(true);
      const uploadResult = await uploadFile({ reactNativeAsset: image });

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      createWallpaperMutation.mutate({
        title,
        category,
        url: uploadResult.url,
      });
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}
    >
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
          Upload
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#9CA3AF" : "#6B7280",
          }}
        >
          Add a new wallpaper to the collection
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            width: "100%",
            height: 300,
            borderRadius: 20,
            backgroundColor: isDark ? "#1E1E1E" : "#F3F4F6",
            borderWidth: 2,
            borderColor: isDark ? "#333333" : "#E5E7EB",
            borderStyle: "dashed",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {image ? (
            <>
              <Image
                source={{ uri: image.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <TouchableOpacity
                onPress={() => setImage(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Upload size={40} color={isDark ? "#4B5563" : "#9CA3AF"} />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Select Wallpaper
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#FFFFFF" : "#374151",
              marginBottom: 8,
            }}
          >
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter wallpaper title"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 12,
              backgroundColor: isDark ? "#1E1E1E" : "#F9FAFB",
              paddingHorizontal: 16,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
              borderWidth: 1,
              borderColor: isDark ? "#333333" : "#E5E7EB",
            }}
          />
        </View>

        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#FFFFFF" : "#374151",
              marginBottom: 12,
            }}
          >
            Category
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor:
                    category === cat
                      ? "#00B86C"
                      : isDark
                        ? "#1E1E1E"
                        : "#F3F4F6",
                  borderWidth: 1,
                  borderColor:
                    category === cat
                      ? "#00B86C"
                      : isDark
                        ? "#333333"
                        : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color:
                      category === cat
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
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploading || createWallpaperMutation.isLoading}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 16,
            backgroundColor: "#00B86C",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            opacity: isUploading || createWallpaperMutation.isLoading ? 0.7 : 1,
          }}
        >
          {isUploading || createWallpaperMutation.isLoading ? (
            <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <CheckCircle2
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            {isUploading
              ? "Uploading Image..."
              : createWallpaperMutation.isLoading
                ? "Saving..."
                : "Publish Wallpaper"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
