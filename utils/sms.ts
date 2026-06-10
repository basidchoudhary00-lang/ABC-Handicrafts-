import { Platform, Linking, Alert } from "react-native";

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!phone || phone.trim() === "") {
    Alert.alert(
      "नंबर नहीं है",
      "इस मजदूर का मोबाइल नंबर सेव नहीं है।\nपहले नंबर जोड़ें।"
    );
    return;
  }

  const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
  const encodedMsg = encodeURIComponent(message);

  if (Platform.OS === "web") {
    Alert.alert(
      "📱 SMS भेजें",
      `नंबर: ${cleanPhone}\n\n${message}`,
      [
        { text: "बंद करें", style: "cancel" },
        {
          text: "WhatsApp पर भेजें",
          onPress: () => {
            const waUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodedMsg}`;
            Linking.openURL(waUrl).catch(() => {
              Alert.alert("नहीं खुला", "WhatsApp इंस्टॉल नहीं है।");
            });
          },
        },
      ]
    );
    return;
  }

  // Android / iOS — directly open SMS without canOpenURL check
  // (canOpenURL needs special permissions on Android 11+)
  const separator = Platform.OS === "ios" ? "&" : "?";
  const url = `sms:${cleanPhone}${separator}body=${encodedMsg}`;

  try {
    await Linking.openURL(url);
  } catch {
    // Fallback: try WhatsApp
    const waUrl = `whatsapp://send?phone=${cleanPhone.replace("+", "")}&text=${encodedMsg}`;
    try {
      await Linking.openURL(waUrl);
    } catch {
      Alert.alert(
        "SMS नहीं भेजा जा सका",
        `मजदूर का नंबर: ${cleanPhone}\n\nMessage:\n${message}`,
        [{ text: "ठीक है" }]
      );
    }
  }
}
