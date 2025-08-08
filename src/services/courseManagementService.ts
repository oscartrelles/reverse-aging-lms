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
  limit,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Course, Lesson, Cohort, CohortPricing, CohortCoupon } from '../types';

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
  
  // Pricing configuration
  pricing: CohortPricing;
  coupons?: CohortCoupon[];
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
  
  // Pricing configuration
  pricing?: CohortPricing;
  coupons?: CohortCoupon[];
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
      // Convert dates and process coupon timestamps
      const processedCoupons = (cohortData.coupons || []).map(coupon => ({
        ...coupon,
        validFrom: Timestamp.fromDate(new Date(coupon.validFrom as any)),
        validUntil: Timestamp.fromDate(new Date(coupon.validUntil as any)),
      }));

      // Process early bird discount if present
      const processedPricing = {
        ...cohortData.pricing,
        earlyBirdDiscount: cohortData.pricing.earlyBirdDiscount ? {
          ...cohortData.pricing.earlyBirdDiscount,
          validUntil: Timestamp.fromDate(new Date(cohortData.pricing.earlyBirdDiscount.validUntil as any))
        } : undefined
      };

      const cohortDataWithTimestamps = {
        ...cohortData,
        startDate: Timestamp.fromDate(cohortData.startDate),
        endDate: Timestamp.fromDate(cohortData.endDate),
        currentStudents: cohortData.currentStudents || 0,
        status: cohortData.status || 'upcoming',
        isActive: cohortData.isActive || false,
        enrollmentDeadline: cohortData.enrollmentDeadline ? Timestamp.fromDate(cohortData.enrollmentDeadline) : null,
        pricing: processedPricing,
        coupons: processedCoupons,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const cohortRef = await addDoc(collection(db, 'cohorts'), cohortDataWithTimestamps);
      console.log('✅ Cohort created successfully:', cohortRef.id);
      
      // Create lesson releases for all lessons in the course
      await this.createLessonReleasesForCohort(cohortRef.id, cohortData.courseId, cohortData.startDate);
      
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

  async deleteCohort(cohortId: string, force: boolean = false): Promise<void> {
    try {
      // Check if there are any enrolled students
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('cohortId', '==', cohortId)
      );
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledStudents = enrollmentsSnapshot.docs.length;
      
      if (enrolledStudents > 0 && !force) {
        throw new Error(`Cannot delete cohort: ${enrolledStudents} student(s) are currently enrolled. Please reassign them to another cohort first.`);
      }
      
      // If force deleting, delete all enrollments for this cohort
      if (enrolledStudents > 0 && force) {
        const batch = writeBatch(db);
        enrollmentsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`⚠️ Force deleted ${enrolledStudents} enrollments for cohort:`, cohortId);
      }
      
      // Delete all lesson releases for this cohort
      const lessonReleasesQuery = query(
        collection(db, 'lessonReleases'),
        where('cohortId', '==', cohortId)
      );
      
      const lessonReleasesSnapshot = await getDocs(lessonReleasesQuery);
      
      // Batch delete lesson releases
      if (!lessonReleasesSnapshot.empty) {
        const batch = writeBatch(db);
        lessonReleasesSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ Deleted ${lessonReleasesSnapshot.docs.length} lesson releases for cohort:`, cohortId);
      }
      
      // Delete the cohort
      await deleteDoc(doc(db, 'cohorts', cohortId));
      console.log(`✅ Cohort ${force ? 'force ' : ''}deleted successfully:`, cohortId);
    } catch (error) {
      console.error('❌ Error deleting cohort:', error);
      throw error;
    }
  },

  async createLessonReleasesForCohort(cohortId: string, courseId: string, startDate: Date): Promise<void> {
    try {
      // Get all lessons for the course
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lesson[];

      if (lessons.length === 0) {
        console.log('⚠️ No lessons found for course:', courseId);
        return;
      }

      // Create lesson releases for each lesson
      const lessonReleases = lessons.map(lesson => {
        // Start with the cohort start date
        const releaseDate = new Date(startDate);
        
        // Add 1 day to fix the 24-hour offset issue
        releaseDate.setDate(releaseDate.getDate() + 1);
        
        // For week 1, release on the cohort start date
        // For subsequent weeks, add the appropriate number of weeks
        if (lesson.weekNumber > 1) {
          releaseDate.setDate(releaseDate.getDate() + (lesson.weekNumber - 1) * 7);
        }
        
        // Set to 8am local time (default release time)
        releaseDate.setHours(8, 0, 0, 0);
        
        return {
          cohortId,
          lessonId: lesson.id,
          courseId,
          weekNumber: lesson.weekNumber,
          releaseDate: Timestamp.fromDate(releaseDate),
          isReleased: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
      });

      // Batch write all lesson releases
      const batch = writeBatch(db);
      lessonReleases.forEach(lessonRelease => {
        const docRef = doc(collection(db, 'lessonReleases'));
        batch.set(docRef, lessonRelease);
      });

      await batch.commit();
      console.log(`✅ Created ${lessonReleases.length} lesson releases for cohort:`, cohortId);
    } catch (error) {
      console.error('❌ Error creating lesson releases:', error);
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

  async getNextUpcomingCohort(courseId?: string): Promise<Cohort | null> {
    try {
      const now = new Date();
      let cohortsQuery;
      
      if (courseId) {
        // Get next upcoming cohort for specific course
        cohortsQuery = query(
          collection(db, 'cohorts'),
          where('courseId', '==', courseId),
          where('startDate', '>', Timestamp.fromDate(now)),
          orderBy('startDate', 'asc'),
          limit(1)
        );
      } else {
        // Get next upcoming cohort across all courses
        cohortsQuery = query(
          collection(db, 'cohorts'),
          where('startDate', '>', Timestamp.fromDate(now)),
          orderBy('startDate', 'asc'),
          limit(1)
        );
      }
      
      const snapshot = await getDocs(cohortsQuery);
      
      if (snapshot.empty) {
        return null;
      }
      
      const cohort = {
        ...snapshot.docs[0].data(),
        id: snapshot.docs[0].id
      } as Cohort;
      
      return cohort;
    } catch (error) {
      console.error('Error getting next upcoming cohort:', error);
      return null;
    }
  },

  // Pricing & Coupon Management Functions

  // Calculate final price for a cohort with optional coupon
  calculateCohortPrice(cohort: Cohort, couponCode?: string): { 
    originalPrice: number;
    finalPrice: number;
    discount: number;
    appliedCoupon?: CohortCoupon;
    appliedEarlyBird?: boolean;
    error?: string;
  } {
    try {
      if (cohort.pricing.isFree) {
        return {
          originalPrice: 0,
          finalPrice: 0,
          discount: 0,
        };
      }

      let basePrice = cohort.pricing.specialOffer && cohort.pricing.specialOffer > 0 
        ? cohort.pricing.specialOffer 
        : cohort.pricing.basePrice;

      let finalPrice = basePrice;
      let discount = 0;
      let appliedCoupon: CohortCoupon | undefined;
      let appliedEarlyBird = false;

      // Apply early bird discount if valid
      const now = new Date();
      if (cohort.pricing.earlyBirdDiscount && 
          cohort.pricing.earlyBirdDiscount.validUntil.toDate() > now) {
        appliedEarlyBird = true;
        if (cohort.pricing.earlyBirdDiscount.type === 'percentage') {
          discount += (finalPrice * cohort.pricing.earlyBirdDiscount.amount / 100);
        } else {
          discount += cohort.pricing.earlyBirdDiscount.amount;
        }
      }

      // Apply coupon if provided
      if (couponCode) {
        const coupon = cohort.coupons.find(c => 
          c.code.toLowerCase() === couponCode.toLowerCase() && 
          c.isActive &&
          c.validFrom.toDate() <= now &&
          c.validUntil.toDate() > now &&
          c.currentUses < c.maxUses
        );

        if (!coupon) {
          return {
            originalPrice: basePrice,
            finalPrice: Math.max(0, finalPrice - discount),
            discount,
            appliedEarlyBird,
            error: 'Invalid or expired coupon code'
          };
        }

        // Check minimum amount requirement
        if (coupon.minAmount && finalPrice < coupon.minAmount) {
          return {
            originalPrice: basePrice,
            finalPrice: Math.max(0, finalPrice - discount),
            discount,
            appliedEarlyBird,
            error: `Minimum purchase amount of ${coupon.minAmount} ${cohort.pricing.currency} required for this coupon`
          };
        }

        appliedCoupon = coupon;
        if (coupon.type === 'percentage') {
          discount += (finalPrice * coupon.value / 100);
        } else {
          discount += coupon.value;
        }
      }

      finalPrice = Math.max(0, finalPrice - discount);

      return {
        originalPrice: basePrice,
        finalPrice,
        discount,
        appliedCoupon,
        appliedEarlyBird,
      };
    } catch (error) {
      console.error('Error calculating cohort price:', error);
      return {
        originalPrice: cohort.pricing.basePrice,
        finalPrice: cohort.pricing.basePrice,
        discount: 0,
        error: 'Error calculating price'
      };
    }
  },

  // Validate and apply coupon (increments usage)
  async applyCoupon(cohortId: string, couponCode: string): Promise<{ success: boolean; message: string; coupon?: CohortCoupon }> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        return { success: false, message: 'Cohort not found' };
      }

      const cohort = { id: cohortDoc.id, ...cohortDoc.data() } as Cohort;
      const now = new Date();
      
      const couponIndex = cohort.coupons.findIndex(c => 
        c.code.toLowerCase() === couponCode.toLowerCase() && 
        c.isActive &&
        c.validFrom.toDate() <= now &&
        c.validUntil.toDate() > now &&
        c.currentUses < c.maxUses
      );

      if (couponIndex === -1) {
        return { success: false, message: 'Invalid or expired coupon code' };
      }

      // Increment coupon usage
      const updatedCoupons = [...cohort.coupons];
      updatedCoupons[couponIndex] = {
        ...updatedCoupons[couponIndex],
        currentUses: updatedCoupons[couponIndex].currentUses + 1
      };

      await updateDoc(doc(db, 'cohorts', cohortId), {
        coupons: updatedCoupons,
        updatedAt: Timestamp.now(),
      });

      return { 
        success: true, 
        message: 'Coupon applied successfully',
        coupon: updatedCoupons[couponIndex]
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, message: 'Error applying coupon' };
    }
  },

  // Add coupon to cohort
  async addCouponToCohort(cohortId: string, coupon: Omit<CohortCoupon, 'currentUses'>): Promise<boolean> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        throw new Error('Cohort not found');
      }

      const cohort = { id: cohortDoc.id, ...cohortDoc.data() } as Cohort;
      const newCoupon: CohortCoupon = {
        ...coupon,
        currentUses: 0,
        validFrom: Timestamp.fromDate(new Date(coupon.validFrom as any)),
        validUntil: Timestamp.fromDate(new Date(coupon.validUntil as any)),
      };

      const updatedCoupons = [...cohort.coupons, newCoupon];

      await updateDoc(doc(db, 'cohorts', cohortId), {
        coupons: updatedCoupons,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Coupon added to cohort successfully');
      return true;
    } catch (error) {
      console.error('❌ Error adding coupon to cohort:', error);
      throw error;
    }
  },

  // Remove coupon from cohort
  async removeCouponFromCohort(cohortId: string, couponCode: string): Promise<boolean> {
    try {
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      if (!cohortDoc.exists()) {
        throw new Error('Cohort not found');
      }

      const cohort = { id: cohortDoc.id, ...cohortDoc.data() } as Cohort;
      const updatedCoupons = cohort.coupons.filter(c => c.code !== couponCode);

      await updateDoc(doc(db, 'cohorts', cohortId), {
        coupons: updatedCoupons,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Coupon removed from cohort successfully');
      return true;
    } catch (error) {
      console.error('❌ Error removing coupon from cohort:', error);
      throw error;
    }
  },

  // Update cohort pricing
  async updateCohortPricing(cohortId: string, pricing: CohortPricing): Promise<boolean> {
    try {
      const processedPricing = {
        ...pricing,
        earlyBirdDiscount: pricing.earlyBirdDiscount ? {
          ...pricing.earlyBirdDiscount,
          validUntil: Timestamp.fromDate(new Date(pricing.earlyBirdDiscount.validUntil as any))
        } : undefined
      };

      await updateDoc(doc(db, 'cohorts', cohortId), {
        pricing: processedPricing,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Cohort pricing updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating cohort pricing:', error);
      throw error;
    }
  },
}; 