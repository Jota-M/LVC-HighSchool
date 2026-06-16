// src/components/cupos/CuposFiltros.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [periodos, setPeriodos] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);

  useEffect(() => {
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
      } catch (err) {
        console.error('Error al cargar opciones:', err);
      }
    };
    loadOptions();
  }, []);

  const activeCount = [
    filters.periodo_academico_id,
    filters.grado_id,
    filters.turno_id,
    filters.solo_activos,
  ].filter(Boolean).length;

  const selectSx = {
    borderRadius: '16px',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.1) },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(accent, 0.3) },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
  };

  return (
    <Box>
      {/* Conteo + filtros activos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {resultCount} resultado(s)
        </Typography>
        {activeCount > 0 && (
          <Chip
            label={`${activeCount} filtro(s) activo(s)`}
            size="small"
            sx={{
              height: 22,
              bgcolor: alpha(accent, 0.15),
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
        {/* Periodo */}
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.periodo_academico_id || ''}
            onChange={(e) => onFilterChange({ periodo_academico_id: e.target.value || undefined })}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            <MenuItem value="">Todos los periodos</MenuItem>
            {periodos.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Grado */}
        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={filters.grado_id || ''}
            onChange={(e) => onFilterChange({ grado_id: e.target.value || undefined })}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            <MenuItem value="">Todos los grados</MenuItem>
            {grados.map((g) => (
              <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Turno */}
        <FormControl sx={{ minWidth: 160 }}>
          <Select
            value={filters.turno_id || ''}
            onChange={(e) => onFilterChange({ turno_id: e.target.value || undefined })}
            displayEmpty
            size="medium"
            sx={selectSx}
          >
            <MenuItem value="">Todos los turnos</MenuItem>
            {turnos.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Switch solo activos */}
        <Box
          sx={{
            px: 2,
            py: 1.2,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={filters.solo_activos}
                onChange={(e) => onFilterChange({ solo_activos: e.target.checked })}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: accent },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accent },
                }}
              />
            }
            label={
              <Typography variant="body2" fontWeight={600} sx={{ userSelect: 'none' }}>
                Solo activos
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>
      </Box>
    </Box>
  );
};