import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type Entry = { id: string; label: string; category: 'DSA' | 'DEV'; minutes: number; done: boolean };
type Reminder = { id: string; title: string; time: string; enabled: boolean };

const initialEntries: Entry[] = [
  { id: '1', label: 'Two pointers · 3 problems', category: 'DSA', minutes: 48, done: true },
  { id: '2', label: 'Shipped portfolio polish', category: 'DEV', minutes: 62, done: true },
  { id: '3', label: 'Review binary search notes', category: 'DSA', minutes: 25, done: false },
];

const defaultReminders: Reminder[] = [
  { id: 'morning', title: 'Morning momentum', time: '08:30', enabled: true },
  { id: 'evening', title: 'Evening wrap-up', time: '20:30', enabled: true },
];

function IconButton({ icon, onPress, badge }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: boolean }) {
  const colors = useColors();
  return (
    <Pressable testID={`icon-${icon}`} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card }, pressed && styles.pressed]}>
      <Ionicons name={icon} size={20} color={colors.foreground} />
      {badge ? <View style={[styles.badgeDot, { backgroundColor: colors.accent }]} /> : null}
    </Pressable>
  );
}

function ProgressRing({ value }: { value: number }) {
  const colors = useColors();
  const size = 130;
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: colors.secondary }]}>
      <View style={[styles.ringArc, { borderColor: colors.primary, borderRightColor: 'transparent', borderBottomColor: 'transparent' }]} />
      <Text style={[styles.ringValue, { color: colors.foreground }]}>{value}%</Text>
      <Text style={[styles.ringCaption, { color: colors.mutedForeground }]}>daily goal</Text>
    </View>
  );
}

