# Enrollment Service Documentation

## Overview

The `enrollmentService` is a centralized service that manages all enrollment-related operations in the application. It ensures consistent data structure and prevents field name mismatches that could cause issues.

## Key Features

- ✅ **Single Source of Truth**: All enrollment data uses the correct `status` field (not `enrollmentStatus`)
- ✅ **Validation**: Built-in validation for required fields
- ✅ **Duplicate Prevention**: Automatically prevents duplicate enrollments
- ✅ **Atomic Operations**: Uses Firestore transactions for data consistency
- ✅ **Real-time Listeners**: Built-in real-time subscription capabilities
- ✅ **Comprehensive API**: Full CRUD operations for enrollments

## Usage

### Import the Service

```typescript
import { enrollmentService } from '../services/enrollmentService';
```

### Creating Enrollments

```typescript
// Basic enrollment creation
const enrollmentId = await enrollmentService.createEnrollment({
  userId: 'user123',
  courseId: 'course456',
  cohortId: 'cohort789',
  status: 'active', // optional, defaults to 'active'
  paymentStatus: 'paid', // optional
  stripeCustomerId: 'cus_123', // optional
});

// Payment-based enrollment
const enrollmentId = await enrollmentService.createEnrollment({
  userId: 'user123',
  courseId: 'course456',
  cohortId: 'cohort789',
  paymentId: 'payment_123',
  paymentStatus: 'paid',
  status: 'active',
  stripeCustomerId: 'cus_123',
});
```

### Updating Enrollments

```typescript
// Update enrollment status
await enrollmentService.updateEnrollment('enrollmentId', {
  status: 'completed',
  completedAt: Timestamp.now()
});

// Update payment status
await enrollmentService.updatePaymentStatus('enrollmentId', 'paid');

// Cancel enrollment
await enrollmentService.cancelEnrollment('enrollmentId');

// Complete enrollment
await enrollmentService.completeEnrollment('enrollmentId');

// Reactivate cancelled enrollment
await enrollmentService.reactivateEnrollment('enrollmentId');
```

### Retrieving Enrollments

```typescript
// Get enrollment by ID
const enrollment = await enrollmentService.getEnrollment('enrollmentId');

// Get all enrollments for a user
const userEnrollments = await enrollmentService.getUserEnrollments('userId');

// Get active enrollment for user and course
const activeEnrollment = await enrollmentService.getActiveEnrollment('userId', 'courseId');

// Check if user is enrolled
const isEnrolled = await enrollmentService.isUserEnrolled('userId', 'courseId');

// Get enrollments by status
const activeEnrollments = await enrollmentService.getEnrollmentsByStatus('active');

// Get enrollments by cohort
const cohortEnrollments = await enrollmentService.getEnrollmentsByCohort('cohortId');

// Get enrollments by course
const courseEnrollments = await enrollmentService.getEnrollmentsByCourse('courseId');

// Get all enrollments (admin)
const allEnrollments = await enrollmentService.getAllEnrollments();
```

### Real-time Listeners

```typescript
// Subscribe to user enrollments
const unsubscribe = enrollmentService.subscribeToUserEnrollments('userId', (enrollments) => {
  console.log('User enrollments updated:', enrollments);
});

// Subscribe to all enrollments (admin)
const unsubscribe = enrollmentService.subscribeToAllEnrollments((enrollments) => {
  console.log('All enrollments updated:', enrollments);
});

// Clean up subscription
unsubscribe();
```

## Data Structure

### EnrollmentData Interface

```typescript
interface EnrollmentData {
  userId: string;
  courseId: string;
  cohortId: string;
  paymentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
```

### CreateEnrollmentOptions Interface

```typescript
interface CreateEnrollmentOptions {
  userId: string;
  courseId: string;
  cohortId: string;
  paymentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
```

### UpdateEnrollmentOptions Interface

```typescript
interface UpdateEnrollmentOptions {
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  completedAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
```

## Migration from Old Functions

The service maintains backward compatibility with legacy functions:

```typescript
// Old way (deprecated)
import { createEnrollment, updateEnrollmentStatus } from '../services/enrollmentService';

// New way (recommended)
import { enrollmentService } from '../services/enrollmentService';
```

## Best Practices

1. **Always use the service**: Don't create enrollments directly in Firestore
2. **Use proper status values**: Only use 'pending', 'active', 'completed', or 'cancelled'
3. **Handle errors**: Wrap service calls in try-catch blocks
4. **Clean up listeners**: Always call the unsubscribe function from real-time listeners
5. **Validate data**: The service validates required fields, but validate business logic in your components

## Error Handling

```typescript
try {
  const enrollmentId = await enrollmentService.createEnrollment({
    userId: 'user123',
    courseId: 'course456',
    cohortId: 'cohort789',
  });
  console.log('Enrollment created:', enrollmentId);
} catch (error) {
  console.error('Failed to create enrollment:', error);
  // Handle error appropriately
}
```

## Integration Examples

### Payment Flow Integration

```typescript
// In payment service
if (paymentData.paymentStatus === 'paid') {
  await enrollmentService.createEnrollment({
    userId: paymentData.userId,
    courseId: paymentData.courseId,
    cohortId: paymentData.cohortId,
    paymentId: paymentRef.id,
    paymentStatus: 'paid',
    status: 'active',
    stripeCustomerId: paymentData.stripeCustomerId,
  });
}
```

### Admin Enrollment Creation

```typescript
// In admin panel
const enrollmentId = await enrollmentService.createEnrollment({
  userId: selectedUser.id,
  courseId: enrollmentForm.courseId,
  cohortId: enrollmentForm.cohortId,
  status: 'active',
  paymentStatus: enrollmentForm.paymentStatus,
});
```

### Dashboard Integration

```typescript
// In dashboard component
const activeEnrollment = await enrollmentService.getActiveEnrollment(userId, courseId);
const isEnrolled = activeEnrollment !== null;
```

This centralized service ensures that all enrollment operations are consistent and use the correct data structure, preventing the field name mismatches that were causing issues in the past. 