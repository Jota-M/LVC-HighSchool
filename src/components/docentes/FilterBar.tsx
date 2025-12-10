'use client';
import React from 'react';
import {
  Box, TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Chip, IconButton, Tooltip, ToggleButtonGroup,
  ToggleButton, alpha, useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  tipoContrato: string;
  onTipoContratoChange: (value: string) => void;
  activo: string;
  onActivoChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search, onSearchChange, tipoContrato, onTipoContratoChange,
  activo, onActivoChange, viewMode, onViewModeChange,
  onRefresh, onClearFilters, hasFilters
}) => {
  const theme = useTheme();

  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      alignItems: 'center',
      p: 2,
      borderRadius: 3,
      bgcolor: alpha(theme.palette.grey[500], 0.02),
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
    }}>
      {/* Búsqueda */}
      <TextField
        placeholder="Buscar por nombre, código, CI..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 250 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: { borderRadius: 2, bgcolor: 'background.paper' }
        }}
      />

      {/* Filtro por tipo de contrato */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Tipo Contrato</InputLabel>
        <Select
          value={tipoContrato}
          label="Tipo Contrato"
          onChange={(e) => onTipoContratoChange(e.target.value)}
          sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="planta">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
              Planta
            </Box>
          </MenuItem>
          <MenuItem value="contrato">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2196f3' }} />
              Contrato
            </Box>
          </MenuItem>
          <MenuItem value="honorarios">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
              Honorarios
            </Box>
          </MenuItem>
          <MenuItem value="medio_tiempo">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9c27b0' }} />
              Medio Tiempo
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Filtro por estado */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Estado</InputLabel>
        <Select
          value={activo}
          label="Estado"
          onChange={(e) => onActivoChange(e.target.value)}
          sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">
            <Chip label="Activos" size="small" color="success" sx={{ height: 22 }} />
          </MenuItem>
          <MenuItem value="false">
            <Chip label="Inactivos" size="small" color="default" sx={{ height: 22 }} />
          </MenuItem>
        </Select>
      </FormControl>

      {/* Indicador de filtros activos */}
      {hasFilters && (
        <Tooltip title="Limpiar filtros">
          <Chip
            label="Filtros activos"
            size="small"
            color="primary"
            onDelete={onClearFilters}
            deleteIcon={<ClearIcon />}
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />

      {/* Botón de refrescar */}
      <Tooltip title="Actualizar">
        <IconButton onClick={onRefresh} sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
        }}>
          <RefreshIcon color="primary" />
        </IconButton>
      </Tooltip>

      {/* Selector de vista */}
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, v) => v && onViewModeChange(v)}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.grey[500], 0.05),
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: '8px !important',
            px: 1.5,
            '&.Mui-selected': {
              bgcolor: 'background.paper',
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
            }
          }
        }}
      >
        <ToggleButton value="grid">
          <Tooltip title="Vista de tarjetas">
            <GridIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="list">
          <Tooltip title="Vista de lista">
            <ListIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default FilterBar;