import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Cohort } from '../types';

// Get available cohorts for enrollment (upcoming status)
export const getAvailableCohorts = async (courseId: string): Promise<Cohort[]> => {
  try {
    // Simplified query without ordering to avoid index requirement
    const cohortsQuery = query(
      collection(db, 'cohorts'),
      where('courseId', '==', courseId),
      where('status', '==', 'upcoming')
    );
    
    const snapshot = await getDocs(cohortsQuery);
    const cohorts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Cohort[];

    // Sort in memory instead of in the query
    cohorts.sort((a, b) => a.startDate.toMillis() - b.startDate.toMillis());

    console.log('Available cohorts:', cohorts);
    return cohorts;
  } catch (error) {
    console.error('Error getting available cohorts:', error);
    return [];
  }
};

// Get all cohorts for a course
export const getCourseCohorts = async (courseId: string): Promise<Cohort[]> => {
  try {
    const cohortsQuery = query(
      collection(db, 'cohorts'),
      where('courseId', '==', courseId),
      orderBy('startDate', 'desc')
    );
    
    const snapshot = await getDocs(cohortsQuery);
    const cohorts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Cohort[];

    return cohorts;
  } catch (error) {
    console.error('Error getting course cohorts:', error);
    return [];
  }
};

// Get cohort by ID
export const getCohortById = async (cohortId: string): Promise<Cohort | null> => {
  try {
    const cohortDoc = await getDocs(query(
      collection(db, 'cohorts'),
      where('__name__', '==', cohortId)
    ));
    
    if (!cohortDoc.empty) {
      const doc = cohortDoc.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Cohort;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cohort by ID:', error);
    return null;
  }
}; 