import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send, Science, School } from '@mui/icons-material';
import { mailerSendService } from '../../services/mailerSendService';
import { emailIntegrationService } from '../../services/emailIntegrationService';
import { EMAIL_TEMPLATES, EMAIL_CONFIG } from '../../constants/emailTemplates';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const EmailTestPanel: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const success = await mailerSendService.testConnection();
      console.log('Test connection result:', success);
      setResult({
        success,
        message: success ? 'Connection successful!' : 'Connection failed',
        details: success
      });
    } catch (error) {
      console.error('Test connection error:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Please enter a test email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const variables = {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        fullName: 'Test User',
        loginUrl: EMAIL_CONFIG.BASE_URL,
        supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
        year: new Date().getFullYear().toString(),
      };

      const success = await mailerSendService.sendTransactional(
        EMAIL_TEMPLATES.WELCOME_EMAIL,
        testEmail,
        variables
      );

      setResult({
        success,
        message: success ? 'Welcome email sent!' : 'Failed to send email'
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendScientificUpdateDigest = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Please enter a test email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Fetch recent scientific updates from Firestore
      const scientificUpdatesRef = collection(db, 'scientificUpdates');
      const q = query(
        scientificUpdatesRef,
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
              const updates = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            title: data.title || 'Untitled Study',
            summary: data.summary || data.fullReview?.substring(0, 200) + '...' || 'No summary available',
            category: data.category || 'General'
          };
        });

      if (updates.length === 0) {
        setResult({
          success: false,
          message: 'No scientific updates found in database. Please add some updates first.'
        });
        return;
      }

      // Convert updates array to HTML format for MailerSend
      const scientificUpdatesHtml = updates.map(update => 
        `<li><strong>${update.title}</strong> (${update.category})<br>${update.summary}</li>`
      ).join('');

      const variables = {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        fullName: 'Test User',
        scientificUpdates: scientificUpdatesHtml,
        loginUrl: EMAIL_CONFIG.BASE_URL,
        supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
        year: new Date().getFullYear().toString(),
      };

      const success = await mailerSendService.sendTransactional(
        EMAIL_TEMPLATES.SCIENTIFIC_UPDATE_DIGEST,
        testEmail,
        variables
      );

      setResult({
        success,
        message: success ? `Scientific Update Digest sent with ${updates.length} updates!` : 'Failed to send email',
        details: { updatesCount: updates.length, updates: updates }
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEnrollmentConfirmation = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Please enter a test email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Fetch real cohort data from Firestore
      const cohortsRef = collection(db, 'cohorts');
      const q = query(cohortsRef, where('status', '==', 'active'), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResult({
          success: false,
          message: 'No active cohorts found in database. Please create an active cohort first.'
        });
        return;
      }

      const cohortDoc = querySnapshot.docs[0];
      const cohortData = cohortDoc.data();

      // Fetch course data for this cohort
      const coursesRef = collection(db, 'courses');
      const courseQuery = query(coursesRef, where('id', '==', cohortData.courseId), limit(1));
      const courseSnapshot = await getDocs(courseQuery);

      let courseTitle = '7-Week Reverse Aging Challenge'; // fallback
      let courseDuration = 7; // fallback

      if (!courseSnapshot.empty) {
        const courseData = courseSnapshot.docs[0].data();
        courseTitle = courseData.title || courseTitle;
        courseDuration = courseData.duration || courseDuration;
      }

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      };

      // Calculate first lesson date (3 days after cohort start)
      const cohortStartDate = new Date(cohortData.startDate.toDate());
      const firstLessonDate = new Date(cohortStartDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const variables = {
        firstName: 'Test',
        lastName: 'Student',
        email: testEmail,
        fullName: 'Test Student',
        courseTitle: courseTitle,
        courseUrl: `${EMAIL_CONFIG.BASE_URL}/course/${cohortData.courseId}`,
        loginUrl: EMAIL_CONFIG.BASE_URL,
        supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
        year: new Date().getFullYear().toString(),
        cohortName: cohortData.name,
        cohortStartDate: formatDate(cohortStartDate),
        firstLessonDate: formatDate(firstLessonDate),
        totalLessons: courseDuration * 3, // Estimate 3 lessons per week
        courseDuration: `${courseDuration} weeks`,
      };

      const success = await mailerSendService.sendTransactional(
        EMAIL_TEMPLATES.ENROLLMENT_CONFIRMATION,
        testEmail,
        variables
      );

      setResult({
        success,
        message: success ? 'Enrollment Confirmation sent!' : 'Failed to send email',
        details: { 
          courseTitle: courseTitle,
          cohortName: cohortData.name,
          totalLessons: courseDuration * 3,
          courseDuration: `${courseDuration} weeks`,
          cohortStartDate: formatDate(cohortStartDate),
          firstLessonDate: formatDate(firstLessonDate)
        }
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWeeklyDigest = async () => {
    setLoading(true);
    setResult(null);

    try {
      await emailIntegrationService.scheduleWeeklyScientificDigest();
      
      setResult({
        success: true,
        message: 'Weekly scientific digest scheduled and sent to all eligible users!',
        details: { 
          note: 'This function sends to all users with email and scientific updates enabled',
          template: 'Scientific Update Digest'
        }
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Email System Test
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Test Connection'}
          </Button>
        </Box>

        <TextField
          label="Test Email"
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSendWelcomeEmail}
          disabled={loading || !testEmail}
          startIcon={<Send />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Send Welcome Email Test
        </Button>

        <Button
          variant="contained"
          onClick={handleSendScientificUpdateDigest}
          disabled={loading || !testEmail}
          startIcon={<Science />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Send Scientific Update Digest Test
        </Button>

        <Button
          variant="contained"
          onClick={handleSendEnrollmentConfirmation}
          disabled={loading || !testEmail}
          startIcon={<School />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Send Enrollment Confirmation Test
        </Button>

        <Button
          variant="contained"
          onClick={handleSendWeeklyDigest}
          disabled={loading}
          startIcon={<Science />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Send Weekly Scientific Digest (All Users)
        </Button>

        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            <Typography variant="body2">
              {result.message}
            </Typography>
            {result.details && (
              <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace' }}>
                Details: {JSON.stringify(result.details, null, 2)}
              </Typography>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTestPanel;
