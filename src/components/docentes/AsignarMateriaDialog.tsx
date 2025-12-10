'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, TextField, Chip,
  alpha, useTheme, CircularProgress, Avatar, Stepper, Step, StepLabel,
  Alert, InputAdornment, Autocomplete, Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  MenuBook as MateriaIcon,
  Class as ParaleloIcon,
  CalendarMonth as PeriodoIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Docente, AsignacionFormData } from '../../services/docentes';
import { useAcademicos } from '../../hooks/useAcademicos';

interface AsignarMateriaDialogProps {
  open: boolean;
  onClose: () => void;
  onAsignar: (data: AsignacionFormData) => Promise<void>;
  docente: Docente | null;
  loading?: boolean;
}

const AsignarMateriaDialog: React.FC<AsignarMateriaDialogProps> = ({
  open, onClose, onAsignar, docente, loading
}) => {
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [searchMateria, setSearchMateria] = useState('');
  const [searchParalelo, setSearchParalelo] = useState('');
  const [selectedGradoId, setSelectedGradoId] = useState<number | null>(null);
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
  
  // Hook de datos académicos
  const {
    periodos, periodoActivo, paralelos, gradoMaterias, grados, turnos,
    loading: loadingAcademicos, error: errorAcademicos
  } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadTurnos: true,
    loadGrados: true,
    loadParalelos: true,
    loadGradoMaterias: true
  });
  
  const [formData, setFormData] = useState<AsignacionFormData>({
    docente_id: 0,
    grado_materia_id: 0,
    paralelo_id: 0,
    periodo_academico_id: 0,
    es_titular: true,
    fecha_inicio: new Date().toISOString().split('T')[0]
  });

  // Actualizar docente_id cuando cambie
  useEffect(() => {
    if (docente) {
      setFormData(prev => ({ ...prev, docente_id: docente.id }));
    }
  }, [docente]);

  // Periodo activo por defecto
  useEffect(() => {
    if (periodoActivo && formData.periodo_academico_id === 0) {
      setFormData(prev => ({ ...prev, periodo_academico_id: periodoActivo.id }));
    }
  }, [periodoActivo, formData.periodo_academico_id]);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setFormData({
        docente_id: docente?.id || 0,
        grado_materia_id: 0,
        paralelo_id: 0,
        periodo_academico_id: periodoActivo?.id || 0,
        es_titular: true,
        fecha_inicio: new Date().toISOString().split('T')[0]
      });
      setActiveStep(0);
      setSearchMateria('');
      setSearchParalelo('');
      setSelectedGradoId(null);
      setSelectedTurnoId(null);
    }
  }, [open, docente, periodoActivo]);

  // Filtrar materias con búsqueda y por grado
  const materiasFiltradas = useMemo(() => {
    let filtered = gradoMaterias;

    // Filtrar por grado seleccionado
    if (selectedGradoId) {
      filtered = filtered.filter(gm => gm.grado_id === selectedGradoId);
    }

    // Filtrar por búsqueda
    if (searchMateria.trim()) {
      const search = searchMateria.toLowerCase();
      filtered = filtered.filter(gm => 
        gm.materia_nombre?.toLowerCase().includes(search) ||
        gm.materia_codigo?.toLowerCase().includes(search) ||
        gm.grado_nombre?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [gradoMaterias, searchMateria, selectedGradoId]);

  // Filtrar paralelos con búsqueda, por grado y turno
  const paralelosFiltrados = useMemo(() => {
    let filtered = paralelos;

    // Filtrar por grado seleccionado
    if (selectedGradoId) {
      filtered = filtered.filter(p => p.grado_id === selectedGradoId);
    }

    // Filtrar por turno seleccionado
    if (selectedTurnoId) {
      filtered = filtered.filter(p => p.turno_id === selectedTurnoId);
    }

    // Filtrar por búsqueda
    if (searchParalelo.trim()) {
      const search = searchParalelo.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre?.toLowerCase().includes(search) ||
        p.grado_nombre?.toLowerCase().includes(search) ||
        p.turno_nombre?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [paralelos, searchParalelo, selectedGradoId, selectedTurnoId]);

  const handleSubmit = async () => {
    if (!formData.grado_materia_id || !formData.paralelo_id || !formData.periodo_academico_id) {
      return;
    }
    
    setSubmitting(true);
    try {
      await onAsignar(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMateria = gradoMaterias.find(gm => gm.id === formData.grado_materia_id);
  const selectedParalelo = paralelos.find(p => p.id === formData.paralelo_id);
  const selectedPeriodo = periodos.find(p => p.id === formData.periodo_academico_id);

  const steps = ['Materia', 'Paralelo', 'Confirmar'];

  const canProceed = () => {
    switch (activeStep) {
      case 0: return formData.grado_materia_id > 0;
      case 1: return formData.paralelo_id > 0 && formData.periodo_academico_id > 0;
      default: return true;
    }
  };

  if (!docente) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={docente.foto_url} sx={{ width: 48, height: 48 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700">Asignar Materia</Typography>
              <Typography variant="body2" color="text.secondary">
                {docente.nombres} {docente.apellidos}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} disabled={submitting}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        {errorAcademicos && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorAcademicos}
          </Alert>
        )}

        {loadingAcademicos ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={48} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Cargando datos académicos...
            </Typography>
          </Box>
        ) : (
          <>
            {/* PASO 1: SELECCIONAR MATERIA */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Selecciona la materia a asignar
                </Typography>

                {/* Filtros de materia */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    placeholder="Buscar materia..."
                    value={searchMateria}
                    onChange={(e) => setSearchMateria(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Filtrar por grado</InputLabel>
                    <Select
                      value={selectedGradoId || ''}
                      label="Filtrar por grado"
                      onChange={(e) => setSelectedGradoId(e.target.value as number || null)}
                    >
                      <MenuItem value="">Todos los grados</MenuItem>
                      {grados.map(g => (
                        <MenuItem key={g.id} value={g.id}>
                          {g.nombre} ({g.nivel_nombre})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                {materiasFiltradas.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <MateriaIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      {searchMateria || selectedGradoId 
                        ? 'No se encontraron materias con esos filtros'
                        : 'No hay materias disponibles'}
                    </Typography>
                    {(searchMateria || selectedGradoId) && (
                      <Button 
                        size="small" 
                        onClick={() => {
                          setSearchMateria('');
                          setSelectedGradoId(null);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1, 
                    maxHeight: 400, 
                    overflowY: 'auto',
                    pr: 1
                  }}>
                    {materiasFiltradas.map(gm => {
                      const isSelected = formData.grado_materia_id === gm.id;
                      return (
                        <Box
                          key={gm.id}
                          onClick={() => setFormData(prev => ({ ...prev, grado_materia_id: gm.id }))}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.03)
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                              width: 8, height: 8, borderRadius: '50%',
                              bgcolor: gm.materia_color || theme.palette.primary.main
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography fontWeight="600">{gm.materia_nombre}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                <Chip 
                                  label={gm.materia_codigo} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={gm.grado_nombre} 
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                {gm.horas_semanales && (
                                  <Chip 
                                    icon={<TimeIcon sx={{ fontSize: 14 }} />}
                                    label={`${gm.horas_semanales}h/sem`} 
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                            {isSelected && <Chip label="✓ Seleccionado" size="small" color="primary" />}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

            {/* PASO 2: SELECCIONAR PARALELO Y CONFIGURACIÓN */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Selecciona el paralelo y configuración
                </Typography>

                {/* Mostrar materia seleccionada */}
                {selectedMateria && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight="600">
                      Materia seleccionada: {selectedMateria.materia_nombre}
                    </Typography>
                    <Typography variant="caption">
                      {selectedMateria.grado_nombre} • {selectedMateria.materia_codigo}
                    </Typography>
                  </Alert>
                )}

                {/* Filtros de paralelo */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    placeholder="Buscar paralelo..."
                    value={searchParalelo}
                    onChange={(e) => setSearchParalelo(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Turno</InputLabel>
                    <Select
                      value={selectedTurnoId || ''}
                      label="Turno"
                      onChange={(e) => setSelectedTurnoId(e.target.value as number || null)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {turnos.map(t => (
                        <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Lista de paralelos */}
                {paralelosFiltrados.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <ParaleloIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      No hay paralelos disponibles
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1, 
                    maxHeight: 250, 
                    overflowY: 'auto',
                    mb: 3,
                    pr: 1
                  }}>
                    {paralelosFiltrados.map(p => {
                      const isSelected = formData.paralelo_id === p.id;
                      return (
                        <Box
                          key={p.id}
                          onClick={() => setFormData(prev => ({ ...prev, paralelo_id: p.id }))}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.03)
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography fontWeight="600">
                                {p.grado_nombre} - Paralelo "{p.nombre}"
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label={p.turno_nombre} size="small" sx={{ height: 20 }} />
                                {p.aula && <Chip label={`Aula: ${p.aula}`} size="small" variant="outlined" sx={{ height: 20 }} />}
                                {p.capacidad_maxima && (
                                  <Chip 
                                    icon={<PeopleIcon sx={{ fontSize: 14 }} />}
                                    label={`Cap: ${p.capacidad_maxima}`} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 20 }}
                                  />
                                )}
                              </Box>
                            </Box>
                            {isSelected && <Chip label="✓" size="small" color="primary" />}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Configuración adicional */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Periodo Académico *</InputLabel>
                  <Select
                    value={formData.periodo_academico_id}
                    label="Periodo Académico *"
                    onChange={(e) => setFormData(prev => ({ ...prev, periodo_academico_id: e.target.value as number }))}
                  >
                    {periodos.length === 0 ? (
                      <MenuItem disabled>No hay periodos disponibles</MenuItem>
                    ) : (
                      periodos.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <PeriodoIcon fontSize="small" color="action" />
                            <span>{p.nombre}</span>
                            {p.activo && <Chip label="Activo" size="small" color="success" sx={{ ml: 'auto' }} />}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.es_titular}
                      onChange={(e) => setFormData(prev => ({ ...prev, es_titular: e.target.checked }))}
                    />
                  }
                  label="Es docente titular"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Fecha de inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}

            {/* PASO 3: CONFIRMACIÓN */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Confirma la asignación
                </Typography>

                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`
                }}>
                  {/* Docente */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Avatar src={docente.foto_url} sx={{ width: 56, height: 56 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Docente</Typography>
                      <Typography fontWeight="700" variant="h6">
                        {docente.nombres} {docente.apellidos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{docente.codigo}</Typography>
                    </Box>
                  </Box>

                  {/* Detalles de asignación */}
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Materia
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <MateriaIcon fontSize="small" color="primary" />
                        <Typography fontWeight="600">{selectedMateria?.materia_nombre}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {selectedMateria?.materia_codigo} • {selectedMateria?.grado_nombre}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Paralelo
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <ParaleloIcon fontSize="small" color="primary" />
                        <Typography fontWeight="600">
                          {selectedParalelo?.grado_nombre} - "{selectedParalelo?.nombre}"
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {selectedParalelo?.turno_nombre}
                        {selectedParalelo?.aula && ` • Aula: ${selectedParalelo.aula}`}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Periodo
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <PeriodoIcon fontSize="small" color="primary" />
                        <Typography fontWeight="600">{selectedPeriodo?.nombre}</Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Tipo</Typography>
                        <Typography fontWeight="600">
                          {formData.es_titular ? '✓ Titular' : 'Suplente'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Fecha inicio</Typography>
                        <Typography fontWeight="600">
                          {formData.fecha_inicio ? new Date(formData.fecha_inicio).toLocaleDateString('es-BO') : '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={submitting || loadingAcademicos}>
          Cancelar
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button 
            onClick={() => setActiveStep(prev => prev - 1)} 
            disabled={submitting || loadingAcademicos}
          >
            Atrás
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={() => setActiveStep(prev => prev + 1)}
            disabled={!canProceed() || loadingAcademicos} 
            sx={{ borderRadius: 2 }}
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleSubmit}
            disabled={submitting || !canProceed() || loadingAcademicos} 
            sx={{ borderRadius: 2, px: 4 }}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            {submitting ? 'Asignando...' : 'Confirmar Asignación'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AsignarMateriaDialog;