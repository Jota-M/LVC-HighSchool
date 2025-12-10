// components/preinscripcion/revision/PasoDecisionFinal.tsx
'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  TextField,
  Button,
  Divider,
  Grid,
  Paper,
  Avatar,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PreInscripcionDetalle, EstadoPreInscripcion } from '@/types/preinscripcionTypes';

interface PasoDecisionFinalProps {
  preinscripcion: PreInscripcionDetalle;
  notasDecisionFinal: string;
  setNotasDecisionFinal: (notas: string) => void;
  decisionFinal: EstadoPreInscripcion | '';
  setDecisionFinal: (decision: EstadoPreInscripcion | '') => void;
  confirmarDecision: () => Promise<void>;
  setActiveStep: (step: number) => void;
  saving: boolean;
}

export default function PasoDecisionFinal({
  preinscripcion,
  notasDecisionFinal,
  setNotasDecisionFinal,
  decisionFinal,
  setDecisionFinal,
  confirmarDecision,
  setActiveStep,
  saving,
}: PasoDecisionFinalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const nombreCompleto = `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`.trim();
  const iniciales = `${preinscripcion.estudiante.nombres[0]}${preinscripcion.estudiante.apellido_paterno[0]}`;

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

  const getGradoLabel = (grado?: string | null) => {
    const grados: Record<string, string> = {
      PRE_KINDER: 'Pre-Kinder',
      KINDER: 'Kinder',
      PRIMERO_PRIMARIA: '1ro Primaria',
      PRIMERO_SECUNDARIA: '1ro Secundaria',
    };
    return grados[grado || ''] || grado || 'No especificado';
  };

  const decisiones = [
    {
      key: 'aprobada' as EstadoPreInscripcion,
      color: isDark ? '#10b981' : '#059669',
      lightColor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.1),
      gradient: isDark
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      title: 'Aceptar Estudiante',
      desc: 'Aprobar la admisión del estudiante al curso solicitado',
      icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
    },
    {
      key: 'rechazada' as EstadoPreInscripcion,
      color: isDark ? '#ef4444' : '#dc2626',
      lightColor: isDark ? alpha('#ef4444', 0.2) : alpha('#ef4444', 0.1),
      gradient: isDark
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      title: 'Rechazar Estudiante',
      desc: 'Denegar la admisión del estudiante',
      icon: <CloseIcon sx={{ fontSize: 28 }} />,
    },
    {
      key: 'documentos_pendientes' as EstadoPreInscripcion,
      color: isDark ? '#f59e0b' : '#d97706',
      lightColor: isDark ? alpha('#f59e0b', 0.2) : alpha('#f59e0b', 0.1),
      gradient: isDark
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      title: 'Solicitar Información Adicional',
      desc: 'Requerir documentos o datos adicionales antes de decidir',
      icon: <PendingIcon sx={{ fontSize: 28 }} />,
    },
  ];

  // Estilos dinámicos
  const cardStyle = {
    borderRadius: 4,
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.4)'
      : '0 8px 24px rgba(0,0,0,0.08)',
    background: isDark
      ? 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)'
      : '#ffffff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark
        ? '0 12px 40px rgba(0,0,0,0.5)'
        : '0 12px 32px rgba(0,0,0,0.12)',
    },
  };

  const headerIconStyle = {
    width: 56,
    height: 56,
    borderRadius: 3,
    background: isDark
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark
      ? '0 4px 20px rgba(251, 191, 36, 0.4)'
      : '0 4px 15px rgba(245, 158, 11, 0.3)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.8 },
    },
  };

  return (
    <>
      {/* Header del paso */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={headerIconStyle}>
                <TaskAltIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    background: isDark
                      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Decisión Final
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
                >
                  Resolución final del proceso de admisión
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon />}
              label="Última etapa"
              sx={{
                bgcolor: isDark ? alpha('#f59e0b', 0.2) : alpha('#f59e0b', 0.1),
                color: isDark ? '#fbbf24' : '#d97706',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isDark ? '#fbbf24' : '#f59e0b',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#f59e0b', 0.3) : alpha('#f59e0b', 0.15),
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              '& .MuiLinearProgress-bar': {
                background: isDark
                  ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: 4,
                transition: 'all 0.5s ease',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Resumen de Evaluación */}
      <Card sx={{ ...cardStyle, mb: 3, mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Resumen de Evaluación
          </Typography>

          <Grid container spacing={2}>
            {[
              {
                icon: CheckCircleIcon,
                title: 'Documentos',
                status: 'Verificados',
                isComplete: true,
                delay: 0,
              },
              {
                icon: CheckCircleIcon,
                title: 'Datos Personales',
                status: 'Confirmados',
                isComplete: true,
                delay: 0.1,
              },
              {
                icon: PendingIcon,
                title: 'Decisión Final',
                status: 'Pendiente',
                isComplete: false,
                delay: 0.2,
              },
            ].map((item, index) => (
              <Grid size={{xs:12, md:4}} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: item.isComplete
                      ? isDark
                        ? alpha('#10b981', 0.15)
                        : alpha('#10b981', 0.1)
                      : isDark
                      ? alpha('#fff', 0.05)
                      : alpha('#000', 0.02),
                    border: '2px solid',
                    borderColor: item.isComplete
                      ? isDark
                        ? alpha('#10b981', 0.3)
                        : '#10b981'
                      : isDark
                      ? alpha('#fff', 0.1)
                      : alpha('#000', 0.08),
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.5s ease ${item.delay}s both`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: item.isComplete
                        ? isDark
                          ? '0 8px 20px rgba(16, 185, 129, 0.3)'
                          : '0 8px 20px rgba(16, 185, 129, 0.2)'
                        : isDark
                        ? '0 8px 20px rgba(245, 158, 11, 0.3)'
                        : '0 8px 20px rgba(245, 158, 11, 0.2)',
                    },
                    '@keyframes fadeInUp': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(20px)',
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                  }}
                >
                  <item.icon
                    sx={{
                      fontSize: 40,
                      color: item.isComplete
                        ? isDark
                          ? '#6ee7b7'
                          : '#059669'
                        : isDark
                        ? '#fbbf24'
                        : '#d97706',
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: item.isComplete
                        ? isDark
                          ? '#6ee7b7'
                          : '#059669'
                        : isDark
                        ? '#fbbf24'
                        : '#d97706',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
                  >
                    {item.status}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Información del Estudiante */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Información del Estudiante
          </Typography>

          <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: isDark
                  ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: isDark
                  ? '0 4px 20px rgba(96, 165, 250, 0.4)'
                  : '0 4px 20px rgba(59, 130, 246, 0.3)',
                animation: 'scaleIn 0.5s ease both',
                '@keyframes scaleIn': {
                  from: {
                    opacity: 0,
                    transform: 'scale(0.5)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              {iniciales}
            </Avatar>
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDark ? '#fff' : 'text.primary',
                }}
              >
                {nombreCompleto}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
              >
                Solicitante de admisión • {calcularEdad(preinscripcion.estudiante.fecha_nacimiento)}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {[
              {
                label: 'Curso Anterior',
                value: preinscripcion.estudiante.ultimo_grado_cursado || 'No especificado',
              },
              {
                label: 'Curso Solicitado',
                value: getGradoLabel(preinscripcion.estudiante.grado_solicitado),
              },
            ].map((item, idx) => (
              <Grid size={{xs:12, sm:6}} key={idx}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#f59e0b', 0.05),
                      borderColor: isDark ? alpha('#fbbf24', 0.3) : alpha('#f59e0b', 0.2),
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? alpha('#fbbf24', 0.8) : '#d97706',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#fff' : 'text.primary',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Decisión de Admisión */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Decisión de Admisión
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {decisiones.map(({ key, color, lightColor, gradient, title, desc, icon }, index) => {
              const isSelected = decisionFinal === key;

              return (
                <Paper
                  key={key}
                  elevation={0}
                  onClick={() => setDecisionFinal(key)}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: isSelected
                      ? lightColor
                      : isDark
                      ? alpha('#fff', 0.03)
                      : alpha('#000', 0.02),
                    border: `2px solid ${
                      isSelected
                        ? color
                        : isDark
                        ? alpha('#fff', 0.1)
                        : 'transparent'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                    '&:hover': {
                      transform: 'translateX(8px)',
                      borderColor: color,
                      boxShadow: isDark
                        ? `0 4px 20px ${alpha(color, 0.3)}`
                        : `0 4px 20px ${alpha(color, 0.2)}`,
                    },
                    '@keyframes slideIn': {
                      from: {
                        opacity: 0,
                        transform: 'translateX(-20px)',
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateX(0)',
                      },
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: isDark
                          ? `0 4px 15px ${alpha(color, 0.4)}`
                          : `0 4px 15px ${alpha(color, 0.3)}`,
                        transition: 'all 0.3s ease',
                        ...(isSelected && {
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }),
                      }}
                    >
                      {icon}
                    </Box>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isSelected
                            ? color
                            : isDark
                            ? '#fff'
                            : 'text.primary',
                        }}
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
                      >
                        {desc}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Justificación de la decisión o comentarios adicionales..."
            value={notasDecisionFinal}
            onChange={(e) => setNotasDecisionFinal(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                },
                '&.Mui-focused': {
                  bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#f59e0b', 0.05),
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Notificaciones Automáticas */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <NotificationsActiveIcon
              sx={{
                fontSize: 24,
                color: isDark ? '#60a5fa' : '#3b82f6',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: isDark ? '#fff' : 'text.primary',
              }}
            >
              Notificaciones Automáticas
            </Typography>
          </Box>

          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              bgcolor: isDark ? alpha('#3b82f6', 0.15) : alpha('#3b82f6', 0.1),
              border: '1px solid',
              borderColor: isDark ? alpha('#60a5fa', 0.3) : alpha('#3b82f6', 0.2),
              '& .MuiAlert-icon': {
                color: isDark ? '#60a5fa' : '#3b82f6',
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, color: isDark ? '#fff' : undefined }}>
              Se enviarán las siguientes notificaciones:
            </AlertTitle>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {[
                `Email a ${preinscripcion.tutor.email || 'el representante'} con la decisión final`,
                `SMS de confirmación al número ${preinscripcion.tutor.telefono || 'registrado'}`,
                'Actualización en el portal del estudiante',
                'Registro en el sistema de admisiones',
              ].map((text, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    color: isDark ? alpha('#fff', 0.8) : 'text.secondary',
                    animation: `fadeIn 0.5s ease ${idx * 0.1}s both`,
                    '@keyframes fadeIn': {
                      from: { opacity: 0 },
                      to: { opacity: 1 },
                    },
                  }}
                >
                  • {text}
                </Typography>
              ))}
            </Box>
          </Alert>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(1)}
              sx={{
                borderRadius: 2,
                borderWidth: 2,
                borderColor: isDark ? alpha('#6b7280', 0.5) : '#9ca3af',
                color: isDark ? '#d1d5db' : '#6b7280',
                fontWeight: 600,
                px: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: isDark ? '#d1d5db' : '#6b7280',
                  bgcolor: isDark ? alpha('#6b7280', 0.15) : alpha('#9ca3af', 0.1),
                  transform: 'translateX(-4px)',
                },
              }}
            >
              Volver
            </Button>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  borderColor: isDark ? alpha('#06b6d4', 0.5) : '#06b6d4',
                  color: isDark ? '#22d3ee' : '#0891b2',
                  fontWeight: 600,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: isDark ? '#22d3ee' : '#0891b2',
                    bgcolor: isDark ? alpha('#06b6d4', 0.15) : alpha('#06b6d4', 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 20px rgba(6, 182, 212, 0.3)'
                      : '0 8px 20px rgba(6, 182, 212, 0.2)',
                  },
                }}
              >
                Descargar Reporte
              </Button>

              <Button
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!decisionFinal || saving}
                onClick={confirmarDecision}
                sx={{
                  borderRadius: 2,
                  background: decisionFinal
                    ? isDark
                      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : undefined,
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: decisionFinal
                    ? isDark
                      ? '0 4px 15px rgba(251, 191, 36, 0.4)'
                      : '0 4px 15px rgba(245, 158, 11, 0.3)'
                    : undefined,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: decisionFinal
                      ? isDark
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                      : undefined,
                    transform: decisionFinal ? 'translateY(-2px)' : undefined,
                    boxShadow: decisionFinal
                      ? isDark
                        ? '0 8px 25px rgba(251, 191, 36, 0.5)'
                        : '0 8px 25px rgba(245, 158, 11, 0.4)'
                      : undefined,
                  },
                  '&:disabled': {
                    background: alpha('#999', 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                {saving ? 'Enviando...' : 'Confirmar y Enviar Notificación'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}