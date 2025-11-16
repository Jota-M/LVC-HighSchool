'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, alpha, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { keyframes } from '@mui/system';
import api from '@/lib/api';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

interface Stat {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  endpoint?: string;
}

export default function StatsCards() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([
    {
      title: 'Total Estudiantes',
      value: 0,
      change: 0,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      endpoint: '/api/students/count',
    },
    {
      title: 'Total Docentes',
      value: 0,
      change: 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
      endpoint: '/api/teachers/count',
    },
    {
      title: 'Cursos Activos',
      value: 0,
      change: 0,
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      endpoint: '/api/courses/count',
    },
    {
      title: 'Preinscripciones',
      value: 0,
      change: 0,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      endpoint: '/api/preinscriptions/count',
    },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Simular llamadas a la API (reemplaza con tus endpoints reales)
      const responses = await Promise.all(
        stats.map(stat => 
          stat.endpoint 
            ? api.get(stat.endpoint).catch(() => ({ data: { count: Math.floor(Math.random() * 1000), change: Math.floor(Math.random() * 20) - 10 }}))
            : Promise.resolve({ data: { count: 0, change: 0 }})
        )
      );

      const updatedStats = stats.map((stat, index) => ({
        ...stat,
        value: responses[index].data.count || Math.floor(Math.random() * 1000),
        change: responses[index].data.change || Math.floor(Math.random() * 20) - 10,
      }));

      setStats(updatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid size={{xs:12, sm:6, lg:3}} key={item}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid size={{xs:12, sm:6, lg:3}} key={stat.title}>
          <Card
            sx={{
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? alpha('#1a1f2e', 0.9)
                : alpha('#ffffff', 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(stat.color, 0.2)}`,
              transition: 'all 0.3s ease',
              animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `0 12px 24px ${alpha(stat.color, 0.3)}`,
                borderColor: stat.color,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.6)} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stat.change >= 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: stat.change >= 0 ? '#4caf50' : '#f44336',
                        fontWeight: 700,
                      }}
                    >
                      {stat.change >= 0 ? '+' : ''}{stat.change}% este mes
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: alpha(stat.color, 0.1),
                    color: stat.color,
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
