import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { doc, updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';

interface CohortEditorProps {
  courseId: string;
  cohortId?: string; // undefined for new cohort
  cohortData?: any; // existing cohort data
  onSave: (cohortData: any) => void;
  onCancel: () => void;
}

const CohortEditor: React.FC<CohortEditorProps> = ({
  courseId,
  cohortId,
  cohortData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: cohortData?.name || '',
    startDate: cohortData?.startDate ? 
      new Date(cohortData.startDate.toDate()).toISOString().split('T')[0] : '',
    endDate: cohortData?.endDate ? 
      new Date(cohortData.endDate.toDate()).toISOString().split('T')[0] : '',
    maxStudents: cohortData?.maxStudents || 50,
    currentStudents: cohortData?.currentStudents || 0,
    status: cohortData?.status || 'upcoming',
    weeklyReleaseTime: cohortData?.weeklyReleaseTime || '08:00',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-suggest end date when start date changes
      if (field === 'startDate' && value) {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 49); // 7 weeks = 49 days
        newData.endDate = endDate.toISOString().split('T')[0];
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate dates
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('End date must be after start date');
      }

      if (cohortId) {
        // Update existing cohort
        const cohortDataToSave = {
          ...formData,
          courseId,
          startDate: Timestamp.fromDate(new Date(formData.startDate)),
          endDate: Timestamp.fromDate(new Date(formData.endDate)),
          updatedAt: Timestamp.now(),
        };
        
        const cohortRef = doc(db, 'cohorts', cohortId);
        await updateDoc(cohortRef, cohortDataToSave);
        console.log('Cohort updated successfully');
        
        // Update lesson release schedule for existing cohort
        await setupLessonReleaseSchedule(cohortId, new Date(formData.startDate), formData.weeklyReleaseTime);
      } else {
        // Create new cohort
        const cohortDataToSave = {
          ...formData,
          courseId,
          startDate: Timestamp.fromDate(new Date(formData.startDate)),
          endDate: Timestamp.fromDate(new Date(formData.endDate)),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        
        const cohortRef = await addDoc(collection(db, 'cohorts'), cohortDataToSave);
        console.log('Cohort created successfully:', cohortRef.id);
        
        // Set up lesson release schedule for new cohort
        await setupLessonReleaseSchedule(cohortRef.id, new Date(formData.startDate), formData.weeklyReleaseTime);
      }

      setSuccess(cohortId ? 'Cohort updated successfully!' : 'Cohort created successfully!');
      onSave(formData);
    } catch (error) {
      console.error('Error saving cohort:', error);
      setError(error instanceof Error ? error.message : 'Failed to save cohort. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    }
    return '';
  };

  const setupLessonReleaseSchedule = async (cohortId: string, startDate: Date, weeklyReleaseTime: string) => {
    try {
      console.log('Setting up lesson release schedule for cohort:', cohortId);
      
      // Get all lessons for this course
      const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', courseId));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      console.log(`Found ${lessons.length} lessons for course ${courseId}`);

      // Calculate release dates for each lesson
      for (const lesson of lessons) {
        const releaseDate = new Date(startDate);
        releaseDate.setDate(releaseDate.getDate() + ((lesson.weekNumber - 1) * 7)); // Week 1 starts on start date
        
        // Set the release time (e.g., 08:00)
        const [hours, minutes] = weeklyReleaseTime.split(':').map(Number);
        releaseDate.setHours(hours, minutes, 0, 0);

        // Create or update lesson release document
        const releaseData = {
          cohortId: cohortId,
          lessonId: lesson.id,
          courseId: courseId,
          weekNumber: lesson.weekNumber,
          releaseDate: Timestamp.fromDate(releaseDate),
          isReleased: false, // Will be set to true when the date arrives
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Check if release document already exists
        const releaseQuery = query(
          collection(db, 'lessonReleases'),
          where('cohortId', '==', cohortId),
          where('lessonId', '==', lesson.id)
        );
        const existingRelease = await getDocs(releaseQuery);

        if (existingRelease.empty) {
          // Create new release document
          await addDoc(collection(db, 'lessonReleases'), releaseData);
          console.log(`Created release schedule for lesson ${lesson.title} (Week ${lesson.weekNumber})`);
        } else {
          // Update existing release document
          const releaseDoc = existingRelease.docs[0];
          await updateDoc(doc(db, 'lessonReleases', releaseDoc.id), {
            releaseDate: Timestamp.fromDate(releaseDate),
            updatedAt: Timestamp.now(),
          });
          console.log(`Updated release schedule for lesson ${lesson.title} (Week ${lesson.weekNumber})`);
        }
      }

      console.log('Lesson release schedule setup completed successfully');
    } catch (error) {
      console.error('Error setting up lesson release schedule:', error);
      throw error;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {cohortId ? 'Edit Cohort' : 'Create New Cohort'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Setting the start date will automatically schedule lesson releases for the weekly cadence.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Cohort Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., November 2025, January 2026"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                helperText={calculateDuration() ? `Duration: ${calculateDuration()}` : ''}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Max Students"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', Number(e.target.value))}
                required
              />

              <TextField
                fullWidth
                label="Current Students"
                type="number"
                value={formData.currentStudents}
                onChange={(e) => handleInputChange('currentStudents', Number(e.target.value))}
                disabled={!cohortId} // Only editable for existing cohorts
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Weekly Release Time"
                type="time"
                value={formData.weeklyReleaseTime}
                onChange={(e) => handleInputChange('weeklyReleaseTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Cohort Info */}
            <Box sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Cohort Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Duration: {calculateDuration() || 'Not set'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Capacity: {formData.currentStudents}/{formData.maxStudents} students
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Weekly releases: {formData.weeklyReleaseTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Status: {formData.status}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading || !formData.name || !formData.startDate || !formData.endDate}
            >
              {loading ? 'Saving...' : (cohortId ? 'Update Cohort' : 'Create Cohort')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default CohortEditor; 