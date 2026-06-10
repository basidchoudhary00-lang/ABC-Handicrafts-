import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";
import { Payment, PaymentMode } from "@/contexts/DataContext";

interface PaymentCardProps {
  payment: Payment;
  laborerName?: string;
  showLaborer?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
}

function modeLabel(mode: PaymentMode, lang: "hi" | "en"): string {
  switch (mode) {
    case "UPI": return "UPI";
    case "cash": return lang === "hi" ? "नकद" : "Cash";
    case "bank": return lang === "hi" ? "बैंक" : "Bank";
    case "other": return lang === "hi" ? "अन्य" : "Other";
  }
}

function modeIcon(mode: PaymentMode): string {
  switch (mode) {
    case "UPI": return "smartphone";
    case "cash": return "dollar-sign";
    case "bank": return "credit-card";
    case "other": return "more-horizontal";
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

export function PaymentCard({ payment, laborerName, showLaborer, onEdit, onDelete, onMarkPaid }: PaymentCardProps) {
  const c = useColors();
  const { lang } = useLang();
  const isPaid = payment.status === "paid";

  function handleDelete() {
    Alert.alert(
      t("deletePaymentTitle", lang),
      t("deletePaymentMsg", lang),
      [
        { text: t("no", lang), style: "cancel" },
        { text: t("deleteBtn", lang), style: "destructive", onPress: onDelete },
      ]
    );
  }

  function handleMarkPaid() {
    Alert.alert(
      t("markPaidTitle", lang),
      `₹${payment.amount} ${lang === "hi" ? "दे दिया?" : "paid?"}`,
      [
        { text: t("no", lang), style: "cancel" },
        { text: t("yesGiven", lang), onPress: onMarkPaid },
      ]
    );
  }

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: c.card,
        borderColor: isPaid ? c.accent + "40" : "#f39c1240",
        borderLeftColor: isPaid ? c.accent : "#f39c12",
      },
    ]}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <View style={[styles.modeBadge, { backgroundColor: isPaid ? c.accent + "15" : "#f39c1215" }]}>
            <Feather name={modeIcon(payment.mode) as any} size={13} color={isPaid ? c.accent : "#f39c12"} />
            <Text style={[styles.modeText, { color: isPaid ? c.accent : "#f39c12" }]}>
              {modeLabel(payment.mode, lang)}
            </Text>
          </View>
          <Text style={[styles.date, { color: c.mutedForeground }]}>{formatDate(payment.date)}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: isPaid ? c.accent : "#f39c12" }]}>
            ₹{payment.amount.toFixed(0)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isPaid ? c.accent + "20" : "#f39c1220" }]}>
            <Feather name={isPaid ? "check-circle" : "clock"} size={11} color={isPaid ? c.accent : "#f39c12"} />
            <Text style={[styles.statusText, { color: isPaid ? c.accent : "#f39c12" }]}>
              {isPaid ? t("paidStatus", lang) : t("pending", lang)}
            </Text>
          </View>
        </View>
      </View>

      {showLaborer && laborerName ? (
        <Text style={[styles.laborerName, { color: c.primary }]}>{laborerName}</Text>
      ) : null}

      {payment.notes ? (
        <View style={[styles.notesRow, { backgroundColor: c.muted }]}>
          <Feather name="file-text" size={11} color={c.mutedForeground} />
          <Text style={[styles.notesText, { color: c.mutedForeground }]}>{payment.notes}</Text>
        </View>
      ) : null}

      {payment.createdByName ? (
        <View style={[styles.addedByRow, { backgroundColor: c.muted }]}>
          <Feather name="user" size={11} color={c.mutedForeground} />
          <Text style={[styles.addedByText, { color: c.mutedForeground }]}>
            {t("addedBy", lang)} <Text style={{ fontWeight: "700", color: c.foreground }}>{payment.createdByName}</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {!isPaid ? (
          <TouchableOpacity onPress={handleMarkPaid} style={[styles.paidBtn, { backgroundColor: c.accent }]}>
            <Feather name="check" size={13} color="#fff" />
            <Text style={styles.paidBtnText}>{t("markPaidBtn", lang)}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { borderColor: c.border }]}>
          <Feather name="edit-2" size={13} color={c.primary} />
          <Text style={[styles.actionText, { color: c.primary }]}>{t("editBtn", lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { borderColor: c.border }]}>
          <Feather name="trash-2" size={13} color={c.destructive} />
          <Text style={[styles.actionText, { color: c.destructive }]}>{t("deleteBtn", lang)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  leftSection: { gap: 6 },
  modeBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  modeText: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 13 },
  rightSection: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: 22, fontWeight: "800" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  laborerName: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  notesRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 5,
    borderRadius: 8, padding: 8, marginBottom: 6,
  },
  notesText: { fontSize: 13, flex: 1, lineHeight: 18 },
  addedByRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    marginBottom: 8,
  },
  addedByText: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  paidBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
  },
  paidBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: "600" },
});
