import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/contexts/LanguageContext";
import { Laborer } from "@/contexts/DataContext";

interface LaborerCardProps {
  laborer: Laborer;
  total: number;
  paid: number;
  balance: number;
  entryCount: number;
  onPress: () => void;
  onEdit: () => void;
  onMessage: () => void;
  onDelete: () => void;
}

export function LaborerCard({ laborer, total, paid, balance, entryCount, onPress, onEdit, onMessage, onDelete }: LaborerCardProps) {
  const c = useColors();
  const { lang } = useLang();
  const isHi = lang === "hi";
  const isBalanced = balance <= 0;
  const balanceColor = balance > 0 ? c.destructive : c.accent;

  function handleDelete() {
    Alert.alert(
      isHi ? "मजदूर हटाएं?" : "Delete Worker?",
      isHi
        ? `${laborer.name} और उनकी सभी एंट्रियाँ हमेशा के लिए हट जाएंगी।`
        : `${laborer.name} and all their entries will be permanently deleted.`,
      [
        { text: isHi ? "नहीं" : "Cancel", style: "cancel" },
        { text: isHi ? "हाँ, हटाएं" : "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: balance > 0 ? c.border : c.accent + "30", borderLeftColor: balance > 0 ? c.primary : c.accent }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: isBalanced ? c.accent : c.primary }]}>
          <Text style={styles.avatarText}>{laborer.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: c.foreground }]}>{laborer.name}</Text>
          {laborer.phone ? (
            <View style={styles.phoneRow}>
              <Feather name="phone" size={11} color={c.mutedForeground} />
              <Text style={[styles.phone, { color: c.mutedForeground }]}>{laborer.phone}</Text>
            </View>
          ) : null}
          <View style={styles.entryRow}>
            <Feather name="clipboard" size={11} color={c.mutedForeground} />
            <Text style={[styles.entryCount, { color: c.mutedForeground }]}>
              {entryCount} {isHi ? "एंट्री" : "entries"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {laborer.phone ? (
            <TouchableOpacity onPress={onMessage} style={[styles.actionBtn, { backgroundColor: c.primary + "15", borderColor: c.primary + "30" }]}>
              <Feather name="message-circle" size={16} color={c.primary} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { backgroundColor: c.secondary, borderColor: c.border }]}>
            <Feather name="edit-2" size={16} color={c.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Feather name="trash-2" size={16} color="#dc2626" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.secondary, borderColor: c.border }]} onPress={onPress}>
            <Feather name="chevron-right" size={16} color={c.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.balanceRow, { backgroundColor: c.background, borderColor: c.border }]}>
        <View style={styles.balanceItem}>
          <Text style={[styles.balanceLabel, { color: c.mutedForeground }]}>{isHi ? "कुल काम" : "Total"}</Text>
          <Text style={[styles.balanceValue, { color: c.foreground }]}>₹{total.toFixed(0)}</Text>
        </View>
        <View style={[styles.balanceDivider, { backgroundColor: c.border }]} />
        <View style={styles.balanceItem}>
          <Text style={[styles.balanceLabel, { color: c.mutedForeground }]}>{isHi ? "दे दिया" : "Paid"}</Text>
          <Text style={[styles.balanceValue, { color: c.accent }]}>₹{paid.toFixed(0)}</Text>
        </View>
        <View style={[styles.balanceDivider, { backgroundColor: c.border }]} />
        <View style={styles.balanceItem}>
          <Text style={[styles.balanceLabel, { color: c.mutedForeground }]}>{isHi ? "बाकी" : "Balance"}</Text>
          <Text style={[styles.balanceValue, { color: balanceColor, fontWeight: "900" }]}>
            ₹{balance.toFixed(0)}
          </Text>
        </View>
      </View>

      {isBalanced && balance === 0 && total > 0 ? (
        <View style={[styles.settledBadge, { backgroundColor: c.accent + "15" }]}>
          <Feather name="check-circle" size={12} color={c.accent} />
          <Text style={[styles.settledText, { color: c.accent }]}>
            {isHi ? "पूरा हिसाब हो गया" : "Fully settled"}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, borderLeftWidth: 4,
    marginBottom: 10, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    gap: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  avatarText: { fontSize: 21, fontWeight: "800", color: "#fff" },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 16, fontWeight: "800" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  phone: { fontSize: 12 },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  entryCount: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 5 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 9, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  balanceRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  balanceItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  balanceDivider: { width: 1 },
  balanceLabel: { fontSize: 11, fontWeight: "600", marginBottom: 3, textTransform: "uppercase" },
  balanceValue: { fontSize: 15, fontWeight: "700" },
  settledBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start",
  },
  settledText: { fontSize: 12, fontWeight: "700" },
});
