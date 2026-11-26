// Travel Guardian - App Guide Book Modal
// Multilingual interactive guide for new users
// Languages: English, Hindi (हिन्दी), Gujarati (ગુજરાતી)
// Features: Emoji stickers, visual cards, step-by-step walkthroughs

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Guide Content in 3 Languages ──────────────────────────────────────────────
const GUIDE_CONTENT = {
  en: {
    langLabel: '🇬🇧 English',
    welcome: 'Welcome to Travel Guardian!',
    welcomeSub: 'Your personal safety companion for every journey ✈️',
    chapters: [
      {
        id: 'sos',
        emoji: '🆘',
        title: 'Emergency SOS',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        steps: [
          { icon: '1️⃣', text: 'Press the big red SOS button on the home screen' },
          { icon: '2️⃣', text: 'Siren will sound automatically at full volume 🔊' },
          { icon: '3️⃣', text: 'Your GPS location is sent to emergency contacts 📍' },
          { icon: '4️⃣', text: 'Press again to STOP the alarm when safe ✅' },
        ],
        tip: '💡 Tip: Shake your phone 3 times to trigger silent SOS!',
      },
      {
        id: 'safewalk',
        emoji: '🚶‍♂️',
        title: 'SafeWalk Timer',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        steps: [
          { icon: '⏱️', text: 'Set a timer (e.g. 15 min) before walking alone at night' },
          { icon: '🔔', text: 'If you don\'t press "I\'m Safe" before timer ends…' },
          { icon: '📲', text: 'App automatically alerts your emergency contacts!' },
          { icon: '✨', text: 'Also has: Fake Call, Strobe Flashlight & Scam Radar' },
        ],
        tip: '💡 Tip: Found in Safety Shield section → SafeWalk',
      },
      {
        id: 'map',
        emoji: '🗺️',
        title: 'Live Safety Map',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        steps: [
          { icon: '📍', text: 'Shows your real-time GPS location on the map' },
          { icon: '🏥', text: 'See nearby Hospitals, Police Stations & Pharmacies' },
          { icon: '🧭', text: 'Tap any place → Get Directions or Call them' },
          { icon: '📡', text: 'Toggle Live Tracking for continuous GPS updates' },
        ],
        tip: '💡 Tip: Switch between Road, Satellite & Night map views!',
      },
      {
        id: 'translator',
        emoji: '🌐',
        title: 'AI Translator',
        color: '#EC4899',
        bgColor: '#FCE7F3',
        steps: [
          { icon: '⌨️', text: 'Type any text to translate into 11+ Indian languages' },
          { icon: '🎤', text: 'Use voice mode to speak and get instant translation' },
          { icon: '📷', text: 'Point camera at sign boards to read & translate them' },
          { icon: '📚', text: 'Use "Survival Phrases" for common travel situations' },
        ],
        tip: '💡 Tip: Tap the speaker icon to hear pronunciation!',
      },
      {
        id: 'vault',
        emoji: '🔐',
        title: 'Document Vault',
        color: '#9333EA',
        bgColor: '#F3E8FF',
        steps: [
          { icon: '📄', text: 'Store Passport, Aadhaar, Visa & Insurance documents' },
          { icon: '📸', text: 'Scan documents using camera — saved offline instantly' },
          { icon: '🔒', text: 'Protected with Biometric (fingerprint/face) lock' },
          { icon: '✈️', text: 'Access anytime — even without internet connection!' },
        ],
        tip: '💡 Tip: Mark important documents as ⭐ Favourite for quick access!',
      },
      {
        id: 'contacts',
        emoji: '👥',
        title: 'Emergency Contacts',
        color: '#16A34A',
        bgColor: '#DCFCE7',
        steps: [
          { icon: '➕', text: 'Add family or friends as emergency contacts' },
          { icon: '⭐', text: 'Mark one as PRIMARY — they get SOS alerts first' },
          { icon: '📞', text: 'Tap any contact to call them directly from app' },
          { icon: '📱', text: 'Import contacts from your phone phonebook easily' },
        ],
        tip: '💡 Tip: Always add at least 2 emergency contacts!',
      },
      {
        id: 'trips',
        emoji: '✈️',
        title: 'Trip Planner',
        color: '#0284C7',
        bgColor: '#E0F2FE',
        steps: [
          { icon: '🗓️', text: 'Create a trip with destination, dates & vehicle type' },
          { icon: '🚗', text: 'Choose from 10 modes: Car, Train, Flight, Bike & more' },
          { icon: '📋', text: 'Smart Packing List auto-fills based on your trip type' },
          { icon: '💰', text: 'Track expenses and split costs with travel partners' },
        ],
        tip: '💡 Tip: Check Weather Advisory before departure!',
      },
      {
        id: 'camera',
        emoji: '📸',
        title: 'Evidence Camera',
        color: '#0284C7',
        bgColor: '#E0F2FE',
        steps: [
          { icon: '🎥', text: 'Capture photos & videos as safety evidence' },
          { icon: '🔐', text: 'All media saved in secure encrypted vault' },
          { icon: '📤', text: 'Export to gallery or share with authorities' },
          { icon: '🕒', text: 'Each file has timestamp & GPS location attached' },
        ],
        tip: '💡 Tip: Use for recording incidents, accidents or suspicious activity!',
      },
    ],
  },
  hi: {
    langLabel: '🇮🇳 हिन्दी',
    welcome: 'Travel Guardian में आपका स्वागत है!',
    welcomeSub: 'आपकी हर यात्रा का सुरक्षा साथी ✈️',
    chapters: [
      {
        id: 'sos',
        emoji: '🆘',
        title: 'इमर्जेंसी SOS',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        steps: [
          { icon: '1️⃣', text: 'होम स्क्रीन पर लाल SOS बटन दबाएं' },
          { icon: '2️⃣', text: 'अलार्म अपने आप शुरू हो जाएगा 🔊' },
          { icon: '3️⃣', text: 'आपकी GPS लोकेशन इमर्जेंसी कॉन्टैक्ट्स को भेजी जाएगी 📍' },
          { icon: '4️⃣', text: 'सुरक्षित होने पर फिर से दबाएं ✅' },
        ],
        tip: '💡 टिप: फोन को 3 बार हिलाएं — साइलेंट SOS एक्टिव हो जाएगा!',
      },
      {
        id: 'safewalk',
        emoji: '🚶‍♂️',
        title: 'सेफवॉक टाइमर',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        steps: [
          { icon: '⏱️', text: 'रात को अकेले चलने से पहले टाइमर सेट करें' },
          { icon: '🔔', text: 'अगर समय खत्म होने से पहले "मैं सुरक्षित हूं" नहीं दबाया…' },
          { icon: '📲', text: 'ऐप अपने आप आपके इमर्जेंसी कॉन्टैक्ट्स को अलर्ट करेगा!' },
          { icon: '✨', text: 'फेक कॉल, स्ट्रोब लाइट और स्कैम रडार भी है' },
        ],
        tip: '💡 टिप: Safety Shield → SafeWalk में मिलेगा',
      },
      {
        id: 'map',
        emoji: '🗺️',
        title: 'लाइव सेफ्टी मैप',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        steps: [
          { icon: '📍', text: 'रियल-टाइम GPS लोकेशन मैप पर दिखाता है' },
          { icon: '🏥', text: 'नजदीकी अस्पताल, पुलिस स्टेशन और फार्मेसी देखें' },
          { icon: '🧭', text: 'किसी भी जगह पर टैप करें → दिशा या कॉल करें' },
          { icon: '📡', text: 'लाइव ट्रैकिंग चालू करें — हर मूवमेंट ट्रैक होगी' },
        ],
        tip: '💡 टिप: रोड, सैटेलाइट और नाइट मोड के बीच स्विच करें!',
      },
      {
        id: 'translator',
        emoji: '🌐',
        title: 'AI ट्रांसलेटर',
        color: '#EC4899',
        bgColor: '#FCE7F3',
        steps: [
          { icon: '⌨️', text: '11+ भारतीय भाषाओं में किसी भी टेक्स्ट का अनुवाद करें' },
          { icon: '🎤', text: 'बोलें और तुरंत अनुवाद पाएं' },
          { icon: '📷', text: 'साइनबोर्ड पर कैमरा लगाएं और पढ़ें' },
          { icon: '📚', text: 'यात्रा के लिए "सर्वाइवल फ्रेज़" उपयोग करें' },
        ],
        tip: '💡 टिप: स्पीकर आइकन दबाएं और उच्चारण सुनें!',
      },
      {
        id: 'vault',
        emoji: '🔐',
        title: 'डॉक्युमेंट वॉल्ट',
        color: '#9333EA',
        bgColor: '#F3E8FF',
        steps: [
          { icon: '📄', text: 'पासपोर्ट, आधार, वीज़ा और इंश्योरेंस डॉक्युमेंट्स सेव करें' },
          { icon: '📸', text: 'कैमरे से स्कैन करें — ऑफलाइन सेव होता है' },
          { icon: '🔒', text: 'बायोमेट्रिक (फिंगरप्रिंट/चेहरा) से सुरक्षित' },
          { icon: '✈️', text: 'इंटरनेट के बिना भी कभी भी एक्सेस करें!' },
        ],
        tip: '💡 टिप: जरूरी दस्तावेज़ों को ⭐ फेवरेट करें!',
      },
      {
        id: 'contacts',
        emoji: '👥',
        title: 'इमर्जेंसी कॉन्टैक्ट्स',
        color: '#16A34A',
        bgColor: '#DCFCE7',
        steps: [
          { icon: '➕', text: 'परिवार या दोस्तों को इमर्जेंसी कॉन्टैक्ट बनाएं' },
          { icon: '⭐', text: 'एक को PRIMARY बनाएं — उन्हें सबसे पहले SOS जाएगा' },
          { icon: '📞', text: 'ऐप से सीधे कॉल करें' },
          { icon: '📱', text: 'फोन बुक से आसानी से इंपोर्ट करें' },
        ],
        tip: '💡 टिप: हमेशा कम से कम 2 इमर्जेंसी कॉन्टैक्ट जोड़ें!',
      },
      {
        id: 'trips',
        emoji: '✈️',
        title: 'ट्रिप प्लानर',
        color: '#0284C7',
        bgColor: '#E0F2FE',
        steps: [
          { icon: '🗓️', text: 'मंजिल, तारीख और वाहन के साथ ट्रिप बनाएं' },
          { icon: '🚗', text: '10 वाहन विकल्प: कार, ट्रेन, फ्लाइट, बाइक और अधिक' },
          { icon: '📋', text: 'स्मार्ट पैकिंग लिस्ट अपने आप तैयार होती है' },
          { icon: '💰', text: 'खर्च ट्रैक करें और दोस्तों के साथ बांटें' },
        ],
        tip: '💡 टिप: रवाना होने से पहले मौसम की सलाह देखें!',
      },
      {
        id: 'camera',
        emoji: '📸',
        title: 'एविडेंस कैमरा',
        color: '#0284C7',
        bgColor: '#E0F2FE',
        steps: [
          { icon: '🎥', text: 'सुरक्षा साक्ष्य के लिए फोटो और वीडियो लें' },
          { icon: '🔐', text: 'सभी मीडिया एन्क्रिप्टेड वॉल्ट में सेव होती है' },
          { icon: '📤', text: 'गैलरी में एक्सपोर्ट या अधिकारियों के साथ शेयर करें' },
          { icon: '🕒', text: 'हर फाइल में टाइमस्टैम्प और GPS जुड़ा होता है' },
        ],
        tip: '💡 टिप: घटनाओं, दुर्घटनाओं को रिकॉर्ड करने के लिए उपयोग करें!',
      },
    ],
  },
  gu: {
    langLabel: '🇮🇳 ગુજરાતી',
    welcome: 'Travel Guardian માં આપનું સ્વાગત છે!',
    welcomeSub: 'તમારી દરેક મુસાફરીનો સુરક્ષા સાથી ✈️',
    chapters: [
      {
        id: 'sos',
        emoji: '🆘',
        title: 'ઇમર્જન્સી SOS',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        steps: [
          { icon: '1️⃣', text: 'હોમ સ્ક્રીન પર લાલ SOS બટન દબાવો' },
          { icon: '2️⃣', text: 'સાયરન આપોઆપ ચાલુ થઈ જશે 🔊' },
          { icon: '3️⃣', text: 'તમારી GPS location ઇમર્જન્સી contacts ને મોકલાશે 📍' },
          { icon: '4️⃣', text: 'સુરક્ષિત થાઓ ત્યારે ફરી દબાવો ✅' },
        ],
        tip: '💡 ટિપ: ફોનને 3 વખત હલાવો — Silent SOS Active થઈ જશે!',
      },
      {
        id: 'safewalk',
        emoji: '🚶‍♂️',
        title: 'સેફવૉક ટાઇમર',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        steps: [
          { icon: '⏱️', text: 'રાત્રે એકલા ચાલતા પહેલા Timer Set કરો' },
          { icon: '🔔', text: 'Timer ખૂટે ત્યાં સુધી "હું સુરક્ષિત છું" ન દબાવો તો…' },
          { icon: '📲', text: 'App આપોઆપ Emergency Contacts ને Alert કરે છે!' },
          { icon: '✨', text: 'Fake Call, Strobe Light અને Scam Radar પણ છે' },
        ],
        tip: '💡 ટિપ: Safety Shield → SafeWalk માં મળશે',
      },
      {
        id: 'map',
        emoji: '🗺️',
        title: 'Live Safety Map',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        steps: [
          { icon: '📍', text: 'Real-time GPS location Map પર દેખાડે છે' },
          { icon: '🏥', text: 'નજીકની Hospitals, Police Station & Pharmacy જુઓ' },
          { icon: '🧭', text: 'કોઈ પણ જગ્યા Tap કરો → Direction અથવા Call' },
          { icon: '📡', text: 'Live Tracking ચાલુ કરો — દરેક movement track થાય' },
        ],
        tip: '💡 ટિપ: Road, Satellite ને Night Map view વચ્ચે Switch કરો!',
      },
      {
        id: 'translator',
        emoji: '🌐',
        title: 'AI Translator',
        color: '#EC4899',
        bgColor: '#FCE7F3',
        steps: [
          { icon: '⌨️', text: '11+ ભારતીય ભાષાઓ માં Text Translate કરો' },
          { icon: '🎤', text: 'Voice Mode: બોલો ને Instant Translation મેળવો' },
          { icon: '📷', text: 'Signboard પર Camera લગાવો ને ભાષા સમજો' },
          { icon: '📚', text: 'Travel Phrases: Common situations ના Ready phrases' },
        ],
        tip: '💡 ટિપ: Speaker icon tap કરો ને ઉચ્ચારણ સાંભળો!',
      },
      {
        id: 'vault',
        emoji: '🔐',
        title: 'Document Vault',
        color: '#9333EA',
        bgColor: '#F3E8FF',
        steps: [
          { icon: '📄', text: 'Passport, Aadhaar, Visa & Insurance Documents store કરો' },
          { icon: '📸', text: 'Camera થી Scan કરો — Offline Save થઈ જાય' },
          { icon: '🔒', text: 'Biometric (Fingerprint/Face) Lock થી સુરક્ષિત' },
          { icon: '✈️', text: 'Internet વિના ગમે ત્યારે Access કરો!' },
        ],
        tip: '💡 ટિપ: Important Documents ને ⭐ Favourite Mark કરો!',
      },
      {
        id: 'contacts',
        emoji: '👥',
        title: 'Emergency Contacts',
        color: '#16A34A',
        bgColor: '#DCFCE7',
        steps: [
          { icon: '➕', text: 'Family અથવા Friends ને Emergency Contact ઉમેરો' },
          { icon: '⭐', text: 'એક ને PRIMARY બનાવો — SOS alert ને સૌ પ્રથમ મળે' },
          { icon: '📞', text: 'App માંથી Direct Call કરો' },
          { icon: '📱', text: 'Phone Book માંથી સહેલાઈ થી Import કરો' },
        ],
        tip: '💡 ટિપ: ઓછામાં ઓછા 2 Emergency Contacts ઉમેરો!',
      },
      {
        id: 'trips',
        emoji: '✈️',
        title: 'Trip Planner',
        color: '#0284C7',
        bgColor: '#E0F2FE',
        steps: [
          { icon: '🗓️', text: 'Destination, Dates & Vehicle Type સાથે Trip બનાવો' },
          { icon: '🚗', text: '10 Vehicle Options: Car, Train, Flight, Bike & more' },
          { icon: '📋', text: 'Smart Packing List આપોઆ તૈયાર થઈ જાય' },
          { icon: '💰', text: 'Expenses Track કરો ને Friends સાથે Split કરો' },
        ],
        tip: '💡 ટિપ: નીકળ્યા પહેલા Weather Advisory ચેક કરો!',
      },
      {
        id: 'camera',
        emoji: '📸',
        title: 'Evidence Camera',
        color: '#0284C7',
        bgColor: '#E0F2FE',
        steps: [
          { icon: '🎥', text: 'Safety Evidence માટે Photos & Videos capture કરો' },
          { icon: '🔐', text: 'બધી media Encrypted Vault માં save' },
          { icon: '📤', text: 'Gallery Export અથવા Authorities સાથે Share' },
          { icon: '🕒', text: 'દરેક file ને Timestamp & GPS attached' },
        ],
        tip: '💡 ટિપ: Incidents, Accidents record કરવા માટે ઉપયોગ કરો!',
      },
    ],
  },
};

