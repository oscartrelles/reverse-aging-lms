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
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
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

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {cohortId ? 'Edit Cohort' : 'Create New Cohort'}
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