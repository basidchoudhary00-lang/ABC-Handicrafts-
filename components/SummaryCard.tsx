import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function SummaryCard({ title, value, subtitle, color, icon }: SummaryCardProps) {
  const c = useColors();
  const cardColor = color || c.primary;

  return (
    <View style={[styles.card, { backgroundColor: cardColor + "12", borderColor: cardColor + "30" }]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.title, { color: c.mutedForeground }]}>{title}</Text>
      <Text style={[styles.value, { color: cardColor }]}>{value}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: c.mutedForeground }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minWidth: 100,
  },
  iconWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
  },
});
