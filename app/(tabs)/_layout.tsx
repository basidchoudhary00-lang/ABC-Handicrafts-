import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";

export default function TabLayout() {
  const colors = useColors();
  const { lang } = useLang();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("laborers", lang),
          tabBarIcon: ({ color }) => <Feather name="users" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: t("entries", lang),
          tabBarIcon: ({ color }) => <Feather name="clipboard" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: lang === "hi" ? "स्टॉक" : "Stock",
          tabBarIcon: ({ color }) => <Feather name="package" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admins"
        options={{
          title: t("admins", lang),
          tabBarIcon: ({ color }) => <Feather name="shield" size={21} color={color} />,
        }}
      />
      <Tabs.Screen name="install" options={{ href: null }} />
      <Tabs.Screen name="report" options={{ href: null }} />
    </Tabs>
  );
}
