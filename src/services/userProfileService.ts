import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { User, LessonProgress, Enrollment } from '../types';
import { userCacheService } from './userCacheService';

export interface ExtendedProfile {
  userId: string;
  firstName: string;
  lastName: string;
  bio: string;
  age: number;
  location: string;
  goals: string[];
  preferences: {
    emailNotifications: boolean;
    weeklyDigest: boolean;
    scientificUpdates: boolean;
    communityUpdates: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CohortComparison {
  isAhead: boolean;
  isBehind: boolean;
  percentageDifference: number;
}

export interface UserProgress {
  coursesCompleted: number;
  lessonsCompleted: number;
  totalLessons: number;
  availableLessons: number;
  streakDays: number;
  achievements: string[];
  totalWatchTime: number; // in minutes
  lastActivity: Timestamp;
  cohortComparison?: CohortComparison;
}

export interface UserAchievement {
  id: string;
  userId: string;
  type: 'lesson_complete' | 'course_complete' | 'streak' | 'engagement' | 'milestone';
  title: string;
  description: string;
  earnedAt: Timestamp;
  icon?: string;
}

export const userProfileService = {
  // Get extended profile data from userProfiles collection
  async getExtendedProfile(userId: string): Promise<ExtendedProfile | null> {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        
        // Convert profile data to ExtendedProfile format
        const extendedProfile: ExtendedProfile = {
          userId: userId,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          age: profileData.age || 0,
          location: profileData.location || '',
          goals: profileData.goals || ['Improve energy levels', 'Build sustainable habits'],
          preferences: {
            emailNotifications: profileData.preferences?.emailNotifications !== undefined ? profileData.preferences.emailNotifications : true,
            weeklyDigest: profileData.preferences?.weeklyDigest !== undefined ? profileData.preferences.weeklyDigest : true,
            scientificUpdates: profileData.preferences?.scientificUpdates !== undefined ? profileData.preferences.scientificUpdates : true,
            communityUpdates: profileData.preferences?.communityUpdates !== undefined ? profileData.preferences.communityUpdates : false,
          },
          createdAt: profileData.createdAt || Timestamp.now(),
          updatedAt: profileData.updatedAt || Timestamp.now(),
        };
        
        return extendedProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching extended profile:', error);
      throw error;
    }
  },

  // Update extended profile in userProfiles collection
  async updateExtendedProfile(userId: string, profileData: Partial<ExtendedProfile>): Promise<void> {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      
      // Get current profile data to preserve existing preferences
      const profileDoc = await getDoc(profileRef);
      const currentProfileData = profileDoc.exists() ? profileDoc.data() : {};
      
      // Prepare the update data
      const updateData: any = {
        ...profileData,
        updatedAt: Timestamp.now(),
      };
      
      // Handle preferences separately to preserve existing ones
      if (profileData.preferences) {
        updateData.preferences = {
          ...currentProfileData.preferences,
          ...profileData.preferences,
        };
      }
      
      // If this is a new profile, set createdAt
      if (!profileDoc.exists()) {
        updateData.createdAt = Timestamp.now();
      }

      console.log('🔄 Updating profile with data:', updateData);
      
      if (profileDoc.exists()) {
        await updateDoc(profileRef, updateData);
      } else {
        await setDoc(profileRef, updateData);
      }
      
      console.log(`✅ Updated extended profile for user ${userId}`);
    } catch (error) {
      console.error('❌ Error updating extended profile:', error);
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-pictures/${userId}/profile.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user's photoURL in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { photoURL: downloadURL });
      
      console.log(`✅ Profile picture uploaded for user ${userId}`);
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      throw error;
    }
  },

  // Delete profile picture
  async deleteProfilePicture(userId: string): Promise<void> {
    try {
      // Get current user data to find the photo URL
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        if (userData.photoURL) {
          // Extract the file path from the URL
          const urlParts = userData.photoURL.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `profile-pictures/${userId}/${fileName}`;
          
          // Delete from storage
          const storageRef = ref(storage, filePath);
          await deleteObject(storageRef);
          
          // Remove photoURL from user document
          await updateDoc(userRef, { photoURL: null });
          
          console.log(`✅ Profile picture deleted for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting profile picture:', error);
      throw error;
    }
  },

  // Get user progress statistics (now using cache)
  async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      // Use cached progress data
      const cachedProgress = await userCacheService.getCachedProgress(userId);
      
      // Convert cached data to UserProgress format
      return {
        coursesCompleted: cachedProgress.coursesCompleted,
        lessonsCompleted: cachedProgress.lessonsCompleted,
        totalLessons: cachedProgress.totalLessons,
        availableLessons: cachedProgress.availableLessons,
        streakDays: cachedProgress.currentStreak,
        achievements: cachedProgress.recentAchievements,
        totalWatchTime: cachedProgress.totalWatchTime,
        lastActivity: cachedProgress.lastActivityDate,
        cohortComparison: cachedProgress.cohortComparison ? {
          isAhead: cachedProgress.cohortComparison.isAhead,
          isBehind: cachedProgress.cohortComparison.isBehind,
          percentageDifference: cachedProgress.cohortComparison.percentageDifference,
        } : undefined,
      };
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      // Return default progress data if there's an error
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalLessons: 0,
        availableLessons: 0,
        streakDays: 0,
        achievements: [],
        totalWatchTime: 0,
        lastActivity: Timestamp.now(),
        cohortComparison: undefined,
      };
    }
  },

  // Get user achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId)
      );
      const achievementsDocs = await getDocs(achievementsQuery);
      
      return achievementsDocs.docs.map(doc => doc.data() as UserAchievement);
    } catch (error) {
      console.error('❌ Error fetching user achievements:', error);
      return []; // Return empty array if no achievements found or error
    }
  },

  // Award achievement to user
  async awardAchievement(userId: string, achievement: Omit<UserAchievement, 'id' | 'userId' | 'earnedAt'>): Promise<void> {
    try {
      const achievementRef = doc(collection(db, 'userAchievements'));
      const achievementData: UserAchievement = {
        id: achievementRef.id,
        userId,
        ...achievement,
        earnedAt: Timestamp.now(),
      };

      await setDoc(achievementRef, achievementData);
      console.log(`✅ Awarded achievement "${achievement.title}" to user ${userId}`);
    } catch (error) {
      console.error('❌ Error awarding achievement:', error);
      throw error;
    }
  },

  // Check and award achievements based on progress
  async checkAndAwardAchievements(userId: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      
      // Check for various achievement types
      const achievementsToAward = [];

      // First lesson completed
      if (progress.lessonsCompleted === 1) {
        achievementsToAward.push({
          type: 'lesson_complete' as const,
          title: 'First Lesson',
          description: 'Completed your first lesson',
          icon: '🎯',
        });
      }

      // Week 1 complete (assuming 7 lessons per week)
      if (progress.lessonsCompleted >= 7) {
        achievementsToAward.push({
          type: 'milestone' as const,
          title: 'Week 1 Complete',
          description: 'Completed your first week of lessons',
          icon: '📅',
        });
      }

      // 7-day streak
      if (progress.streakDays >= 7) {
        achievementsToAward.push({
          type: 'streak' as const,
          title: '7-Day Streak',
          description: 'Maintained a 7-day learning streak',
          icon: '🔥',
        });
      }

      // Course completed
      if (progress.coursesCompleted >= 1) {
        achievementsToAward.push({
          type: 'course_complete' as const,
          title: 'Course Champion',
          description: 'Completed your first course',
          icon: '🏆',
        });
      }

      // Award achievements
      for (const achievement of achievementsToAward) {
        await this.awardAchievement(userId, achievement);
      }
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
    }
  },

  // Export user data
  async exportUserData(userId: string): Promise<any> {
    try {
      const [user, extendedProfile, progress, achievements] = await Promise.all([
        getDoc(doc(db, 'users', userId)),
        this.getExtendedProfile(userId),
        this.getUserProgress(userId),
        this.getUserAchievements(userId),
      ]);

      return {
        user: user.exists() ? user.data() : null,
        extendedProfile,
        progress,
        achievements,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error exporting user data:', error);
      throw error;
    }
  },

  // Delete user account and all associated data
  async deleteUserAccount(userId: string): Promise<void> {
    try {
      // Note: This is a simplified version. In production, you'd want to:
      // 1. Delete user from Firebase Auth
      // 2. Delete all user data from Firestore
      // 3. Handle any external service cleanup (Stripe, etc.)
      
      const collectionsToDelete = [
        'users',
        'userProfiles', 
        'lessonProgress',
        'userAchievements',
        'enrollments',
        'questions',
      ];

      for (const collectionName of collectionsToDelete) {
        const userDocsQuery = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );
        const userDocs = await getDocs(userDocsQuery);
        
        // Note: In production, you'd use a Cloud Function to handle bulk deletions
        console.log(`Would delete ${userDocs.docs.length} documents from ${collectionName}`);
      }

      console.log(`✅ User account deletion requested for ${userId}`);
    } catch (error) {
      console.error('❌ Error deleting user account:', error);
      throw error;
    }
  },
}; 