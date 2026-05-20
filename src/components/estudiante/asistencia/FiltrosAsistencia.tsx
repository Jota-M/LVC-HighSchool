'use client';
// components/estudiante/asistencia/FiltrosAsistencia.tsx

import React, { useMemo } from 'react';
import {
  Box, Typography, alpha, Paper, TextField,
  Button, Chip, MenuItem, Select, FormControl,
  InputLabel, Grid,
} from '@mui/material';
import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
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

  const hayFiltrosActivos = fechaInicio || fechaFin || asignacionId !== undefined;

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
        border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        borderRadius: '12px',
        p: 2.5,
        mt: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterIcon sx={{ fontSize: 20, color: accent }} />
        <Typography variant="subtitle2" fontWeight={600}>
          Filtros de búsqueda
        </Typography>

        {hayFiltrosActivos && (
          <Chip
            label="Activos"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              bgcolor: alpha(accent, 0.15),
              color: accent,
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Filtros rápidos */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Períodos predefinidos
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filtrosRapidos.map((filtro, idx) => (
            <Chip
              key={idx}
              label={filtro.label}
              size="small"
              onClick={() => aplicarFiltroRapido(filtro)}
              sx={{
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                '&:hover': {
                  bgcolor: alpha(accent, 0.15),
                  color: accent,
                },
                transition: 'all 0.2s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Filtros personalizados */}
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
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
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
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
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
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
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
                        width: 8,
                        height: 8,
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
              borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
              color: 'text.secondary',
              '&:hover': {
                borderColor: accent,
                bgcolor: alpha(accent, 0.08),
                color: accent,
              },
            }}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>

      {/* Resumen de filtros activos */}
      {hayFiltrosActivos && (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Filtros aplicados:
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {fechaInicio && (
              <Chip
                label={`Desde: ${new Date(fechaInicio + 'T12:00:00').toLocaleDateString('es-BO')}`}
                size="small"
                onDelete={() => onFechaInicioChange('')}
                sx={{
                  bgcolor: alpha(accent, 0.1),
                  color: accent,
                }}
              />
            )}

            {fechaFin && (
              <Chip
                label={`Hasta: ${new Date(fechaFin + 'T12:00:00').toLocaleDateString('es-BO')}`}
                size="small"
                onDelete={() => onFechaFinChange('')}
                sx={{
                  bgcolor: alpha(accent, 0.1),
                  color: accent,
                }}
              />
            )}

            {asignacionId && (
              <Chip
                label={`Materia: ${materias.find(m => m.asignacion_docente_id === asignacionId)?.materia_nombre}`}
                size="small"
                onDelete={() => onAsignacionChange(undefined)}
                sx={{
                  bgcolor: alpha(accent, 0.1),
                  color: accent,
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};