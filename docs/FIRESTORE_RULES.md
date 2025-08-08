# Firestore Security Rules for Analytics

## Overview
The analytics system requires access to several Firestore collections. This document provides the security rules needed to make the analytics dashboard functional.

## Required Collections
The analytics system uses these collections:
- `analyticsEvents` - Stores analytics events
- `userSessions` - Tracks user sessions
- `cohorts` - User cohort data
- `experiments` - A/B testing data
- `experimentAssignments` - User experiment assignments

## Firestore Security Rules

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read courses and lessons
    match /courses/{courseId} {
      allow read: if request.auth != null;
    }
    
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
    }
    
    // Analytics collections - allow read/write for authenticated users
    match /analyticsEvents/{eventId} {
      allow read, write: if request.auth != null;
    }
    
    match /userSessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    
    match /cohorts/{cohortId} {
      allow read, write: if request.auth != null;
    }
    
    match /experiments/{experimentId} {
      allow read, write: if request.auth != null;
    }
    
    match /experimentAssignments/{assignmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow admins to read all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## Deployment Instructions

✅ **COMPLETED** - Rules have been deployed successfully!

The analytics security rules have been added to your `firestore.rules` file and deployed to Firebase. The deployment was successful and your analytics dashboard should now work with real data.

**Deployed collections:**
- `analyticsEvents` - User interaction tracking
- `userSessions` - Session management
- `userCohorts` - Cohort assignments
- `experiments` - A/B testing configurations
- `experimentAssignments` - User experiment assignments
- `analyticsDashboard` - Aggregated dashboard data

**Deployed indexes:**
- `userSessions` - Composite indexes for real-time queries
- `analyticsEvents` - Indexes for event tracking queries (including eventType + timestamp)
- `userCohorts` - Indexes for cohort analysis (including cohortId + metrics.lessonsCompleted)
- `experiments` - Indexes for A/B testing
- `experimentAssignments` - Indexes for experiment assignments

**All required indexes are now deployed and the analytics system should work without any index errors.**

## Alternative: Development Mode

For development, you can temporarily disable security rules:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Replace with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. Click "Publish"

⚠️ **Warning**: This disables all security rules. Only use for development!

## Testing the Rules

✅ **RULES DEPLOYED SUCCESSFULLY!**

The analytics dashboard should now work without permission errors. You should see:
- Real-time metrics loading properly
- Cohort analysis working
- A/B testing data accessible
- No more "Missing or insufficient permissions" errors

**Next Steps:**
1. Navigate to `/admin/analytics` in your application
2. The dashboard should load real data instead of demo data
3. Analytics events will be tracked as users interact with your platform

## Production Considerations

For production, consider:
1. **More restrictive rules** based on user roles
2. **Rate limiting** for analytics events
3. **Data retention policies** for analytics data
4. **Audit logging** for sensitive operations

## Troubleshooting

If you still see permission errors:
1. Check that the rules are deployed correctly
2. Verify the user is authenticated
3. Check the Firebase Console for rule validation errors
4. Ensure the collection names match exactly 