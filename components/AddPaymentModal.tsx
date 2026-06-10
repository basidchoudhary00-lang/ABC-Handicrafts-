import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Payment, PaymentMode, PaymentStatus, Laborer } from "@/contexts/DataContext";

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, "id" | "createdAt">) => void;
  laborers: Laborer[];
  defaultLaborerId?: string;
  editPayment?: Payment | null;
}

const MODES: { value: PaymentMode; label: string; icon: string }[] = [
  { value: "UPI", label: "UPI", icon: "smartphone" },
  { value: "cash", label: "नकद", icon: "dollar-sign" },
  { value: "bank", label: "बैंक", icon: "credit-card" },
  { value: "other", label: "अन्य", icon: "more-horizontal" },
];

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

export function AddPaymentModal({
  visible, onClose, onSave, laborers, defaultLaborerId, editPayment,
}: AddPaymentModalProps) {
  const c = useColors();
  const [laborerId, setLaborerId] = useState(defaultLaborerId || "");
  const [date, setDate] = useState(todayStr());
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("UPI");
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible) {
      if (editPayment) {
        setLaborerId(editPayment.laborerId);
        setDate(editPayment.date);
        setAmount(editPayment.amount.toString());
        setMode(editPayment.mode);
        setStatus(editPayment.status);
        setNotes(editPayment.notes || "");
      } else {
        setLaborerId(defaultLaborerId || (laborers[0]?.id ?? ""));
        setDate(todayStr());
        setAmount("");
        setMode("UPI");
        setStatus("pending");
        setNotes("");
      }
    }
  }, [visible, editPayment, defaultLaborerId, laborers]);

  function handleSave() {
    if (!laborerId) { Alert.alert("त्रुटि", "कृपया मजदूर चुनें"); return; }
    if (!amount || parseFloat(amount) <= 0) { Alert.alert("त्रुटि", "कृपया सही रकम डालें"); return; }
    onSave({ laborerId, date, amount: parseFloat(amount), mode, status, notes: notes.trim() });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={c.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.foreground }]}>
            {editPayment ? "भुगतान बदलें" : "भुगतान जोड़ें"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: c.accent }]}>
            <Text style={[styles.saveBtnText, { color: "#fff" }]}>सेव</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>मजदूर *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {laborers.map(l => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.chip, {
                      backgroundColor: laborerId === l.id ? c.accent : c.secondary,
                      borderColor: laborerId === l.id ? c.accent : c.border,
                    }]}
                    onPress={() => setLaborerId(l.id)}
                  >
                    <Text style={[styles.chipText, { color: laborerId === l.id ? "#fff" : c.foreground }]}>
                      {l.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>तारीख *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={c.mutedForeground}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>रकम (₹) *</Text>
            <TextInput
              style={[styles.inputLarge, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={c.mutedForeground}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>भुगतान का तरीका</Text>
            <View style={styles.modeRow}>
              {MODES.map(m => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.modeBtn, {
                    backgroundColor: mode === m.value ? c.accent + "15" : c.card,
                    borderColor: mode === m.value ? c.accent : c.border,
                  }]}
                  onPress={() => setMode(m.value)}
                >
                  <Feather name={m.icon as any} size={16} color={mode === m.value ? c.accent : c.mutedForeground} />
                  <Text style={[styles.modeBtnText, { color: mode === m.value ? c.accent : c.foreground }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>स्थिति</Text>
            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[styles.statusBtn, {
                  backgroundColor: status === "pending" ? "#f39c12" + "20" : c.card,
                  borderColor: status === "pending" ? "#f39c12" : c.border,
                }]}
                onPress={() => setStatus("pending")}
              >
                <Feather name="clock" size={15} color={status === "pending" ? "#f39c12" : c.mutedForeground} />
                <Text style={[styles.statusBtnText, { color: status === "pending" ? "#f39c12" : c.foreground }]}>
                  बाकी है
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusBtn, {
                  backgroundColor: status === "paid" ? c.accent + "20" : c.card,
                  borderColor: status === "paid" ? c.accent : c.border,
                }]}
                onPress={() => setStatus("paid")}
              >
                <Feather name="check-circle" size={15} color={status === "paid" ? c.accent : c.mutedForeground} />
                <Text style={[styles.statusBtnText, { color: status === "paid" ? c.accent : c.foreground }]}>
                  दे दिया
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>नोट (वैकल्पिक)</Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="जैसे: मार्च का भुगतान..."
              placeholderTextColor={c.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 16 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 15, fontWeight: "700" },
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "600", marginBottom: 8,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  inputLarge: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 28, fontWeight: "700",
  },
  textarea: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 80,
  },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontWeight: "600" },
  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },
  modeBtnText: { fontSize: 14, fontWeight: "600" },
  statusRow: { flexDirection: "row", gap: 10 },
  statusBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
  },
  statusBtnText: { fontSize: 14, fontWeight: "700" },
});
