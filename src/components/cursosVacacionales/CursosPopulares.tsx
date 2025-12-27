// components/cursosVacacionales/CursosPopulares.tsx
'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  LinearProgress,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  EmojiEvents,
  LocalFireDepartment,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import cursoVacacionalService from '@/services/cursoVacacionalService';
import { useRouter } from 'next/navigation';

interface CursosPopularesProps {
  periodoId: number;
}

interface CursoPopular {
  id: number;
  nombre: string;
  codigo: string | null;
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
  costo: number;
  total_inscripciones: number;
  porcentaje_ocupacion: number;
}

export const CursosPopulares: React.FC<CursosPopularesProps> = ({ periodoId }) => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  // Query para obtener cursos populares
  const { data: cursos, isLoading } = useQuery<CursoPopular[]>({
    queryKey: ['cursos-populares', periodoId],
    queryFn: async () => {
      // Aquí deberías tener un endpoint específico en tu servicio
      // Por ahora simulamos obteniendo todos y ordenando
      const response = await cursoVacacionalService.cursos.listar({
        periodo_vacacional_id: periodoId,
        activo: true,
        limit: 100,
      });
      
      return response.cursos
        .sort((a, b) => b.cupos_ocupados - a.cupos_ocupados)
        .slice(0, 5)
        .map(curso => ({
          id: curso.id,
          nombre: curso.nombre,
          codigo: curso.codigo,
          cupos_totales: curso.cupos_totales,
          cupos_ocupados: curso.cupos_ocupados,
          cupos_disponibles: curso.cupos_disponibles,
          costo: curso.costo,
          total_inscripciones: curso.cupos_ocupados,
          porcentaje_ocupacion: (curso.cupos_ocupados / curso.cupos_totales) * 100,
        }));
    },
    enabled: !!periodoId,
  });

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return '#fbbf24'; // Oro
      case 1:
        return '#94a3b8'; // Plata
      case 2:
        return '#cd7f32'; // Bronce
      default:
        return isDark ? '#64748b' : '#94a3b8';
    }
  };

  const getMedalIcon = (index: number) => {
    if (index < 3) {
      return <EmojiEvents />;
    }
    return <LocalFireDepartment />;
  };

  const handleVerCurso = (cursoId: number) => {
    router.push(`/dashboard/CursosVacacionales/cursos/${cursoId}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '20px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha('#f59e0b', 0.1),
              color: '#f59e0b',
            }}
          >
            <TrendingUp />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Cursos Más Populares
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Top 5 con más inscripciones
            </Typography>
          </Box>
        </Box>

        {isLoading ? (
          <List>
            {[...Array(5)].map((_, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton width="60%" />}
                  secondary={<Skeleton width="40%" />}
                />
              </ListItem>
            ))}
          </List>
        ) : !cursos || cursos.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
            }}
          >
            <LocalFireDepartment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              No hay cursos registrados aún
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {cursos.map((curso, index) => (
              <ListItem
                key={curso.id}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                  },
                }}
                secondaryAction={
                  <Tooltip title="Ver detalles">
                    <IconButton
                      edge="end"
                      onClick={() => handleVerCurso(curso.id)}
                      sx={{
                        color: isDark ? '#facc15' : '#0288d1',
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: alpha(getMedalColor(index), 0.1),
                      color: getMedalColor(index),
                      fontWeight: 800,
                    }}
                  >
                    {getMedalIcon(index)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {curso.nombre}
                      </Typography>
                      {index === 0 && (
                        <Chip
                          label="Top"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: alpha('#fbbf24', 0.1),
                            color: '#fbbf24',
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {curso.cupos_ocupados} de {curso.cupos_totales} cupos
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color:
                              curso.porcentaje_ocupacion >= 90
                                ? '#10b981'
                                : curso.porcentaje_ocupacion >= 70
                                ? '#f59e0b'
                                : '#6b7280',
                          }}
                        >
                          {curso.porcentaje_ocupacion.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={curso.porcentaje_ocupacion}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: isDark
                            ? alpha('#fff', 0.1)
                            : alpha('#000', 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor:
                              curso.porcentaje_ocupacion >= 90
                                ? '#10b981'
                                : curso.porcentaje_ocupacion >= 70
                                ? '#f59e0b'
                                : '#6b7280',
                          },
                        }}
                      />
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
};