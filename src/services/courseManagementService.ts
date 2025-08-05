import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Course, Lesson, Cohort, Resource } from '../types';

// Course Management Interfaces
export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  maxStudents: number;
  duration: number; // weeks
  status: 'draft' | 'active' | 'archived';
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
  maxStudents?: number;
  duration?: number;
  status?: 'draft' | 'active' | 'archived';
}

export interface CreateLessonData {
  courseId: string;
  weekNumber: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoDuration?: number;
  resources: Resource[];
  isPublished: boolean;
  releaseDate?: Date;
  order: number;
  whatYoullMaster?: string[];
  keyPractice?: string;
  theme?: string;
  learningObjectives?: string[];
}

export interface UpdateLessonData {
  weekNumber?: number;
  title?: string;
  description?: string;
  videoUrl?: string;
  videoDuration?: number;
  resources?: Resource[];
  isPublished?: boolean;
  releaseDate?: Date;
  order?: number;
  whatYoullMaster?: string[];
  keyPractice?: string;
  theme?: string;
  learningObjectives?: string[];
}

export interface CreateCohortData {
  courseId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  weeklyReleaseTime: string; // "08:00" for 8am
}

export interface UpdateCohortData {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  maxStudents?: number;
  status?: 'upcoming' | 'active' | 'completed';
  weeklyReleaseTime?: string;
}

export interface CourseFilters {
  status?: 'draft' | 'active' | 'archived';
  isFree?: boolean;
  search?: string;
}

export interface LessonFilters {
  courseId?: string;
  isPublished?: boolean;
  weekNumber?: number;
  search?: string;
}

export interface CohortFilters {
  courseId?: string;
  status?: 'upcoming' | 'active' | 'completed';
  search?: string;
}

export interface CourseAnalytics {
  totalCourses: number;
  activeCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalLessons: number;
  totalCohorts: number;
  activeCohorts: number;
  upcomingCohorts: number;
  completedCohorts: number;
  averageLessonsPerCourse: number;
  averageCohortsPerCourse: number;
}

