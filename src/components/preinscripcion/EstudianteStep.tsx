// components/preinscripcion/EstudianteStep.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AccessibleIcon from '@mui/icons-material/Accessible';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { PreEstudianteForm } from '@/types/preinscripcionTypes';
import publicAcademicosService, {
  PeriodoAcademicoPublico,
  GradoPublico,
  TurnoPublico,
} from '@/services/publicAcademicosService';
import api from '@/lib/api';

interface EstudianteStepProps {
  estudiantes: PreEstudianteForm[];
  errors: Record<string, string>;
  onChange: (index: number, field: string, value: any) => void;
  onAddEstudiante: () => void;
  onRemoveEstudiante: (index: number) => void;
}

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
];

export default function EstudianteStep({
  estudiantes,
  errors,
  onChange,
  onAddEstudiante,
  onRemoveEstudiante,
}: EstudianteStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  // Datos académicos públicos
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoAcademicoPublico | null>(null);
  const [grados, setGrados] = useState<GradoPublico[]>([]);
  const [turnos, setTurnos] = useState<TurnoPublico[]>([]);
  const [loadingAcademicos, setLoadingAcademicos] = useState(true);

  // Estado de cupos por estudiante: index -> info
  const [cuposState, setCuposState] = useState<
    Record<
      number,
      {
        cargando: boolean;
        disponible: boolean | null;
        libres: number | null;
        posicion_espera: number | null;
        turno_alternativo?: {
          turno_id: number;
          turno_nombre: string;
          cupos_disponibles: number;
        } | null;
        mensaje: string | null;
      }
    >
  >({});

  // Cargar datos académicos al montar
  useEffect(() => {
    let montado = true;
    const cargarAcademicos = async () => {
      try {
        setLoadingAcademicos(true);
        const [resPeriodo, resGrados, resTurnos] = await Promise.all([
          publicAcademicosService.obtenerPeriodoActivo(),
          publicAcademicosService.listarGrados(),
          publicAcademicosService.listarTurnos(),
        ]);

        if (montado) {
          const periodo = resPeriodo.data?.periodo || null;
          const listaGrados = resGrados.data?.grados || [];
          const listaTurnos = resTurnos.data?.turnos || [];

          setPeriodoActivo(periodo);
          setGrados(listaGrados);
          setTurnos(listaTurnos);

          // Inicializar periodo en estudiantes si no está seteado
          if (periodo?.id) {
            estudiantes.forEach((est, idx) => {
              if (!est.periodo_academico_id) {
                onChange(idx, 'periodo_academico_id', periodo.id);
              }
            });
          }
        }
      } catch (err) {
        console.error('Error al cargar datos académicos públicos:', err);
      } finally {
        if (montado) setLoadingAcademicos(false);
      }
    };

    cargarAcademicos();
    return () => {
      montado = false;
    };
  }, []);

  // Verificar cupos cuando se elija grado y turno
  const verificarCuposEstudiante = useCallback(
    async (index: number, gradoId: number, turnoId: number, periodoId?: number | null) => {
      const pId = periodoId || periodoActivo?.id;
      if (!gradoId || !turnoId || !pId) return;

      setCuposState((prev) => ({
        ...prev,
        [index]: {
          cargando: true,
          disponible: null,
          libres: null,
          posicion_espera: null,
          turno_alternativo: null,
          mensaje: null,
        },
      }));

      try {
        const res = await api.get('/cupos/disponibilidad', {
          params: { grado_id: gradoId, turno_id: turnoId, periodo_academico_id: pId },
        });

        const data = res.data?.data;
        const cupo = data?.cupo;
        const disponibles = cupo?.cupos_disponibles ?? 0;
        const tieneCupo = Boolean(data?.tiene_cupos && disponibles > 0);
        const posicionEspera = cupo?.posicion_espera || data?.posicion_espera || 1;
        const turnoAlt = cupo?.turno_alternativo || data?.turno_alternativo || null;

        setCuposState((prev) => ({
          ...prev,
          [index]: {
            cargando: false,
            disponible: tieneCupo,
            libres: disponibles,
            posicion_espera: tieneCupo ? 0 : posicionEspera,
            turno_alternativo: turnoAlt,
            mensaje: tieneCupo
              ? '¡Vacantes disponibles!'
              : `Cupos agotados. Lista de Espera puesto #${posicionEspera}`,
          },
        }));
      } catch (err: any) {
        setCuposState((prev) => ({
          ...prev,
          [index]: {
            cargando: false,
            disponible: false,
            libres: 0,
            posicion_espera: 1,
            turno_alternativo: null,
            mensaje: err.response?.data?.message || 'Error al verificar cupos',
          },
        }));
      }
    },
    [periodoActivo]
  );

  const handleCambiarTurnoAlternativo = (
    index: number,
    nuevoTurnoId: number,
    nuevoTurnoNombre: string,
    gradoId?: number | null
  ) => {
    onChange(index, 'turno_id', nuevoTurnoId);
    onChange(index, 'turno_solicitado', nuevoTurnoNombre);
    onChange(index, 'turno_preferido', nuevoTurnoNombre);
    const pid = estudiantes[index]?.periodo_academico_id || periodoActivo?.id || null;
    const gId = gradoId || estudiantes[index]?.grado_id;
    if (gId) {
      verificarCuposEstudiante(index, gId, nuevoTurnoId, pid);
    }
  };

  const cardStyle = {
    p: { xs: 2.5, md: 4 },
    mb: 4,
    borderRadius: '20px',
    border: '2px solid',
    borderColor: isDark ? 'rgba(250, 204, 21, 0.25)' : 'rgba(2, 136, 209, 0.2)',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.95)',
    boxShadow: isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.4)'
      : '0 10px 30px rgba(2, 136, 209, 0.08)',
    position: 'relative' as const,
  };

  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 2.5,
    fontWeight: 700,
    fontSize: '1.2rem',
    color: accent,
  };

  const fieldStyle = {
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.95)',
      color: isDark ? '#fff' : '#000',
    },
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
      fontWeight: 500,
      '&.Mui-focused': {
        color: accent,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(1, 87, 155, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: accent,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: accent,
      borderWidth: '2px',
    },
  };

  return (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* Banner de Período Académico Activo */}
      {/* {loadingAcademicos ? (
        <Box display="flex" alignItems="center" gap={2} p={1}>
          <CircularProgress size={20} sx={{ color: accent }} />
          <Typography variant="body2" color="text.secondary">
            Cargando oferta académica...
          </Typography>
        </Box>
      ) : periodoActivo ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: '14px',
            backgroundColor: isDark ? 'rgba(2, 136, 209, 0.15)' : 'rgba(2, 136, 209, 0.08)',
            border: isDark ? '1px solid rgba(2, 136, 209, 0.3)' : '1px solid rgba(2, 136, 209, 0.2)',
            color: isDark ? '#38bdf8' : '#0369a1',
            fontWeight: 500,
          }}
        >
          Postulaciones abiertas para el período escolar:{' '}
          <strong>{periodoActivo.nombre}</strong> {periodoActivo.codigo ? `(${periodoActivo.codigo})` : ''}
        </Alert>
      ) : null} */}

      {/* Lista de Postulantes apilados hacia abajo */}
      {estudiantes.map((estudiante, index) => {
        const cupo = cuposState[index];
        const tituloEstudiante = estudiante.nombres || estudiante.apellido_paterno
          ? `${estudiante.nombres} ${estudiante.apellido_paterno}`.trim()
          : `Postulante #${index + 1}`;

        return (
          <Paper key={index} elevation={0} sx={cardStyle}>
            {/* Cabecera del Estudiante con chip y botón eliminar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 1.5,
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={`Estudiante #${index + 1}`}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.12)',
                    color: accent,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {tituloEstudiante}
                </Typography>
              </Box>

              {estudiantes.length > 1 && (
                <Tooltip title="Eliminar este estudiante de la solicitud">
                  <IconButton
                    onClick={() => onRemoveEstudiante(index)}
                    sx={{
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Sub-sección 1: Datos Personales */}
            <Box sx={titleStyle}>
              <PersonIcon sx={{ fontSize: 26 }} />
              Datos Personales
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Nombres *"
                  value={estudiante.nombres}
                  onChange={(e) => onChange(index, 'nombres', e.target.value)}
                  error={!!errors[`estudiante_${index}_nombres`]}
                  helperText={errors[`estudiante_${index}_nombres`]}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Apellido Paterno *"
                  value={estudiante.apellido_paterno}
                  onChange={(e) => onChange(index, 'apellido_paterno', e.target.value)}
                  error={!!errors[`estudiante_${index}_apellido_paterno`]}
                  helperText={errors[`estudiante_${index}_apellido_paterno`]}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Apellido Materno"
                  value={estudiante.apellido_materno}
                  onChange={(e) => onChange(index, 'apellido_materno', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Cédula de Identidad (CI)"
                  value={estudiante.ci}
                  onChange={(e) => onChange(index, 'ci', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Fecha de Nacimiento *"
                  value={estudiante.fecha_nacimiento}
                  onChange={(val) => onChange(index, 'fecha_nacimiento', val)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[`estudiante_${index}_fecha_nacimiento`],
                      helperText: errors[`estudiante_${index}_fecha_nacimiento`],
                      sx: fieldStyle,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Lugar de Nacimiento"
                  value={estudiante.lugar_nacimiento}
                  onChange={(e) => onChange(index, 'lugar_nacimiento', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Género *"
                  value={estudiante.genero}
                  onChange={(e) => onChange(index, 'genero', e.target.value)}
                  error={!!errors[`estudiante_${index}_genero`]}
                  helperText={errors[`estudiante_${index}_genero`]}
                  sx={fieldStyle}
                >
                  {GENEROS.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, opacity: 0.15 }} />

            {/* Sub-sección 2: Dirección y Residencia */}
            <Box sx={titleStyle}>
              <HomeIcon sx={{ fontSize: 26 }} />
              Dirección y Residencia
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Dirección de Domicilio"
                  placeholder="Calle, avenida o número de vivienda"
                  value={estudiante.direccion || ''}
                  onChange={(e) => onChange(index, 'direccion', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Zona / Barrio"
                  placeholder="Ej. Central, Miraflores, etc."
                  value={estudiante.zona || ''}
                  onChange={(e) => onChange(index, 'zona', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  placeholder="Ej. Potosí"
                  value={estudiante.ciudad || ''}
                  onChange={(e) => onChange(index, 'ciudad', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, opacity: 0.15 }} />

            {/* Sub-sección 3: Información de Inclusión y Discapacidad */}
            <Box sx={titleStyle}>
              <AccessibleIcon sx={{ fontSize: 26 }} />
              Información de Inclusión y Capacidades Especiales
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="¿El estudiante requiere algún apoyo educativo especial? *"
                  value={estudiante.tiene_discapacidad ? 'si' : 'no'}
                  onChange={(e) => {
                    const tiene = e.target.value === 'si';
                    onChange(index, 'tiene_discapacidad', tiene);
                    if (!tiene) {
                      onChange(index, 'tipo_discapacidad', '');
                    }
                  }}
                  sx={fieldStyle}
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="si">Sí</MenuItem>
                </TextField>
              </Grid>

              {estudiante.tiene_discapacidad && (
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    label="Especificar el tipo de apoyo educativo especial requerido *"
                    placeholder="Indique el tipo de discapacidad o condición especial"
                    value={estudiante.tipo_discapacidad || ''}
                    onChange={(e) => onChange(index, 'tipo_discapacidad', e.target.value)}
                    error={!!errors[`estudiante_${index}_tipo_discapacidad`]}
                    helperText={errors[`estudiante_${index}_tipo_discapacidad`]}
                    sx={fieldStyle}
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3, opacity: 0.15 }} />

            {/* Sub-sección 4: Grado y Turno al que Postula */}
            <Box sx={titleStyle}>
              <SchoolIcon sx={{ fontSize: 26 }} />
              Grado y Turno al que Postula
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Grado Solicitado *"
                  value={estudiante.grado_id || ''}
                  onChange={(e) => {
                    const gId = Number(e.target.value);
                    const gradoObj = grados.find((g) => g.id === gId);
                    const pid = estudiante.periodo_academico_id || periodoActivo?.id || null;
                    onChange(index, 'grado_id', gId);
                    if (pid) onChange(index, 'periodo_academico_id', pid);
                    if (gradoObj) onChange(index, 'grado_solicitado', gradoObj.nombre);
                    if (estudiante.turno_id) {
                      verificarCuposEstudiante(index, gId, estudiante.turno_id, pid);
                    }
                  }}
                  error={!!errors[`estudiante_${index}_grado`]}
                  helperText={errors[`estudiante_${index}_grado`]}
                  sx={fieldStyle}
                >
                  {grados.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.nombre} ({g.nivel_nombre || g.nivel_academico_nombre || 'Regular'})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Turno Preferido *"
                  value={estudiante.turno_id || ''}
                  onChange={(e) => {
                    const tId = Number(e.target.value);
                    const turnoObj = turnos.find((t) => t.id === tId);
                    const pid = estudiante.periodo_academico_id || periodoActivo?.id || null;
                    onChange(index, 'turno_id', tId);
                    if (pid) onChange(index, 'periodo_academico_id', pid);
                    if (turnoObj) {
                      onChange(index, 'turno_solicitado', turnoObj.nombre);
                      onChange(index, 'turno_preferido', turnoObj.nombre);
                    }
                    if (estudiante.grado_id) {
                      verificarCuposEstudiante(index, estudiante.grado_id, tId, pid);
                    }
                  }}
                  error={!!errors[`estudiante_${index}_turno`]}
                  helperText={errors[`estudiante_${index}_turno`]}
                  sx={fieldStyle}
                >
                  {turnos.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Alerta de Disponibilidad de Cupos en Vivo */}
            {cupo?.cargando ? (
              <Box display="flex" alignItems="center" gap={1.5} mt={2.5}>
                <CircularProgress size={18} sx={{ color: accent }} />
                <Typography variant="body2" color="text.secondary">
                  Consultando vacantes disponibles en tiempo real...
                </Typography>
              </Box>
            ) : cupo?.disponible === true ? (
              <Alert
                icon={<CheckCircleIcon sx={{ color: '#10b981' }} />}
                severity="success"
                sx={{
                  mt: 2.5,
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: isDark ? '#34d399' : '#065f46',
                  fontWeight: 600,
                }}
              >
                ¡Vacantes disponibles! Hay cupo disponible para {estudiante.grado_solicitado || 'el curso seleccionado'}
              </Alert>
            ) : cupo?.disponible === false ? (
              <Box
                sx={{
                  mt: 2.5,
                  p: 2.2,
                  borderRadius: '16px',
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '10px',
                      flexShrink: 0,
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.18)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccessTimeIcon sx={{ color: isDark ? '#fbbf24' : '#d97706', fontSize: 22 }} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        sx={{
                          color: isDark ? '#fbbf24' : '#b45309',
                          fontSize: '0.95rem',
                        }}
                      >
                        📋 Lista de Espera Oficial · Puesto #{cupo.posicion_espera || 1}
                      </Typography>
                      <Chip
                        size="small"
                        label={`En Lista de Espera #${cupo.posicion_espera || 1}`}
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          bgcolor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                          color: isDark ? '#fbbf24' : '#b45309',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#4b5563', fontSize: '0.86rem', lineHeight: 1.5 }}>
                      Actualmente no hay vacantes directas disponibles para este grado y turno. Tu postulante entrará a la{' '}
                      <strong>Lista de Espera oficial en el puesto #{cupo.posicion_espera || 1}</strong>. Puedes completar la preinscripción con normalidad y si se liberan vacantes, se asignarán por estricto orden de registro.
                    </Typography>
                  </Box>
                </Box>

                {/* Sugerencia de turno alternativo si existe */}
                {cupo.turno_alternativo && cupo.turno_alternativo.cupos_disponibles > 0 && (
                  <Box
                    sx={{
                      pt: 1.5,
                      borderTop: `1px dashed ${isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: isDark ? '#fde68a' : '#92400e', fontWeight: 600, fontSize: '0.82rem' }}>
                      💡 El Turno <strong>{cupo.turno_alternativo.turno_nombre}</strong> cuenta con vacantes directas disponibles.
                    </Typography>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SwapHorizIcon sx={{ fontSize: 18 }} />}
                      onClick={() =>
                        handleCambiarTurnoAlternativo(
                          index,
                          cupo.turno_alternativo!.turno_id,
                          cupo.turno_alternativo!.turno_nombre,
                          estudiante.grado_id
                        )
                      }
                      sx={{
                        borderColor: isDark ? '#fbbf24' : '#d97706',
                        color: isDark ? '#fbbf24' : '#b45309',
                        fontWeight: 700,
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontSize: '0.78rem',
                        px: 1.8,
                        '&:hover': {
                          borderColor: isDark ? '#facc15' : '#b45309',
                          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                        },
                      }}
                    >
                      Cambiar a Turno {cupo.turno_alternativo.turno_nombre}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : null}
          </Paper>
        );
      })}

      {/* Botón para agregar otro hijo abajo directamente */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={onAddEstudiante}
          sx={{
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            px: 4,
            py: 1.8,
            borderColor: accent,
            color: accent,
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
            borderWidth: '2px',
            '&:hover': {
              borderColor: accent,
              borderWidth: '2px',
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.12)' : 'rgba(2, 136, 209, 0.12)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.25s ease',
          }}
        >
          + Agregar Otro Postulante / Hijo
        </Button>
      </Box>
    </Box>
  );
}