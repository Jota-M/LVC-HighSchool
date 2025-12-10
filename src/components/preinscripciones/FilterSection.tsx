// src/app/dashboard/preinscripciones/components/FilterSection.tsx

import React from 'react';
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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { PreinscripcionFilters } from '../../types/preinscripcioonTypes';
import { ESTADOS_DISPONIBLES, GRADOS_DISPONIBLES } from '../../utils/preinscripcionUtils';

interface FilterSectionProps {
  filters: PreinscripcionFilters;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onGradoChange: (value: string) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  resultCount,
  onSearchChange,
  onEstadoChange,
  onGradoChange,
}) => {
  const theme = useTheme();

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

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select 
                  value={filters.gradoFilter}
                  onChange={(e) => onGradoChange(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  {GRADOS_DISPONIBLES.map(grado => (
                    <MenuItem key={grado.value} value={grado.value}>
                      {grado.label}
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