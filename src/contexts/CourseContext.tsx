import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { Course, Enrollment, Cohort, LessonProgress } from '../types';

interface CourseContextType {
  courses: Course[];
  enrollments: Enrollment[];
  cohorts: Cohort[];
  currentEnrollment: Enrollment | null;
  currentCohort: Cohort | null;
  lessonProgress: LessonProgress[];
  loading: boolean;
  getCourse: (courseId: string) => Course | undefined;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  getCohort: (cohortId: string) => Cohort | undefined;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  refreshData: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current enrollment and cohort
  const currentEnrollment = enrollments.find(e => e.status === 'active') || null;
  const currentCohort = currentEnrollment 
    ? cohorts.find(c => c.id === currentEnrollment.cohortId) || null
    : null;

  async function loadCourses() {
    try {
      const coursesQuery = query(collection(db, 'courses'), where('status', '==', 'active'));
      const snapshot = await getDocs(coursesQuery);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }

  async function loadEnrollments() {
    if (!currentUser) return;

    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', currentUser.id)
      );
      const snapshot = await getDocs(enrollmentsQuery);
      const enrollmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[];
      
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  }

  async function loadCohorts() {
    try {
      const cohortsQuery = query(collection(db, 'cohorts'));
      const snapshot = await getDocs(cohortsQuery);
      const cohortsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Cohort[];
      
      setCohorts(cohortsData);
    } catch (error) {
      console.error('Error loading cohorts:', error);
    }
  }

  async function loadLessonProgress() {
    if (!currentUser) return;

    try {
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', '==', currentUser.id)
      );
      const snapshot = await getDocs(progressQuery);
      const progressData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LessonProgress[];
      
      setLessonProgress(progressData);
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    }
  }

  const refreshData = useCallback(async () => {
    console.log('CourseContext: Starting to refresh data...');
    setLoading(true);
    try {
      await Promise.all([
        loadCourses(),
        loadEnrollments(),
        loadCohorts(),
        loadLessonProgress(),
      ]);
      console.log('CourseContext: Data refresh completed successfully');
    } catch (error) {
      console.error('CourseContext: Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  function getCourse(courseId: string): Course | undefined {
    return courses.find(course => course.id === courseId);
  }

  function getEnrollment(courseId: string): Enrollment | undefined {
    return enrollments.find(enrollment => enrollment.courseId === courseId);
  }

  function getCohort(cohortId: string): Cohort | undefined {
    return cohorts.find(cohort => cohort.id === cohortId);
  }

  function getLessonProgress(lessonId: string): LessonProgress | undefined {
    return lessonProgress.find(progress => progress.lessonId === lessonId);
  }

  useEffect(() => {
    console.log('CourseContext: currentUser changed:', currentUser ? 'User logged in' : 'User logged out');
    if (currentUser) {
      console.log('CourseContext: Loading data for user:', currentUser.id);
      refreshData();
    } else {
      console.log('CourseContext: Clearing data, no user');
      setEnrollments([]);
      setLessonProgress([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Set up real-time listeners for progress updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'lessonProgress'), where('userId', '==', currentUser.id)),
      (snapshot) => {
        const progressData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as LessonProgress[];
        
        setLessonProgress(progressData);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const value: CourseContextType = {
    courses,
    enrollments,
    cohorts,
    currentEnrollment,
    currentCohort,
    lessonProgress,
    loading,
    getCourse,
    getEnrollment,
    getCohort,
    getLessonProgress,
    refreshData,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
} 