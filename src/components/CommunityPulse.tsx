import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  SxProps,
  Theme,
} from '@mui/material';
import {
  People,
  TrendingUp,
  LocalFireDepartment,
  ChatBubble,
  School,
  Star,
} from '@mui/icons-material';
import { communityService, CommunityStats } from '../services/communityService';

interface CommunityPulseProps {
  cohortId?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

const CommunityPulse: React.FC<CommunityPulseProps> = ({ cohortId, className, sx }) => {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = communityService.subscribeToCommunityStats(cohortId, (newStats) => {
      setStats(newStats);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [cohortId]);

  if (loading) {
    return (
      <Card className={className} sx={sx}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className} sx={sx}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Community Pulse
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error || 'Unable to load community data'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getEngagementColor = (score: string) => {
    switch (score) {
      case 'High': return 'success.main';
      case 'Medium': return 'warning.main';
      case 'Low': return 'error.main';
      default: return 'text.secondary';
    }
  };

  const getEngagementIcon = (score: string) => {
    switch (score) {
      case 'High': return <Star sx={{ color: 'success.main' }} />;
      case 'Medium': return <TrendingUp sx={{ color: 'warning.main' }} />;
      case 'Low': return <School sx={{ color: 'error.main' }} />;
      default: return <School />;
    }
  };

  return (
    <Card className={className} sx={sx}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Community Pulse
        </Typography>

        {/* Real-time Metrics */}
        <Box sx={{ mb: 2 }}>
          {/* Total Users Online */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <People sx={{ color: 'primary.main', fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {stats.totalUsersOnline}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                users online globally
              </Typography>
            </Box>
          </Box>

          {/* Academy Users Online */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <People sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {stats.academyUsersOnline}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                students online globally
              </Typography>
            </Box>
          </Box>

          {/* Cohort Active Users */}
          {cohortId && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <People sx={{ color: 'info.main', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {stats.cohortActiveUsers}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  from your cohort online
                </Typography>
              </Box>
            </Box>
          )}

          {/* Questions Last Week */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <ChatBubble sx={{ color: 'warning.main', fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {stats.questionsLastWeek}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                questions asked this week
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Gamification Metrics */}
        <Box sx={{ mb: 2 }}>
          {/* Hot Streak */}
          {stats.hotStreak > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <LocalFireDepartment sx={{ color: 'error.main', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" color="error.main" sx={{ fontWeight: 600 }}>
                  {stats.hotStreak}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  students completed lessons today
                </Typography>
              </Box>
            </Box>
          )}

          {/* Community Buzz */}
          {stats.communityBuzz > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <TrendingUp sx={{ color: 'success.main', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                  {stats.communityBuzz}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  new questions in last 24h
                </Typography>
              </Box>
            </Box>
          )}

          {/* Upvoted Content */}
          {stats.upvotedContent > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Star sx={{ color: 'warning.main', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" color="warning.main" sx={{ fontWeight: 600 }}>
                  {stats.upvotedContent}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  items upvoted in last 24h
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Engagement Score */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          p: 1.5, 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderRadius: 1,
          border: `1px solid ${getEngagementColor(stats.engagementScore)}`
        }}>
          {getEngagementIcon(stats.engagementScore)}
          <Typography variant="body2" sx={{ 
            color: getEngagementColor(stats.engagementScore), 
            fontWeight: 500 
          }}>
            Community Engagement: {stats.engagementScore}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CommunityPulse; 