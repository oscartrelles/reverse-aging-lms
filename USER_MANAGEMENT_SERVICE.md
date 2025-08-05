# User Management Service Documentation

## Overview

The `userManagementService` is a centralized service that handles all platform-wide user account operations. It focuses on user account management, role management, and account status operations, separate from student-specific academic operations.

## Key Features

- ✅ **Account Status Management**: Enable, disable, suspend, and reactivate user accounts
- ✅ **Role Management**: Set and manage user roles (user, moderator, admin)
- ✅ **Email Verification**: Manage email verification status
- ✅ **Bulk Operations**: Perform bulk updates and deletions
- ✅ **Data Export**: GDPR-compliant user data export
- ✅ **Analytics**: User analytics and reporting
- ✅ **Real-time Listeners**: Built-in real-time subscription capabilities
- ✅ **Advanced Filtering**: Comprehensive filtering and search capabilities

## Usage

### Import the Service

```typescript
import { userManagementService } from '../services/userManagementService';
```

### Getting Users

```typescript
// Get all users
const users = await userManagementService.getUsers();

// Get users with filters
const adminUsers = await userManagementService.getUsers({
  role: 'admin',
  status: 'active'
});

// Get users with search
const searchResults = await userManagementService.getUsers({
  search: 'john',
  emailVerified: true
});

// Get users by date range
const recentUsers = await userManagementService.getUsers({
  createdAt: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }
});
```

### User Operations

```typescript
// Get a single user
const user = await userManagementService.getUser('userId');

// Update user
await userManagementService.updateUser('userId', {
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890'
});

// Delete user (soft delete)
await userManagementService.deleteUser('userId');

// Permanently delete user
await userManagementService.permanentlyDeleteUser('userId');
```

### Account Status Management

```typescript
// Enable user account
await userManagementService.enableUser('userId');

// Disable user account
await userManagementService.disableUser('userId');

// Suspend user account
await userManagementService.suspendUser('userId', 'Violation of terms of service');

// Reactivate suspended user
await userManagementService.reactivateUser('userId');
```

### Role Management

```typescript
// Set user role
await userManagementService.setUserRole('userId', 'admin');
await userManagementService.setUserRole('userId', 'moderator');
await userManagementService.setUserRole('userId', 'user');

// Remove user role (set to regular user)
await userManagementService.removeUserRole('userId');

// Get user roles
const roles = await userManagementService.getUserRoles('userId');
// Returns: ['user', 'admin'] or ['user', 'moderator'] or ['user']
```

### Email Verification

```typescript
// Verify user email
await userManagementService.verifyUserEmail('userId');

// Require email verification
await userManagementService.requireEmailVerification('userId');
```

### Bulk Operations

```typescript
// Bulk update users
await userManagementService.bulkUpdateUsers(['user1', 'user2', 'user3'], {
  isDisabled: true
});

// Bulk delete users
await userManagementService.bulkDeleteUsers(['user1', 'user2', 'user3']);
```

### Data Export and GDPR

```typescript
// Export user data (GDPR compliance)
const userData = await userManagementService.exportUserData('userId');
// Returns comprehensive user data including enrollments and profile

// Delete user data (GDPR compliance)
await userManagementService.deleteUserData('userId');
```

### Analytics

```typescript
// Get user analytics
const analytics = await userManagementService.getUserAnalytics();
// Returns detailed analytics about user base
```

### Real-time Listeners

```typescript
// Subscribe to all users
const unsubscribe = userManagementService.subscribeToUsers((users) => {
  console.log('Users updated:', users);
});

// Subscribe to specific user
const unsubscribe = userManagementService.subscribeToUser('userId', (user) => {
  console.log('User updated:', user);
});

// Clean up subscription
unsubscribe();
```

## Data Structure

### UserFilters Interface

```typescript
interface UserFilters {
  role?: 'user' | 'moderator' | 'admin';
  status?: 'active' | 'disabled' | 'suspended';
  emailVerified?: boolean;
  createdAt?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
```

### UpdateUserData Interface

```typescript
interface UpdateUserData {
  name?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
  emailVerified?: boolean;
  isDisabled?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  metadata?: Record<string, any>;
  updatedAt?: Timestamp;
}
```

### UserAnalytics Interface

```typescript
interface UserAnalytics {
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
```

## User Status Types

### Account Status
- **active**: User can access the platform normally
- **disabled**: User account is disabled (soft delete)
- **suspended**: User account is temporarily suspended

### User Roles
- **user**: Regular platform user
- **moderator**: Can moderate content and help manage community
- **admin**: Full administrative access

## Best Practices

1. **Use Soft Deletes**: Prefer `deleteUser()` over `permanentlyDeleteUser()` for data recovery
2. **Handle Suspensions**: Always provide a reason when suspending users
3. **Role Hierarchy**: Admin > Moderator > User
4. **GDPR Compliance**: Use `exportUserData()` and `deleteUserData()` for data requests
5. **Bulk Operations**: Use bulk operations for efficiency when updating multiple users
6. **Real-time Updates**: Use subscriptions for reactive UIs
7. **Error Handling**: Always wrap service calls in try-catch blocks

## Error Handling

```typescript
try {
  await userManagementService.updateUser('userId', {
    isAdmin: true
  });
  console.log('User updated successfully');
} catch (error) {
  console.error('Failed to update user:', error);
  // Handle error appropriately
}
```

## Integration Examples

### Admin Panel Integration

```typescript
// In admin user management component
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  const unsubscribe = userManagementService.subscribeToUsers(setUsers);
  return unsubscribe;
}, []);

const handleSuspendUser = async (userId: string) => {
  try {
    await userManagementService.suspendUser(userId, 'Violation of community guidelines');
    // Show success message
  } catch (error) {
    // Show error message
  }
};
```

### User Profile Management

```typescript
// In user profile component
const handleUpdateProfile = async (updates: UpdateUserData) => {
  try {
    await userManagementService.updateUser(currentUser.id, updates);
    // Show success message
  } catch (error) {
    // Show error message
  }
};
```

### Analytics Dashboard

```typescript
// In analytics dashboard
const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);

useEffect(() => {
  const loadAnalytics = async () => {
    const data = await userManagementService.getUserAnalytics();
    setAnalytics(data);
  };
  loadAnalytics();
}, []);
```

This service provides a comprehensive solution for user account management while maintaining clear separation from student-specific academic operations handled by the Student Management Service. 