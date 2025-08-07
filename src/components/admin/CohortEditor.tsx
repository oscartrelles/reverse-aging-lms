import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Cohort, Course } from '../../types';
import { courseManagementService } from '../../services/courseManagementService';
import { db } from '../../firebaseConfig';

interface CohortEditorProps {
  cohortId?: string;
  courseId: string;
  cohortData?: Cohort | null;
  onSave: (cohortData: any) => Promise<void>;
  onCancel: () => void;
}

const CohortEditor: React.FC<CohortEditorProps> = ({
  cohortId,
  courseId,
  cohortData,
  onSave,
  onCancel,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: cohortData?.name || '',
    description: cohortData?.description || '',
    startDate: cohortData?.startDate ? cohortData.startDate.toDate().toISOString().split('T')[0] : '',
    endDate: cohortData?.endDate ? cohortData.endDate.toDate().toISOString().split('T')[0] : '',
    maxStudents: cohortData?.maxStudents || 50,
    currentStudents: cohortData?.currentStudents || 0,
    status: cohortData?.status || 'upcoming',
    isActive: cohortData?.isActive || false,
    enrollmentDeadline: cohortData?.enrollmentDeadline ? cohortData.enrollmentDeadline.toDate().toISOString().split('T')[0] : '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course data to get duration
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await courseManagementService.getCourse(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Update current students count from enrollments for existing cohorts
  useEffect(() => {
    const updateCurrentStudents = async () => {
      if (!cohortId) return; // Only for existing cohorts
      
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('cohortId', '==', cohortId)
        );
        
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const currentStudents = enrollmentsSnapshot.docs.length;
        
        setFormData(prev => ({
          ...prev,
          currentStudents
        }));
      } catch (error) {
        console.error('Error fetching current students:', error);
      }
    };
    
    updateCurrentStudents();
  }, [cohortId]);

  // Auto-calculate endDate when startDate changes
  useEffect(() => {
    if (formData.startDate && course?.duration && !cohortId) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (course.duration * 7)); // Add weeks
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, course?.duration, cohortId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Cohort name is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    if (formData.maxStudents <= 0) {
      setError('Maximum students must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create dates in local timezone to avoid timezone conversion issues
      const createLocalDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      };

      const cohortDataToSave = {
        ...formData,
        courseId,
        startDate: createLocalDate(formData.startDate),
        endDate: createLocalDate(formData.endDate),
        enrollmentDeadline: formData.enrollmentDeadline ? createLocalDate(formData.enrollmentDeadline) : null,
      };

      await onSave(cohortDataToSave);
    } catch (error) {
      console.error('Error saving cohort:', error);
      setError('Failed to save cohort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Cohort Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="Enter cohort name"
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={3}
            placeholder="Enter cohort description"
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            required
            disabled={!cohortId && !!course?.duration} // Auto-calculated for new cohorts
            InputLabelProps={{
              shrink: true,
            }}
            helperText={!cohortId && course?.duration ? `Auto-calculated based on ${course.duration} week course duration` : ""}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Enrollment Deadline"
            type="date"
            value={formData.enrollmentDeadline}
            onChange={(e) => handleInputChange('enrollmentDeadline', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional: Set enrollment deadline"
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Maximum Students"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 50)}
            inputProps={{ min: 1 }}
            required
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Current Students"
            type="number"
            value={formData.currentStudents}
            inputProps={{ min: 0, readOnly: true }}
            disabled={true} // Always read-only - updated automatically from enrollments
            helperText="Updated automatically from student enrollments"
          />
        </Box>

        <Box>
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
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
            }
            label="Active Cohort"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {cohortId ? 'Update Cohort' : 'Create Cohort'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default CohortEditor; 