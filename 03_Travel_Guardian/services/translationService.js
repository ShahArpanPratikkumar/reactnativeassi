// Travel Guardian - AI Multi-Language Travel Translation Service
// Supports all major Indian Languages + International languages
// Features: Text Translation, Voice Speech Pronunciation, and Offline Travel Phrasebook

import { Platform } from 'react-native';

// Safely load expo-speech
let Speech = null;
try {
  Speech = require('expo-speech');
} catch (e) {
  console.log('[TranslationService] expo-speech not available in this environment');
}

// ─── Supported Languages (All Major Indian Languages Included) ───────────────
export const SUPPORTED_LANGUAGES = [
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', speechCode: 'ml-IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼િଆ', speechCode: 'or-IN', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', speechCode: 'ur-IN', flag: '🇮🇳' },
  { code: 'en', name: 'English', native: 'English', speechCode: 'en-US', flag: '🌐' },
  { code: 'es', name: 'Spanish', native: 'Español', speechCode: 'es-ES', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', speechCode: 'fr-FR', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', speechCode: 'de-DE', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', native: 'العربية', speechCode: 'ar-SA', flag: '🇸🇦' },
  { code: 'ja', name: 'Japanese', native: '日本語', speechCode: 'ja-JP', flag: '🇯🇵' },
];

export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
};

