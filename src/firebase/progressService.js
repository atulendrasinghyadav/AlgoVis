import { db } from './firebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';

/**
 * Initializes a user document with empty progress if it doesn't exist.
 * @param {string} uid - Firebase user ID.
 */
export const initializeUserProgress = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      progress: {
        sorting: {},
        searching: {},
        trees: {},
        graphs: {},
        custom: {}
      },
      updatedAt: new Date().toISOString()
    });
  }
};

/**
 * Updates a specific algorithm's progress for a user.
 * @param {string} uid - User ID.
 * @param {string} category - Category (e.g., 'sorting').
 * @param {string} algoKey - Algorithm key (e.g., 'bubble').
 */
export const markAlgoAsCompleted = async (uid, category, algoKey) => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  
  try {
    // Use dot notation to update nested field without overwriting the whole object
    await updateDoc(userRef, {
      [`progress.${category}.${algoKey}`]: true,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    // If update fails, maybe the document doesn't exist yet
    await initializeUserProgress(uid);
    await updateDoc(userRef, {
      [`progress.${category}.${algoKey}`]: true,
      updatedAt: new Date().toISOString()
    });
  }
};

/**
 * Listens to real-time changes in user progress.
 * @param {string} uid - User ID.
 * @param {function} callback - Function called with progress data.
 */
export const listenToProgress = (uid, callback) => {
  if (!uid) return () => {};
  const userRef = doc(db, 'users', uid);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().progress);
    } else {
      callback(null);
    }
  });
};
