import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FS_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FS_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FS_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FS_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FS_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FS_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FS_MEASUREMENT_ID,
};

export const isFirebaseEnabled =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_FS_LOGGING === 'true';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const analytics = () => {
  if (isFirebaseEnabled) {
    return firebase.analytics();
  }
  return null;
};
export default firebase;
