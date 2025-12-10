'use client';
import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, TextField, InputAdornment,
  Checkbox, Chip, alpha, useTheme, IconButton, Tabs, Tab,
  Tooltip, Fade, CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
  Schedule as ClockIcon,
  Star as StarIcon,
  Science as LabIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { MateriaDisponible } from '../../services/planEstudios';
import { AreaConocimiento } from '../../services/materias';

interface AsignarMateriasDialogProps {
  open: boolean;
  onClose: () => void;
  onAsignar: (materiaIds: number[]) => Promise<void>;
  materiasDisponibles: MateriaDisponible[];
  areas: AreaConocimiento[];
  gradoNombre: string;
  loading?: boolean;
}

const AsignarMateriasDialog: React.FC<AsignarMateriasDialogProps> = ({
  open, onClose, onAsignar, materiasDisponibles, areas, gradoNombre, loading
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [areaFilter, setAreaFilter] = useState<number | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar materias
  const materiasFiltradas = useMemo(() => {
    return materiasDisponibles.filter(m => {
      if (m.ya_asignada) return false;
      
      const matchSearch = search === '' ||
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        m.codigo.toLowerCase().includes(search.toLowerCase());
      
      const matchArea = areaFilter === 'all' || m.area_conocimiento_id === areaFilter;
      
      return matchSearch && matchArea;
    });
  }, [materiasDisponibles, search, areaFilter]);

  // Agrupar por área
  const materiasPorArea = useMemo(() => {
    const grupos: Record<string, MateriaDisponible[]> = {};
    
    materiasFiltradas.forEach(m => {
      const areaKey = m.area_nombre || 'Sin Área';
      if (!grupos[areaKey]) grupos[areaKey] = [];
      grupos[areaKey].push(m);
    });
    
    return grupos;
  }, [materiasFiltradas]);

  const toggleMateria = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAsignar = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAsignar(selectedIds);
      setSelectedIds([]);
      setSearch('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearch('');
    setAreaFilter('all');
    onClose();
  };

  // Resumen de selección
  const seleccionResumen = useMemo(() => {
    const selected = materiasDisponibles.filter(m => selectedIds.includes(m.id));
    return {
      count: selected.length,
      horas: selected.reduce((sum, m) => sum + (m.horas_semanales || 0), 0),
      creditos: selected.reduce((sum, m) => sum + (m.creditos || 0), 0)
    };
  }, [selectedIds, materiasDisponibles]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '85vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight="700">
              Asignar Materias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona las materias para <strong>{gradoNombre}</strong>
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Barra de búsqueda y filtros */}
        <Box sx={{
          p: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.03),
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'background.paper' }
            }}
            sx={{ mb: 2 }}
          />

          {/* Filtros por área */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Todas"
              onClick={() => setAreaFilter('all')}
              color={areaFilter === 'all' ? 'primary' : 'default'}
              variant={areaFilter === 'all' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
            {areas.slice(0, 5).map(area => (
              <Chip
                key={area.id}
                label={area.nombre}
                onClick={() => setAreaFilter(area.id)}
                sx={{
                  fontWeight: 600,
                  bgcolor: areaFilter === area.id ? alpha(area.color || '#888', 0.2) : 'transparent',
                  borderColor: area.color,
                  color: areaFilter === area.id ? area.color : 'text.primary',
                  '&:hover': { bgcolor: alpha(area.color || '#888', 0.1) }
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Lista de materias */}
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : materiasFiltradas.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No hay materias disponibles
              </Typography>
            </Box>
          ) : (
            Object.entries(materiasPorArea).map(([areaNombre, materias]) => (
              <Box key={areaNombre} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="700"
                  color="text.secondary"
                  sx={{ mb: 1.5, pl: 1 }}
                >
                  {areaNombre} ({materias.length})
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
                  {materias.map(materia => {
                    const isSelected = selectedIds.includes(materia.id);
                    const areaColor = materia.area_color || theme.palette.grey[400];
                    
                    return (
                      <Box
                        key={materia.id}
                        onClick={() => toggleMateria(materia.id)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: `2px solid ${isSelected ? areaColor : alpha(theme.palette.divider, 0.2)}`,
                          bgcolor: isSelected ? alpha(areaColor, 0.08) : 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: alpha(areaColor, 0.5),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(areaColor, 0.15)}`
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Checkbox
                            checked={isSelected}
                            sx={{
                              p: 0,
                              color: alpha(areaColor, 0.5),
                              '&.Mui-checked': { color: areaColor }
                            }}
                          />
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" fontWeight="600" noWrap>
                                {materia.nombre}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={materia.codigo}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(areaColor, 0.1),
                                  color: areaColor
                                }}
                              />
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ClockIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {materia.horas_semanales || 0}h
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {materia.creditos || 0}
                                </Typography>
                              </Box>
                              
                              {materia.tiene_laboratorio && (
                                <Tooltip title="Con laboratorio">
                                  <LabIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </DialogContent>

      {/* Footer con resumen */}
      <DialogActions sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.03) }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedIds.length > 0 && (
            <Fade in>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<CheckIcon />}
                  label={`${seleccionResumen.count} materias`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {seleccionResumen.horas}h/sem • {seleccionResumen.creditos} créditos
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
        
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleAsignar}
          disabled={selectedIds.length === 0 || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} /> : <AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
          }}
        >
          Asignar {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarMateriasDialog;