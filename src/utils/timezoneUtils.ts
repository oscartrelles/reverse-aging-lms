import moment from 'moment-timezone';
import { Timestamp } from 'firebase/firestore';

/**
 * Detect user's timezone automatically
 */
export const detectUserTimezone = (): string => {
  try {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Validate the detected timezone
    if (isValidTimezone(detectedTimezone)) {
      return detectedTimezone;
    }
    
    // If invalid, try to map common invalid timezone names to valid ones
    const timezoneMap: Record<string, string> = {
      'Madrid': 'Europe/Madrid',
      'Barcelona': 'Europe/Madrid',
      'Spain': 'Europe/Madrid',
      'London': 'Europe/London',
      'UK': 'Europe/London',
      'England': 'Europe/London',
      'New York': 'America/New_York',
      'NYC': 'America/New_York',
      'Los Angeles': 'America/Los_Angeles',
      'LA': 'America/Los_Angeles',
      'Chicago': 'America/Chicago',
      'Denver': 'America/Denver',
      'Phoenix': 'America/Phoenix',
      'Toronto': 'America/Toronto',
      'Vancouver': 'America/Vancouver',
      'Sydney': 'Australia/Sydney',
      'Melbourne': 'Australia/Melbourne',
      'Tokyo': 'Asia/Tokyo',
      'Beijing': 'Asia/Shanghai',
      'Shanghai': 'Asia/Shanghai',
      'Hong Kong': 'Asia/Hong_Kong',
      'Singapore': 'Asia/Singapore',
      'Dubai': 'Asia/Dubai',
      'Mumbai': 'Asia/Kolkata',
      'Delhi': 'Asia/Kolkata',
      'Berlin': 'Europe/Berlin',
      'Paris': 'Europe/Paris',
      'Rome': 'Europe/Rome',
      'Amsterdam': 'Europe/Amsterdam',
      'Stockholm': 'Europe/Stockholm',
      'Oslo': 'Europe/Oslo',
      'Copenhagen': 'Europe/Copenhagen',
      'Helsinki': 'Europe/Helsinki',
      'Warsaw': 'Europe/Warsaw',
      'Prague': 'Europe/Prague',
      'Vienna': 'Europe/Vienna',
      'Budapest': 'Europe/Budapest',
      'Bucharest': 'Europe/Bucharest',
      'Sofia': 'Europe/Sofia',
      'Athens': 'Europe/Athens',
      'Istanbul': 'Europe/Istanbul',
      'Moscow': 'Europe/Moscow',
      'Kiev': 'Europe/Kiev',
      'Minsk': 'Europe/Minsk',
      'Riga': 'Europe/Riga',
      'Tallinn': 'Europe/Tallinn',
      'Vilnius': 'Europe/Vilnius',
    };
    
    // Try to map the detected timezone to a valid one
    const mappedTimezone = timezoneMap[detectedTimezone];
    if (mappedTimezone && isValidTimezone(mappedTimezone)) {
      console.log(`Mapped timezone "${detectedTimezone}" to "${mappedTimezone}"`);
      return mappedTimezone;
    }
    
    // If still invalid, fall back to UTC
    console.warn(`Invalid timezone detected: "${detectedTimezone}", falling back to UTC`);
    return 'UTC';
  } catch (error) {
    console.warn('Could not detect timezone, falling back to UTC:', error);
    return 'UTC';
  }
};

/**
 * Get student-specific release time based on global release date and student timezone
 * This implements the Spotify-style rolling release where each student gets content
 * at 8 AM in their local timezone
 */
export const getStudentReleaseTime = (
  globalReleaseDate: Date | Timestamp,
  userTimezone: string = 'UTC'
): Date => {
  try {
    // Convert Timestamp to Date if needed
    const releaseDate = globalReleaseDate instanceof Timestamp 
      ? globalReleaseDate.toDate() 
      : globalReleaseDate;

    // Validate timezone before using it
    const validTimezone = isValidTimezone(userTimezone) ? userTimezone : 'UTC';
    
    // Convert to student's timezone and set to 8 AM local time
    const studentRelease = moment(releaseDate)
      .tz(validTimezone)
      .hour(8)
      .minute(0)
      .second(0)
      .millisecond(0);

    return studentRelease.toDate();
  } catch (error) {
    console.warn('Error calculating student release time, falling back to global time:', error);
    return globalReleaseDate instanceof Timestamp 
      ? globalReleaseDate.toDate() 
      : globalReleaseDate;
  }
};

/**
 * Check if a lesson is available for a specific student based on their timezone
 */
export const isLessonAvailableForStudent = (
  lessonRelease: { releaseDate: Timestamp; isReleased: boolean },
  userTimezone: string = 'UTC'
): boolean => {
  // If lesson is manually released, it's available
  if (lessonRelease.isReleased) {
    return true;
  }

  try {
    const studentReleaseTime = getStudentReleaseTime(lessonRelease.releaseDate, userTimezone);
    const now = new Date();

    return now >= studentReleaseTime;
  } catch (error) {
    console.warn('Error checking lesson availability, falling back to global time:', error);
    // Fall back to global release time
    const now = new Date();
    const releaseDate = lessonRelease.releaseDate.toDate();
    return now >= releaseDate;
  }
};

/**
 * Get time until release in student's timezone
 */
export const getTimeUntilRelease = (
  lessonRelease: { releaseDate: Timestamp; isReleased: boolean },
  userTimezone: string = 'UTC'
): string => {
  if (lessonRelease.isReleased) {
    return 'Available now';
  }

  try {
    const studentReleaseTime = getStudentReleaseTime(lessonRelease.releaseDate, userTimezone);
    const now = new Date();

    if (now >= studentReleaseTime) {
      return 'Available now';
    }

    return moment(studentReleaseTime).fromNow();
  } catch (error) {
    console.warn('Error calculating time until release, falling back to global time:', error);
    const now = new Date();
    const releaseDate = lessonRelease.releaseDate.toDate();
    
    if (now >= releaseDate) {
      return 'Available now';
    }
    
    return moment(releaseDate).fromNow();
  }
};

/**
 * Format release time for display in student's timezone
 */
export const formatReleaseTime = (
  lessonRelease: { releaseDate: Timestamp; isReleased: boolean },
  userTimezone: string = 'UTC'
): string => {
  if (lessonRelease.isReleased) {
    return 'Available now';
  }

  try {
    const studentReleaseTime = getStudentReleaseTime(lessonRelease.releaseDate, userTimezone);
    const validTimezone = isValidTimezone(userTimezone) ? userTimezone : 'UTC';
    
    return moment(studentReleaseTime)
      .tz(validTimezone)
      .format('dddd, MMMM Do [at] h:mm A');
  } catch (error) {
    console.warn('Error formatting release time, falling back to global time:', error);
    const releaseDate = lessonRelease.releaseDate.toDate();
    return moment(releaseDate).format('dddd, MMMM Do [at] h:mm A');
  }
};

/**
 * Get timezone display name
 */
export const getTimezoneDisplayName = (timezone: string): string => {
  try {
    const now = new Date();
    const timeZoneName = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'long'
    }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value;
    
    return timeZoneName || timezone;
  } catch (error) {
    return timezone;
  }
};

/**
 * Validate timezone string
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    moment.tz.zone(timezone);
    return true;
  } catch (error) {
    return false;
  }
};
