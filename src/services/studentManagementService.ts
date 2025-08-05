import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, Enrollment, Cohort, Lesson, LessonProgress, Question } from '../types';
import { enrollmentService } from './enrollmentService';

// Student management interfaces
export interface StudentFilters {
  courseId?: string;
  cohortId?: string;
  enrollmentStatus?: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  progressLevel?: 'beginner' | 'intermediate' | 'advanced';
  lastActivity?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface StudentData {
  userId: string;
  user: User;
  enrollment: Enrollment;
  cohort: Cohort;
  progress: {
    lessonsCompleted: number;
    totalLessons: number;
    completionPercentage: number;
    currentWeek: number;
    lastActivity: Timestamp;
    streak: number;
    isOnTrack: boolean;
    isAhead: boolean;
    isBehind: boolean;
  };
  academic: {
    questionsAsked: number;
    questionsAnswered: number;
    communityParticipation: number;
    averageLessonRating?: number;
  };
}

export interface StudentAnalytics {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  studentsByCourse: Record<string, number>;
  studentsByCohort: Record<string, number>;
  averageCompletionRate: number;
  averageProgress: number;
  topPerformers: StudentData[];
  strugglingStudents: StudentData[];
  recentGraduates: StudentData[];
  engagementMetrics: {
    averageQuestionsPerStudent: number;
    averageCommunityParticipation: number;
    averageStreak: number;
  };
}

export interface AcademicReport {
  studentId: string;
  courseId: string;
  cohortId: string;
  reportDate: Timestamp;
  progress: {
    lessonsCompleted: number;
    totalLessons: number;
    completionPercentage: number;
    currentWeek: number;
    weeksRemaining: number;
    isOnTrack: boolean;
    isAhead: boolean;
    isBehind: boolean;
  };
  performance: {
    averageWatchTime: number;
    questionsAsked: number;
    questionsAnswered: number;
    communityParticipation: number;
    lastActivity: Timestamp;
    streak: number;
  };
  recommendations: string[];
}

// Centralized student management service
export const studentManagementService = {
  /**
   * Get all students with optional filtering
   */
  async getStudents(filters?: StudentFilters): Promise<StudentData[]> {
    try {
      // Get all enrollments first
      let enrollments = await enrollmentService.getAllEnrollments();
      
      // Apply enrollment filters
      if (filters?.courseId) {
        enrollments = enrollments.filter(e => e.courseId === filters.courseId);
      }
      
      if (filters?.cohortId) {
        enrollments = enrollments.filter(e => e.cohortId === filters.cohortId);
      }
      
      if (filters?.enrollmentStatus) {
        enrollments = enrollments.filter(e => e.status === filters.enrollmentStatus);
      }
      
      if (filters?.paymentStatus) {
        enrollments = enrollments.filter(e => e.paymentStatus === filters.paymentStatus);
      }
      
      // Get user data for each enrollment
      const studentDataPromises = enrollments.map(async (enrollment) => {
        try {
          // Skip enrollments without cohortId
          if (!enrollment.cohortId) {
            console.warn(`Skipping enrollment ${enrollment.id} - missing cohortId`);
            return null;
          }
          
          const [user, cohort, progress] = await Promise.all([
            this.getUser(enrollment.userId),
            this.getCohort(enrollment.cohortId),
            this.getStudentProgress(enrollment.userId, enrollment.courseId)
          ]);
          
          if (!user || !cohort) return null;
          
          const academic = await this.getStudentAcademicData(enrollment.userId, enrollment.courseId);
          
          return {
            userId: enrollment.userId,
            user,
            enrollment,
            cohort,
            progress,
            academic
          } as StudentData;
        } catch (error) {
          console.error(`Error getting student data for ${enrollment.userId}:`, error);
          return null;
        }
      });
      
      let students = (await Promise.all(studentDataPromises)).filter(Boolean) as StudentData[];
      
      // Apply progress level filter
      if (filters?.progressLevel) {
        students = students.filter(student => {
          const percentage = student.progress.completionPercentage;
          switch (filters.progressLevel) {
            case 'beginner': return percentage < 33;
            case 'intermediate': return percentage >= 33 && percentage < 66;
            case 'advanced': return percentage >= 66;
            default: return true;
          }
        });
      }
      
      // Apply last activity filter
      if (filters?.lastActivity) {
        students = students.filter(student => {
          const lastActivity = student.progress.lastActivity?.toDate();
          if (!lastActivity) return false;
          return lastActivity >= filters.lastActivity!.start && lastActivity <= filters.lastActivity!.end;
        });
      }
      
      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        students = students.filter(student => 
          student.user.name?.toLowerCase().includes(searchTerm) ||
          student.user.email?.toLowerCase().includes(searchTerm) ||
          student.user.firstName?.toLowerCase().includes(searchTerm) ||
          student.user.lastName?.toLowerCase().includes(searchTerm)
        );
      }
      
      return students;
    } catch (error) {
      console.error('❌ Error getting students:', error);
      throw error;
    }
  },

