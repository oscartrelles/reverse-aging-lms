import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const initializeCourseData = async () => {
  try {
    console.log('Starting data initialization...');
    console.log('Firebase config check:', {
      projectId: db.app.options.projectId,
      hasFirestore: !!db
    });

    // Create the main course
    const courseData = {
      title: 'The Reverse Aging Challenge',
      description: 'A comprehensive 7-week online course to transform your health and reverse aging through proven strategies.',
      price: 299,
      isFree: false,
      maxStudents: 100,
      duration: 7,
      status: 'active' as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Course data to create:', courseData);
    console.log('Creating course...');
    
    let courseId: string;
    try {
      const courseRef = await addDoc(collection(db, 'courses'), courseData);
      courseId = courseRef.id;
      console.log('Course created with ID:', courseId);
    } catch (courseError) {
      console.error('Error creating course:', courseError);
      throw new Error(`Failed to create course: ${courseError}`);
    }

    // Create lessons for each week
    const lessonsData = [
      {
        courseId,
        weekNumber: 1,
        title: 'Foundation & Mindset',
        description: 'Understanding the science of aging and setting up your transformation mindset.',
        videoUrl: 'https://example.com/week1-video',
        videoDuration: 1800, // 30 minutes
        isPublished: true,
        order: 1,
        resources: [],
      },
      {
        courseId,
        weekNumber: 2,
        title: 'Breathing & Cold Exposure',
        description: 'Master the Wim Hof breathing method and introduce cold exposure for hormetic stress.',
        videoUrl: 'https://example.com/week2-video',
        videoDuration: 2400, // 40 minutes
        isPublished: true,
        order: 2,
        resources: [],
      },
      {
        courseId,
        weekNumber: 3,
        title: 'Movement & Mobility',
        description: 'Functional movement patterns and mobility work for optimal health.',
        videoUrl: 'https://example.com/week3-video',
        videoDuration: 2100, // 35 minutes
        isPublished: true,
        order: 3,
        resources: [],
      },
      {
        courseId,
        weekNumber: 4,
        title: 'Nutrition & Fasting',
        description: 'Optimize your nutrition and implement intermittent fasting protocols.',
        videoUrl: 'https://example.com/week4-video',
        videoDuration: 2700, // 45 minutes
        isPublished: true,
        order: 4,
        resources: [],
      },
      {
        courseId,
        weekNumber: 5,
        title: 'Sleep & Recovery',
        description: 'Master your sleep hygiene and recovery protocols for optimal performance.',
        videoUrl: 'https://example.com/week5-video',
        videoDuration: 1800, // 30 minutes
        isPublished: true,
        order: 5,
        resources: [],
      },
      {
        courseId,
        weekNumber: 6,
        title: 'Stress Management',
        description: 'Techniques for managing stress and building resilience.',
        videoUrl: 'https://example.com/week6-video',
        videoDuration: 2100, // 35 minutes
        isPublished: true,
        order: 6,
        resources: [],
      },
      {
        courseId,
        weekNumber: 7,
        title: 'Integration & Long-term Success',
        description: 'Integrating all practices into your daily life for lasting transformation.',
        videoUrl: 'https://example.com/week7-video',
        videoDuration: 2400, // 40 minutes
        isPublished: true,
        order: 7,
        resources: [],
      },
    ];

    console.log('Creating lessons...');
    for (let i = 0; i < lessonsData.length; i++) {
      const lessonData = lessonsData[i];
      try {
        console.log(`Creating lesson ${i + 1}/${lessonsData.length}:`, lessonData.title);
        const lessonRef = await addDoc(collection(db, 'lessons'), lessonData);
        console.log('Lesson created:', lessonRef.id);
      } catch (lessonError) {
        console.error(`Error creating lesson ${i + 1}:`, lessonError);
        throw new Error(`Failed to create lesson ${i + 1}: ${lessonError}`);
      }
    }

    // Create November 2025 cohort
    const cohortData = {
      courseId,
      name: 'November 2025',
      startDate: Timestamp.fromDate(new Date('2025-11-01')),
      endDate: Timestamp.fromDate(new Date('2025-12-20')),
      maxStudents: 50,
      currentStudents: 0,
      status: 'upcoming' as const,
      weeklyReleaseTime: '08:00',
    };

    console.log('Creating cohort...');
    try {
      const cohortRef = await addDoc(collection(db, 'cohorts'), cohortData);
      console.log('Cohort created:', cohortRef.id);
    } catch (cohortError) {
      console.error('Error creating cohort:', cohortError);
      throw new Error(`Failed to create cohort: ${cohortError}`);
    }

    console.log('✅ Data initialization completed successfully!');
    return { courseId, success: true };
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    throw error;
  }
};

// Function to make current user an admin
export const makeUserAdmin = async (userId: string) => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'users', userId), {
      isAdmin: true,
    });
    console.log('✅ User is now an admin!');
    return true;
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    throw error;
  }
};

