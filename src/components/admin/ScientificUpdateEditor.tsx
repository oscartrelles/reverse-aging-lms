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
  Chip,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { Save, Cancel, Add, Delete } from '@mui/icons-material';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { CreateScientificUpdateData } from '../../services/scientificUpdateService';

interface ScientificUpdateEditorProps {
  updateId?: string; // undefined for new update
  updateData?: any; // existing update data
  onSave: (updateData: any) => void;
  onCancel: () => void;
}

const ScientificUpdateEditor: React.FC<ScientificUpdateEditorProps> = ({
  updateId,
  updateData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: updateData?.title || '',
    summary: updateData?.summary || '',
    keyFindings: updateData?.keyFindings || [''],
    fullReview: updateData?.fullReview || '',
    implications: updateData?.implications || '',
    externalLink: updateData?.externalLink || '',
    category: updateData?.category || 'Mindset',
    tags: updateData?.tags || [],
    publishedDate: updateData?.publishedDate ? 
      new Date(updateData.publishedDate.toDate()).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    'Mindset',
    'Nourishment', 
    'Breath',
    'Cold',
    'Heat',
    'Movement',
    'Community'
  ];

  const availableTags = [
    'longevity',
    'aging',
    'metabolism',
    'inflammation',
    'autophagy',
    'mitochondria',
    'telomeres',
    'hormones',
    'sleep',
    'stress',
    'exercise',
    'nutrition',
    'supplements',
    'fasting',
    'cold-exposure',
    'heat-therapy',
    'breathing',
    'meditation'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addKeyFinding = () => {
    setFormData(prev => ({
      ...prev,
      keyFindings: [...prev.keyFindings, ''],
    }));
  };

  const removeKeyFinding = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFindings: prev.keyFindings.filter((_: string, i: number) => i !== index),
    }));
  };

  const updateKeyFinding = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyFindings: prev.keyFindings.map((finding: string, i: number) => 
        i === index ? value : finding
      ),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove),
    }));
  };

  const addPresetTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.summary.trim()) {
        throw new Error('Summary is required');
      }
      if (!formData.fullReview.trim()) {
        throw new Error('Full review is required');
      }
      if (!formData.implications.trim()) {
        throw new Error('Implications are required');
      }
      if (formData.keyFindings.length === 0 || formData.keyFindings.every((f: string) => !f.trim())) {
        throw new Error('At least one key finding is required');
      }

      const updateDataToSave: CreateScientificUpdateData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        keyFindings: formData.keyFindings.filter((f: string) => f.trim()),
        fullReview: formData.fullReview.trim(),
        implications: formData.implications.trim(),
        externalLink: formData.externalLink.trim() || null,
        category: formData.category as any,
        tags: formData.tags,
        publishedDate: new Date(formData.publishedDate),
      };

      if (updateId) {
        // Update existing update
        const updateRef = doc(db, 'scientificUpdates', updateId);
        await updateDoc(updateRef, {
          ...updateDataToSave,
          updatedAt: Timestamp.now(),
        });
        console.log('Scientific update updated successfully');
      } else {
        // Create new update
        const updateDataToSaveWithCreated = {
          ...updateDataToSave,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          votes: 0,
          votedBy: [],
          readCount: 0,
          shareCount: 0,
        };
        const updateRef = await addDoc(collection(db, 'scientificUpdates'), updateDataToSaveWithCreated);
        console.log('Scientific update created successfully:', updateRef.id);
      }

      setSuccess(updateId ? 'Scientific update updated successfully!' : 'Scientific update created successfully!');
      onSave(updateDataToSave);
    } catch (error) {
      console.error('Error saving scientific update:', error);
      setError(error instanceof Error ? error.message : 'Failed to save scientific update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {updateId ? 'Edit Scientific Update' : 'Create New Scientific Update'}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title */}
            <Box>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Box>

            {/* Summary */}
            <Box>
              <TextField
                fullWidth
                label="Summary *"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                multiline
                rows={3}
                required
                helperText="Brief summary of the research findings"
              />
            </Box>

            {/* Category and Published Date */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth required>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    label="Category *"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Published Date *"
                  type="date"
                  value={formData.publishedDate}
                  onChange={(e) => handleInputChange('publishedDate', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            {/* Key Findings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Key Findings *
              </Typography>
              {formData.keyFindings.map((finding: string, index: number) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Key Finding ${index + 1}`}
                    value={finding}
                    onChange={(e) => updateKeyFinding(index, e.target.value)}
                    required
                  />
                  <IconButton
                    onClick={() => removeKeyFinding(index)}
                    disabled={formData.keyFindings.length === 1}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={addKeyFinding}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Add Key Finding
              </Button>
            </Box>

            {/* Full Review */}
            <Box>
              <TextField
                fullWidth
                label="Full Review *"
                value={formData.fullReview}
                onChange={(e) => handleInputChange('fullReview', e.target.value)}
                multiline
                rows={6}
                required
                helperText="Detailed analysis of the research"
              />
            </Box>

            {/* Implications */}
            <Box>
              <TextField
                fullWidth
                label="Implications *"
                value={formData.implications}
                onChange={(e) => handleInputChange('implications', e.target.value)}
                multiline
                rows={4}
                required
                helperText="What this means for healthspan and longevity"
              />
            </Box>

            {/* External Link */}
            <Box>
              <TextField
                fullWidth
                label="External Link (Optional)"
                value={formData.externalLink}
                onChange={(e) => handleInputChange('externalLink', e.target.value)}
                helperText="Link to the original research paper or article"
              />
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              
              {/* Current Tags */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.tags.map((tag: string) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              {/* Add New Tag */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add Custom Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  variant="outlined"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>

              {/* Preset Tags */}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick Add Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    clickable
                    variant={formData.tags.includes(tag) ? 'filled' : 'outlined'}
                    color={formData.tags.includes(tag) ? 'primary' : 'default'}
                    onClick={() => addPresetTag(tag)}
                  />
                ))}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                <Cancel sx={{ mr: 1 }} />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : (
                  <Save sx={{ mr: 1 }} />
                )}
                {updateId ? 'Update' : 'Create'} Scientific Update
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScientificUpdateEditor; 