// ─── Offline Instant Travel Phrasebook ───────────────────────────────────────
export const TRAVEL_PHRASES = [
  {
    id: 'p1',
    category: '🚨 Emergency',
    en: 'Please help me, this is an emergency!',
    translations: {
      gu: 'કૃપા કરીને મારી મદદ કરો, આ ઈમરજન્સી છે!',
      hi: 'कृपया मेरी मदद करें, यह एक आपात स्थिति है!',
      mr: 'कृपया मला मदत करा, ही आणीबाणीची परिस्थिती आहे!',
      bn: 'দয়া করে আমাকে সাহায্য করুন, এটি জরুরি অবস্থা!',
      ta: 'தயவுசெய்து எனக்கு உதவுங்கள், இது அவசரநிலை!',
      te: 'దయచేసి నాకు సహాయం చేయండి, ఇది అత్యవసర పరిస్థితి!',
      kn: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ, ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿ!',
      ml: 'ദയവായി എന്നെ സഹായിക്കൂ, ഇതൊരു അടിയന്തര ഘട്ടമാണ്!',
      pa: 'ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰੋ, ਇਹ ਇੱਕ ਐਮਰਜੈਂਸੀ ਹੈ!',
      ur: 'براہ کرم میری مدد کریں، یہ ہنگامی صورتحال ہے!',
    },
  },
  {
    id: 'p2',
    category: '🚨 Emergency',
    en: 'Call the police immediately!',
    translations: {
      gu: 'તરત જ પોલીસને ફોન કરો!',
      hi: 'तुरंत पुलिस को बुलाओ!',
      mr: 'ताबडतोब पोलिसांना बोलवा!',
      bn: 'অবিলম্বে পুলিশকে ডাকুন!',
      ta: 'உடனடியாக காவல்துறையை அழையுங்கள்!',
      te: 'వెంటనే పోలీసులకు కాల్ చేయండి!',
      kn: 'ತಕ್ಷಣ ಪೊಲೀಸರಿಗೆ ಕರೆ ಮಾಡಿ!',
      ml: 'உടൻ പോലീസിനെ വിളിക്കൂ!',
      pa: 'ਤੁਰੰਤ ਪੁਲਿਸ ਨੂੰ ਫ਼ੋਨ ਕਰੋ!',
      ur: 'فوری طور پر پولیس کو کال کریں!',
    },
  },
  {
    id: 'p3',
    category: '🏥 Medical',
    en: 'Where is the nearest hospital?',
    translations: {
      gu: 'સૌથી નજીકની હોસ્પિટલ ક્યાં છે?',
      hi: 'निकटतम अस्पताल कहाँ है?',
      mr: 'जवळचे रुग्णालय कुठे आहे?',
      bn: 'নিকটতম হাসপাতালটি কোথায়?',
      ta: 'அருகிலுள்ள மருத்துவமனை எங்கே?',
      te: 'దగ్గరలోని ఆసుపత్రి ఎక్కడ ఉంది?',
      kn: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?',
      ml: 'ഏറ്റവും അടുത്തുള്ള ആശുപത്രി എവിടെയാണ്?',
      pa: 'ਸਭ ਤੋਂ ਨਜ਼ਦੀਕੀ ਹਸਪਤਾਲ ਕਿੱਥੇ ਹੈ?',
      ur: 'قریبی اسپتال کہاں ہے؟',
    },
  },
  {
    id: 'p4',
    category: '🏥 Medical',
    en: 'I need a doctor urgently.',
    translations: {
      gu: 'મને તાત્કાલિક ડૉક્ટરની જરૂર છે.',
      hi: 'मुझे तुरंत डॉक्टर की आवश्यकता है।',
      mr: 'मला तातडीने डॉक्टरची गरज आहे.',
      bn: 'আমার জরুরিভাবে একজন ডাক্তারের প্রয়োজন।',
      ta: 'எனக்கு அவசரமாக மருத்துவர் தேவை.',
      te: 'నాకు అత్యవసరంగా డాక్టర్ కావాలి.',
      kn: 'ನನಗೆ ತುರ್ತಾಗಿ ವೈದ್ಯರ ಅಗತ್ಯವಿದೆ.',
      ml: 'എനിക്ക് അടിയന്തിരമായി ഒരു ഡോക്ടറെ ആവശ്യമുണ്ട്.',
      pa: 'ਮੈਨੂੰ ਤੁਰੰਤ ਡਾਕਟਰ ਦੀ ਲੋੜ ਹੈ।',
      ur: 'مجھے فوری طور پر ڈاکٹر کی ضرورت ہے۔',
    },
  },
  {
    id: 'p5',
    category: '🧭 Directions',
    en: 'Where is the train / bus station?',
    translations: {
      gu: 'રેલવે / બસ સ્ટેશન ક્યાં છે?',
      hi: 'रेलवे / बस स्टेशन कहाँ है?',
      mr: 'रेल्वे / बस स्थानक कुठे आहे?',
      bn: 'রেল / বাস স্টেশনটি কোথায়?',
      ta: 'ரயில் / பேருந்து நிலையம் எங்கே?',
      te: 'రైలు / బస్సు స్టేషన్ ఎక్కడ ఉంది?',
      kn: 'ರೈಲು / ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
      ml: 'ട്രെയിൻ / ബസ് സ്റ്റേഷൻ എവിടെയാണ്?',
      pa: 'ਰੇਲਵੇ / ਬੱਸ ਸਟੇਸ਼ਨ ਕਿੱਥੇ ਹੈ?',
      ur: 'ریلوے / بس اسٹیشن کہاں ہے؟',
    },
  },
  {
    id: 'p6',
    category: '🧭 Directions',
    en: 'Please take me to this address.',
    translations: {
      gu: 'કૃપા કરીને મને આ સરનામે લઈ જાઓ.',
      hi: 'कृपया मुझे इस पते पर ले चलें।',
      mr: 'कृपया मला या पत्त्यावर घेऊन चला.',
      bn: 'দয়া করে আমাকে এই ঠিকানায় নিয়ে যান।',
      ta: 'தயவுசெய்து என்னை இந்த முகவரிக்கு அழைத்துச் செல்லுங்கள்.',
      te: 'దయచేసి నన్ను ఈ చిరునామాకు తీసుకెళ్లండి.',
      kn: 'ದಯವಿಟ್ಟು ನನ್ನನ್ನು ಈ ವಿಳಾಸಕ್ಕೆ ಕರೆದೊಯ್ಯಿರಿ.',
      ml: 'ദയവായി എന്നെ ഈ വിലാസത്തിലേക്ക് കൊണ്ടുപോകൂ.',
      pa: 'ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੂੰ ਇਸ ਪਤੇ ਤੇ ਲੈ ਜਾਓ।',
      ur: 'براہ کرم مجھے اس پتے پر لے جائیں।',
    },
  },
  {
    id: 'p7',
    category: '🚕 Transport',
    en: 'Please turn on the meter.',
    translations: {
      gu: 'કૃપા કરીને મીટર ચાલુ કરો.',
      hi: 'कृपया मीटर चालू करें।',
      mr: 'कृपया मीटर चालू करा.',
      bn: 'দয়া করে মিটার চালু করুন।',
      ta: 'தயவுசெய்து மீட்டரை ஆன் செய்யவும்.',
      te: 'దయచేసి మీటర్ ఆన్ చేయండి.',
      kn: 'ದಯವಿಟ್ಟು ಮೀಟರ್ ಆನ್ ಮಾಡಿ.',
      ml: 'ദയവായി മീറ്റർ ഓൺ ചെയ്യുക.',
      pa: 'ਕਿਰਪਾ ਕਰਕੇ ਮੀਟਰ ਚਾਲੂ ਕਰੋ।',
      ur: 'براہ کرم میٹر آن کریں۔',
    },
  },
  {
    id: 'p8',
    category: '🍽️ Food & Water',
    en: 'Is this drinking water safe?',
    translations: {
      gu: 'શું આ પીવાનું પાણી શુદ્ધ છે?',
      hi: 'क्या यह पीने का पानी सुरक्षित है?',
      mr: 'हे पिण्याचे पाणी सुरक्षित आहे का?',
      bn: 'এই খাওয়ার জল কি নিরাপদ?',
      ta: 'இந்த குடிநீர் பாதுகாப்பானதா?',
      te: 'ఈ తాగునీరు సురక్షితమైనదా?',
      kn: 'ಈ ಕುಡಿಯುವ ನೀರು ಸುರಕ್ಷಿತವೇ?',
      ml: 'ഈ കുടിവെള്ളം സുരക്ഷിതമാണോ?',
      pa: 'ਕੀ ਇਹ ਪੀਣ ਵਾਲਾ ਪਾਣੀ ਸੁਰੱਖਿਅਤ ਹੈ?',
      ur: 'کیا یہ پینے کا پانی محفوظ ہے؟',
    },
  },
  {
    id: 'p9',
    category: '🍽️ Food & Water',
    en: 'Is this food purely vegetarian?',
    translations: {
      gu: 'શું આ ભોજન સંપૂર્ણ શુદ્ધ શાકાહારી છે?',
      hi: 'क्या यह खाना पूरी तरह से शाकाहारी है?',
      mr: 'हे अन्न पूर्णपणे शाकाहारी आहे का?',
      bn: 'এই খাবার কি সম্পূর্ণ নিরামিষ?',
      ta: 'இந்த உணவு முற்றிலும் சைவ உணவா?',
      te: 'ఈ ఆహారం పూర్తిగా శాఖాహారమేనా?',
      kn: 'ಈ ಆಹಾರವು ಸಂಪೂರ್ಣ ಸಸ್ಯಾಹಾರವೇ?',
      ml: 'ഈ ഭക്ഷണം പൂർണ്ണമായും സസ്യഭുക്കാണോ?',
      pa: 'ਕੀ ਇਹ ਭੋਜਨ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸ਼ਾਕਾਹਾਰੀ ਹੈ?',
      ur: 'کیا یہ کھانا مکمل طور پر سبزی خور ہے؟',
    },
  },
  {
    id: 'p10',
    category: '🏨 Hotel',
    en: 'What is the Wi-Fi password?',
    translations: {
      gu: 'વાઇ-ફાઇ પાસવર્ડ શું છે?',
      hi: 'वाई-फाई पासवर्ड क्या है?',
      mr: 'वाय-फाय पासवर्ड काय आहे?',
      bn: 'ওয়াই-ফাই পাসওয়ার্ড কি?',
      ta: 'வைஃபை கடவுச்சொல் என்ன?',
      te: 'వై-ఫై పాస్‌వర్డ్ ఏమిటి?',
      kn: 'ವೈ-ಫೈ ಪಾಸ್‌ವರ್ಡ್ ಏನು?',
      ml: 'വൈഫൈ പാസ്‌വേഡ് എന്താണ്?',
      pa: 'ਵਾਈ-ਫਾਈ ਪਾਸਵਰਡ ਕੀ ਹੈ?',
      ur: 'وائی فائی پاس ورڈ کیا ہے؟',
    },
  },
];

