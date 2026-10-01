'use client';
// components/estudiante/asistencia/FiltrosAsistencia.tsx
// Panel de filtros de búsqueda con estilo institucional

import React, { useMemo } from 'react';
import {
  Box, Typography, alpha, Paper, TextField,
  Button, Chip, MenuItem, Select, FormControl,
  InputLabel, Grid,
} from '@mui/material';
import {
  ClearRounded as ClearIcon,
  FilterListRounded as FilterIcon,
  CalendarMonthRounded as CalendarIcon,
} from '@mui/icons-material';
import { useMisMaterias } from '@/hooks/useEstudiante';

interface FiltrosAsistenciaProps {
  fechaInicio: string;
  fechaFin: string;
  asignacionId: number | undefined;
  onFechaInicioChange: (value: string) => void;
  onFechaFinChange: (value: string) => void;
  onAsignacionChange: (value: number | undefined) => void;
  onLimpiar: () => void;
  isDark: boolean;
  accent: string;
}

export const FiltrosAsistencia: React.FC<FiltrosAsistenciaProps> = ({
  fechaInicio,
  fechaFin,
  asignacionId,
  onFechaInicioChange,
  onFechaFinChange,
  onAsignacionChange,
  onLimpiar,
  isDark,
  accent,
}) => {
  const { materias } = useMisMaterias();

  // Filtros rápidos
  const filtrosRapidos = useMemo(() => {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    return [
      {
        label: 'Hoy',
        fechaInicio: inicio.toISOString().split('T')[0],
        fechaFin: inicio.toISOString().split('T')[0],
      },
      {
        label: 'Esta semana',
        fechaInicio: new Date(inicio.getTime() - inicio.getDay() * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        fechaFin: hoy.toISOString().split('T')[0],
      },
      {
        label: 'Este mes',
        fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1)
          .toISOString().split('T')[0],
        fechaFin: hoy.toISOString().split('T')[0],
      },
      {
        label: 'Últimos 30 días',
        fechaInicio: new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        fechaFin: hoy.toISOString().split('T')[0],
      },
      {
        label: 'Este trimestre',
        fechaInicio: new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1)
          .toISOString().split('T')[0],
        fechaFin: hoy.toISOString().split('T')[0],
      },
    ];
  }, []);

  const aplicarFiltroRapido = (filtro: { fechaInicio: string; fechaFin: string }) => {
    onFechaInicioChange(filtro.fechaInicio);
    onFechaFinChange(filtro.fechaFin);
  };

  const hayFiltrosActivos = Boolean(fechaInicio || fechaFin || asignacionId !== undefined);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '18px',
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ fontSize: 20, color: accent }} />
          <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: -0.2 }}>
            Filtros y Períodos de Asistencia
          </Typography>
        </Box>

        {hayFiltrosActivos && (
          <Chip
            label="Filtros Activos"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.72rem',
              bgcolor: alpha(accent, 0.16),
              color: accent,
              fontWeight: 800,
              borderRadius: '8px',
              border: `1px solid ${alpha(accent, 0.3)}`,
            }}
          />
        )}
      </Box>

      {/* Chips de períodos predefinidos */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.68rem' }}>
          Períodos predefinidos
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filtrosRapidos.map((filtro, idx) => {
            const isSelected = fechaInicio === filtro.fechaInicio && fechaFin === filtro.fechaFin;
            return (
              <Chip
                key={idx}
                label={filtro.label}
                size="small"
                onClick={() => aplicarFiltroRapido(filtro)}
                clickable
                sx={{
                  height: 30,
                  borderRadius: '10px',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  bgcolor: isSelected ? accent : (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)),
                  color: isSelected ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  border: `1.5px solid ${isSelected ? accent : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  boxShadow: isSelected ? `0 2px 8px ${alpha(accent, 0.3)}` : 'none',
                  '&:hover': {
                    bgcolor: isSelected ? accent : alpha(accent, 0.15),
                    borderColor: accent,
                    color: isSelected ? (isDark ? '#000' : '#fff') : accent,
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Filtros personalizados por rango y materia */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Fecha inicio"
            value={fechaInicio}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#000', 0.2) : '#fff',
                '& fieldset': {
                  borderColor: alpha(isDark ? '#fff' : '#000', 0.12),
                },
                '&:hover fieldset': {
                  borderColor: accent,
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Fecha fin"
            value={fechaFin}
            onChange={(e) => onFechaFinChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#000', 0.2) : '#fff',
                '& fieldset': {
                  borderColor: alpha(isDark ? '#fff' : '#000', 0.12),
                },
                '&:hover fieldset': {
                  borderColor: accent,
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Materia</InputLabel>
            <Select
              value={asignacionId ?? ''}
              onChange={(e) => onAsignacionChange(e.target.value ? Number(e.target.value) : undefined)}
              label="Materia"
              sx={{
                borderRadius: '12px',
                bgcolor: isDark ? alpha('#000', 0.2) : '#fff',
                '& fieldset': {
                  borderColor: alpha(isDark ? '#fff' : '#000', 0.12),
                },
                '&:hover fieldset': {
                  borderColor: accent,
                },
              }}
            >
              <MenuItem value="">
                <em>Todas las materias</em>
              </MenuItem>
              {materias.map((materia) => (
                <MenuItem key={materia.asignacion_docente_id} value={materia.asignacion_docente_id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: materia.materia_color || accent,
                      }}
                    />
                    {materia.materia_nombre}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onLimpiar}
            disabled={!hayFiltrosActivos}
            sx={{
              height: 40,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
              color: 'text.secondary',
              '&:hover': {
                borderColor: accent,
                bgcolor: alpha(accent, 0.1),
                color: accent,
              },
            }}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>

      {/* Resumen de chips con filtros aplicados */}
      {hayFiltrosActivos && (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}` }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.66rem' }}>
            Filtros activos actualmente:
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {fechaInicio && (
              <Chip
                label={`Desde: ${new Date(fechaInicio + 'T12:00:00').toLocaleDateString('es-BO')}`}
                size="small"
                onDelete={() => onFechaInicioChange('')}
                sx={{
                  borderRadius: '8px',
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  border: `1px solid ${alpha(accent, 0.3)}`,
                }}
              />
            )}

            {fechaFin && (
              <Chip
                label={`Hasta: ${new Date(fechaFin + 'T12:00:00').toLocaleDateString('es-BO')}`}
                size="small"
                onDelete={() => onFechaFinChange('')}
                sx={{
                  borderRadius: '8px',
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  border: `1px solid ${alpha(accent, 0.3)}`,
                }}
              />
            )}

            {asignacionId && (
              <Chip
                label={`Materia: ${materias.find(m => m.asignacion_docente_id === asignacionId)?.materia_nombre || 'Asignada'}`}
                size="small"
                onDelete={() => onAsignacionChange(undefined)}
                sx={{
                  borderRadius: '8px',
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  border: `1px solid ${alpha(accent, 0.3)}`,
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default FiltrosAsistencia;