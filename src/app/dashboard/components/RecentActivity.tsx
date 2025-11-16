'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Box,
  Skeleton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api';

interface Activity {
  id: number;
  type: 'create' | 'update' | 'delete' | 'approve';
  user: string;
  action: string;
  time: string;
}

export default function RecentActivity() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Reemplaza con tu endpoint real
      const { data } = await api.get('/api/activities/recent').catch(() => ({
        data: [
          { id: 1, type: 'create', user: 'Admin', action: 'Nuevo estudiante registrado', time: 'Hace 5 min' },
          { id: 2, type: 'update', user: 'Prof. García', action: 'Actualizó notas del curso', time: 'Hace 15 min' },
          { id: 3, type: 'approve', user: 'Director', action: 'Aprobó preinscripción', time: 'Hace 1 hora' },
          { id: 4, type: 'delete', user: 'Admin', action: 'Eliminó usuario inactivo', time: 'Hace 2 horas' },
        ]
      }));

      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return <PersonAddIcon />;
      case 'update':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'approve':
        return <CheckCircleIcon />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return '#4caf50';
      case 'update':
        return '#2196f3';
      case 'delete':
        return '#f44336';
      case 'approve':
        return '#ff9800';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: theme.palette.mode === 'dark'
          ? alpha('#1a1f2e', 0.9)
          : alpha('#ffffff', 0.9),
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Actividad Reciente 🔔
        </Typography>
        
        {loading ? (
          <Box>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={60} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : (
          <List sx={{ pt: 2 }}>
            {activities.map((activity) => (
              <ListItem
                key={activity.id}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(getActivityColor(activity.type), 0.1),
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: alpha(getActivityColor(activity.type), 0.2),
                      color: getActivityColor(activity.type),
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600}>
                      {activity.action}
                    </Typography>
                  }
                  secondary={
                    <Box
      component="span"
      sx={{ display: 'inline-flex', gap: 1, mt: 0.5, alignItems: 'center' }}
    >
      <Typography variant="caption" color="text.secondary" component="span">
        {activity.time}
      </Typography>
    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}