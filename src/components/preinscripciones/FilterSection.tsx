// src/components/preinscripciones/FilterSection.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  useTheme,
  Chip,
  alpha,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import { PreinscripcionFilters } from '../../types/preinscripcioonTypes';
import api from '@/lib/api';

const ESTADOS_DISPONIBLES = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'iniciada', label: 'Iniciada' },
  { value: 'datos_completos', label: 'Datos Completos' },
  { value: 'documentos_pendientes', label: 'Documentos Pendientes' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'documentos_aprobados', label: 'Documentos Aprobados' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'convertida', label: 'Convertida' },
];

const CUPO_DISPONIBLES = [
  { value: 'todos', label: 'Todos los cupos' },
  { value: 'con_cupo', label: '✅ Con cupo asignado' },
  { value: 'sin_cupo', label: '⚠️ Sin cupo asignado' },
];

interface FilterSectionProps {
  filters: PreinscripcionFilters;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onGradoChange: (value: string) => void;
  onTurnoChange: (value: string) => void;
  onPeriodoChange: (value: string) => void;
  onConCupoChange: (value: string) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  resultCount,
  onSearchChange,
  onEstadoChange,
  onGradoChange,
  onTurnoChange,
  onPeriodoChange,
  onConCupoChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [gradosRes, turnosRes, periodosRes] = await Promise.all([
          api.get('/public/academicos/grados'),
          api.get('/public/academicos/turnos'),
          api.get('/public/academicos/periodo-activo'),
        ]);
        setGrados(gradosRes.data.data?.grados || []);
        setTurnos(turnosRes.data.data?.turnos || []);
        const periodo = periodosRes.data.data?.periodo;
        setPeriodos(periodo ? [periodo] : []);
      } catch (error) {
        console.error('Error al cargar opciones:', error);
      }
    };
    loadOptions();
  }, []);

  const countActiveFilters = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.estadoFilter !== 'todos') count++;
    if (filters.gradoFilter !== 'todos') count++;
    if (filters.turnoFilter !== 'todos') count++;
    if (filters.periodoFilter !== 'todos') count++;
    if (filters.conCupoFilter !== 'todos') count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  const selectSx = {
    borderRadius: '16px',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.divider, 0.1),
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(accent, 0.3),
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: accent,
    },
  };

  return (
    <Box>
      {/* Header de filtros */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {resultCount} resultado(s)
        </Typography>
        {activeFiltersCount > 0 && (
          <Chip
            label={`${activeFiltersCount} filtro(s) activo(s)`}
            size="small"
            sx={{
              height: 22,
              backgroundColor: alpha(accent, 0.15),
              color: accent,
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          flexWrap: 'wrap',
        }}
      >
        {/* Búsqueda */}
        <TextField
          fullWidth
          size="medium"
          placeholder="Buscar por nombre, CI o código..."
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(accent, 0.3),
              },
            },
          }}
          sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
        />

        {/* Estado */}
        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={filters.estadoFilter}
            onChange={(e) => onEstadoChange(e.target.value)}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            {ESTADOS_DISPONIBLES.map((estado) => (
              <MenuItem key={estado.value} value={estado.value}>
                {estado.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Grado */}
        <FormControl sx={{ minWidth: 160 }}>
          <Select
            value={filters.gradoFilter}
            onChange={(e) => onGradoChange(e.target.value)}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            <MenuItem value="todos">Todos los grados</MenuItem>
            {grados.map((g) => (
              <MenuItem key={g.id} value={g.nombre}>
                {g.nivel_nombre} - {g.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Turno */}
        <FormControl sx={{ minWidth: 160 }}>
          <Select
            value={filters.turnoFilter}
            onChange={(e) => onTurnoChange(e.target.value)}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            <MenuItem value="todos">Todos los turnos</MenuItem>
            {turnos.map((t) => (
              <MenuItem key={t.id} value={t.nombre}>
                {t.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Periodo */}
        <FormControl sx={{ minWidth: 160 }}>
          <Select
            value={filters.periodoFilter}
            onChange={(e) => onPeriodoChange(e.target.value)}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            <MenuItem value="todos">Todos los periodos</MenuItem>
            {periodos.map((p) => (
              <MenuItem key={p.id} value={p.nombre}>
                {p.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Cupo */}
        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={filters.conCupoFilter}
            onChange={(e) => onConCupoChange(e.target.value)}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            {CUPO_DISPONIBLES.map((cupo) => (
              <MenuItem key={cupo.value} value={cupo.value}>
                {cupo.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};