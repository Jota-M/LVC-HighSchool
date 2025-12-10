// components/preinscripcion/revision/PasoDatosPersonales.tsx
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
  useTheme,
  alpha,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import { PreInscripcionDetalle } from '@/types/preinscripcionTypes';

interface PasoDatosPersonalesProps {
  preinscripcion: PreInscripcionDetalle;
  notasVerificacionDatos: string;
  setNotasVerificacionDatos: (notas: string) => void;
  aprobarDatos: () => Promise<void>;
  rechazar: (motivo: string) => Promise<void>;
  setActiveStep: (step: number) => void;
  saving: boolean;
}

export default function PasoDatosPersonales({
  preinscripcion,
  notasVerificacionDatos,
  setNotasVerificacionDatos,
  aprobarDatos,
  rechazar,
  setActiveStep,
  saving,
}: PasoDatosPersonalesProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  const getGradoLabel = (grado?: string | null) => {
    const grados: Record<string, string> = {
      PRE_KINDER: 'Pre-Kinder',
      KINDER: 'Kinder',
      PRIMERO_PRIMARIA: '1ro Primaria',
      SEGUNDO_PRIMARIA: '2do Primaria',
      TERCERO_PRIMARIA: '3ro Primaria',
      CUARTO_PRIMARIA: '4to Primaria',
      QUINTO_PRIMARIA: '5to Primaria',
      SEXTO_PRIMARIA: '6to Primaria',
      PRIMERO_SECUNDARIA: '1ro Secundaria',
      SEGUNDO_SECUNDARIA: '2do Secundaria',
      TERCERO_SECUNDARIA: '3ro Secundaria',
      CUARTO_SECUNDARIA: '4to Secundaria',
      QUINTO_SECUNDARIA: '5to Secundaria',
      SEXTO_SECUNDARIA: '6to Secundaria',
    };
    return grados[grado || ''] || grado || 'No especificado';
  };

  const nombreRepresentante = `${preinscripcion.tutor.nombres} ${preinscripcion.tutor.apellido_paterno} ${preinscripcion.tutor.apellido_materno || ''}`.trim();

  const criteriosVerificacion = [
    'Datos coinciden con documentos adjuntos',
    'Información de contacto verificada',
    'Relación representante-estudiante confirmada',
    'Dirección validada',
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
      ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
      : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark
      ? '0 4px 20px rgba(167, 139, 250, 0.4)'
      : '0 4px 15px rgba(139, 92, 246, 0.3)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.8 },
    },
  };

  const dataBoxStyle = {
    p: 2,
    borderRadius: 2,
    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#8b5cf6', 0.05),
      borderColor: isDark ? alpha('#a78bfa', 0.3) : alpha('#8b5cf6', 0.2),
      transform: 'translateX(4px)',
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
                <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    background: isDark
                      ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
                      : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Verificación de Datos Personales
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
                >
                  Confirmar la exactitud de la información del padre e hijo
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon />}
              label="En progreso"
              sx={{
                bgcolor: isDark ? alpha('#8b5cf6', 0.2) : alpha('#8b5cf6', 0.1),
                color: isDark ? '#c4b5fd' : '#6d28d9',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isDark ? '#c4b5fd' : '#8b5cf6',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#8b5cf6', 0.3) : alpha('#8b5cf6', 0.15),
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={66}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              '& .MuiLinearProgress-bar': {
                background: isDark
                  ? 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)'
                  : 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)',
                borderRadius: 4,
                transition: 'all 0.5s ease',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Datos del Estudiante */}
      <Card sx={{ ...cardStyle, mb: 3, mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 24,
                borderRadius: 1,
                background: isDark
                  ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              }}
            />
            Datos del Estudiante
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                label: 'Nombre Completo',
                value: `${preinscripcion.estudiante.nombres} ${preinscripcion.estudiante.apellido_paterno} ${preinscripcion.estudiante.apellido_materno || ''}`,
              },
              {
                label: 'Cédula de Identidad',
                value: preinscripcion.estudiante.ci || 'No especificada',
              },
              {
                label: 'Fecha de Nacimiento',
                value: formatearFecha(
                  preinscripcion.estudiante.fecha_nacimiento
                ),
              },
              {
                label: 'Edad',
                value: calcularEdad(
                  preinscripcion.estudiante.fecha_nacimiento
                ),
              },
              {
                label: 'Género',
                value: preinscripcion.estudiante.genero || 'No especificado',
              },
              {
                label: 'Lugar de Nacimiento',
                value:
                  preinscripcion.estudiante.lugar_nacimiento ||
                  'No especificado',
              },
              {
                label: 'Institución de Procedencia',
                value:
                  preinscripcion.estudiante.institucion_procedencia ||
                  'No especificada',
              },
              {
                label: 'Último Grado Cursado',
                value:
                  preinscripcion.estudiante.ultimo_grado_cursado ||
                  'No especificado',
              },
              {
                label: 'Grado Solicitado',
                value: getGradoLabel(
                  preinscripcion.estudiante.grado_solicitado
                ),
              },
              {
                label: 'Turno',
                value:
                  preinscripcion.estudiante.turno_solicitado ||
                  'No especificado',
              },
              {
                label: 'Teléfono',
                value: preinscripcion.estudiante.telefono || 'No especificado',
              },
              {
                label: 'Email',
                value: preinscripcion.estudiante.email || 'No especificado',
              },
            ].map((item, idx) => (
              <Grid size={{xs:12, sm:6}} key={idx}>
                <Box
                  sx={{
                    ...dataBoxStyle,
                    animation: `fadeInUp 0.5s ease ${idx * 0.05}s both`,
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
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? alpha('#a78bfa', 0.8) : '#7c3aed',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                      color: isDark ? '#fff' : 'text.primary',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}

            <Grid size={{xs:12, sm:6}}>
              <Box
                sx={{
                  ...dataBoxStyle,
                  animation: 'fadeInUp 0.5s ease 0.6s both',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: isDark ? alpha('#a78bfa', 0.8) : '#7c3aed',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}
                >
                  Dirección Completa
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color: isDark ? '#fff' : 'text.primary',
                  }}
                >
                  {preinscripcion.estudiante.direccion || 'No especificada'},{' '}
                  {preinscripcion.estudiante.zona || ''},{' '}
                  {preinscripcion.estudiante.ciudad || ''}
                </Typography>
              </Box>
            </Grid>

            {preinscripcion.estudiante.tiene_discapacidad && (
              <Grid size={{xs:12, sm:6}}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.1),
                    border: '2px solid',
                    borderColor: isDark ? alpha('#fbbf24', 0.4) : '#f59e0b',
                    animation: 'fadeInUp 0.5s ease 0.7s both',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#fbbf24' : '#d97706',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                    }}
                  >
                    Discapacidad
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                      color: isDark ? '#fef3c7' : '#92400e',
                    }}
                  >
                    {preinscripcion.estudiante.tipo_discapacidad ||
                      'Sin descripción'}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Datos del Representante */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 24,
                borderRadius: 1,
                background: isDark
                  ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              }}
            />
            Datos del {preinscripcion.tutor.tipo_representante || 'Representante'}
          </Typography>

          <Grid container spacing={3}>
            {[
              { label: 'Nombre Completo', value: nombreRepresentante },
              {
                label: 'Cédula de Identidad',
                value: preinscripcion.tutor.ci || 'No especificada',
              },
              {
                label: 'Teléfono',
                value: preinscripcion.tutor.telefono || 'No especificado',
              },
              {
                label: 'Email',
                value: preinscripcion.tutor.email || 'No especificado',
              },
              {
                label: 'Ocupación',
                value: preinscripcion.tutor.ocupacion || 'No especificada',
              },
              {
                label: 'Lugar de Trabajo',
                value: preinscripcion.tutor.lugar_trabajo || 'No especificado',
              },
            ].map((item, idx) => (
              <Grid size={{xs:12, sm:6}} key={idx}>
                <Box
                  sx={{
                    ...dataBoxStyle,
                    animation: `fadeInUp 0.5s ease ${idx * 0.05}s both`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? alpha('#a78bfa', 0.8) : '#7c3aed',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
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

      {/* Criterios de Verificación */}
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
            Verificación de Consistencia
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {criteriosVerificacion.map((criterio, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? alpha('#10b981', 0.15) : alpha('#10b981', 0.1),
                  border: '2px solid',
                  borderColor: isDark ? alpha('#10b981', 0.3) : '#10b981',
                  transition: 'all 0.3s ease',
                  animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                  '&:hover': {
                    bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.15),
                    transform: 'translateX(8px)',
                    boxShadow: isDark
                      ? '0 4px 15px rgba(16, 185, 129, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.2)',
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
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isDark
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: isDark
                      ? '0 2px 10px rgba(16, 185, 129, 0.4)'
                      : '0 2px 10px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontWeight: 500,
                    color: isDark ? '#d1fae5' : '#065f46',
                  }}
                >
                  {criterio}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Notas y Acciones */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Notas de Verificación:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Agrega observaciones sobre la verificación de datos personales..."
            value={notasVerificacionDatos}
            onChange={(e) => setNotasVerificacionDatos(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                },
                '&.Mui-focused': {
                  bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#8b5cf6', 0.05),
                },
              },
            }}
          />

          <Divider sx={{ my: 3, borderColor: isDark ? alpha('#fff', 0.1) : undefined }} />

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
              onClick={() => setActiveStep(0)}
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
                variant="contained"
                startIcon={<CancelIcon />}
                onClick={() => rechazar(notasVerificacionDatos)}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  background: isDark
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: isDark
                    ? '0 4px 15px rgba(239, 68, 68, 0.4)'
                    : '0 4px 15px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                      : 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 25px rgba(239, 68, 68, 0.5)'
                      : '0 8px 25px rgba(220, 38, 38, 0.4)',
                  },
                  '&:disabled': {
                    background: alpha('#999', 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                Rechazar
              </Button>
              <Button
                variant="contained"
                startIcon={<TaskAltIcon />}
                onClick={aprobarDatos}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  background: isDark
                    ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: isDark
                    ? '0 4px 15px rgba(167, 139, 250, 0.4)'
                    : '0 4px 15px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                      : 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 25px rgba(167, 139, 250, 0.5)'
                      : '0 8px 25px rgba(139, 92, 246, 0.4)',
                  },
                  '&:disabled': {
                    background: alpha('#999', 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                {saving ? 'Aprobando...' : 'Aprobar y Continuar'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}