function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
  const [showLog, setShowLog] = useState(false);
  const [draft, setDraft] = useState('');
  const [category, setCategory] = useState<'DSA' | 'DEV'>('DSA');
  const router = useRouter();

  useEffect(() => {
    Promise.all([AsyncStorage.getItem('streakforge.entries'), AsyncStorage.getItem('streakforge.reminders')]).then(([savedEntries, savedReminders]) => {
      if (savedEntries) setEntries(JSON.parse(savedEntries) as Entry[]);
      if (savedReminders) setReminders(JSON.parse(savedReminders) as Reminder[]);
    }).catch(() => {});
  }, []);

  const completed = entries.filter((entry) => entry.done).length;
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.done ? entry.minutes : 0), 0);
  const progress = Math.min(100, Math.round((completed / Math.max(entries.length, 4)) * 100));
  const today = useMemo(() => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date()), []);

  const persistEntries = (next: Entry[]) => {
    setEntries(next);
    AsyncStorage.setItem('streakforge.entries', JSON.stringify(next)).catch(() => {});
  };

  const addEntry = () => {
    if (!draft.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    persistEntries([{ id: `${Date.now()}`, label: draft.trim(), category, minutes: 30, done: true }, ...entries]);
    setDraft('');
    setShowLog(false);
  };

  const toggleReminder = (id: string) => {
    const next = reminders.map((reminder) => reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder);
    setReminders(next);
    AsyncStorage.setItem('streakforge.reminders', JSON.stringify(next)).catch(() => {});
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>FRIDAY · 08:42</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Hey, Arjun <Text style={{ color: colors.accent }}>✦</Text></Text>
          </View>
          <IconButton icon="notifications-outline" badge onPress={() => Alert.alert('You’re on track', 'Your evening wrap-up reminder is set for 20:30.')} />
        </View>

        <LinearGradient colors={['#24324A', '#171B25']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <View style={styles.streakPill}><Ionicons name="flame" size={15} color={colors.accent} /><Text style={[styles.streakPillText, { color: colors.foreground }]}>12 day streak</Text></View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Small steps.{'\n'}Big main-character energy.</Text>
            <Text style={[styles.heroSub, { color: '#AAB4C7' }]}>You’re 2 check-ins away from a new record.</Text>
          </View>
          <View style={styles.flameOrb}><Ionicons name="flame" size={38} color={colors.primary} /></View>
        </LinearGradient>

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today’s pulse</Text><Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>{today}</Text></View>
        <View style={styles.pulseCard}>
          <ProgressRing value={progress} />
          <View style={styles.pulseStats}>
            <View><Text style={[styles.statNumber, { color: colors.foreground }]}>{totalMinutes}<Text style={styles.statUnit}>m</Text></Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>deep work</Text></View>
            <View><Text style={[styles.statNumber, { color: colors.foreground }]}>{completed}<Text style={styles.statUnit}>/4</Text></Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>check-ins</Text></View>
            <View><Text style={[styles.statNumber, { color: colors.foreground }]}>+24</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP earned</Text></View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable testID="start-focus" onPress={() => router.push('/focus')} style={({ pressed }) => [styles.primaryAction, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
            <Ionicons name="play" size={18} color={colors.primaryForeground} /><Text style={[styles.primaryActionText, { color: colors.primaryForeground }]}>Start focus</Text>
          </Pressable>
          <Pressable testID="log-progress" onPress={() => setShowLog(true)} style={({ pressed }) => [styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
            <Ionicons name="add" size={20} color={colors.primary} /><Text style={[styles.secondaryActionText, { color: colors.foreground }]}>Log progress</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your runway</Text><Pressable onPress={() => router.push('/progress')}><Text style={[styles.seeAll, { color: colors.primary }]}>See insights</Text></Pressable></View>
        <View style={styles.runwayCard}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => <View key={day} style={styles.dayColumn}><Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{day}</Text><View style={[styles.dayBar, { backgroundColor: colors.secondary }]}><View style={[styles.dayFill, { height: `${[72, 48, 88, 64, 42, 18, 8][index]}%`, backgroundColor: index === 4 ? colors.accent : colors.primary }]} /></View><View style={[styles.dayDot, { backgroundColor: index < 5 ? colors.primary : colors.secondary }]} /></View>)}
        </View>

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Next up</Text><Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>tap to complete</Text></View>
        {entries.slice(0, 3).map((entry) => <Pressable key={entry.id} onPress={() => persistEntries(entries.map((item) => item.id === entry.id ? { ...item, done: !item.done } : item))} style={({ pressed }) => [styles.taskRow, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
          <View style={[styles.check, { borderColor: entry.done ? colors.primary : colors.border, backgroundColor: entry.done ? colors.primary : 'transparent' }]}>{entry.done ? <Ionicons name="checkmark" size={14} color={colors.primaryForeground} /> : null}</View>
          <View style={styles.taskCopy}><Text style={[styles.taskTitle, { color: colors.foreground }, entry.done && styles.struck]}>{entry.label}</Text><Text style={[styles.taskMeta, { color: colors.mutedForeground }]}>{entry.category} · {entry.minutes} min</Text></View>
          <Ionicons name="chevron-forward" size={17} color={colors.mutedForeground} />
        </Pressable>)}

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reminders</Text><Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>local nudges</Text></View>
        <View style={styles.reminderCard}>
          {reminders.map((reminder, index) => <View key={reminder.id} style={[styles.reminderRow, index < reminders.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.reminderIcon, { backgroundColor: reminder.id === 'morning' ? '#2B374B' : '#3A2C35' }]}><Ionicons name={reminder.id === 'morning' ? 'sunny-outline' : 'moon-outline'} size={18} color={reminder.id === 'morning' ? colors.primary : colors.accent} /></View>
            <View style={styles.taskCopy}><Text style={[styles.taskTitle, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.taskMeta, { color: colors.mutedForeground }]}>{reminder.time} · {reminder.enabled ? 'active' : 'paused'}</Text></View>
            <Switch value={reminder.enabled} onValueChange={() => toggleReminder(reminder.id)} trackColor={{ false: colors.secondary, true: '#607C33' }} thumbColor={reminder.enabled ? colors.primary : colors.mutedForeground} />
          </View>)}
        </View>
      </ScrollView>

      <Modal visible={showLog} animationType="slide" transparent onRequestClose={() => setShowLog(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetHandle} /><View style={styles.sheetHeader}><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Log a win</Text><Pressable onPress={() => setShowLog(false)}><Ionicons name="close" size={24} color={colors.mutedForeground} /></Pressable></View>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>WHAT DID YOU WORK ON?</Text>
          <TextInput autoFocus value={draft} onChangeText={setDraft} placeholder="e.g. solved 2 sliding window problems" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} />
          <View style={styles.categoryRow}>{(['DSA', 'DEV'] as const).map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, { borderColor: category === item ? colors.primary : colors.border, backgroundColor: category === item ? '#293A25' : colors.background }]}><Text style={[styles.categoryText, { color: category === item ? colors.primary : colors.mutedForeground }]}>{item}</Text></Pressable>)}</View>
          <Pressable testID="save-progress" disabled={!draft.trim()} onPress={addEntry} style={({ pressed }) => [styles.saveButton, { backgroundColor: draft.trim() ? colors.primary : colors.secondary }, pressed && styles.pressed]}><Text style={[styles.saveText, { color: draft.trim() ? colors.primaryForeground : colors.mutedForeground }]}>Add to today</Text><Ionicons name="arrow-forward" size={18} color={draft.trim() ? colors.primaryForeground : colors.mutedForeground} /></Pressable>
        </View></View>
      </Modal>
    </View>
  );
}

function ProgressScreen() {
  const colors = useColors();
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={styles.simplePage}><Text style={[styles.pageEyebrow, { color: colors.primary }]}>PROGRESS</Text><Text style={[styles.pageTitle, { color: colors.foreground }]}>You’re building receipts.</Text><Text style={[styles.pageSub, { color: colors.mutedForeground }]}>A week of consistency beats a day of intensity.</Text><View style={styles.insightGrid}><View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}><MaterialCommunityIcons name="sword-cross" size={22} color={colors.accent} /><Text style={[styles.insightValue, { color: colors.foreground }]}>18</Text><Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>DSA problems</Text></View><View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="code" size={22} color={colors.primary} /><Text style={[styles.insightValue, { color: colors.foreground }]}>6.4h</Text><Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>dev time</Text></View></View><View style={[styles.bigInsight, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Consistency map</Text>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => <View key={day} style={styles.progressLine}><Text style={[styles.dayLabel, { color: colors.mutedForeground, width: 38 }]}>{day}</Text><View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}><View style={[styles.progressTrackFill, { width: `${[72,48,88,64,42,18,8][i]}%`, backgroundColor: i > 4 ? colors.accent : colors.primary }]} /></View><Text style={[styles.progressPct, { color: colors.foreground }]}>{[72,48,88,64,42,18,8][i]}%</Text></View>)}</View></ScrollView></View>;
}

