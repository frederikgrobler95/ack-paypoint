import { Timestamp } from "firebase/firestore";

export interface Assignment {
  id: string; // This is the same as the userId for efficient queries
  stallId: string;
  stallName?:string;
  stallType?:string;
  userName?:string;
  createdAt: Timestamp;
}
