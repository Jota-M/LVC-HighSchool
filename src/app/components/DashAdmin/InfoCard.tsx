'use client';
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '@/app/dashboard/theme';

interface InfoCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  subtitle?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const colorMap: Record<string, string> = {
    primary: colors.blueAccent[400],
    secondary: colors.grey[400],
    success: colors.greenAccent[500],
    warning: colors.greenAccent[400],
    info: colors.redAccent[400],
    error: colors.redAccent[400],
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        borderRadius: 3,
        minWidth: 220,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        boxShadow: theme.shadows[3],
        bgcolor:
          theme.palette.mode === 'dark'
            ? colors.primary[400]
            : colors.grey[900],
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: colorMap[color] }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colorMap[color],
            color: 'white',
            fontSize: 28,
          }}
        >
          {icon}
        </Box>
      )}
    </Paper>
  );
};

export default InfoCard;
