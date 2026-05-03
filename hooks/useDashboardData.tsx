import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Task, Quote, UserProfile, AppSettings, getTasks, saveTasks } from '../utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { auth, db } from '../src/config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  deleteDoc, getDoc,
} from 'firebase/firestore';
import { Alert } from 'react-native';

// ─── Default values used on logout / before auth resolves ─────────────────
const DEFAULT_PROFILE: UserProfile = {
  name: 'Welcome Back!',
  email: 'Ready to conquer today? 🚀',
  avatarUri: null,
};
const DEFAULT_BG =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop';

// ─── Context type ──────────────────────────────────────────────────────────
interface DashboardContextType {
  tasks: Task[];
  quotes: Quote[];
  activeQuote: string | null;
  bgImage: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  addTask: (text: string) => Promise<void>;
  updateTask: (id: string, newText: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addQuote: (text: string) => Promise<void>;
  updateQuote: (id: string, newText: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  setActiveQuote: (text: string, isManual: boolean) => Promise<void>;
  updateBgImage: (uri: string) => Promise<void>;
  pickImage: () => Promise<void>;
  pickAvatarImage: () => Promise<void>;
  refreshData: () => Promise<void>;
  userProfile: UserProfile;
  updateUserProfile: (name?: string, email?: string) => Promise<void>;
  appSettings: AppSettings;
  toggle24HourMode: () => Promise<void>;
  stats: { tasksDone: number; streak: number };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);



export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activeQuote, setActiveQuoteStateRef] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(DEFAULT_BG);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [appSettings, setAppSettings] = useState<AppSettings>({ is24Hour: false });
  const [completionStreak, setCompletionStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs to hold active Firestore unsubscribe functions
  const unsubProfileRef = useRef<(() => void) | null>(null);
  const unsubTasksRef = useRef<(() => void) | null>(null);
  const unsubQuotesRef = useRef<(() => void) | null>(null);
  // Ref keeps a live snapshot of quotes for use inside async callbacks
  const quotesRef = useRef<Quote[]>([]);

  // Detach all Firestore listeners in one call
  const detachListeners = () => {
    unsubProfileRef.current?.();
    unsubTasksRef.current?.();
    unsubQuotesRef.current?.();
    unsubProfileRef.current = null;
    unsubTasksRef.current = null;
    unsubQuotesRef.current = null;
  };

  // Apply clean default state (no user data leaks between sessions)
  const resetState = () => {
    setTasks([]);
    setQuotes([]);
    quotesRef.current = [];
    setActiveQuoteStateRef(null);
    setBgImage(DEFAULT_BG);
    setUserProfile(DEFAULT_PROFILE);
    setAppSettings({ is24Hour: false });
    setCompletionStreak(0);
  };

  // ─── Auth Observer ───────────────────────────────────────────────────────
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      // Always detach previous listeners before attaching new ones
      detachListeners();

      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
        const uid = currentUser.uid;

        // 1. Root profile doc listener
        unsubProfileRef.current = onSnapshot(
          doc(db, 'users', uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setUserProfile({
                name: data.name || 'User',
                email: data.email || currentUser.email || '',
                avatarUri: data.appSettings?.avatarUri || null,
                joinedDate: data.joinedDate,
              });
              setBgImage(data.appSettings?.bgImage || DEFAULT_BG);
              setAppSettings({ is24Hour: data.appSettings?.is24Hour ?? false });

              // ── Streak: read from Firestore and decay if a day was skipped ──
              const todayStr = format(new Date(), 'yyyy-MM-dd');
              const storedStreak: number = data.completionStreak || 0;
              const lastDate: string | null = data.lastCompletionDate || null;

              if (storedStreak > 0 && lastDate) {
                const diff = differenceInCalendarDays(
                  parseISO(todayStr),
                  parseISO(lastDate)
                );
                if (diff > 1) {
                  // Gap of 2+ days — streak is broken, reset to 0 in cloud + local
                  setCompletionStreak(0);
                  updateDoc(doc(db, 'users', uid), {
                    completionStreak: 0,
                    lastCompletionDate: null,
                  }).catch(() => {});
                } else {
                  setCompletionStreak(storedStreak);
                }
              } else {
                setCompletionStreak(storedStreak);
              }

              // Daily shuffle evaluation
              if (data.activeQuoteState) {
                const aQ = data.activeQuoteState;
                setActiveQuoteStateRef(
                  aQ.dateSet === todayStr || aQ.isManual ? aQ.quoteText : null
                );
              }
            }
          },
          (error) => console.log('[Firestore] profile listener error:', error.code)
        );

