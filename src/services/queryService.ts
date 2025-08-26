import { firestore } from './firebase';
import { doc, getDoc, collection, query, getDocs, orderBy, limit, startAfter, QueryConstraint } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Utility function to convert Firestore Timestamps to Dates
export const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  
  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }
  
  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        result[key] = convertTimestamps(data[key]);
      }
    }
    return result;
  }
  
  return data;
};

// Generic function to fetch a single document by ID
export const fetchDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  try {
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...convertTimestamps(data)
      } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to fetch multiple documents with optional constraints
export const fetchDocuments = async <T>(
  collectionName: string, 
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const q = query(collection(firestore, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    } as T));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to fetch documents with pagination
export const fetchDocumentsPaginated = async <T>(
  collectionName: string,
  pageSize: number = 20,
  lastDocument?: any,
  constraints: QueryConstraint[] = []
): Promise<{ data: T[]; lastDoc: any | null }> => {
  try {
    let q = query(
      collection(firestore, collectionName),
      ...constraints,
      orderBy('createdAt'), // Assuming all documents have a createdAt field
      limit(pageSize)
    );
    
    if (lastDocument) {
      q = query(q, startAfter(lastDocument));
    }
    
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    } as T));
    
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    
    return { data, lastDoc };
  } catch (error) {
    console.error(`Error fetching paginated documents from ${collectionName}:`, error);
    throw error;
  }
};