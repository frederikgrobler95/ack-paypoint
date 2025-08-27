import React, { useEffect, useState, createContext, useContext } from 'react';
import { getFirestore, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { app } from '../services/firebase';
import { useSessionStore } from '../shared/stores/sessionStore';
import { useWorkStore } from '../shared/stores/workStore';
import { Assignment } from '../shared/contracts/assignment';
import { Stall } from '../shared/contracts/stall';

const firestore = getFirestore(app);

interface MyAssignmentContextType {
  assignment: Assignment | null;
  stall: Stall | null;
  isLoading: boolean;
  error: string | null;
}

const MyAssignmentContext = createContext<MyAssignmentContextType | undefined>(undefined);

export const useMyAssignment = () => {
  const context = useContext(MyAssignmentContext);
  if (context === undefined) {
    throw new Error('useMyAssignment must be used within a MyAssignmentProvider');
  }
  return context;
};

interface MyAssignmentProviderProps {
  children: React.ReactNode;
}

export const MyAssignmentProvider: React.FC<MyAssignmentProviderProps> = ({ children }) => {
  const { user } = useSessionStore();
  const { setCurrentAssignmentId, setCurrentStallId, setCurrentStall, setCurrentStallType } = useWorkStore();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [stall, setStall] = useState<Stall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      setAssignment(null);
      setStall(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      doc(firestore, 'assignments', user.uid),
      async (docSnap) => {
        try {
          if (docSnap.exists()) {
            const assignmentData = {
              id: docSnap.id,
              ...(docSnap.data() as Omit<Assignment, 'id'>),
            } as Assignment;

            setAssignment(assignmentData);
            setCurrentAssignmentId(assignmentData.id);
            setCurrentStallId(assignmentData.stallId);

            // Fetch stall data when assignment is found
            if (assignmentData.stallId) {
              try {
                const stallDoc = await getDoc(doc(firestore, 'stalls', assignmentData.stallId));
                if (stallDoc.exists()) {
                  const stallData = {
                    id: stallDoc.id,
                    ...(stallDoc.data() as Omit<Stall, 'id'>),
                  } as Stall;
                  setStall(stallData);
                  setCurrentStall(stallData);
                  setCurrentStallType(stallData.type);
                } else {
                  setStall(null);
                  setCurrentStall(null);
                  setCurrentStallType(null);
                }
              } catch (stallError) {
                console.error('Error fetching stall data:', stallError);
                setStall(null);
                setCurrentStall(null);
                setCurrentStallType(null);
                setError('Failed to load stall information');
              }
            } else {
              setStall(null);
              setCurrentStall(null);
              setCurrentStallType(null);
            }
          } else {
            setAssignment(null);
            setStall(null);
            setCurrentAssignmentId(null);
            setCurrentStallId(null);
            setCurrentStall(null);
            setCurrentStallType(null);
          }
        } catch (err) {
          console.error('Error processing assignment:', err);
          setError('Failed to load assignment');
          setAssignment(null);
          setStall(null);
          setCurrentAssignmentId(null);
          setCurrentStallId(null);
          setCurrentStall(null);
          setCurrentStallType(null);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to assignment changes:', error);
        setError('Failed to listen for assignment changes');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, setCurrentAssignmentId, setCurrentStallId, setCurrentStall]);

  const contextValue: MyAssignmentContextType = {
    assignment,
    stall,
    isLoading,
    error,
  };

  return (
    <MyAssignmentContext.Provider value={contextValue}>
      {children}
    </MyAssignmentContext.Provider>
  );
};