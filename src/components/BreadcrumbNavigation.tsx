import React from 'react';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { URLUtils } from '../utils/urlUtils';
import { seoService } from '../services/seoService';

interface BreadcrumbNavigationProps {
  customBreadcrumbs?: Array<{ name: string; url: string }>;
  showHomeIcon?: boolean;
  maxItems?: number;
  className?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  customBreadcrumbs,
  showHomeIcon = true,
  maxItems = 5,
  className,
}) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Generate breadcrumbs from URL or use custom ones
  const breadcrumbs = customBreadcrumbs || URLUtils.getBreadcrumbUrls(location.pathname);
  
  // Limit breadcrumbs to maxItems
  const limitedBreadcrumbs = breadcrumbs.slice(-maxItems);
  
  // Add structured data for SEO
  React.useEffect(() => {
    if (breadcrumbs.length > 1) {
      seoService.addBreadcrumbSchema(breadcrumbs);
    }
  }, [breadcrumbs]);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for home page
  }

  return (
    <Box 
      sx={{ 
        py: 2,
        px: { xs: 2, md: 0 },
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
      className={className}
    >
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb navigation"
        maxItems={maxItems}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={2}
      >
        {limitedBreadcrumbs.map((breadcrumb, index) => {
          const isLast = index === limitedBreadcrumbs.length - 1;
          
          if (isLast) {
            return (
              <Typography
                key={breadcrumb.url}
                color="text.primary"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
                aria-current="page"
              >
                {breadcrumb.name}
              </Typography>
            );
          }
          
          return (
            <Link
              key={breadcrumb.url}
              href={breadcrumb.url}
              underline="hover"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {index === 0 && showHomeIcon ? (
                <Home sx={{ fontSize: '1rem', mr: 0.5 }} />
              ) : null}
              {breadcrumb.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNavigation;
