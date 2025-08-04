import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Course, Cohort, Lesson, Enrollment } from '../types';

// Initialize test data in Firestore
export const initializeTestData = async () => {
  try {
    

    // 1. Create the course
    const courseData: Course = {
      id: 'reverse-aging-challenge',
      title: 'The Reverse Aging Challenge',
      description: 'Transform your health and vitality through our comprehensive 7-week program',
      price: 499,
      isFree: false,
      maxStudents: 30,
      duration: 7,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'courses', courseData.id), courseData);


    // 2. Create a cohort that started 2 weeks ago
    const cohortData: Cohort = {
      id: 'spring-2024-cohort',
      courseId: courseData.id,
      name: 'Spring 2024 Cohort',
      startDate: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)), // Started 2 weeks ago
      endDate: Timestamp.fromDate(new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)), // Ends in 5 weeks
      maxStudents: 30,
      currentStudents: 25,
      status: 'active',
      weeklyReleaseTime: '08:00', // 8am
    };

    await setDoc(doc(db, 'cohorts', cohortData.id), cohortData);


    // 3. Create lessons
    const lessonsData: Lesson[] = [
      {
        id: 'lesson-1',
        courseId: courseData.id,
        weekNumber: 1,
        title: 'Introduction to Reverse Aging',
        description: 'Understanding the fundamentals of healthspan vs lifespan',
        theme: 'Foundation Principles',
        learningObjectives: [
          'Understand the difference between healthspan and lifespan',
          'Learn the core principles of reverse aging',
          'Set personal health goals for the program'
        ],
        whatYoullMaster: [
          'Healthspan vs. lifespan understanding',
          'Core reverse aging principles',
          'Personal health assessment'
        ],
        keyPractice: 'Morning meditation (5-10 min) + daily journaling to build awareness',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600, // 60 minutes
        resources: [],
        isPublished: true,
        order: 1,
      },
      {
        id: 'lesson-2',
        courseId: courseData.id,
        weekNumber: 2,
        title: 'Nutrition Fundamentals',
        description: 'Building a foundation for optimal nutrition',
        theme: 'Nutrition Basics',
        learningObjectives: [
          'Learn the basics of anti-aging nutrition',
          'Understand macronutrient balance',
          'Create a personalized nutrition plan'
        ],
        whatYoullMaster: [
          'Anti-aging nutrition principles',
          'Macronutrient optimization',
          'Personalized meal planning'
        ],
        keyPractice: 'Daily meal prep (15 min) + hydration tracking',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600,
        resources: [],
        isPublished: true,
        order: 2,
      },
      {
        id: 'lesson-3',
        courseId: courseData.id,
        weekNumber: 3,
        title: 'Movement and Exercise',
        description: 'Optimizing physical activity for longevity',
        theme: 'Physical Activity',
        learningObjectives: [
          'Understand the role of exercise in reverse aging',
          'Learn different types of beneficial movement',
          'Create a sustainable exercise routine'
        ],
        whatYoullMaster: [
          'Exercise physiology for longevity',
          'Movement variety principles',
          'Sustainable fitness habits'
        ],
        keyPractice: 'Daily movement (30 min) + strength training (3x/week)',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600,
        resources: [],
        isPublished: true,
        order: 3,
      },
      {
        id: 'lesson-4',
        courseId: courseData.id,
        weekNumber: 4,
        title: 'Sleep Optimization',
        description: 'Mastering the art of restorative sleep',
        theme: 'Sleep Science',
        learningObjectives: [
          'Understand the science of sleep and aging',
          'Learn sleep optimization techniques',
          'Create a personalized sleep routine'
        ],
        whatYoullMaster: [
          'Sleep physiology and aging',
          'Sleep hygiene practices',
          'Personalized sleep optimization'
        ],
        keyPractice: 'Evening wind-down routine (30 min) + sleep tracking',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600,
        resources: [],
        isPublished: true,
        order: 4,
      },
      {
        id: 'lesson-5',
        courseId: courseData.id,
        weekNumber: 5,
        title: 'Stress Management',
        description: 'Building resilience through stress management',
        theme: 'Mental Wellness',
        learningObjectives: [
          'Understand the impact of stress on aging',
          'Learn stress management techniques',
          'Build emotional resilience'
        ],
        whatYoullMaster: [
          'Stress physiology and aging',
          'Mindfulness and meditation',
          'Emotional regulation skills'
        ],
        keyPractice: 'Daily stress management (20 min) + breathing exercises',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600,
        resources: [],
        isPublished: true,
        order: 5,
      },
      {
        id: 'lesson-6',
        courseId: courseData.id,
        weekNumber: 6,
        title: 'Social Connections',
        description: 'The power of relationships in longevity',
        theme: 'Social Health',
        learningObjectives: [
          'Understand the role of social connections in health',
          'Learn to build meaningful relationships',
          'Create a supportive social network'
        ],
        whatYoullMaster: [
          'Social connection science',
          'Relationship building skills',
          'Community engagement strategies'
        ],
        keyPractice: 'Daily social interaction + weekly community activities',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600,
        resources: [],
        isPublished: true,
        order: 6,
      },
      {
        id: 'lesson-7',
        courseId: courseData.id,
        weekNumber: 7,
        title: 'Integration and Mastery',
        description: 'Bringing it all together for lasting change',
        theme: 'Lifestyle Integration',
        learningObjectives: [
          'Integrate all learned principles',
          'Create a sustainable lifestyle plan',
          'Build long-term habits for success'
        ],
        whatYoullMaster: [
          'Lifestyle integration strategies',
          'Habit formation science',
          'Long-term success planning'
        ],
        keyPractice: 'Daily integration practice + weekly habit review',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 3600,
        resources: [],
        isPublished: true,
        order: 7,
      },
    ];

    // Add lessons to Firestore
    for (const lesson of lessonsData) {
      await setDoc(doc(db, 'lessons', lesson.id), lesson);
    }
    console.log('✅ Test data initialization complete!');

  } catch (error) {
    console.error('❌ Error initializing test data:', error);
    throw error;
  }
};

