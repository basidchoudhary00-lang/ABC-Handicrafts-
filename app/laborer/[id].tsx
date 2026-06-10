import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Platform, Alert, ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useData, WorkEntry, Payment } from "@/contexts/DataContext";
import { EntryCard } from "@/components/EntryCard";
import { PaymentCard } from "@/components/PaymentCard";
import { AddEntryModal } from "@/components/AddEntryModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import { sendSMS } from "@/utils/sms";

type TabName = "entries" | "payments";

export default function LaborerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const {
    laborers,
    getLaborerEntries, getLaborerTotal,
    getLaborerPayments, getLaborerPaid, getLaborerBalance,
    addEntry, updateEntry, deleteEntry,
    addPayment, updatePayment, deletePayment, markPaymentPaid,
    deleteLaborer,
  } = useData();

  const laborer = laborers.find(l => l.id === id);
  const laborerEntries = getLaborerEntries(id ?? "");
  const laborerPayments = getLaborerPayments(id ?? "");
  const total = getLaborerTotal(id ?? "");
  const paid = getLaborerPaid(id ?? "");
  const balance = getLaborerBalance(id ?? "");

  const [activeTab, setActiveTab] = useState<TabName>("entries");
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editEntry, setEditEntry] = useState<WorkEntry | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);

  if (!laborer) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>मजदूर नहीं मिला</Text>
      </View>
    );
  }

  async function handleSaveEntry(entry: Omit<WorkEntry, "id" | "createdAt">) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (editEntry) { await updateEntry(editEntry.id, entry); }
      else { await addEntry(entry); }
    } catch {
      Alert.alert("त्रुटि", "एंट्री सेव नहीं हुई। Firestore Rules जाँचें।");
    }
    setEditEntry(null);
  }

  async function handleSavePayment(payment: Omit<Payment, "id" | "createdAt">) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editPayment) { await updatePayment(editPayment.id, payment); }
    else { await addPayment(payment); }
    setEditPayment(null);
  }

  async function handleSendSMS() {
    if (!laborer) return;
    if (!laborer.phone) { Alert.alert("नंबर नहीं", "इस मजदूर का मोबाइल नंबर नहीं है।"); return; }
    const recent = laborerEntries.slice(0, 8);
    const lines = recent.map(e => {
      const typeLabel = e.workType === "pairs" ? "जोड़ी" : e.workType === "kg" ? "किलो" : "नग";
      const itemPart = (e as any).itemName ? `[${(e as any).itemName}] ` : "";
      return `${e.date}: ${itemPart}${e.quantity} ${typeLabel} × ₹${e.rate} = ₹${e.total.toFixed(0)}`;
    });
    const msg = `नमस्ते ${laborer.name},\n\n📋 काम विवरण:\n${lines.join("\n")}\n\n━━━━━━━━━━━━\n💰 कुल काम: ₹${total.toFixed(0)}\n✅ दे दिया: ₹${paid.toFixed(0)}\n⚠️ बाकी रकम (आपको मिलना है): ₹${balance.toFixed(0)}\n━━━━━━━━━━━━\n\nधन्यवाद।`;
    await sendSMS(laborer.phone, msg);
  }

  function handleDeleteLaborer() {
    if (!laborer) return;
    Alert.alert(
      "मजदूर हटाएं",
      `${laborer.name} और उनकी सभी एंट्रियाँ व भुगतान हट जाएंगे।`,
      [
        { text: "नहीं", style: "cancel" },
        { text: "हाँ, हटाएं", style: "destructive", onPress: async () => { await deleteLaborer(id ?? ""); router.back(); } },
      ]
    );
  }

  const pendingPayments = laborerPayments.filter(p => p.status === "pending");

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Stack.Screen options={{
        title: laborer.name,
        headerStyle: { backgroundColor: c.primary },
        headerTintColor: "#fff",
        headerRight: () => (
          <TouchableOpacity onPress={handleDeleteLaborer} style={{ marginRight: 4 }}>
            <Feather name="trash-2" size={20} color="#fff" />
          </TouchableOpacity>
        ),
      }} />

      <View style={[styles.profileSection, { backgroundColor: c.primary }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: "#ffffff30" }]}>
            <Text style={styles.avatarText}>{laborer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{laborer.name}</Text>
            {laborer.phone ? <Text style={styles.profilePhone}>{laborer.phone}</Text> : null}
          </View>
          {laborer.phone ? (
            <TouchableOpacity style={[styles.smsBtn, { backgroundColor: "#ffffff30" }]} onPress={handleSendSMS}>
              <Feather name="message-circle" size={18} color="#fff" />
              <Text style={styles.smsBtnText}>SMS</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{total.toFixed(0)}</Text>
            <Text style={styles.statLabel}>कुल काम</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#a8f5c0" }]}>₹{paid.toFixed(0)}</Text>
            <Text style={styles.statLabel}>दे दिया</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: balance > 0 ? "#ffc09a" : "#a8f5c0" }]}>₹{balance.toFixed(0)}</Text>
            <Text style={styles.statLabel}>बाकी</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingPayments.length}</Text>
            <Text style={styles.statLabel}>पेंडिंग</Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {(["entries", "payments"] as TabName[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: c.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Feather
              name={tab === "entries" ? "clipboard" : "credit-card"}
              size={16}
              color={activeTab === tab ? c.primary : c.mutedForeground}
            />
            <Text style={[styles.tabText, { color: activeTab === tab ? c.primary : c.mutedForeground }]}>
              {tab === "entries" ? `काम (${laborerEntries.length})` : `भुगतान (${laborerPayments.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "entries" ? (
        <FlatList
          data={laborerEntries}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!laborerEntries.length}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="clipboard" size={44} color={c.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>कोई काम नहीं</Text>
              <Text style={[styles.emptyText, { color: c.mutedForeground }]}>नीचे + दबाकर एंट्री जोड़ें</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onEdit={() => { setEditEntry(item); setShowAddEntry(true); }}
              onDelete={() => deleteEntry(item.id)}
            />
          )}
        />
      ) : (
        <FlatList
          data={laborerPayments}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!laborerPayments.length}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="credit-card" size={44} color={c.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>कोई भुगतान नहीं</Text>
              <Text style={[styles.emptyText, { color: c.mutedForeground }]}>नीचे + दबाकर भुगतान जोड़ें</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              onEdit={() => { setEditPayment(item); setShowAddPayment(true); }}
              onDelete={() => deletePayment(item.id)}
              onMarkPaid={() => markPaymentPaid(item.id)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, {
          backgroundColor: activeTab === "entries" ? c.primary : c.accent,
          bottom: Platform.OS === "web" ? 34 + 16 : insets.bottom + 16,
        }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (activeTab === "entries") { setEditEntry(null); setShowAddEntry(true); }
          else { setEditPayment(null); setShowAddPayment(true); }
        }}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>

      <AddEntryModal
        visible={showAddEntry}
        onClose={() => { setShowAddEntry(false); setEditEntry(null); }}
        onSave={handleSaveEntry}
        laborers={laborers}
        defaultLaborerId={id}
        editEntry={editEntry}
      />

      <AddPaymentModal
        visible={showAddPayment}
        onClose={() => { setShowAddPayment(false); setEditPayment(null); }}
        onSave={handleSavePayment}
        laborers={laborers}
        defaultLaborerId={id}
        editPayment={editPayment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#fff" },
  profileName: { fontSize: 18, fontWeight: "800", color: "#fff" },
  profilePhone: { fontSize: 14, color: "#ffffffcc", marginTop: 2 },
  smsBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  smsBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  statsRow: {
    flexDirection: "row", backgroundColor: "#ffffff20",
    borderRadius: 14, padding: 14, alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 15, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 10, color: "#ffffffcc", marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: "#ffffff30" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  list: { padding: 16 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14 },
  fab: {
    position: "absolute", right: 20, width: 58, height: 58,
    borderRadius: 29, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
