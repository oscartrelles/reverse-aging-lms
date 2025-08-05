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
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Lesson } from '../../types';
import { courseManagementService } from '../../services/courseManagementService';

interface LessonEditorProps {
  lessonId?: string;
  courseId: string;
  lessonData?: Lesson | null;
  onSave: (lessonData: any) => Promise<void>;
  onCancel: () => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  lessonId,
  courseId,
  lessonData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: lessonData?.title || '',
    description: lessonData?.description || '',
    videoUrl: lessonData?.videoUrl || '',
    videoDuration: lessonData?.videoDuration || 0,
    weekNumber: lessonData?.weekNumber || 1,
    duration: lessonData?.duration || 60,
    isPublished: lessonData?.isPublished || false,
    order: lessonData?.order || 1,
    resources: lessonData?.resources || [],
    whatYoullMaster: lessonData?.whatYoullMaster || [],
    keyPractice: lessonData?.keyPractice || '',
    theme: lessonData?.theme || '',
    learningObjectives: lessonData?.learningObjectives || [],
  });

  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'pdf' as const });
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
        resources: [...prev.resources, { ...newResource, id: Date.now().toString() }],
      }));
      setNewResource({ title: '', url: '', type: 'pdf' });
    }
  };

  const removeResource = (resourceId: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId),
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
      whatYoullMaster: prev.whatYoullMaster.filter((_, i) => i !== index),
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
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index),
    }));
  };

  const extractVideoDuration = async (videoUrl: string) => {
    if (!videoUrl) {
      setError('Please enter a video URL first');
      return;
    }

    console.log('Extracting duration for URL:', videoUrl);
    setExtractingDuration(true);
    setError(null);
    setSuccess(null);

    try {
      // Extract video ID from YouTube URL - handle multiple formats
      let videoId = null;
      let transformedUrl = videoUrl;
      
      // Handle youtube.com/watch?v=VIDEO_ID
      const watchMatch = videoUrl.match(/youtube\.com\/watch\?v=([^&\n?#]+)/);
      if (watchMatch) {
        videoId = watchMatch[1];
        transformedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Handle youtu.be/VIDEO_ID
      const shortMatch = videoUrl.match(/youtu\.be\/([^&\n?#]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
        transformedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Handle youtube.com/embed/VIDEO_ID
      const embedMatch = videoUrl.match(/youtube\.com\/embed\/([^&\n?#]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
        transformedUrl = videoUrl; // Already in correct format
      }
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL format. Please use a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID).');
      }
      
      // Check if YouTube API key is available
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      
      if (apiKey) {
        // Use YouTube Data API to get video duration
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch video data from YouTube API');
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          throw new Error('Video not found');
        }

        const duration = data.items[0].contentDetails.duration;
        
        // Parse ISO 8601 duration format (PT1H2M3S)
        const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!durationMatch) {
          throw new Error('Invalid duration format');
        }

        const hours = parseInt(durationMatch[1] || '0');
        const minutes = parseInt(durationMatch[2] || '0');
        const seconds = parseInt(durationMatch[3] || '0');
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        setFormData(prev => ({
          ...prev,
          videoDuration: totalSeconds,
          videoUrl: transformedUrl, // Update with embed URL
        }));
        
        setError(null);
        setSuccess('✅ Video duration extracted and URL converted to embed format!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Fallback: Show message to enter duration manually
        setError('YouTube API key not configured. Please enter the video duration manually in seconds. You can find this by right-clicking on the video and selecting "Copy video URL" or by checking the video description.');
        setExtractingDuration(false);
        return;
      }
    } catch (error) {
      console.error('Error extracting video duration:', error);
      setError('Failed to extract video duration. Please enter it manually.');
      setSuccess(null);
    } finally {
      setExtractingDuration(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const validateAndTransformYouTubeUrl = (url: string) => {
    // Handle youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&\n?#]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    // Handle youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^&\n?#]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }
    
    // Handle youtube.com/embed/VIDEO_ID (already correct)
    const embedMatch = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
    if (embedMatch) {
      return url;
    }
    
    return null; // Invalid URL
  };

  const isYouTubeUrl = (url: string) => {
    return validateAndTransformYouTubeUrl(url) !== null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const lessonDataToSave = {
        ...formData,
        courseId,
      };

      await onSave(lessonDataToSave);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson');
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Lesson Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            placeholder="Enter lesson title"
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            multiline
            rows={3}
            placeholder="Enter lesson description"
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Video URL"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            placeholder="Enter YouTube video URL"
            helperText={
              formData.videoUrl.trim()
                ? isYouTubeUrl(formData.videoUrl)
                  ? "✅ Valid YouTube URL - will be converted to embed format"
                  : "❌ Invalid YouTube URL format"
                : "Supported formats: youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID"
            }
            error={Boolean(formData.videoUrl) && !isYouTubeUrl(formData.videoUrl)}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Video Duration (seconds)"
            type="number"
            value={formData.videoDuration}
            onChange={(e) => handleInputChange('videoDuration', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0 }}
            helperText={formData.videoDuration > 0 ? `Current: ${formatDuration(formData.videoDuration)}` : ''}
          />
        </Box>

        <Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => extractVideoDuration(formData.videoUrl)}
            disabled={extractingDuration || !formData.videoUrl.trim() || !isYouTubeUrl(formData.videoUrl)}
            startIcon={extractingDuration ? <CircularProgress size={16} /> : null}
          >
            {extractingDuration ? 'Extracting...' : 'Auto Extract Duration'}
          </Button>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Week Number"
            type="number"
            value={formData.weekNumber}
            onChange={(e) => handleInputChange('weekNumber', parseInt(e.target.value) || 1)}
            inputProps={{ min: 1 }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
            inputProps={{ min: 1 }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
            inputProps={{ min: 1 }}
            helperText="Order within the week"
          />
        </Box>



        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Theme"
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            placeholder="e.g., Mindset & Foundation, Nutrition & Metabolism"
            helperText="The main theme or topic of this lesson"
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            label="Key Practice"
            value={formData.keyPractice}
            onChange={(e) => handleInputChange('keyPractice', e.target.value)}
            multiline
            rows={2}
            placeholder="e.g., Morning meditation (5-10 min) + daily journaling"
            helperText="This will be displayed on the dashboard as the key practice for this week"
          />
        </Box>

        {/* Learning Objectives */}
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <Typography variant="subtitle1" gutterBottom>
            Learning Objectives
          </Typography>
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
              onClick={addLearningObjective}
              disabled={!newLearningObjective.trim()}
              size="small"
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {formData.learningObjectives.map((objective, index) => (
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

        {/* What You'll Master */}
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <Typography variant="subtitle1" gutterBottom>
            Key Concepts (What You'll Master)
          </Typography>
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
              onClick={addMasteryPoint}
              disabled={!newMasteryPoint.trim()}
              size="small"
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {formData.whatYoullMaster.map((point, index) => (
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

        {/* Resources */}
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <Typography variant="subtitle1" gutterBottom>
            Resources
          </Typography>
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newResource.type}
                onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as any }))}
                label="Type"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="workbook">Workbook</MenuItem>
                <MenuItem value="link">Link</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={addResource}
              disabled={!newResource.title || !newResource.url}
              size="small"
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.resources.map((resource) => (
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
            />
          }
          label="Publish Lesson"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {lessonId ? 'Update Lesson' : 'Create Lesson'}
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

export default LessonEditor; 