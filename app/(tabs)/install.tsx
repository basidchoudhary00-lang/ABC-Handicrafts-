import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert,
  Clipboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const COMMANDS = [
  { step: "1", label: "EAS CLI install karein", cmd: "npm install -g eas-cli" },
  { step: "2", label: "Login karein", cmd: "eas login" },
  { step: "3", label: "APK build karein", cmd: "eas build --platform android --profile preview" },
];

function CopyBox({ text, label }: { text: string; label: string }) {
  const c = useColors();
  const [copied, setCopied] = useState(false);

  function copy() {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={[styles.cmdBox, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.cmdTop}>
        <Text style={[styles.cmdLabel, { color: c.mutedForeground }]}>{label}</Text>
        <TouchableOpacity
          onPress={copy}
          style={[styles.copyBtn, { backgroundColor: copied ? "#22c55e20" : c.primary + "15" }]}
        >
          <Feather name={copied ? "check" : "copy"} size={13} color={copied ? "#22c55e" : c.primary} />
          <Text style={[styles.copyText, { color: copied ? "#22c55e" : c.primary }]}>
            {copied ? "Copy हो गया!" : "Copy करें"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.cmdText, { color: c.foreground }]}>{text}</Text>
    </View>
  );
}

function StepCard({
  num, icon, title, desc, extra,
}: {
  num: string; icon: string; title: string; desc: string; extra?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={[styles.stepCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNum, { backgroundColor: c.primary }]}>
          <Text style={styles.stepNumText}>{num}</Text>
        </View>
        <View style={[styles.stepIconWrap, { backgroundColor: c.primary + "15" }]}>
          <Feather name={icon as any} size={18} color={c.primary} />
        </View>
        <Text style={[styles.stepTitle, { color: c.foreground }]}>{title}</Text>
      </View>
      <Text style={[styles.stepDesc, { color: c.mutedForeground }]}>{desc}</Text>
      {extra}
    </View>
  );
}

