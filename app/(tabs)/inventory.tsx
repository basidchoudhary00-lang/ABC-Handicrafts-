import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Platform, Alert, Modal, TextInput, ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useData, InventoryItem } from "@/contexts/DataContext";
import { useLang } from "@/contexts/LanguageContext";

const UNITS = ["kg", "pairs", "piece"];
const CATEGORIES_HI = ["मोरखी", "गेठा", "अन्य"];
const CATEGORIES_EN = ["Morkhi", "Getha", "Other"];

interface ItemFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, "id" | "createdAt">) => void;
  editItem?: InventoryItem | null;
  lang: "hi" | "en";
}

function ItemFormModal({ visible, onClose, onSave, editItem, lang }: ItemFormProps) {
  const c = useColors();
  const isHi = lang === "hi";
  const CATS = isHi ? CATEGORIES_HI : CATEGORIES_EN;
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATS[0]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [minStock, setMinStock] = useState("5");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (visible) {
      if (editItem) {
        setName(editItem.name); setCategory(editItem.category);
        setQuantity(editItem.quantity.toString()); setUnit(editItem.unit);
        setMinStock(editItem.minStock.toString()); setNotes(editItem.notes || "");
      } else {
        setName(""); setCategory(CATS[0]); setQuantity(""); setUnit("kg"); setMinStock("5"); setNotes("");
      }
    }
  }, [visible, editItem]);

  function handleSave() {
    if (!name.trim()) { Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "नाम डालें" : "Enter item name"); return; }
    if (!quantity || parseFloat(quantity) < 0) { Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "मात्रा डालें" : "Enter quantity"); return; }
    onSave({ name: name.trim(), category, quantity: parseFloat(quantity), unit, minStock: parseFloat(minStock) || 0, notes: notes.trim() });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[fm.container, { backgroundColor: c.background }]}>
        <View style={[fm.header, { backgroundColor: c.primary }]}>
          <TouchableOpacity onPress={onClose} style={fm.headerBtn}>
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={fm.headerTitle}>{editItem ? (isHi ? "आइटम बदलें" : "Edit Item") : (isHi ? "नया आइटम" : "New Item")}</Text>
          <TouchableOpacity onPress={handleSave} style={fm.saveBtn}>
            <Feather name="check" size={18} color={c.primary} />
            <Text style={[fm.saveBtnText, { color: c.primary }]}>{isHi ? "सेव" : "Save"}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[fm.label, { color: c.mutedForeground }]}>{isHi ? "आइटम का नाम *" : "Item Name *"}</Text>
          <TextInput style={[fm.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} value={name} onChangeText={setName} placeholder={isHi ? "जैसे: सूती कपड़ा" : "e.g. Cotton Fabric"} placeholderTextColor={c.mutedForeground} />

          <Text style={[fm.label, { color: c.mutedForeground }]}>{isHi ? "श्रेणी" : "Category"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {CATS.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                  style={[fm.chip, { backgroundColor: category === cat ? c.primary : c.card, borderColor: category === cat ? c.primary : c.border }]}>
                  <Text style={[fm.chipText, { color: category === cat ? "#fff" : c.foreground }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[fm.label, { color: c.mutedForeground }]}>{isHi ? "मात्रा *" : "Quantity *"}</Text>
              <TextInput style={[fm.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={c.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[fm.label, { color: c.mutedForeground }]}>{isHi ? "इकाई" : "Unit"}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {UNITS.map(u => (
                    <TouchableOpacity key={u} onPress={() => setUnit(u)}
                      style={[fm.unitChip, { backgroundColor: unit === u ? c.primary : c.card, borderColor: unit === u ? c.primary : c.border }]}>
                      <Text style={[fm.chipText, { color: unit === u ? "#fff" : c.foreground, fontSize: 12 }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <Text style={[fm.label, { color: c.mutedForeground }]}>{isHi ? "न्यूनतम स्टॉक (alert)" : "Min Stock (for alert)"}</Text>
          <TextInput style={[fm.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} value={minStock} onChangeText={setMinStock} keyboardType="decimal-pad" placeholder="5" placeholderTextColor={c.mutedForeground} />

          <Text style={[fm.label, { color: c.mutedForeground }]}>{isHi ? "नोट" : "Notes"}</Text>
          <TextInput style={[fm.textarea, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} value={notes} onChangeText={setNotes} placeholder={isHi ? "कोई जानकारी..." : "Any notes..."} placeholderTextColor={c.mutedForeground} multiline numberOfLines={3} textAlignVertical="top" />
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const fm = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 16 : 20, paddingBottom: 14 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  saveBtnText: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 20 },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 80, marginBottom: 20 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  unitChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: "600" },
});

export default function InventoryScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
  const isHi = lang === "hi";

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");

  const filtered = inventory.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;

  async function handleSave(item: Omit<InventoryItem, "id" | "createdAt">) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editItem) await updateInventoryItem(editItem.id, item);
    else await addInventoryItem(item);
    setEditItem(null);
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      isHi ? "हटाएं" : "Delete",
      `"${name}" ${isHi ? "हटाना चाहते हैं?" : "will be deleted."}`,
      [
        { text: isHi ? "नहीं" : "Cancel", style: "cancel" },
        { text: isHi ? "हाँ" : "Delete", style: "destructive", onPress: async () => { await deleteInventoryItem(id); } },
      ]
    );
  }

  async function handleStockUpdate(item: InventoryItem, delta: number) {
    const newQty = Math.max(0, item.quantity + delta);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateInventoryItem(item.id, { quantity: newQty });
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Text style={styles.headerTitle}>📦 {isHi ? "स्टॉक / इन्वेंटरी" : "Stock / Inventory"}</Text>
        <Text style={styles.headerSub}>
          {inventory.length} {isHi ? "आइटम" : "items"}
          {lowStockCount > 0 ? ` · ⚠️ ${lowStockCount} ${isHi ? "कम स्टॉक" : "low stock"}` : ""}
        </Text>
        <View style={[styles.searchBox, { backgroundColor: "#ffffff20" }]}>
          <Feather name="search" size={15} color="#bfdbfe" />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder={isHi ? "खोजें..." : "Search..."} placeholderTextColor="#93c5fd" />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: c.secondary }]}>
              <Feather name="package" size={36} color={c.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.foreground }]}>{search ? (isHi ? "कुछ नहीं मिला" : "Nothing found") : (isHi ? "कोई आइटम नहीं" : "No inventory yet")}</Text>
            <Text style={[styles.emptyHint, { color: c.mutedForeground }]}>{isHi ? "+ बटन से आइटम जोड़ें" : "Tap + to add items"}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isLow = item.quantity <= item.minStock;
          const isEmpty = item.quantity === 0;
          return (
            <View style={[styles.card, { backgroundColor: c.card, borderColor: isEmpty ? "#fca5a5" : isLow ? "#fde68a" : c.border, borderLeftColor: isEmpty ? "#dc2626" : isLow ? "#d97706" : c.primary }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: c.foreground }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.categoryText, { color: c.mutedForeground }]}>{item.category}</Text>
                </View>
                <View style={styles.qtyBlock}>
                  <Text style={[styles.qtyNum, { color: isEmpty ? "#dc2626" : isLow ? "#d97706" : c.accent }]}>{item.quantity}</Text>
                  <Text style={[styles.qtyUnit, { color: c.mutedForeground }]}>{item.unit}</Text>
                </View>
              </View>

              {isEmpty ? (
                <View style={styles.alertRow}>
                  <Feather name="alert-circle" size={12} color="#dc2626" />
                  <Text style={[styles.alertText, { color: "#dc2626" }]}>{isHi ? "स्टॉक खत्म!" : "Out of stock!"}</Text>
                </View>
              ) : isLow ? (
                <View style={styles.alertRow}>
                  <Feather name="alert-triangle" size={12} color="#d97706" />
                  <Text style={[styles.alertText, { color: "#d97706" }]}>{isHi ? "कम स्टॉक" : "Low stock"}</Text>
                </View>
              ) : null}

              {item.notes ? (
                <View style={[styles.notesRow, { backgroundColor: c.muted }]}>
                  <Feather name="file-text" size={11} color={c.mutedForeground} />
                  <Text style={[styles.notesText, { color: c.mutedForeground }]} numberOfLines={2}>{item.notes}</Text>
                </View>
              ) : null}

              <View style={styles.cardBottom}>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]} onPress={() => handleStockUpdate(item, -1)}>
                    <Feather name="minus" size={14} color="#dc2626" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: "#d1fae5", borderColor: "#6ee7b7" }]} onPress={() => handleStockUpdate(item, 1)}>
                    <Feather name="plus" size={14} color="#059669" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: "#dbeafe", borderColor: "#93c5fd" }]} onPress={() => handleStockUpdate(item, 10)}>
                    <Text style={[styles.qtyBtnText, { color: "#2563eb" }]}>+10</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionBtns}>
                  <TouchableOpacity onPress={() => { setEditItem(item); setShowForm(true); }} style={[styles.actionBtn, { borderColor: c.border }]}>
                    <Feather name="edit-2" size={13} color={c.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={[styles.actionBtn, { borderColor: c.border }]}>
                    <Feather name="trash-2" size={13} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.minStockRow, { borderTopColor: c.border }]}>
                <Feather name="bar-chart-2" size={10} color={c.mutedForeground} />
                <Text style={[styles.minStockText, { color: c.mutedForeground }]}>
                  {isHi ? `न्यूनतम: ${item.minStock} ${item.unit}` : `Min: ${item.minStock} ${item.unit}`}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary, bottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100 }]}
        onPress={() => { setEditItem(null); setShowForm(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>

      <ItemFormModal
        visible={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
        lang={lang}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontSize: 21, fontWeight: "800", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#bfdbfe", marginBottom: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },
  list: { padding: 14, gap: 10 },
  emptyState: { alignItems: "center", paddingTop: 70, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyHint: { fontSize: 14 },
  card: { borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, backgroundColor: "#fff", overflow: "hidden" },
  cardTop: { flexDirection: "row", padding: 14, alignItems: "flex-start" },
  itemName: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
  categoryText: { fontSize: 12 },
  qtyBlock: { alignItems: "flex-end" },
  qtyNum: { fontSize: 26, fontWeight: "800" },
  qtyUnit: { fontSize: 12, marginTop: -2 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingBottom: 8 },
  alertText: { fontSize: 12, fontWeight: "700" },
  notesRow: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginHorizontal: 14, borderRadius: 8, padding: 8, marginBottom: 8 },
  notesText: { fontSize: 12, flex: 1 },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingBottom: 10 },
  qtyControls: { flexDirection: "row", gap: 6 },
  qtyBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 12, fontWeight: "700" },
  actionBtns: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  minStockRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderTopWidth: 1 },
  minStockText: { fontSize: 11 },
  fab: {
    position: "absolute", right: 20, width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1d4ed8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
});
