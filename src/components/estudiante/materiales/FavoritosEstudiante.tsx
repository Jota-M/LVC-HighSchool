'use client';
// components/estudiante/materiales/FavoritosEstudiante.tsx

import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, IconButton,
  alpha, Skeleton, Fade, Tooltip,
} from '@mui/material';
import {
  Favorite as FavIcon,
  OpenInNew as OpenIcon,
  FavoriteBorder as FavBorderIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useFavoritosEstudiante } from '@/hooks/useEstudiante';
import type { MateriaResumen } from '@/services/estudianteService';

interface FavoritosEstudianteProps {
  materia:    MateriaResumen;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

export const FavoritosEstudiante: React.FC<FavoritosEstudianteProps> = ({
  materia, accent, accentDark, isDark,
}) => {
  const router = useRouter();

  const { favoritos, isLoading, toggle, toggling } = useFavoritosEstudiante();

  // Aquí mostramos todos los favoritos del estudiante
  // Si quieres filtrar solo por la materia actual, necesitarías
  // agregar esa información en el objeto favorito del backend
  const favoritosDeLaMateria = favoritos;

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map(i => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: '14px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (favoritosDeLaMateria.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center', py: 10,
          borderRadius: '18px',
          border: `2px dashed ${alpha(accent, 0.2)}`,
        }}
      >
        <FavBorderIcon sx={{ fontSize: 56, color: alpha(accent, 0.3), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sin favoritos todavía
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Guarda materiales en favoritos desde la pestaña Materiales.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {favoritosDeLaMateria.map(fav => (
        <Grid key={fav.material_academico_id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Fade in timeout={300}>
            <Card
              elevation={0}
              onClick={() => router.push(`/dashboard/estudiante/materiales/${fav.material_academico_id}`)}
              sx={{
                borderRadius: '14px',
                cursor: 'pointer',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                transition: 'all 0.25s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 10px 24px ${alpha(fav.tipo_material_color || accent, 0.18)}`,
                  borderColor: alpha(fav.tipo_material_color || accent, 0.3),
                },
              }}
            >
              <Box
                sx={{
                  height: 5,
                  background: `linear-gradient(90deg, ${fav.tipo_material_color || accent}, ${alpha(fav.tipo_material_color || accent, 0.35)})`,
                  borderRadius: '14px 14px 0 0',
                }}
              />
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ fontSize: '1.5rem', mb: 1 }}>
                  {fav.tipo_material_icono || '📄'}
                </Box>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={700}
                  sx={{
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4, mb: 0.5,
                  }}
                >
                  {fav.material_titulo}
                </Typography>
                {fav.material_descripcion && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {fav.material_descripcion}
                  </Typography>
                )}
              </CardContent>

              <Box 
                sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 1.5 }}
                onClick={e => e.stopPropagation()}
              >
                <Chip
                  label={fav.tipo_material_nombre}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.62rem', fontWeight: 600,
                    bgcolor: alpha(fav.tipo_material_color || accent, 0.1),
                    color: fav.tipo_material_color || accent,
                  }}
                />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {(fav.url_archivo || fav.url_externa) && (
                    <IconButton
                      size="small"
                      href={(fav.url_archivo || fav.url_externa)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: accent, p: 0.5 }}
                    >
                      <OpenIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                  <Tooltip title="Quitar de favoritos">
                    <IconButton
                      size="small"
                      disabled={toggling === fav.material_academico_id}
                      onClick={() => toggle(fav.material_academico_id)}
                      sx={{ color: '#ef4444', p: 0.5 }}
                    >
                      <FavIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          </Fade>
        </Grid>
      ))}
    </Grid>
  );
};

export default FavoritosEstudiante;