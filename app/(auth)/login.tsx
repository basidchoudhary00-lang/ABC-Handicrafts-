import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, KeyboardAvoidingView,
  ScrollView, ActivityIndicator, Image, Modal, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/constants/translations";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, resetPassword, error, clearError } = useAuth();
  const { lang, toggleLang } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const isHi = lang === "hi";

  async function handleLogin() {
    if (!email || !password) return;
    try {
      setLoading(true);
      clearError();
      await login(email, password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function openForgot() {
    setForgotEmail(email);
    setForgotSent(false);
    clearError();
    setShowForgot(true);
  }

  function closeForgot() {
    setShowForgot(false);
    setForgotEmail("");
    setForgotSent(false);
  }

  async function handleResetPassword() {
    if (!forgotEmail.trim()) {
      Alert.alert(
        isHi ? "ईमेल डालें" : "Enter Email",
        isHi ? "कृपया अपना ईमेल पता डालें।" : "Please enter your email address."
      );
      return;
    }
    try {
      setForgotLoading(true);
      clearError();
      await resetPassword(forgotEmail);
      setForgotSent(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.topBg} />

        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: Platform.OS === "web" ? 80 : insets.top + 30, paddingBottom: insets.bottom + 24 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
            <Feather name="globe" size={14} color="#fff" />
            <Text style={styles.langText}>{isHi ? "English" : "हिंदी"}</Text>
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.appName}>ABC Handicrafts</Text>
            <Text style={styles.appSub}>{isHi ? "लेबर और स्टॉक मैनेजमेंट" : "Labour & Stock Management"}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isHi ? "लॉगिन करें" : "Sign In"}</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={15} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{t("emailLabel", lang)}</Text>
              <View style={styles.inputWrap}>
                <Feather name="mail" size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("emailPlaceholder", lang)}
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>{t("passwordLabel", lang)}</Text>
                <TouchableOpacity onPress={openForgot}>
                  <Text style={styles.forgotLink}>
                    {isHi ? "पासवर्ड भूल गए?" : "Forgot Password?"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("passwordPlaceholder", lang)}
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Feather name={showPass ? "eye-off" : "eye"} size={17} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="log-in" size={18} color="#fff" />
                  <Text style={styles.loginBtnText}>{t("loginBtn", lang)}</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("orDivider", lang)}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.registerBtnText}>{t("createAccount", lang)}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>{t("loginHint", lang)}</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Forgot Password Modal ── */}
      <Modal visible={showForgot} transparent animationType="fade" onRequestClose={closeForgot}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeForgot} />
          <View style={styles.forgotCard}>
            <View style={styles.forgotHeader}>
              <View style={styles.forgotIconWrap}>
                <Feather name="key" size={22} color={PRIMARY} />
              </View>
              <TouchableOpacity onPress={closeForgot} style={styles.forgotClose}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.forgotTitle}>
              {isHi ? "पासवर्ड रीसेट करें" : "Reset Password"}
            </Text>
            <Text style={styles.forgotSub}>
              {isHi
                ? "अपना ईमेल डालें — हम आपको पासवर्ड बदलने का लिंक भेजेंगे।"
                : "Enter your email — we'll send you a link to reset your password."}
            </Text>

            {forgotSent ? (
              <View style={styles.sentBox}>
                <Feather name="check-circle" size={32} color="#059669" />
                <Text style={styles.sentTitle}>
                  {isHi ? "ईमेल भेज दिया!" : "Email Sent!"}
                </Text>
                <Text style={styles.sentMsg}>
                  {isHi
                    ? `${forgotEmail} पर पासवर्ड रीसेट लिंक भेजा गया है। अपना inbox देखें।`
                    : `Password reset link sent to ${forgotEmail}. Check your inbox.`}
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={closeForgot}>
                  <Text style={styles.doneBtnText}>{isHi ? "ठीक है" : "Done"}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {error ? (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={14} color="#dc2626" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputWrap}>
                  <Feather name="mail" size={17} color="#94a3b8" />
                  <TextInput
                    style={styles.input}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    placeholder={isHi ? "aapka@email.com" : "your@email.com"}
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.loginBtn, forgotLoading && styles.loginBtnDisabled]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="send" size={16} color="#fff" />
                      <Text style={styles.loginBtnText}>
                        {isHi ? "रीसेट लिंक भेजें" : "Send Reset Link"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const PRIMARY = "#2563eb";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f1f5f9" },
  topBg: {
    position: "absolute", top: 0, left: 0, right: 0, height: 280,
    backgroundColor: PRIMARY, borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  container: { paddingHorizontal: 24, alignItems: "center", flexGrow: 1 },
  langBtn: {
    alignSelf: "flex-end",
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#ffffff25", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: "#ffffff40",
  },
  langText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  logoSection: { alignItems: "center", marginBottom: 28 },
  logoRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#ffffff25", alignItems: "center", justifyContent: "center",
    marginBottom: 14, borderWidth: 2, borderColor: "#ffffff50",
  },
  logoInner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  logoImage: { width: 72, height: 72, borderRadius: 36 },
  appName: { fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  appSub: { fontSize: 14, color: "#bfdbfe", marginTop: 4 },
  card: {
    width: "100%", backgroundColor: "#fff", borderRadius: 24,
    padding: 24, gap: 16,
    shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  errorBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca",
    borderRadius: 12, padding: 12,
  },
  errorText: { fontSize: 13, color: "#dc2626", flex: 1, lineHeight: 20 },
  field: { gap: 7 },
  passwordLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 },
  forgotLink: { fontSize: 12, fontWeight: "700", color: PRIMARY },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13, backgroundColor: "#f8fafc",
  },
  input: { flex: 1, fontSize: 15, color: "#0f172a" },
  loginBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 15, borderRadius: 14, backgroundColor: PRIMARY, marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { fontSize: 13, color: "#94a3b8" },
  registerBtn: {
    paddingVertical: 14, borderRadius: 14, borderWidth: 2,
    borderColor: PRIMARY, alignItems: "center",
  },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: PRIMARY },
  hint: { fontSize: 12, textAlign: "center", color: "#94a3b8", marginTop: 20, lineHeight: 18 },

  modalOverlay: {
    flex: 1, backgroundColor: "#00000060",
    justifyContent: "flex-end", padding: 16, paddingBottom: 32,
  },
  forgotCard: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 12,
  },
  forgotHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  forgotIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: PRIMARY + "15", alignItems: "center", justifyContent: "center",
  },
  forgotClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center",
  },
  forgotTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  forgotSub: { fontSize: 14, color: "#64748b", lineHeight: 20 },
  sentBox: { alignItems: "center", gap: 10, paddingVertical: 8 },
  sentTitle: { fontSize: 18, fontWeight: "800", color: "#059669" },
  sentMsg: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  doneBtn: {
    marginTop: 8, paddingVertical: 14, paddingHorizontal: 40,
    backgroundColor: "#059669", borderRadius: 14,
  },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
