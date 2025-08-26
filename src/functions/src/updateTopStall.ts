import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase";
import { calculateSalesStats } from "./statsCalculations";

const statsDocRef = db.doc("stats/live");

export const updateTopStall = https.onCall({ region: "africa-south1" }, async (request) => {
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

  logger.info("Starting manual top stall update...");

  try {
    const transactionsSnapshot = await db.collection("transactions").get();
    logger.info(`Found ${transactionsSnapshot.size} transactions.`);

    const { topStallInfo } = await calculateSalesStats(transactionsSnapshot);
    logger.info("Calculated top stall info:", { topStallInfo });

    await statsDocRef.set(
      {
        topPerformingStall: topStallInfo,
      },
      { merge: true }
    );

    logger.info("Manual top stall update completed successfully.");
    return { status: 'success' };
  } catch (error: any) {
    logger.error("Error in manual top stall update:", {
      error: error.message,
      stack: error.stack,
    });
    throw new https.HttpsError(
      'internal',
      'An internal error occurred while updating top stall info.'
    );
  }
});