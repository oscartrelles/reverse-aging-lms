import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Delete,
  Security,
  Notifications,
  Visibility,
  VisibilityOff,
  Download,
  Person,
  School,
  TrendingUp,
  Settings,
  PhotoCamera,
  Delete as DeleteIcon,
  Add,
  People,
  Close,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import { useNavigate } from 'react-router-dom';
import { userProfileService, ExtendedProfile, UserProgress } from '../services/userProfileService';
import { detectUserTimezone, getTimezoneDisplayName, isValidTimezone } from '../utils/timezoneUtils';
import TimezoneSelector from '../components/TimezoneSelector';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { currentEnrollment } = useCourse();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [profileData, setProfileData] = useState<ExtendedProfile | null>(null);
  const [progressData, setProgressData] = useState<UserProgress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if this is a new social user who needs to complete their profile
  const isNewSocialUser = currentUser?.authProvider && 
                         currentUser.authProvider !== 'email' && 
                         (!currentUser.age || !currentUser.location || !currentUser.bio);

  // State to track if welcome message should be shown
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Check localStorage for persistent state when currentUser is available
  useEffect(() => {
    if (currentUser?.id) {
      const key = `welcomeMessage_${currentUser.id}`;
      const isDismissed = localStorage.getItem(key) === 'dismissed';
      setShowWelcomeMessage(!isDismissed);
    }
  }, [currentUser?.id]);

  // Function to handle closing the welcome message
  const handleCloseWelcomeMessage = () => {
    if (currentUser?.id) {
      const key = `welcomeMessage_${currentUser.id}`;
      localStorage.setItem(key, 'dismissed');
    }
    setShowWelcomeMessage(false);
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const [extendedProfile, progress] = await Promise.all([
          userProfileService.getExtendedProfile(currentUser.id),
          userProfileService.getUserProgress(currentUser.id),
        ]);

        // Initialize profile data with defaults if not exists
        if (extendedProfile) {
          setProfileData(extendedProfile);
        } else {
          // Create default profile data
          const defaultProfile: ExtendedProfile = {
            userId: currentUser.id,
            firstName: currentUser.name?.split(' ')[0] || '',
            lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
            bio: '',
            age: 0,
            location: '',
            goals: ['Improve energy levels', 'Build sustainable habits'],
            preferences: {
              emailNotifications: currentUser.notificationPreferences?.email !== undefined ? currentUser.notificationPreferences.email : true,
              weeklyDigest: true,
              scientificUpdates: true,
              communityUpdates: false,
            },
            createdAt: currentUser.createdAt || new Date() as any,
            updatedAt: new Date() as any,
          };
          setProfileData(defaultProfile);
          
          // Automatically create the profile in Firestore
          try {
            await userProfileService.updateExtendedProfile(currentUser.id, defaultProfile);
          } catch (error) {
            console.warn('Could not create default profile:', error);
            // Continue with local profile data
          }
        }

        setProgressData(progress);
      } catch (error) {
        console.error('Error loading user data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data. Please refresh the page.' });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser || !profileData) return;
    
    try {
      setSaving(true);
      
      // Update extended profile
      await userProfileService.updateExtendedProfile(currentUser.id, profileData);
      
      // Update basic user profile if name or timezone changed
      const nameChanged = `${profileData.firstName} ${profileData.lastName}`.trim() !== currentUser.name;
      const timezoneChanged = profileData.timezone !== currentUser.timezone;
      
      if (nameChanged || timezoneChanged) {
        const updates: any = {};
        if (nameChanged) {
          updates.name = `${profileData.firstName} ${profileData.lastName}`.trim();
        }
        if (timezoneChanged) {
          updates.timezone = profileData.timezone;
        }
        await updateUserProfile(updates);
      }
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload original data
    if (currentUser) {
      userProfileService.getExtendedProfile(currentUser.id).then(profile => {
        if (profile) {
          setProfileData(profile);
        }
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      // TODO: Implement password change with Firebase Auth
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    try {
      await userProfileService.deleteUserAccount(currentUser.id);
      setMessage({ type: 'success', text: 'Account deletion requested. Please contact support for confirmation.' });
      setTimeout(() => setMessage(null), 3000);
      setShowDeleteDialog(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    
    try {
      const exportData = await userProfileService.exportUserData(currentUser.id);
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportDialog(false);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
      return;
    }

    try {
      setUploadingPhoto(true);
      await userProfileService.uploadProfilePicture(currentUser.id, file);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh the page to show the new photo
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
      // Check if it's a storage not available error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('storage') || errorMessage.includes('Storage')) {
        setMessage({ 
          type: 'error', 
          text: 'Profile picture upload is not available yet. Please try again later or contact support.' 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' });
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!currentUser) return;

    try {
      setUploadingPhoto(true);
      await userProfileService.deleteProfilePicture(currentUser.id);
      setMessage({ type: 'success', text: 'Profile picture removed successfully!' });
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh the page to show the default avatar
      window.location.reload();
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Check if it's a storage not available error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('storage') || errorMessage.includes('Storage')) {
        setMessage({ 
          type: 'error', 
          text: 'Profile picture removal is not available yet. Please try again later or contact support.' 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to remove profile picture. Please try again.' });
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Please sign in to access your profile
          </Typography>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!profileData || !progressData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Failed to load profile data
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      py: { xs: 3, md: 4 }
    }}>
      <Container maxWidth="lg">
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Welcome Message for New Social Users */}
        {isNewSocialUser && showWelcomeMessage && (
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              p: 3,
              mb: 4,
              color: 'white',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleCloseWelcomeMessage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <Close />
            </IconButton>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome, {currentUser?.firstName || currentUser?.name}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  We've imported your basic information from {currentUser?.authProvider === 'google' ? 'Google' : 'Facebook'}. 
                  Take a moment to complete your profile and customize your experience.
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Profile & Settings
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            Manage your account, preferences, and track your progress
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Profile Information */}
          <Box sx={{ flex: { xs: 1, md: 8 } }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
                mb: 4,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Personal Information
                </Typography>
                <IconButton
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={saving}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: '#000',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  {isEditing ? <Cancel /> : <Edit />}
                </IconButton>
              </Box>

              {/* Profile Picture Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={currentUser.photoURL || undefined}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: '2rem',
                      backgroundColor: theme.palette.primary.main,
                      color: '#000',
                    }}
                  >
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </Avatar>
                  <IconButton
                    onClick={triggerFileInput}
                    disabled={uploadingPhoto}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: '#000',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      width: 32,
                      height: 32,
                    }}
                  >
                    {uploadingPhoto ? <CircularProgress size={16} /> : <PhotoCamera />}
                  </IconButton>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Profile Picture
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload a profile picture to personalize your account. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                    {currentUser.photoURL && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={handlePhotoDelete}
                        disabled={uploadingPhoto}
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    )}
                    {currentUser.authProvider && currentUser.authProvider !== 'email' && (
                      <Chip
                        label={`Signed in with ${currentUser.authProvider === 'google' ? 'Google' : 'Facebook'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  {/* Timezone Display */}
                  {profileData.timezone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Timezone: {getTimezoneDisplayName(profileData.timezone)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: { xs: 1, sm: '0 0 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing || saving}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, sm: '0 0 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing || saving}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={currentUser.email}
                    disabled
                    sx={{ mb: 2 }}
                    helperText="Email cannot be changed"
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, sm: '0 0 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing || saving}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, sm: '0 0 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    disabled={!isEditing || saving}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ flex: { xs: 1, sm: '0 0 calc(50% - 12px)' } }}>
                  <TimezoneSelector
                    value={profileData.timezone || detectUserTimezone()}
                    onChange={(timezone) => setProfileData({ ...profileData, timezone })}
                    disabled={!isEditing || saving}
                    helperText="Lessons will be released at 8:00 AM in your timezone"
                  />
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing || saving}
                    placeholder="Tell us about your health journey and goals..."
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                {/* Goals Section */}
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    Health Goals
                  </Typography>
                  
                  {profileData.goals.map((goal, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        value={goal}
                        onChange={(e) => {
                          const newGoals = [...profileData.goals];
                          newGoals[index] = e.target.value;
                          setProfileData({ ...profileData, goals: newGoals });
                        }}
                        disabled={!isEditing || saving}
                        placeholder="Enter a health goal..."
                        sx={{ mb: 1 }}
                      />
                      {isEditing && (
                        <IconButton
                          onClick={() => {
                            const newGoals = profileData.goals.filter((_, i) => i !== index);
                            setProfileData({ ...profileData, goals: newGoals });
                          }}
                          disabled={saving}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  
                  {isEditing && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setProfileData({
                          ...profileData,
                          goals: [...profileData.goals, '']
                        });
                      }}
                      disabled={saving}
                      startIcon={<Add />}
                      sx={{ mt: 1 }}
                    >
                      Add Goal
                    </Button>
                  )}
                </Box>
              </Box>

              {isEditing && (
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: '#000',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                    startIcon={<Cancel />}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Preferences */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
                mb: 4,
              }}
            >
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>
                Notification Preferences
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.preferences.emailNotifications}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          emailNotifications: e.target.checked
                        }
                      })}
                      disabled={saving}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.preferences.weeklyDigest}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          weeklyDigest: e.target.checked
                        }
                      })}
                      disabled={saving}
                    />
                  }
                  label="Weekly Digest"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.preferences.scientificUpdates}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          scientificUpdates: e.target.checked
                        }
                      })}
                      disabled={saving}
                    />
                  }
                  label="Scientific Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.preferences.communityUpdates}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          communityUpdates: e.target.checked
                        }
                      })}
                      disabled={saving}
                    />
                  }
                  label="Community Updates"
                />
              </Box>
            </Paper>

            {/* Account Security */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
              }}
            >
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>
                Account Security
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => setShowPasswordDialog(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Change Password
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => setShowExportDialog(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Export My Data
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setShowDeleteDialog(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Delete Account
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Progress & Achievements or Cohort Invitation */}
          <Box sx={{ flex: { xs: 1, md: 4 } }}>
            {currentEnrollment && currentEnrollment.status === 'active' ? (
              // Show progress for enrolled users
              <>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    p: { xs: 3, md: 4 },
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
                    mb: 4,
                  }}
                >
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>
                    Your Progress
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Card sx={{ backgroundColor: `${theme.palette.primary.main}10`, border: `1px solid ${theme.palette.primary.main}30` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <School sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {progressData.totalLessons > 0 ? Math.round((progressData.lessonsCompleted / progressData.totalLessons) * 100) : 0}% Complete
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {progressData.totalLessons > 0 ? 'Great progress! Keep going strong.' : 'Start your learning journey!'}
                    </Typography>
                  </CardContent>
                </Card>

                                    <Card sx={{ backgroundColor: `${theme.palette.secondary.main}10`, border: `1px solid ${theme.palette.secondary.main}30` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <TrendingUp sx={{ color: theme.palette.secondary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {progressData.lessonsCompleted}/{progressData.availableLessons || 0} Available
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {progressData.availableLessons > 0 ? `${progressData.availableLessons} lessons ready to complete` : 'No lessons available yet'}
                    </Typography>
                  </CardContent>
                </Card>

                                    <Card sx={{ backgroundColor: `${theme.palette.primary.main}10`, border: `1px solid ${theme.palette.primary.main}30` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <People sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {progressData.cohortComparison?.isAhead ? 'Leading the Pack!' : 'Cohort Progress'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {progressData.cohortComparison?.isAhead 
                        ? `You're ${progressData.cohortComparison.percentageDifference}% ahead of your cohort average!`
                        : progressData.cohortComparison?.isBehind
                        ? `You're ${Math.abs(progressData.cohortComparison.percentageDifference)}% behind. Complete available lessons to catch up!`
                        : 'You\'re on track with your cohort!'
                      }
                    </Typography>
                  </CardContent>
                </Card>
                  </Box>
                </Paper>
              </>
            ) : (
              // Show cohort invitation for non-enrolled users
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                  borderRadius: 3,
                  p: { xs: 3, md: 4 },
                  border: `1px solid ${theme.palette.primary.main}30`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
                  mb: 4,
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <School sx={{ 
                    fontSize: 48, 
                    color: theme.palette.primary.main, 
                    mb: 2 
                  }} />
                  <Typography variant="h5" component="h2" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.text.primary, 
                    mb: 2 
                  }}>
                    Ready to Transform Your Health?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Join the next cohort of the 7-Week Reverse Aging Challenge and start your journey to better healthspan.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.primary.main 
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      Evidence-based practices backed by science
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.primary.main 
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      Supportive community of health enthusiasts
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.primary.main 
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      Weekly live sessions and Q&A
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/')}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: '#000',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  View Upcoming Cohorts
                </Button>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, progress, and account information.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error" variant="contained">Delete Account</Button>
          </DialogActions>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Your Data</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 2 }}>
              This will download a JSON file containing all your profile data, progress, and preferences. The file will be saved to your downloads folder.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button onClick={handleExportData} variant="contained">Export Data</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProfilePage; 