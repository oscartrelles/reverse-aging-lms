import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User } from '../types';

// User management interfaces
export interface UserFilters {
  role?: 'user' | 'moderator' | 'admin';
  status?: 'active' | 'disabled' | 'suspended';
  emailVerified?: boolean;
  createdAt?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
  emailVerified?: boolean;
  isDisabled?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateUserData {
  name?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
  email?: string; // Added email field for GDPR compliance
  isAdmin?: boolean;
  isModerator?: boolean;
  emailVerified?: boolean;
  isDisabled?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  metadata?: Record<string, any>;
  updatedAt?: Timestamp;
}

export interface UserDataExport {
  userId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isModerator: boolean;
  emailVerified: boolean;
  isDisabled: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
  enrollments?: any[];
  profile?: any;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  verifiedUsers: number;
  usersByRole: {
    user: number;
    moderator: number;
    admin: number;
  };
  usersByStatus: {
    active: number;
    disabled: number;
    suspended: number;
  };
  recentSignups: number;
  averageUserAge: number;
}

// Centralized user management service
export const userManagementService = {
  /**
   * Get all users with optional filtering
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      let usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      // Apply filters
      if (filters?.role) {
        const roleField = filters.role === 'admin' ? 'isAdmin' : filters.role === 'moderator' ? 'isModerator' : null;
        if (roleField) {
          usersQuery = query(usersQuery, where(roleField, '==', true));
        }
      }
      
      if (filters?.status) {
        const statusField = filters.status === 'disabled' ? 'isDisabled' : 
                           filters.status === 'suspended' ? 'isSuspended' : null;
        if (statusField) {
          usersQuery = query(usersQuery, where(statusField, '==', true));
        } else if (filters.status === 'active') {
          // Active users are neither disabled nor suspended
          usersQuery = query(
            usersQuery, 
            where('isDisabled', '==', false),
            where('isSuspended', '==', false)
          );
        }
      }
      
      if (filters?.emailVerified !== undefined) {
        usersQuery = query(usersQuery, where('emailVerified', '==', filters.emailVerified));
      }
      
      const snapshot = await getDocs(usersQuery);
      let users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      // Apply search filter in memory
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        users = users.filter(user => 
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply date range filter in memory
      if (filters?.createdAt) {
        users = users.filter(user => {
          const userDate = user.createdAt?.toDate();
          if (!userDate) return false;
          return userDate >= filters.createdAt!.start && userDate <= filters.createdAt!.end;
        });
      }
      
      return users;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
  },

  /**
   * Get a single user by ID
   */
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
      console.error('❌ Error getting user:', error);
      throw error;
    }
  },

  /**
   * Update user data
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error(`User not found: ${userId}`);
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(userRef, updateData);
      console.log('✅ User updated successfully');
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete a user (soft delete by setting isDisabled = true)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, {
        isDisabled: true,
        isSuspended: false,
        isAdmin: false,
        isModerator: false
      });
      console.log('✅ User deleted successfully (soft delete)');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Permanently delete a user (hard delete)
   */
  async permanentlyDeleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      console.log('✅ User permanently deleted');
    } catch (error) {
      console.error('❌ Error permanently deleting user:', error);
      throw error;
    }
  },

  /**
   * Enable a user account
   */
  async enableUser(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, {
        isDisabled: false,
        isSuspended: false,
        suspensionReason: undefined
      });
      console.log('✅ User enabled successfully');
    } catch (error) {
      console.error('❌ Error enabling user:', error);
      throw error;
    }
  },

  /**
   * Disable a user account
   */
  async disableUser(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, {
        isDisabled: true,
        isSuspended: false,
        suspensionReason: undefined
      });
      console.log('✅ User disabled successfully');
    } catch (error) {
      console.error('❌ Error disabling user:', error);
      throw error;
    }
  },

  /**
   * Suspend a user account
   */
  async suspendUser(userId: string, reason: string): Promise<void> {
    try {
      await this.updateUser(userId, {
        isSuspended: true,
        isDisabled: false,
        suspensionReason: reason
      });
      console.log('✅ User suspended successfully');
    } catch (error) {
      console.error('❌ Error suspending user:', error);
      throw error;
    }
  },

  /**
   * Reactivate a suspended user
   */
  async reactivateUser(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, {
        isSuspended: false,
        suspensionReason: undefined
      });
      console.log('✅ User reactivated successfully');
    } catch (error) {
      console.error('❌ Error reactivating user:', error);
      throw error;
    }
  },

  /**
   * Set user role
   */
  async setUserRole(userId: string, role: 'user' | 'moderator' | 'admin'): Promise<void> {
    try {
      const roleUpdates: UpdateUserData = {
        isAdmin: role === 'admin',
        isModerator: role === 'moderator'
      };
      
      await this.updateUser(userId, roleUpdates);
      console.log(`✅ User role set to ${role} successfully`);
    } catch (error) {
      console.error('❌ Error setting user role:', error);
      throw error;
    }
  },

  /**
   * Remove user role (set to regular user)
   */
  async removeUserRole(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, {
        isAdmin: false,
        isModerator: false
      });
      console.log('✅ User role removed successfully');
    } catch (error) {
      console.error('❌ Error removing user role:', error);
      throw error;
    }
  },

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      const roles: string[] = ['user'];
      if (user.isAdmin) roles.push('admin');
      if (user.isModerator) roles.push('moderator');
      
      return roles;
    } catch (error) {
      console.error('❌ Error getting user roles:', error);
      throw error;
    }
  },

  /**
   * Verify user email
   */
  async verifyUserEmail(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, { emailVerified: true });
      console.log('✅ User email verified successfully');
    } catch (error) {
      console.error('❌ Error verifying user email:', error);
      throw error;
    }
  },

  /**
   * Require email verification
   */
  async requireEmailVerification(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, { emailVerified: false });
      console.log('✅ Email verification required for user');
    } catch (error) {
      console.error('❌ Error requiring email verification:', error);
      throw error;
    }
  },

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      // Get additional data from other collections
      const [enrollments, profile] = await Promise.all([
        this.getUserEnrollments(userId),
        this.getUserProfile(userId)
      ]);
      
      const userExport: UserDataExport = {
        userId: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin || false,
        isModerator: user.isModerator || false,
        emailVerified: user.emailVerified || false,
        isDisabled: user.isDisabled || false,
        isSuspended: user.isSuspended || false,
        suspensionReason: user.suspensionReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || Timestamp.now(),
        metadata: user.metadata,
        enrollments,
        profile
      };
      
      return userExport;
    } catch (error) {
      console.error('❌ Error exporting user data:', error);
      throw error;
    }
  },

  /**
   * Delete all user data (GDPR compliance)
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      // This would typically involve deleting data from multiple collections
      // For now, we'll just disable the user and clear sensitive data
      await this.updateUser(userId, {
        isDisabled: true,
        isSuspended: true,
        email: `deleted_${userId}@deleted.com`,
        name: 'Deleted User',
        firstName: undefined,
        lastName: undefined,
        phoneNumber: undefined,
        photoURL: undefined,
        metadata: { deletedAt: Timestamp.now() }
      });
      console.log('✅ User data deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user data:', error);
      throw error;
    }
  },

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<void> {
    try {
      const updatePromises = userIds.map(userId => this.updateUser(userId, updates));
      await Promise.all(updatePromises);
      console.log(`✅ Bulk updated ${userIds.length} users successfully`);
    } catch (error) {
      console.error('❌ Error bulk updating users:', error);
      throw error;
    }
  },

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    try {
      const deletePromises = userIds.map(userId => this.deleteUser(userId));
      await Promise.all(deletePromises);
      console.log(`✅ Bulk deleted ${userIds.length} users successfully`);
    } catch (error) {
      console.error('❌ Error bulk deleting users:', error);
      throw error;
    }
  },

  /**
   * Get user analytics
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const users = await this.getUsers();
      
      const analytics: UserAnalytics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => !u.isDisabled && !u.isSuspended).length,
        disabledUsers: users.filter(u => u.isDisabled).length,
        suspendedUsers: users.filter(u => u.isSuspended).length,
        adminUsers: users.filter(u => u.isAdmin).length,
        moderatorUsers: users.filter(u => u.isModerator).length,
        verifiedUsers: users.filter(u => u.emailVerified).length,
        usersByRole: {
          user: users.filter(u => !u.isAdmin && !u.isModerator).length,
          moderator: users.filter(u => u.isModerator).length,
          admin: users.filter(u => u.isAdmin).length
        },
        usersByStatus: {
          active: users.filter(u => !u.isDisabled && !u.isSuspended).length,
          disabled: users.filter(u => u.isDisabled).length,
          suspended: users.filter(u => u.isSuspended).length
        },
        recentSignups: users.filter(u => {
          const userDate = u.createdAt?.toDate();
          if (!userDate) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return userDate >= weekAgo;
        }).length,
        averageUserAge: 0 // Would need to calculate from user data
      };
      
      return analytics;
    } catch (error) {
      console.error('❌ Error getting user analytics:', error);
      throw error;
    }
  },

  /**
   * Set up real-time listener for all users
   */
  subscribeToUsers(callback: (users: User[]) => void): () => void {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      callback(users);
    });
    
    return unsubscribe;
  },

  /**
   * Set up real-time listener for a specific user
   */
  subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const user = {
          id: doc.id,
          ...doc.data()
        } as User;
        callback(user);
      } else {
        callback(null);
      }
    });
    
    return unsubscribe;
  },

  // Helper methods
  async getUserEnrollments(userId: string): Promise<any[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }
  },

  async getUserProfile(userId: string): Promise<any | null> {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        return {
          id: profileDoc.id,
          ...profileDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}; 