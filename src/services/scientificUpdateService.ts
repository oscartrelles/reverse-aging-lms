import { doc, setDoc, collection, query, where, getDocs, orderBy, Timestamp, addDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ScientificUpdate, UserReadStatus } from '../types';

export interface CreateScientificUpdateData {
  title: string;
  summary: string;
  keyFindings: string[];
  fullReview: string;
  implications: string;
  externalLink?: string | null;
  category: 'Mindset' | 'Nourishment' | 'Breath' | 'Cold' | 'Heat' | 'Movement' | 'Community';
  tags: string[];
  publishedDate: Date;
}

export const scientificUpdateService = {
  // Create a new scientific update
  async createUpdate(updateData: CreateScientificUpdateData): Promise<string> {
    try {
      const updateRef = await addDoc(collection(db, 'scientificUpdates'), {
        ...updateData,
        publishedDate: Timestamp.fromDate(updateData.publishedDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        votes: 0,
        votedBy: [],
        readCount: 0,
        shareCount: 0,
      });
      
      console.log(`✅ Created scientific update: ${updateData.title}`);
      return updateRef.id;
    } catch (error) {
      console.error('❌ Error creating scientific update:', error);
      throw error;
    }
  },

  // Get all scientific updates (with optional filters)
  async getAllUpdates(filters?: {
    category?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ScientificUpdate[]> {
    try {
      let updatesQuery = query(
        collection(db, 'scientificUpdates'),
        orderBy('publishedDate', 'desc')
      );

      // Apply filters if provided
      if (filters?.category) {
        updatesQuery = query(updatesQuery, where('category', '==', filters.category));
      }

      const snapshot = await getDocs(updatesQuery);
      let updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ScientificUpdate[];

      // Apply additional filters in memory
      if (filters?.tags && filters.tags.length > 0) {
        updates = updates.filter(update => 
          filters.tags!.some(tag => update.tags.includes(tag))
        );
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        updates = updates.filter(update =>
          update.title.toLowerCase().includes(searchTerm) ||
          update.summary.toLowerCase().includes(searchTerm) ||
          update.fullReview.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      if (filters?.offset) {
        updates = updates.slice(filters.offset);
      }
      if (filters?.limit) {
        updates = updates.slice(0, filters.limit);
      }

      return updates;
    } catch (error) {
      console.error('❌ Error fetching scientific updates:', error);
      throw error;
    }
  },

  // Get a single scientific update by ID
  async getUpdateById(updateId: string): Promise<ScientificUpdate | null> {
    try {
      const updateDoc = await getDoc(doc(db, 'scientificUpdates', updateId));
      if (!updateDoc.exists()) {
        return null;
      }
      
      return {
        id: updateDoc.id,
        ...updateDoc.data(),
      } as ScientificUpdate;
    } catch (error) {
      console.error('❌ Error fetching scientific update:', error);
      throw error;
    }
  },

  // Update a scientific update
  async updateUpdate(updateId: string, updateData: Partial<CreateScientificUpdateData>): Promise<void> {
    try {
      const updateRef = doc(db, 'scientificUpdates', updateId);
      const dataToUpdate: any = {
        ...updateData,
        updatedAt: Timestamp.now(),
      };

      // Convert publishedDate if provided
      if (updateData.publishedDate) {
        dataToUpdate.publishedDate = Timestamp.fromDate(updateData.publishedDate);
      }

      await updateDoc(updateRef, dataToUpdate);
      console.log(`✅ Updated scientific update: ${updateId}`);
    } catch (error) {
      console.error('❌ Error updating scientific update:', error);
      throw error;
    }
  },

  // Delete a scientific update
  async deleteUpdate(updateId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'scientificUpdates', updateId), {}, { merge: true });
      console.log(`✅ Deleted scientific update: ${updateId}`);
    } catch (error) {
      console.error('❌ Error deleting scientific update:', error);
      throw error;
    }
  },

  // Vote for a scientific update
  async voteUpdate(updateId: string, userId: string, isUpvote: boolean): Promise<void> {
    try {
      const updateRef = doc(db, 'scientificUpdates', updateId);
      const updateDocSnapshot = await getDoc(updateRef);
      
      if (!updateDocSnapshot.exists()) {
        throw new Error('Scientific update not found');
      }
      
      const updateData = updateDocSnapshot.data();
      const currentVotes = updateData.votes || 0;
      const currentVotedBy = updateData.votedBy || [];
      
      let newVotes = currentVotes;
      let newVotedBy = [...currentVotedBy];
      
      if (isUpvote) {
        if (!currentVotedBy.includes(userId)) {
          newVotes += 1;
          newVotedBy.push(userId);
        }
      } else {
        if (currentVotedBy.includes(userId)) {
          newVotes -= 1;
          newVotedBy = currentVotedBy.filter((id: string) => id !== userId);
        }
      }
      
      await updateDoc(updateRef, {
        votes: newVotes,
        votedBy: newVotedBy,
      });
      
      console.log(`✅ ${isUpvote ? 'Upvoted' : 'Downvoted'} scientific update ${updateId}`);
    } catch (error) {
      console.error('❌ Error voting for scientific update:', error);
      throw error;
    }
  },

  // Mark update as read by user
  async markAsRead(updateId: string, userId: string): Promise<void> {
    try {
      // Check if read status already exists
      const readStatusQuery = query(
        collection(db, 'userReadStatus'),
        where('userId', '==', userId),
        where('updateId', '==', updateId)
      );
      
      const readStatusSnapshot = await getDocs(readStatusQuery);
      
      if (readStatusSnapshot.empty) {
        // Create new read status
        await addDoc(collection(db, 'userReadStatus'), {
          userId,
          updateId,
          isRead: true,
          readAt: Timestamp.now(),
          createdAt: Timestamp.now(),
        });

        // Increment read count on the update
        await updateDoc(doc(db, 'scientificUpdates', updateId), {
          readCount: increment(1),
        });
      } else {
        // Update existing read status
        const readStatusDoc = readStatusSnapshot.docs[0];
        await updateDoc(doc(db, 'userReadStatus', readStatusDoc.id), {
          isRead: true,
          readAt: Timestamp.now(),
        });
      }
      
      console.log(`✅ Marked scientific update ${updateId} as read by user ${userId}`);
    } catch (error) {
      console.error('❌ Error marking scientific update as read:', error);
      throw error;
    }
  },

  // Get read status for a user
  async getUserReadStatus(userId: string): Promise<Record<string, boolean>> {
    try {
      const readStatusQuery = query(
        collection(db, 'userReadStatus'),
        where('userId', '==', userId),
        where('isRead', '==', true)
      );
      
      const snapshot = await getDocs(readStatusQuery);
      const readStatus: Record<string, boolean> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        readStatus[data.updateId] = true;
      });
      
      return readStatus;
    } catch (error) {
      console.error('❌ Error fetching user read status:', error);
      throw error;
    }
  },

  // Get unread count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const [updatesSnapshot, readStatusSnapshot] = await Promise.all([
        getDocs(collection(db, 'scientificUpdates')),
        getDocs(query(
          collection(db, 'userReadStatus'),
          where('userId', '==', userId),
          where('isRead', '==', true)
        ))
      ]);
      
      const totalUpdates = updatesSnapshot.size;
      const readUpdates = readStatusSnapshot.size;
      
      return totalUpdates - readUpdates;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  },

  // Increment share count
  async incrementShareCount(updateId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'scientificUpdates', updateId), {
        shareCount: increment(1),
      });
      console.log(`✅ Incremented share count for scientific update ${updateId}`);
    } catch (error) {
      console.error('❌ Error incrementing share count:', error);
      throw error;
    }
  },
};