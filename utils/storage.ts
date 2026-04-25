import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: string; // ISO String
}

export interface Quote {
  id: string;
  text: string;
}

export interface ActiveQuoteState {
  quoteText: string;
  dateSet: string; // YYYY-MM-DD format
  isManual: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUri: string | null;
  joinedDate?: number;
}

export interface AppSettings {
  is24Hour: boolean;
}

const STORAGE_KEYS = {
  TASKS: 'lockscreen_tasks_v2',
  QUOTES: 'lockscreen_quotes_v3', // bumped for migration to objects
  ACTIVE_QUOTE: 'lockscreen_active_quote_v1',
  BG_IMAGE: 'lockscreen_bg_image_v2',
  USER_PROFILE: 'lockscreen_user_profile_v1',
  APP_SETTINGS: 'lockscreen_app_settings_v1',
};

export const DEFAULT_QUOTES: Quote[] = [
  { id: '1', text: "Add your motto to motivate yourself!" },
  { id: '2', text: "Make today a masterpiece! 🎨" },
  { id: '3', text: "Small steps every day. 🚀" }
];

export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('AsyncStorage missing for tasks, using defaults');
    return [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.log('AsyncStorage save missing for tasks');
  }
};

export const getQuotes = async (): Promise<Quote[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!data) {
      // Migrate old string quotes if possible
      const legacyData = await AsyncStorage.getItem('lockscreen_quotes_v2');
      if (legacyData) {
        const parsedLegacy = JSON.parse(legacyData);
        if (parsedLegacy.length > 0 && typeof parsedLegacy[0] === 'string') {
          const migrated = parsedLegacy.map((text: string, i: number) => ({ id: Date.now().toString() + i, text }));
          await saveQuotes(migrated);
          return migrated;
        }
      }
      return DEFAULT_QUOTES;
    }
    const parsed = JSON.parse(data);
    return parsed.length > 0 ? parsed : DEFAULT_QUOTES;
  } catch (e) {
    console.log('AsyncStorage missing for quotes, using defaults');
    return DEFAULT_QUOTES;
  }
};

export const saveQuotes = async (quotes: Quote[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.log('AsyncStorage save missing for quotes');
  }
};

export const getActiveQuoteState = async (): Promise<ActiveQuoteState | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_QUOTE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveActiveQuoteState = async (state: ActiveQuoteState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_QUOTE, JSON.stringify(state));
  } catch (e) {
    console.log('AsyncStorage save missing for active quote');
  }
};

export const getBgImage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.BG_IMAGE);
  } catch (e) {
    console.log('AsyncStorage missing for bg image, using defaults');
    return null;
  }
};

export const saveBgImage = async (uri: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BG_IMAGE, uri);
  } catch (e) {
    console.log('AsyncStorage save missing for bg image');
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.joinedDate) {
        parsed.joinedDate = Date.now();
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(parsed)).catch(() => {});
      }
      return parsed;
    }
    const defaultProfile = { name: 'Welcome Back!', email: 'Ready to conquer today? 🚀', avatarUri: null, joinedDate: Date.now() };
    AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile)).catch(() => {});
    return defaultProfile;
  } catch (e) {
    return { name: 'Welcome Back!', email: 'Ready to conquer today? 🚀', avatarUri: null, joinedDate: Date.now() };
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.log('User profile save failed');
  }
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : { is24Hour: false };
  } catch (e) {
    return { is24Hour: false };
  }
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.log('App settings save failed');
  }
};