// Function to add lessons to an existing course
export const addLessonsToExistingCourse = async (courseId: string) => {
  try {
    console.log('Adding lessons to existing course:', courseId);

    // Create lessons for each week
    const lessonsData = [
      {
        courseId,
        weekNumber: 1,
        title: 'Foundation & Mindset',
        description: 'Understanding the science of aging and setting up your transformation mindset.',
        videoUrl: 'https://example.com/week1-video',
        videoDuration: 1800, // 30 minutes
        isPublished: true,
        order: 1,
        resources: [],
      },
      {
        courseId,
        weekNumber: 2,
        title: 'Breathing & Cold Exposure',
        description: 'Master the Wim Hof breathing method and introduce cold exposure for hormetic stress.',
        videoUrl: 'https://example.com/week2-video',
        videoDuration: 2400, // 40 minutes
        isPublished: true,
        order: 2,
        resources: [],
      },
      {
        courseId,
        weekNumber: 3,
        title: 'Movement & Mobility',
        description: 'Functional movement patterns and mobility work for optimal health.',
        videoUrl: 'https://example.com/week3-video',
        videoDuration: 2100, // 35 minutes
        isPublished: true,
        order: 3,
        resources: [],
      },
      {
        courseId,
        weekNumber: 4,
        title: 'Nutrition & Fasting',
        description: 'Optimize your nutrition and implement intermittent fasting protocols.',
        videoUrl: 'https://example.com/week4-video',
        videoDuration: 2700, // 45 minutes
        isPublished: true,
        order: 4,
        resources: [],
      },
      {
        courseId,
        weekNumber: 5,
        title: 'Sleep & Recovery',
        description: 'Master your sleep hygiene and recovery protocols for optimal performance.',
        videoUrl: 'https://example.com/week5-video',
        videoDuration: 1800, // 30 minutes
        isPublished: true,
        order: 5,
        resources: [],
      },
      {
        courseId,
        weekNumber: 6,
        title: 'Stress Management',
        description: 'Techniques for managing stress and building resilience.',
        videoUrl: 'https://example.com/week6-video',
        videoDuration: 2100, // 35 minutes
        isPublished: true,
        order: 6,
        resources: [],
      },
      {
        courseId,
        weekNumber: 7,
        title: 'Integration & Long-term Success',
        description: 'Integrating all practices into your daily life for lasting transformation.',
        videoUrl: 'https://example.com/week7-video',
        videoDuration: 2400, // 40 minutes
        isPublished: true,
        order: 7,
        resources: [],
      },
    ];

    console.log('Creating lessons...');
    for (let i = 0; i < lessonsData.length; i++) {
      const lessonData = lessonsData[i];
      try {
        console.log(`Creating lesson ${i + 1}/${lessonsData.length}:`, lessonData.title);
        const lessonRef = await addDoc(collection(db, 'lessons'), lessonData);
        console.log('Lesson created:', lessonRef.id);
      } catch (lessonError) {
        console.error(`Error creating lesson ${i + 1}:`, lessonError);
        throw new Error(`Failed to create lesson ${i + 1}: ${lessonError}`);
      }
    }

    console.log('✅ Lessons added successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error adding lessons:', error);
    throw error;
  }
};

// Function to update course details
export const updateCourse = async (courseId: string, updates: any) => {
  try {
    console.log('Updating course:', courseId, updates);
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'courses', courseId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Course updated successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating course:', error);
    throw error;
  }
};

// Function to create a new cohort
export const createCohort = async (courseId: string, cohortData: any) => {
  try {
    console.log('Creating cohort for course:', courseId);
    const cohortWithTimestamps = {
      ...cohortData,
      courseId,
      startDate: Timestamp.fromDate(new Date(cohortData.startDate)),
      endDate: Timestamp.fromDate(new Date(cohortData.endDate)),
    };
    
    const cohortRef = await addDoc(collection(db, 'cohorts'), cohortWithTimestamps);
    console.log('✅ Cohort created:', cohortRef.id);
    return { cohortId: cohortRef.id, success: true };
  } catch (error) {
    console.error('❌ Error creating cohort:', error);
    throw error;
  }
};

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).initializeCourseData = initializeCourseData;
  (window as any).makeUserAdmin = makeUserAdmin;
  (window as any).addLessonsToExistingCourse = addLessonsToExistingCourse;
  (window as any).updateCourse = updateCourse;
  (window as any).createCohort = createCohort;
} 