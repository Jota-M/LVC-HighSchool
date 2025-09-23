// app/dashboard/page.tsx o page.jsx
'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';

import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import EventIcon from '@mui/icons-material/Event';

const DashboardPage = () => {
  const theme = useTheme();

  // Ejemplo de datos simulados
  const stats = [
    {
      title: 'Estudiantes',
      value: 1240,
      icon: <SchoolIcon fontSize="large" />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Profesores',
      value: 87,
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Clases activas',
      value: 56,
      icon: <ClassIcon fontSize="large" />,
      color: theme.palette.success.main,
    },
    {
      title: 'Eventos próximos',
      value: 4,
      icon: <EventIcon fontSize="large" />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Dashboard Escolar
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Box
                sx={{
                  bgcolor: stat.color,
                  color: 'white',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                {stat.icon}
              </Box>
              <CardContent sx={{ flex: 1, p: 0 }}>
                <Typography variant="h6">{stat.title}</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
