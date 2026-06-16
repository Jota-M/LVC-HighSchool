// components/matriculacion/DatosMatriculaStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { School as SchoolIcon, Warning as WarningIcon } from '@mui/icons-material';
import { PeriodoAcademico, Paralelo } from '@/types/estudianteTypes';

interface DatosMatriculaStepProps {
  formData: {
    periodo_academico_id: number | null;
    paralelo_id: number | null;
    es_repitente: boolean;
    es_becado: boolean;
    porcentaje_beca: number | null;
    tipo_beca: string;
    observaciones: string;
  };
  periodos: PeriodoAcademico[];
  paralelosDisponibles: Paralelo[];
  isLoadingParalelos: boolean;
  disponibilidad: any;
  puedeMatricular: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

export const DatosMatriculaStep: React.FC<DatosMatriculaStepProps> = ({
  formData,
  periodos,
  paralelosDisponibles,
  isLoadingParalelos,
  disponibilidad,
  puedeMatricular,
  errors,
  onChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fieldStyle = {
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
      '&.Mui-focused': {
        color: isDark ? '#facc15' : '#0288d1',
      },
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      transition: '0.2s ease',
      '&:hover fieldset': {
        borderColor: isDark ? '#facc15' : '#0288d1',
      },
      '&.Mui-focused fieldset': {
        borderColor: isDark ? '#facc15' : '#0288d1',
        boxShadow: `0 0 0 2px ${isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.25)'
          }`,
      },
    },
    '& .MuiInputBase-input': {
      color: isDark ? '#fff' : '#000',
    },
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? 'rgba(250, 204, 21, 0.08)'
            : 'rgba(2, 136, 209, 0.08)',
        }}
      >
        <SchoolIcon
          sx={{
            fontSize: 38,
            color: isDark ? '#facc15' : '#0288d1',
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
        />
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Datos de Matrícula
        </Typography>
      </Box>

      {/* Info de paralelos cargados */}
      {isLoadingParalelos && (
        <Alert
          severity="info"
          icon={<CircularProgress size={20} />}
          sx={{ mb: 3, borderRadius: '12px' }}
        >
          Cargando paralelos disponibles...
        </Alert>
      )}


      {!isLoadingParalelos && paralelosDisponibles.length > 0 && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '2px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <Typography fontWeight={600}>
            {paralelosDisponibles.length} paralelo(s) disponible(s) para el año académico
          </Typography>
        </Alert>
      )}

      {!isLoadingParalelos && paralelosDisponibles.length === 0 && formData.periodo_academico_id && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '2px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <Typography fontWeight={600}>
            No hay paralelos disponibles para el periodo seleccionado
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Periodo Académico */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={!!errors.periodo_academico_id} sx={fieldStyle}>
            <InputLabel>Periodo Académico *</InputLabel>
            <Select
              value={formData.periodo_academico_id || ''}
              onChange={(e) => onChange('periodo_academico_id', e.target.value)}
              label="Periodo Académico *"
            >
              {periodos.map((periodo) => (
                <MenuItem key={periodo.id} value={periodo.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {periodo.nombre}
                    {periodo.activo && (
                      <Chip
                        label="ACTIVO"
                        size="small"
                        color="success"
                        sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.periodo_academico_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.periodo_academico_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Paralelo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl
            fullWidth
            error={!!errors.paralelo_id}
            disabled={!formData.periodo_academico_id || isLoadingParalelos}
            sx={fieldStyle}
          >
            <InputLabel>Paralelo *</InputLabel>
            <Select
              value={formData.paralelo_id || ''}
              onChange={(e) => onChange('paralelo_id', e.target.value)}
              label="Paralelo *"
            >
              {paralelosDisponibles.map((paralelo) => (
                <MenuItem key={paralelo.id} value={paralelo.id}>
                  {paralelo.grado_nombre} - {paralelo.nombre} ({paralelo.turno_nombre})
                </MenuItem>
              ))}
            </Select>
            {errors.paralelo_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.paralelo_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Disponibilidad del paralelo */}
        {disponibilidad && (
          <Grid size={{ xs: 12 }}>
            <Alert
              severity={puedeMatricular ? 'success' : 'error'}
              sx={{
                borderRadius: '12px',
                border: '2px solid',
                borderColor: puedeMatricular
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                Capacidad del Paralelo
              </Typography>
              <Typography variant="body2">
                <strong>Ocupados:</strong> {disponibilidad.capacidad.ocupada} /{' '}
                {disponibilidad.capacidad.maxima} estudiantes
              </Typography>
              <Typography variant="body2">
                <strong>Disponibles:</strong> {disponibilidad.capacidad.disponible} cupos
              </Typography>
              <Typography variant="body2">
                <strong>Ocupación:</strong> {disponibilidad.capacidad.porcentaje_ocupacion}%
              </Typography>
              {!puedeMatricular && (
                <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 600 }}>
                  ⚠️ No hay cupos disponibles en este paralelo
                </Typography>
              )}
            </Alert>
          </Grid>
        )}

        {/* Switches de repitente y becado */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '2px solid',
              borderColor: isDark
                ? 'rgba(250, 204, 21, 0.2)'
                : 'rgba(2, 136, 209, 0.2)',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_repitente}
                  onChange={(e) => onChange('es_repitente', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: isDark ? '#facc15' : '#0288d1',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: isDark ? '#facc15' : '#0288d1',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" fontWeight={600}>
                  Estudiante Repitente
                </Typography>
              }
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '2px solid',
              borderColor: isDark
                ? 'rgba(250, 204, 21, 0.2)'
                : 'rgba(2, 136, 209, 0.2)',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_becado}
                  onChange={(e) => onChange('es_becado', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: isDark ? '#facc15' : '#0288d1',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: isDark ? '#facc15' : '#0288d1',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" fontWeight={600}>
                  Estudiante Becado
                </Typography>
              }
            />
          </Box>
        </Grid>

        {/* Campos de beca (condicionales) */}
        {formData.es_becado && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Porcentaje de Beca (%)"
                value={formData.porcentaje_beca || ''}
                onChange={(e) => onChange('porcentaje_beca', Number(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
                sx={fieldStyle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tipo de Beca"
                value={formData.tipo_beca}
                onChange={(e) => onChange('tipo_beca', e.target.value)}
                placeholder="Ej: Académica, Deportiva, Social..."
                sx={fieldStyle}
              />
            </Grid>
          </>
        )}

        {/* Observaciones */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => onChange('observaciones', e.target.value)}
            placeholder="Ingresa cualquier observación adicional sobre la matrícula..."
            sx={fieldStyle}
          />
        </Grid>
      </Grid>
    </Box>
  );
};