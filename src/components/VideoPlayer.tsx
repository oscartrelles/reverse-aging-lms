import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, LinearProgress, Alert, Skeleton } from '@mui/material';
import { CheckCircle, PlayArrow } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { lessonProgressService, VideoProgress } from '../services/lessonProgressService';

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  courseId: string;
  videoDuration?: number;
  onProgressUpdate?: (progress: VideoProgress) => void;
  onComplete?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  lessonId,
  courseId,
  videoDuration,
  onProgressUpdate,
  onComplete,
}) => {
  const { currentUser } = useAuth();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const isCompletedRef = useRef(false); // Ref to track completion status for closures
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);

  // Extract video ID from URL
  const getVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Update lesson duration in Firestore when extracted from player
  const updateLessonDuration = async (lessonId: string, duration: number) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebaseConfig');
      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, { videoDuration: duration });
      console.log(`✅ Updated lesson ${lessonId} duration to ${duration} seconds`);
    } catch (error) {
      console.error('❌ Error updating lesson duration:', error);
    }
  };

  const videoId = getVideoId(videoUrl);

  // Load existing progress when component mounts
  useEffect(() => {
    const loadExistingProgress = async () => {
      if (!currentUser) return;
      
      try {
        const progress = await lessonProgressService.getLessonProgress(
          currentUser.id,
          lessonId
        );
        
        if (progress) {
          setProgress(progress.watchedPercentage || 0);
          setIsCompleted(progress.isCompleted || false);
          isCompletedRef.current = progress.isCompleted || false; // Update ref immediately
          
          console.log('✅ Loaded existing progress:', {
            watchedPercentage: progress.watchedPercentage,
            isCompleted: progress.isCompleted
          });
          
          // If lesson is completed, log a warning about any future updates
          if (progress.isCompleted) {
            console.log('🛡️ Lesson is already completed - no further updates will be made');
          }
        }
      } catch (error) {
        console.error('❌ Error loading existing progress:', error);
      }
    };

    loadExistingProgress();
  }, [currentUser, lessonId]);

  // Initialize YouTube API
  useEffect(() => {
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const createPlayer = () => {
    if (!containerRef.current || !videoId) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
              playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          // Distraction-free settings for e-learning
          iv_load_policy: 3, // Disable video annotations
          cc_load_policy: 0, // Disable closed captions by default
          fs: 1, // Enable fullscreen button
          playsinline: 1, // Play inline on mobile
          // More restrictive settings for e-learning
          disablekb: 1, // Disable keyboard controls (prevents accidental shortcuts)
          enablejsapi: 1, // Enable JavaScript API for our custom controls
          origin: window.location.origin, // Set origin for security
          // Custom controls for e-learning
          controls: 0, // Hide default YouTube controls (we'll add our own)
          showinfo: 0, // Hide video title and uploader info
        },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  };

  const onPlayerReady = (event: any) => {
    setIsReady(true);
    const playerDuration = event.target.getDuration();
    setDuration(playerDuration);
    
    // If no duration was provided via props, extract it from the player and save it
    if (!videoDuration && playerDuration > 0) {
      updateLessonDuration(lessonId, playerDuration);
    }
  };

  const onPlayerStateChange = (event: any) => {
    const player = event.target;
    const state = player.getPlayerState();

    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (state === 1) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (state === 2 || state === 0) {
      setIsPlaying(false);
      stopProgressTracking();
    }

    // Check if video ended
    if (state === 0) {
      handleVideoComplete();
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event.data);
    
    let errorMessage = 'Error loading video. Please try again.';
    
    // Handle specific YouTube error codes
    switch (event.data) {
      case 2:
        errorMessage = 'Invalid video ID. Please check the video URL.';
        break;
      case 5:
        errorMessage = 'HTML5 player error. Please try refreshing the page.';
        break;
      case 100:
        errorMessage = 'Video not found or removed.';
        break;
      case 101:
      case 150:
        errorMessage = 'Video embedding not allowed. Please contact the course administrator.';
        break;
      default:
        errorMessage = `Video error (${event.data}). Please try again.`;
    }
    
    setError(errorMessage);
  };

  const startProgressTracking = () => {
    if (isTracking) return;
    setIsTracking(true);

          const trackProgress = () => {
        if (playerRef.current) {
          const player = playerRef.current;
          const playerState = player.getPlayerState();
          
          // Only track progress if video is playing (state 1)
          if (playerState === 1) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            const percentage = (currentTime / duration) * 100;

            setCurrentTime(currentTime);
            setProgress(percentage);

            // Notify parent component
            onProgressUpdate?.({
              currentTime,
              duration,
              percentage,
            });

            // Check if video is completed (90%+ watched) - only if not already completed
            if (percentage >= 90 && !isCompletedRef.current) {
              handleVideoComplete();
            }
          }
        }
      };

      const interval = setInterval(trackProgress, 1000); // Update every 1 second for smooth progress bar
      
      // Separate interval for Firebase updates (once per minute to reduce costs)
      const firebaseInterval = setInterval(() => {
        if (playerRef.current) {
          const player = playerRef.current;
          const playerState = player.getPlayerState();
          
          // Only update Firebase if video is playing and lesson is not completed
          if (playerState === 1 && currentUser && !isCompletedRef.current) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            const percentage = (currentTime / duration) * 100;
            
            console.log('📊 Updating Firebase progress:', { percentage: percentage.toFixed(1) + '%' });
            
            lessonProgressService.updateVideoProgress(currentUser.id, lessonId, courseId, {
              currentTime,
              duration,
              percentage,
            }).catch(console.error);
          }
        }
      }, 60000); // Update Firebase every 60 seconds

    return () => {
      clearInterval(interval);
      clearInterval(firebaseInterval);
      setIsTracking(false);
    };
  };

  const stopProgressTracking = () => {
    setIsTracking(false);
  };

  const handleVideoComplete = useCallback(async () => {
    if (isCompletedRef.current) {
      console.log('✅ Lesson already completed, skipping completion logic');
      return;
    }

    setIsCompleted(true);
    isCompletedRef.current = true; // Update ref immediately
    onComplete?.();

    if (currentUser) {
      try {
        await lessonProgressService.completeLesson(
          currentUser.id,
          lessonId,
          courseId,
          progress
        );
        console.log('✅ Video completed and lesson marked as complete');
      } catch (error) {
        console.error('❌ Error marking lesson as complete:', error);
      }
    }
  }, [currentUser, lessonId, courseId, progress, isCompleted, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Video Container with Overlays */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 0,
          paddingTop: '56.25%', // 16:9 aspect ratio
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#000',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        {/* YouTube Player Container */}
        <Box
          ref={containerRef}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            // Ensure YouTube iframe fills the container
            '& iframe': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
            },
          }}
        />

        {/* Custom Play Overlay */}
        {isReady && !isPlaying && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
              cursor: 'pointer',
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (playerRef.current) {
                playerRef.current.playVideo();
              }
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <PlayArrow sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Box>
        )}

        {/* Custom Video Controls */}
        {isReady && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              padding: 2,
              zIndex: 5,
              opacity: isPlaying ? 1 : 0,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            {/* Progress Bar */}
            <Box sx={{ mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #4A7B63 0%, #9AB5A7 100%)',
                  },
                }}
              />
            </Box>

            {/* Controls Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left: Play/Pause & Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (playerRef.current) {
                      if (isPlaying) {
                        playerRef.current.pauseVideo();
                      } else {
                        playerRef.current.playVideo();
                      }
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    color: 'white',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {isPlaying ? (
                    <Box component="span" sx={{ fontSize: 24 }}>⏸️</Box>
                  ) : (
                    <PlayArrow sx={{ fontSize: 24 }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Box>

              {/* Right: Spacer for balance */}
              <Box sx={{ width: 20 }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Completion Status */}
      {isCompleted && (
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: 'success.light', 
          borderRadius: 2,
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          border: '1px solid',
          borderColor: 'success.main'
        }}>
          <CheckCircle color="success" />
          <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.dark' }}>
            🎉 Lesson completed! Great job!
          </Typography>
        </Box>
      )}

      {/* Loading State */}
      {!isReady && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 300,
          backgroundColor: 'grey.50',
          borderRadius: 2,
          gap: 2
        }}>
          <Skeleton variant="rectangular" width="100%" height={225} sx={{ borderRadius: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer; 