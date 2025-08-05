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
    <Card className={className} sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Community Pulse
        </Typography>

        {/* Key Metrics Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 1, 
          mb: 1.5 
        }}>
          {/* Total Users Online */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 0.75, 
            backgroundColor: 'rgba(25, 118, 210, 0.1)', 
            borderRadius: 1,
            border: '1px solid rgba(25, 118, 210, 0.2)'
          }}>
            <People sx={{ color: 'primary.main', fontSize: 18 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {stats.totalUsersOnline}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Online Globally
              </Typography>
            </Box>
          </Box>

          {/* Academy Users Online */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 0.75, 
            backgroundColor: 'rgba(156, 39, 176, 0.1)', 
            borderRadius: 1,
            border: '1px solid rgba(156, 39, 176, 0.2)'
          }}>
            <People sx={{ color: 'secondary.main', fontSize: 18 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {stats.academyUsersOnline}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Students Online
              </Typography>
            </Box>
          </Box>

          {/* Cohort Active Users */}
          {cohortId && (
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              p: 0.75, 
              backgroundColor: 'rgba(3, 169, 244, 0.1)', 
              borderRadius: 1,
              border: '1px solid rgba(3, 169, 244, 0.2)'
            }}>
              <People sx={{ color: 'info.main', fontSize: 18 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 700, lineHeight: 1 }}>
                  {stats.cohortActiveUsers}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Your Cohort
                </Typography>
              </Box>
            </Box>
          )}

          {/* Questions Last Week */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 0.75, 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            borderRadius: 1,
            border: '1px solid rgba(76, 175, 80, 0.2)'
          }}>
            <ChatBubble sx={{ color: 'success.main', fontSize: 18 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {stats.questionsLastWeek}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Questions This Week
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Engagement Score */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.75,
          p: 0.75, 
          backgroundColor: `rgba(${stats.engagementScore === 'High' ? '76, 175, 80' : stats.engagementScore === 'Medium' ? '255, 152, 0' : '244, 67, 54'}, 0.1)`, 
          borderRadius: 1,
          border: `1px solid ${getEngagementColor(stats.engagementScore)}`,
          mb: 2
        }}>
          {getEngagementIcon(stats.engagementScore)}
          <Typography variant="body2" sx={{ 
            color: getEngagementColor(stats.engagementScore), 
            fontWeight: 600
          }}>
            {stats.engagementScore} Engagement
          </Typography>
        </Box>

        {/* Activity Highlights */}
        {(stats.hotStreak > 0 || stats.communityBuzz > 0 || stats.upvotedContent > 0) && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {/* Hot Streak */}
              {stats.hotStreak > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  p: 0.75, 
                  backgroundColor: 'rgba(0, 150, 136, 0.1)', 
                  borderRadius: 1 
                }}>
                  <LocalFireDepartment sx={{ color: 'teal.main', fontSize: 16 }} />
                  <Typography variant="body2" color="teal.main" sx={{ fontWeight: 600 }}>
                    {stats.hotStreak} students completed lessons today
                  </Typography>
                </Box>
              )}

              {/* Community Buzz */}
              {stats.communityBuzz > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  p: 0.75, 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 1 
                }}>
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    {stats.communityBuzz} new questions in last 24h
                  </Typography>
                </Box>
              )}

              {/* Upvoted Content */}
              {stats.upvotedContent > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  p: 0.75, 
                  backgroundColor: 'rgba(156, 39, 176, 0.1)', 
                  borderRadius: 1 
                }}>
                  <Star sx={{ color: 'secondary.main', fontSize: 16 }} />
                  <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600 }}>
                    {stats.upvotedContent} items upvoted in last 24h
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityPulse; 