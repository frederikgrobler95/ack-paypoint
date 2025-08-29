import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";

interface AdminSignOutAllUsersResponse {
  success: boolean;
  message: string;
  usersAffected: number;
}

export const adminSignOutAllUsers = onCall({
  region: "africa-south1",
  memory: "512MiB",
  timeoutSeconds: 120,
  maxInstances: 5
}, async (request): Promise<AdminSignOutAllUsersResponse> => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new Error("Authentication required");
  }

  try {
    // Get the current user's document to check if they're an admin
    const userDoc = await db.collection("users").doc(request.auth.uid).get();
    
    if (!userDoc.exists) {
      throw new Error("User document not found");
    }

    const userData = userDoc.data();
    if (userData?.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }

    // Get all users
    const usersSnapshot = await db.collection("users").get();
    
    // Update all users to set signedIn to false
    const batch = db.batch();
    let usersAffected = 0;
    
    usersSnapshot.docs.forEach((doc) => {
      // Skip the admin user who is performing this action
      if (doc.id !== request.auth?.uid) {
        batch.update(doc.ref, {
          signedIn: false,
          updatedAt: FieldValue.serverTimestamp()
        });
        usersAffected++;
      }
    });
    
    // Commit the batch update
    await batch.commit();
    
    return {
      success: true,
      message: `Successfully signed out ${usersAffected} users`,
      usersAffected
    };
  } catch (error: any) {
    console.error("Error signing out all users:", error);
    throw new Error(error.message || "Failed to sign out all users");
  }
});