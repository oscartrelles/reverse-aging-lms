import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Course, Lesson, Cohort } from '../types';

export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  duration: number;
  maxStudents: number;
  status: 'draft' | 'active' | 'archived';
  isFree: boolean;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  maxStudents?: number;
  status?: 'draft' | 'active' | 'archived';
  isFree?: boolean;
}

export interface CreateLessonData {
  courseId: string;
  weekNumber: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoDuration?: number;
  duration?: number;
  resources: Array<{
    id: string;
    title: string;
    type: 'pdf' | 'workbook' | 'link';
    url: string;
    size?: number;
  }>;
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
  duration?: number;
  resources?: Array<{
    id: string;
    title: string;
    type: 'pdf' | 'workbook' | 'link';
    url: string;
    size?: number;
  }>;
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
  description?: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents?: number;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  weeklyReleaseTime?: string;
  isActive?: boolean;
  enrollmentDeadline?: Date;
}

export interface UpdateCohortData {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  maxStudents?: number;
  currentStudents?: number;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  weeklyReleaseTime?: string;
  isActive?: boolean;
  enrollmentDeadline?: Date;
}

export const courseManagementService = {
  // Course Management
  async getAllCourses(): Promise<Course[]> {
    try {
      const coursesQuery = query(
        collection(db, 'courses'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(coursesQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Course));
    } catch (error) {
      console.error('Error getting all courses:', error);
      throw error;
    }
  },

  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (!courseDoc.exists()) return null;
      
      return {
        ...courseDoc.data(),
        id: courseDoc.id
      } as Course;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  },

  async createCourse(courseData: CreateCourseData): Promise<string> {
    try {
      const courseDataWithTimestamps = {
        ...courseData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const courseRef = await addDoc(collection(db, 'courses'), courseDataWithTimestamps);
      console.log('✅ Course created successfully:', courseRef.id);
      return courseRef.id;
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw error;
    }
  },

  async updateCourse(courseId: string, courseData: UpdateCourseData): Promise<void> {
    try {
      const courseDataWithTimestamp = {
        ...courseData,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'courses', courseId), courseDataWithTimestamp);
      console.log('✅ Course updated successfully:', courseId);
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete the course
      batch.delete(doc(db, 'courses', courseId));
      
      // Delete associated lessons
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId)
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      lessonsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete associated cohorts
      const cohortsQuery = query(
        collection(db, 'cohorts'),
        where('courseId', '==', courseId)
      );
      const cohortsSnapshot = await getDocs(cohortsQuery);
      cohortsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('✅ Course and associated data deleted successfully:', courseId);
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  },

  // Lesson Management
  async getAllLessons(): Promise<Lesson[]> {
    try {
      const lessonsQuery = query(
        collection(db, 'lessons'),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(lessonsQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Lesson));
    } catch (error) {
      console.error('Error getting all lessons:', error);
      throw error;
    }
  },

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(lessonsQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Lesson));
    } catch (error) {
      console.error('Error getting course lessons:', error);
      throw error;
    }
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    try {
      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
      if (!lessonDoc.exists()) return null;
      
      return {
        ...lessonDoc.data(),
        id: lessonDoc.id
      } as Lesson;
    } catch (error) {
      console.error('Error getting lesson:', error);
      throw error;
    }
  },

  async createLesson(lessonData: CreateLessonData): Promise<string> {
    try {
      const lessonDataWithTimestamps = {
        ...lessonData,
        releaseDate: lessonData.releaseDate ? Timestamp.fromDate(lessonData.releaseDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const lessonRef = await addDoc(collection(db, 'lessons'), lessonDataWithTimestamps);
      console.log('✅ Lesson created successfully:', lessonRef.id);
      return lessonRef.id;
    } catch (error) {
      console.error('❌ Error creating lesson:', error);
      throw error;
    }
  },

  async updateLesson(lessonId: string, lessonData: UpdateLessonData): Promise<void> {
    try {
      const lessonDataWithTimestamp = {
        ...lessonData,
        releaseDate: lessonData.releaseDate ? Timestamp.fromDate(lessonData.releaseDate) : null,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'lessons', lessonId), lessonDataWithTimestamp);
      console.log('✅ Lesson updated successfully:', lessonId);
    } catch (error) {
      console.error('❌ Error updating lesson:', error);
      throw error;
    }
  },

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      console.log('✅ Lesson deleted successfully:', lessonId);
    } catch (error) {
      console.error('❌ Error deleting lesson:', error);
      throw error;
    }
  },

  // Cohort Management
  async getAllCohorts(): Promise<Cohort[]> {
    try {
      const cohortsQuery = query(
        collection(db, 'cohorts'),
        orderBy('startDate', 'desc')
      );
      
      const snapshot = await getDocs(cohortsQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Cohort));
    } catch (error) {
      console.error('Error getting all cohorts:', error);
      throw error;
    }
  },

  async getCourseCohorts(courseId: string): Promise<Cohort[]> {
    try {
      const cohortsQuery = query(
        collection(db, 'cohorts'),
        where('courseId', '==', courseId),
        orderBy('startDate', 'desc')
      );
      
      const snapshot = await getDocs(cohortsQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Cohort));
    } catch (error) {
      console.error('Error getting course cohorts:', error);
      throw error;
    }
  },

  async getCohort(cohortId: string): Promise<Cohort | null> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) return null;
      
      return {
        ...cohortDoc.data(),
        id: cohortDoc.id
      } as Cohort;
    } catch (error) {
      console.error('Error getting cohort:', error);
      throw error;
    }
  },

  async createCohort(cohortData: CreateCohortData): Promise<string> {
    try {
      const cohortDataWithTimestamps = {
        ...cohortData,
        startDate: Timestamp.fromDate(cohortData.startDate),
        endDate: Timestamp.fromDate(cohortData.endDate),
        currentStudents: cohortData.currentStudents || 0,
        status: cohortData.status || 'upcoming',
        isActive: cohortData.isActive || false,
        enrollmentDeadline: cohortData.enrollmentDeadline ? Timestamp.fromDate(cohortData.enrollmentDeadline) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const cohortRef = await addDoc(collection(db, 'cohorts'), cohortDataWithTimestamps);
      console.log('✅ Cohort created successfully:', cohortRef.id);
      return cohortRef.id;
    } catch (error) {
      console.error('❌ Error creating cohort:', error);
      throw error;
    }
  },

  async updateCohort(cohortId: string, cohortData: UpdateCohortData): Promise<void> {
    try {
      const updateData: any = {
        ...cohortData,
        updatedAt: Timestamp.now(),
      };
      
      if (cohortData.startDate) {
        updateData.startDate = Timestamp.fromDate(cohortData.startDate);
      }
      if (cohortData.endDate) {
        updateData.endDate = Timestamp.fromDate(cohortData.endDate);
      }
      if (cohortData.enrollmentDeadline) {
        updateData.enrollmentDeadline = Timestamp.fromDate(cohortData.enrollmentDeadline);
      }
      
      await updateDoc(doc(db, 'cohorts', cohortId), updateData);
      console.log('✅ Cohort updated successfully:', cohortId);
    } catch (error) {
      console.error('❌ Error updating cohort:', error);
      throw error;
    }
  },

  async deleteCohort(cohortId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cohorts', cohortId));
      console.log('✅ Cohort deleted successfully:', cohortId);
    } catch (error) {
      console.error('❌ Error deleting cohort:', error);
      throw error;
    }
  },

  // Real-time listeners
  subscribeToCourses(callback: (courses: Course[]) => void) {
    const coursesQuery = query(
      collection(db, 'courses'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(coursesQuery, (snapshot) => {
      const courses = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Course));
      callback(courses);
    });
  },

  subscribeToCourseLessons(courseId: string, callback: (lessons: Lesson[]) => void) {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(lessonsQuery, (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Lesson));
      callback(lessons);
    });
  },

  subscribeToCourseCohorts(courseId: string, callback: (cohorts: Cohort[]) => void) {
    const cohortsQuery = query(
      collection(db, 'cohorts'),
      where('courseId', '==', courseId),
      orderBy('startDate', 'desc')
    );
    
    return onSnapshot(cohortsQuery, (snapshot) => {
      const cohorts = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Cohort));
      callback(cohorts);
    });
  },
}; 