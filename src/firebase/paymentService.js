import { db } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Records a successful payment and upgrades user to premium status.
 * @param {string} userId - The unique ID of the user.
 * @param {Object} paymentData - Data returned from Razorpay (payment_id, order_id, signature).
 */
export const processPremiumUpgrade = async (userId, paymentData) => {
  if (!userId) throw new Error('User ID is required for upgrade.');

  const userRef = doc(db, 'users', userId);
  const paymentsRef = collection(db, 'payments');

  try {
    // 1. Log the payment details for auditing
    await addDoc(paymentsRef, {
      userId,
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpayOrderId: paymentData.razorpay_order_id || 'direct_payment',
      amount: paymentData.amount || 1,
      currency: 'INR',
      status: 'success',
      planType: 'lifetime',
      timestamp: serverTimestamp(),
    });

    // 2. Upgrade the user's status in their profile (using setDoc with merge)
    await setDoc(userRef, {
      isPremium: true,
      premiumType: 'lifetime',
      premiumSince: serverTimestamp(),
      lastPaymentId: paymentData.razorpay_payment_id,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error processing premium upgrade:', error);
    throw error;
  }
};
