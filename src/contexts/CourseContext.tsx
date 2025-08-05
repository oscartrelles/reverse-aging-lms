import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { Course, Enrollment, Cohort, LessonProgress, Lesson } from '../types';
import { lessonProgressService, StreakData } from '../services/lessonProgressService';
import { analyticsEvents } from '../services/analyticsService';

interface CourseContextType {
  courses: Course[];
  enrollments: Enrollment[];
  cohorts: Cohort[];
  lessons: Lesson[];
  currentEnrollment: Enrollment | null;
  currentCohort: Cohort | null;
  lessonProgress: LessonProgress[];
  streakData: StreakData | null;
  loading: boolean;
  getCourse: (courseId: string) => Course | undefined;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  getCohort: (cohortId: string) => Cohort | undefined;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  getLessonsByCourse: (courseId: string) => Lesson[];
  refreshData: () => Promise<void>;
  updateLessonProgress: (lessonId: string, progress: Partial<LessonProgress>) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  loadStreakData: () => Promise<void>;
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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current enrollment and cohort
  const currentEnrollment = enrollments.find(e => e.enrollmentStatus === 'active') || null;
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
        startDate: doc.data().startDate,
        endDate: doc.data().endDate,
      })) as Cohort[];
      

      setCohorts(cohortsData);
    } catch (error) {
      console.error('Error loading cohorts:', error);
    }
  }

  async function loadLessons() {
    try {
  
      const lessonsQuery = query(collection(db, 'lessons'));
      const snapshot = await getDocs(lessonsQuery);
      const lessonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Lesson[];
      

      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
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

    setLoading(true);
    try {
      await Promise.all([
        loadCourses(),
        loadEnrollments(),
        loadCohorts(),
        loadLessons(),
        loadLessonProgress(),
      ]);
      
      // Load streak data after other data is loaded
      if (currentUser && currentEnrollment) {
        await loadStreakData();
      }
      

    } catch (error) {
      console.error('CourseContext: Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentEnrollment]);

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

  function getLessonsByCourse(courseId: string): Lesson[] {
    return lessons.filter(lesson => lesson.courseId === courseId).sort((a, b) => a.order - b.order);
  }

  // Load streak data for the current user and course
  async function loadStreakData() {
    if (!currentUser || !currentEnrollment) return;

    try {
      const streak = await lessonProgressService.getUserStreak(currentUser.id, currentEnrollment.courseId);
      setStreakData(streak);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  }

  // Update lesson progress
  async function updateLessonProgress(lessonId: string, progress: Partial<LessonProgress>) {
    if (!currentUser || !currentEnrollment) return;

    try {
      await lessonProgressService.updateLessonProgress(
        currentUser.id,
        lessonId,
        currentEnrollment.courseId,
        progress
      );
      
      // Refresh streak data after progress update
      await loadStreakData();
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  }

  // Complete a lesson
  async function completeLesson(lessonId: string) {
    if (!currentUser || !currentEnrollment) return;

    try {
      await lessonProgressService.completeLesson(
        currentUser.id,
        lessonId,
        currentEnrollment.courseId
      );
      
      // Track lesson completion analytics
      const lesson = lessons.find(l => l.id === lessonId);
      const course = courses.find(c => c.id === currentEnrollment.courseId);
      
      if (lesson && course) {
        analyticsEvents.lessonComplete(
          lessonId,
          lesson.title,
          currentEnrollment.courseId,
          lesson.weekNumber
        );
        
        // Check if this completes the course
        const completedLessons = lessonProgress.filter(p => p.isCompleted).length + 1;
        const totalLessons = lessons.filter(l => l.courseId === currentEnrollment.courseId).length;
        
        if (completedLessons >= totalLessons) {
          analyticsEvents.courseComplete(currentEnrollment.courseId, course.title);
        }
      }
      
      // Refresh streak data after completion
      await loadStreakData();
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  }

  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setEnrollments([]);
      setLessonProgress([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Set up real-time listeners for progress updates and enrollments
  useEffect(() => {
    if (!currentUser) return;

    const progressUnsubscribe = onSnapshot(
      query(collection(db, 'lessonProgress'), where('userId', '==', currentUser.id)),
      (snapshot) => {
        const progressData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as LessonProgress[];
        
        setLessonProgress(progressData);
      }
    );

    const enrollmentsUnsubscribe = onSnapshot(
      query(collection(db, 'enrollments'), where('userId', '==', currentUser.id)),
      (snapshot) => {
        const enrollmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Enrollment[];
        
        setEnrollments(enrollmentsData);
      }
    );

    return () => {
      progressUnsubscribe();
      enrollmentsUnsubscribe();
    };
  }, [currentUser]);

  const value: CourseContextType = {
    courses,
    enrollments,
    cohorts,
    lessons,
    currentEnrollment,
    currentCohort,
    lessonProgress,
    streakData,
    loading,
    getCourse,
    getEnrollment,
    getCohort,
    getLessonProgress,
    getLessonsByCourse,
    refreshData,
    updateLessonProgress,
    completeLesson,
    loadStreakData,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
} 