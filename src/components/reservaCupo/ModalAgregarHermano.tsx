// components/reservaCupo/ModalAgregarHermano.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
  FamilyRestroom as FamilyIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  SwapHoriz as SwapHorizIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import reservaCupoService from '@/services/reservaCupoService';
import {
  HermanoParaReserva,
  DisponibilidadHermanoResponse,
} from '@/types/reservaCupoTypes';

export interface ModalAgregarHermanoProps {
  open: boolean;
  onClose: () => void;
  onAgregar?: (hermano: HermanoParaReserva) => void;
  onAgregarHermano?: (hermano: HermanoParaReserva) => void;
  estudiantesRegulares: any[];
  periodoId?: number;
}

export default function ModalAgregarHermano({
  open,
  onClose,
  onAgregar,
  onAgregarHermano,
  estudiantesRegulares,
}: ModalAgregarHermanoProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Tokens visuales idénticos a ModalEstudianteNoEncontrado ─────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  // Normalizar lista de estudiantes regulares
  const listaRegulares = React.useMemo(() => {
    return (estudiantesRegulares || []).map((item: any) => {
      if (item.estudiante) {
        return {
          id: item.estudiante.id,
          nombre_completo:
            item.estudiante.nombre_completo ||
            `${item.estudiante.nombres || ''} ${item.estudiante.apellido_paterno || ''}`.trim(),
          ci: item.estudiante.ci || 'S/N',
        };
      }
      return {
        id: item.id,
        nombre_completo: item.nombre_completo || item.nombres || 'Estudiante Regular',
        ci: item.ci || 'S/N',
      };
    });
  }, [estudiantesRegulares]);

  // Estados del formulario
  const [grados, setGrados] = useState<Array<{ id: number; nombre: string; nivel_nombre?: string }>>([]);
  const [isLoadingGrados, setIsLoadingGrados] = useState(false);
  const [hermanoRegularId, setHermanoRegularId] = useState<number>(listaRegulares[0]?.id || 0);

  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [ci, setCi] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('M');
  const [gradoSolicitadoId, setGradoSolicitadoId] = useState<number | ''>('');
  const [turnoSolicitadoId, setTurnoSolicitadoId] = useState<number>(1);
  const [observaciones, setObservaciones] = useState('');

  // Disponibilidad en tiempo real
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadHermanoResponse | null>(null);
  const [isConsultandoDisp, setIsConsultandoDisp] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Cargar lista de grados
  useEffect(() => {
    if (open) {
      if (listaRegulares.length > 0 && (!hermanoRegularId || !listaRegulares.some((r: any) => r.id === hermanoRegularId))) {
        setHermanoRegularId(listaRegulares[0].id);
      }
      const cargarGrados = async () => {
        setIsLoadingGrados(true);
        try {
          const list = await reservaCupoService.obtenerGradosDisponibles();
          setGrados(list);
          if (list.length > 0 && !gradoSolicitadoId) {
            setGradoSolicitadoId(list[0].id);
          }
        } catch (e) {
          console.error('Error al cargar grados:', e);
        } finally {
          setIsLoadingGrados(false);
        }
      };
      cargarGrados();
    }
  }, [open, listaRegulares]);

  // Consultar disponibilidad al cambiar grado o turno
  useEffect(() => {
    if (open && gradoSolicitadoId && turnoSolicitadoId) {
      const consultar = async () => {
        setIsConsultandoDisp(true);
        try {
          const disp = await reservaCupoService.consultarDisponibilidadHermano({
            grado_id: Number(gradoSolicitadoId),
            turno_id: Number(turnoSolicitadoId),
          });
          setDisponibilidad(disp);
        } catch (e) {
          console.error('Error al consultar disponibilidad:', e);
          setDisponibilidad(null);
        } finally {
          setIsConsultandoDisp(false);
        }
      };
      consultar();
    }
  }, [open, gradoSolicitadoId, turnoSolicitadoId]);

  const handleCerrar = () => {
    setNombres('');
    setApellidoPaterno('');
    setApellidoMaterno('');
    setCi('');
    setFechaNacimiento('');
    setGenero('M');
    setObservaciones('');
    setErrorValidacion(null);
    setDisponibilidad(null);
    onClose();
  };

  const handleCambiarATurnoAlternativo = () => {
    if (disponibilidad?.turno_alternativo) {
      setTurnoSolicitadoId(disponibilidad.turno_alternativo.turno_id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const nomLimpio = nombres.replace(/<[^>]*>?/gm, '').trim();
    const patLimpio = apellidoPaterno.replace(/<[^>]*>?/gm, '').trim();
    const matLimpio = apellidoMaterno.replace(/<[^>]*>?/gm, '').trim();
    const ciLimpio = ci.replace(/<[^>]*>?/gm, '').trim();
    const obsLimpia = observaciones.replace(/<[^>]*>?/gm, '').trim();

    // Detección de patrones de scripting o inyección de código
    const PATRON_SCRIPT = /<[^>]*>|javascript:|data:\s*text\/html|vbscript:|on\w+\s*=/i;
    if (
      PATRON_SCRIPT.test(nombres) ||
      PATRON_SCRIPT.test(apellidoPaterno) ||
      PATRON_SCRIPT.test(apellidoMaterno) ||
      PATRON_SCRIPT.test(ci) ||
      PATRON_SCRIPT.test(observaciones)
    ) {
      setErrorValidacion('Por motivos de seguridad, no se permiten caracteres especiales ni secuencias de código.');
      return;
    }

    if (!nomLimpio) {
      setErrorValidacion('Debe ingresar los nombres del hermanito');
      return;
    }
    if (nomLimpio.length > 60 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\'-]+$/.test(nomLimpio)) {
      setErrorValidacion('Los nombres solo deben contener letras (máximo 60 caracteres)');
      return;
    }

    if (!patLimpio) {
      setErrorValidacion('Debe ingresar el apellido paterno del hermanito');
      return;
    }
    if (patLimpio.length > 60 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\'-]+$/.test(patLimpio)) {
      setErrorValidacion('El apellido paterno solo debe contener letras (máximo 60 caracteres)');
      return;
    }

    if (matLimpio && (matLimpio.length > 60 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\'-]+$/.test(matLimpio))) {
      setErrorValidacion('El apellido materno solo debe contener letras');
      return;
    }

    if (ciLimpio && (ciLimpio.length > 20 || !/^[a-zA-Z0-9\s\-]+$/.test(ciLimpio))) {
      setErrorValidacion('El CI solo debe contener números, letras o guiones (máximo 20 caracteres)');
      return;
    }

    if (!fechaNacimiento) {
      setErrorValidacion('Debe ingresar la fecha de nacimiento');
      return;
    }
    if (!gradoSolicitadoId) {
      setErrorValidacion('Debe seleccionar el grado al que postula');
      return;
    }
    if (!hermanoRegularId) {
      setErrorValidacion('Debe seleccionar a qué hermano regular respalda esta solicitud');
      return;
    }

    const gradoObj = grados.find((g) => g.id === Number(gradoSolicitadoId));
    const regularObj = listaRegulares.find((r) => r.id === hermanoRegularId);

    const nuevoHermano: HermanoParaReserva = {
      id_temp: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      hermano_regular_id: hermanoRegularId,
      hermano_regular_nombre: regularObj?.nombre_completo,
      nombres: nomLimpio,
      apellido_paterno: patLimpio,
      apellido_materno: matLimpio || undefined,
      ci: ciLimpio || undefined,
      fecha_nacimiento: fechaNacimiento,
      genero,
      grado_solicitado_id: Number(gradoSolicitadoId),
      grado_solicitado_nombre: gradoObj ? `${gradoObj.nombre} (${gradoObj.nivel_nombre || ''})` : 'Grado Solicitado',
      grado_nombre: gradoObj ? `${gradoObj.nombre} (${gradoObj.nivel_nombre || ''})` : 'Grado Solicitado',
      turno_solicitado_id: turnoSolicitadoId,
      turno_solicitado_nombre: turnoSolicitadoId === 1 ? 'Mañana' : 'Tarde',
      turno_nombre: turnoSolicitadoId === 1 ? 'Mañana' : 'Tarde',
      tiene_cupo_inmediato: disponibilidad?.tiene_cupo_inmediato ?? false,
      es_lista_espera: !(disponibilidad?.tiene_cupo_inmediato ?? false),
      posicion_espera: disponibilidad?.posicion_espera ?? 0,
      observaciones: obsLimpia || undefined,
    };

    const cb = onAgregar || onAgregarHermano;
    if (cb) cb(nuevoHermano);
    handleCerrar();
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      background: bgField,
      fontSize: '0.95rem',
      '& fieldset': {
        borderColor: borderField,
      },
      '&:hover fieldset': {
        borderColor: alpha(brand, 0.4),
      },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.95rem',
      '&.Mui-focused': {
        color: brand,
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── HEADER (ESTILO MODALESTUDIANTENOENCONTRADO) ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.8),
                mb: 0.4,
              }}
            >
              Beneficio Institucional · Prioridad Familiar
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '9px',
                  flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAddIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, color: 'text.primary' }}>
                Registrar Hermanito Nuevo (Gestión 2027)
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={handleCerrar}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              transition: 'all 0.15s',
              flexShrink: 0,
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Barra superior de acento */}
        <Box
          sx={{
            height: 3,
            borderRadius: 2,
            background: brand,
            transition: 'background 0.3s',
            width: '100%',
          }}
        />
      </Box>

      {/* ── BODY ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        <DialogContent
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2.5,
            flex: 1,
            overflowY: 'auto',
            // Slider / Scrollbar elegante adaptado al modo claro/oscuro
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? 'rgba(250, 204, 21, 0.4)' : 'rgba(2, 136, 209, 0.4)',
              borderRadius: '8px',
              '&:hover': {
                background: isDark ? '#facc15' : '#0288d1',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: `${isDark ? 'rgba(250, 204, 21, 0.4)' : 'rgba(2, 136, 209, 0.4)'} transparent`,
          }}
        >
          {errorValidacion && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
              onClose={() => setErrorValidacion(null)}
            >
              {errorValidacion}
            </Alert>
          )}

          {/* Banner Hermano Regular que Respalda (Estilo Banner CI de ModalEstudianteNoEncontrado) */}
          <Box
            sx={{
              p: 1.75,
              borderRadius: '12px',
              background: alpha(brand, 0.08),
              border: `1px solid ${alpha(brand, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2.5,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <FamilyIcon sx={{ color: brand, fontSize: 24, flexShrink: 0 }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha(brand, 0.85),
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                  }}
                >
                  Estudiante Regular que lo Respalda
                </Typography>
                {listaRegulares.length > 1 ? (
                  <FormControl sx={{ minWidth: 260, mt: 0.5 }}>
                    <Select
                      value={hermanoRegularId}
                      onChange={(e) => setHermanoRegularId(Number(e.target.value))}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
                      }}
                    >
                      {listaRegulares.map((reg) => (
                        <MenuItem key={reg.id} value={reg.id}>
                          {reg.nombre_completo} (CI: {reg.ci})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary' }}>
                    {listaRegulares[0]?.nombre_completo || 'Estudiante Regular'}{' '}
                    <span style={{ opacity: 0.7, fontWeight: 500, fontFamily: 'monospace' }}>
                      · CI: {listaRegulares[0]?.ci}
                    </span>
                  </Typography>
                )}
              </Box>
            </Box>

            <Chip
              icon={<StarIcon sx={{ fontSize: '13px !important', color: isDark ? '#000 !important' : '#fff !important' }} />}
              label="Prioridad Familiar"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 800,
                bgcolor: brand,
                color: isDark ? '#000' : '#fff',
                boxShadow: `0 2px 8px ${alpha(brand, 0.3)}`,
              }}
            />
          </Box>

          {/* Sección 1: Grado y Turno */}
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: alpha(brand, 0.9),
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <SchoolIcon sx={{ fontSize: 16 }} />
            1. Grado y Turno Solicitado
          </Typography>

          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="grado-solicitado-label">Grado de Ingreso</InputLabel>
                <Select
                  labelId="grado-solicitado-label"
                  value={gradoSolicitadoId}
                  label="Grado de Ingreso"
                  onChange={(e) => setGradoSolicitadoId(Number(e.target.value))}
                  disabled={isLoadingGrados}
                >
                  {grados.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.nombre} — <span style={{ opacity: 0.7, marginLeft: 6, fontSize: '0.85em' }}>{g.nivel_nombre}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="turno-solicitado-label">Turno Preferido</InputLabel>
                <Select
                  labelId="turno-solicitado-label"
                  value={turnoSolicitadoId}
                  label="Turno Preferido"
                  onChange={(e) => setTurnoSolicitadoId(Number(e.target.value))}
                >
                  <MenuItem value={1}>Turno Mañana</MenuItem>
                  <MenuItem value={2}>Turno Tarde</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Tarjeta de Disponibilidad en Tiempo Real (Estilo Tip / Card de ModalEstudianteNoEncontrado) */}
          <Box sx={{ mb: 2.5 }}>
            {isConsultandoDisp ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.5,
                  px: 2,
                  borderRadius: '12px',
                  background: bgField,
                  border: `1px solid ${borderField}`,
                }}
              >
                <CircularProgress size={18} sx={{ color: brand }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                  Consultando disponibilidad de cupos y estado de lista de espera...
                </Typography>
              </Box>
            ) : disponibilidad ? (
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: disponibilidad.tiene_cupo_inmediato
                    ? alpha('#10b981', isDark ? 0.12 : 0.08)
                    : alpha('#f59e0b', isDark ? 0.12 : 0.08),
                  border: `1.5px solid ${alpha(disponibilidad.tiene_cupo_inmediato ? '#10b981' : '#f59e0b', 0.35)}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    flexShrink: 0,
                    bgcolor: alpha(disponibilidad.tiene_cupo_inmediato ? '#10b981' : '#f59e0b', 0.2),
                    border: `1px solid ${alpha(disponibilidad.tiene_cupo_inmediato ? '#10b981' : '#f59e0b', 0.4)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {disponibilidad.tiene_cupo_inmediato ? (
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                  ) : (
                    <AccessTimeIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{
                        color: disponibilidad.tiene_cupo_inmediato
                          ? isDark ? '#34d399' : '#059669'
                          : isDark ? '#fbbf24' : '#d97706',
                        fontSize: '0.85rem',
                      }}
                    >
                      {disponibilidad.tiene_cupo_inmediato
                        ? '⭐ Cupo Directo Disponible (Prioridad Familiar)'
                        : `📋 Lista de Espera Prioritaria · Puesto #${disponibilidad.posicion_espera}`}
                    </Typography>
                    <Chip
                      size="small"
                      label={disponibilidad.tiene_cupo_inmediato ? 'Asignación Directa' : 'Prioridad Familiar'}
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: alpha(disponibilidad.tiene_cupo_inmediato ? '#10b981' : '#f59e0b', 0.2),
                        color: disponibilidad.tiene_cupo_inmediato ? '#10b981' : '#f59e0b',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.45 }}>
                    {disponibilidad.mensaje}
                  </Typography>

                  {/* Sugerencia de turno alternativo si está en espera */}
                  {!disponibilidad.tiene_cupo_inmediato &&
                    disponibilidad.turno_alternativo &&
                    disponibilidad.turno_alternativo.tiene_cupo_inmediato && (
                      <Box
                        sx={{
                          mt: 1.5,
                          pt: 1.25,
                          borderTop: `1px dashed ${alpha('#f59e0b', 0.3)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: isDark ? '#fbbf24' : '#b45309', fontWeight: 600 }}>
                          💡 El Turno <strong>{disponibilidad.turno_alternativo.turno_nombre}</strong> cuenta con{' '}
                          <strong>{disponibilidad.turno_alternativo.cupos_disponibles}</strong> cupo(s) directo(s).
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
                          onClick={handleCambiarATurnoAlternativo}
                          sx={{
                            borderColor: alpha('#f59e0b', 0.5),
                            color: isDark ? '#fbbf24' : '#d97706',
                            fontWeight: 700,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            py: 0.3,
                            px: 1.2,
                            '&:hover': {
                              borderColor: '#f59e0b',
                              bgcolor: alpha('#f59e0b', 0.12),
                            },
                          }}
                        >
                          Cambiar a Turno {disponibilidad.turno_alternativo.turno_nombre}
                        </Button>
                      </Box>
                    )}
                </Box>
              </Box>
            ) : null}
          </Box>

          {/* Sección 2: Datos Personales */}
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: alpha(brand, 0.9),
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <PersonIcon sx={{ fontSize: 16 }} />
            2. Datos Personales del Hermanito
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Nombres *"
                value={nombres}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\'-]/g, '').slice(0, 60);
                  setNombres(val);
                }}
                placeholder="Ej: Mateo Lucas"
                sx={inputStyle}
                slotProps={{
                  htmlInput: { maxLength: 60 }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Apellido Paterno *"
                value={apellidoPaterno}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\'-]/g, '').slice(0, 60);
                  setApellidoPaterno(val);
                }}
                placeholder="Ej: Flores"
                sx={inputStyle}
                slotProps={{
                  htmlInput: { maxLength: 60 }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Apellido Materno"
                value={apellidoMaterno}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\'-]/g, '').slice(0, 60);
                  setApellidoMaterno(val);
                }}
                placeholder="Ej: Quispe (opcional)"
                sx={inputStyle}
                slotProps={{
                  htmlInput: { maxLength: 60 }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="CI o Certificado"
                value={ci}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 20);
                  setCi(val);
                }}
                placeholder="Ej: 13948291"
                helperText="Opcional si aún no tramitó CI"
                sx={inputStyle}
                slotProps={{
                  htmlInput: { maxLength: 20 }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento *"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={inputStyle}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="genero-label">Género</InputLabel>
                <Select
                  labelId="genero-label"
                  value={genero}
                  label="Género"
                  onChange={(e) => setGenero(e.target.value)}
                >
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones adicionales"
                value={observaciones}
                onChange={(e) => {
                  const val = e.target.value.replace(/<[^>]*>?/gm, '').slice(0, 300);
                  setObservaciones(val);
                }}
                placeholder="Ej: Solicita estar en el mismo turno de su hermano, etc."
                sx={inputStyle}
                slotProps={{
                  htmlInput: { maxLength: 300 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* ── FOOTER SIEMPRE VISIBLE Y FIJO AL FONDO DEL MODAL ── */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            pb: 2.5,
            pt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderTop: `1px solid ${borderField}`,
            background: bgModal,
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleCerrar}
            sx={{
              borderRadius: '12px',
              color: 'text.secondary',
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': { background: 'rgba(255,255,255,0.05)' },
            }}
          >
            Cancelar
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            type="submit"
            variant="contained"
            startIcon={<PersonAddIcon sx={{ fontSize: 19 }} />}
            sx={{
              borderRadius: '12px',
              px: 3.5,
              py: 1.2,
              fontWeight: 800,
              fontSize: '0.92rem',
              textTransform: 'none',
              background: brand,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': {
                background: isDark ? '#eab308' : '#01579b',
                boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
              },
            }}
          >
            Agregar Hermanito a la Reserva
          </Button>
        </Box>
      </form>
    </Dialog>
  );
}