// ─── Image OCR Sample Signboard Presets ──────────────────────────────────────
export const SAMPLE_SIGNS = [
  {
    id: 'sign1',
    title: 'Highway Danger / Accident Zone',
    category: 'Road Sign',
    sourceText: 'CAUTION: ACCIDENT PRONE HIGHWAY ZONE. SPEED LIMIT 30 KM/H.',
  },
  {
    id: 'sign2',
    title: 'Hospital Emergency Entrance',
    category: 'Hospital',
    sourceText: 'EMERGENCY CASUALTY & TRAUMA WARD 24X7. AMBULANCE ENTRY ONLY.',
  },
  {
    id: 'sign3',
    title: 'Metro Transit Notice',
    category: 'Public Transit',
    sourceText: 'METRO PLATFORM 2: TRAIN TOWARDS AIRPORT TERMINAL. MIND THE GAP.',
  },
  {
    id: 'sign4',
    title: 'Tourist Scam Warning Notice',
    category: 'Tourist Alert',
    sourceText: 'WARNING: DO NOT ACCEPT TOURS FROM UNLICENSED AGENTS. USE OFFICIAL COUNTER.',
  },
  {
    id: 'sign5',
    title: 'Traditional Restaurant Food Menu',
    category: 'Food Menu',
    sourceText: 'PURE VEGETARIAN GUJARATI THALI WITH ROTLI, DAL, BHAT, SHAAK AND SWEET.',
  },
];

