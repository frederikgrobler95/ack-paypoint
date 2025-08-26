export interface Assignment {
  id: string; // This is the same as the userId for efficient queries
  stallId: string;
  createdAt: Date;
}