import React from 'react';
import { ENVIRONMENT } from '../config/environment';

// Image optimization utilities
export class ImageUtils {
  // Get optimized image URL with proper sizing
  static getOptimizedImageUrl(imagePath: string, width: number, height?: number): string {
    const baseUrl = ENVIRONMENT.currentHostingUrl;
    
    // For now, return the original image path
    // In the future, this could integrate with a CDN or image optimization service
    return `${baseUrl}${imagePath}`;
  }

  // Get WebP version if supported
  static getWebPImageUrl(imagePath: string): string {
    // For now, return the original image path
    // In the future, this could return WebP versions
    return imagePath;
  }

  // Generate alt text for common images
  static getAltText(imageName: string, context?: string): string {
    const altTexts: Record<string, string> = {
      'Academy.png': 'The Reverse Aging Academy logo - evidence-based longevity education',
      'BF-RAC.png': 'Breathing Flame Reverse Aging Challenge logo',
      'BF-RAC-Catalog.png': 'Reverse Aging Challenge course catalog and programs',
      'RAC Round.png': 'Reverse Aging Challenge round logo design',
      'logo192.png': 'Reverse Aging Academy app icon',
      'logo512.png': 'Reverse Aging Academy high-resolution logo',
      'favicon.png': 'Reverse Aging Academy favicon',
      'oscar-trelles.jpg': 'Oscar Trelles - Founder of The Reverse Aging Academy',
    };

    return altTexts[imageName] || `Image: ${imageName}`;
  }

  // Get image dimensions for common images
  static getImageDimensions(imageName: string): { width: number; height: number } {
    const dimensions: Record<string, { width: number; height: number }> = {
      'Academy.png': { width: 1200, height: 630 },
      'BF-RAC.png': { width: 400, height: 200 },
      'BF-RAC-Catalog.png': { width: 1200, height: 800 },
      'RAC Round.png': { width: 300, height: 300 },
      'logo192.png': { width: 192, height: 192 },
      'logo512.png': { width: 512, height: 512 },
      'favicon.png': { width: 32, height: 32 },
      'oscar-trelles.jpg': { width: 400, height: 400 },
    };

    return dimensions[imageName] || { width: 400, height: 300 };
  }

  // Check if image should be lazy loaded
  static shouldLazyLoad(imageName: string): boolean {
    // Lazy load images that are below the fold
    const lazyLoadImages = [
      'BF-RAC-Catalog.png',
      'oscar-trelles.jpg',
      'RAC Round.png'
    ];

    return lazyLoadImages.includes(imageName);
  }

  // Get loading priority for images
  static getLoadingPriority(imageName: string): 'high' | 'low' {
    // High priority for above-the-fold images
    const highPriorityImages = [
      'Academy.png',
      'BF-RAC.png',
      'logo192.png',
      'logo512.png',
      'favicon.png'
    ];

    return highPriorityImages.includes(imageName) ? 'high' : 'low';
  }
}

// React component for optimized images
export interface OptimizedImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  lazy?: boolean;
  priority?: 'high' | 'low';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  lazy,
  priority = 'low'
}) => {
  const imageName = src.split('/').pop() || '';
  const defaultAlt = ImageUtils.getAltText(imageName);
  const dimensions = ImageUtils.getImageDimensions(imageName);
  const shouldLazy = lazy ?? ImageUtils.shouldLazyLoad(imageName);
  const loadingPriority = priority === 'high' ? 'eager' : 'lazy';

  return React.createElement('img', {
    src,
    alt: alt || defaultAlt,
    width: width || dimensions.width,
    height: height || dimensions.height,
    className,
    style,
    loading: shouldLazy ? 'lazy' : loadingPriority,
    decoding: 'async'
  });
};
