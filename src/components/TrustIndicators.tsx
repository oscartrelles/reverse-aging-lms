import React from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { 
  Security, 
  VerifiedUser, 
  Support,
  CheckCircle 
} from '@mui/icons-material';

interface TrustIndicatorsProps {
  showGuarantee?: boolean;
  guaranteeText?: string;
  sx?: any;
}

const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  showGuarantee = true,
  guaranteeText = "30-Day Money-Back Guarantee",
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: 'center', ...sx }}>
      {/* Top Row - Security Badges */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Security sx={{ fontSize: 16, color: '#4CAF50' }} />
          <Typography variant="caption" color="#e0e0e0">
            Secure
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <VerifiedUser sx={{ fontSize: 16, color: '#4CAF50' }} />
          <Typography variant="caption" color="#e0e0e0">
            Verified
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Support sx={{ fontSize: 16, color: '#4CAF50' }} />
          <Typography variant="caption" color="#e0e0e0">
            Support
          </Typography>
        </Box>
      </Box>
      
      {/* Bottom Row - Guarantee */}
      {showGuarantee && (
        <Typography variant="body2" color="#4CAF50" sx={{ fontWeight: 600 }}>
          <CheckCircle sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          {guaranteeText}
        </Typography>
      )}
    </Box>
  );
};

export default TrustIndicators;
