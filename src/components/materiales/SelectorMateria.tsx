'use client';
// components/docente/materiales/SelectorMateria.tsx

import React from 'react';
import {
  Box, Grid, Typography, Chip, alpha,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { AsignacionDocente } from '@/services/asistenciaService';

interface SelectorMateriaProps {
  asignaciones:  AsignacionDocente[];
  seleccionada:  AsignacionDocente | null;
  onSeleccionar: (a: AsignacionDocente) => void;
  accent:        string;
  accentDark:    string;
  isDark:        boolean;
}

export const SelectorMateria: React.FC<SelectorMateriaProps> = ({
  asignaciones, seleccionada, onSeleccionar, accent, accentDark, isDark,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'text.disabled',
          mb: 2,
        }}
      >
        Selecciona una materia
      </Typography>

      <Grid container spacing={1.5}>
        {asignaciones.map(a => {
          const isSelected = seleccionada?.asignacion_id === a.asignacion_id;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={a.asignacion_id}>
              <Box
                onClick={() => onSeleccionar(a)}
                sx={{
                  position: 'relative',
                  p: 2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? accent : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  bgcolor: isSelected
                    ? alpha(accent, isDark ? 0.07 : 0.04)
                    : isDark ? alpha('#fff', 0.02) : '#fff',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: alpha(accent, 0.5),
                    bgcolor: alpha(accent, isDark ? 0.05 : 0.02),
                  },
                }}
              >
                {/* Indicador seleccionado */}
                {isSelected && (
                  <CheckIcon
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontSize: 16,
                      color: accent,
                    }}
                  />
                )}

                {/* Dot de color */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isSelected ? accent : isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15),
                    mb: 1.5,
                    transition: 'background 0.18s',
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: isSelected ? accent : 'text.primary',
                    lineHeight: 1.3,
                    mb: 0.5,
                    pr: isSelected ? 2.5 : 0,
                  }}
                  noWrap
                >
                  {a.materia_nombre}
                </Typography>

                <Typography variant="caption" color="text.disabled" display="block" noWrap>
                  {a.grado_nombre} · {a.paralelo_nombre}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={a.turno_nombre}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      bgcolor: alpha(accent, 0.08),
                      color: accent,
                    }}
                  />
                  <Chip
                    label={`${a.total_estudiantes} est.`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      color: 'text.secondary',
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SelectorMateria;