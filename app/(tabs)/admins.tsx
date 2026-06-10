import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";

function timeAgo(ts: any, lang: "hi" | "en"): string {
  if (!ts) return lang === "hi" ? "अभी" : "Just now";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === "hi") {
    if (mins < 2) return "अभी";
    if (mins < 60) return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    return `${days} दिन पहले`;
  } else {
    if (mins < 2) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} days ago`;
  }
}

function formatJoined(ts: any): string {
  if (!ts) return "-";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
}

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

const AVATAR_COLORS = ["#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#d97706"];
const CONFIRM_WORD = "SEASON END";

export default function AdminsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { admins, entries, payments, laborers, clearSeasonEntries } = useData();
  const { lang } = useLang();
  const isHi = lang === "hi";

  const [showDanger, setShowDanger] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [clearing, setClearing] = useState(false);

  const sortedAdmins = [...admins].sort((a, b) => {
    const tA = a.lastSeen?.toDate?.()?.getTime() ?? 0;
    const tB = b.lastSeen?.toDate?.()?.getTime() ?? 0;
    return tB - tA;
  });

  async function handleSeasonClear() {
    if (confirmText !== CONFIRM_WORD) {
      Alert.alert(
        isHi ? "गलत शब्द" : "Wrong word",
        isHi ? `"${CONFIRM_WORD}" लिखें` : `Type "${CONFIRM_WORD}" exactly`
      );
      return;
    }

    Alert.alert(
      isHi ? "⚠️ आखिरी बार पूछ रहे हैं!" : "⚠️ Last confirmation!",
      isHi
        ? `${entries.length} एंट्रियाँ हमेशा के लिए हट जाएंगी। मजदूरों की जानकारी और भुगतान सुरक्षित रहेंगे। क्या आप सच में चाहते हैं?`
        : `${entries.length} entries will be permanently deleted. Laborers and payments will be kept safe. Are you sure?`,
      [
        { text: isHi ? "नहीं, रुको" : "No, wait", style: "cancel" },
        {
          text: isHi ? "हाँ, Season खत्म करो" : "Yes, End Season",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              const count = await clearSeasonEntries();
              setConfirmText("");
              setShowDanger(false);
              Alert.alert(
                isHi ? "✅ Season खत्म!" : "✅ Season Cleared!",
                isHi ? `${count} एंट्रियाँ हट गईं। नया Season शुरू करें!` : `${count} entries deleted. Start the new season!`
              );
            } catch {
              Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "कुछ गलत हुआ।" : "Something went wrong.");
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Text style={styles.headerTitle}>🛡️ {t("adminTitle", lang)}</Text>
        <Text style={styles.headerSub}>{sortedAdmins.length} {t("adminSubtitle", lang)}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync status */}
        <View style={[styles.syncBanner, { backgroundColor: "#d1fae5", borderColor: "#6ee7b7" }]}>
          <View style={styles.syncDot} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.syncTitle, { color: "#065f46" }]}>{t("syncStatus", lang)}</Text>
            <Text style={[styles.syncHint, { color: "#047857" }]}>{t("syncHint", lang)}</Text>
          </View>
          <Feather name="zap" size={18} color="#059669" />
        </View>

        {sortedAdmins.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Feather name="shield" size={40} color={c.mutedForeground} />
            <Text style={[styles.emptyText, { color: c.mutedForeground }]}>{t("adminNoOther", lang)}</Text>
          </View>
        ) : (
          sortedAdmins.map((admin, index) => {
            const isMe = admin.uid === user?.uid;
            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
            const adminEntryCount = entries.filter(e => e.createdBy === admin.uid).length;
            const adminPaymentCount = payments.filter(p => p.createdBy === admin.uid).length;
            const adminLaborerCount = laborers.filter(l => l.createdBy === admin.uid).length;

            return (
              <View key={admin.uid} style={[styles.adminCard, { backgroundColor: c.card, borderColor: isMe ? c.primary + "50" : c.border, borderWidth: isMe ? 2 : 1 }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>{getInitials(admin.name) || admin.email[0]?.toUpperCase() || "?"}</Text>
                  </View>
                  <View style={styles.adminInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.adminName, { color: c.foreground }]} numberOfLines={1}>{admin.name || admin.email}</Text>
                      {isMe ? <View style={[styles.youBadge, { backgroundColor: c.primary }]}><Text style={styles.youText}>{t("adminYou", lang)}</Text></View> : null}
                    </View>
                    <Text style={[styles.adminEmail, { color: c.mutedForeground }]} numberOfLines={1}>{admin.email}</Text>
                    <View style={styles.metaRow}>
                      <Feather name="clock" size={11} color={c.mutedForeground} />
                      <Text style={[styles.metaText, { color: c.mutedForeground }]}>{t("adminLastSeen", lang)} {timeAgo(admin.lastSeen, lang)}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Feather name="calendar" size={11} color={c.mutedForeground} />
                      <Text style={[styles.metaText, { color: c.mutedForeground }]}>{t("adminJoined", lang)} {formatJoined(admin.joinedAt)}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.statsRow, { borderTopColor: c.border }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: c.foreground }]}>{adminLaborerCount}</Text>
                    <Text style={[styles.statLabel, { color: c.mutedForeground }]}>{isHi ? "मजदूर" : "workers"}</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: c.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: c.foreground }]}>{adminEntryCount}</Text>
                    <Text style={[styles.statLabel, { color: c.mutedForeground }]}>{isHi ? "एंट्री" : "entries"}</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: c.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: c.foreground }]}>{adminPaymentCount}</Text>
                    <Text style={[styles.statLabel, { color: c.mutedForeground }]}>{isHi ? "भुगतान" : "payments"}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={[styles.hintCard, { backgroundColor: c.secondary, borderColor: c.border }]}>
          <Feather name="info" size={15} color={c.primary} />
          <Text style={[styles.hintText, { color: c.mutedForeground }]}>{t("adminInviteHint", lang)}</Text>
        </View>

        {/* ── Season End (danger zone) ── */}
        <TouchableOpacity
          onPress={() => { setShowDanger(!showDanger); setConfirmText(""); }}
          style={[styles.dangerToggle, { borderColor: showDanger ? "#dc2626" : c.border, backgroundColor: showDanger ? "#fef2f2" : c.card }]}
        >
          <Feather name="alert-triangle" size={16} color={showDanger ? "#dc2626" : c.mutedForeground} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dangerToggleTitle, { color: showDanger ? "#dc2626" : c.foreground }]}>
              {isHi ? "Season खत्म करें" : "End Season"}
            </Text>
            <Text style={[styles.dangerToggleSub, { color: c.mutedForeground }]}>
              {isHi ? "सिर्फ एंट्री हटाएं — मजदूर सुरक्षित रहेंगे" : "Delete entries only — workers stay safe"}
            </Text>
          </View>
          <Feather name={showDanger ? "chevron-up" : "chevron-down"} size={16} color={c.mutedForeground} />
        </TouchableOpacity>

        {showDanger ? (
          <View style={[styles.dangerBox, { backgroundColor: "#fff8f8", borderColor: "#fecaca" }]}>
            <View style={styles.dangerInfoRow}>
              <Feather name="trash-2" size={20} color="#dc2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerInfoTitle}>
                  {isHi ? `${entries.length} एंट्रियाँ हटेंगी` : `${entries.length} entries will be deleted`}
                </Text>
                <Text style={styles.dangerInfoSub}>
                  {isHi
                    ? `${laborers.length} मजदूर और ${payments.length} भुगतान सुरक्षित रहेंगे`
                    : `${laborers.length} workers and ${payments.length} payments will be kept`}
                </Text>
              </View>
            </View>

            <Text style={styles.dangerLabel}>
              {isHi ? `नीचे "${CONFIRM_WORD}" लिखें:` : `Type "${CONFIRM_WORD}" below:`}
            </Text>
            <TextInput
              style={[styles.dangerInput, { borderColor: confirmText === CONFIRM_WORD ? "#dc2626" : "#fecaca" }]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder={CONFIRM_WORD}
              placeholderTextColor="#fca5a5"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              onPress={handleSeasonClear}
              disabled={clearing || confirmText !== CONFIRM_WORD}
              style={[styles.dangerBtn, { opacity: confirmText === CONFIRM_WORD ? 1 : 0.4 }]}
            >
              {clearing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="trash-2" size={16} color="#fff" />
                  <Text style={styles.dangerBtnText}>
                    {isHi ? "सभी एंट्री हटाएं" : "Delete All Entries"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#bfdbfe" },
  content: { padding: 16, gap: 12 },
  syncBanner: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  syncDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#059669" },
  syncTitle: { fontSize: 13, fontWeight: "700" },
  syncHint: { fontSize: 12, marginTop: 1 },
  emptyCard: { alignItems: "center", gap: 12, padding: 40, borderWidth: 1, borderRadius: 14 },
  emptyText: { fontSize: 14, textAlign: "center" },
  adminCard: { borderRadius: 16, overflow: "hidden" },
  cardTop: { flexDirection: "row", padding: 16, gap: 14, alignItems: "flex-start" },
  avatar: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 19, fontWeight: "800" },
  adminInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  adminName: { fontSize: 16, fontWeight: "700", flex: 1 },
  youBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  youText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  adminEmail: { fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  metaText: { fontSize: 12 },
  statsRow: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 12, paddingHorizontal: 16 },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 34, alignSelf: "center" },
  hintCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  hintText: { flex: 1, fontSize: 13, lineHeight: 20 },
  dangerToggle: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1.5, borderRadius: 14, padding: 14,
  },
  dangerToggleTitle: { fontSize: 14, fontWeight: "700" },
  dangerToggleSub: { fontSize: 12, marginTop: 2 },
  dangerBox: {
    borderWidth: 1.5, borderRadius: 14, padding: 16, gap: 12,
  },
  dangerInfoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dangerInfoTitle: { fontSize: 14, fontWeight: "700", color: "#dc2626" },
  dangerInfoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  dangerLabel: { fontSize: 13, fontWeight: "600", color: "#dc2626" },
  dangerInput: {
    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontWeight: "700", color: "#dc2626", backgroundColor: "#fff",
    letterSpacing: 1,
  },
  dangerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#dc2626", borderRadius: 12, paddingVertical: 14,
  },
  dangerBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