  /**
   * Get a single student by user ID
   */
  async getStudent(userId: string): Promise<StudentData | null> {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(userId);
      const activeEnrollment = enrollments.find(e => e.status === 'active' || e.status === 'pending');
      if (!activeEnrollment) return null;
      
      // Skip enrollments without cohortId
      if (!activeEnrollment.cohortId) {
        console.warn(`Skipping enrollment ${activeEnrollment.id} - missing cohortId`);
        return null;
      }
      
      const [user, cohort, progress] = await Promise.all([
        this.getUser(userId),
        this.getCohort(activeEnrollment.cohortId),
        this.getStudentProgress(userId, activeEnrollment.courseId)
      ]);
      
      if (!user || !cohort) return null;
      
      const academic = await this.getStudentAcademicData(userId, activeEnrollment.courseId);
      
      return {
        userId,
        user,
        enrollment: activeEnrollment as Enrollment,
        cohort,
        progress,
        academic
      } as StudentData;
    } catch (error) {
      console.error('Error getting student:', error);
      return null;
    }
  },

  /**
   * Get students by course
   */
  async getStudentsByCourse(courseId: string): Promise<StudentData[]> {
    try {
      return await this.getStudents({ courseId });
    } catch (error) {
      console.error('❌ Error getting students by course:', error);
      throw error;
    }
  },

  /**
   * Get students by cohort
   */
  async getStudentsByCohort(cohortId: string): Promise<StudentData[]> {
    try {
      return await this.getStudents({ cohortId });
    } catch (error) {
      console.error('❌ Error getting students by cohort:', error);
      throw error;
    }
  },

  /**
   * Get struggling students (behind schedule)
   */
  async getStrugglingStudents(): Promise<StudentData[]> {
    try {
      const students = await this.getStudents();
      return students.filter(student => {
        // Only consider students in active cohorts
        if (student.cohort.status !== 'active') {
          return false;
        }
        
        const isBehind = student.progress.isBehind;
        const lowEngagement = student.progress.lastActivity && 
          student.progress.lastActivity.toDate() < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        return isBehind || lowEngagement;
      });
    } catch (error) {
      console.error('❌ Error getting struggling students:', error);
      throw error;
    }
  },

  /**
   * Get top performing students
   */
  async getTopPerformers(limit: number = 10): Promise<StudentData[]> {
    try {
      const students = await this.getStudents();
      return students
        .filter(student => student.cohort.status === 'active') // Only consider students in active cohorts
        .sort((a, b) => b.progress.completionPercentage - a.progress.completionPercentage)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting top performers:', error);
      throw error;
    }
  },

  /**
   * Enroll a user in a course cohort
   */
  async enrollStudent(userId: string, courseId: string, cohortId: string, options?: {
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<string> {
    try {
      const enrollmentId = await enrollmentService.createEnrollment({
        userId,
        courseId,
        cohortId,
        status: 'active',
        paymentStatus: options?.paymentStatus || 'pending',
        stripeCustomerId: options?.stripeCustomerId,
        stripeSubscriptionId: options?.stripeSubscriptionId
      });
      
      console.log('✅ Student enrolled successfully');
      return enrollmentId;
    } catch (error) {
      console.error('❌ Error enrolling student:', error);
      throw error;
    }
  },

  /**
   * Unenroll a student from a course
   */
  async unenrollStudent(userId: string, courseId: string): Promise<void> {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(userId);
      const activeEnrollment = enrollments.find(e => 
        (e.status === 'active' || e.status === 'pending') && e.courseId === courseId
      );
      if (activeEnrollment && activeEnrollment.id) {
        await enrollmentService.cancelEnrollment(activeEnrollment.id);
        console.log('✅ Student unenrolled successfully');
      } else {
        throw new Error('No active enrollment found for this course');
      }
    } catch (error) {
      console.error('❌ Error unenrolling student:', error);
      throw error;
    }
  },

  /**
   * Transfer student to different cohort
   */
  async transferStudent(userId: string, newCohortId: string): Promise<void> {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(userId);
      const activeEnrollment = enrollments.find(e => e.status === 'active' || e.status === 'pending');
      if (!activeEnrollment || !activeEnrollment.id) {
        throw new Error('No active enrollment found');
      }
      
      await enrollmentService.updateEnrollment(activeEnrollment.id, {
        cohortId: newCohortId
      });
      
      console.log('✅ Student transferred successfully');
    } catch (error) {
      console.error('❌ Error transferring student:', error);
      throw error;
    }
  },

  /**
   * Mark student as completed
   */
  async completeStudent(userId: string): Promise<void> {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(userId);
      const activeEnrollment = enrollments.find(e => e.status === 'active' || e.status === 'pending');
      if (!activeEnrollment || !activeEnrollment.id) {
        throw new Error('No active enrollment found');
      }
      
      await enrollmentService.completeEnrollment(activeEnrollment.id);
      console.log('✅ Student marked as completed');
    } catch (error) {
      console.error('❌ Error completing student:', error);
      throw error;
    }
  },

  /**
   * Get student progress
   */
  async getStudentProgress(userId: string, courseId: string): Promise<{
    lessonsCompleted: number;
    totalLessons: number;
    completionPercentage: number;
    currentWeek: number;
    lastActivity: Timestamp;
    streak: number;
    isOnTrack: boolean;
    isAhead: boolean;
    isBehind: boolean;
  }> {
    try {
      const [lessonProgress, lessons, enrollments] = await Promise.all([
        this.getLessonProgress(userId, courseId),
        this.getCourseLessons(courseId),
        enrollmentService.getUserEnrollments(userId)
      ]);
      
      const enrollment = enrollments.find(e => e.status === 'active' || e.status === 'pending');
      
      const lessonsCompleted = lessonProgress.filter(p => p.isCompleted).length;
      const totalLessons = lessons.length;
      const completionPercentage = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;
      
      // Calculate current week based on enrollment date and course duration
      const currentWeek = enrollment ? this.calculateCurrentWeek(enrollment.enrolledAt) : 1;
      
      // Calculate streak
      const streak = this.calculateStreak(lessonProgress);
      
      // Determine if on track
      const expectedProgress = this.calculateExpectedProgress(enrollment?.enrolledAt);
      const isOnTrack = Math.abs(completionPercentage - expectedProgress) <= 10;
      const isAhead = completionPercentage > expectedProgress + 10;
      const isBehind = completionPercentage < expectedProgress - 10;
      
      return {
        lessonsCompleted,
        totalLessons,
        completionPercentage,
        currentWeek,
        lastActivity: this.getLastActivity(lessonProgress),
        streak,
        isOnTrack,
        isAhead,
        isBehind
      };
    } catch (error) {
      console.error('❌ Error getting student progress:', error);
      throw error;
    }
  },

  /**
   * Get student academic data
   */
  async getStudentAcademicData(userId: string, courseId: string): Promise<{
    questionsAsked: number;
    questionsAnswered: number;
    communityParticipation: number;
    averageLessonRating?: number;
  }> {
    try {
      const [questions, lessonProgress] = await Promise.all([
        this.getStudentQuestions(userId, courseId),
        this.getLessonProgress(userId, courseId)
      ]);
      
      const questionsAsked = questions.length;
      const questionsAnswered = questions.filter(q => q.isAnswered).length;
      const communityParticipation = this.calculateCommunityParticipation(questions, lessonProgress);
      
      return {
        questionsAsked,
        questionsAnswered,
        communityParticipation
      };
    } catch (error) {
      console.error('❌ Error getting student academic data:', error);
      throw error;
    }
  },

  /**
   * Generate academic report for student
   */
  async generateAcademicReport(userId: string): Promise<AcademicReport | null> {
    try {
      const student = await this.getStudent(userId);
      if (!student) return null;
      
      const progress = await this.getStudentProgress(userId, student.enrollment.courseId);
      const academic = await this.getStudentAcademicData(userId, student.enrollment.courseId);
      
      const weeksRemaining = this.calculateWeeksRemaining(student.cohort.endDate);
      const recommendations = this.generateRecommendations(progress, academic);
      
      const report: AcademicReport = {
        studentId: userId,
        courseId: student.enrollment.courseId,
        cohortId: student.enrollment.cohortId,
        reportDate: Timestamp.now(),
        progress: {
          lessonsCompleted: progress.lessonsCompleted,
          totalLessons: progress.totalLessons,
          completionPercentage: progress.completionPercentage,
          currentWeek: progress.currentWeek,
          weeksRemaining,
          isOnTrack: progress.isOnTrack,
          isAhead: progress.isAhead,
          isBehind: progress.isBehind
        },
        performance: {
          averageWatchTime: 0, // Would need to calculate from lesson progress
          questionsAsked: academic.questionsAsked,
          questionsAnswered: academic.questionsAnswered,
          communityParticipation: academic.communityParticipation,
          lastActivity: progress.lastActivity,
          streak: progress.streak
        },
        recommendations
      };
      
      return report;
    } catch (error) {
      console.error('❌ Error generating academic report:', error);
      throw error;
    }
  },

  /**
   * Get student analytics
   */
  async getStudentAnalytics(): Promise<StudentAnalytics> {
    try {
      const students = await this.getStudents();
      
      const analytics: StudentAnalytics = {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.enrollment.status === 'active').length,
        completedStudents: students.filter(s => s.enrollment.status === 'completed').length,
        studentsByCourse: this.groupStudentsByCourse(students),
        studentsByCohort: this.groupStudentsByCohort(students),
        averageCompletionRate: this.calculateAverageCompletionRate(students),
        averageProgress: this.calculateAverageProgress(students),
        topPerformers: await this.getTopPerformers(5),
        strugglingStudents: await this.getStrugglingStudents(),
        recentGraduates: students.filter(s => s.enrollment.status === 'completed' && s.cohort.status === 'active').slice(0, 5),
        engagementMetrics: this.calculateEngagementMetrics(students)
      };
      
      return analytics;
    } catch (error) {
      console.error('❌ Error getting student analytics:', error);
      throw error;
    }
  },

  /**
   * Set up real-time listener for students
   */
  subscribeToStudents(callback: (students: StudentData[]) => void): () => void {
    // Subscribe to enrollments and update student data accordingly
    const unsubscribe = enrollmentService.subscribeToAllEnrollments(async (enrollments) => {
      try {
        const activeEnrollments = enrollments.filter(e => e.status === 'active' || e.status === 'pending');
        const students = await Promise.all(
          activeEnrollments.map(enrollment => this.getStudent(enrollment.userId))
        );
        const validStudents = students.filter(Boolean) as StudentData[];
        callback(validStudents);
      } catch (error) {
        console.error('Error updating students subscription:', error);
      }
    });
    
    return unsubscribe;
  },

  /**
   * Set up real-time listener for a specific student
   */
  subscribeToStudent(userId: string, callback: (student: StudentData | null) => void): () => void {
    const unsubscribe = enrollmentService.subscribeToUserEnrollments(userId, async (enrollments) => {
      try {
        const activeEnrollment = enrollments.find(e => e.status === 'active' || e.status === 'pending');
        if (activeEnrollment) {
          const student = await this.getStudent(userId);
          callback(student);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error updating student subscription:', error);
        callback(null);
      }
    });
    
    return unsubscribe;
  },

  // Helper methods
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async getCohort(cohortId: string): Promise<Cohort | null> {
    try {
      if (!cohortId) {
        console.warn('getCohort called with undefined or null cohortId');
        return null;
      }
      
      const cohortRef = doc(db, 'cohorts', cohortId);
      const cohortDoc = await getDoc(cohortRef);
      
      if (cohortDoc.exists()) {
        const data = cohortDoc.data();
        return {
          id: cohortDoc.id, // Use the document ID as the cohort ID
          ...data
        } as Cohort;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cohort:', error);
      return null;
    }
  },

  async getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    try {
      const progressQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LessonProgress[];
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return [];
    }
  },

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
        orderBy('order')
      );
      const snapshot = await getDocs(lessonsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lesson[];
    } catch (error) {
      console.error('Error getting course lessons:', error);
      return [];
    }
  },

  async getStudentQuestions(userId: string, courseId: string): Promise<Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'questions'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(questionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
    } catch (error) {
      console.error('Error getting student questions:', error);
      return [];
    }
  },

  calculateCurrentWeek(enrolledAt: Timestamp): number {
    const now = new Date();
    const enrollmentDate = enrolledAt.toDate();
    const weeksDiff = Math.floor((now.getTime() - enrollmentDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, weeksDiff + 1);
  },

  calculateStreak(lessonProgress: LessonProgress[]): number {
    // Simple streak calculation - could be enhanced
    const completedLessons = lessonProgress
      .filter(p => p.isCompleted)
      .sort((a, b) => b.completedAt!.toMillis() - a.completedAt!.toMillis());
    
    if (completedLessons.length === 0) return 0;
    
    let streak = 1;
    const now = new Date();
    
    for (let i = 1; i < completedLessons.length; i++) {
      const current = completedLessons[i].completedAt!.toDate();
      const previous = completedLessons[i - 1].completedAt!.toDate();
      const dayDiff = Math.floor((previous.getTime() - current.getTime()) / (24 * 60 * 60 * 1000));
      
      if (dayDiff <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  calculateExpectedProgress(enrolledAt?: Timestamp): number {
    if (!enrolledAt) return 0;
    
    const now = new Date();
    const enrollmentDate = enrolledAt.toDate();
    const weeksDiff = (now.getTime() - enrollmentDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    const expectedWeeks = Math.max(0, weeksDiff);
    
    // Assume 12-week course for now
    const totalWeeks = 12;
    return Math.min(100, (expectedWeeks / totalWeeks) * 100);
  },

  getLastActivity(lessonProgress: LessonProgress[]): Timestamp {
    const lastActivity = lessonProgress
      .filter(p => p.lastWatchedAt)
      .sort((a, b) => b.lastWatchedAt!.toMillis() - a.lastWatchedAt!.toMillis())[0];
    
    return lastActivity?.lastWatchedAt || Timestamp.now();
  },

  calculateCommunityParticipation(questions: Question[], lessonProgress: LessonProgress[]): number {
    // Simple participation score based on questions asked and lessons completed
    const questionScore = questions.length * 2;
    const completionScore = lessonProgress.filter(p => p.isCompleted).length * 1;
    return questionScore + completionScore;
  },

  calculateWeeksRemaining(endDate: Timestamp): number {
    const now = new Date();
    const end = endDate.toDate();
    const weeksRemaining = Math.ceil((end.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeksRemaining);
  },

  generateRecommendations(progress: any, academic: any): string[] {
    const recommendations: string[] = [];
    
    if (progress.isBehind) {
      recommendations.push('Consider increasing study time to catch up with the course schedule');
    }
    
    if (progress.streak < 3) {
      recommendations.push('Try to maintain a consistent study routine to build momentum');
    }
    
    if (academic.questionsAsked < 2) {
      recommendations.push('Don\'t hesitate to ask questions in the community forum');
    }
    
    if (academic.communityParticipation < 5) {
      recommendations.push('Engage more with the community to enhance your learning experience');
    }
    
    return recommendations;
  },

  groupStudentsByCourse(students: StudentData[]): Record<string, number> {
    return students.reduce((acc, student) => {
      const courseId = student.enrollment.courseId;
      acc[courseId] = (acc[courseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  groupStudentsByCohort(students: StudentData[]): Record<string, number> {
    return students.reduce((acc, student) => {
      const cohortId = student.enrollment.cohortId;
      acc[cohortId] = (acc[cohortId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  calculateAverageCompletionRate(students: StudentData[]): number {
    if (students.length === 0) return 0;
    const totalRate = students.reduce((sum, student) => sum + student.progress.completionPercentage, 0);
    return totalRate / students.length;
  },

  calculateAverageProgress(students: StudentData[]): number {
    if (students.length === 0) return 0;
    const totalProgress = students.reduce((sum, student) => sum + student.progress.completionPercentage, 0);
    return totalProgress / students.length;
  },

  calculateEngagementMetrics(students: StudentData[]): {
    averageQuestionsPerStudent: number;
    averageCommunityParticipation: number;
    averageStreak: number;
  } {
    if (students.length === 0) {
      return {
        averageQuestionsPerStudent: 0,
        averageCommunityParticipation: 0,
        averageStreak: 0
      };
    }
    
    const totalQuestions = students.reduce((sum, student) => sum + student.academic.questionsAsked, 0);
    const totalParticipation = students.reduce((sum, student) => sum + student.academic.communityParticipation, 0);
    const totalStreak = students.reduce((sum, student) => sum + student.progress.streak, 0);
    
    return {
      averageQuestionsPerStudent: totalQuestions / students.length,
      averageCommunityParticipation: totalParticipation / students.length,
      averageStreak: totalStreak / students.length
    };
  }
}; 