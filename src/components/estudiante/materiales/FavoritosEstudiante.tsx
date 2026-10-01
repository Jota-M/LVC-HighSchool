'use client';
// components/estudiante/materiales/FavoritosEstudiante.tsx

import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, IconButton,
  alpha, Skeleton, Fade, Tooltip, Button, Avatar,
} from '@mui/material';
import {
  Favorite as FavIcon,
  ChevronRight as ChevronRightIcon,
  InsertDriveFile as FileIcon,
  Link as LinkIcon,
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
  const favoritosDeLaMateria = favoritos;

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map(i => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: '18px' }} />
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
        <FavIcon sx={{ fontSize: 56, color: alpha(accent, 0.3), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" fontWeight={700} gutterBottom>
          Sin favoritos todavía
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Guarda recursos en favoritos desde la pestaña de Materiales didácticos.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {favoritosDeLaMateria.map(fav => {
        const iconColor = fav.tipo_material_color || accent;
        return (
          <Grid key={fav.material_academico_id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Fade in timeout={300}>
              <Card
                onClick={() => router.push(`/dashboard/estudiante/materiales/detalle/${fav.material_academico_id}`)}
                sx={{
                  height: '100%',
                  borderRadius: '18px',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 10px 22px ${alpha(iconColor, 0.18)}`,
                    borderColor: iconColor,
                    '& .btn-gestionar': {
                      backgroundColor: alpha(iconColor, 0.15),
                      borderColor: iconColor,
                      transform: 'translateX(2px)',
                    },
                  },
                }}
              >
                {/* Badge de Tipo arriba a la izquierda */}
                <Chip
                  label={fav.tipo_material_nombre || 'Material'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 22,
                    backgroundColor: isDark ? alpha(iconColor, 0.15) : alpha(iconColor, 0.1),
                    color: iconColor,
                    border: `1px solid ${alpha(iconColor, 0.25)}`,
                  }}
                />

                {/* Quitar de favoritos arriba a la derecha */}
                <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                  <Tooltip title="Quitar de guardados">
                    <IconButton
                      size="small"
                      disabled={toggling === fav.material_academico_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(fav.material_academico_id);
                      }}
                      sx={{
                        width: 26,
                        height: 26,
                        color: '#ef4444',
                        backgroundColor: alpha('#ef4444', 0.1),
                        '&:hover': { backgroundColor: alpha('#ef4444', 0.2) },
                      }}
                    >
                      <FavIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Contenido principal centrado */}
                <CardContent sx={{ p: 2.2, pt: 4.8, pb: 2, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Avatar circular centrado */}
                  <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        margin: '0 auto',
                        bgcolor: isDark ? alpha(iconColor, 0.18) : alpha(iconColor, 0.12),
                        color: iconColor,
                        border: `3px solid ${alpha(iconColor, 0.25)}`,
                        boxShadow: `0 6px 14px ${alpha(iconColor, 0.22)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                      }}
                    >
                      {fav.tipo_material_icono || '📄'}
                    </Avatar>
                  </Box>

                  {/* Título del Material */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    gutterBottom
                    sx={{
                      fontSize: '1.02rem',
                      lineHeight: 1.25,
                      mb: 0.4,
                      color: 'text.primary',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {fav.material_titulo}
                  </Typography>

                  {/* Descripción */}
                  {fav.material_descripcion && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      fontWeight={600}
                      sx={{
                        fontSize: '0.78rem',
                        mb: 0.8,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {fav.material_descripcion}
                    </Typography>
                  )}

                  {/* Chip de Formato / Archivo */}
                  <Box sx={{ my: 0.6, display: 'flex', justifyContent: 'center', gap: 0.6 }}>
                    {fav.url_externa ? (
                      <Chip
                        icon={<LinkIcon sx={{ fontSize: '12px !important', color: `${iconColor} !important` }} />}
                        label="Enlace web"
                        size="small"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 22,
                          backgroundColor: isDark ? alpha(iconColor, 0.15) : alpha(iconColor, 0.1),
                          color: iconColor,
                          border: `1px solid ${alpha(iconColor, 0.25)}`,
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<FileIcon sx={{ fontSize: '12px !important' }} />}
                        label={fav.tipo_material_nombre || 'Documento'}
                        size="small"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 22,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          color: 'text.secondary',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        }}
                      />
                    )}
                  </Box>

                  {/* Botón Ver material */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', pt: 1.5 }}>
                    <Button
                      className="btn-gestionar"
                      size="small"
                      variant="outlined"
                      endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        px: 2,
                        py: 0.4,
                        borderColor: alpha(iconColor, 0.4),
                        color: iconColor,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Ver material
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FavoritosEstudiante;