import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Email,
  ContentCopy,
} from '@mui/icons-material';
import { trackEvent } from '../services/analyticsService';

interface SocialSharingProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  showCopyButton?: boolean;
  showEmailButton?: boolean;
  className?: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({
  url,
  title = 'Check this out!',
  description = 'Interesting content from The Reverse Aging Academy',
  image,
  hashtags = ['reverseaging', 'longevity', 'health'],
  via = 'reverseagingacademy',
  size = 'medium',
  showLabels = false,
  showCopyButton = true,
  showEmailButton = true,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Get current URL if not provided
  const currentUrl = url || window.location.href;
  const currentTitle = title || document.title;
  const currentDescription = description || document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  // Size configurations
  const sizeConfig = {
    small: { buttonSize: 32, iconSize: 16, fontSize: '0.75rem' },
    medium: { buttonSize: 40, iconSize: 20, fontSize: '0.875rem' },
    large: { buttonSize: 48, iconSize: 24, fontSize: '1rem' },
  };

  const config = sizeConfig[size];

  // Track social share event
  const trackSocialShare = (platform: string) => {
    trackEvent('social_share', {
      platform,
      url: currentUrl,
      title: currentTitle,
      page: window.location.pathname,
    });
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      const shareText = `${currentTitle}\n\n${currentDescription}\n\n${currentUrl}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setSnackbarMessage('Link copied to clipboard!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      trackSocialShare('copy');
    } catch (error) {
      setSnackbarMessage('Failed to copy link');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle email sharing
  const handleEmailShare = () => {
    const subject = encodeURIComponent(currentTitle);
    const body = encodeURIComponent(`${currentDescription}\n\n${currentUrl}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    window.open(mailtoUrl, '_blank');
    trackSocialShare('email');
  };

  // Handle native sharing (mobile)
  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare) {
      try {
        const shareData = {
          title: currentTitle,
          text: currentDescription,
          url: currentUrl,
        };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          trackSocialShare('native');
          return true;
        }
      } catch (error) {
        console.log('Native sharing cancelled or failed');
      }
    }
    return false;
  };

  // Social media sharing functions
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    trackSocialShare('facebook');
  };

  const shareToTwitter = () => {
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    const twitterText = `${currentTitle} ${hashtagString}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(currentUrl)}&via=${via}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    trackSocialShare('twitter');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    trackSocialShare('linkedin');
  };

  const shareToWhatsApp = () => {
    const whatsappText = `${currentTitle}\n\n${currentDescription}\n\n${currentUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
    trackSocialShare('whatsapp');
  };

  // Social media configurations
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      action: shareToFacebook,
      tooltip: 'Share on Facebook',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      action: shareToTwitter,
      tooltip: 'Share on Twitter',
    },
    {
      name: 'LinkedIn',
      icon: LinkedIn,
      color: '#0077B5',
      action: shareToLinkedIn,
      tooltip: 'Share on LinkedIn',
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      color: '#25D366',
      action: shareToWhatsApp,
      tooltip: 'Share on WhatsApp',
    },
  ];

  return (
    <Box className={className}>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Native share button (mobile) */}
        {isMobile && (
          <Tooltip title="Share">
            <IconButton
              onClick={handleNativeShare}
              sx={{
                width: config.buttonSize,
                height: config.buttonSize,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Share sx={{ fontSize: config.iconSize }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Social media buttons */}
        {socialPlatforms.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <Tooltip key={platform.name} title={platform.tooltip}>
              <IconButton
                onClick={platform.action}
                sx={{
                  width: config.buttonSize,
                  height: config.buttonSize,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.secondary,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: `${platform.color}20`,
                    color: platform.color,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${platform.color}40`,
                  },
                }}
              >
                <IconComponent sx={{ fontSize: config.iconSize }} />
              </IconButton>
            </Tooltip>
          );
        })}

        {/* Copy link button */}
        {showCopyButton && (
          <Tooltip title="Copy link">
            <IconButton
              onClick={handleCopyLink}
              sx={{
                width: config.buttonSize,
                height: config.buttonSize,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ContentCopy sx={{ fontSize: config.iconSize }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Email button */}
        {showEmailButton && (
          <Tooltip title="Share via email">
            <IconButton
              onClick={handleEmailShare}
              sx={{
                width: config.buttonSize,
                height: config.buttonSize,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Email sx={{ fontSize: config.iconSize }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SocialSharing;