export default function InstallScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  function openExpo() {
    Linking.openURL("https://expo.dev/signup");
  }

  function openPlayProtect() {
    Alert.alert(
      "Install Blocked?",
      "Agar 'blocked by Play Protect' aaye:\n\n1. 'More details' tap karein\n2. 'Install anyway' tap karein\n\nYeh bilkul safe hai — aapka apna app hai.",
      [{ text: "Samajh gaya", style: "default" }]
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 60 : insets.top + 16,
          paddingBottom: insets.bottom + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroRow}>
        <View style={[styles.heroIcon, { backgroundColor: c.primary }]}>
          <Feather name="smartphone" size={32} color="#fff" />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: c.foreground }]}>APK Install Guide</Text>
          <Text style={[styles.heroSub, { color: c.mutedForeground }]}>
            Android phone par app install karein
          </Text>
        </View>
      </View>

      <View style={[styles.banner, { backgroundColor: "#22c55e18", borderColor: "#22c55e40" }]}>
        <Feather name="info" size={16} color="#22c55e" />
        <Text style={[styles.bannerText, { color: "#166534" }]}>
          Yeh ek baar ka kaam hai — iske baad app bilkul normal Android app ki tarah chalegi
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.foreground }]}>
        APK banane ke steps
      </Text>

      <StepCard
        num="1"
        icon="user-plus"
        title="Expo Account banayein (Free)"
        desc="Expo ek free service hai jisse hum APK build karte hain. Ek baar account banana hoga."
        extra={
          <TouchableOpacity
            onPress={openExpo}
            style={[styles.linkBtn, { backgroundColor: c.primary }]}
          >
            <Feather name="external-link" size={14} color="#fff" />
            <Text style={styles.linkBtnText}>expo.dev par Free Account Banayein</Text>
          </TouchableOpacity>
        }
      />

      <StepCard
        num="2"
        icon="terminal"
        title="Computer par yeh commands chalayein"
        desc="Computer ka Terminal / Command Prompt kholo aur neeche diye commands ek-ek karke chalao:"
        extra={
          <View style={styles.cmdList}>
            {COMMANDS.map((c) => (
              <CopyBox key={c.step} text={c.cmd} label={`Step ${c.step}: ${c.label}`} />
            ))}
          </View>
        }
      />

      <StepCard
        num="3"
        icon="download"
        title="APK Download karein"
        desc="Build complete hone par Expo aapko ek link dega. Us link par jaake APK file download karein apne Android phone par."
      />

      <StepCard
        num="4"
        icon="shield-off"
        title='Phone Settings mein "Unknown Sources" Allow karein'
        desc='APK install hone se pehle ek baar phone mein setting enable karni hogi:'
        extra={
          <View style={[styles.infoList, { backgroundColor: c.primary + "08" }]}>
            <Text style={[styles.infoItem, { color: c.mutedForeground }]}>
              {"📱 "}<Text style={{ fontWeight: "700", color: c.foreground }}>Settings</Text>
              {" → "}<Text style={{ fontWeight: "700", color: c.foreground }}>Security</Text>
              {" → "}<Text style={{ fontWeight: "700", color: c.foreground }}>Unknown Sources</Text>
              {" → ON karein"}
            </Text>
            <Text style={[styles.infoItem, { color: c.mutedForeground }]}>
              {"📱 Ya phir APK file tap karo, Android khud option dega"}
            </Text>
          </View>
        }
      />

      <StepCard
        num="5"
        icon="check-circle"
        title="APK Install karein"
        desc="Download ki gayi APK file par tap karein → Install karein → Done! Ab app icon home screen par aayega."
        extra={
          <TouchableOpacity
            onPress={openPlayProtect}
            style={[styles.warningBtn, { backgroundColor: "#f59e0b18", borderColor: "#f59e0b40" }]}
          >
            <Feather name="alert-triangle" size={14} color="#d97706" />
            <Text style={[styles.warningBtnText, { color: "#92400e" }]}>
              "Play Protect" warning aaye toh yahan tap karein
            </Text>
          </TouchableOpacity>
        }
      />

      <View style={[styles.divider, { backgroundColor: c.border }]} />

      <Text style={[styles.sectionTitle, { color: c.foreground }]}>
        Bina computer ke — Abhi Use Karein
      </Text>

      <View style={[styles.pwaCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.pwaHeader}>
          <View style={[styles.pwaIconWrap, { backgroundColor: "#3b82f618" }]}>
            <Feather name="globe" size={20} color="#3b82f6" />
          </View>
          <Text style={[styles.pwaTitle, { color: c.foreground }]}>
            Chrome Browser se Install Karein
          </Text>
        </View>
        <Text style={[styles.pwaDesc, { color: c.mutedForeground }]}>
          Agar abhi APK nahi banana chahte, toh Chrome browser mein app kholo aur{" "}
          <Text style={{ fontWeight: "700", color: c.foreground }}>"Add to Home Screen"</Text>
          {" "}option se directly phone mein install kar sakte ho — bilkul app jaisi feel aayegi.
        </Text>
        <View style={[styles.infoList, { backgroundColor: "#3b82f608" }]}>
          <Text style={[styles.infoItem, { color: c.mutedForeground }]}>
            {"🌐 Chrome mein app link kholo"}
          </Text>
          <Text style={[styles.infoItem, { color: c.mutedForeground }]}>
            {"⋮ Top-right menu tap karo"}
          </Text>
          <Text style={[styles.infoItem, { color: c.mutedForeground }]}>
            {'📲 "Add to Home screen" tap karo'}
          </Text>
          <Text style={[styles.infoItem, { color: c.mutedForeground }]}>
            {"✅ App icon home screen par aa jayegi!"}
          </Text>
        </View>
      </View>

      <View style={[styles.helpCard, { backgroundColor: c.primary + "10", borderColor: c.primary + "30" }]}>
        <Feather name="help-circle" size={18} color={c.primary} />
        <Text style={[styles.helpText, { color: c.mutedForeground }]}>
          Koi problem ho toh developer ko yeh screen ka screenshot bhejo — sab kuch yahan likha hai
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 16 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 },
  heroIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  heroSub: { fontSize: 14 },
  banner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderWidth: 1, borderRadius: 12, padding: 14,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: "500" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginTop: 4, marginBottom: 4 },
  stepCard: {
    borderWidth: 1, borderRadius: 16, padding: 16, gap: 10,
  },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  stepNumText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  stepIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: "700" },
  stepDesc: { fontSize: 14, lineHeight: 22 },
  linkBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, marginTop: 4,
  },
  linkBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cmdList: { gap: 10, marginTop: 4 },
  cmdBox: {
    borderWidth: 1, borderRadius: 12, padding: 12, gap: 8,
  },
  cmdTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cmdLabel: { fontSize: 12, fontWeight: "600" },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  copyText: { fontSize: 12, fontWeight: "600" },
  cmdText: {
    fontSize: 13, fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    lineHeight: 20,
  },
  infoList: { borderRadius: 10, padding: 12, gap: 8, marginTop: 4 },
  infoItem: { fontSize: 13, lineHeight: 22 },
  warningBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4,
  },
  warningBtnText: { flex: 1, fontSize: 13, fontWeight: "500" },
  divider: { height: 1, marginVertical: 4 },
  pwaCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  pwaHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  pwaIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  pwaTitle: { flex: 1, fontSize: 15, fontWeight: "700" },
  pwaDesc: { fontSize: 14, lineHeight: 22 },
  helpCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 4,
  },
  helpText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