        // 2. users/{uid}/tasks sub-collection listener
        unsubTasksRef.current = onSnapshot(
          collection(db, 'users', uid, 'tasks'),
          (snap) => {
            const data: Task[] = [];
            snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Task));
            data.sort(
              (a, b) =>
                Number((a as any).createdAt || a.id) -
                Number((b as any).createdAt || b.id)
            );
            setTasks(data);
            setLoading(false);
          },
          (error) => console.log('[Firestore] tasks listener error:', error.code)
        );

        // 3. users/{uid}/quotes sub-collection listener
        //    All quotes (including seeded defaults) live here as real documents.
        unsubQuotesRef.current = onSnapshot(
          collection(db, 'users', uid, 'quotes'),
          (snap) => {
            const data: Quote[] = [];
            snap.forEach((d) => data.push({ id: d.id, text: d.data().text }));
            setQuotes(data);
            quotesRef.current = data;
            setLoading(false);
          },
          (error) => console.log('[Firestore] quotes listener error:', error.code)
        );
      } else {
        // Signed out — reset cloud data, then restore any locally saved tasks
        setUser(null);
        resetState();
        getTasks().then((local) => {
          setTasks(local);
          setLoading(false);
        }).catch(() => setLoading(false));
      }
    });

    // Cleanup on unmount
    return () => {
      unsubAuth();
      detachListeners();
    };
  }, []);

  // ─── Quote auto-selection logic ───────────────────────────────────────────
  // Handles stale activeQuote when the previously-active quote is deleted while
  // there are still quotes remaining (2+ scenario, deletion of the active one).
  useEffect(() => {
    if (!user || quotes.length === 0) return;
    const activeIsValid = quotes.some((q) => q.text === activeQuote);
    if (!activeIsValid && activeQuote !== null && activeQuote !== '') {
      // Active quote was deleted externally; pick a random replacement
      const pick = quotes[Math.floor(Math.random() * quotes.length)].text;
      void setActiveQuote(pick, false);
    }
  }, [user, activeQuote, quotes]);


  // ─── Sign Out ─────────────────────────────────────────────────────────────
  // Detaches listeners BEFORE signing out so no permission-denied errors fire.
  const signOut = async () => {
    detachListeners();
    resetState();
    await firebaseSignOut(auth);
  };

  // ─── Streak Helper ────────────────────────────────────────────────────────
  // Fires whenever a task is toggled TO completed. Increments the streak if
  // this is the first completion today; resets to 1 if the last completion
  // was 2+ days ago (gap). A skip day = streak goes to 0 (handled on app open).
  const updateStreak = async (nowCompleted: boolean) => {
    if (!user || !nowCompleted) return; // Only act when marking complete

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const lastDate: string | null = data.lastCompletionDate || null;
    const currentStreak: number = data.completionStreak || 0;

    if (lastDate === todayStr) return; // Already credited today — no double-count

    let newStreak = 1;
    if (lastDate) {
      const diff = differenceInCalendarDays(parseISO(todayStr), parseISO(lastDate));
      newStreak = diff === 1 ? currentStreak + 1 : 1; // Consecutive = up, gap = restart
    }

    await updateDoc(userRef, {
      completionStreak: newStreak,
      lastCompletionDate: todayStr,
    });
    // Local state updates immediately via the profile onSnapshot listener
  };

  // ─── Active Quote ─────────────────────────────────────────────────────────
  const setActiveQuote = async (text: string, isManual: boolean) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    await updateDoc(doc(db, 'users', user.uid), {
      activeQuoteState: { quoteText: text, dateSet: today, isManual },
    }).catch((err) => console.log('[setActiveQuote]', err.code));
  };

  // ─── Task Actions ─────────────────────────────────────────────────────────
  const addTask = async (text: string) => {
    if (!text.trim()) return;

    const id = Date.now().toString();
    const newTask: Task = { id, text, isCompleted: false };

    if (!user) {
      // Guest mode: persist locally and show immediately
      setTasks((prev) => {
        const updated = [...prev, newTask];
        saveTasks(updated).catch(() => {});
        return updated;
      });
      return;
    }

    // Signed-in: show task instantly (optimistic), then sync to Firestore.
    // The onSnapshot listener will reconcile state once the write confirms.
    setTasks((prev) => [...prev, newTask]);

    try {
      await setDoc(doc(db, 'users', user.uid, 'tasks', id), {
        title: text,
        text,
        isCompleted: false,
        createdAt: id,
        completedAt: null,
      });
    } catch {
      // Roll back the optimistic row on failure
      setTasks((prev) => prev.filter((t) => t.id !== id));
      Alert.alert('Network Error', 'Task could not be synced to the cloud.');
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === id
            ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined }
            : t
        );
        saveTasks(updated).catch(() => {});
        return updated;
      });
      return;
    }
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nowCompleted = !target.isCompleted;
    const completedAt = nowCompleted ? new Date().toISOString() : null;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', id), {
        isCompleted: nowCompleted,
        completedAt,
      });
      await updateStreak(nowCompleted);
    } catch (err: any) {
      console.log('[toggleTask]', err.code);
    }
  };

  const updateTask = async (id: string, newText: string) => {
    if (!user) {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, text: newText } : t));
        saveTasks(updated).catch(() => {});
        return updated;
      });
      return;
    }
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), {
      text: newText,
      title: newText,
    }).catch((e) => console.log('[updateTask]', e.code));
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveTasks(updated).catch(() => {});
        return updated;
      });
      return;
    }
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id)).catch((e) =>
      console.log('[deleteTask]', e.code)
    );
  };

  // ─── Quote Actions ────────────────────────────────────────────────────────
  // Adding: if library was empty (0→1 transition), auto-set new quote as active.
  const addQuote = async (text: string) => {
    if (!text.trim() || !user) return;
    const id = Date.now().toString();
    const wasEmpty = quotesRef.current.length === 0;
    try {
      await setDoc(doc(db, 'users', user.uid, 'quotes', id), { text });
      if (wasEmpty) {
        // First quote added to an empty library — make it active immediately
        await setActiveQuote(text, false);
      }
    } catch (e: any) {
      console.log('[addQuote]', e.code);
    }
  };

  const updateQuote = async (id: string, newText: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'quotes', id), { text: newText });
  };

  // Deletion: physically removes from Firestore. Handles:
  //   • Deleting the active quote → shuffle to a random remaining one
  //   • Library becomes empty after deletion → set fallback sentinel ''
  const deleteQuote = async (id: string) => {
    if (!user) return;
    const deletedQuote = quotesRef.current.find((q) => q.id === id);
    const remaining = quotesRef.current.filter((q) => q.id !== id);

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quotes', id));
    } catch (e: any) {
      console.log('[deleteQuote]', e.code);
      return;
    }

    // Only reshuffle if the deleted quote was the currently-displayed one
    if (deletedQuote && deletedQuote.text === activeQuote) {
      if (remaining.length === 0) {
        await setActiveQuote('', false); // Library empty — show fallback
      } else {
        const pick = remaining[Math.floor(Math.random() * remaining.length)].text;
        await setActiveQuote(pick, false);
      }
    }
  };

  // ─── Background & Avatar (stored inside appSettings map) ──────────────────
  const updateBgImage = async (uri: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { 'appSettings.bgImage': uri });
  };

  const pickImage = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to change your background.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      await updateBgImage(result.assets[0].uri);
    }
  };

  const pickAvatarImage = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      await updateDoc(doc(db, 'users', user.uid), {
        'appSettings.avatarUri': result.assets[0].uri,
      });
    }
  };

  // ─── Profile & Settings ───────────────────────────────────────────────────
  const updateUserProfile = async (name?: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      name: name !== undefined ? name : userProfile.name,
    });
  };

  const toggle24HourMode = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      'appSettings.is24Hour': !appSettings.is24Hour,
    });
  };


  // ─── Derived Stats ────────────────────────────────────────────────────────
  // tasksDone = local count of completed tasks (for the current task list)
  // streak    = authoritative value from Firestore, kept in sync by profile listener
  const stats = useMemo(() => {
    const tasksDone = tasks.filter((t) => t.isCompleted).length;
    return { tasksDone, streak: completionStreak };
  }, [tasks, completionStreak]);

  return (
    <DashboardContext.Provider
      value={{
        tasks, quotes, activeQuote, bgImage, loading,
        signOut,
        addTask, updateTask, toggleTask, deleteTask,
        addQuote, updateQuote, deleteQuote, setActiveQuote,
        updateBgImage, pickImage, pickAvatarImage,
        refreshData: async () => {},
        userProfile, updateUserProfile,
        appSettings, toggle24HourMode,
        stats,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboardData must be used within a DashboardProvider');
  return context;
};
