// pages/CursosVacacionales/InscripcionDetalle.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  useTheme,
  Fade,
  keyframes,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  School,
  Phone,
  Email,
  CalendarMonth,
  AttachMoney,
  Edit,
  CheckCircle,
  Cancel,
  Description,
  VerifiedUser,
  PersonAdd,
  Badge,
  Wc,
  Image as ImageIcon,
  HourglassEmpty,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useInscripcionVacacional, useInscripcionesVacacionales } from '@/hooks/useCursosVacacionales';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EstadoInscripcionVacacional } from '@/types/cursoVacacionalTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const InscripcionDetalle: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isDark = theme.palette.mode === 'dark';
  const inscripcionId = params?.id ? parseInt(params.id as string) : null;

  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoInscripcionVacacional>('pendiente');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Hooks
  const { inscripcion, isLoading } = useInscripcionVacacional(inscripcionId);
  const { verificarPago, cambiarEstado, isVerificandoPago, isCambiandoEstado } = useInscripcionesVacacionales();

  const handleBack = () => {
    router.push('/dashboard/cursos-vacacionales/inscripciones');
  };

  const handleVerificarPago = () => {
    if (inscripcionId) {
      verificarPago(inscripcionId);
    }
  };

  const handleOpenEstadoDialog = () => {
    setNuevoEstado(inscripcion?.estado || 'pendiente');
    setMotivoRechazo('');
    setEstadoDialogOpen(true);
  };

  const handleCambiarEstado = () => {
    if (inscripcionId) {
      cambiarEstado({
        id: inscripcionId,
        data: {
          estado: nuevoEstado,
          motivo_rechazo: nuevoEstado === 'rechazado' ? motivoRechazo : undefined,
        },
      });
      setEstadoDialogOpen(false);
    }
  };

  const handleVerComprobante = () => {
    if (inscripcion?.comprobante_pago_url) {
      window.open(inscripcion.comprobante_pago_url, '_blank');
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd 'de' MMMM 'de' yyyy");
    } catch {
      return fecha;
    }
  };

  const formatFechaCorta = (fecha: string) => {
    try {
      return format(new Date(fecha), 'dd/MM/yyyy');
    } catch {
      return fecha;
    }
  };

  const getEstadoConfig = (estado: EstadoInscripcionVacacional) => {
    const configs = {
      pendiente: { color: '#f59e0b', label: 'Pendiente', icon: <Cancel /> },
      pago_verificado: { color: '#3b82f6', label: 'Pago Verificado', icon: <CheckCircle /> },
      activo: { color: '#10b981', label: 'Activo', icon: <School /> },
      completado: { color: '#8b5cf6', label: 'Completado', icon: <CheckCircle /> },
      retirado: { color: '#6b7280', label: 'Retirado', icon: <Cancel /> },
      rechazado: { color: '#ef4444', label: 'Rechazado', icon: <Cancel /> },
    };
    return configs[estado] || configs.pendiente;
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography>Cargando...</Typography>
        </Container>
      </Box>
    );
  }

  if (!inscripcion) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography>Inscripción no encontrada</Typography>
        </Container>
      </Box>
    );
  }

  const estadoConfig = getEstadoConfig(inscripcion.estado);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                mb: 2,
                color: isDark ? '#facc15' : '#0288d1',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                },
              }}
            >
              Volver a Inscripciones
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PersonAdd
                sx={{
                  color: isDark ? '#facc15' : '#0288d1',
                  fontSize: 36,
                  animation: `${bounce} 1.5s infinite`,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Detalle de Inscripción
              </Typography>
            </Box>

            {/* Info Card Header */}
            <Card
              sx={{
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(estadoConfig.color, 0.3)}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: alpha(estadoConfig.color, 0.2),
                      color: estadoConfig.color,
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {inscripcion.nombres.charAt(0)}
                    {inscripcion.apellido_paterno.charAt(0)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {inscripcion.nombres} {inscripcion.apellido_paterno}{' '}
                      {inscripcion.apellido_materno}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={inscripcion.codigo_inscripcion}
                        size="small"
                        sx={{
                          bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={estadoConfig.icon}
                        label={estadoConfig.label}
                        sx={{
                          bgcolor: alpha(estadoConfig.color, 0.1),
                          color: estadoConfig.color,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: estadoConfig.color,
                          },
                        }}
                      />
                      {inscripcion.pago_verificado && (
                        <Chip
                          icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                          label="Pago Verificado"
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                              color: '#10b981',
                            },
                          }}
                        />
                      )}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    {inscripcion.comprobante_pago_url && (
                      <Tooltip title="Ver Comprobante">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleVerComprobante}
                          startIcon={<ImageIcon />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#3b82f6',
                            color: '#3b82f6',
                            '&:hover': {
                              borderColor: '#2563eb',
                              bgcolor: alpha('#3b82f6', 0.1),
                            },
                          }}
                        >
                          Ver Comprobante
                        </Button>
                      </Tooltip>
                    )}
                    {!inscripcion.pago_verificado && (
                      <Tooltip title="Verificar Pago">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleVerificarPago}
                          disabled={isVerificandoPago}
                          startIcon={<CheckCircle />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#10b981',
                            '&:hover': {
                              bgcolor: '#059669',
                            },
                          }}
                        >
                          Verificar Pago
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip title="Cambiar Estado">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleOpenEstadoDialog}
                        disabled={isCambiandoEstado}
                        startIcon={<Edit />}
                        sx={{
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          background: isDark
                            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                          color: isDark ? '#000' : '#fff',
                          '&:hover': {
                            opacity: 0.9,
                          },
                        }}
                      >
                        Cambiar Estado
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Fade>

        {/* Detalles */}
        <Grid container spacing={3}>
          {/* Datos del Estudiante */}
          <Grid size={{xs:12, md:6}}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#3b82f6', 0.1),
                      color: '#3b82f6',
                    }}
                  >
                    <Person />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Datos del Estudiante
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Badge sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        NOMBRE COMPLETO
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {inscripcion.nombres} {inscripcion.apellido_paterno}{' '}
                      {inscripcion.apellido_materno}
                    </Typography>
                  </Box>

                  {inscripcion.ci && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        CARNET DE IDENTIDAD
                      </Typography>
                      <Typography variant="body1">{inscripcion.ci}</Typography>
                    </Box>
                  )}

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        FECHA DE NACIMIENTO
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {formatFecha(inscripcion.fecha_nacimiento)}
                    </Typography>
                  </Box>

                  {inscripcion.genero && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Wc sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          GÉNERO
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {inscripcion.genero}
                      </Typography>
                    </Box>
                  )}

                  {inscripcion.telefono && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          TELÉFONO
                        </Typography>
                      </Box>
                      <Typography variant="body1">{inscripcion.telefono}</Typography>
                    </Box>
                  )}

                  {inscripcion.email && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          EMAIL
                        </Typography>
                      </Box>
                      <Typography variant="body1">{inscripcion.email}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Datos del Tutor */}
          <Grid size={{xs:12, md:6}}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#10b981', 0.1),
                      color: '#10b981',
                    }}
                  >
                    <PersonAdd />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Datos del Tutor
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      NOMBRE DEL TUTOR
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {inscripcion.nombre_tutor}
                    </Typography>
                  </Box>

                  {inscripcion.parentesco_tutor && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        PARENTESCO
                      </Typography>
                      <Typography variant="body1">{inscripcion.parentesco_tutor}</Typography>
                    </Box>
                  )}

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        TELÉFONO
                      </Typography>
                    </Box>
                    <Typography variant="body1">{inscripcion.telefono_tutor}</Typography>
                  </Box>

                  {inscripcion.email_tutor && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          EMAIL
                        </Typography>
                      </Box>
                      <Typography variant="body1">{inscripcion.email_tutor}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del Curso */}
          <Grid size={{xs:12, md:6}}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#f59e0b', 0.1),
                      color: '#f59e0b',
                    }}
                  >
                    <School />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Información del Curso
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      CURSO
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {inscripcion.curso_nombre}
                    </Typography>
                    {inscripcion.curso_codigo && (
                      <Typography variant="caption" color="text.secondary">
                        Código: {inscripcion.curso_codigo}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      PERIODO
                    </Typography>
                    <Typography variant="body1">{inscripcion.periodo_nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inscripcion.periodo_tipo === 'verano' ? '☀️ Verano' : '❄️ Invierno'}
                    </Typography>
                  </Box>

                  {inscripcion.curso_fecha_inicio && inscripcion.curso_fecha_fin && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          FECHAS DEL CURSO
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        Del {formatFechaCorta(inscripcion.curso_fecha_inicio)} al{' '}
                        {formatFechaCorta(inscripcion.curso_fecha_fin)}
                      </Typography>
                    </Box>
                  )}

                  {inscripcion.curso_dias_semana && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        DÍAS DE CLASE
                      </Typography>
                      <Typography variant="body2">{inscripcion.curso_dias_semana}</Typography>
                    </Box>
                  )}

                  {inscripcion.curso_hora_inicio && inscripcion.curso_hora_fin && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        HORARIO
                      </Typography>
                      <Typography variant="body2">
                        {inscripcion.curso_hora_inicio.slice(0, 5)} -{' '}
                        {inscripcion.curso_hora_fin.slice(0, 5)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Información de Pago */}
          <Grid size={{xs:12, md:6}}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#10b981', 0.1),
                      color: '#10b981',
                    }}
                  >
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Información de Pago
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      MONTO PAGADO
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                      Bs.{' '}
                      {inscripcion.monto_pagado.toLocaleString('es-BO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>

                  {inscripcion.numero_comprobante && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        N° COMPROBANTE
                      </Typography>
                      <Typography variant="body1">{inscripcion.numero_comprobante}</Typography>
                    </Box>
                  )}

                  {inscripcion.fecha_pago && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        FECHA DE PAGO
                      </Typography>
                      <Typography variant="body1">
                        {formatFechaCorta(inscripcion.fecha_pago)}
                      </Typography>
                    </Box>
                  )}

                  {inscripcion.comprobante_pago_url && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        COMPROBANTE DE PAGO
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: '12px',
                          border: `2px dashed ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.1)}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            bgcolor: alpha('#3b82f6', 0.05),
                          },
                        }}
                        onClick={handleVerComprobante}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha('#3b82f6', 0.1),
                              color: '#3b82f6',
                            }}
                          >
                            <ImageIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Comprobante adjunto
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Haz clic para ver el comprobante de pago
                            </Typography>
                          </Box>
                          <Chip
                            label="Ver"
                            size="small"
                            sx={{
                              bgcolor: alpha('#3b82f6', 0.1),
                              color: '#3b82f6',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ESTADO DEL PAGO
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {inscripcion.pago_verificado ? (
                        <Chip
                          icon={<VerifiedUser />}
                          label="Pago Verificado"
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: '#10b981',
                            },
                          }}
                        />
                      ) : (
                        <Chip
                          label="Pendiente de Verificación"
                          sx={{
                            bgcolor: alpha('#f59e0b', 0.1),
                            color: '#f59e0b',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {inscripcion.verificado_por_username && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        VERIFICADO POR
                      </Typography>
                      <Typography variant="body2">
                        {inscripcion.verificado_por_username}
                      </Typography>
                      {inscripcion.fecha_verificacion && (
                        <Typography variant="caption" color="text.secondary">
                          el {formatFechaCorta(inscripcion.fecha_verificacion)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Observaciones y Estados */}
          {(inscripcion.observaciones || inscripcion.motivo_rechazo) && (
            <Grid size={{xs:12}}>
              <Card
                sx={{
                  borderRadius: '20px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha('#6b7280', 0.1),
                        color: '#6b7280',
                      }}
                    >
                      <Description />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Notas Adicionales
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {inscripcion.observaciones && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          OBSERVACIONES
                        </Typography>
                        <Typography variant="body2">{inscripcion.observaciones}</Typography>
                      </Box>
                    )}

                    {inscripcion.motivo_rechazo && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef4444' }}>
                          MOTIVO DE RECHAZO
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ef4444' }}>
                          {inscripcion.motivo_rechazo}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Información de Registro */}
          <Grid size={{xs:12}}>
            <Card
              sx={{
                borderRadius: '20px',
                background: isDark
                  ? alpha('#fff', 0.03)
                  : alpha('#000', 0.02),
                border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      FECHA DE INSCRIPCIÓN
                    </Typography>
                    <Typography variant="body2">
                      {formatFecha(inscripcion.created_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ÚLTIMA ACTUALIZACIÓN
                    </Typography>
                    <Typography variant="body2">
                      {formatFecha(inscripcion.updated_at)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog de Cambio de Estado */}
      <Dialog
        open={estadoDialogOpen}
        onClose={() => setEstadoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Cambiar Estado de Inscripción
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 2, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02) }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Estado actual:</strong> {getEstadoConfig(inscripcion?.estado || 'pendiente').label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {inscripcion?.nombres} {inscripcion?.apellido_paterno}
            </Typography>
          </Box>

          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Nuevo Estado"
              fullWidth
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoInscripcionVacacional)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            >
              <MenuItem value="pendiente">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HourglassEmpty sx={{ fontSize: 18, color: '#f59e0b' }} />
                  <span>Pendiente - En espera de verificación</span>
                </Box>
              </MenuItem>
              <MenuItem value="pago_verificado">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#3b82f6' }} />
                  <span>Pago Verificado - Pago confirmado</span>
                </Box>
              </MenuItem>
              <MenuItem value="activo">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School sx={{ fontSize: 18, color: '#10b981' }} />
                  <span>Activo - Cursando actualmente</span>
                </Box>
              </MenuItem>
              <MenuItem value="completado">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#8b5cf6' }} />
                  <span>Completado - Finalizó el curso</span>
                </Box>
              </MenuItem>
              <MenuItem value="retirado">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel sx={{ fontSize: 18, color: '#6b7280' }} />
                  <span>Retirado - Abandonó el curso</span>
                </Box>
              </MenuItem>
              <MenuItem value="rechazado">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel sx={{ fontSize: 18, color: '#ef4444' }} />
                  <span>Rechazado - Inscripción rechazada</span>
                </Box>
              </MenuItem>
            </TextField>

            {nuevoEstado === 'rechazado' && (
              <TextField
                label="Motivo del Rechazo"
                fullWidth
                multiline
                rows={3}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Especifique el motivo del rechazo..."
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            )}

            {/* Ayuda visual de flujo de estados */}
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#3b82f6', 0.05), border: `1px solid ${alpha('#3b82f6', 0.2)}` }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#3b82f6', mb: 1, display: 'block' }}>
                📋 Flujo recomendado:
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                1. <strong>Pendiente</strong> → Inscripción recibida
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                2. <strong>Pago Verificado</strong> → Confirmar pago
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                3. <strong>Activo</strong> → Estudiante cursando
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                4. <strong>Completado</strong> → Finalizó exitosamente
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setEstadoDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarEstado}
            variant="contained"
            disabled={isCambiandoEstado || (nuevoEstado === 'rechazado' && !motivoRechazo.trim())}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            {isCambiandoEstado ? 'Cambiando...' : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InscripcionDetalle;