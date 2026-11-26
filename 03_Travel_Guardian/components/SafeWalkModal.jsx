// Travel Guardian - Guardian SafeWalk & Stealth Shield Suite
// Features:
// 1. SafeWalk Journey Timer (Dead-Man's Switch with countdown & SOS trigger)
// 2. Stealth Fake Incoming Call Simulator (Escape tool for uncomfortable situations)
// 3. Tactical Strobe Beacon (Visual night SOS distress signaling)
// 4. Global Emergency Directory & Scam Radar with multi-language emergency cards

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Vibration,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function SafeWalkModal({ visible, onClose, currentLocation, currentAddress, onTriggerSOS }) {
  const { theme, isDarkMode } = useTheme();

  // Active navigation tab inside modal
  // 'safewalk' | 'fakecall' | 'strobe' | 'intel'
  const [activeTab, setActiveTab] = useState('safewalk');

  // ───────────────────────────────────────────────────────────────────────────
  // 1. SafeWalk Journey Timer States
  // ───────────────────────────────────────────────────────────────────────────
  const [safeWalkActive, setSafeWalkActive] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [safeWalkAlarmTriggered, setSafeWalkAlarmTriggered] = useState(false);
  const timerRef = useRef(null);

  // Siren audio player for dead-man alarm
  const sirenPlayer = useAudioPlayer(require('../assets/siren.wav'));

  // Countdown effect
  useEffect(() => {
    if (safeWalkActive && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSafeWalkExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [safeWalkActive, remainingSeconds]);

  const handleStartSafeWalk = (mins) => {
    const totalSecs = mins * 60;
    setSelectedMinutes(mins);
    setRemainingSeconds(totalSecs);
    setSafeWalkActive(true);
    setSafeWalkAlarmTriggered(false);
    Vibration.vibrate(200);
  };

  const handleStopSafeWalk = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSafeWalkActive(false);
    setSafeWalkAlarmTriggered(false);
    try {
      if (sirenPlayer) sirenPlayer.pause();
    } catch {}
    Alert.alert('🛡️ SafeWalk Complete', 'Glad you arrived safely! Your journey guard is now stopped.');
  };

  const handleSafeWalkExpired = () => {
    setSafeWalkAlarmTriggered(true);
    Vibration.vibrate([0, 500, 200, 500], true);
    try {
      if (sirenPlayer) {
        sirenPlayer.loop = true;
        sirenPlayer.play();
      }
    } catch {}

    Alert.alert(
      '🚨 SafeWalk Timer Expired!',
      'You did not check in before your timer ended. Emergency SOS alert has been triggered!',
      [
        {
          text: "I'm Okay (Stop Alarm)",
          onPress: () => {
            Vibration.cancel();
            try {
              if (sirenPlayer) sirenPlayer.pause();
            } catch {}
            setSafeWalkActive(false);
            setSafeWalkAlarmTriggered(false);
          },
        },
        {
          text: 'Dispatch Full SOS',
          style: 'destructive',
          onPress: () => {
            Vibration.cancel();
            try {
              if (sirenPlayer) sirenPlayer.pause();
            } catch {}
            setSafeWalkActive(false);
            onClose();
            if (onTriggerSOS) onTriggerSOS();
          },
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Stealth Fake Call Simulator States
  // ───────────────────────────────────────────────────────────────────────────
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'active'
  const [callerName, setCallerName] = useState('Dad');
  const [callerNumber, setCallerNumber] = useState('+91 98765 43210');
  const [callDuration, setCallDuration] = useState(0);
  const [callCountdown, setCallCountdown] = useState(0);
  const callTimerRef = useRef(null);

  const callerPresets = [
    { name: 'Dad', number: '+91 98765 43210', icon: 'person' },
    { name: 'Police Inspector', number: '112 / Emergency', icon: 'shield' },
    { name: 'Cab Driver (Waiting)', number: '+91 91234 56789', icon: 'car' },
    { name: 'Hotel Concierge', number: '+91 22 4567 8900', icon: 'business' },
  ];

  const triggerFakeCall = (delaySeconds = 0) => {
    if (delaySeconds > 0) {
      setCallCountdown(delaySeconds);
      Alert.alert('⏳ Fake Call Scheduled', `Fake call from ${callerName} will ring in ${delaySeconds} seconds. Lock or hold your phone normally.`);
      const interval = setInterval(() => {
        setCallCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startIncomingCallScreen();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      startIncomingCallScreen();
    }
  };

  const startIncomingCallScreen = () => {
    setCallState('incoming');
    setCallDuration(0);
    setFakeCallVisible(true);
    Vibration.vibrate([0, 1000, 1000], true);
  };

  const answerFakeCall = () => {
    Vibration.cancel();
    setCallState('active');
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endFakeCall = () => {
    Vibration.cancel();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setFakeCallVisible(false);
    setCallState('incoming');
    setCallDuration(0);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Tactical Strobe Beacon States
  // ───────────────────────────────────────────────────────────────────────────
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeFlashColor, setStrobeFlashColor] = useState(false);
  const strobeRef = useRef(null);

  useEffect(() => {
    if (strobeActive) {
      strobeRef.current = setInterval(() => {
        setStrobeFlashColor((prev) => !prev);
      }, 150); // fast flashing
    } else {
      if (strobeRef.current) clearInterval(strobeRef.current);
      setStrobeFlashColor(false);
    }
    return () => {
      if (strobeRef.current) clearInterval(strobeRef.current);
    };
  }, [strobeActive]);

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Global Emergency Directory & Scam Radar
  // ───────────────────────────────────────────────────────────────────────────
  const emergencyNumbers = [
    { country: '🇮🇳 India', police: '112 / 100', medical: '108', fire: '101', dial: '112' },
    { country: '🇺🇸 USA / Canada', police: '911', medical: '911', fire: '911', dial: '911' },
    { country: '🇬🇧 United Kingdom', police: '999', medical: '111 / 999', fire: '999', dial: '999' },
    { country: '🇪🇺 European Union', police: '112', medical: '112', fire: '112', dial: '112' },
    { country: '🇯🇵 Japan', police: '110', medical: '119', fire: '119', dial: '110' },
    { country: '🇦🇺 Australia', police: '000', medical: '000', fire: '000', dial: '000' },
  ];

  const scamAlerts = [
    {
      title: '🚕 Broken Taxi Meter Scam',
      desc: 'Driver claims the meter is broken and demands an inflated flat fare. Always insist on metered rides or use verified rideshare apps.',
      badge: 'Transport',
    },
    {
      title: '👮 Fake Police / Document Check',
      desc: 'Strangers posing as plainclothes officers asking to inspect wallets for "counterfeit currency". Never hand over cash; offer to walk together to the nearest police station.',
      badge: 'Impersonation',
    },
    {
      title: '🍵 Friendly Stranger / Tea Ceremony Scam',
      desc: 'Overly friendly strangers invite you to a special local tea shop or bar, then leave you with an exorbitant bill backed by intimidating staff.',
      badge: 'Hospitality',
    },
    {
      title: '📸 "Can You Take Our Photo?" Drop Scam',
      desc: 'Someone asks you to take their photo with a camera that is intentionally broken, and demands money when dropped. Polite refusal is best.',
      badge: 'Distraction',
    },
  ];

  const emergencyPhrases = [
    {
      en: 'Please help me!',
      gu: 'કૃપા કરીને મને મદદ કરો!',
      hi: 'कृपया मेरी मदद करें!',
      fr: 'Aidez-moi s’il vous plaît!',
      es: '¡Por favor ayúdame!',
      ja: '助けてください！ (Tasukete kudasai!)',
    },
    {
      en: 'Call the police immediately!',
      gu: 'તરત જ પોલીસને ફોન કરો!',
      hi: 'तुरंत पुलिस को फोन करें!',
      fr: 'Appelez la police immédiatement!',
      es: '¡Llame a la policía de inmediato!',
      ja: '警察を呼んでください！ (Keisatsu o yonde kudasai!)',
    },
    {
      en: 'Where is the nearest hospital?',
      gu: 'નજીકની હોસ્પિટલ ક્યાં છે?',
      hi: 'सबसे पास का अस्पताल कहाँ है?',
      fr: 'Où est l’hôpital le plus proche?',
      es: '¿Dónde está el hospital más cercano?',
      ja: '一番近い病院はどこですか？ (Ichiban chikai byōin wa doko desu ka?)',
    },
  ];

  const [selectedPhraseLang, setSelectedPhraseLang] = useState('gu'); // 'gu' | 'hi' | 'es' | 'fr' | 'ja'

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.headerIconCircle, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Guardian SafeWalk</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textLight }]}>
                Stealth Shield & Safety Intelligence
              </Text>
            </View>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Pressable
            style={[styles.tabItem, activeTab === 'safewalk' && styles.activeTabItem]}
            onPress={() => setActiveTab('safewalk')}
          >
            <Ionicons
              name="walk"
              size={18}
              color={activeTab === 'safewalk' ? colors.primary : theme.textLight}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'safewalk' ? colors.primary : theme.textLight },
              ]}
            >
              SafeWalk
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'fakecall' && styles.activeTabItem]}
            onPress={() => setActiveTab('fakecall')}
          >
            <Ionicons
              name="call"
              size={18}
              color={activeTab === 'fakecall' ? colors.primary : theme.textLight}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'fakecall' ? colors.primary : theme.textLight },
              ]}
            >
              Fake Call
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'strobe' && styles.activeTabItem]}
            onPress={() => setActiveTab('strobe')}
          >
            <Ionicons
              name="flashlight"
              size={18}
              color={activeTab === 'strobe' ? colors.primary : theme.textLight}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'strobe' ? colors.primary : theme.textLight },
              ]}
            >
              Strobe
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'intel' && styles.activeTabItem]}
            onPress={() => setActiveTab('intel')}
          >
            <Ionicons
              name="compass"
              size={18}
              color={activeTab === 'intel' ? colors.primary : theme.textLight}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'intel' ? colors.primary : theme.textLight },
              ]}
            >
              Scam Radar
            </Text>
          </Pressable>
        </View>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* ──────────────────────────────────────────────────────────────────
              TAB 1: SAFEWALK JOURNEY TIMER
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'safewalk' && (
            <View>
              {safeWalkActive ? (
                /* Active SafeWalk Display */
                <View style={[styles.activeCard, { backgroundColor: theme.card, borderColor: colors.primary }]}>
                  <View style={styles.radarPulse}>
                    <View style={[styles.radarOuter, { borderColor: colors.primary }]}>
                      <View style={[styles.radarInner, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.activeTimerTitle, { color: theme.text }]}>SafeWalk Active</Text>
                  <Text style={[styles.timerCountdown, { color: remainingSeconds < 60 ? colors.danger : colors.primary }]}>
                    {formatTime(remainingSeconds)}
                  </Text>
                  <Text style={[styles.timerSub, { color: theme.textLight }]}>
                    Countdown to arrival check-in
                  </Text>

                  {/* Live GPS Address Snippet */}
                  <View style={[styles.locationBox, { backgroundColor: theme.background }]}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                    <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={2}>
                      {currentAddress || 'GPS Location Locked'}
                    </Text>
                  </View>

                  <Pressable style={styles.safeArrivalBtn} onPress={handleStopSafeWalk}>
                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                    <Text style={styles.safeArrivalBtnText}>I Arrived Safely</Text>
                  </Pressable>

                  <Pressable
                    style={styles.sosEscalateBtn}
                    onPress={() => {
                      handleStopSafeWalk();
                      onClose();
                      if (onTriggerSOS) onTriggerSOS();
                    }}
                  >
                    <Ionicons name="warning" size={18} color={colors.danger} />
                    <Text style={styles.sosEscalateBtnText}>Trigger SOS Now</Text>
                  </Pressable>
                </View>
              ) : (
                /* Inactive / Start SafeWalk Selection */
                <View>
                  <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="walk" size={32} color={colors.primary} />
                    <Text style={[styles.introTitle, { color: theme.text }]}>What is SafeWalk?</Text>
                    <Text style={[styles.introDesc, { color: theme.textLight }]}>
                      Walking back to your hotel, waiting for a late cab, or navigating unfamiliar streets? Set your
                      expected arrival time. If you don't check in before the timer expires, Travel Guardian sounds an
                      emergency siren and initiates SOS dispatch.
                    </Text>
                  </View>

                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Expected Travel Time</Text>
                  <View style={styles.durationGrid}>
                    {[5, 10, 15, 20, 30, 45].map((mins) => (
                      <Pressable
                        key={mins}
                        style={[
                          styles.durationChip,
                          {
                            backgroundColor: selectedMinutes === mins ? colors.primary : theme.card,
                            borderColor: selectedMinutes === mins ? colors.primary : theme.border,
                          },
                        ]}
                        onPress={() => setSelectedMinutes(mins)}
                      >
                        <Text
                          style={[
                            styles.durationChipText,
                            { color: selectedMinutes === mins ? '#FFF' : theme.text },
                          ]}
                        >
                          {mins} Mins
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable
                    style={[styles.startSafeWalkBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleStartSafeWalk(selectedMinutes)}
                  >
                    <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                    <Text style={styles.startSafeWalkBtnText}>Start SafeWalk ({selectedMinutes} min)</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 2: STEALTH FAKE INCOMING CALL SIMULATOR
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'fakecall' && (
            <View>
              <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="call" size={32} color={colors.success} />
                <Text style={[styles.introTitle, { color: theme.text }]}>Escape Awkward & Unsafe Situations</Text>
                <Text style={[styles.introDesc, { color: theme.textLight }]}>
                  Cornered by pushy strangers, feeling unsafe in a taxi, or stuck in an uncomfortable conversation?
                  Trigger a hyper-realistic incoming call to give yourself a natural, urgent reason to walk away.
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Caller Identity</Text>
              {callerPresets.map((preset) => (
                <Pressable
                  key={preset.name}
                  style={[
                    styles.presetCard,
                    {
                      backgroundColor: callerName === preset.name ? colors.primary + '14' : theme.card,
                      borderColor: callerName === preset.name ? colors.primary : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setCallerName(preset.name);
                    setCallerNumber(preset.number);
                  }}
                >
                  <View style={[styles.presetIconCircle, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name={preset.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.presetName, { color: theme.text }]}>{preset.name}</Text>
                    <Text style={[styles.presetNumber, { color: theme.textLight }]}>{preset.number}</Text>
                  </View>
                  {callerName === preset.name && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </Pressable>
              ))}

              <View style={styles.fakeCallActionRow}>
                <Pressable
                  style={[styles.fakeCallBtn, { backgroundColor: colors.success }]}
                  onPress={() => triggerFakeCall(0)}
                >
                  <Ionicons name="call" size={20} color="#FFF" />
                  <Text style={styles.fakeCallBtnText}>Call Right Now</Text>
                </Pressable>

                <Pressable
                  style={[styles.fakeCallBtn, { backgroundColor: colors.warning }]}
                  onPress={() => triggerFakeCall(10)}
                >
                  <Ionicons name="timer" size={20} color="#FFF" />
                  <Text style={styles.fakeCallBtnText}>Call in 10 Seconds</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 3: TACTICAL STROBE BEACON
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'strobe' && (
            <View>
              <View
                style={[
                  styles.strobeBox,
                  {
                    backgroundColor: strobeActive
                      ? strobeFlashColor
                        ? '#FFFFFF'
                        : '#FF0033'
                      : theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="flashlight"
                  size={64}
                  color={strobeActive ? (strobeFlashColor ? '#000' : '#FFF') : colors.warning}
                />
                <Text
                  style={[
                    styles.strobeStatusText,
                    {
                      color: strobeActive ? (strobeFlashColor ? '#000' : '#FFF') : theme.text,
                    },
                  ]}
                >
                  {strobeActive ? '🚨 STROBE FLASHING' : 'Tactical Strobe Ready'}
                </Text>
                <Text
                  style={[
                    styles.strobeDescText,
                    {
                      color: strobeActive ? (strobeFlashColor ? '#333' : '#EEE') : theme.textLight,
                    },
                  ]}
                >
                  {strobeActive
                    ? 'Hold phone screen outward toward approaching rescuers or threats'
                    : 'Produces a high-contrast visual distress signal to disorient attackers or guide emergency teams at night.'}
                </Text>

                <Pressable
                  style={[
                    styles.strobeToggleBtn,
                    { backgroundColor: strobeActive ? colors.danger : colors.primary },
                  ]}
                  onPress={() => setStrobeActive(!strobeActive)}
                >
                  <Ionicons name={strobeActive ? 'stop' : 'flash'} size={22} color="#FFF" />
                  <Text style={styles.strobeToggleBtnText}>
                    {strobeActive ? 'Turn Off Strobe' : 'Activate Strobe Beacon'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 4: TOURIST SCAM RADAR & EMERGENCY PHRASES
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'intel' && (
            <View>
              {/* Emergency Numbers Quick Dial */}
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Global Emergency Directory</Text>
              {emergencyNumbers.map((item) => (
                <View
                  key={item.country}
                  style={[styles.emergencyRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.countryName, { color: theme.text }]}>{item.country}</Text>
                    <Text style={[styles.countryNumbers, { color: theme.textLight }]}>
                      Police: {item.police} • Medical: {item.medical}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.quickDialBtn, { backgroundColor: colors.danger }]}
                    onPress={() => Linking.openURL(`tel:${item.dial}`)}
                  >
                    <Ionicons name="call" size={16} color="#FFF" />
                    <Text style={styles.quickDialBtnText}>Dial {item.dial}</Text>
                  </Pressable>
                </View>
              ))}

              {/* Multi-language Emergency Translation Cards */}
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
                Emergency Phrase Cards
              </Text>
              <View style={styles.langSelectorRow}>
                {[
                  { key: 'gu', label: 'ગુજરાતી' },
                  { key: 'hi', label: 'हिन्दी' },
                  { key: 'es', label: 'Español' },
                  { key: 'fr', label: 'Français' },
                  { key: 'ja', label: '日本語' },
                ].map((lang) => (
                  <Pressable
                    key={lang.key}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: selectedPhraseLang === lang.key ? colors.primary : theme.card,
                        borderColor: selectedPhraseLang === lang.key ? colors.primary : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedPhraseLang(lang.key)}
                  >
                    <Text
                      style={[
                        styles.langChipText,
                        { color: selectedPhraseLang === lang.key ? '#FFF' : theme.text },
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {emergencyPhrases.map((phrase, idx) => (
                <View
                  key={idx}
                  style={[styles.phraseCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Text style={[styles.phraseEn, { color: theme.textLight }]}>{phrase.en}</Text>
                  <Text style={[styles.phraseTranslated, { color: colors.primary }]}>
                    {phrase[selectedPhraseLang]}
                  </Text>
                </View>
              ))}

              {/* Scam Alerts */}
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
                Tourist Scam Radar
              </Text>
              {scamAlerts.map((scam) => (
                <View
                  key={scam.title}
                  style={[styles.scamCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={styles.scamBadge}>
                    <Text style={styles.scamBadgeText}>{scam.badge}</Text>
                  </View>
                  <Text style={[styles.scamTitle, { color: theme.text }]}>{scam.title}</Text>
                  <Text style={[styles.scamDesc, { color: theme.textLight }]}>{scam.desc}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ──────────────────────────────────────────────────────────────────
            FULLSCREEN FAKE INCOMING CALL OVERLAY
        ────────────────────────────────────────────────────────────────── */}
        <Modal visible={fakeCallVisible} animationType="fade" transparent={false} onRequestClose={endFakeCall}>
          <View style={styles.fakeCallScreen}>
            {callState === 'incoming' ? (
              /* Incoming Ringing Screen */
              <View style={styles.incomingCallContainer}>
                <View style={styles.callerInfoBox}>
                  <View style={styles.callerAvatarLarge}>
                    <Ionicons name="person" size={56} color="#FFF" />
                  </View>
                  <Text style={styles.fakeCallerTitle}>{callerName}</Text>
                  <Text style={styles.fakeCallerSub}>{callerNumber}</Text>
                  <Text style={styles.incomingCallLabel}>Incoming Call...</Text>
                </View>

                <View style={styles.callButtonsRow}>
                  <Pressable style={[styles.callBtnCircle, styles.declineBtn]} onPress={endFakeCall}>
                    <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
                    <Text style={styles.callBtnLabel}>Decline</Text>
                  </Pressable>

                  <Pressable style={[styles.callBtnCircle, styles.answerBtn]} onPress={answerFakeCall}>
                    <Ionicons name="call" size={32} color="#FFF" />
                    <Text style={styles.callBtnLabel}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* Active In-Call Screen */
              <View style={styles.activeCallContainer}>
                <View style={styles.callerInfoBox}>
                  <View style={[styles.callerAvatarLarge, { backgroundColor: '#334155' }]}>
                    <Ionicons name="person" size={56} color="#94A3B8" />
                  </View>
                  <Text style={styles.fakeCallerTitle}>{callerName}</Text>
                  <Text style={styles.activeCallTimer}>{formatTime(callDuration)}</Text>
                </View>

                {/* Conversation prompt simulation */}
                <View style={styles.scriptBox}>
                  <Text style={styles.scriptHint}>Say this into your phone:</Text>
                  <Text style={styles.scriptText}>
                    "Hey! Yes, I'm right here. I see you waiting outside — I'm heading over to the car right now!"
                  </Text>
                </View>

                <View style={styles.endCallBox}>
                  <Pressable style={[styles.callBtnCircle, styles.declineBtn]} onPress={endFakeCall}>
                    <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
                    <Text style={styles.callBtnLabel}>End Call</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  durationChip: {
    flex: 1,
    minWidth: '28%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  startSafeWalkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startSafeWalkBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activeCard: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
  },
  radarPulse: {
    marginVertical: 16,
  },
  radarOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTimerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  timerCountdown: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 8,
  },
  timerSub: {
    fontSize: 13,
    marginBottom: 16,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  safeArrivalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  safeArrivalBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sosEscalateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  sosEscalateBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  presetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetName: {
    fontSize: 15,
    fontWeight: '600',
  },
  presetNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  fakeCallActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  fakeCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  fakeCallBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  strobeBox: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strobeStatusText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  strobeDescText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  strobeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  strobeToggleBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  countryNumbers: {
    fontSize: 12,
    marginTop: 2,
  },
  quickDialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickDialBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  langSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  phraseCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  phraseEn: {
    fontSize: 12,
    marginBottom: 4,
  },
  phraseTranslated: {
    fontSize: 16,
    fontWeight: '700',
  },
  scamCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  scamBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  scamBadgeText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  scamTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  scamDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  fakeCallScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  incomingCallContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 80,
    alignItems: 'center',
  },
  activeCallContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 80,
    alignItems: 'center',
  },
  callerInfoBox: {
    alignItems: 'center',
  },
  callerAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fakeCallerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  fakeCallerSub: {
    fontSize: 16,
    color: '#94A3B8',
  },
  incomingCallLabel: {
    fontSize: 14,
    color: '#38BDF8',
    marginTop: 14,
    fontWeight: '600',
  },
  activeCallTimer: {
    fontSize: 18,
    color: '#10B981',
    marginTop: 8,
    fontWeight: '600',
  },
  callButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  callBtnCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  answerBtn: {
    backgroundColor: '#10B981',
  },
  callBtnLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  scriptBox: {
    backgroundColor: '#1E293B',
    padding: 18,
    borderRadius: 14,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scriptHint: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  scriptText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  endCallBox: {
    alignItems: 'center',
  },
});
