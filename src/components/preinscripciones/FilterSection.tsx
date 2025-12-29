// src/components/preinscripciones/FilterSection.tsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Stack,
  Avatar,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Fade,
  useTheme,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);

  // Cargar opciones de filtros
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

  return (
    <Fade in timeout={800}>
      <Paper 
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)'
            : '#fff',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <FilterListIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700}>
                Filtros
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {resultCount} resultado(s)
                </Typography>
                {activeFiltersCount > 0 && (
                  <Chip 
                    label={`${activeFiltersCount} filtro(s) activo(s)`}
                    size="small"
                    color="primary"
                    sx={{ height: 20 }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            {/* BÚSQUEDA */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth 
                placeholder="Buscar por nombre, CI o código..."
                value={filters.searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              />
            </Grid>

            {/* ESTADO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select 
                  value={filters.estadoFilter}
                  onChange={(e) => onEstadoChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  {ESTADOS_DISPONIBLES.map(estado => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* GRADO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select 
                  value={filters.gradoFilter}
                  onChange={(e) => onGradoChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="todos">Todos los grados</MenuItem>
                  {grados.map(g => (
                    <MenuItem key={g.id} value={g.nombre}>
                      {g.nivel_nombre} - {g.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* TURNO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select 
                  value={filters.turnoFilter}
                  onChange={(e) => onTurnoChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="todos">Todos los turnos</MenuItem>
                  {turnos.map(t => (
                    <MenuItem key={t.id} value={t.nombre}>
                      {t.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* PERIODO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select 
                  value={filters.periodoFilter}
                  onChange={(e) => onPeriodoChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="todos">Todos los periodos</MenuItem>
                  {periodos.map(p => (
                    <MenuItem key={p.id} value={p.nombre}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* CUPO ASIGNADO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select 
                  value={filters.conCupoFilter}
                  onChange={(e) => onConCupoChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  {CUPO_DISPONIBLES.map(cupo => (
                    <MenuItem key={cupo.value} value={cupo.value}>
                      {cupo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Fade>
  );
};