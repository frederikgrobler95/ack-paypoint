import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a timestamp to a Date object
 * Handles both Firebase Timestamp objects and regular Date objects
 * @param timestamp - The timestamp to convert (Timestamp or Date)
 * @returns Date object
 */
export const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};