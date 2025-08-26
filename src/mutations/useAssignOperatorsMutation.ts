import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Assignment } from '../shared/contracts/assignment';

// Input type for the mutation
export interface AssignOperatorInput {
  userId: string;
  stallId: string;
  stallName?: string;
  stallType?: string;
  userName?: string;
}

// Function to create assignment documents
const assignOperators = async (assignments: AssignOperatorInput[]): Promise<Assignment[]> => {
  const createdAssignments: Assignment[] = [];
  
  // Process each assignment in the list
  for (const assignment of assignments) {
    const assignmentDocRef = doc(db, 'assignments', assignment.userId);
    
    // Create the assignment document
    const assignmentData: Assignment = {
      id: assignment.userId,
      stallId: assignment.stallId,
      stallName: assignment.stallName,
      stallType: assignment.stallType,
      userName: assignment.userName,
      createdAt: Timestamp.now(),
    };
    
    // Overwrite existing assignment if it exists
    await setDoc(assignmentDocRef, assignmentData);
    
    // Add to the list of created assignments
    createdAssignments.push(assignmentData);
  }
  
  return createdAssignments;
};

// React Query mutation hook
export const useAssignOperatorsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: assignOperators,
    onSuccess: () => {
      // Invalidate assignments query to refetch data
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};