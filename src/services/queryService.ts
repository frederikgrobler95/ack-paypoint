import { db as firestore } from './firebase';
import { doc, getDoc, collection, query, getDocs, orderBy, limit, startAfter, where, QueryConstraint } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Utility function to preserve Firestore Timestamps (no longer converting to Date)
export const preserveTimestamps = (data: any): any => {
  if (!data) return data;
  
  // Keep Firestore Timestamps as-is
  if (data instanceof Timestamp) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(preserveTimestamps);
  }
  
  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        result[key] = preserveTimestamps(data[key]);
      }
    }
    return result;
  }
  
  return data;
};

// Legacy function for backward compatibility - will be removed after migration
export const convertTimestamps = preserveTimestamps;

// Generic function to fetch a single document by ID
export const fetchDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  try {
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...preserveTimestamps(data)
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
      ...preserveTimestamps(doc.data())
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
  constraints: QueryConstraint[] = [],
  orderByField?: string
): Promise<{ data: T[]; lastDoc: any | null }> => {
  try {
    // Start with the base constraints
    let baseConstraints = [...constraints];
    
    // Add orderBy constraint if specified
    if (orderByField) {
      baseConstraints.push(orderBy(orderByField));
    }
    
    let q = query(
      collection(firestore, collectionName),
      ...baseConstraints,
      limit(pageSize)
    );
    
    if (lastDocument) {
      q = query(q, startAfter(lastDocument));
    }
    
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...preserveTimestamps(doc.data())
    } as T));
    
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    
    return { data, lastDoc };
  } catch (error) {
    console.error(`Error fetching paginated documents from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to fetch a single document by a field value
export const fetchDocumentByField = async <T>(
  collectionName: string,
  field: string,
  value: string
): Promise<T | null> => {
  try {
    const q = query(
      collection(firestore, collectionName),
      where(field, '==', value),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...preserveTimestamps(data)
      } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching document from ${collectionName} where ${field} = ${value}:`, error);
    throw error;
  }
};