const QUICK_TIPS = [
  { emoji: '🔊', tip: 'SOS siren works even in silent mode!' },
  { emoji: '📴', tip: 'All features work offline — no internet needed!' },
  { emoji: '🌙', tip: 'Switch to Dark Mode for night travel' },
  { emoji: '🔋', tip: 'Low Battery Ping sends your location before phone dies' },
  { emoji: '📞', tip: '112 is India\'s universal emergency number' },
  { emoji: '🤝', tip: 'Share your Live Location link with trusted contacts' },
];

export default function AppGuideBookModal({ visible, onClose }) {
  const { theme, isDarkMode } = useTheme();
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const scrollRef = useRef(null);

  const content = GUIDE_CONTENT[selectedLang];

  const handleChapterPress = (chapter) => {
    setSelectedChapter(chapter);
  };

  const handleBackToIndex = () => {
    setSelectedChapter(null);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Pressable
            onPress={selectedChapter ? handleBackToIndex : onClose}
            style={[styles.backBtn, { backgroundColor: theme.background }]}
          >
            <Ionicons
              name={selectedChapter ? 'arrow-back' : 'close'}
              size={22}
              color={theme.text}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={[styles.headerBadge, { backgroundColor: colors.primary + '18' }]}>
              <Text style={styles.headerBadgeEmoji}>📖</Text>
              <Text style={[styles.headerBadgeText, { color: colors.primary }]}>GUIDE BOOK</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {selectedChapter ? selectedChapter.title : 'App Guide'}
            </Text>
          </View>

          {/* Language Switcher */}
          {!selectedChapter && (
            <View style={styles.langSwitcher}>
              {Object.entries(GUIDE_CONTENT).map(([code, data]) => (
                <Pressable
                  key={code}
                  style={[
                    styles.langBtn,
                    {
                      backgroundColor: selectedLang === code ? colors.primary : theme.surface,
                      borderColor: selectedLang === code ? colors.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedLang(code)}
                >
                  <Text style={[styles.langBtnText, { color: selectedLang === code ? '#FFF' : theme.text }]}>
                    {code === 'en' ? '🇬🇧' : code === 'hi' ? 'हि' : 'ગુ'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!selectedChapter ? (
            // ── Chapter Index View ────────────────────────────────────────
            <>
              {/* Welcome Banner */}
              <View style={[styles.welcomeBanner, { backgroundColor: colors.primary }]}>
                <Text style={styles.welcomeEmoji}>🛡️</Text>
                <View style={styles.welcomeTextBlock}>
                  <Text style={styles.welcomeTitle}>{content.welcome}</Text>
                  <Text style={styles.welcomeSub}>{content.welcomeSub}</Text>
                </View>
              </View>

              {/* Current Language Full Label */}
              <View style={[styles.langLabelRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.langLabelText, { color: theme.textSecondary }]}>
                  Reading in: {content.langLabel}
                </Text>
                <Text style={[styles.langLabelSub, { color: theme.textSecondary }]}>
                  Tap a chapter below to learn 👇
                </Text>
              </View>

              {/* Chapter Cards Grid */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>📚 Chapters</Text>
              <View style={styles.chaptersGrid}>
                {content.chapters.map((chapter) => (
                  <Pressable
                    key={chapter.id}
                    style={({ pressed }) => [
                      styles.chapterCard,
                      { backgroundColor: chapter.bgColor, borderColor: chapter.color + '40' },
                      pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={() => handleChapterPress(chapter)}
                  >
                    <Text style={styles.chapterEmoji}>{chapter.emoji}</Text>
                    <Text style={[styles.chapterTitle, { color: chapter.color }]}>{chapter.title}</Text>
                    <Text style={[styles.chapterSteps, { color: chapter.color + 'BB' }]}>
                      {chapter.steps.length} steps →
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Quick Tips Section */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>💡 Quick Tips</Text>
              <View style={[styles.tipsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {QUICK_TIPS.map((tip, i) => (
                  <View
                    key={i}
                    style={[styles.tipRow, i < QUICK_TIPS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
                  >
                    <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                    <Text style={[styles.tipText, { color: theme.text }]}>{tip.tip}</Text>
                  </View>
                ))}
              </View>

              {/* Emergency Numbers */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>📞 India Emergency Numbers</Text>
              <View style={[styles.emergencyGrid, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {[
                  { num: '112', label: 'Universal Emergency', emoji: '🆘', color: '#EF4444' },
                  { num: '100', label: 'Police', emoji: '👮', color: '#2563EB' },
                  { num: '101', label: 'Fire Brigade', emoji: '🔥', color: '#EA580C' },
                  { num: '102', label: 'Ambulance', emoji: '🚑', color: '#16A34A' },
                  { num: '1091', label: 'Women Helpline', emoji: '👩', color: '#EC4899' },
                  { num: '1033', label: 'Highway Patrol', emoji: '🛣️', color: '#D97706' },
                ].map((em) => (
                  <View key={em.num} style={[styles.emergencyItem, { borderColor: em.color + '30', backgroundColor: em.color + '10' }]}>
                    <Text style={styles.emergencyEmoji}>{em.emoji}</Text>
                    <Text style={[styles.emergencyNum, { color: em.color }]}>{em.num}</Text>
                    <Text style={[styles.emergencyLabel, { color: theme.textSecondary }]}>{em.label}</Text>
                  </View>
                ))}
              </View>

              {/* Footer note */}
              <View style={[styles.footerNote, { backgroundColor: theme.card, borderColor: colors.primary + '30' }]}>
                <Text style={styles.footerNoteEmoji}>🛡️</Text>
                <Text style={[styles.footerNoteText, { color: theme.textSecondary }]}>
                  Travel Guardian is always running in the background to keep you safe. Stay aware, travel smart!
                </Text>
              </View>
            </>
          ) : (
            // ── Chapter Detail View ───────────────────────────────────────
            <>
              {/* Chapter Hero */}
              <View style={[styles.chapterHero, { backgroundColor: selectedChapter.bgColor }]}>
                <Text style={styles.chapterHeroEmoji}>{selectedChapter.emoji}</Text>
                <Text style={[styles.chapterHeroTitle, { color: selectedChapter.color }]}>
                  {selectedChapter.title}
                </Text>
                <View style={[styles.chapterHeroBadge, { backgroundColor: selectedChapter.color }]}>
                  <Text style={styles.chapterHeroBadgeText}>{selectedChapter.steps.length} Steps</Text>
                </View>
              </View>

              {/* Steps */}
              <Text style={[styles.sectionHeading, { color: theme.text }]}>📋 How To Use</Text>
              <View style={[styles.stepsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {selectedChapter.steps.map((step, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.stepRow,
                      idx < selectedChapter.steps.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.border,
                      },
                    ]}
                  >
                    <View style={[styles.stepNumberBox, { backgroundColor: selectedChapter.bgColor }]}>
                      <Text style={styles.stepNumberEmoji}>{step.icon}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.text }]}>{step.text}</Text>
                  </View>
                ))}
              </View>

              {/* Pro Tip */}
              <View style={[styles.proTipCard, { backgroundColor: selectedChapter.bgColor, borderColor: selectedChapter.color + '50' }]}>
                <Text style={[styles.proTipText, { color: selectedChapter.color }]}>
                  {selectedChapter.tip}
                </Text>
              </View>

              {/* Back button */}
              <Pressable
                style={[styles.backToIndexBtn, { backgroundColor: colors.primary }]}
                onPress={handleBackToIndex}
              >
                <Ionicons name="arrow-back" size={18} color="#FFF" />
                <Text style={styles.backToIndexBtnText}>Back to All Chapters</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  headerBadgeEmoji: { fontSize: 12 },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  langSwitcher: {
    flexDirection: 'row',
    gap: 4,
  },
  langBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Welcome Banner
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  welcomeEmoji: { fontSize: 42 },
  welcomeTextBlock: { flex: 1 },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  langLabelRow: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  langLabelText: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  langLabelSub: { fontSize: 12 },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  // Chapter Grid
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  chapterCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  chapterEmoji: { fontSize: 32 },
  chapterTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  chapterSteps: { fontSize: 11, fontWeight: '600' },
  // Tips
  tipsCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  tipEmoji: { fontSize: 20 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  // Emergency Numbers
  emergencyGrid: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emergencyItem: {
    width: (SCREEN_WIDTH - 64) / 3,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    gap: 3,
  },
  emergencyEmoji: { fontSize: 20 },
  emergencyNum: { fontSize: 16, fontWeight: '800' },
  emergencyLabel: { fontSize: 9, textAlign: 'center', fontWeight: '500' },
  // Footer Note
  footerNote: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerNoteEmoji: { fontSize: 28 },
  footerNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  // Chapter Detail
  chapterHero: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  chapterHeroEmoji: { fontSize: 60 },
  chapterHeroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  chapterHeroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  chapterHeroBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  stepsCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  stepNumberBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberEmoji: { fontSize: 22 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  proTipCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  proTipText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  backToIndexBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },
  backToIndexBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
