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
  IconButton,
} from '@mui/material';
import { Save, Cancel, Add, Delete, PlayArrow } from '@mui/icons-material';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { extractVideoDuration, formatDuration as formatVideoDuration } from '../../utils/videoUtils';

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
    whatYoullMaster: lessonData?.whatYoullMaster || [],
    keyPractice: lessonData?.keyPractice || '',
    theme: lessonData?.theme || '',
    learningObjectives: lessonData?.learningObjectives || [],
  });

  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [newMasteryPoint, setNewMasteryPoint] = useState('');
  const [newLearningObjective, setNewLearningObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extractingDuration, setExtractingDuration] = useState(false);

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

  const addMasteryPoint = () => {
    if (newMasteryPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        whatYoullMaster: [...prev.whatYoullMaster, newMasteryPoint.trim()],
      }));
      setNewMasteryPoint('');
    }
  };

  const removeMasteryPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatYoullMaster: prev.whatYoullMaster.filter((_: string, i: number) => i !== index),
    }));
  };

  const addLearningObjective = () => {
    if (newLearningObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newLearningObjective.trim()],
      }));
      setNewLearningObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_: string, i: number) => i !== index),
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
    return formatVideoDuration(seconds);
  };

  const handleExtractDuration = async () => {
    if (!formData.videoUrl) {
      setError('Please enter a video URL first');
      return;
    }

    setExtractingDuration(true);
    setError(null);

    try {
      const duration = await extractVideoDuration(formData.videoUrl);
      if (duration) {
        setFormData(prev => ({
          ...prev,
          videoDuration: duration,
        }));
        setSuccess(`Duration extracted: ${formatVideoDuration(duration)}`);
      } else {
        setError('Could not extract duration. Please check the video URL.');
      }
    } catch (error) {
      console.error('Error extracting duration:', error);
      setError('Failed to extract duration. Please enter it manually.');
    } finally {
      setExtractingDuration(false);
    }
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
            {/* 1. Lesson Title */}
            <TextField
              fullWidth
              label="Lesson Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />

            {/* 2. Description */}
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
              required
            />

            {/* 3. Theme */}
            <TextField
              fullWidth
              label="Theme"
              value={formData.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              placeholder="e.g., Mindset & Foundation, Nutrition & Metabolism, Movement & Recovery"
              helperText="The main theme or topic of this lesson"
            />

            {/* 4. Learning Objectives Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Learning Objectives
              </Typography>
              
              {/* Add Learning Objective */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Learning Objective"
                  value={newLearningObjective}
                  onChange={(e) => setNewLearningObjective(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="e.g., Understand the difference between healthspan and lifespan"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLearningObjective();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addLearningObjective}
                  disabled={!newLearningObjective.trim()}
                  size="small"
                >
                  Add
                </Button>
              </Box>

              {/* Existing Learning Objectives */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.learningObjectives.map((objective: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      • {objective}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeLearningObjective(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 5. Key Concepts (What You'll Master) Section */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Key Concepts (What You'll Master)
              </Typography>
              
              {/* Add Mastery Point */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Key Concept"
                  value={newMasteryPoint}
                  onChange={(e) => setNewMasteryPoint(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="e.g., Healthspan vs. lifespan understanding"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMasteryPoint();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addMasteryPoint}
                  disabled={!newMasteryPoint.trim()}
                  size="small"
                >
                  Add
                </Button>
              </Box>

              {/* Existing Mastery Points */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.whatYoullMaster.map((point: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      • {point}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeMasteryPoint(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 6. Key Practices */}
            <TextField
              fullWidth
              label="Key Practice"
              value={formData.keyPractice}
              onChange={(e) => handleInputChange('keyPractice', e.target.value)}
              multiline
              rows={2}
              placeholder="e.g., Morning meditation (5-10 min) + daily journaling to build awareness"
              helperText="This will be displayed on the dashboard as the key practice for this week"
            />

            {/* 7. Resources Section */}
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

            {/* 8. Technical Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Technical Settings
              </Typography>
              
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

                <Button
                  variant="outlined"
                  startIcon={extractingDuration ? <CircularProgress size={16} /> : <PlayArrow />}
                  onClick={handleExtractDuration}
                  disabled={extractingDuration || !formData.videoUrl}
                  sx={{ minWidth: 140 }}
                >
                  {extractingDuration ? 'Extracting...' : 'Auto Extract'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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