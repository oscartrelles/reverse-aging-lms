import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { detectUserTimezone, getTimezoneDisplayName, isValidTimezone } from '../utils/timezoneUtils';

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
}

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}) => {
  const theme = useTheme();
  const [timezoneOptions, setTimezoneOptions] = useState<TimezoneOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateTimezoneOptions = () => {
      const options: TimezoneOption[] = [];
      
      // Common timezones organized by region
      const timezoneGroups = {
        'North America': [
          'America/New_York',
          'America/Chicago',
          'America/Denver',
          'America/Los_Angeles',
          'America/Phoenix',
          'America/Anchorage',
          'America/Toronto',
          'America/Vancouver',
          'America/Mexico_City',
        ],
        'Europe': [
          'Europe/London',
          'Europe/Paris',
          'Europe/Berlin',
          'Europe/Rome',
          'Europe/Madrid',
          'Europe/Amsterdam',
          'Europe/Stockholm',
          'Europe/Oslo',
          'Europe/Copenhagen',
          'Europe/Helsinki',
          'Europe/Warsaw',
          'Europe/Prague',
          'Europe/Vienna',
          'Europe/Budapest',
          'Europe/Bucharest',
          'Europe/Sofia',
          'Europe/Athens',
          'Europe/Istanbul',
          'Europe/Moscow',
          'Europe/Kiev',
        ],
        'Asia': [
          'Asia/Tokyo',
          'Asia/Shanghai',
          'Asia/Hong_Kong',
          'Asia/Singapore',
          'Asia/Dubai',
          'Asia/Kolkata',
          'Asia/Bangkok',
          'Asia/Seoul',
          'Asia/Jakarta',
          'Asia/Manila',
          'Asia/Ho_Chi_Minh',
          'Asia/Kuala_Lumpur',
        ],
        'Australia & Pacific': [
          'Australia/Sydney',
          'Australia/Melbourne',
          'Australia/Brisbane',
          'Australia/Perth',
          'Australia/Adelaide',
          'Pacific/Auckland',
          'Pacific/Fiji',
          'Pacific/Honolulu',
        ],
        'South America': [
          'America/Sao_Paulo',
          'America/Buenos_Aires',
          'America/Santiago',
          'America/Lima',
          'America/Bogota',
          'America/Caracas',
        ],
        'Africa': [
          'Africa/Cairo',
          'Africa/Johannesburg',
          'Africa/Lagos',
          'Africa/Nairobi',
          'Africa/Casablanca',
          'Africa/Algiers',
        ],
        'Other': [
          'UTC',
          'GMT',
          'Atlantic/Reykjavik',
          'Indian/Mauritius',
        ],
      };

      Object.entries(timezoneGroups).forEach(([region, timezones]) => {
        timezones.forEach(timezone => {
          if (isValidTimezone(timezone)) {
            try {
              const now = new Date();
              const offset = now.toLocaleString('en-US', {
                timeZone: timezone,
                timeZoneName: 'short',
              }).split(' ').pop() || '';
              
              options.push({
                value: timezone,
                label: getTimezoneDisplayName(timezone),
                offset: offset,
                region: region,
              });
            } catch (error) {
              // Skip invalid timezones
            }
          }
        });
      });

      // Sort by region and then by label
      options.sort((a, b) => {
        if (a.region !== b.region) {
          return a.region.localeCompare(b.region);
        }
        return a.label.localeCompare(b.label);
      });

      setTimezoneOptions(options);
      setLoading(false);
    };

    generateTimezoneOptions();
  }, []);

  const handleChange = (event: any, newValue: TimezoneOption | null) => {
    if (newValue) {
      onChange(newValue.value);
    }
  };

  const currentOption = timezoneOptions.find(option => option.value === value) || null;

  return (
    <Autocomplete
      options={timezoneOptions}
      value={currentOption}
      onChange={handleChange}
      getOptionLabel={(option) => `${option.label} (${option.offset})`}
      groupBy={(option) => option.region}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Timezone"
          error={error}
          helperText={helperText || "Your timezone for lesson releases"}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">
              {option.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.offset} • {option.region}
            </Typography>
          </Box>
        </Box>
      )}
      renderGroup={(params) => (
        <Box key={params.key}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              px: 2,
              py: 1,
              backgroundColor: theme.palette.background.default,
            }}
          >
            {params.group}
          </Typography>
          {params.children}
        </Box>
      )}
      sx={{
        '& .MuiAutocomplete-groupLabel': {
          backgroundColor: theme.palette.background.default,
        },
      }}
    />
  );
};

export default TimezoneSelector;
