import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";
import { WorkEntry, WorkType } from "@/contexts/DataContext";

interface EntryCardProps {
  entry: WorkEntry & { itemName?: string };
  laborerName?: string;
  showLaborer?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function workTypeLabel(type: WorkType, lang: "hi" | "en"): string {
  switch (type) {
    case "pairs": return lang === "hi" ? "जोड़ी" : "Pairs";
    case "kg": return lang === "hi" ? "किलो" : "KG";
    case "piece": return lang === "hi" ? "नग" : "Piece";
  }
}

function workTypeColor(type: WorkType): string {
  switch (type) {
    case "pairs": return "#7c3aed";
    case "kg": return "#0891b2";
    case "piece": return "#c2410c";
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

export function EntryCard({ entry, laborerName, showLaborer, onEdit, onDelete }: EntryCardProps) {
  const c = useColors();
  const { lang } = useLang();
  const typeColor = workTypeColor(entry.workType);
  const typeLabel = workTypeLabel(entry.workType, lang);
  const isHi = lang === "hi";
  const itemName = (entry as any).itemName;

  function handleDelete() {
    Alert.alert(
      t("deleteEntryTitle", lang),
      t("deleteEntryMsg", lang),
      [
        { text: t("no", lang), style: "cancel" },
        {
          text: t("deleteBtn", lang),
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete();
            } catch {
              Alert.alert(
                isHi ? "हटा नहीं सका" : "Delete Failed",
                isHi ? "कुछ गलत हुआ। Firestore Rules जाँचें।" : "Something went wrong. Check Firestore Rules."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.topRow}>
        <View style={styles.leftTop}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + "20", borderColor: typeColor + "50" }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          {itemName ? (
            <View style={[styles.itemBadge, { backgroundColor: c.accent + "15", borderColor: c.accent + "40" }]}>
              <Text style={[styles.itemBadgeText, { color: c.accent }]}>{itemName}</Text>
            </View>
          ) : null}
          <Text style={[styles.date, { color: c.mutedForeground }]}>{formatDate(entry.date)}</Text>
        </View>
        <Text style={[styles.total, { color: c.primary }]}>₹{entry.total.toFixed(0)}</Text>
      </View>

      {showLaborer && laborerName ? (
        <Text style={[styles.laborerName, { color: c.primary }]}>{laborerName}</Text>
      ) : null}

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>{t("quantity", lang)}</Text>
          <Text style={[styles.detailValue, { color: c.foreground }]}>{entry.quantity} {typeLabel}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: c.border }]} />
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>{t("rate", lang)}</Text>
          <Text style={[styles.detailValue, { color: c.foreground }]}>₹{entry.rate}</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: c.border }]} />
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>{t("total", lang)}</Text>
          <Text style={[styles.detailValue, { color: c.primary, fontWeight: "700" }]}>₹{entry.total.toFixed(0)}</Text>
        </View>
      </View>

      {entry.notes ? (
        <View style={[styles.notesBox, { backgroundColor: c.muted }]}>
          <Feather name="file-text" size={12} color={c.mutedForeground} />
          <Text style={[styles.notesText, { color: c.mutedForeground }]}>{entry.notes}</Text>
        </View>
      ) : null}

      {entry.createdByName ? (
        <View style={[styles.addedByRow, { backgroundColor: c.muted }]}>
          <Feather name="user" size={11} color={c.mutedForeground} />
          <Text style={[styles.addedByText, { color: c.mutedForeground }]}>
            {t("addedBy", lang)} <Text style={{ fontWeight: "700", color: c.foreground }}>{entry.createdByName}</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { borderColor: c.border, flex: 1 }]}>
          <Feather name="edit-2" size={14} color={c.primary} />
          <Text style={[styles.actionText, { color: c.primary }]}>{t("editBtn", lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { borderColor: c.border, flex: 1 }]}>
          <Feather name="trash-2" size={14} color="#dc2626" />
          <Text style={[styles.actionText, { color: "#dc2626" }]}>{t("deleteBtn", lang)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, gap: 10,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  leftTop: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  typeText: { fontSize: 12, fontWeight: "700" },
  itemBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  itemBadgeText: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 12 },
  total: { fontSize: 18, fontWeight: "800" },
  laborerName: { fontSize: 13, fontWeight: "600" },
  detailsRow: { flexDirection: "row", alignItems: "center" },
  detailItem: { flex: 1, alignItems: "center" },
  detailLabel: { fontSize: 11, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: "600" },
  separator: { width: 1, height: 30 },
  notesBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 8, padding: 8 },
  notesText: { fontSize: 13, flex: 1, lineHeight: 18 },
  addedByRow: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  addedByText: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: "600" },
});
