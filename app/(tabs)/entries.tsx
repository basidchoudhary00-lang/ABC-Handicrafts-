import React, { useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Platform, TextInput, ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useData, WorkEntry } from "@/contexts/DataContext";
import { useLang } from "@/contexts/LanguageContext";
import { EntryCard } from "@/components/EntryCard";
import { AddEntryModal } from "@/components/AddEntryModal";

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}
function monthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-01`;
}

type TabMode = "entries" | "report";

export default function EntriesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const isHi = lang === "hi";
  const { entries, laborers, addEntry, updateEntry, deleteEntry, getFilteredEntries } = useData();

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editEntry, setEditEntry] = useState<WorkEntry | null>(null);
  const [filterLaborerId, setFilterLaborerId] = useState<string>("");
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(todayStr());
  const [showFilters, setShowFilters] = useState(false);
  const [mode, setMode] = useState<TabMode>("entries");

  const filteredEntries = useMemo(() =>
    getFilteredEntries(filterLaborerId || undefined, startDate || undefined, endDate || undefined),
    [entries, filterLaborerId, startDate, endDate]
  );

  const totalFiltered = filteredEntries.reduce((s, e) => s + e.total, 0);

  // Item-wise quantity report — always uses ALL entries (full season)
  const itemReport = useMemo(() => {
    const map: Record<string, { qty: number; total: number; unit: string; count: number }> = {};
    entries.forEach(e => {
      const item = (e.itemName || "").trim() || (isHi ? "(बिना नाम)" : "(No name)");
      const unit = e.workType === "pairs" ? (isHi ? "जोड़ी" : "Pairs") : e.workType === "kg" ? "KG" : (isHi ? "नग" : "Piece");
      if (!map[item]) map[item] = { qty: 0, total: 0, unit, count: 0 };
      map[item].qty += e.quantity;
      map[item].total += e.total;
      map[item].count += 1;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [entries, isHi]);

  async function handleSaveEntry(entry: Omit<WorkEntry, "id" | "createdAt">) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editEntry) await updateEntry(editEntry.id, entry);
    else await addEntry(entry);
    setEditEntry(null);
  }

  function getLaborerName(id: string) {
    return laborers.find(l => l.id === id)?.name || (isHi ? "अज्ञात" : "Unknown");
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>{isHi ? "एंट्री / रिपोर्ट" : "Entries / Report"}</Text>
            <Text style={styles.headerSub}>
              {filteredEntries.length} {isHi ? "एंट्री" : "entries"} · ₹{totalFiltered.toFixed(0)}
            </Text>
          </View>
          {mode === "entries" ? (
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={[styles.filterBtn, { backgroundColor: showFilters ? "#fff" : "#ffffff25" }]}
            >
              <Feather name="sliders" size={18} color={showFilters ? c.primary : "#fff"} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, { backgroundColor: mode === "entries" ? "#fff" : "#ffffff20" }]}
            onPress={() => setMode("entries")}
          >
            <Feather name="list" size={14} color={mode === "entries" ? c.primary : "#fff"} />
            <Text style={[styles.modeBtnText, { color: mode === "entries" ? c.primary : "#fff" }]}>
              {isHi ? "एंट्री लिस्ट" : "Entries"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, { backgroundColor: mode === "report" ? "#fff" : "#ffffff20" }]}
            onPress={() => setMode("report")}
          >
            <Feather name="bar-chart-2" size={14} color={mode === "report" ? c.primary : "#fff"} />
            <Text style={[styles.modeBtnText, { color: mode === "report" ? c.primary : "#fff" }]}>
              {isHi ? "माल रिपोर्ट" : "Item Report"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilters ? (
        <View style={[styles.filtersBox, { backgroundColor: c.card, borderBottomColor: c.border }]}>
          <Text style={[styles.filterLabel, { color: c.mutedForeground }]}>{isHi ? "मजदूर" : "Worker"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: !filterLaborerId ? c.primary : c.secondary, borderColor: !filterLaborerId ? c.primary : c.border }]}
                onPress={() => setFilterLaborerId("")}
              >
                <Text style={[styles.chipText, { color: !filterLaborerId ? "#fff" : c.foreground }]}>{isHi ? "सभी" : "All"}</Text>
              </TouchableOpacity>
              {laborers.map(l => (
                <TouchableOpacity key={l.id}
                  style={[styles.chip, { backgroundColor: filterLaborerId === l.id ? c.primary : c.secondary, borderColor: filterLaborerId === l.id ? c.primary : c.border }]}
                  onPress={() => setFilterLaborerId(l.id)}
                >
                  <Text style={[styles.chipText, { color: filterLaborerId === l.id ? "#fff" : c.foreground }]}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.filterLabel, { color: c.mutedForeground }]}>{isHi ? "शुरुआत" : "From"}</Text>
              <TextInput style={[styles.dateInput, { borderColor: c.border, backgroundColor: c.background, color: c.foreground }]} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={c.mutedForeground} />
            </View>
            <Text style={[{ color: c.mutedForeground, marginBottom: 10, fontSize: 14 }]}>{isHi ? "से" : "to"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.filterLabel, { color: c.mutedForeground }]}>{isHi ? "अंत" : "To"}</Text>
              <TextInput style={[styles.dateInput, { borderColor: c.border, backgroundColor: c.background, color: c.foreground }]} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={c.mutedForeground} />
            </View>
          </View>
        </View>
      ) : null}

      {mode === "entries" ? (
        <FlatList
          data={filteredEntries}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: c.secondary }]}>
                <Feather name="clipboard" size={36} color={c.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>{isHi ? "कोई एंट्री नहीं" : "No entries yet"}</Text>
              <Text style={[styles.emptyText, { color: c.mutedForeground }]}>{isHi ? "नीचे + बटन से एंट्री जोड़ें" : "Tap + to add entries"}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <EntryCard entry={item} laborerName={getLaborerName(item.laborerId)} showLaborer
              onEdit={() => { setEditEntry(item); setShowAddEntry(true); }}
              onDelete={() => deleteEntry(item.id)}
            />
          )}
        />
      ) : (
        /* Item Report View */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.reportHeader, { backgroundColor: c.primary + "15", borderColor: c.primary + "30" }]}>
            <Feather name="bar-chart-2" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.reportHeaderTitle, { color: c.primary }]}>
                {isHi ? "माल की कुल मात्रा" : "Total Item Quantities"}
              </Text>
              <Text style={[styles.reportHeaderSub, { color: c.mutedForeground }]}>
                {isHi ? `पूरा Season · ${entries.length} एंट्री` : `Full Season · ${entries.length} entries`}
              </Text>
            </View>
          </View>

          {itemReport.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: c.secondary }]}>
                <Feather name="bar-chart-2" size={36} color={c.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>
                {isHi ? "कोई डेटा नहीं" : "No data"}
              </Text>
              <Text style={[styles.emptyText, { color: c.mutedForeground }]}>
                {isHi ? "एंट्री में माल का नाम डालें" : "Add item name in entries"}
              </Text>
            </View>
          ) : itemReport.map((item, i) => (
            <View key={item.name} style={[styles.reportCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.reportCardTop}>
                <View style={[styles.reportRank, { backgroundColor: i === 0 ? c.primary : c.secondary }]}>
                  <Text style={[styles.reportRankText, { color: i === 0 ? "#fff" : c.mutedForeground }]}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reportItemName, { color: c.foreground }]}>{item.name}</Text>
                  <Text style={[styles.reportItemSub, { color: c.mutedForeground }]}>
                    {item.count} {isHi ? "एंट्री" : "entries"}
                  </Text>
                </View>
                <Text style={[styles.reportItemTotal, { color: c.primary }]}>₹{item.total.toFixed(0)}</Text>
              </View>
              <View style={[styles.reportStats, { backgroundColor: c.background, borderColor: c.border }]}>
                <View style={styles.reportStat}>
                  <Text style={[styles.reportStatLabel, { color: c.mutedForeground }]}>{isHi ? "कुल मात्रा" : "Total Qty"}</Text>
                  <Text style={[styles.reportStatValue, { color: c.foreground }]}>
                    {item.qty % 1 === 0 ? item.qty : item.qty.toFixed(2)} {item.unit}
                  </Text>
                </View>
                <View style={[styles.reportStatDiv, { backgroundColor: c.border }]} />
                <View style={styles.reportStat}>
                  <Text style={[styles.reportStatLabel, { color: c.mutedForeground }]}>{isHi ? "कुल रकम" : "Total Amount"}</Text>
                  <Text style={[styles.reportStatValue, { color: c.primary }]}>₹{item.total.toFixed(0)}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {mode === "entries" ? (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: c.primary, bottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100 }]}
          onPress={() => { setEditEntry(null); setShowAddEntry(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Feather name="plus" size={26} color="#fff" />
        </TouchableOpacity>
      ) : null}

      <AddEntryModal
        visible={showAddEntry}
        onClose={() => { setShowAddEntry(false); setEditEntry(null); }}
        onSave={handleSaveEntry}
        laborers={laborers}
        editEntry={editEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "#bfdbfe", marginTop: 2 },
  filterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 8, borderRadius: 10,
  },
  modeBtnText: { fontSize: 13, fontWeight: "700" },
  filtersBox: { padding: 16, borderBottomWidth: 1 },
  filterLabel: { fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  dateRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  dateInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontSize: 14 },
  list: { padding: 14 },
  empty: { alignItems: "center", paddingTop: 70, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  fab: {
    position: "absolute", right: 20, width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1d4ed8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  reportHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14,
  },
  reportHeaderTitle: { fontSize: 15, fontWeight: "800" },
  reportHeaderSub: { fontSize: 12, marginTop: 2 },
  reportCard: {
    borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, gap: 10,
  },
  reportCardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  reportRank: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reportRankText: { fontSize: 12, fontWeight: "800" },
  reportItemName: { fontSize: 16, fontWeight: "800" },
  reportItemSub: { fontSize: 12, marginTop: 2 },
  reportItemTotal: { fontSize: 18, fontWeight: "800" },
  reportStats: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  reportStat: { flex: 1, alignItems: "center", paddingVertical: 10 },
  reportStatDiv: { width: 1 },
  reportStatLabel: { fontSize: 11, fontWeight: "600", marginBottom: 3, textTransform: "uppercase" },
  reportStatValue: { fontSize: 15, fontWeight: "700" },
});