function FocusScreen() {
  const colors = useColors();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const timer = setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 0), 1000); return () => clearInterval(timer); }, [running]);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={styles.focusPage}><Text style={[styles.pageEyebrow, { color: colors.primary }]}>DEEP WORK MODE</Text><Text style={[styles.pageTitle, { color: colors.foreground }]}>One tab. One task.</Text><View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.timerGlow, { borderColor: colors.primary }]}><Text style={[styles.timerText, { color: colors.foreground }]}>{minutes}:{secs}</Text><Text style={[styles.timerCaption, { color: colors.mutedForeground }]}>focus sprint</Text></View><Pressable testID="toggle-timer" onPress={() => { setRunning(!running); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); }} style={[styles.timerButton, { backgroundColor: colors.primary }]}><Ionicons name={running ? 'pause' : 'play'} size={21} color={colors.primaryForeground} /><Text style={[styles.timerButtonText, { color: colors.primaryForeground }]}>{running ? 'Pause sprint' : 'Start sprint'}</Text></Pressable><Pressable onPress={() => setSeconds(25 * 60)}><Text style={[styles.resetText, { color: colors.mutedForeground }]}>Reset timer</Text></Pressable></View><View style={[styles.focusNote, { backgroundColor: '#1D2831' }]}><Ionicons name="sparkles-outline" size={20} color={colors.primary} /><Text style={[styles.focusNoteText, { color: colors.foreground }]}>Put your phone face down. You’ve got this.</Text></View></ScrollView></View>;
}

