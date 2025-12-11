'use client';
import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, TextField, InputAdornment,
  Checkbox, Chip, alpha, useTheme, IconButton,
  Tooltip, Fade, CircularProgress, Paper, Avatar, Divider, Zoom
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Schedule as ClockIcon,
  Star as StarIcon,
  Science as LabIcon,
  Add as AddIcon,
  FilterList as FilterIcon
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
  const isDark = theme.palette.mode === 'dark';
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
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          maxHeight: '90vh',
          background: isDark
            ? alpha('#0f172a', 0.98)
            : alpha('#ffffff', 0.98),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }
      }}
    >
      {/* Header mejorado */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                boxShadow: `0 4px 12px ${alpha(isDark ? '#facc15' : '#0288d1', 0.4)}`,
              }}
            >
              <AddIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Asignar Materias
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Selecciona materias para <strong>{gradoNombre}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* Barra de búsqueda y filtros */}
        <Box sx={{
          p: 3,
          bgcolor: isDark
            ? alpha('#1e293b', 0.5)
            : alpha('#f8fafc', 0.8),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
        }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '12px',
                bgcolor: theme.palette.background.paper,
                '&:hover': {
                  boxShadow: `0 0 0 2px ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
                }
              }
            }}
            sx={{ mb: 2 }}
          />

          {/* Filtros por área */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FilterIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Chip
              label="Todas"
              onClick={() => setAreaFilter('all')}
              sx={{
                fontWeight: 700,
                bgcolor: areaFilter === 'all' 
                  ? (isDark ? '#facc15' : '#0288d1')
                  : 'transparent',
                color: areaFilter === 'all' 
                  ? (isDark ? '#000' : '#fff')
                  : 'text.primary',
                border: areaFilter === 'all'
                  ? 'none'
                  : `2px solid ${alpha(theme.palette.divider, 0.3)}`,
                '&:hover': {
                  bgcolor: areaFilter === 'all'
                    ? (isDark ? '#f59e0b' : '#01579b')
                    : alpha(theme.palette.primary.main, 0.1),
                }
              }}
            />
            {areas.slice(0, 5).map(area => (
              <Chip
                key={area.id}
                label={area.nombre}
                onClick={() => setAreaFilter(area.id)}
                sx={{
                  fontWeight: 600,
                  bgcolor: areaFilter === area.id 
                    ? alpha(area.color || '#888', 0.2)
                    : 'transparent',
                  borderColor: area.color,
                  color: areaFilter === area.id ? area.color : 'text.primary',
                  border: `2px solid ${areaFilter === area.id ? area.color : alpha(theme.palette.divider, 0.3)}`,
                  '&:hover': { 
                    bgcolor: alpha(area.color || '#888', 0.15),
                    borderColor: area.color,
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Lista de materias */}
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress size={60} thickness={4} />
              <Typography color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>
                Cargando materias...
              </Typography>
            </Box>
          ) : materiasFiltradas.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                No hay materias disponibles
              </Typography>
            </Box>
          ) : (
            Object.entries(materiasPorArea).map(([areaNombre, materias]) => (
              <Box key={areaNombre} sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    mb: 2,
                    pl: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {areaNombre}
                  <Chip 
                    label={materias.length} 
                    size="small"
                    sx={{ 
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                  {materias.map((materia, index) => {
                    const isSelected = selectedIds.includes(materia.id);
                    const areaColor = materia.area_color || theme.palette.grey[400];
                    
                    return (
                      <Zoom 
                        key={materia.id}
                        in={true}
                        style={{ transitionDelay: `${index * 30}ms` }}
                      >
                        <Paper
                          elevation={0}
                          onClick={() => toggleMateria(materia.id)}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: isSelected 
                              ? `2px solid ${areaColor}` 
                              : `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: isSelected 
                              ? alpha(areaColor, 0.1)
                              : theme.palette.background.paper,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: alpha(areaColor, 0.6),
                              transform: 'translateY(-4px) scale(1.01)',
                              boxShadow: `0 8px 20px ${alpha(areaColor, 0.2)}`
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Checkbox
                              checked={isSelected}
                              sx={{
                                p: 0,
                                color: alpha(areaColor, 0.5),
                                '&.Mui-checked': { 
                                  color: areaColor,
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            />
                            
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                                {materia.nombre}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                <Chip
                                  label={materia.codigo}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    bgcolor: alpha(areaColor, 0.15),
                                    color: areaColor,
                                    border: `1px solid ${alpha(areaColor, 0.3)}`,
                                  }}
                                />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ClockIcon sx={{ fontSize: 14, color: '#06b6d4' }} />
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#06b6d4' }}>
                                    {materia.horas_semanales || 0}h
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#f59e0b' }}>
                                    {materia.creditos || 0}
                                  </Typography>
                                </Box>
                                
                                {materia.tiene_laboratorio && (
                                  <Tooltip title="Con laboratorio">
                                    <LabIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Zoom>
                    );
                  })}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </DialogContent>

      <Divider />

      {/* Footer con resumen mejorado */}
      <DialogActions sx={{ 
        p: 3,
        bgcolor: isDark
          ? alpha('#1e293b', 0.5)
          : alpha('#f8fafc', 0.8),
      }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedIds.length > 0 && (
            <Fade in>
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
                  border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                }}
              >
                <Chip
                  icon={<CheckIcon />}
                  label={`${seleccionResumen.count} materias`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {seleccionResumen.horas}h/sem • {seleccionResumen.creditos} créditos
                </Typography>
              </Paper>
            </Fade>
          )}
        </Box>
        
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          sx={{
            borderRadius: '12px',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleAsignar}
          disabled={selectedIds.length === 0 || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} /> : <AddIcon />}
          sx={{
            borderRadius: '12px',
            px: 4,
            fontWeight: 600,
            textTransform: 'none',
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 12px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.4)}`,
            },
            transition: 'all 0.3s ease',
          }}
        >
          Asignar {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarMateriasDialog;