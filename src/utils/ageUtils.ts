import { Timestamp } from 'firebase/firestore';

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth as Date, Timestamp, or string
 * @returns Age in years
 */
export const calculateAge = (dateOfBirth: Date | Timestamp | string | null | undefined): number => {
  if (!dateOfBirth) return 0;
  
  let birthDate: Date;
  
  if (dateOfBirth instanceof Timestamp) {
    birthDate = dateOfBirth.toDate();
  } else if (typeof dateOfBirth === 'string') {
    birthDate = new Date(dateOfBirth);
  } else {
    birthDate = dateOfBirth;
  }
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    return 0;
  }
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
};

/**
 * Format date of birth for display
 * @param dateOfBirth - Date of birth as Date, Timestamp, or string
 * @returns Formatted date string
 */
export const formatDateOfBirth = (dateOfBirth: Date | Timestamp | string | null | undefined): string => {
  if (!dateOfBirth) return '';
  
  let birthDate: Date;
  
  if (dateOfBirth instanceof Timestamp) {
    birthDate = dateOfBirth.toDate();
  } else if (typeof dateOfBirth === 'string') {
    birthDate = new Date(dateOfBirth);
  } else {
    birthDate = dateOfBirth;
  }
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    return '';
  }
  
  return birthDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get age range category for analytics
 * @param age - Age in years
 * @returns Age range category
 */
export const getAgeRange = (age: number): string => {
  if (age < 18) return 'Under 18';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  if (age < 75) return '65-74';
  return '75+';
};

/**
 * Check if user is eligible for age-restricted content
 * @param dateOfBirth - Date of birth
 * @param minimumAge - Minimum age required (default: 18)
 * @returns Whether user meets age requirement
 */
export const isAgeEligible = (
  dateOfBirth: Date | Timestamp | string | null | undefined, 
  minimumAge: number = 18
): boolean => {
  const age = calculateAge(dateOfBirth);
  return age >= minimumAge;
};

/**
 * Convert date of birth to Firestore Timestamp
 * @param dateOfBirth - Date of birth as Date or string
 * @returns Firestore Timestamp
 */
export const toFirestoreTimestamp = (dateOfBirth: Date | string | null | undefined): Timestamp | null => {
  if (!dateOfBirth) return null;
  
  let date: Date;
  
  if (typeof dateOfBirth === 'string') {
    date = new Date(dateOfBirth);
  } else {
    date = dateOfBirth;
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return Timestamp.fromDate(date);
};

/**
 * Validate date of birth
 * @param dateOfBirth - Date of birth to validate
 * @returns Whether the date is valid and reasonable
 */
export const isValidDateOfBirth = (dateOfBirth: Date | Timestamp | string | null | undefined): boolean => {
  if (!dateOfBirth) return false;
  
  const age = calculateAge(dateOfBirth);
  
  // Check if age is reasonable (between 0 and 120)
  if (age < 0 || age > 120) {
    return false;
  }
  
  // Check if date is in the future
  let birthDate: Date;
  
  if (dateOfBirth instanceof Timestamp) {
    birthDate = dateOfBirth.toDate();
  } else if (typeof dateOfBirth === 'string') {
    birthDate = new Date(dateOfBirth);
  } else {
    birthDate = dateOfBirth;
  }
  
  return birthDate <= new Date();
};
