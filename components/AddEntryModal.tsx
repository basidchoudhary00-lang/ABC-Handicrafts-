import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Platform, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLang } from "@/contexts/LanguageContext";
import { WorkEntry, WorkType, Laborer } from "@/contexts/DataContext";
import { useData } from "@/contexts/DataContext";
import { sendSMS } from "@/utils/sms";

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WorkEntry, "id" | "createdAt">) => void;
  laborers: Laborer[];
  defaultLaborerId?: string;
  editEntry?: WorkEntry | null;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

function workTypeLabel(type: WorkType, lang: "hi" | "en"): string {
  if (lang === "hi") return type === "pairs" ? "जोड़ी" : type === "kg" ? "किलो" : "नग";
  return type === "pairs" ? "Pairs" : type === "kg" ? "KG" : "Piece";
}

export function AddEntryModal({ visible, onClose, onSave, laborers, defaultLaborerId, editEntry }: AddEntryModalProps) {
  const c = useColors();
  const { lang } = useLang();
  const isHi = lang === "hi";
  const { workItemNames, addWorkItemName, deleteWorkItemName } = useData();

  const [laborerId, setLaborerId] = useState(defaultLaborerId || "");
  const [date, setDate] = useState(todayStr());
  const [workType, setWorkType] = useState<WorkType>("pairs");
  const [itemName, setItemName] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showItemManager, setShowItemManager] = useState(false);
  const [newItemInput, setNewItemInput] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendSmsAfter, setSendSmsAfter] = useState(true);

  const WORK_TYPES: { value: WorkType; label: string }[] = [
    { value: "pairs", label: isHi ? "जोड़ी" : "Pairs" },
    { value: "kg", label: isHi ? "किलो (KG)" : "KG" },
    { value: "piece", label: isHi ? "नग (Piece)" : "Piece" },
  ];

  const filteredItems = workItemNames.filter(i =>
    itemSearch.trim() === "" || i.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  useEffect(() => {
    if (visible) {
      if (editEntry) {
        setLaborerId(editEntry.laborerId);
        setDate(editEntry.date);
        setWorkType(editEntry.workType);
        setItemName(editEntry.itemName || "");
        setItemSearch(editEntry.itemName || "");
        setQuantity(editEntry.quantity.toString());
        setRate(editEntry.rate.toString());
        setNotes(editEntry.notes || "");
      } else {
        setLaborerId(defaultLaborerId || (laborers[0]?.id ?? ""));
        setDate(todayStr());
        setWorkType("pairs");
        setItemName("");
        setItemSearch("");
        setQuantity("");
        setRate("");
        setNotes("");
      }
      setShowItemManager(false);
      setNewItemInput("");
    }
  }, [visible, editEntry, defaultLaborerId, laborers]);

  const total = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);

  async function handleAddNewItem() {
    const trimmed = newItemInput.trim();
    if (!trimmed) return;
    if (workItemNames.find(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert(isHi ? "पहले से है" : "Already exists", isHi ? "यह आइटम पहले से लिस्ट में है।" : "This item already exists in list.");
      return;
    }
    await addWorkItemName(trimmed);
    setNewItemInput("");
  }

  async function handleDeleteItem(id: string, name: string) {
    Alert.alert(
      isHi ? "हटाएं?" : "Delete?",
      isHi ? `"${name}" लिस्ट से हटाएं?` : `Remove "${name}" from list?`,
      [
        { text: isHi ? "नहीं" : "Cancel", style: "cancel" },
        { text: isHi ? "हटाएं" : "Delete", style: "destructive", onPress: () => deleteWorkItemName(id) },
      ]
    );
  }

  async function handleSave() {
    if (!laborerId) {
      Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "कृपया मजदूर चुनें" : "Please select a worker");
      return;
    }
    if (!date) {
      Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "कृपया तारीख डालें" : "Please enter a date");
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "कृपया सही मात्रा डालें" : "Please enter valid quantity");
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      Alert.alert(isHi ? "त्रुटि" : "Error", isHi ? "कृपया सही दर डालें" : "Please enter valid rate");
      return;
    }

    const entry = {
      laborerId,
      date,
      workType,
      itemName: itemName.trim(),
      quantity: parseFloat(quantity),
      rate: parseFloat(rate),
      total,
      notes: notes.trim(),
    } as any;

    onSave(entry);
    onClose();

    if (sendSmsAfter && !editEntry) {
      const laborer = laborers.find(l => l.id === laborerId);
      if (laborer?.phone) {
        const typeLabel = workTypeLabel(workType, lang);
        const itemPart = itemName.trim() ? `📦 माल: ${itemName.trim()}\n` : "";
        const msg = isHi
          ? `नमस्ते ${laborer.name},\n\nनई एंट्री:\n📅 तारीख: ${date}\n${itemPart}🔢 काम: ${parseFloat(quantity)} ${typeLabel} × ₹${parseFloat(rate)}\n💰 कुल: ₹${total.toFixed(0)}${notes ? `\n📝 नोट: ${notes}` : ""}\n\nधन्यवाद।`
          : `Hello ${laborer.name},\n\nNew work entry:\n📅 Date: ${date}\n${itemName.trim() ? `📦 Item: ${itemName.trim()}\n` : ""}🔢 Work: ${parseFloat(quantity)} ${typeLabel} × ₹${parseFloat(rate)}\n💰 Total: ₹${total.toFixed(0)}${notes ? `\n📝 Note: ${notes}` : ""}\n\nThank you.`;
        await sendSMS(laborer.phone, msg);
      }
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: "#fff" }]}>
            {editEntry ? (isHi ? "एंट्री बदलें" : "Edit Entry") : (isHi ? "नई एंट्री जोड़ें" : "Add New Entry")}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Feather name="check" size={16} color={c.primary} />
            <Text style={[styles.saveBtnText, { color: c.primary }]}>{isHi ? "सेव" : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Worker select */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>{isHi ? "मजदूर चुनें *" : "Select Worker *"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {laborers.map(l => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.chip, { backgroundColor: laborerId === l.id ? c.primary : c.card, borderColor: laborerId === l.id ? c.primary : c.border }]}
                    onPress={() => setLaborerId(l.id)}
                  >
                    <Text style={[styles.chipText, { color: laborerId === l.id ? "#fff" : c.foreground }]}>{l.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>{isHi ? "तारीख *" : "Date *"}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={c.mutedForeground}
            />
          </View>

          {/* Item name — with managed list */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>{isHi ? "माल का नाम" : "Item Name"}</Text>
              <TouchableOpacity
                onPress={() => setShowItemManager(!showItemManager)}
                style={[styles.manageBtn, { backgroundColor: showItemManager ? c.primary : c.secondary, borderColor: c.border }]}
              >
                <Feather name="settings" size={12} color={showItemManager ? "#fff" : c.primary} />
                <Text style={[styles.manageBtnText, { color: showItemManager ? "#fff" : c.primary }]}>
                  {isHi ? "लिस्ट बनाएं" : "Manage List"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search + autocomplete */}
            <View style={[styles.itemSearchWrap, { backgroundColor: c.card, borderColor: itemName ? c.accent : c.border }]}>
              <Feather name="package" size={16} color={c.mutedForeground} />
              <TextInput
                style={[styles.itemSearchInput, { color: c.foreground }]}
                value={itemSearch}
                onChangeText={t => { setItemSearch(t); setItemName(t); }}
                placeholder={isHi ? "माल का नाम लिखें या नीचे से चुनें..." : "Type or select item below..."}
                placeholderTextColor={c.mutedForeground}
              />
              {itemName ? (
                <TouchableOpacity onPress={() => { setItemName(""); setItemSearch(""); }}>
                  <Feather name="x" size={16} color={c.mutedForeground} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Saved item chips */}
            {filteredItems.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={styles.chipRow}>
                  {filteredItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.chip, {
                        backgroundColor: itemName === item.name ? c.accent : c.card,
                        borderColor: itemName === item.name ? c.accent : c.border,
                      }]}
                      onPress={() => { setItemName(item.name); setItemSearch(item.name); }}
                    >
                      <Text style={[styles.chipText, { color: itemName === item.name ? "#fff" : c.foreground }]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : workItemNames.length === 0 ? (
              <Text style={[styles.noItemsHint, { color: c.mutedForeground }]}>
                {isHi ? '👆 "लिस्ट बनाएं" से अपने माल के नाम जोड़ें' : '👆 Tap "Manage List" to add your item names'}
              </Text>
            ) : null}

            {/* Item manager panel */}
            {showItemManager ? (
              <View style={[styles.managerPanel, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.managerTitle, { color: c.foreground }]}>
                  {isHi ? "माल की लिस्ट" : "Item List"}
                </Text>
                <View style={styles.addItemRow}>
                  <TextInput
                    style={[styles.addItemInput, { backgroundColor: c.background, borderColor: c.border, color: c.foreground }]}
                    value={newItemInput}
                    onChangeText={setNewItemInput}
                    placeholder={isHi ? "नया माल का नाम..." : "New item name..."}
                    placeholderTextColor={c.mutedForeground}
                    onSubmitEditing={handleAddNewItem}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={handleAddNewItem}
                    style={[styles.addItemBtn, { backgroundColor: c.primary }]}
                  >
                    <Feather name="plus" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                {workItemNames.length === 0 ? (
                  <Text style={[styles.noItemsHint, { color: c.mutedForeground }]}>
                    {isHi ? "अभी कोई आइटम नहीं है। ऊपर से जोड़ें।" : "No items yet. Add above."}
                  </Text>
                ) : (
                  workItemNames.map(item => (
                    <View key={item.id} style={[styles.managerItem, { borderBottomColor: c.border }]}>
                      <Feather name="package" size={14} color={c.mutedForeground} />
                      <Text style={[styles.managerItemText, { color: c.foreground }]}>{item.name}</Text>
                      <TouchableOpacity onPress={() => handleDeleteItem(item.id, item.name)} style={styles.deleteItemBtn}>
                        <Feather name="trash-2" size={14} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            ) : null}
          </View>

          {/* Work type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>{isHi ? "काम का प्रकार *" : "Work Type *"}</Text>
            <View style={styles.typeRow}>
              {WORK_TYPES.map(wt => (
                <TouchableOpacity
                  key={wt.value}
                  style={[styles.typeBtn, { backgroundColor: workType === wt.value ? c.primary : c.card, borderColor: workType === wt.value ? c.primary : c.border }]}
                  onPress={() => setWorkType(wt.value)}
                >
                  <Text style={[styles.typeBtnText, { color: workType === wt.value ? "#fff" : c.foreground }]}>{wt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Qty + Rate */}
          <View style={styles.row2}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>
                {isHi ? `मात्रा (${workTypeLabel(workType, lang)}) *` : `Qty (${workTypeLabel(workType, lang)}) *`}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>{isHi ? "दर (₹) *" : "Rate (₹) *"}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
                value={rate}
                onChangeText={setRate}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
          </View>

          {/* Total */}
          <View style={[styles.totalBox, { backgroundColor: c.primary + "15", borderColor: c.primary + "40" }]}>
            <Text style={[styles.totalLabel, { color: c.mutedForeground }]}>{isHi ? "कुल रकम" : "Total Amount"}</Text>
            <Text style={[styles.totalValue, { color: c.primary }]}>₹{total.toFixed(2)}</Text>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>{isHi ? "नोट (वैकल्पिक)" : "Note (Optional)"}</Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={notes}
              onChangeText={setNotes}
              placeholder={isHi ? "कोई विशेष जानकारी..." : "Any special notes..."}
              placeholderTextColor={c.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Auto SMS toggle */}
          {!editEntry ? (
            <TouchableOpacity
              onPress={() => setSendSmsAfter(!sendSmsAfter)}
              style={[styles.smsToggle, { backgroundColor: sendSmsAfter ? c.primary + "12" : c.card, borderColor: sendSmsAfter ? c.primary + "50" : c.border }]}
            >
              <View style={[styles.smsCheck, { backgroundColor: sendSmsAfter ? c.primary : c.muted, borderColor: sendSmsAfter ? c.primary : c.border }]}>
                {sendSmsAfter ? <Feather name="check" size={13} color="#fff" /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smsTitle, { color: sendSmsAfter ? c.primary : c.foreground }]}>
                  {isHi ? "SMS मजदूर को भेजें" : "Send SMS to Worker"}
                </Text>
                <Text style={[styles.smsHint, { color: c.mutedForeground }]}>
                  {isHi ? "सेव होने के बाद मजदूर को SMS जाएगा" : "Worker gets SMS after saving"}
                </Text>
              </View>
              <Feather name="message-circle" size={20} color={sendSmsAfter ? c.primary : c.mutedForeground} />
            </TouchableOpacity>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 16 : 20, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#fff",
  },
  saveBtnText: { fontSize: 14, fontWeight: "700" },
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  manageBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1,
  },
  manageBtnText: { fontSize: 11, fontWeight: "700" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 80 },
  itemSearchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
  },
  itemSearchInput: { flex: 1, fontSize: 15 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontWeight: "600" },
  noItemsHint: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  managerPanel: {
    marginTop: 10, borderRadius: 14, borderWidth: 1, padding: 14, gap: 4,
  },
  managerTitle: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  addItemRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  addItemInput: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 14,
  },
  addItemBtn: {
    width: 42, height: 42, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  managerItem: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  managerItemText: { flex: 1, fontSize: 14, fontWeight: "500" },
  deleteItemBtn: { padding: 4 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
  typeBtnText: { fontSize: 13, fontWeight: "700" },
  row2: { flexDirection: "row" },
  totalBox: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20, alignItems: "center" },
  totalLabel: { fontSize: 13, marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: "800" },
  smsToggle: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 16,
  },
  smsCheck: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  smsTitle: { fontSize: 14, fontWeight: "700" },
  smsHint: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
