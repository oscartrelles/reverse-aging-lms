import { doc, setDoc, collection, query, where, getDocs, orderBy, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Question } from '../types';

export interface CreateQuestionData {
  userId: string;
  lessonId: string;
  courseId: string;
  question: string;
  isPublic?: boolean;
}

export const questionService = {
  // Create a new question for a specific lesson
  async createQuestion(questionData: CreateQuestionData): Promise<string> {
    try {
      const questionRef = await addDoc(collection(db, 'questions'), {
        ...questionData,
        isAnswered: false,
        isPublic: questionData.isPublic ?? true,
        createdAt: Timestamp.now(),
      });
      
      console.log(`✅ Created question for lesson ${questionData.lessonId}`);
      return questionRef.id;
    } catch (error) {
      console.error('❌ Error creating question:', error);
      throw error;
    }
  },

  // Get questions for a specific lesson
  async getLessonQuestions(lessonId: string, includePrivate: boolean = false): Promise<Question[]> {
    try {
      let questionsQuery;
      
      if (includePrivate) {
        questionsQuery = query(
          collection(db, 'questions'),
          where('lessonId', '==', lessonId),
          orderBy('createdAt', 'desc')
        );
      } else {
        questionsQuery = query(
          collection(db, 'questions'),
          where('lessonId', '==', lessonId),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(questionsQuery);
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];
      
      return questions;
    } catch (error: any) {
      console.error('❌ Error getting lesson questions:', error);
      
      // If it's an index error, return empty array for now
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('⚠️ Index not ready yet, returning empty questions array');
        return [];
      }
      
      throw error;
    }
  },

  // Get user's questions for a specific lesson
  async getUserLessonQuestions(userId: string, lessonId: string): Promise<Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'questions'),
        where('userId', '==', userId),
        where('lessonId', '==', lessonId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(questionsQuery);
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];
      
      return questions;
    } catch (error: any) {
      console.error('❌ Error getting user lesson questions:', error);
      
      // If it's an index error, return empty array for now
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('⚠️ Index not ready yet, returning empty questions array');
        return [];
      }
      
      throw error;
    }
  },

  // Get recent questions for a course (for dashboard display)
  async getRecentCourseQuestions(courseId: string, limit: number = 5): Promise<Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'questions'),
        where('courseId', '==', courseId),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(questionsQuery);
      const questions = snapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Question[];
      
      return questions;
    } catch (error: any) {
      console.error('❌ Error getting recent course questions:', error);
      
      // If it's an index error, return empty array for now
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('⚠️ Index not ready yet, returning empty questions array');
        return [];
      }
      
      throw error;
    }
  },

  // Answer a question (admin function)
  async answerQuestion(questionId: string, answer: string): Promise<void> {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await setDoc(questionRef, {
        answer,
        isAnswered: true,
        answeredAt: Timestamp.now(),
      }, { merge: true });
      
      console.log(`✅ Answered question ${questionId}`);
    } catch (error) {
      console.error('❌ Error answering question:', error);
      throw error;
    }
  },

  // Get question statistics for a lesson
  async getLessonQuestionStats(lessonId: string): Promise<{
    totalQuestions: number;
    answeredQuestions: number;
    unansweredQuestions: number;
  }> {
    try {
      const questionsQuery = query(
        collection(db, 'questions'),
        where('lessonId', '==', lessonId),
        where('isPublic', '==', true)
      );
      
      const snapshot = await getDocs(questionsQuery);
      const questions = snapshot.docs.map(doc => doc.data()) as Question[];
      
      const totalQuestions = questions.length;
      const answeredQuestions = questions.filter(q => q.isAnswered).length;
      const unansweredQuestions = totalQuestions - answeredQuestions;
      
      return {
        totalQuestions,
        answeredQuestions,
        unansweredQuestions,
      };
    } catch (error) {
      console.error('❌ Error getting lesson question stats:', error);
      throw error;
    }
  },
}; 