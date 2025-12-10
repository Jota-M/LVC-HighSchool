// components/dashboard/QuickActions.tsx
import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, useTheme, alpha, Stack } from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  SchoolOutlined as SchoolIcon,
  AssignmentOutlined as AssignmentIcon,
  PeopleOutlined as PeopleIcon,
  SettingsOutlined as SettingsIcon,
  BarChartOutlined as BarChartIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  path: string;
  description: string;
}

export const QuickActions: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      label: 'Nuevo Estudiante',
      icon: PersonAddIcon,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      path: '/dashboard/estudiantes/registro-completo',
      description: 'Registrar estudiante',
    },
    {
      label: 'Ver Estudiantes',
      icon: SchoolIcon,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      path: '/dashboard/estudiantes',
      description: 'Gestionar estudiantes',
    },
    {
      label: 'Matrículas',
      icon: AssignmentIcon,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      path: '/dashboard/matriculas',
      description: 'Gestionar matrículas',
    },
    {
      label: 'Docentes',
      icon: PeopleIcon,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      path: '/dashboard/docentes',
      description: 'Ver docentes',
    },
    {
      label: 'Reportes',
      icon: BarChartIcon,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      path: '/dashboard/reportes',
      description: 'Ver estadísticas',
    },
    {
      label: 'Configuración',
      icon: SettingsIcon,
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      path: '/dashboard/configuracion',
      description: 'Ajustes del sistema',
    },
  ];

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Accesos Rápidos
      </Typography>

      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={index}
              onClick={() => router.push(action.path)}
              sx={{
                minWidth: 180,
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: isDark ? alpha(action.color, 0.2) : alpha(action.color, 0.1),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: `scaleIn 0.4s ease-out ${index * 0.05}s both`,
                '@keyframes scaleIn': {
                  from: {
                    opacity: 0,
                    transform: 'scale(0.9)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${alpha(action.color, 0.3)}`,
                  borderColor: action.color,
                  '& .action-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  },
                },
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Avatar
                  className="action-icon"
                  sx={{
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2,
                    background: action.gradient,
                    boxShadow: `0 8px 16px ${alpha(action.color, 0.3)}`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5,
                  }}
                >
                  {action.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};