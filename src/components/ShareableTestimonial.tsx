import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Star,
  FormatQuote,
  Share,
  ThumbUp,
  ThumbUpOutlined,
} from '@mui/icons-material';
import SocialSharing from './SocialSharing';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  date: string;
  tags?: string[];
  verified?: boolean;
  transformation?: string;
  beforeAfter?: {
    before: string;
    after: string;
  };
}

interface ShareableTestimonialProps {
  testimonial: Testimonial;
  showSharing?: boolean;
  showRating?: boolean;
  showTags?: boolean;
  showTransformation?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const ShareableTestimonial: React.FC<ShareableTestimonialProps> = ({
  testimonial,
  showSharing = true,
  showRating = true,
  showTags = true,
  showTransformation = false,
  variant = 'default',
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const generateShareText = () => {
    const baseText = `"${testimonial.content.substring(0, 100)}..." - ${testimonial.name}`;
    return `${baseText}\n\nJoin The Reverse Aging Academy and start your transformation journey!`;
  };

  const generateShareUrl = () => {
    return `${window.location.origin}/testimonials/${testimonial.id}`;
  };

  // Rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        sx={{
          fontSize: '1rem',
          color: index < rating ? theme.palette.warning.main : theme.palette.divider,
        }}
      />
    ));
  };

  // Transformation display
  const renderTransformation = () => {
    if (!showTransformation || !testimonial.transformation) return null;

    return (
      <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Transformation Results:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {testimonial.transformation}
        </Typography>
      </Box>
    );
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        }}
        className={className}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              src={testimonial.avatar}
              sx={{ width: 40, height: 40 }}
            >
              {testimonial.name.charAt(0)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {testimonial.name}
                </Typography>
                {testimonial.verified && (
                  <Chip
                    label="Verified"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              
              {showRating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  {renderStars(testimonial.rating)}
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {testimonial.content}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={handleLike}>
                    {liked ? <ThumbUp fontSize="small" color="primary" /> : <ThumbUpOutlined fontSize="small" />}
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {likeCount}
                  </Typography>
                </Box>
                
                {showSharing && (
                  <SocialSharing
                    url={generateShareUrl()}
                    title={generateShareText()}
                    hashtags={['reverseaging', 'testimonial', 'transformation']}
                    size="small"
                    showLabels={false}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Card
        elevation={0}
        sx={{
          border: `2px solid ${theme.palette.primary.main}`,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)',
            transition: 'all 0.3s ease',
          },
        }}
        className={className}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            left: 20,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          Featured Story
        </Box>
        
        <CardContent sx={{ p: 3, pt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
            <Avatar
              src={testimonial.avatar}
              sx={{ width: 60, height: 60 }}
            >
              {testimonial.name.charAt(0)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {testimonial.name}
                </Typography>
                {testimonial.verified && (
                  <Chip
                    label="Verified"
                    size="small"
                    color="success"
                  />
                )}
              </Box>
              
              {testimonial.role && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {testimonial.role}
                  {testimonial.company && ` at ${testimonial.company}`}
                </Typography>
              )}
              
              {showRating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  {renderStars(testimonial.rating)}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {testimonial.rating}/5
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ position: 'relative', mb: 3 }}>
            <FormatQuote
              sx={{
                position: 'absolute',
                top: -10,
                left: -10,
                fontSize: '2rem',
                color: theme.palette.primary.main,
                opacity: 0.3,
              }}
            />
            <Typography variant="body1" sx={{ pl: 2, fontStyle: 'italic' }}>
              "{testimonial.content}"
            </Typography>
          </Box>
          
          {renderTransformation()}
          
          {showTags && testimonial.tags && (
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {testimonial.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton onClick={handleLike} color={liked ? 'primary' : 'default'}>
                {liked ? <ThumbUp /> : <ThumbUpOutlined />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {likeCount} people found this helpful
              </Typography>
            </Box>
            
            {showSharing && (
              <SocialSharing
                url={generateShareUrl()}
                title={generateShareText()}
                hashtags={['reverseaging', 'testimonial', 'transformation']}
                size="medium"
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease',
        },
      }}
      className={className}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            src={testimonial.avatar}
            sx={{ width: 50, height: 50 }}
          >
            {testimonial.name.charAt(0)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {testimonial.name}
              </Typography>
              {testimonial.verified && (
                <Chip
                  label="Verified"
                  size="small"
                  color="success"
                />
              )}
            </Box>
            
            {testimonial.role && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {testimonial.role}
                {testimonial.company && ` at ${testimonial.company}`}
              </Typography>
            )}
            
            {showRating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                {renderStars(testimonial.rating)}
              </Box>
            )}
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          "{testimonial.content}"
        </Typography>
        
        {renderTransformation()}
        
        {showTags && testimonial.tags && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {testimonial.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton size="small" onClick={handleLike}>
              {liked ? <ThumbUp fontSize="small" color="primary" /> : <ThumbUpOutlined fontSize="small" />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {likeCount}
            </Typography>
          </Box>
          
          {showSharing && (
            <SocialSharing
              url={generateShareUrl()}
              title={generateShareText()}
              hashtags={['reverseaging', 'testimonial', 'transformation']}
              size="small"
              showLabels={false}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ShareableTestimonial;