function SettingsScreen() {
  const colors = useColors();
  const [haptics, setHaptics] = useState(true);
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={styles.simplePage}><Text style={[styles.pageEyebrow, { color: colors.primary }]}>SETTINGS</Text><Text style={[styles.pageTitle, { color: colors.foreground }]}>Make it yours.</Text><View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: '#2B374B' }]}><Ionicons name="notifications-outline" size={18} color={colors.primary} /></View><View style={styles.taskCopy}><Text style={[styles.taskTitle, { color: colors.foreground }]}>Daily nudges</Text><Text style={[styles.taskMeta, { color: colors.mutedForeground }]}>Keep your check-in rhythm</Text></View><Switch value={true} onValueChange={() => Alert.alert('Reminders', 'Your reminders are managed from the Home tab.')} trackColor={{ false: colors.secondary, true: '#607C33' }} thumbColor={colors.primary} /></View><View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.border }]}><View style={[styles.settingIcon, { backgroundColor: '#3A2C35' }]}><Ionicons name="phone-portrait-outline" size={18} color={colors.accent} /></View><View style={styles.taskCopy}><Text style={[styles.taskTitle, { color: colors.foreground }]}>Haptic feedback</Text><Text style={[styles.taskMeta, { color: colors.mutedForeground }]}>Feel every tiny win</Text></View><Switch value={haptics} onValueChange={setHaptics} trackColor={{ false: colors.secondary, true: '#607C33' }} thumbColor={haptics ? colors.primary : colors.mutedForeground} /></View></View><Text style={[styles.version, { color: colors.mutedForeground }]}>STREAKFORGE · BUILD YOUR EVIDENCE</Text></ScrollView></View>;
}

export default function TabOneScreen() {
  return <HomeScreen />;
}

