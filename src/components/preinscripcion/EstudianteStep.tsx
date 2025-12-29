// components/preinscripcion/EstudianteStep.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { PreEstudianteForm, ErroresFormulario, PreInscripcionInfo } from '@/types/preinscripcionTypes';
import { preinscripcionService } from '@/services/preinscripcionService';
import publicAcademicosService, { 
  PeriodoAcademicoPublico, 
  GradoPublico, 
  TurnoPublico 
} from '@/services/publicAcademicosService';

interface EstudianteStepProps {
  data: PreEstudianteForm;
  errors: ErroresFormulario;
  onChange: (field: string, value: any) => void;
  // 🆕 Props para actualizar IDs
  preinscripcionInfo: PreInscripcionInfo;
  onPreinscripcionInfoChange: (field: keyof PreInscripcionInfo, value: number | null) => void;
}

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const GRADOS_CURSADOS = [
  { value: 'NINGUNO', label: 'Será su primer año en la escuela' },
];

export default function EstudianteStep({ 
  data, 
  errors, 
  onChange, 
  preinscripcionInfo, 
  onPreinscripcionInfoChange 
}: EstudianteStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Estados para datos académicos
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoAcademicoPublico | null>(null);
  const [grados, setGrados] = useState<GradoPublico[]>([]);
  const [turnos, setTurnos] = useState<TurnoPublico[]>([]);
  const [loadingAcademicos, setLoadingAcademicos] = useState(true);

  // Estados para verificación de cupos
  const [verificandoCupos, setVerificandoCupos] = useState(false);
  const [cupoInfo, setCupoInfo] = useState<{
    tiene_cupos: boolean;
    cupos_disponibles: number | null;
    cupos_totales: number | null;
    mensaje?: string;
  } | null>(null);

  // 🆕 Cargar datos académicos al montar
  useEffect(() => {
    const cargarDatosAcademicos = async () => {
      setLoadingAcademicos(true);
      try {
        const [periodoRes, gradosRes, turnosRes] = await Promise.all([
          publicAcademicosService.obtenerPeriodoActivo(),
          publicAcademicosService.listarGrados(),
          publicAcademicosService.listarTurnos(),
        ]);

        const periodo = periodoRes.data.periodo;
        setPeriodoActivo(periodo);
        setGrados(gradosRes.data.grados);
        setTurnos(turnosRes.data.turnos);

        // 🆕 IMPORTANTE: Guardar periodo_academico_id automáticamente
        if (periodo) {
          onPreinscripcionInfoChange('periodo_academico_id', periodo.id);
        }
      } catch (error) {
        console.error('Error al cargar datos académicos:', error);
      } finally {
        setLoadingAcademicos(false);
      }
    };

    cargarDatosAcademicos();
  }, []);

  // 🆕 Verificar cupos cuando cambien grado o turno
  useEffect(() => {
    const verificarDisponibilidad = async () => {
      // Solo verificar si hay IDs completos
      if (!preinscripcionInfo.grado_id || !preinscripcionInfo.turno_id || !preinscripcionInfo.periodo_academico_id) {
        setCupoInfo(null);
        return;
      }

      setVerificandoCupos(true);

      try {
        const response = await preinscripcionService.verificarDisponibilidad(
          preinscripcionInfo.grado_id,
          preinscripcionInfo.turno_id,
          preinscripcionInfo.periodo_academico_id
        );

        if (response.data.cupo) {
          setCupoInfo({
            tiene_cupos: response.data.tiene_cupos,
            cupos_disponibles: response.data.cupo.cupos_disponibles,
            cupos_totales: response.data.cupo.cupos_totales,
          });
        } else {
          setCupoInfo({
            tiene_cupos: false,
            cupos_disponibles: null,
            cupos_totales: null,
            mensaje: 'No hay cupos configurados para este grado y turno',
          });
        }
      } catch (error) {
        console.error('Error al verificar cupos:', error);
        setCupoInfo({
          tiene_cupos: false,
          cupos_disponibles: null,
          cupos_totales: null,
          mensaje: 'No se pudo verificar la disponibilidad de cupos',
        });
      } finally {
        setVerificandoCupos(false);
      }
    };

    verificarDisponibilidad();
  }, [preinscripcionInfo.grado_id, preinscripcionInfo.turno_id, preinscripcionInfo.periodo_academico_id]);

  // Validaciones en tiempo real
  const handleTextInput = (field: string, value: string, pattern: RegExp) => {
    if (pattern.test(value) || value === '') {
      onChange(field, value);
    }
  };

  const handleNameInput = (field: string, value: string) => {
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    handleTextInput(field, value, namePattern);
  };

  const handlePhoneInput = (field: string, value: string) => {
    const phonePattern = /^[0-9\s\-\(\)\+]*$/;
    if (phonePattern.test(value) || value === '') {
      onChange(field, value);
    }
  };

  const handleEmailInput = (field: string, value: string) => {
    onChange(field, value.toLowerCase().trim());
  };

  const handleCIInput = (field: string, value: string) => {
    const ciPattern = /^[0-9A-Za-z]*$/;
    if ((ciPattern.test(value) && value.length <= 12) || value === '') {
      onChange(field, value.toUpperCase());
    }
  };

  const handleRUDEInput = (field: string, value: string) => {
    const rudePattern = /^[0-9]*$/;
    if ((rudePattern.test(value) && value.length <= 20) || value === '') {
      onChange(field, value);
    }
  };

  // 🆕 CRITICAL: Handler para cambio de grado (guarda texto + ID)
  const handleGradoChange = (value: string) => {
    // Guardar texto legible en el formulario
    onChange('grado_solicitado', value);

    // 🆕 Buscar y guardar el ID numérico
    const gradoSeleccionado = grados.find(g => 
      g.codigo === value || 
      g.nombre.toUpperCase().replace(/\s+/g, '_') === value
    );

    if (gradoSeleccionado) {
      onPreinscripcionInfoChange('grado_id', gradoSeleccionado.id);
      console.log('✅ Grado guardado:', { texto: value, id: gradoSeleccionado.id });
    } else {
      onPreinscripcionInfoChange('grado_id', null);
      console.warn('⚠️ No se encontró el ID del grado:', value);
    }
  };

  // 🆕 CRITICAL: Handler para cambio de turno (guarda texto + ID)
  const handleTurnoChange = (value: string) => {
    // Guardar texto legible en el formulario
    onChange('turno_solicitado', value);

    // 🆕 Buscar y guardar el ID numérico
    const turnoSeleccionado = turnos.find(t => 
      t.nombre.toUpperCase() === value
    );

    if (turnoSeleccionado) {
      onPreinscripcionInfoChange('turno_id', turnoSeleccionado.id);
      console.log('✅ Turno guardado:', { texto: value, id: turnoSeleccionado.id });
    } else {
      onPreinscripcionInfoChange('turno_id', null);
      console.warn('⚠️ No se encontró el ID del turno:', value);
    }
  };

  const fieldStyle = {
    width: '100%',
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
      fontSize: '0.95rem',
      '&.Mui-focused': {
        color: isDark ? '#facc15' : '#0288d1',
      },
    },
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      transition: '0.2s ease',
      border: '1px solid transparent',
      '&:hover': {
        borderColor: isDark ? '#facc15' : '#0288d1',
      },
      '&.Mui-focused': {
        borderColor: isDark ? '#facc15' : '#0288d1',
        boxShadow: `0 0 0 2px ${isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.25)'}`,
      },
    },
    '& .MuiInputBase-input': {
      color: isDark ? '#fff' : '#000',
    },
  };

  const sectionTitleStyle = {
    mb: 3,
    fontSize: { xs: '1.3rem', md: '1.5rem' },
    fontWeight: 700,
    background: isDark
      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  };

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      
      {/* Información Personal */}
      <Box>
        <Box sx={sectionTitleStyle}>
          <PersonIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
          Información Personal del Estudiante
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Nombres *"
              value={data.nombres}
              onChange={(e) => handleNameInput('nombres', e.target.value)}
              error={!!errors.nombres}
              helperText={errors.nombres}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Apellido Paterno *"
              value={data.apellido_paterno}
              onChange={(e) => handleNameInput('apellido_paterno', e.target.value)}
              error={!!errors.apellido_paterno}
              helperText={errors.apellido_paterno}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Apellido Materno"
              value={data.apellido_materno}
              onChange={(e) => handleNameInput('apellido_materno', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <TextField
              fullWidth
              label="Cédula de Identidad"
              value={data.ci}
              onChange={(e) => handleCIInput('ci', e.target.value)}
              inputProps={{ maxLength: 12 }}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <TextField
              fullWidth
              label="RUDE (Código Único)"
              value={data.rude}
              onChange={(e) => handleRUDEInput('rude', e.target.value)}
              inputProps={{ maxLength: 20 }}
              helperText="Registro Único de Estudiantes"
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <DatePicker
              format="DD/MM/YYYY"
              label="Fecha de Nacimiento *"
              value={data.fecha_nacimiento}
              onChange={(date) => onChange('fecha_nacimiento', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.fecha_nacimiento,
                  helperText: errors.fecha_nacimiento,
                },
              }}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <TextField
              select
              fullWidth
              label="Género *"
              value={data.genero}
              onChange={(e) => onChange('genero', e.target.value)}
              error={!!errors.genero}
              helperText={errors.genero}
              sx={fieldStyle}
            >
              {GENEROS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Lugar de Nacimiento"
              value={data.lugar_nacimiento}
              onChange={(e) => handleNameInput('lugar_nacimiento', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <TextField
              fullWidth
              label="Contacto de Emergencia (Nombre y Teléfono)"
              value={data.contacto_emergencia}
              onChange={(e) => onChange('contacto_emergencia', e.target.value)}
              placeholder="Ej: María López - 77123456"
              sx={fieldStyle}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Información Académica */}
      <Box>
        <Box sx={sectionTitleStyle}>
          <SchoolIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
          Información Académica
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Unidad Educativa de Procedencia"
              value={data.institucion_procedencia}
              onChange={(e) => onChange('institucion_procedencia', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="Último Grado Cursado"
              value={data.ultimo_grado_cursado}
              onChange={(e) => onChange('ultimo_grado_cursado', e.target.value)}
              sx={fieldStyle}
              disabled={loadingAcademicos}
            >
              {GRADOS_CURSADOS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
              {grados.map((grado) => (
                <MenuItem key={grado.id} value={grado.codigo || grado.nombre}>
                  {grado.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="Grado Solicitado *"
              value={data.grado_solicitado}
              onChange={(e) => handleGradoChange(e.target.value)} // 🆕 Usa el nuevo handler
              error={!!errors.grado_solicitado}
              helperText={errors.grado_solicitado || (loadingAcademicos ? 'Cargando grados...' : '')}
              sx={fieldStyle}
              disabled={loadingAcademicos || grados.length === 0}
            >
              {grados.map((grado) => (
                <MenuItem key={grado.id} value={grado.codigo || grado.nombre}>
                  {grado.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              select
              fullWidth
              label="¿Repite Grado?"
              value={data.repite_grado ? 'SI' : 'NO'}
              onChange={(e) => onChange('repite_grado', e.target.value === 'SI')}
              sx={fieldStyle}
            >
              <MenuItem value="NO">No</MenuItem>
              <MenuItem value="SI">Sí</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{xs:12}}>
            <Typography sx={{ mb: 2, fontWeight: 600 }}>
              Turno Solicitado *
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={data.turno_solicitado}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) handleTurnoChange(newValue); // 🆕 Usa el nuevo handler
              }}
              fullWidth
              disabled={loadingAcademicos || turnos.length === 0}
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                  },
                },
              }}
            >
              {turnos.map((turno) => (
                <ToggleButton key={turno.id} value={turno.nombre.toUpperCase()}>
                  {turno.nombre}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {errors.turno_solicitado && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.turno_solicitado}
              </Typography>
            )}
          </Grid>

          {/* 🆕 ALERTA DE DISPONIBILIDAD DE CUPOS */}
          {(data.grado_solicitado && data.turno_solicitado) && (
            <Grid size={{xs:12}}>
              {verificandoCupos ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Verificando disponibilidad de cupos...</Typography>
                </Box>
              ) : cupoInfo ? (
                cupoInfo.tiene_cupos ? (
                  <Alert 
                    severity="success" 
                    icon={<CheckCircleIcon />}
                    sx={{ 
                      borderRadius: '12px',
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Typography fontWeight={600}>
                        ✅ ¡Hay cupos disponibles!
                      </Typography>
                      <Chip 
                        label={`${cupoInfo.cupos_disponibles} de ${cupoInfo.cupos_totales} cupos disponibles`}
                        color="success"
                        size="small"
                      />
                    </Box>
                  </Alert>
                ) : cupoInfo.cupos_totales !== null ? (
                  <Alert 
                    severity="error" 
                    icon={<ErrorIcon />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <Typography fontWeight={600}>
                      ❌ No hay cupos disponibles para este grado y turno
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Todos los cupos ({cupoInfo.cupos_totales}) están ocupados. 
                      Por favor, seleccione otro turno o grado.
                    </Typography>
                  </Alert>
                ) : (
                  <Alert 
                    severity="warning" 
                    icon={<WarningIcon />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <Typography fontWeight={600}>
                      {cupoInfo.mensaje || 'Información de cupos no disponible'}
                    </Typography>
                  </Alert>
                )
              ) : null}
            </Grid>
          )}

          <Grid size={{xs:12}}>
            <Typography sx={{ mb: 2, fontWeight: 600 }}>
              ¿Tiene alguna discapacidad?
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={data.tiene_discapacidad ? 'SI' : 'NO'}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  const hasDiscapacidad = newValue === 'SI';
                  onChange('tiene_discapacidad', hasDiscapacidad);
                  if (!hasDiscapacidad) {
                    onChange('tipo_discapacidad', '');
                  }
                }
              }}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                  },
                },
              }}
            >
              <ToggleButton value="NO">No</ToggleButton>
              <ToggleButton value="SI">Sí, especificar</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {data.tiene_discapacidad && (
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Describa la discapacidad"
                value={data.tipo_discapacidad}
                onChange={(e) => onChange('tipo_discapacidad', e.target.value)}
                inputProps={{ maxLength: 500 }}
                sx={fieldStyle}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Información de Contacto */}
      <Box>
        <Box sx={sectionTitleStyle}>
          <HomeIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
          Información de Contacto
        </Box>

        <Grid container spacing={3}>
          <Grid size={{xs:12, md:8}}>
            <TextField
              fullWidth
              label="Dirección"
              value={data.direccion}
              onChange={(e) => onChange('direccion', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Zona"
              value={data.zona}
              onChange={(e) => onChange('zona', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Ciudad"
              value={data.ciudad}
              onChange={(e) => handleNameInput('ciudad', e.target.value)}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Teléfono"
              value={data.telefono}
              onChange={(e) => handlePhoneInput('telefono', e.target.value)}
              inputProps={{ maxLength: 20 }}
              sx={fieldStyle}
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              value={data.email}
              onChange={(e) => handleEmailInput('email', e.target.value)}
              type="email"
              sx={fieldStyle}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}