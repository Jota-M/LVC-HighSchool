// src/app/dashboard/preinscripciones/components/StatCard.tsx

import React from 'react';
import { Card, CardContent, Stack, Avatar, Chip, Typography, Zoom } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  trend: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon, 
  trend 
}) => {
  return (
    <Zoom in timeout={600}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderRadius: 4,
          border: `2px solid ${color}30`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${color}40`,
            border: `2px solid ${color}60`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, transparent)`,
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
            <Chip 
              label={trend} 
              size="small" 
              icon={trend.startsWith('+') ? <TrendingUpIcon /> : <TrendingDownIcon />}
              sx={{ 
                bgcolor: trend.startsWith('+') ? '#4caf5020' : '#f4433620',
                color: trend.startsWith('+') ? '#4caf50' : '#f44336',
                fontWeight: 700,
              }} 
            />
          </Stack>
          <Typography variant="h3" fontWeight="bold" color={color} mb={1}>
            {value}
          </Typography>
          <Typography variant="body1" fontWeight={600} color="text.primary" mb={0.5}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
};