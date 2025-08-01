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
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { Save, Cancel, Add, Delete } from '@mui/icons-material';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';

interface LessonEditorProps {
  courseId: string;
  lessonId?: string; // undefined for new lesson
  lessonData?: any; // existing lesson data
  onSave: (lessonData: any) => void;
  onCancel: () => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  courseId,
  lessonId,
  lessonData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: lessonData?.title || '',
    description: lessonData?.description || '',
    weekNumber: lessonData?.weekNumber || 1,
    order: lessonData?.order || 1,
    videoUrl: lessonData?.videoUrl || '',
    videoDuration: lessonData?.videoDuration || 1800, // 30 minutes in seconds
    isPublished: lessonData?.isPublished || false,
    resources: lessonData?.resources || [],
  });

  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...newResource, id: Date.now() }],
      }));
      setNewResource({ title: '', url: '' });
    }
  };

  const removeResource = (resourceId: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((r: any) => r.id !== resourceId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const lessonDataToSave = {
        ...formData,
        courseId,
        updatedAt: Timestamp.now(),
      };

      if (lessonId) {
        // Update existing lesson
        const lessonRef = doc(db, 'lessons', lessonId);
        await updateDoc(lessonRef, lessonDataToSave);
        console.log('Lesson updated successfully');
      } else {
        // Create new lesson
        const lessonDataToSaveWithCreated = {
          ...lessonDataToSave,
          createdAt: Timestamp.now(),
        };
        const lessonRef = await addDoc(collection(db, 'lessons'), lessonDataToSaveWithCreated);
        console.log('Lesson created successfully:', lessonRef.id);
      }

      setSuccess(lessonId ? 'Lesson updated successfully!' : 'Lesson created successfully!');
      onSave(lessonDataToSave);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
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
              label="Lesson Title"
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
              rows={3}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Week Number"
                type="number"
                value={formData.weekNumber}
                onChange={(e) => handleInputChange('weekNumber', Number(e.target.value))}
                required
              />

              <TextField
                fullWidth
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', Number(e.target.value))}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Video URL (YouTube/Vimeo)"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Video Duration (seconds)"
                type="number"
                value={formData.videoDuration}
                onChange={(e) => handleInputChange('videoDuration', Number(e.target.value))}
                helperText={`Current: ${formatDuration(formData.videoDuration)}`}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  />
                }
                label="Published"
              />
            </Box>

            {/* Resources Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Resources
              </Typography>
              
              {/* Add Resource */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Resource Title"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Resource URL"
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addResource}
                  disabled={!newResource.title || !newResource.url}
                  size="small"
                >
                  Add
                </Button>
              </Box>

              {/* Existing Resources */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.resources.map((resource: any) => (
                  <Chip
                    key={resource.id}
                    label={resource.title}
                    onDelete={() => removeResource(resource.id)}
                    deleteIcon={<Delete />}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading || !formData.title || !formData.description}
            >
              {loading ? 'Saving...' : (lessonId ? 'Update Lesson' : 'Create Lesson')}
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

export default LessonEditor; 