'use client';

import { Card, CardContent, Typography, Button, Grid, Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

export default function QuickActions() {
  const theme = useTheme();
  const router = useRouter();

  const actions = [
    {
      title: 'Nuevo Estudiante',
      icon: <AddIcon />,
      color: '#0288d1',
      path: '/dashboard/estudiantes/nuevo',
    },
    {
      title: 'Importar Datos',
      icon: <UploadFileIcon />,
      color: '#4caf50',
      path: '/dashboard/importar',
    },
    {
      title: 'Ver Reportes',
      icon: <AssessmentIcon />,
      color: '#ff9800',
      path: '/dashboard/reportes',
    },
    {
      title: 'Configuración',
      icon: <SettingsIcon />,
      color: '#9c27b0',
      path: '/dashboard/configuracion',
    },
  ];

  return (
    <Card
      sx={{
        background: theme.palette.mode === 'dark'
          ? alpha('#1a1f2e', 0.9)
          : alpha('#ffffff', 0.9),
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Acciones Rápidas ⚡
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {actions.map((action) => (
            <Grid size={{xs:6, sm:3}} key={action.title}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push(action.path)}
                sx={{
                  py: 2,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: alpha(action.color, 0.3),
                  color: action.color,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: alpha(action.color, 0.1),
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ fontSize: 32 }}>{action.icon}</Box>
                <Typography variant="caption" fontWeight={600}>
                  {action.title}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
