  // components/docentes/AsignacionesDocente.tsx - VERSIÓN MEJORADA
  'use client';
  import React, { useState, useEffect } from 'react';
  import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
    Paper,
    Divider,
    Stack,
    Fade,
    Zoom,
  } from '@mui/material';
  import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Class as ClassIcon,
    Schedule as ScheduleIcon,
    Groups as GroupsIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
  } from '@mui/icons-material';
  import { useAsignacionesDocente } from '@/hooks/useAsignacionesDocente';
  import asignacionDocenteService from '@/services/asignacionDocenteService';
  import docenteService from '@/services/docenteService';
  import { toast } from 'react-hot-toast';
  import {
    CrearAsignacionDTO,
    GradoMateria,
    Paralelo,
    PeriodoAcademico,
    AsignacionDocente,
  } from '@/types/asignacionDocenteTypes';
  import { Docente } from '@/types/docenteTypes';

  export const AsignacionesDocente: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Estado para formulario de nueva asignación
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);

    // Datos para selectores
    const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
    const [gradoMaterias, setGradoMaterias] = useState<GradoMateria[]>([]);
    const [paralelos, setParalelos] = useState<Paralelo[]>([]);
    const [docentes, setDocentes] = useState<Docente[]>([]);

    // Formulario de nueva asignación
    const [nuevaAsignacion, setNuevaAsignacion] = useState<CrearAsignacionDTO>({
      docente_id: 0,
      grado_materia_id: 0,
      paralelo_id: 0,
      periodo_academico_id: 0,
      es_titular: true,
      fecha_inicio: new Date().toISOString().split('T')[0],
    });

    // Hook de asignaciones
    const {
      asignaciones,
      paginacion,
      isLoading,
      filters,
      actualizarFiltros,
      crear,
      eliminar,
      refrescar,
    } = useAsignacionesDocente({ periodo_academico_id: periodoSeleccionado || undefined });

    // =============================================
    // CARGAR DATOS INICIALES
    // =============================================
    useEffect(() => {
      cargarDatosIniciales();
    }, []);

    useEffect(() => {
      if (periodoSeleccionado) {
        actualizarFiltros({ periodo_academico_id: periodoSeleccionado, page: 1 });
      }
    }, [periodoSeleccionado]);

    const cargarDatosIniciales = async () => {
      setIsLoadingData(true);
      try {
        const [periodosData, gradoMateriasData, docentesData] = await Promise.all([
          asignacionDocenteService.datosAcademicos.obtenerPeriodos(true),
          asignacionDocenteService.datosAcademicos.obtenerGradoMaterias(),
          docenteService.listar({ activo: true, limit: 1000 }),
        ]);

        setPeriodos(periodosData);
        setGradoMaterias(gradoMateriasData);
        setDocentes(docentesData.data.docentes);

        // Seleccionar periodo activo por defecto
        const periodoActivo = periodosData.find(p => p.activo);
        if (periodoActivo) {
          setPeriodoSeleccionado(periodoActivo.id);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos iniciales');
      } finally {
        setIsLoadingData(false);
      }
    };

    const cargarParalelos = async (gradoId: number) => {
      try {
        const paralelosData = await asignacionDocenteService.datosAcademicos.obtenerParalelosPorGrado(gradoId);
        setParalelos(paralelosData);
      } catch (error) {
        console.error('Error al cargar paralelos:', error);
        toast.error('Error al cargar paralelos');
      }
    };

    // =============================================
    // MANEJADORES
    // =============================================
    const handleOpenDialog = () => {
      if (!periodoSeleccionado) {
        toast.error('Selecciona un periodo académico primero');
        return;
      }
      setNuevaAsignacion({
        docente_id: 0,
        grado_materia_id: 0,
        paralelo_id: 0,
        periodo_academico_id: periodoSeleccionado,
        es_titular: true,
        fecha_inicio: new Date().toISOString().split('T')[0],
      });
      setDialogOpen(true);
    };

    const handleCloseDialog = () => {
      setDialogOpen(false);
      setNuevaAsignacion({
        docente_id: 0,
        grado_materia_id: 0,
        paralelo_id: 0,
        periodo_academico_id: periodoSeleccionado || 0,
        es_titular: true,
        fecha_inicio: new Date().toISOString().split('T')[0],
      });
    };

    const handleInputChange = (field: keyof CrearAsignacionDTO, value: any) => {
      setNuevaAsignacion(prev => ({ ...prev, [field]: value }));

      // Si cambió el grado-materia, cargar paralelos
      if (field === 'grado_materia_id' && value) {
        const gradoMateria = gradoMaterias.find(gm => gm.id === value);
        if (gradoMateria) {
          cargarParalelos(gradoMateria.grado_id);
        }
      }
    };

    const handleCrearAsignacion = async () => {
      // Validaciones
      if (!nuevaAsignacion.docente_id) {
        toast.error('Selecciona un docente');
        return;
      }
      if (!nuevaAsignacion.grado_materia_id) {
        toast.error('Selecciona una materia');
        return;
      }
      if (!nuevaAsignacion.paralelo_id) {
        toast.error('Selecciona un paralelo');
        return;
      }

      const success = await crear(nuevaAsignacion);
      if (success) {
        handleCloseDialog();
      }
    };

    const handleEliminarAsignacion = async (id: number) => {
      if (window.confirm('¿Estás seguro de eliminar esta asignación?')) {
        await eliminar(id);
      }
    };

    // =============================================
    // RENDER
    // =============================================
    return (
      <Box>
        {/* Header con filtros y acciones */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '20px',
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#facc15', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
              : `linear-gradient(135deg, ${alpha('#0288d1', 0.1)} 0%, ${alpha('#01579b', 0.05)} 100%)`,
            border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filtros
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                select
                label="Periodo Académico"
                value={periodoSeleccionado || ''}
                onChange={(e) => setPeriodoSeleccionado(parseInt(e.target.value))}
                sx={{ 
                  minWidth: 280,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
                disabled={isLoadingData}
                size="small"
              >
                {periodos.map((periodo) => (
                  <MenuItem key={periodo.id} value={periodo.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {periodo.nombre} - {periodo.anio}
                      {periodo.activo && (
                        <Chip 
                          label="Activo" 
                          size="small" 
                          color="success"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                disabled={!periodoSeleccionado}
                size="large"
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.4)}`,
                  },
                }}
              >
                Nueva Asignación
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Lista de asignaciones */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : asignaciones.length === 0 ? (
          <Fade in={true}>
            <Paper
              elevation={0}
              sx={{
                p: 8,
                borderRadius: '20px',
                textAlign: 'center',
                background: isDark
                  ? alpha(theme.palette.background.paper, 0.5)
                  : alpha(theme.palette.background.paper, 0.8),
                border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
              }}
            >
              <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                No hay asignaciones
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {periodoSeleccionado 
                  ? 'No se encontraron asignaciones para el periodo seleccionado.'
                  : 'Selecciona un periodo académico para ver las asignaciones.'}
              </Typography>
              {periodoSeleccionado && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  sx={{
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Crear Primera Asignación
                </Button>
              )}
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {asignaciones.map((asignacion, index) => (
              <Grid size={{xs:12,md:6,lg:4}} key={asignacion.id}>
                <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                  <Card
                    sx={{
                      borderRadius: '20px',
                      background: isDark
                        ? `linear-gradient(135deg, ${alpha(asignacion.materia_color || '#0288d1', 0.15)} 0%, ${alpha(asignacion.materia_color || '#0288d1', 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(asignacion.materia_color || '#0288d1', 0.1)} 0%, ${alpha(asignacion.materia_color || '#0288d1', 0.05)} 100%)`,
                      border: `2px solid ${alpha(asignacion.materia_color || '#0288d1', 0.3)}`,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 32px ${alpha(asignacion.materia_color || '#0288d1', 0.4)}`,
                        borderColor: alpha(asignacion.materia_color || '#0288d1', 0.6),
                      },
                    }}
                  >
                    {/* Icono de fondo decorativo */}
                    <Box
                      sx={{
                        position: 'absolute',
                        right: -20,
                        top: -20,
                        opacity: 0.08,
                        transform: 'rotate(-15deg)',
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 150 }} />
                    </Box>

                    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                      {/* Header con materia y acción de eliminar */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: asignacion.materia_color || '#0288d1',
                            width: 56,
                            height: 56,
                            boxShadow: `0 4px 12px ${alpha(asignacion.materia_color || '#0288d1', 0.4)}`,
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                            {asignacion.materia_nombre}
                          </Typography>
                          <Chip
                            label={asignacion.materia_codigo}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: alpha(asignacion.materia_color || '#0288d1', 0.2),
                              color: asignacion.materia_color || '#0288d1',
                            }}
                          />
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleEliminarAsignacion(asignacion.id)}
                          sx={{
                            color: '#ef4444',
                            backgroundColor: alpha('#ef4444', 0.1),
                            '&:hover': {
                              backgroundColor: alpha('#ef4444', 0.2),
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Divider sx={{ my: 2, opacity: 0.1 }} />

                      {/* Información del docente */}
                      <Stack spacing={2}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: alpha('#10b981', 0.15),
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 18, color: '#10b981' }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {asignacion.docente_nombres} {asignacion.docente_apellidos}
                            </Typography>
                          </Box>
                          {asignacion.es_titular && (
                            <Chip
                              label="Docente Titular"
                              icon={<CheckIcon sx={{ fontSize: 16 }} />}
                              size="small"
                              sx={{
                                ml: 5,
                                height: 24,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: alpha('#10b981', 0.15),
                                color: '#10b981',
                                border: `1px solid ${alpha('#10b981', 0.3)}`,
                              }}
                            />
                          )}
                        </Box>

                        {/* Grado y paralelo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: alpha('#3b82f6', 0.15),
                            }}
                          >
                            <ClassIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {asignacion.nivel_nombre} - {asignacion.grado_nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Paralelo {asignacion.paralelo_nombre} • {asignacion.turno_nombre}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Información adicional */}
                        <Box sx={{ display: 'flex', gap: 3, pt: 1 }}>
                          {asignacion.horas_semanales && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {asignacion.horas_semanales}h/sem
                              </Typography>
                            </Box>
                          )}
                          
                          {asignacion.total_estudiantes !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GroupsIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {asignacion.total_estudiantes} estudiantes
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Paginación mejorada */}
        {paginacion.totalPages > 1 && (
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mt: 4,
              p: 2,
              borderRadius: '16px',
              background: isDark
                ? alpha(theme.palette.background.paper, 0.5)
                : alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Button
              disabled={paginacion.page === 1}
              onClick={() => actualizarFiltros({ page: paginacion.page - 1 })}
              startIcon={<PrevIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Anterior
            </Button>
            
            <Box sx={{ 
              px: 3, 
              py: 1, 
              borderRadius: '10px',
              backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.1),
              border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
            }}>
              <Typography sx={{ fontWeight: 700 }}>
                Página {paginacion.page} de {paginacion.totalPages}
              </Typography>
            </Box>
            
            <Button
              disabled={paginacion.page === paginacion.totalPages}
              onClick={() => actualizarFiltros({ page: paginacion.page + 1 })}
              endIcon={<NextIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Siguiente
            </Button>
          </Paper>
        )}

        {/* Dialog mejorado para nueva asignación */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: isDark
                ? alpha('#0f172a', 0.98)
                : alpha('#ffffff', 0.98),
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: isDark ? '#facc15' : '#0288d1',
                  color: isDark ? '#000' : '#fff',
                }}
              >
                <AddIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Nueva Asignación
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                select
                required
                label="Docente"
                value={nuevaAsignacion.docente_id}
                onChange={(e) => handleInputChange('docente_id', parseInt(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              >
                <MenuItem value={0} disabled>
                  <em>Selecciona un docente</em>
                </MenuItem>
                {docentes.map((docente) => (
                  <MenuItem key={docente.id} value={docente.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {docente.nombres} {docente.apellidos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {docente.codigo}
                        {docente.especialidad && ` • ${docente.especialidad}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                required
                label="Materia y Grado"
                value={nuevaAsignacion.grado_materia_id}
                onChange={(e) => handleInputChange('grado_materia_id', parseInt(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              >
                <MenuItem value={0} disabled>
                  <em>Selecciona una materia</em>
                </MenuItem>
                {gradoMaterias.map((gm) => (
                  <MenuItem key={gm.id} value={gm.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {gm.materia_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {gm.nivel_nombre} - {gm.grado_nombre}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                required
                label="Paralelo"
                value={nuevaAsignacion.paralelo_id}
                onChange={(e) => handleInputChange('paralelo_id', parseInt(e.target.value))}
                disabled={!nuevaAsignacion.grado_materia_id || paralelos.length === 0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              >
                <MenuItem value={0} disabled>
                  <em>Selecciona un paralelo</em>
                </MenuItem>
                {paralelos.map((paralelo) => (
                  <MenuItem key={paralelo.id} value={paralelo.id}>
                    Paralelo {paralelo.nombre} - {paralelo.turno_nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                type="date"
                label="Fecha de Inicio"
                value={nuevaAsignacion.fecha_inicio}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />

              <Paper
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: alpha(isDark ? '#facc15' : '#0288d1', 0.05),
                  border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      ¿Es docente titular?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      El docente titular es el responsable principal
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={nuevaAsignacion.es_titular ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleInputChange('es_titular', true)}
                      sx={{
                        borderRadius: '8px',
                        minWidth: 60,
                        ...(nuevaAsignacion.es_titular && {
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }),
                      }}
                    >
                      Sí
                    </Button>
                    <Button
                      variant={!nuevaAsignacion.es_titular ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleInputChange('es_titular', false)}
                      sx={{
                        borderRadius: '8px',
                        minWidth: 60,
                        ...(!nuevaAsignacion.es_titular && {
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        }),
                      }}
                    >
                      No
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: '12px',
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCrearAsignacion}
              variant="contained"
              sx={{
                borderRadius: '12px',
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
              }}
            >
              Crear Asignación
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  export default AsignacionesDocente;