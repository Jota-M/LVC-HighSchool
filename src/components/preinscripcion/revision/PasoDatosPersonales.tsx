// components/preinscripcion/revision/PasoDatosPersonales.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  TextField,
  Button,
  Divider,
  Grid,
  Stack,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { useRouter } from 'next/navigation';
import { PreInscripcionDetalle } from '@/types/preinscripcionTypes';

interface PasoDatosPersonalesProps {
  preinscripcion: PreInscripcionDetalle;
  notasVerificacionDatos: string;
  setNotasVerificacionDatos: (notas: string) => void;
  aprobarDatos: (notificarWhatsapp?: boolean) => Promise<void>;
  rechazar: (motivo: string) => Promise<void>;
  setActiveStep: (step: number) => void;
  saving: boolean;
  reenviarWhatsApp?: (observaciones?: string) => Promise<any>;
}

export default function PasoDatosPersonales({
  preinscripcion,
  notasVerificacionDatos,
  setNotasVerificacionDatos,
  aprobarDatos,
  rechazar,
  setActiveStep,
  saving,
  reenviarWhatsApp,
}: PasoDatosPersonalesProps) {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [reenviandoWA, setReenviandoWA] = useState(false);
  const [feedbackWA, setFeedbackWA] = useState<string | null>(null);

  const handleReenviarWA = async () => {
    if (!reenviarWhatsApp) return;
    try {
      setReenviandoWA(true);
      setFeedbackWA(null);
      await reenviarWhatsApp(notasVerificacionDatos || undefined);
      setFeedbackWA('Notificación de estado enviada exitosamente por WhatsApp al tutor.');
    } catch (err: any) {
      alert(err.message || 'Error al enviar WhatsApp');
    } finally {
      setReenviandoWA(false);
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return 'No especificada';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const nombreCompletoEstudiante = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();

  // Obtener lista de tutores (soporte para array múltiple o tutor singular)
  const tutoresList = (preinscripcion as any).tutores && (preinscripcion as any).tutores.length > 0
    ? (preinscripcion as any).tutores
    : preinscripcion.tutor ? [preinscripcion.tutor] : [];

  const criteriosVerificacion = [
    'Los datos coinciden fielmente con los documentos oficiales cargados',
    'Teléfono y correo electrónico verificados y activos',
    'Relación y parentesco de tutores confirmada',
    'Zona y domicilio residencial validados',
  ];

  const cardStyle = {
    borderRadius: '24px',
    border: `1px solid ${alpha(accent, 0.28)}`,
    overflow: 'hidden',
    background: isDark
      ? 'linear-gradient(180deg, #0e1726 0%, #0b1320 100%)'
      : '#ffffff',
    boxShadow: isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.4)'
      : '0 4px 20px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    mb: 3,
    '&:hover': {
      borderColor: accent,
      boxShadow: isDark
        ? `0 14px 40px ${alpha(accent, 0.25)}, 0 0 20px ${alpha(accent, 0.15)}`
        : `0 14px 30px ${alpha(accent, 0.2)}`,
      transform: 'translateY(-3px)',
    },
  };

  const dataBoxStyle = {
    p: 2,
    borderRadius: '16px',
    bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
    transition: 'all 0.25s ease',
    '&:hover': {
      bgcolor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : alpha(accent, 0.35),
      transform: 'translateX(3px)',
    },
  };

  return (
    <>
      {/* HEADER DEL PASO */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(250,204,21,0.35)'
                    : '0 4px 16px rgba(2,136,209,0.35)',
                }}
              >
                <PersonIcon sx={{ fontSize: 28 }} />
              </Box>


              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Paso 1: Datos Personales y Tutores
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valida la información del estudiante y sus tutores legales
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              label="En Revisión de Datos"
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                bgcolor: alpha(accent, 0.12),
                color: accent,
                border: `1px solid ${alpha(accent, 0.3)}`,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* SECCIÓN 1: DATOS DEL ESTUDIANTE */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 5,
                height: 22,
                borderRadius: 1,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              }}
            />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Información del Estudiante
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {[
              { label: 'Nombre Completo', value: nombreCompletoEstudiante },
              { label: 'Cédula de Identidad (CI)', value: preinscripcion.estudiante.ci || 'Sin CI registrado' },
              { label: 'Código RUDE', value: preinscripcion.estudiante.rude || 'No registrado aún' },
              {
                label: 'Fecha de Nacimiento',
                value: `${formatearFecha(preinscripcion.estudiante.fecha_nacimiento)} (${calcularEdad(preinscripcion.estudiante.fecha_nacimiento)})`,
              },
              { label: 'Género', value: preinscripcion.estudiante.genero ? preinscripcion.estudiante.genero.toUpperCase() : 'No especificado' },
              { label: 'Lugar de Nacimiento', value: preinscripcion.estudiante.lugar_nacimiento || 'No especificado' },
              {
                label: 'Grado y Turno Solicitado',
                value: `${preinscripcion.grado_nombre || preinscripcion.estudiante.grado_solicitado || 'Sin grado'} - Turno: ${preinscripcion.turno_nombre || preinscripcion.estudiante.turno_solicitado || 'Mañana'}`,
              },
              {
                label: 'Institución de Procedencia',
                value: preinscripcion.estudiante.institucion_procedencia || 'No especificada / Primer ingreso',
              },
              {
                label: 'Dirección Domiciliaria',
                value: `${preinscripcion.estudiante.direccion || 'Sin dirección'}, Zona: ${preinscripcion.estudiante.zona || 'N/A'}, Ciudad: ${preinscripcion.estudiante.ciudad || 'La Paz'}`,
              },
              {
                label: 'Teléfono / Contacto',
                value: preinscripcion.estudiante.telefono || 'Sin contacto directo',
              },
            ].map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                <Box sx={dataBoxStyle}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: accent,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}

            {preinscripcion.estudiante.tiene_discapacidad && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: alpha('#f59e0b', 0.1),
                    border: `1.5px solid ${alpha('#f59e0b', 0.4)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Condición Especial / Discapacidad Declarada
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {preinscripcion.estudiante.tipo_discapacidad || 'Declarada sin detalles'}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* SECCIÓN 2: TUTORES Y REPRESENTANTES */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 5,
                  height: 22,
                  borderRadius: 1,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                }}
              />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Tutores y Padres de Familia ({tutoresList.length})
              </Typography>
            </Box>

            <Chip
              icon={<PeopleIcon sx={{ fontSize: 16 }} />}
              label={`${tutoresList.length} Registrado(s)`}
              size="small"
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                bgcolor: alpha(accent, 0.12),
                color: accent,
                border: `1px solid ${alpha(accent, 0.3)}`,
              }}
            />
          </Box>

          <Stack spacing={3}>
            {tutoresList.map((tutor: any, index: number) => {
              const tutorNombre = `${tutor.nombres} ${tutor.apellido_paterno} ${tutor.apellido_materno || ''}`.trim();
              const esPrincipal = tutor.es_tutor_principal || index === 0;

              return (
                <Paper
                  key={tutor.id || index}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: isDark ? alpha('#fff', 0.02) : alpha(accent, 0.02),
                    border: `1.5px solid ${esPrincipal ? alpha(accent, 0.35) : alpha(theme.palette.divider, 0.6)}`,
                    position: 'relative',
                  }}
                >
                  {/* Encabezado del tutor */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          bgcolor: esPrincipal ? alpha(accent, 0.18) : alpha(theme.palette.text.secondary, 0.1),
                          color: esPrincipal ? accent : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          {tutorNombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Parentesco: {tutor.parentesco || tutor.tipo_representante || 'Padre / Tutor'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      {esPrincipal && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 14, color: isDark ? '#000 !important' : '#fff !important' }} />}
                          label="Tutor Principal"
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            background: isDark
                              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            color: isDark ? '#000' : '#fff',
                            boxShadow: `0 2px 8px ${alpha(accent, 0.3)}`,
                          }}
                        />
                      )}
                      {tutor.vive_con_estudiante && (
                        <Chip
                          label="Vive con el estudiante"
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 600,
                            bgcolor: alpha('#10b981', 0.15),
                            color: '#10b981',
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                          }}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Campos del tutor */}
                  <Grid container spacing={2}>
                    {[
                      { label: 'Cédula de Identidad', value: tutor.ci || 'No especificada' },
                      { label: 'Teléfono / Móvil', value: tutor.telefono || tutor.celular || 'No especificado' },
                      ...(tutor.email ? [{ label: 'Correo Electrónico', value: tutor.email }] : []),
                      { label: 'Ocupación / Profesión', value: tutor.ocupacion || 'No especificada' },
                      { label: 'Lugar de Trabajo', value: tutor.lugar_trabajo || 'No especificado' },
                      { label: 'Dirección Domicilio', value: tutor.direccion || 'Misma del estudiante' },
                    ].map((campo, cIdx) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cIdx}>
                        <Box sx={dataBoxStyle}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: accent,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontSize: '0.68rem',
                              display: 'block',
                              mb: 0.25,
                            }}
                          >
                            {campo.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {campo.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* SECCIÓN 3: VALIDACIÓN DE CONSISTENCIA Y ACCIONES */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 5,
                height: 20,
                borderRadius: 1,
                bgcolor: '#10b981',
              }}
            />
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Control de Consistencia de Información
            </Typography>
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {criteriosVerificacion.map((criterio, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.8,
                    borderRadius: '14px',
                    bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
                    border: `1px solid ${alpha('#10b981', 0.25)}`,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                  <Typography variant="body2" fontWeight={500} color="text.primary">
                    {criterio}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.6) }} />

          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.primary"
            sx={{ mb: 1.5 }}
          >
            Observaciones sobre Datos Personales:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Añade notas u observaciones sobre la verificación de datos del estudiante o tutor..."
            value={notasVerificacionDatos}
            onChange={(e) => setNotasVerificacionDatos(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                '&.Mui-focused fieldset': {
                  borderColor: accent,
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Alertas de Notificación WhatsApp */}
          {feedbackWA && (
            <Alert
              severity="success"
              onClose={() => setFeedbackWA(null)}
              sx={{ mb: 2.5, borderRadius: '14px', fontWeight: 600 }}
            >
              {feedbackWA}
            </Alert>
          )}

          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: '14px',
              bgcolor: alpha(accent, 0.08),
              border: `1px solid ${alpha(accent, 0.25)}`,
              color: 'text.primary',
              '& .MuiAlert-icon': {
                color: accent,
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>Control de Notificaciones WhatsApp</AlertTitle>
            Puedes elegir si deseas únicamente actualizar el estado interno en el sistema (<strong>"Solo Aprobar"</strong>) o también notificar automáticamente al tutor <strong>{preinscripcion.tutor?.nombres}</strong> vía WhatsApp indicándole que los datos y documentos fueron validados y su trámite pasa a etapa de entrevista.
          </Alert>

          {/* Botones de acción */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/preinscripciones')}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1.2,
                borderColor: alpha(accent, 0.5),
                color: accent,
                backgroundColor: alpha(accent, 0.05),
                '&:hover': {
                  borderColor: accent,
                  backgroundColor: alpha(accent, 0.12),
                  transform: 'translateX(-2px)',
                },
              }}
            >
              Volver a la Lista
            </Button>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => rechazar(notasVerificacionDatos)}
                disabled={saving || reenviandoWA}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.2,
                  borderColor: alpha('#ef4444', 0.5),
                  color: '#ef4444',
                  backgroundColor: alpha('#ef4444', 0.05),
                  '&:hover': {
                    borderColor: '#ef4444',
                    backgroundColor: alpha('#ef4444', 0.12),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Rechazar
              </Button>

              {/* Opción 1: Solo cambiar estado en el sistema SIN enviar WhatsApp */}
              <Button
                variant="outlined"
                startIcon={<NotificationsOffIcon />}
                onClick={() => aprobarDatos(false)}
                disabled={saving || reenviandoWA}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.2,
                  borderColor: alpha(isDark ? '#fff' : '#000', 0.22),
                  color: isDark ? '#e2e8f0' : '#475569',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                  '&:hover': {
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.4),
                  },
                }}
              >
                {saving ? 'Guardando...' : 'Solo Aprobar (Sin WA)'}
              </Button>

              {/* Opción 2: Reenviar o notificar por WhatsApp al tutor */}
              {reenviarWhatsApp && (
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                  onClick={handleReenviarWA}
                  disabled={saving || reenviandoWA}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    py: 1.2,
                    borderColor: alpha('#25D366', 0.6),
                    color: isDark ? '#4ade80' : '#15803d',
                    bgcolor: alpha('#25D366', 0.08),
                    '&:hover': {
                      bgcolor: alpha('#25D366', 0.18),
                      borderColor: '#25D366',
                    },
                  }}
                >
                  {reenviandoWA ? 'Enviando...' : 'Notificar / Reenviar WA'}
                </Button>
              )}

              {/* Opción 3 Principal: Aprobar Datos Y Notificar por WhatsApp */}
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                onClick={() => aprobarDatos(true)}
                disabled={saving || reenviandoWA}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#fff',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(37, 211, 102, 0.5)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {saving ? 'Guardando...' : 'Aprobar Datos y Enviar WhatsApp'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </>
  );
}