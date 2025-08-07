import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface DashboardSettings {
  showHeroVideo: boolean;
  heroVideoUrl?: string;
  heroVideoTitle?: string;
}

const DASHBOARD_SETTINGS_DOC = 'dashboardSettings';

export const dashboardSettingsService = {
  // Get dashboard settings
  async getDashboardSettings(): Promise<DashboardSettings> {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', DASHBOARD_SETTINGS_DOC));
      
      if (settingsDoc.exists()) {
        return settingsDoc.data() as DashboardSettings;
      } else {
        // Return default settings if document doesn't exist
        const defaultSettings: DashboardSettings = {
          showHeroVideo: true,
          heroVideoUrl: 'https://www.youtube.com/embed/tIPKZeevwy8',
          heroVideoTitle: 'Latest Live Q&A Session - The Reverse Aging Challenge'
        };
        
        // Create the document with default settings
        await setDoc(doc(db, 'settings', DASHBOARD_SETTINGS_DOC), defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      throw error;
    }
  },

  // Update dashboard settings
  async updateDashboardSettings(settings: Partial<DashboardSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'settings', DASHBOARD_SETTINGS_DOC);
      await updateDoc(settingsRef, settings);
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      throw error;
    }
  },

  // Toggle hero video visibility
  async toggleHeroVideo(show: boolean): Promise<void> {
    try {
      await this.updateDashboardSettings({ showHeroVideo: show });
    } catch (error) {
      console.error('Error toggling hero video:', error);
      throw error;
    }
  },

  // Update hero video URL and title
  async updateHeroVideo(videoUrl: string, videoTitle: string): Promise<void> {
    try {
      await this.updateDashboardSettings({
        heroVideoUrl: videoUrl,
        heroVideoTitle: videoTitle
      });
    } catch (error) {
      console.error('Error updating hero video:', error);
      throw error;
    }
  }
};
