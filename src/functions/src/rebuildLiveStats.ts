import * as https from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";
import * as logger from "firebase-functions/logger";
import { calculateSalesStats } from "./statsCalculations";

const statsDocRef = db.doc('stats/live');

export const rebuildLiveStats = https.onCall({ region: "africa-south1" }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new https.HttpsError(
      'unauthenticated',
      'User is not authenticated.'
    );
  }

  // Optional: Add role check to ensure only admins can run this.
  // const userDoc = await db.collection('users').doc(uid).get();
  // if (userDoc.data()?.role !== 'admin') {
  //   throw new https.HttpsError('permission-denied', 'User is not an admin.');
  // }

  logger.info('Starting live stats rebuild...');

  try {
    // Calculate total sales and top stall
    const transactionsSnapshot = await db.collection("transactions").get();
    const { totalSales, topStallInfo } = await calculateSalesStats(
      transactionsSnapshot
    );

    // Calculate total checkout amount
    const paymentsSnapshot = await db.collection("payments").get();
    const totalCheckoutAmount = paymentsSnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().amountCents,
      0
    );

    // Count total customers
    const customersSnapshot = await db.collection('customers').get();
    const totalCustomers = customersSnapshot.size;

    // Update the stats document
    await statsDocRef.set({
      totalSales,
      topPerformingStall: topStallInfo,
      totalCheckoutAmount,
      totalCustomers,
      lastUpdated: FieldValue.serverTimestamp(),
    });

    logger.info('Live stats rebuild completed successfully.');
    return { status: 'success' };
  } catch (error: any) {
    logger.error('Error rebuilding live stats:', {
      error: error.message,
      stack: error.stack,
    });
    throw new https.HttpsError(
      'internal',
      'An internal error occurred while rebuilding stats.'
    );
  }
});