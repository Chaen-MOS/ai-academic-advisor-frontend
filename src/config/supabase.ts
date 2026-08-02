import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, Platform} from 'react-native';
import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dkrhfbagdhxfxllhyhht.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_featIjrq4IXIFN6oIUpQ6g_xSyHyIOi';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}