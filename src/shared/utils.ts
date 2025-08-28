import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a timestamp to a Date object
 * Handles both Firebase Timestamp objects and regular Date objects
 * @param timestamp - The timestamp to convert (Timestamp or Date)
 * @returns Date object
 */
export const timestampToDate = (timestamp: Timestamp | Date | { seconds: number; nanoseconds: number }): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(); // Fallback for unexpected formats
};