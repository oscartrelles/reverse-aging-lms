import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';

interface CourseEditorProps {
  courseId?: string; // undefined for new course
  courseData?: any; // existing course data
  onSave: (courseData: any) => void;
  onCancel: () => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({
  courseId,
  courseData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: courseData?.title || '',
    description: courseData?.description || '',
    price: courseData?.price || 299,
    specialOffer: courseData?.specialOffer || 0,
    duration: courseData?.duration || 7,
    maxStudents: courseData?.maxStudents || 100,
    status: courseData?.status || 'active',
    isFree: courseData?.isFree || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const courseDataToSave = {
        ...formData,
        updatedAt: Timestamp.now(),
      };

      if (courseId) {
        // Update existing course
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, courseDataToSave);
        console.log('Course updated successfully');
      } else {
        // Create new course
        const courseDataToSaveWithCreated = {
          ...courseDataToSave,
          createdAt: Timestamp.now(),
        };
        const courseRef = await addDoc(collection(db, 'courses'), courseDataToSaveWithCreated);
        console.log('Course created successfully:', courseRef.id);
      }

      setSuccess(courseId ? 'Course updated successfully!' : 'Course created successfully!');
      onSave(courseDataToSave);
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {courseId ? 'Edit Course' : 'Create New Course'}
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
              label="Course Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={4}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Price (€)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                disabled={formData.isFree}
              />

              <TextField
                fullWidth
                label="Special Offer Price (€) - 0 for no offer"
                type="number"
                value={formData.specialOffer}
                onChange={(e) => handleInputChange('specialOffer', Number(e.target.value))}
                disabled={formData.isFree}
                helperText="Set to 0 to disable special offer, or enter a price lower than regular price"
              />
            </Box>

            <TextField
              fullWidth
              label="Duration (weeks)"
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', Number(e.target.value))}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Max Students"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', Number(e.target.value))}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isFree}
                  onChange={(e) => handleInputChange('isFree', e.target.checked)}
                />
              }
              label="Free Course"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading || !formData.title || !formData.description}
            >
              {loading ? 'Saving...' : (courseId ? 'Update Course' : 'Create Course')}
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

export default CourseEditor; 