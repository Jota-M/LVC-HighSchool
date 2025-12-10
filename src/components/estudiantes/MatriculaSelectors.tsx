// components/estudiantes/MatriculaSelectors.tsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  FormControlLabel,
  Switch,
  Stack,
  Tooltip,
} from '@mui/material';
import { 
  School as SchoolIcon,
  Class as ClassIcon,
  EventNote as EventIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  FilterList as FilterListIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useGestionAcademica } from '@/hooks/useRegistroCompleto';
import { MatriculaCreate, Paralelo, CapacidadParalelo } from '@/types/estudianteTypes';

interface MatriculaSelectorsProps {
  value: MatriculaCreate;
  onChange: (data: Partial<MatriculaCreate>) => void;
  incluirMatricula: boolean;
  onToggleIncluir: (incluir: boolean) => void;
}

export const MatriculaSelectors: React.FC<MatriculaSelectorsProps> = ({
  value,
  onChange,
  incluirMatricula,
  onToggleIncluir,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | ''>('');

  const {
    periodos = [],
    periodoActivo,
    grados = [],
    isLoadingPeriodos,
    isLoadingGrados,
    obtenerParalelos,
    verificarCapacidad,
  } = useGestionAcademica();

  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [isLoadingParalelos, setIsLoadingParalelos] = useState(false);
  const [capacidad, setCapacidad] = useState<CapacidadParalelo | null>(null);
  const [isCheckingCapacidad, setIsCheckingCapacidad] = useState(false);

  // Auto-seleccionar periodo activo cuando los datos estén listos
  useEffect(() => {
    if (periodoActivo && !value.periodo_academico_id && periodos.length > 0) {
      const periodoExiste = periodos.some(p => p.id === periodoActivo.id);
      if (periodoExiste) {
        onChange({ periodo_academico_id: periodoActivo.id });
      }
    }
  }, [periodoActivo, periodos, value.periodo_academico_id]);

  // Cargar paralelos cuando cambia el grado
  useEffect(() => {
    const cargarParalelos = async () => {
      if (!gradoSeleccionado) {
        setParalelos([]);
        return;
      }

      setIsLoadingParalelos(true);
      try {
        const anio = periodoActivo?.anio || new Date().getFullYear();
        const data = await obtenerParalelos(gradoSeleccionado, anio);
        setParalelos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar paralelos:', error);
        setParalelos([]);
      } finally {
        setIsLoadingParalelos(false);
      }
    };

    cargarParalelos();
  }, [gradoSeleccionado, periodoActivo]);

  // Verificar capacidad cuando cambia el paralelo
  useEffect(() => {
    const checkCapacidad = async () => {
      if (!value.paralelo_id || !value.periodo_academico_id) {
        setCapacidad(null);
        return;
      }

      setIsCheckingCapacidad(true);
      try {
        const data = await verificarCapacidad(value.paralelo_id, value.periodo_academico_id);
        setCapacidad(data);
      } catch (error) {
        console.error('Error al verificar capacidad:', error);
        setCapacidad(null);
      } finally {
        setIsCheckingCapacidad(false);
      }
    };

    checkCapacidad();
  }, [value.paralelo_id, value.periodo_academico_id]);

  // Funciones helper para obtener el value seguro del select
  const getPeriodoValue = () => {
    if (!value.periodo_academico_id || periodos.length === 0) return '';
    const existe = periodos.some(p => p.id === value.periodo_academico_id);
    return existe ? value.periodo_academico_id : '';
  };

  const getGradoValue = () => {
    if (!gradoSeleccionado || grados.length === 0) return '';
    const existe = grados.some(g => g.id === gradoSeleccionado);
    return existe ? gradoSeleccionado : '';
  };

  const getParaleloValue = () => {
    if (!value.paralelo_id || paralelos.length === 0) return '';
    const existe = paralelos.some(p => p.id === value.paralelo_id);
    return existe ? value.paralelo_id : '';
  };

  return (
    <Box>
      {/* Toggle para incluir matrícula */}
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
          borderRadius: '16px',
          border: isDark ? '2px solid rgba(250, 204, 21, 0.2)' : '2px solid rgba(2, 136, 209, 0.2)',
          mb: 3,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={incluirMatricula}
              onChange={(e) => onToggleIncluir(e.target.checked)}
            />
          }
          label={
            <Typography fontWeight={700} sx={{ fontSize: '1.1rem', color: isDark ? '#facc15' : '#0288d1' }}>
              Matricular al estudiante ahora
            </Typography>
          }
        />
        <Typography variant="body2" sx={{ mt: 1, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(1,87,155,0.7)' }}>
          Si no incluyes la matrícula ahora, deberás hacerlo después desde el módulo de matrículas.
        </Typography>
      </Box>

      {incluirMatricula && (
        <>
          <Stack spacing={3}>
            {/* Periodo Académico - ESTILO PREINSCRIPCIÓN */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Periodo Académico
                </Typography>
                {isLoadingPeriodos && <CircularProgress size={16} />}
              </Stack>
              <TextField
                select
                fullWidth
                value={getPeriodoValue()}
                onChange={(e) => onChange({ periodo_academico_id: Number(e.target.value) })}
                disabled={!periodos || periodos.length === 0 || isLoadingPeriodos}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                {periodos && periodos.length > 0 ? (
                  periodos.map((periodo) => (
                    <MenuItem key={periodo.id} value={periodo.id}>
                      <Box>
                        <Typography fontWeight={600}>{periodo.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(periodo.fecha_inicio).toLocaleDateString('es-BO')} - {new Date(periodo.fecha_fin).toLocaleDateString('es-BO')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay periodos activos</MenuItem>
                )}
              </TextField>
            </Box>

            {/* Filtrar por Grado - ESTILO PREINSCRIPCIÓN */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Filtrar por Grado
                </Typography>
                {isLoadingGrados && <CircularProgress size={16} />}
              </Stack>
              <TextField
                select
                fullWidth
                value={getGradoValue()}
                onChange={(e) => {
                  const nuevoGrado = Number(e.target.value);
                  setGradoSeleccionado(nuevoGrado || '');
                  onChange({ paralelo_id: 0 });
                  setCapacidad(null);
                }}
                disabled={!grados || grados.length === 0 || isLoadingGrados}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                <MenuItem value="">Todos los grados</MenuItem>
                {grados && grados.map((grado) => (
                  <MenuItem key={grado.id} value={grado.id}>
                    {grado.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Paralelo - ESTILO PREINSCRIPCIÓN */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <GroupsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Paralelo
                </Typography>
                {isLoadingParalelos && <CircularProgress size={16} />}
              </Stack>
              <TextField
                select
                fullWidth
                value={getParaleloValue()}
                onChange={(e) => onChange({ paralelo_id: Number(e.target.value) })}
                disabled={!paralelos || paralelos.length === 0 || isLoadingParalelos}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                {paralelos && paralelos.length > 0 ? (
                  paralelos.map((paralelo) => (
                    <MenuItem key={paralelo.id} value={paralelo.id}>
                      <Box sx={{ width: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography fontWeight={600}>
                              {paralelo.grado_nombre} - Paralelo {paralelo.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {paralelo.turno_nombre}
                            </Typography>
                          </Box>
                          {paralelo.matriculas_actuales !== undefined && (
                            <Tooltip title={`${paralelo.capacidad_maxima - (paralelo.matriculas_actuales || 0)} cupos disponibles de ${paralelo.capacidad_maxima}`}>
                              <Chip
                                label={`${paralelo.matriculas_actuales || 0}/${paralelo.capacidad_maxima}`}
                                size="small"
                                color={
                                  (paralelo.matriculas_actuales || 0) >= paralelo.capacidad_maxima 
                                    ? 'error' 
                                    : (paralelo.matriculas_actuales || 0) >= paralelo.capacidad_maxima * 0.8
                                    ? 'warning'
                                    : 'success'
                                }
                                sx={{ fontWeight: 700 }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {isLoadingParalelos ? 'Cargando paralelos...' : 'No hay paralelos disponibles'}
                  </MenuItem>
                )}
              </TextField>
            </Box>

            {/* Número de matrícula */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <SchoolIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Número de Matrícula (opcional)
                </Typography>
              </Stack>
              <TextField
                fullWidth
                value={value.numero_matricula || ''}
                onChange={(e) => onChange({ numero_matricula: e.target.value })}
                placeholder="Se generará automáticamente"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              />
            </Box>
          </Stack>

          {/* Indicador de capacidad */}
          {isCheckingCapacidad && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Verificando capacidad...</Typography>
            </Box>
          )}

          {capacidad && !isCheckingCapacidad && (
            <Alert 
              severity={capacidad.disponible ? 'success' : 'error'}
              icon={capacidad.disponible ? <CheckIcon /> : <WarningIcon />}
              sx={{ mt: 3, borderRadius: '12px' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {capacidad.disponible ? '✅ Cupos disponibles' : '❌ Paralelo lleno'}
                  </Typography>
                  <Typography variant="caption">
                    Matriculados: {capacidad.matriculas_actuales} / {capacidad.capacidad_maxima}
                  </Typography>
                </Box>
              </Box>
            </Alert>
          )}

          {/* Opciones adicionales */}
          <Box sx={{ mt: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.es_repitente || false}
                  onChange={(e) => onChange({ es_repitente: e.target.checked })}
                />
              }
              label="Es repitente"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={value.es_becado || false}
                  onChange={(e) => onChange({ es_becado: e.target.checked })}
                />
              }
              label="Es becado"
            />
          </Box>

          {/* Datos de beca */}
          {value.es_becado && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Porcentaje de Beca (%)"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={value.porcentaje_beca || ''}
                  onChange={(e) => onChange({ porcentaje_beca: Number(e.target.value) || 0 })}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 3,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                />
              </Grid>
              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Tipo de Beca"
                  value={value.tipo_beca || ''}
                  onChange={(e) => onChange({ tipo_beca: e.target.value })}
                  placeholder="Ej: Excelencia, Deportiva, etc."
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 3,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Observaciones */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={value.observaciones || ''}
            onChange={(e) => onChange({ observaciones: e.target.value })}
            sx={{ 
              mt: 3,
              '& .MuiOutlinedInput-root': { 
                borderRadius: 3,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)',
              }
            }}
          />
        </>
      )}
    </Box>
  );
};

export default MatriculaSelectors;