import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useData, WorkType } from "@/contexts/DataContext";
import { SummaryCard } from "@/components/SummaryCard";

function monthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-01`;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

function workTypeLabel(t: WorkType) {
  return t === "pairs" ? "जोड़ी" : t === "kg" ? "किलो" : "नग";
}

export default function ReportScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { laborers, getFilteredEntries } = useData();
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(todayStr());

  const entries = useMemo(() => {
    return getFilteredEntries(undefined, startDate || undefined, endDate || undefined);
  }, [getFilteredEntries, startDate, endDate]);

  const totalAmount = entries.reduce((s, e) => s + e.total, 0);
  const totalEntries = entries.length;

  const byType = useMemo(() => {
    const map: Record<WorkType, { count: number; total: number }> = {
      pairs: { count: 0, total: 0 },
      kg: { count: 0, total: 0 },
      piece: { count: 0, total: 0 },
    };
    for (const e of entries) {
      map[e.workType].count++;
      map[e.workType].total += e.total;
    }
    return map;
  }, [entries]);

  const byLaborer = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    for (const e of entries) {
      if (!map[e.laborerId]) {
        const l = laborers.find(x => x.id === e.laborerId);
        map[e.laborerId] = { name: l?.name || "अज्ञात", total: 0, count: 0 };
      }
      map[e.laborerId].total += e.total;
      map[e.laborerId].count++;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [entries, laborers]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}>
        <Text style={styles.headerTitle}>रिपोर्ट</Text>
        <Text style={styles.headerSub}>काम का सारांश</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.filterBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>
            <Feather name="calendar" size={14} color={c.primary} /> तारीख फ़िल्टर
          </Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.filterLabel, { color: c.mutedForeground }]}>शुरुआत</Text>
              <TextInput
                style={[styles.dateInput, { borderColor: c.border, backgroundColor: c.background, color: c.foreground }]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
            <Text style={[styles.toText, { color: c.mutedForeground }]}>से</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.filterLabel, { color: c.mutedForeground }]}>अंत</Text>
              <TextInput
                style={[styles.dateInput, { borderColor: c.border, backgroundColor: c.background, color: c.foreground }]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            title="कुल एंट्री"
            value={totalEntries.toString()}
            color={c.primary}
          />
          <View style={{ width: 10 }} />
          <SummaryCard
            title="कुल रकम"
            value={`₹${totalAmount.toFixed(0)}`}
            color={c.accent}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 20 }]}>काम के प्रकार से</Text>
        <View style={{ gap: 8 }}>
          {(["pairs", "kg", "piece"] as WorkType[]).map(t => (
            <View key={t} style={[styles.typeRow, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.typeLeft}>
                <Text style={[styles.typeName, { color: c.foreground }]}>{workTypeLabel(t)}</Text>
                <Text style={[styles.typeCount, { color: c.mutedForeground }]}>{byType[t].count} एंट्री</Text>
              </View>
              <Text style={[styles.typeAmount, { color: c.primary }]}>₹{byType[t].total.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 20 }]}>मजदूर के अनुसार</Text>
        {byLaborer.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.emptyText, { color: c.mutedForeground }]}>इस अवधि में कोई डेटा नहीं</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {byLaborer.map((l, i) => (
              <View key={i} style={[styles.laborerRow, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.rank, { backgroundColor: i === 0 ? c.primary : c.muted }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? "#fff" : c.mutedForeground }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.laborerName, { color: c.foreground }]}>{l.name}</Text>
                  <Text style={[styles.laborerCount, { color: c.mutedForeground }]}>{l.count} एंट्री</Text>
                </View>
                <Text style={[styles.laborerAmount, { color: c.accent }]}>₹{l.total.toFixed(0)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "#ffffffcc",
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  filterBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  toText: {
    fontSize: 14,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  typeLeft: {},
  typeName: {
    fontSize: 15,
    fontWeight: "700",
  },
  typeCount: {
    fontSize: 12,
    marginTop: 2,
  },
  typeAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  laborerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "700",
  },
  laborerName: {
    fontSize: 15,
    fontWeight: "700",
  },
  laborerCount: {
    fontSize: 12,
    marginTop: 2,
  },
  laborerAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