// Function to create a test enrollment for the current user
export const createTestEnrollment = async (userId: string) => {
  try {
    const enrollmentData: Enrollment = {
      id: `enrollment-${userId}`,
      userId: userId,
      courseId: 'reverse-aging-challenge',
      cohortId: 'spring-2024-cohort',
      status: 'active',
      paymentStatus: 'paid',
      enrolledAt: Timestamp.now(),
      stripeCustomerId: 'test-customer-id',
    };

    await setDoc(doc(db, 'enrollments', enrollmentData.id), enrollmentData);
    console.log('✅ Test enrollment created for user:', userId);
    
    return enrollmentData;
  } catch (error) {
    console.error('❌ Error creating test enrollment:', error);
    throw error;
  }
};

// Function to check if test data exists
export const checkTestDataExists = async () => {
  try {
    const courseDoc = await doc(db, 'courses', 'reverse-aging-challenge');
    const cohortDoc = await doc(db, 'cohorts', 'spring-2024-cohort');
    
    // This is a simplified check - in a real app you'd use getDoc
    return true; // For now, assume it exists
  } catch (error) {
    return false;
  }
};

// Function to update video URLs in existing lessons
export const updateLessonVideoUrls = async () => {
  try {
    console.log('Updating lesson video URLs...');
    
    const { getDocs, query, where, updateDoc } = await import('firebase/firestore');
    const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', 'reverse-aging-challenge'));
    const snapshot = await getDocs(lessonsQuery);
    
    for (const doc of snapshot.docs) {
      const lesson = doc.data();
      let newVideoUrl = lesson.videoUrl;
      
      // Handle different YouTube URL formats
      if (lesson.videoUrl) {
        if (lesson.videoUrl.includes('youtube.com/watch?v=')) {
          // Convert watch URLs to embed URLs
          const videoId = lesson.videoUrl.split('v=')[1]?.split('&')[0];
          if (videoId) {
            newVideoUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (lesson.videoUrl.includes('youtube.com/') && !lesson.videoUrl.includes('/embed/')) {
          // Handle other YouTube URLs that aren't embed format
          const videoId = lesson.videoUrl.split('/').pop()?.split('?')[0];
          if (videoId && videoId.length === 11) { // YouTube video IDs are 11 characters
            newVideoUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        }
        
        // Only update if the URL actually changed
        if (newVideoUrl !== lesson.videoUrl) {
          await updateDoc(doc.ref, { videoUrl: newVideoUrl });
          console.log(`Updated video URL for lesson ${lesson.weekNumber}: ${newVideoUrl}`);
        }
      }
    }
    
    console.log('✅ Video URLs updated successfully');
  } catch (error) {
    console.error('❌ Error updating video URLs:', error);
    throw error;
  }
};

// Function to set proper test video URLs (using real YouTube video IDs)
export const setTestVideoUrls = async () => {
  try {
    console.log('Setting test video URLs...');
    
    const { getDocs, query, where, updateDoc } = await import('firebase/firestore');
    const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', 'reverse-aging-challenge'));
    const snapshot = await getDocs(lessonsQuery);
    
    // Real YouTube video IDs for testing (replace with your actual videos)
    const testVideoIds = [
      'dQw4w9WgXcQ', // Rick Roll (for testing)
      'dQw4w9WgXcQ', // Rick Roll (for testing)
      'dQw4w9WgXcQ', // Rick Roll (for testing)
      'dQw4w9WgXcQ', // Rick Roll (for testing)
      'dQw4w9WgXcQ', // Rick Roll (for testing)
      'dQw4w9WgXcQ', // Rick Roll (for testing)
      'dQw4w9WgXcQ', // Rick Roll (for testing)
    ];
    
    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const lesson = doc.data();
      const videoId = testVideoIds[i] || 'dQw4w9WgXcQ';
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      await updateDoc(doc.ref, { videoUrl: embedUrl });
      console.log(`Set video URL for lesson ${lesson.weekNumber}: ${embedUrl}`);
    }
    
    console.log('✅ Test video URLs set successfully');
  } catch (error) {
    console.error('❌ Error setting test video URLs:', error);
    throw error;
  }
};

// Function to set a specific video URL for testing
export const setSpecificVideoUrl = async (lessonWeekNumber: number, videoUrl: string) => {
  try {
    console.log(`Setting video URL for lesson ${lessonWeekNumber}: ${videoUrl}`);
    
    const { getDocs, query, where, updateDoc } = await import('firebase/firestore');
    
    // First, let's see what lessons exist
    const allLessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', 'reverse-aging-challenge'));
    const allLessonsSnapshot = await getDocs(allLessonsQuery);
    
    console.log('Available lessons:');
    allLessonsSnapshot.docs.forEach(doc => {
      const lesson = doc.data();
      console.log(`- Week ${lesson.weekNumber}: ${lesson.title} (ID: ${doc.id})`);
    });
    
    const lessonsQuery = query(
      collection(db, 'lessons'), 
      where('courseId', '==', 'reverse-aging-challenge'),
      where('weekNumber', '==', lessonWeekNumber)
    );
    const snapshot = await getDocs(lessonsQuery);
    
    if (snapshot.empty) {
      throw new Error(`No lesson found for week ${lessonWeekNumber}. Available weeks: ${allLessonsSnapshot.docs.map(doc => doc.data().weekNumber).join(', ')}`);
    }
    
    const doc = snapshot.docs[0];
    const lesson = doc.data();
    
    // Convert to embed URL if it's a watch URL
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    await updateDoc(doc.ref, { videoUrl: embedUrl });
    console.log(`✅ Set video URL for lesson ${lessonWeekNumber}: ${embedUrl}`);
    
    return embedUrl;
  } catch (error) {
    console.error('❌ Error setting specific video URL:', error);
    throw error;
  }
};

// Function to set video URL by lesson ID (more reliable)
export const setVideoUrlByLessonId = async (lessonId: string, videoUrl: string) => {
  try {
    console.log(`Setting video URL for lesson ID ${lessonId}: ${videoUrl}`);
    
    const { doc, updateDoc } = await import('firebase/firestore');
    
    // Convert to embed URL if it's a watch URL
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    const lessonRef = doc(db, 'lessons', lessonId);
    await updateDoc(lessonRef, { videoUrl: embedUrl });
    console.log(`✅ Set video URL for lesson ID ${lessonId}: ${embedUrl}`);
    
    return embedUrl;
  } catch (error) {
    console.error('❌ Error setting video URL by lesson ID:', error);
    throw error;
  }
};


// Function to list all lessons for debugging
export const listAllLessons = async () => {
  try {
    console.log('Listing all lessons...');
    
    const { getDocs, query, where } = await import('firebase/firestore');
    const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', 'reverse-aging-challenge'));
    const snapshot = await getDocs(lessonsQuery);
    
    if (snapshot.empty) {
      console.log('❌ No lessons found for course: reverse-aging-challenge');
      return [];
    }
    
    console.log(`✅ Found ${snapshot.docs.length} lessons:`);
    const lessons = snapshot.docs.map(doc => {
      const lesson = doc.data();
      console.log(`- Week ${lesson.weekNumber}: ${lesson.title} (ID: ${doc.id})`);
      return { id: doc.id, ...lesson };
    });
    
    return lessons;
  } catch (error) {
    console.error('❌ Error listing lessons:', error);
    throw error;
  }
};