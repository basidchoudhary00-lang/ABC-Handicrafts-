import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/contexts/DataContext";

export default function SyncScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { exportData, importData, laborers, entries } = useData();
  const [importText, setImportText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  async function handleExport() {
    const data = exportData();
    try {
      if (Platform.OS === "web") {
        await Clipboard.setStringAsync(data);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        Alert.alert("सफल", "डेटा क्लिपबोर्ड में कॉपी हुआ!\n\nदूसरे फोन में जाकर 'डेटा इम्पोर्ट' वाले बॉक्स में पेस्ट करें।");
      } else {
        await Share.share({
          message: data,
          title: "मजदूर ट्रैकर - डेटा शेयर",
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("त्रुटि", "डेटा शेयर नहीं हो सका।");
    }
  }

  async function handleCopyToClipboard() {
    const data = exportData();
    await Clipboard.setStringAsync(data);
    setIsCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setIsCopied(false), 2000);
    Alert.alert("कॉपी हो गया!", "डेटा कॉपी हो गया है। अब दूसरे फोन में यह ऐप खोलें, सिंक स्क्रीन पर जाएं, और पेस्ट करके इम्पोर्ट करें।");
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setImportText(text);
      } else {
        Alert.alert("खाली", "क्लिपबोर्ड में कुछ नहीं है।");
      }
    } catch {
      Alert.alert("त्रुटि", "क्लिपबोर्ड से पढ़ नहीं सका।");
    }
  }

  async function handleImport() {
    if (!importText.trim()) {
      Alert.alert("त्रुटि", "कृपया डेटा पेस्ट करें।");
      return;
    }
    const success = await importData(importText.trim());
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("सफल!", "डेटा इम्पोर्ट हो गया। नए मजदूर और एंट्रियाँ जुड़ गई हैं।");
      setImportText("");
    } else {
      Alert.alert("त्रुटि", "डेटा सही नहीं है। कृपया सही डेटा पेस्ट करें।");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: "डेटा सिंक",
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 + 20 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoBox, { backgroundColor: "#27ae6015", borderColor: "#27ae6040" }]}>
          <Feather name="zap" size={18} color="#27ae60" />
          <Text style={[styles.infoText, { color: c.foreground }]}>
            🔥 Firebase चालू है! दोनों फोनों में डेटा अपने आप सिंक होता है — कोई एक्सपोर्ट/इम्पोर्ट की जरूरत नहीं।{"\n"}नीचे बैकअप के लिए मैनुअल सिंक भी है।
          </Text>
        </View>

        <View style={[styles.statsBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: c.primary }]}>{laborers.length}</Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>मजदूर</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: c.accent }]}>{entries.length}</Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>एंट्रियाँ</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.foreground }]}>
          <Feather name="upload" size={16} color={c.primary} /> डेटा एक्सपोर्ट करें
        </Text>
        <Text style={[styles.sectionDesc, { color: c.mutedForeground }]}>
          इस फोन का सारा डेटा दूसरे फोन में भेजें।
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: c.primary }]}
          onPress={handleExport}
        >
          <Feather name="share-2" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>डेटा शेयर करें</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={handleCopyToClipboard}
        >
          <Feather name={isCopied ? "check" : "copy"} size={16} color={c.primary} />
          <Text style={[styles.secondaryBtnText, { color: c.primary }]}>
            {isCopied ? "कॉपी हो गया!" : "क्लिपबोर्ड में कॉपी करें"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <Text style={[styles.sectionTitle, { color: c.foreground }]}>
          <Feather name="download" size={16} color={c.accent} /> डेटा इम्पोर्ट करें
        </Text>
        <Text style={[styles.sectionDesc, { color: c.mutedForeground }]}>
          दूसरे फोन से कॉपी किया डेटा यहाँ पेस्ट करें।
        </Text>

        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={handlePasteFromClipboard}
        >
          <Feather name="clipboard" size={16} color={c.accent} />
          <Text style={[styles.secondaryBtnText, { color: c.accent }]}>क्लिपबोर्ड से पेस्ट करें</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.importInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]}
          value={importText}
          onChangeText={setImportText}
          placeholder="यहाँ डेटा पेस्ट करें..."
          placeholderTextColor={c.mutedForeground}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: c.accent }]}
          onPress={handleImport}
        >
          <Feather name="download" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>इम्पोर्ट करें</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    gap: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statsBox: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    minHeight: 120,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
