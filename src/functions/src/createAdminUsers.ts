import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { db } from "./firebase";

// interface UserData {
//   name: string;
//   username: string;
//   email: string;
//   password: string;
//   role: 'admin' | 'member';
// }

export const createAdminUsers = https.onCall({ region: "africa-south1" }, async (request) => {
  const { users } = request.data;
  // const batchName is not used but kept for compatibility
  const uid = request.auth?.uid;

  if (!uid) {
    throw new https.HttpsError("unauthenticated", "User is not authenticated.");
  }

  // Check if user is admin
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data();
  
  if (!userDoc.exists || userData?.role !== "admin") {
    throw new https.HttpsError("permission-denied", "Only administrators can create users.");
  }

  // Basic validation
  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new https.HttpsError("invalid-argument", "Users array is required and cannot be empty.");
  }

  try {
    const createdUsers = [];
    
    for (const user of users) {
      // Validate user data
      if (!user.name || !user.username || !user.email || !user.password || !user.role) {
        throw new https.HttpsError("invalid-argument", "Each user must have name, username, email, password, and role.");
      }
      
      // Create Firebase Auth user
      const authUser = await admin.auth().createUser({
        email: user.email,
        displayName: user.name,
        emailVerified: false,
        password: user.password
      });
      
      // Create user document in Firestore
      const userDocData = {
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await db.collection("users").doc(authUser.uid).set(userDocData);
      
      createdUsers.push({
        id: authUser.uid,
        ...userDocData
      });
    }

    logger.info("Admin users created successfully", { 
      count: createdUsers.length, 
      uid 
    });

    return {
      status: "success",
      users: createdUsers,
      count: createdUsers.length,
    };
  } catch (error: any) {
    logger.error("Error creating admin users", {
      error: error.message,
      code: error.code || 'unknown',
      stack: error.stack,
      uid,
      timestamp: new Date().toISOString()
    });

    if (error instanceof https.HttpsError) {
      throw error;
    }
    
    throw new https.HttpsError("internal", "An internal error occurred while creating users.");
  }
});