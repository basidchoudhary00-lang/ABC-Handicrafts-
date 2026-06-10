import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, KeyboardAvoidingView,
  ScrollView, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";

const PRIMARY = "#2563eb";
const ACCENT = "#059669";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, error, clearError } = useAuth();
  const { lang, toggleLang } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const isHi = lang === "hi";

  async function handleRegister() {
    setLocalError("");
    clearError();
    if (!name.trim()) { setLocalError(t("errName", lang)); return; }
    if (!email.trim()) { setLocalError(t("errEmail", lang)); return; }
    if (password.length < 6) { setLocalError(t("errPassword6", lang)); return; }
    if (password !== confirm) { setLocalError(t("errPasswordMatch", lang)); return; }
    try {
      setLoading(true);
      await register(name, email, password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.topBg} />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: Platform.OS === "web" ? 70 : insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
            <Feather name="globe" size={13} color="#fff" />
            <Text style={styles.langText}>{isHi ? "English" : "हिंदी"}</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoEmoji}>✍️</Text>
            </View>
          </View>
          <Text style={styles.appName}>{isHi ? "नया अकाउंट" : "New Account"}</Text>
          <Text style={styles.appSub}>{isHi ? "अकाउंट बनाएं और शुरू करें" : "Create your account and get started"}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {displayError ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={15} color="#dc2626" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>{t("nameLabel", lang)}</Text>
            <View style={styles.inputWrap}>
              <Feather name="user" size={17} color="#94a3b8" />
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("namePlaceholder", lang)} placeholderTextColor="#94a3b8" autoCapitalize="words" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("emailLabel", lang)}</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={17} color="#94a3b8" />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={t("emailPlaceholder", lang)} placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("passwordLabel", lang)}</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={17} color="#94a3b8" />
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={isHi ? "कम से कम 6 अक्षर" : "At least 6 characters"} placeholderTextColor="#94a3b8" secureTextEntry={!showPass} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Feather name={showPass ? "eye-off" : "eye"} size={17} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("confirmPasswordLabel", lang)}</Text>
            <View style={[styles.inputWrap, confirm && confirm !== password ? { borderColor: "#fca5a5" } : {}]}>
              <Feather name="lock" size={17} color="#94a3b8" />
              <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder={t("confirmPasswordPlaceholder", lang)} placeholderTextColor="#94a3b8" secureTextEntry={!showPass} autoCapitalize="none" />
              {confirm && confirm === password ? <Feather name="check-circle" size={17} color={ACCENT} /> : null}
            </View>
          </View>

          <TouchableOpacity style={[styles.registerBtn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Feather name="user-check" size={18} color="#fff" />
                <Text style={styles.registerBtnText}>{t("registerBtn", lang)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.loginLinkWrap}>
          <Text style={styles.loginLink}>{t("alreadyHaveAccount", lang)}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f1f5f9" },
  topBg: {
    position: "absolute", top: 0, left: 0, right: 0, height: 260,
    backgroundColor: PRIMARY, borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  container: { paddingHorizontal: 24, alignItems: "center", flexGrow: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#ffffff25", alignItems: "center", justifyContent: "center" },
  langBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#ffffff25", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#ffffff40" },
  langText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logoRing: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#ffffff25", alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 2, borderColor: "#ffffff50" },
  logoInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  logoEmoji: { fontSize: 34 },
  appName: { fontSize: 24, fontWeight: "900", color: "#fff" },
  appSub: { fontSize: 13, color: "#bfdbfe", marginTop: 4 },
  card: {
    width: "100%", backgroundColor: "#fff", borderRadius: 24, padding: 22, gap: 14,
    shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
  },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, padding: 12 },
  errorText: { fontSize: 13, color: "#dc2626", flex: 1, lineHeight: 20 },
  field: { gap: 7 },
  label: { fontSize: 12, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#f8fafc" },
  input: { flex: 1, fontSize: 15, color: "#0f172a" },
  registerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 14, backgroundColor: ACCENT, marginTop: 4 },
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  loginLinkWrap: { marginTop: 20 },
  loginLink: { fontSize: 14, fontWeight: "600", color: PRIMARY, textDecorationLine: "underline", textAlign: "center" },
});
