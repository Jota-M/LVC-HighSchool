// src/components/cupos/CuposFiltros.tsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '@/lib/api';
import { CupoFilters } from '@/hooks/useCupos';

interface CuposFiltrosProps {
  filters: CupoFilters;
  onFilterChange: (filters: Partial<CupoFilters>) => void;
  resultCount: number;
}

export const CuposFiltros: React.FC<CuposFiltrosProps> = ({
  filters,
  onFilterChange,
  resultCount,
}) => {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);

  useEffect(() => {
    // Cargar opciones de filtros
    const loadOptions = async () => {
      try {
        const [periodosRes, gradosRes, turnosRes] = await Promise.all([
          api.get('/public/academicos/periodo-activo'),
          api.get('/public/academicos/grados'),
          api.get('/public/academicos/turnos'),
        ]);

        setPeriodos(periodosRes.data.data?.periodo ? [periodosRes.data.data.periodo] : []);
        setGrados(gradosRes.data.data?.grados || []);
        setTurnos(turnosRes.data.data?.turnos || []);
      } catch (error) {
        console.error('Error al cargar opciones:', error);
      }
    };

    loadOptions();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        mb: 3,
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <FilterListIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Filtros
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {resultCount} resultado(s)
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary" mb={1}>
              Periodo Académico
            </Typography>
            <Select
              value={filters.periodo_academico_id || ''}
              onChange={(e) => onFilterChange({ periodo_academico_id: e.target.value || undefined })}
              displayEmpty
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">Todos los periodos</MenuItem>
              {periodos.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary" mb={1}>
              Grado
            </Typography>
            <Select
              value={filters.grado_id || ''}
              onChange={(e) => onFilterChange({ grado_id: e.target.value || undefined })}
              displayEmpty
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">Todos los grados</MenuItem>
              {grados.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary" mb={1}>
              Turno
            </Typography>
            <Select
              value={filters.turno_id || ''}
              onChange={(e) => onFilterChange({ turno_id: e.target.value || undefined })}
              displayEmpty
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">Todos los turnos</MenuItem>
              {turnos.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ pt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.solo_activos}
                  onChange={(e) => onFilterChange({ solo_activos: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight={600}>
                  Solo activos
                </Typography>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};