// ─── Live Text Translation Function ─────────────────────────────────────────
export const translateText = async (text, fromLang = 'en', toLang = 'gu') => {
  if (!text || !text.trim()) return '';

  const cleanText = text.trim();

  // 1. First check offline phrasebook for an exact or close match
  const matched = TRAVEL_PHRASES.find(
    (p) => p.en.toLowerCase() === cleanText.toLowerCase()
  );
  if (matched && matched.translations[toLang]) {
    return matched.translations[toLang];
  }

  // 2. Query free MyMemory Translation API
  try {
    const langpair = `${fromLang}|${toLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${langpair}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const result = data.responseData.translatedText;
        if (!result.includes('MYMEMORY WARNING:')) {
          return result;
        }
      }
    }
  } catch (err) {
    console.log('[TranslationService] MyMemory API note:', err.message);
  }

  // 3. Secondary Fallback: Lingva free translation proxy
  try {
    const lingvaUrl = `https://lingva.ml/api/v1/${fromLang}/${toLang}/${encodeURIComponent(cleanText)}`;
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 6000);

    const res2 = await fetch(lingvaUrl, { signal: controller2.signal });
    clearTimeout(timeout2);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.translation) {
        return data2.translation;
      }
    }
  } catch (err2) {
    console.log('[TranslationService] Lingva API note:', err2.message);
  }

  // 4. If all fail, return clean readable text
  return cleanText;
};

// ─── Text to Speech (Audio Pronunciation) ───────────────────────────────────
export const speakText = async (text, langCode = 'en') => {
  if (!text || !text.trim()) return;

  const langObj = getLanguageByCode(langCode);
  const speechCode = langObj ? langObj.speechCode : 'en-US';

  try {
    if (Speech && Speech.speak) {
      // Stop ongoing speech first
      if (Speech.isSpeakingAsync) {
        const isSpeaking = await Speech.isSpeakingAsync().catch(() => false);
        if (isSpeaking) {
          Speech.stop();
        }
      }

      Speech.speak(text, {
        language: speechCode,
        pitch: 1.0,
        rate: 0.85,
      });
      return true;
    }
  } catch (err) {
    console.log('[TranslationService] Speech error:', err.message);
  }

  // Web fallback if running on web browser
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {}
  }

  return false;
};

export const stopSpeech = () => {
  try {
    if (Speech && Speech.stop) {
      Speech.stop();
    }
  } catch {}
};

export default {
  SUPPORTED_LANGUAGES,
  TRAVEL_PHRASES,
  SAMPLE_SIGNS,
  getLanguageByCode,
  translateText,
  speakText,
  stopSpeech,
};
