// app/dashboard/migracion-mensualidades/page.tsx
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Autocomplete,
  CircularProgress,
  Fade,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  HistoryEdu,
  School,
  Person,
  Search,
  FilterAlt,
  Refresh,
  Calculate,
  AutoAwesome,
  CloudUpload,
  WarningAmber
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAcademicos } from '@/hooks/useAcademicos';
import { useEstudiantes } from '@/hooks/useEstudiantes';
import migracionPagosService, {
  EstudianteMatrizItem,
  CursoInfoMatriz
} from '@/services/migracionPagosService';
import { PlanillaCursoMatriz } from '@/components/migracion/PlanillaCursoMatriz';
import { FichaEstudianteIndividual } from '@/components/migracion/FichaEstudianteIndividual';
import { TabMensualidadesObservadas } from '@/components/migracion/TabMensualidadesObservadas';

export const MigracionMensualidadesPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();

  const [modoVista, setModoVista] = useState<'curso' | 'estudiante' | 'observadas'>('curso');

  // Filtros académicos
  const {
    periodos,
    periodoActivo,
    niveles,
    grados,
    paralelos,
    loading: loadingAcademicos,
    cargarGrados,
    cargarParalelos
  } = useAcademicos({
    autoLoad: true,
    loadPeriodos: true,
    loadNiveles: true,
    loadGrados: true,
    loadParalelos: true
  });

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | ''>('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | ''>('');
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | ''>('');
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState<number | ''>('');

  // Estados de datos de la matriz
  const [cursoInfo, setCursoInfo] = useState<CursoInfoMatriz | null>(null);
  const [estudiantesCurso, setEstudiantesCurso] = useState<EstudianteMatrizItem[]>([]);
  const [loadingMatriz, setLoadingMatriz] = useState(false);

  // Búsqueda de estudiante individual
  const [buscarEstudianteInput, setBuscarEstudianteInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(buscarEstudianteInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [buscarEstudianteInput]);

  const { estudiantes: estudiantesList, isLoading: loadingBusquedaEstudiantes } = useEstudiantes({
    search: debouncedSearch,
    limit: 25,
    activo: true
  });
  const [estudianteSeleccionadoItem, setEstudianteSeleccionadoItem] = useState<any | null>(null);
  const [estudianteIndividualData, setEstudianteIndividualData] = useState<EstudianteMatrizItem | null>(null);
  const [loadingIndividual, setLoadingIndividual] = useState(false);

  // Obtener año de la gestión seleccionada
  const anioGestion = useMemo(() => {
    const periodo = periodos.find(p => p.id === Number(periodoSeleccionado));
    if (periodo?.fecha_inicio) return new Date(periodo.fecha_inicio).getFullYear();
    if (periodoActivo?.fecha_inicio) return new Date(periodoActivo.fecha_inicio).getFullYear();
    return new Date().getFullYear();
  }, [periodos, periodoSeleccionado, periodoActivo]);

  // Paralelos filtrados estrictamente por la gestión actual
  const paralelosFiltrados = useMemo(() => {
    return paralelos.filter(p => {
      // Filtrar por grado si está seleccionado
      if (gradoSeleccionado && p.grado_id && p.grado_id !== Number(gradoSeleccionado)) {
        return false;
      }
      // Filtrar estrictamente por año de la gestión
      if (p.anio && Number(p.anio) !== Number(anioGestion)) {
        return false;
      }
      return true;
    });
  }, [paralelos, gradoSeleccionado, anioGestion]);

  // Auto-seleccionar período activo al cargar
  useEffect(() => {
    if (periodoActivo && !periodoSeleccionado) {
      setPeriodoSeleccionado(periodoActivo.id);
    }
  }, [periodoActivo, periodoSeleccionado]);

  // Cargar grados al cambiar nivel
  useEffect(() => {
    if (nivelSeleccionado) {
      cargarGrados(Number(nivelSeleccionado));
      setGradoSeleccionado('');
      setParaleloSeleccionado('');
    }
  }, [nivelSeleccionado, cargarGrados]);

  // Cargar paralelos al cambiar grado o gestión (solo de esta gestión)
  useEffect(() => {
    if (gradoSeleccionado) {
      cargarParalelos({
        grado_id: Number(gradoSeleccionado),
        anio: anioGestion
      });
      setParaleloSeleccionado('');
    }
  }, [gradoSeleccionado, anioGestion, cargarParalelos]);

  // Cargar matriz del curso
  const cargarMatriz = useCallback(async () => {
    if (!paraleloSeleccionado) return;

    setLoadingMatriz(true);
    try {
      const res = await migracionPagosService.getMatrizCurso(
        Number(paraleloSeleccionado),
        periodoSeleccionado ? Number(periodoSeleccionado) : undefined
      );

      if (res.success && res.data) {
        setCursoInfo(res.data.curso);
        setEstudiantesCurso(res.data.estudiantes);
      }
    } catch (err: any) {
      console.error('Error al cargar matriz de curso:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al cargar la matriz del curso', { variant: 'error' });
    } finally {
      setLoadingMatriz(false);
    }
  }, [paraleloSeleccionado, periodoSeleccionado, enqueueSnackbar]);

  // Auto-cargar cuando se selecciona un paralelo
  useEffect(() => {
    if (paraleloSeleccionado) {
      cargarMatriz();
    } else {
      setCursoInfo(null);
      setEstudiantesCurso([]);
    }
  }, [paraleloSeleccionado, cargarMatriz]);

  // Cargar estudiante individual
  const cargarEstudianteIndividual = useCallback(async (estudianteId: number) => {
    setLoadingIndividual(true);
    try {
      // Si el estudiante ya está en la matriz cargada, usar sus datos
      const enMatriz = estudiantesCurso.find(e => e.estudiante_id === estudianteId);
      if (enMatriz) {
        setEstudianteIndividualData(enMatriz);
      } else {
        // Consultar por endpoint
        const res = await migracionPagosService.getEstudianteHistorial(
          estudianteId,
          periodoSeleccionado ? Number(periodoSeleccionado) : undefined
        );

        if (res.success && res.data) {
          const { estudiante, mensualidades } = res.data;
          // Formatear al tipo EstudianteMatrizItem
          const cuotas = [];
          for (let i = 1; i <= 10; i++) {
            const m = mensualidades.find((x: any) => x.numero_cuota === i);
            cuotas.push({
              numero_cuota: i,
              mes: m ? m.mes_correspondiente : `Cuota ${i}`,
              mensualidad_id: m ? m.id : null,
              monto_original: m ? Number(m.monto_original) : Number(estudiante.monto_base_cuota || 330),
              monto_beca: m ? Number(m.monto_beca) : 0,
              monto_recargo: m ? Number(m.monto_recargo) : 0,
              monto_final: m ? Number(m.monto_final) : Number(estudiante.monto_base_cuota || 330),
              estado: m ? m.estado : 'no_generado',
              observaciones: m ? m.observaciones : null,
              fecha_vencimiento: m ? m.fecha_vencimiento : null,
              pagos: m?.pagos || []
            });
          }

          setEstudianteIndividualData({
            ...estudiante,
            cuotas
          });
        }
      }
    } catch (err: any) {
      console.error('Error al cargar estudiante individual:', err);
      enqueueSnackbar(err.response?.data?.message || 'Error al cargar los datos del estudiante', { variant: 'error' });
    } finally {
      setLoadingIndividual(false);
    }
  }, [estudiantesCurso, periodoSeleccionado, enqueueSnackbar]);

  // Actualizar estudiante individual cuando se selecciona en autocomplete
  useEffect(() => {
    if (estudianteSeleccionadoItem) {
      cargarEstudianteIndividual(estudianteSeleccionadoItem.id);
    } else {
      setEstudianteIndividualData(null);
    }
  }, [estudianteSeleccionadoItem, cargarEstudianteIndividual]);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            {/* Título Principal */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 3
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    p: 1.25,
                    borderRadius: '16px',
                    bgcolor: isDark ? alpha('#f59e0b', 0.2) : alpha('#d97706', 0.1),
                    color: isDark ? '#fbbf24' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HistoryEdu sx={{ fontSize: 36 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{
                      background: isDark
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Migración y Carga Histórica de Mensualidades
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      Registra, regulariza y edita pagos pasados (facturas, recibos, becas e ingresos especiales) con total libertad.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Selector de Modo */}
              <Tabs
                value={modoVista}
                onChange={(_, v) => setModoVista(v)}
                sx={{
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                  p: 0.5,
                  borderRadius: '14px',
                  '& .MuiTab-root': {
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    minHeight: 40,
                    px: 2.5
                  },
                  '& .Mui-selected': {
                    bgcolor: isDark ? '#f59e0b' : '#d97706',
                    color: '#000 !important'
                  },
                  '& .MuiTabs-indicator': { display: 'none' }
                }}
              >
                <Tab value="curso" icon={<School fontSize="small" />} iconPosition="start" label="Por Curso Completo" />
                <Tab value="estudiante" icon={<Person fontSize="small" />} iconPosition="start" label="Por Estudiante Individual" />
                <Tab value="observadas" icon={<WarningAmber fontSize="small" />} iconPosition="start" label="Mensualidades Observadas" />
              </Tabs>
            </Box>

            {/* Barra de Filtros / Selección (solo en vistas por curso o estudiante) */}
            {modoVista !== 'observadas' && (
            <Card sx={{
              borderRadius: '20px',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              p: 2.5,
              mb: 3
            }}>
              {modoVista === 'curso' ? (
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Período Académico"
                      value={periodoSeleccionado}
                      onChange={(e) => setPeriodoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
                    >
                      {periodos.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.nombre} {p.activo ? '⭐ (Activo)' : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Nivel Académico"
                      value={nivelSeleccionado}
                      onChange={(e) => setNivelSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
                    >
                      <MenuItem value="">-- Seleccionar Nivel --</MenuItem>
                      {niveles.map(n => (
                        <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Grado"
                      value={gradoSeleccionado}
                      onChange={(e) => setGradoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={!nivelSeleccionado}
                    >
                      <MenuItem value="">-- Seleccionar Grado --</MenuItem>
                      {grados.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Paralelo / Curso"
                      value={paraleloSeleccionado}
                      onChange={(e) => setParaleloSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={!gradoSeleccionado}
                      helperText={gradoSeleccionado && paralelosFiltrados.length === 0 ? `No hay paralelos para la gestión ${anioGestion}` : ''}
                    >
                      <MenuItem value="">-- Seleccionar Paralelo --</MenuItem>
                      {paralelosFiltrados.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.nombre} {p.turno_nombre ? `(${p.turno_nombre})` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              ) : (
                /* Modo Estudiante Individual: Buscador Universal */
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Período Académico"
                      value={periodoSeleccionado}
                      onChange={(e) => setPeriodoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
                    >
                      {periodos.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.nombre} {p.activo ? '⭐ (Activo)' : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 8 }}>
                    <Autocomplete
                      options={estudiantesList || []}
                      filterOptions={(options) => options}
                      isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                      getOptionLabel={(option: any) => {
                        if (!option || typeof option !== 'object') return '';
                        const pat = option.apellido_paterno || '';
                        const mat = option.apellido_materno ? ` ${option.apellido_materno}` : '';
                        const nom = option.nombres || '';
                        const ci = option.ci ? ` (CI: ${option.ci})` : '';
                        const cod = option.codigo ? ` - Cod: ${option.codigo}` : '';
                        return `${pat}${mat} ${nom}${ci}${cod}`.trim();
                      }}
                      loading={loadingBusquedaEstudiantes}
                      value={estudianteSeleccionadoItem}
                      onChange={(_, newValue) => setEstudianteSeleccionadoItem(newValue)}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === 'input') {
                          setBuscarEstudianteInput(newInputValue);
                        } else if (reason === 'clear') {
                          setBuscarEstudianteInput('');
                        }
                      }}
                      noOptionsText={loadingBusquedaEstudiantes ? 'Buscando estudiantes...' : 'No se encontraron estudiantes'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Buscar estudiante por Nombre, Apellidos, CI o Código..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                            endAdornment: (
                              <>
                                {loadingBusquedaEstudiantes ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}
            </Card>
            )}

            {/* Contenido Principal */}
            {modoVista === 'curso' ? (
              paraleloSeleccionado && cursoInfo ? (
                <PlanillaCursoMatriz
                  curso={cursoInfo}
                  estudiantes={estudiantesCurso}
                  loading={loadingMatriz}
                  onRefresh={cargarMatriz}
                />
              ) : (
                <Box sx={{
                  p: 8,
                  textAlign: 'center',
                  borderRadius: '20px',
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  border: '2px dashed',
                  borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)
                }}>
                  <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} color="text.secondary">
                    Selecciona un Curso y Paralelo para visualizar la planilla
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 450, mx: 'auto', mt: 1 }}>
                    Podrás cargar las mensualidades pagadas, registrar facturas, recibos o ambos, asignar becas y regularizar todas las cuotas históricas.
                  </Typography>
                </Box>
              )
            ) : modoVista === 'estudiante' ? (
              /* Vista Estudiante Individual */
              estudianteIndividualData ? (
                <FichaEstudianteIndividual
                  estudiante={estudianteIndividualData}
                  montoBaseDefault={Number(estudianteIndividualData.monto_base_cuota || 330)}
                  onRefresh={() => {
                    if (estudianteSeleccionadoItem) {
                      cargarEstudianteIndividual(estudianteSeleccionadoItem.id);
                    }
                  }}
                />
              ) : (
                <Box sx={{
                  p: 8,
                  textAlign: 'center',
                  borderRadius: '20px',
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  border: '2px dashed',
                  borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)
                }}>
                  <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} color="text.secondary">
                    Busca un estudiante para abrir su ficha histórica individual
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 450, mx: 'auto', mt: 1 }}>
                    Visualiza sus 10 cuotas en orden cronológico, edita facturas, números de recibos y métodos de pago de forma ágil.
                  </Typography>
                </Box>
              )
            ) : (
              /* Vista Observadas y Pendientes */
              <TabMensualidadesObservadas
                periodoSeleccionado={periodoSeleccionado}
                niveles={niveles}
                grados={grados}
                paralelos={paralelosFiltrados}
                onIrAFichaEstudiante={(estudianteId) => {
                  setModoVista('estudiante');
                  const est = estudiantesList.find(e => e.id === estudianteId);
                  if (est) setEstudianteSeleccionadoItem(est);
                  cargarEstudianteIndividual(estudianteId);
                }}
              />
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default MigracionMensualidadesPage;
