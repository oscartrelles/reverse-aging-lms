// Video utility functions

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/**
 * Extract video ID from various YouTube URL formats
 */
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Convert YouTube watch URL to embed URL
 */
export const convertToEmbedUrl = (url: string): string => {
  const videoId = extractVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Extract video duration from YouTube player
 * This can be used in the admin interface to auto-fill duration
 */
export const extractVideoDuration = async (videoUrl: string): Promise<number | null> => {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return null;
  }

  return new Promise((resolve) => {
    // Create a temporary iframe to extract duration
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    
    let player: any = null;
    
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

    function createPlayer() {
      player = new window.YT.Player(iframe, {
        events: {
          onReady: (event: any) => {
            const duration = event.target.getDuration();
            if (duration && duration > 0) {
              resolve(duration);
            } else {
              resolve(null);
            }
            // Clean up
            if (player) {
              player.destroy();
            }
            // Safe cleanup
            if (iframe && iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          },
          onError: () => {
            resolve(null);
            // Safe cleanup
            if (iframe && iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }
        }
      });
    }

    document.body.appendChild(iframe);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      resolve(null);
      // Safe cleanup
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 10000);
  });
};

/**
 * Validate YouTube URL format
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
}; 