export { ProgressScreen, FocusScreen, SettingsScreen };

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  greeting: { fontSize: 29, lineHeight: 34, fontFamily: 'Inter_700Bold', marginTop: 4 },
  iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', top: 10, right: 10 },
  heroCard: { marginHorizontal: 20, padding: 20, borderRadius: 26, minHeight: 176, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between' },
  heroCopy: { flex: 1 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  streakPillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  heroTitle: { fontSize: 23, lineHeight: 28, fontFamily: 'Inter_700Bold' },
  heroSub: { fontSize: 12, lineHeight: 18, marginTop: 12, fontFamily: 'Inter_400Regular', maxWidth: 220 },
  flameOrb: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#314535', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }], marginTop: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  sectionMeta: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  seeAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  pulseCard: { marginHorizontal: 20, borderRadius: 24, padding: 18, backgroundColor: '#171B25', flexDirection: 'row', alignItems: 'center' },
  ring: { alignItems: 'center', justifyContent: 'center', borderWidth: 9, position: 'relative' },
  ringArc: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 9, transform: [{ rotate: '-45deg' }] },
  ringValue: { fontSize: 25, fontFamily: 'Inter_700Bold' },
  ringCaption: { fontSize: 10, marginTop: 3, fontFamily: 'Inter_500Medium' },
  pulseStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 8 },
  statNumber: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statUnit: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  statLabel: { fontSize: 10, marginTop: 4, fontFamily: 'Inter_500Medium' },
  actionRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 14 },
  primaryAction: { flex: 1, height: 52, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryActionText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  secondaryAction: { flex: 1.08, height: 52, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryActionText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  runwayCard: { marginHorizontal: 20, borderRadius: 22, backgroundColor: '#171B25', padding: 16, flexDirection: 'row', justifyContent: 'space-around' },
  dayColumn: { alignItems: 'center', gap: 8 },
  dayLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  dayBar: { width: 15, height: 70, borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  dayFill: { width: '100%', borderRadius: 10 },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  taskRow: { marginHorizontal: 20, marginBottom: 9, borderRadius: 17, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  check: { width: 23, height: 23, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  taskCopy: { flex: 1 },
  taskTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  taskMeta: { fontSize: 11, marginTop: 4, fontFamily: 'Inter_400Regular' },
  struck: { textDecorationLine: 'line-through', opacity: 0.55 },
  reminderCard: { marginHorizontal: 20, backgroundColor: '#171B25', borderRadius: 21, paddingHorizontal: 15 },
  reminderRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  reminderIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,6,10,0.7)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 3, backgroundColor: '#465064', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  sheetTitle: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  inputLabel: { fontSize: 10, letterSpacing: 1, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 15, minHeight: 50, paddingHorizontal: 14, fontSize: 14, fontFamily: 'Inter_500Medium' },
  categoryRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  categoryChip: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 13 },
  categoryText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  saveButton: { height: 53, borderRadius: 17, marginTop: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  simplePage: { paddingTop: 70, paddingHorizontal: 20, paddingBottom: 120 },
  focusPage: { paddingTop: 70, paddingHorizontal: 20, paddingBottom: 120 },
  pageEyebrow: { fontSize: 11, letterSpacing: 1.4, fontFamily: 'Inter_700Bold' },
  pageTitle: { fontSize: 31, lineHeight: 36, fontFamily: 'Inter_700Bold', marginTop: 7 },
  pageSub: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular', marginTop: 10, maxWidth: 290 },
  insightGrid: { flexDirection: 'row', gap: 10, marginTop: 28 },
  insightCard: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, minHeight: 125 },
  insightValue: { fontSize: 27, fontFamily: 'Inter_700Bold', marginTop: 17 },
  insightLabel: { fontSize: 11, marginTop: 4, fontFamily: 'Inter_500Medium' },
  bigInsight: { borderRadius: 22, borderWidth: 1, padding: 17, marginTop: 12 },
  progressLine: { flexDirection: 'row', alignItems: 'center', marginTop: 17 },
  progressTrack: { flex: 1, height: 9, borderRadius: 5, overflow: 'hidden' },
  progressTrackFill: { height: '100%', borderRadius: 5 },
  progressPct: { width: 37, textAlign: 'right', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  timerCard: { borderRadius: 27, borderWidth: 1, alignItems: 'center', paddingVertical: 28, marginTop: 28 },
  timerGlow: { width: 228, height: 228, borderRadius: 114, borderWidth: 7, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 48, fontFamily: 'Inter_700Bold', letterSpacing: -2 },
  timerCaption: { fontSize: 11, marginTop: 7, fontFamily: 'Inter_500Medium' },
  timerButton: { height: 52, borderRadius: 17, paddingHorizontal: 29, marginTop: 25, flexDirection: 'row', alignItems: 'center', gap: 9 },
  timerButtonText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  resetText: { marginTop: 18, fontSize: 12, fontFamily: 'Inter_500Medium' },
  focusNote: { borderRadius: 17, marginTop: 14, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  focusNoteText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  settingsCard: { borderRadius: 22, borderWidth: 1, marginTop: 28, paddingHorizontal: 15 },
  settingRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  version: { fontSize: 10, letterSpacing: 1, textAlign: 'center', marginTop: 32, fontFamily: 'Inter_700Bold' },
});
