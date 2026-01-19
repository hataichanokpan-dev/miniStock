import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validate Firebase config before initialization
 */
function validateFirebaseConfig() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase configuration is missing. Please check your environment variables:\n' +
      '- NEXT_PUBLIC_FIREBASE_API_KEY\n' +
      '- NEXT_PUBLIC_FIREBASE_PROJECT_ID\n' +
      '- NEXT_PUBLIC_FIREBASE_DATABASE_URL (required for Realtime Database)'
    );
  }
}

/**
 * Initialize Firebase (supports both client and server-side)
 */
validateFirebaseConfig();

let app: FirebaseApp;
const existingApps = getApps();

if (existingApps.length > 0) {
  // Use existing app
  app = existingApps[0] as FirebaseApp;
} else {
  // Initialize new app
  app = initializeApp(firebaseConfig);
}

export const db: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

// Database paths
export const DB_PATHS = {
  WATCHLIST: 'watchlist',
  PORTFOLIO: 'portfolio',
  USER_PREFERENCES: 'userPreferences',
  SETTRADE: 'settrade',
  SETTRADE_INDUSTRY_SECTOR: 'settrade/industrySector',
  SETTRADE_INVESTOR_TYPE: 'settrade/investorType',
} as const;
