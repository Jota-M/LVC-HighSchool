'use client';
// components/estudiante/materiales/SelectorMateriaEstudiante.tsx

import React, { useId } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, alpha, LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  Assignment as TemaIcon,
  BarChart as ProgresoChipIcon,
} from '@mui/icons-material';
import type { MateriaResumen } from '@/services/estudianteService';

interface SelectorMateriaEstudianteProps {
  materias:      MateriaResumen[];
  seleccionada:  MateriaResumen | null;
  onSeleccionar: (m: MateriaResumen) => void;
  accent:        string;
  accentDark:    string;
  isDark:        boolean;
}

export const SelectorMateriaEstudiante: React.FC<SelectorMateriaEstudianteProps> = ({
  materias, seleccionada, onSeleccionar,
  accent, accentDark, isDark,
}) => {
  const labelId = useId();

  return (
    <Box sx={{ mb: 3 }} role="radiogroup" aria-labelledby={labelId}>
      <Typography
        id={labelId}
        variant="caption"
        sx={{
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: 1.2,
          color: isDark ? '#78909c' : '#90a4ae',
          mb: 1.5,
          display: 'block',
        }}
      >
        Selecciona una materia
      </Typography>

      <Grid container spacing={2}>
        {materias.map(m => {
          const isSelected = seleccionada?.asignacion_docente_id === m.asignacion_docente_id;
          const color      = m.materia_color || accent;
          const progreso   = m.progreso_promedio ?? 0;

          return (
            <Grid key={m.asignacion_docente_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                component="button"
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSeleccionar(m)}
                elevation={0}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? color : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  bgcolor: isSelected
                    ? alpha(color, isDark ? 0.1 : 0.06)
                    : isDark ? alpha('#fff', 0.02) : '#fff',
                  transition: 'all 0.22s ease',
                  p: 0,
                  outline: 'none',
                  '&:hover': {
                    borderColor: alpha(color, 0.55),
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 22px ${alpha(color, 0.18)}`,
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${color}`,
                    outlineOffset: 2,
                  },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Barra superior */}
                <Box
                  sx={{
                    height: 5,
                    background: isSelected
                      ? `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`
                      : `linear-gradient(90deg, ${alpha(color, 0.35)}, ${alpha(color, 0.15)})`,
                    transition: 'all 0.25s',
                  }}
                />

                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40, height: 40,
                        borderRadius: '12px',
                        bgcolor: alpha(color, 0.12),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color,
                      }}
                    >
                      <MenuBookIcon sx={{ fontSize: 20 }} />
                    </Box>

                    {isSelected && (
                      <CheckIcon sx={{ color: color, fontSize: 22 }} />
                    )}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ color: alpha(color, 0.8), fontWeight: 700, letterSpacing: 0.8 }}
                  >
                    {m.materia_codigo}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    noWrap
                    sx={{ color: isSelected ? color : 'text.primary', mb: 0.5 }}
                  >
                    {m.materia_nombre}
                  </Typography>

                  {/* Docente */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {m.docente_nombres} {m.docente_apellidos}
                    </Typography>
                  </Box>

                  {/* Barra de progreso */}
                  {m.total_temas > 0 && (
                    <Box sx={{ mb: 1.25 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color }}>
                          {Math.round(progreso)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progreso}
                        sx={{
                          height: 5, borderRadius: 3,
                          bgcolor: alpha(color, 0.15),
                          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                        }}
                      />
                    </Box>
                  )}

                  {/* Chips informativos */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {m.area_conocimiento && (
                      <Chip
                        label={m.area_conocimiento}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.62rem', fontWeight: 600,
                          bgcolor: alpha(color, 0.1), color,
                        }}
                      />
                    )}
                    {m.total_materiales > 0 && (
                      <Chip
                        icon={<MenuBookIcon sx={{ fontSize: '10px !important' }} />}
                        label={`${m.total_materiales} mat.`}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.62rem', fontWeight: 600,
                          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                          color: 'text.secondary',
                        }}
                      />
                    )}
                    {m.total_temas > 0 && (
                      <Chip
                        icon={<TemaIcon sx={{ fontSize: '10px !important' }} />}
                        label={`${m.temas_completados}/${m.total_temas}`}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.62rem', fontWeight: 600,
                          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                          color: 'text.secondary',
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SelectorMateriaEstudiante;