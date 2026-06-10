import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Laborer } from "@/contexts/DataContext";

interface AddLaborerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, phone: string) => void;
  editLaborer?: Laborer | null;
}

export function AddLaborerModal({ visible, onClose, onSave, editLaborer }: AddLaborerModalProps) {
  const c = useColors();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (visible) {
      if (editLaborer) {
        setName(editLaborer.name);
        setPhone(editLaborer.phone || "");
      } else {
        setName("");
        setPhone("");
      }
    }
  }, [visible, editLaborer]);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("त्रुटि", "कृपया मजदूर का नाम डालें");
      return;
    }
    onSave(name.trim(), phone.trim());
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={c.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.foreground }]}>
            {editLaborer ? "मजदूर बदलें" : "नया मजदूर जोड़ें"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: c.primary }]}>
            <Text style={[styles.saveBtnText, { color: c.primaryForeground }]}>सेव</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>नाम *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder="मजदूर का नाम"
              placeholderTextColor={c.mutedForeground}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.mutedForeground }]}>मोबाइल नंबर</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="10 अंकों का नंबर"
              placeholderTextColor={c.mutedForeground}
              keyboardType="phone-pad"
              maxLength={13}
            />
            <Text style={[styles.hint, { color: c.mutedForeground }]}>
              SMS भेजने के लिए नंबर जरूरी है
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 16 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  form: {
    padding: 20,
    gap: 20,
  },
  field: {},
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 5,
  },
});