// Centralized Course Management Service
export const courseManagementService = {
  // ===== COURSE OPERATIONS =====
  
  /**
   * Get all courses with optional filtering
   */
  async getCourses(filters?: CourseFilters): Promise<Course[]> {
    try {
      let coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      
      // Apply filters
      if (filters?.status) {
        coursesQuery = query(coursesQuery, where('status', '==', filters.status));
      }
      
      if (filters?.isFree !== undefined) {
        coursesQuery = query(coursesQuery, where('isFree', '==', filters.isFree));
      }
      
      const snapshot = await getDocs(coursesQuery);
      let courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      // Apply search filter in memory
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        courses = courses.filter(course => 
          course.title.toLowerCase().includes(searchTerm) ||
          course.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  },

  /**
   * Get a single course by ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        return {
          id: courseDoc.id,
          ...courseDoc.data()
        } as Course;
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      throw error;
    }
  },

  /**
   * Create a new course
   */
  async createCourse(courseData: CreateCourseData): Promise<string> {
    try {
      const courseDoc = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return courseDoc.id;
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw error;
    }
  },

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, updates: UpdateCourseData): Promise<void> {
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  },

  /**
   * Delete a course (and all associated lessons and cohorts)
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete the course
      batch.delete(doc(db, 'courses', courseId));
      
      // Delete all lessons for this course
      const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', courseId));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      lessonsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete all cohorts for this course
      const cohortsQuery = query(collection(db, 'cohorts'), where('courseId', '==', courseId));
      const cohortsSnapshot = await getDocs(cohortsQuery);
      cohortsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  },

  // ===== LESSON OPERATIONS =====
  
  /**
   * Get all lessons with optional filtering
   */
  async getLessons(filters?: LessonFilters): Promise<Lesson[]> {
    try {
      let lessonsQuery = query(collection(db, 'lessons'), orderBy('order', 'asc'));
      
      // Apply filters
      if (filters?.courseId) {
        lessonsQuery = query(lessonsQuery, where('courseId', '==', filters.courseId));
      }
      
      if (filters?.isPublished !== undefined) {
        lessonsQuery = query(lessonsQuery, where('isPublished', '==', filters.isPublished));
      }
      
      if (filters?.weekNumber) {
        lessonsQuery = query(lessonsQuery, where('weekNumber', '==', filters.weekNumber));
      }
      
      const snapshot = await getDocs(lessonsQuery);
      let lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lesson[];
      
      // Apply search filter in memory
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        lessons = lessons.filter(lesson => 
          lesson.title.toLowerCase().includes(searchTerm) ||
          lesson.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return lessons;
    } catch (error) {
      console.error('❌ Error fetching lessons:', error);
      throw error;
    }
  },

  /**
   * Get a single lesson by ID
   */
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
      if (lessonDoc.exists()) {
        return {
          id: lessonDoc.id,
          ...lessonDoc.data()
        } as Lesson;
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching lesson:', error);
      throw error;
    }
  },

  /**
   * Create a new lesson
   */
  async createLesson(lessonData: CreateLessonData): Promise<string> {
    try {
      const lessonDoc = await addDoc(collection(db, 'lessons'), {
        ...lessonData,
        releaseDate: lessonData.releaseDate ? Timestamp.fromDate(lessonData.releaseDate) : undefined,
      });
      return lessonDoc.id;
    } catch (error) {
      console.error('❌ Error creating lesson:', error);
      throw error;
    }
  },

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: string, updates: UpdateLessonData): Promise<void> {
    try {
      const updateData: any = { ...updates };
      if (updates.releaseDate) {
        updateData.releaseDate = Timestamp.fromDate(updates.releaseDate);
      }
      
      await updateDoc(doc(db, 'lessons', lessonId), updateData);
    } catch (error) {
      console.error('❌ Error updating lesson:', error);
      throw error;
    }
  },

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
    } catch (error) {
      console.error('❌ Error deleting lesson:', error);
      throw error;
    }
  },

  /**
   * Reorder lessons for a course
   */
  async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      lessonIds.forEach((lessonId, index) => {
        const lessonRef = doc(db, 'lessons', lessonId);
        batch.update(lessonRef, { order: index + 1 });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('❌ Error reordering lessons:', error);
      throw error;
    }
  },

  // ===== COHORT OPERATIONS =====
  
  /**
   * Get all cohorts with optional filtering
   */
  async getCohorts(filters?: CohortFilters): Promise<Cohort[]> {
    try {
      let cohortsQuery = query(collection(db, 'cohorts'), orderBy('startDate', 'desc'));
      
      // Apply filters
      if (filters?.courseId) {
        cohortsQuery = query(cohortsQuery, where('courseId', '==', filters.courseId));
      }
      
      if (filters?.status) {
        cohortsQuery = query(cohortsQuery, where('status', '==', filters.status));
      }
      
      const snapshot = await getDocs(cohortsQuery);
      let cohorts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cohort[];
      
      // Apply search filter in memory
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        cohorts = cohorts.filter(cohort => 
          cohort.name.toLowerCase().includes(searchTerm)
        );
      }
      
      return cohorts;
    } catch (error) {
      console.error('❌ Error fetching cohorts:', error);
      throw error;
    }
  },

  /**
   * Get a single cohort by ID
   */
  async getCohortById(cohortId: string): Promise<Cohort | null> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (cohortDoc.exists()) {
        return {
          id: cohortDoc.id,
          ...cohortDoc.data()
        } as Cohort;
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching cohort:', error);
      throw error;
    }
  },

  /**
   * Create a new cohort
   */
  async createCohort(cohortData: CreateCohortData): Promise<string> {
    try {
      const cohortDoc = await addDoc(collection(db, 'cohorts'), {
        ...cohortData,
        startDate: Timestamp.fromDate(cohortData.startDate),
        endDate: Timestamp.fromDate(cohortData.endDate),
        currentStudents: 0,
        status: 'upcoming',
      });
      return cohortDoc.id;
    } catch (error) {
      console.error('❌ Error creating cohort:', error);
      throw error;
    }
  },

  /**
   * Update an existing cohort
   */
  async updateCohort(cohortId: string, updates: UpdateCohortData): Promise<void> {
    try {
      const updateData: any = { ...updates };
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      
      await updateDoc(doc(db, 'cohorts', cohortId), updateData);
    } catch (error) {
      console.error('❌ Error updating cohort:', error);
      throw error;
    }
  },

  /**
   * Delete a cohort
   */
  async deleteCohort(cohortId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cohorts', cohortId));
    } catch (error) {
      console.error('❌ Error deleting cohort:', error);
      throw error;
    }
  },

  // ===== ANALYTICS =====
  
  /**
   * Get course management analytics
   */
  async getCourseAnalytics(): Promise<CourseAnalytics> {
    try {
      const [courses, lessons, cohorts] = await Promise.all([
        this.getCourses(),
        this.getLessons(),
        this.getCohorts()
      ]);
      
      const activeCourses = courses.filter(c => c.status === 'active').length;
      const draftCourses = courses.filter(c => c.status === 'draft').length;
      const archivedCourses = courses.filter(c => c.status === 'archived').length;
      
      const activeCohorts = cohorts.filter(c => c.status === 'active').length;
      const upcomingCohorts = cohorts.filter(c => c.status === 'upcoming').length;
      const completedCohorts = cohorts.filter(c => c.status === 'completed').length;
      
      return {
        totalCourses: courses.length,
        activeCourses,
        draftCourses,
        archivedCourses,
        totalLessons: lessons.length,
        totalCohorts: cohorts.length,
        activeCohorts,
        upcomingCohorts,
        completedCohorts,
        averageLessonsPerCourse: courses.length > 0 ? Math.round(lessons.length / courses.length * 10) / 10 : 0,
        averageCohortsPerCourse: courses.length > 0 ? Math.round(cohorts.length / courses.length * 10) / 10 : 0,
      };
    } catch (error) {
      console.error('❌ Error fetching course analytics:', error);
      throw error;
    }
  },

  // ===== REAL-TIME SUBSCRIPTIONS =====
  
  /**
   * Subscribe to courses changes
   */
  subscribeToCourses(callback: (courses: Course[]) => void): Unsubscribe {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      callback(courses);
    });
  },

  /**
   * Subscribe to lessons changes for a course
   */
  subscribeToCourseLessons(courseId: string, callback: (lessons: Lesson[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'lessons'), 
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lesson[];
      callback(lessons);
    });
  },

  /**
   * Subscribe to cohorts changes for a course
   */
  subscribeToCourseCohorts(courseId: string, callback: (cohorts: Cohort[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'cohorts'), 
      where('courseId', '==', courseId),
      orderBy('startDate', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const cohorts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cohort[];
      callback(cohorts);
    });
  },
}; 