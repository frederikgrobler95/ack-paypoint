"use strict";
// This function is deprecated as we now fetch the user's display name from Firestore
// and store it in the session store during authentication.
//
// import * as https from "firebase-functions/v2/https";
// import { getAuth } from "firebase-admin/auth";
// import { db } from "./firebase";
// import * as logger from "firebase-functions/logger";
//
// export const updateUserDisplayNames = https.onCall({ region: "africa-south1" }, async (request) => {
//   const uid = request.auth?.uid;
//   if (!uid) {
//     throw new https.HttpsError(
//       'unauthenticated',
//       'User is not authenticated.'
//     );
//   }
//
//   // Check if user is admin
//   const userDoc = await db.collection('users').doc(uid).get();
//   if (userDoc.data()?.role !== 'admin') {
//     throw new https.HttpsError('permission-denied', 'User is not an admin.');
//   }
//
//   logger.info('Starting user display name update process...');
//
//   try {
//     const auth = getAuth();
//     const updatedUsers: string[] = [];
//     let pageToken: string | undefined;
//
//     do {
//       // List users in batches of 1000
//       const result = await auth.listUsers(1000, pageToken);
//       pageToken = result.pageToken;
//
//       // Process each user
//       for (const user of result.users) {
//         // Skip users who already have a display name
//         if (user.displayName) {
//           continue;
//         }
//
//         // Look up user's name in Firestore
//         try {
//           const userDoc = await db.collection('users').doc(user.uid).get();
//           if (userDoc.exists) {
//             const userData = userDoc.data();
//             const name = userData?.name;
//
//             if (name) {
//               // Update user's display name in Firebase Auth
//               await auth.updateUser(user.uid, {
//                 displayName: name
//               });
//
//               updatedUsers.push(user.uid);
//               logger.info(`Updated display name for user ${user.uid} to "${name}"`);
//             } else {
//               logger.warn(`User ${user.uid} has no name in Firestore`);
//             }
//           } else {
//             logger.warn(`User ${user.uid} has no document in Firestore`);
//           }
//         } catch (error: any) {
//           logger.error(`Error processing user ${user.uid}:`, {
//             error: error.message,
//             stack: error.stack,
//           });
//         }
//       }
//     } while (pageToken);
//
//     logger.info(`User display name update process completed. Updated ${updatedUsers.length} users.`);
//     return {
//       status: 'success',
//       updatedUsersCount: updatedUsers.length,
//       updatedUsers: updatedUsers
//     };
//   } catch (error: any) {
//     logger.error('Error updating user display names:', {
//       error: error.message,
//       stack: error.stack,
//     });
//     throw new https.HttpsError(
//       'internal',
//       'An internal error occurred while updating user display names.'
//     );
//   }
// });
//# sourceMappingURL=updateUserDisplayNames.js.map