export type Lang = "hi" | "en";

export const T = {
  // App name
  appName: { hi: "ABC Handicrafts", en: "ABC Handicrafts" },

  // Auth
  loginTitle: { hi: "ABC Handicrafts", en: "ABC Handicrafts" },
  loginSubtitle: { hi: "अपने अकाउंट में लॉगिन करें", en: "Sign in to your account" },
  emailLabel: { hi: "ईमेल", en: "Email" },
  emailPlaceholder: { hi: "aap@email.com", en: "you@email.com" },
  passwordLabel: { hi: "पासवर्ड", en: "Password" },
  passwordPlaceholder: { hi: "पासवर्ड डालें", en: "Enter password" },
  loginBtn: { hi: "लॉगिन करें", en: "Sign In" },
  orDivider: { hi: "या", en: "OR" },
  createAccount: { hi: "नया अकाउंट बनाएं", en: "Create New Account" },
  loginHint: { hi: "दोनों भाई अपना अलग अकाउंट बनाएं — डेटा अपने आप साथ रहेगा", en: "Each admin creates their own account — data syncs automatically" },

  // Register
  registerTitle: { hi: "नया अकाउंट", en: "New Account" },
  registerSubtitle: { hi: "अपना अकाउंट बनाएं और शुरू करें", en: "Create your account and get started" },
  nameLabel: { hi: "आपका नाम", en: "Your Name" },
  namePlaceholder: { hi: "जैसे: राजेश भाई", en: "e.g. Rajesh Kumar" },
  confirmPasswordLabel: { hi: "पासवर्ड दोबारा", en: "Confirm Password" },
  confirmPasswordPlaceholder: { hi: "पासवर्ड फिर डालें", en: "Re-enter password" },
  registerBtn: { hi: "अकाउंट बनाएं", en: "Create Account" },
  alreadyHaveAccount: { hi: "पहले से अकाउंट है? लॉगिन करें", en: "Already have an account? Sign In" },

  // Validation errors
  errName: { hi: "कृपया अपना नाम डालें", en: "Please enter your name" },
  errEmail: { hi: "कृपया ईमेल डालें", en: "Please enter your email" },
  errPassword6: { hi: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए", en: "Password must be at least 6 characters" },
  errPasswordMatch: { hi: "पासवर्ड मेल नहीं खा रहा", en: "Passwords do not match" },
  errInvalidEmail: { hi: "ईमेल सही नहीं है", en: "Invalid email address" },
  errUserNotFound: { hi: "यह ईमेल रजिस्टर नहीं है", en: "This email is not registered" },
  errWrongPassword: { hi: "पासवर्ड गलत है", en: "Incorrect password" },
  errEmailInUse: { hi: "यह ईमेल पहले से रजिस्टर है", en: "This email is already registered" },
  errWeakPassword: { hi: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए", en: "Password must be at least 6 characters" },
  errNetwork: { hi: "इंटरनेट कनेक्शन जाँचें", en: "Check your internet connection" },
  errGeneric: { hi: "कुछ गलत हुआ, फिर कोशिश करें", en: "Something went wrong, please try again" },

  // Home Screen
  laborers: { hi: "मजदूर", en: "Workers" },
  totalWork: { hi: "कुल काम", en: "Total Work" },
  paid: { hi: "दे दिया", en: "Paid" },
  balance: { hi: "बाकी", en: "Balance" },
  noLaborers: { hi: "कोई मजदूर नहीं", en: "No workers added" },
  addLaborerHint: { hi: "नीचे + बटन दबाकर मजदूर जोड़ें", en: "Tap the + button below to add a worker" },
  logoutTitle: { hi: "लॉगआउट", en: "Logout" },
  logoutMsg: { hi: "क्या आप लॉगआउट करना चाहते हैं?", en: "Are you sure you want to logout?" },
  no: { hi: "नहीं", en: "No" },
  yes: { hi: "हाँ", en: "Yes" },
  yesLogout: { hi: "हाँ, लॉगआउट", en: "Yes, Logout" },

  // Entries / Payments
  entries: { hi: "एंट्री", en: "Entries" },
  payments: { hi: "भुगतान", en: "Payments" },
  report: { hi: "रिपोर्ट", en: "Report" },
  install: { hi: "इंस्टॉल", en: "Install" },
  admins: { hi: "एडमिन", en: "Admins" },

  // EntryCard
  addedBy: { hi: "जोड़ा:", en: "Added by:" },
  quantity: { hi: "मात्रा", en: "Qty" },
  rate: { hi: "दर", en: "Rate" },
  total: { hi: "कुल", en: "Total" },
  editBtn: { hi: "बदलें", en: "Edit" },
  deleteBtn: { hi: "हटाएं", en: "Delete" },
  deleteEntryTitle: { hi: "एंट्री हटाएं", en: "Delete Entry" },
  deleteEntryMsg: { hi: "क्या आप इस एंट्री को हटाना चाहते हैं?", en: "Delete this entry?" },
  deletePaymentTitle: { hi: "भुगतान हटाएं", en: "Delete Payment" },
  deletePaymentMsg: { hi: "क्या आप इस भुगतान को हटाना चाहते हैं?", en: "Delete this payment?" },
  markPaidTitle: { hi: "भुगतान पक्का करें", en: "Confirm Payment" },
  markPaidBtn: { hi: "दे दिया", en: "Mark Paid" },
  yesGiven: { hi: "हाँ, दे दिया", en: "Yes, Paid" },
  pending: { hi: "बाकी है", en: "Pending" },
  paidStatus: { hi: "दे दिया", en: "Paid" },

  // Work types
  pairs: { hi: "जोड़ी", en: "Pairs" },
  kg: { hi: "किलो", en: "KG" },
  piece: { hi: "नग", en: "Piece" },

  // Payment modes
  upi: { hi: "UPI", en: "UPI" },
  cash: { hi: "नकद", en: "Cash" },
  bank: { hi: "बैंक", en: "Bank" },
  other: { hi: "अन्य", en: "Other" },

  // Admin Screen
  adminTitle: { hi: "एडमिन मैनेजमेंट", en: "Admin Management" },
  adminSubtitle: { hi: "सभी रजिस्टर्ड एडमिन", en: "All Registered Admins" },
  adminYou: { hi: "आप", en: "You" },
  adminLastSeen: { hi: "आखिरी बार:", en: "Last seen:" },
  adminJoined: { hi: "जुड़े:", en: "Joined:" },
  adminEntries: { hi: "एंट्री", en: "entries" },
  adminPayments: { hi: "भुगतान", en: "payments" },
  adminLaborers: { hi: "मजदूर", en: "workers" },
  adminNoOther: { hi: "अभी कोई दूसरा एडमिन नहीं है", en: "No other admins yet" },
  adminInviteHint: { hi: "किसी को भी Register करके इस app का admin बना सकते हैं", en: "Anyone can register to become an admin of this app" },
  syncStatus: { hi: "Real-time Sync चालू है", en: "Real-time Sync Active" },
  syncHint: { hi: "किसी भी एडमिन का change तुरंत सबको दिखता है", en: "Any admin's changes are instantly visible to everyone" },
} as const;

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key][lang];
}
