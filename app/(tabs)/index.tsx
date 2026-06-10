import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Platform, RefreshControl, Alert, Linking, TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useData, Laborer } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";
import { LaborerCard } from "@/components/LaborerCard";
import { AddLaborerModal } from "@/components/AddLaborerModal";
import { sendSMS } from "@/utils/sms";

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { lang, toggleLang } = useLang();
  const isHi = lang === "hi";
  const {
    laborers, addLaborer, updateLaborer, deleteLaborer,
    getLaborerTotal, getLaborerPaid, getLaborerBalance, getLaborerEntries,
    firestoreError,
  } = useData();
  const [showAddLaborer, setShowAddLaborer] = useState(false);
  const [editLaborer, setEditLaborer] = useState<Laborer | null>(null);
  const [refreshing] = useState(false);
  const [search, setSearch] = useState("");

  const filteredLaborers = useMemo(() =>
    search.trim()
      ? laborers.filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
      : laborers,
    [laborers, search]
  );

  const totalAll = laborers.reduce((s, l) => s + getLaborerTotal(l.id), 0);
  const paidAll = laborers.reduce((s, l) => s + getLaborerPaid(l.id), 0);
  const balanceAll = totalAll - paidAll;

  function handleLogout() {
    Alert.alert(t("logoutTitle", lang), t("logoutMsg", lang), [
      { text: t("no", lang), style: "cancel" },
      { text: t("yesLogout", lang), style: "destructive", onPress: () => logout() },
    ]);
  }

  async function handleSaveLaborer(name: string, phone: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editLaborer) await updateLaborer(editLaborer.id, name, phone);
    else await addLaborer(name, phone);
    setEditLaborer(null);
  }

  function handleDeleteLaborer(laborer: Laborer) {
    Alert.alert(
      isHi ? "मजदूर हटाएं" : "Delete Worker",
      isHi
        ? `${laborer.name} और उनकी सभी एंट्रियाँ हट जाएंगी।`
        : `${laborer.name} and all their entries will be deleted.`,
      [
        { text: isHi ? "नहीं" : "Cancel", style: "cancel" },
        {
          text: isHi ? "हाँ, हटाएं" : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLaborer(laborer.id);
            } catch {
              Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "हटाया नहीं जा सका।" : "Could not delete.");
            }
          },
        },
      ]
    );
  }

  async function handleMessage(laborer: Laborer) {
    const entries = getLaborerEntries(laborer.id);
    const total = getLaborerTotal(laborer.id);
    const paid = getLaborerPaid(laborer.id);
    const balance = total - paid;
    const recent = entries.slice(0, 5);
    const lines = recent.map(e => {
      const lbl = isHi ? (e.workType === "pairs" ? "जोड़ी" : e.workType === "kg" ? "किलो" : "नग") : e.workType.toUpperCase();
      const itemPart = (e as any).itemName ? `[${(e as any).itemName}] ` : "";
      return `${e.date}: ${itemPart}${e.quantity} ${lbl} × ₹${e.rate} = ₹${e.total.toFixed(0)}`;
    });
    const msg = isHi
      ? `नमस्ते ${laborer.name},\n\n📋 आपका काम विवरण:\n${lines.join("\n")}\n\n━━━━━━━━━━━━\n💰 कुल काम: ₹${total.toFixed(0)}\n✅ दे दिया: ₹${paid.toFixed(0)}\n⚠️ बाकी रकम (आपको मिलना है): ₹${balance.toFixed(0)}\n━━━━━━━━━━━━\n\nधन्यवाद।`
      : `Hello ${laborer.name},\n\n📋 Work Summary:\n${lines.join("\n")}\n\n━━━━━━━━━━━━\n💰 Total Work: ₹${total.toFixed(0)}\n✅ Paid: ₹${paid.toFixed(0)}\n⚠️ Outstanding Balance (your dues): ₹${balance.toFixed(0)}\n━━━━━━━━━━━━\n\nThank you.`;
    await sendSMS(laborer.phone, msg);
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ABC Handicrafts</Text>
            <Text style={styles.headerSub}>{user?.displayName || ""}{laborers.length > 0 ? ` · ${laborers.length} ${isHi ? "मजदूर" : "workers"}` : ""}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleLang}>
              <Feather name="globe" size={17} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#ffffff18" }]} onPress={handleLogout}>
              <Feather name="log-out" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#ffffff18" }]}>
            <Text style={styles.summaryLabel}>{isHi ? "कुल काम" : "Total Work"}</Text>
            <Text style={styles.summaryValue}>₹{totalAll.toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#ffffff18" }]}>
            <Text style={styles.summaryLabel}>{isHi ? "दे दिया" : "Paid"}</Text>
            <Text style={[styles.summaryValue, { color: "#86efac" }]}>₹{paidAll.toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#ffffff18" }]}>
            <Text style={styles.summaryLabel}>{isHi ? "बाकी" : "Balance"}</Text>
            <Text style={[styles.summaryValue, { color: balanceAll > 0 ? "#fca5a5" : "#86efac" }]}>₹{balanceAll.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      {/* Firestore error banner */}
      {firestoreError === "permission-denied" ? (
        <View style={styles.errorBanner}>
          <Feather name="alert-triangle" size={16} color="#92400e" />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorBannerTitle}>
              {isHi ? "Firebase Rules सेट करें" : "Set Firebase Rules"}
            </Text>
            <Text style={styles.errorBannerMsg}>
              {isHi
                ? "Firebase Console → Firestore → Rules mein \"allow read, write: if request.auth != null;\" लगाएं"
                : "Go to Firebase Console → Firestore → Rules and set: allow read, write: if request.auth != null;"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL("https://console.firebase.google.com")}>
            <Text style={styles.errorBannerLink}>Open →</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Search bar */}
      <View style={styles.searchOuter}>
        <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: search.length > 0 ? c.primary : c.border }]}>
          <Feather name="search" size={18} color={search.length > 0 ? c.primary : c.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: c.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder={isHi ? "🔍 मजदूर का नाम खोजें..." : "🔍 Search worker name..."}
            placeholderTextColor={c.mutedForeground}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x-circle" size={18} color={c.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredLaborers}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {}} tintColor={c.primary} />}
        ListHeaderComponent={
          filteredLaborers.length > 0 ? (
            <Text style={[styles.listHeader, { color: c.mutedForeground }]}>
              {search ? `${filteredLaborers.length} ${isHi ? "मिले" : "found"}` : `${laborers.length} ${isHi ? "मजदूर" : "Workers"}`}
            </Text>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: c.secondary }]}>
              <Feather name={search ? "search" : "users"} size={40} color={c.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.foreground }]}>
              {search ? (isHi ? "कोई मजदूर नहीं मिला" : "No worker found") : t("noLaborers", lang)}
            </Text>
            <Text style={[styles.emptyText, { color: c.mutedForeground }]}>
              {search ? (isHi ? `"${search}" से कोई मेल नहीं` : `No match for "${search}"`) : t("addLaborerHint", lang)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <LaborerCard
            laborer={item}
            total={getLaborerTotal(item.id)}
            paid={getLaborerPaid(item.id)}
            balance={getLaborerBalance(item.id)}
            entryCount={getLaborerEntries(item.id).length}
            onPress={() => router.push({ pathname: "/laborer/[id]", params: { id: item.id } })}
            onEdit={() => { setEditLaborer(item); setShowAddLaborer(true); }}
            onMessage={() => handleMessage(item)}
            onDelete={() => handleDeleteLaborer(item)}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary, bottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100 }]}
        onPress={() => { setEditLaborer(null); setShowAddLaborer(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      >
        <Feather name="user-plus" size={24} color="#fff" />
      </TouchableOpacity>

      <AddLaborerModal
        visible={showAddLaborer}
        onClose={() => { setShowAddLaborer(false); setEditLaborer(null); }}
        onSave={handleSaveLaborer}
        editLaborer={editLaborer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 18 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "#bfdbfe", marginTop: 2 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ffffff22", alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center" },
  summaryLabel: { fontSize: 11, color: "#bfdbfe", fontWeight: "600", marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: "800", color: "#fff" },
  errorBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#fef3c7", borderBottomWidth: 1, borderBottomColor: "#fde68a",
    padding: 14,
  },
  errorBannerTitle: { fontSize: 13, fontWeight: "800", color: "#92400e", marginBottom: 2 },
  errorBannerMsg: { fontSize: 12, color: "#78350f", lineHeight: 16 },
  errorBannerLink: { fontSize: 12, fontWeight: "700", color: "#92400e", marginTop: 2 },
  searchOuter: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "#f1f5f9",
  },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, borderRadius: 14,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  listHeader: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, paddingBottom: 8 },
  list: { padding: 14 },
  emptyState: { alignItems: "center", paddingTop: 70, gap: 12 },
  emptyIconWrap: { width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyText: { fontSize: 14, textAlign: "center" },
  fab: {
    position: "absolute", right: 20, width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1d4ed8", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
});
