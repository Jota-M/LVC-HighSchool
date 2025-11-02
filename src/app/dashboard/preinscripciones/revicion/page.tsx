'use client';
import '@fontsource/roboto';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  Chip,
  Stack,
  Paper,
  Divider,
  useTheme,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { keyframes } from '@mui/system';
import { useState } from 'react';

/* ---------------------- ANIMACIONES ---------------------- */
const fadeInDown = keyframes`
  0% { opacity: 0; transform: translateY(-30px) scale(0.98); filter: blur(6px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
`;
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); filter: blur(6px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
`;
const fadeInLeft = keyframes`
  0% { opacity: 0; transform: translateX(-30px); }
  100% { opacity: 1; transform: translateX(0); }
`;
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;
const pulse = keyframes`
  0% { transform: scale(1); opacity: .9; }
  50% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: .9; }
`;
const glow = keyframes`
  0% { box-shadow: 0 0 0 rgba(0,0,0,0); }
  50% { box-shadow: 0 6px 30px rgba(2,136,209,0.12); }
  100% { box-shadow: 0 0 0 rgba(0,0,0,0); }
`;
const slowRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ---------------------- COMPONENTE PRINCIPAL ---------------------- */
export default function Page() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hovered, setHovered] = useState(false);
  const [completionProgress] = useState(75);

  const headerBg = isDark
    ? 'linear-gradient(135deg, rgba(250,204,21,0.06), rgba(255,255,255,0.02))'
    : theme.palette.background.paper;
  const avatarBg = isDark ? '#facc15' : theme.palette.primary.main;
  const avatarColor = isDark ? '#0b2338' : '#fff';

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        transition: 'background .5s cubic-bezier(0.4, 0, 0.2, 1), color .5s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(circle at 10% 20%, rgba(2,136,209,0.04), transparent 12%), radial-gradient(circle at 90% 80%, rgba(250,204,21,0.04), transparent 12%)'
            : 'radial-gradient(circle at 10% 20%, rgba(2,136,209,0.05), transparent 12%), radial-gradient(circle at 90% 80%, rgba(46,125,50,0.04), transparent 12%)',
          backgroundSize: '200% 200%',
          animation: `${gradientMove} 25s linear infinite`,
          backdropFilter: 'blur(0.5px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderRadius: '50%',
          right: 0,
          top: 0,
          width: '600px',
          height: '600px',
          zIndex: 0,
          opacity: 0.05,
          background: isDark
            ? 'radial-gradient(circle at 30% 30%, rgba(250,204,21,0.25), transparent 60%)'
            : 'radial-gradient(circle at 30% 30%, rgba(1,87,155,0.25), transparent 60%)',
          animation: `${slowRotate} 45s linear infinite`,
        },
      }}
    >
      {/* HEADER */}
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position: 'relative',
          zIndex: 2,
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 4,
          bgcolor: headerBg,
          border: `2px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(1,87,155,0.08)'}`,
          backdropFilter: 'blur(8px)',
          overflow: 'hidden',
          transformOrigin: 'center',
          animation: `${fadeInDown} 700ms cubic-bezier(.2,.9,.3,1) forwards`,
          transition: 'transform .45s cubic-bezier(0.4, 0, 0.2, 1), box-shadow .45s cubic-bezier(0.4, 0, 0.2, 1), border-color .3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isDark
              ? '0 25px 60px rgba(250,204,21,0.12)'
              : '0 25px 60px rgba(1,87,155,0.12)',
            borderColor: isDark ? '#facc15' : '#0288d1',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background:
              'linear-gradient(90deg, rgba(1,87,155,1) 0%, rgba(2,136,209,1) 50%, rgba(250,204,21,1) 100%)',
            backgroundSize: '200% 100%',
            animation: hovered ? `${shimmer} 2s linear infinite` : `${gradientMove} 6s linear infinite`,
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 2 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box position="relative">
              <Box
                sx={{
                  position: 'absolute',
                  width: { xs: 60, md: 80 },
                  height: { xs: 60, md: 80 },
                  borderRadius: '50%',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(250,204,21,0.22), transparent 50%)'
                    : 'radial-gradient(circle, rgba(2,136,209,0.18), transparent 50%)',
                  animation: `${pulse} 3.2s ease-in-out infinite`,
                  top: -6,
                  left: -6,
                }}
              />
              <Avatar
                sx={{
                  width: { xs: 60, md: 80 },
                  height: { xs: 60, md: 80 },
                  bgcolor: avatarBg,
                  color: avatarColor,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  zIndex: 2,
                  border: `2px solid ${isDark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: '0 6px 18px rgba(2,136,209,0.08)',
                  transition: 'transform .3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { transform: 'scale(1.06) rotate(-6deg)' },
                }}
              >
                AP
              </Avatar>
            </Box>

            <Box flex={1}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  background: isDark
                    ? 'linear-gradient(90deg, #facc15, #ffd54f, #facc15)'
                    : 'linear-gradient(90deg, #01579b, #0288d1, #01579b)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientMove} 6s linear infinite`,
                }}
              >
                Ana María Pérez Morales
              </Typography>

              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Nº Referencia: <b>PREI-2024-001234</b> — 10mo Año EGB
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Recibido: 15 Enero 2024, 14:30
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title="Imprimir">
              <IconButton size="small" sx={{ transition: 'all .2s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compartir">
              <IconButton size="small" sx={{ transition: 'all .2s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Más opciones">
              <IconButton size="small" sx={{ transition: 'all .2s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Badges de estado */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip 
            label="NUEVA - SIN ASIGNAR" 
            color="warning" 
            size="small"
            sx={{ 
              fontWeight: 700,
              transition: 'transform .2s ease',
              '&:hover': { transform: 'scale(1.05)' }
            }} 
          />
          <Chip 
            label="PRIORIDAD NORMAL" 
            color="info" 
            size="small"
            sx={{ 
              fontWeight: 700,
              transition: 'transform .2s ease',
              '&:hover': { transform: 'scale(1.05)' }
            }} 
          />
        </Stack>
      </Box>

      {/* BARRA DE PROGRESO */}
      {/* <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          position: 'relative',
          zIndex: 2,
          animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 100ms`,
          opacity: 0,
          transition: 'box-shadow .3s ease, transform .3s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 12px 30px rgba(250,204,21,0.08)'
              : '0 12px 30px rgba(1,87,155,0.08)',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight="bold">
            Progreso de Completitud
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {completionProgress}%
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={completionProgress} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            transition: 'all .5s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiLinearProgress-bar': {
              transition: 'transform .5s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          }} 
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
          Falta completar documentación médica y certificado de conducta
        </Typography>
      </Paper> */}

      {/* CONTENIDO */}
      
      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
        {/* Información Detallada del Estudiante */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 600ms`,
              opacity: 0,
              transition: 'box-shadow .3s ease, transform .3s ease',
              '&:hover': {
                boxShadow: isDark
                  ? '0 12px 30px rgba(250,204,21,0.08)'
                  : '0 12px 30px rgba(1,87,155,0.08)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <PersonIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold">
                Información Detallada del Estudiante
              </Typography>
            </Stack>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body1" fontWeight="medium">15/03/2011</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Lugar de Nacimiento</Typography>
                <Typography variant="body1" fontWeight="medium">Potosí, Bolivia</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Cédula de Identidad</Typography>
                <Typography variant="body1" fontWeight="medium">9876543 PT</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Género</Typography>
                <Typography variant="body1" fontWeight="medium">Femenino</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Dirección</Typography>
                <Typography variant="body1" fontWeight="medium">Av. Civic Nº 123, Zona Central</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                <Typography variant="body1" fontWeight="medium">+591 2 6234567</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <FamilyRestroomIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold">
                Información de Representantes
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Representante Legal</Typography>
                <Typography variant="body1" fontWeight="medium">María Teresa Morales Vda. de Pérez</Typography>
                <Typography variant="caption" color="text.secondary">Madre • CI: 5432167 PT</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Contacto</Typography>
                <Typography variant="body1" fontWeight="medium">+591 70123456</Typography>
                <Typography variant="caption" color="text.secondary">maria.morales@email.com</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Documentos Adjuntos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 800ms`,
              opacity: 0,
              transition: 'box-shadow .3s ease, transform .3s ease',
              '&:hover': {
                boxShadow: isDark
                  ? '0 12px 30px rgba(250,204,21,0.08)'
                  : '0 12px 30px rgba(1,87,155,0.08)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <DescriptionIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold">
                Documentos
              </Typography>
            </Stack>

            <List dense>
              {[
                { name: 'Certificado de Nacimiento', status: 'complete' },
                { name: 'Cédula de Identidad', status: 'complete' },
                { name: 'Libreta de Calificaciones', status: 'complete' },
                { name: 'Certificado Médico', status: 'pending' },
                { name: 'Certificado de Conducta', status: 'pending' },
                { name: 'Fotografía 3x3', status: 'complete' },
              ].map((doc, i) => (
                <ListItem 
                  key={i}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all .2s ease',
                    '&:hover': { 
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemIcon>
                    {doc.status === 'complete' ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <WarningAmberIcon color="warning" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={doc.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  {doc.status === 'complete' && (
                    <IconButton 
                      size="small"
                      sx={{
                        transition: 'transform .2s ease',
                        '&:hover': { transform: 'scale(1.15)' }
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ 
                mt: 2,
                transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
              }}
            >
              Descargar Todos
            </Button>
          </Paper>
        </Grid>
        {/* Vista Rápida */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 200ms`,
              opacity: 0,
              transition: 'box-shadow .3s ease, transform .3s ease',
              '&:hover': {
                boxShadow: isDark
                  ? '0 12px 30px rgba(250,204,21,0.08)'
                  : '0 12px 30px rgba(1,87,155,0.08)',
                transform: 'translateY(-3px)',
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Vista Rápida de la Solicitud
            </Typography>
            <Stack spacing={1.5}>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <CheckCircleIcon color="success" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                <Typography>Información Personal</Typography>
              </Stack>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <CheckCircleIcon color="success" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                <Typography>Información de Representantes</Typography>
              </Stack>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <WarningAmberIcon color="warning" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2) rotate(15deg)' } }} />
                <Typography>Documentos Adjuntados</Typography>
              </Stack>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <CheckCircleIcon color="success" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                <Typography>Información de Contacto</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
              <Button 
                variant="outlined" 
                color="inherit"
                sx={{
                  transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssignmentTurnedInIcon />}
                sx={{
                  transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
                }}
              >
                Iniciar Revisión
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Evaluación Inicial */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 400ms`,
              opacity: 0,
              transition: 'box-shadow .3s ease, transform .3s ease',
              '&:hover': {
                boxShadow: isDark
                  ? '0 12px 30px rgba(250,204,21,0.08)'
                  : '0 12px 30px rgba(1,87,155,0.08)',
                transform: 'translateY(-3px)',
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Evaluación Inicial
            </Typography>
            <Stack spacing={1.5}>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <CheckCircleIcon color="success" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                <Typography>Grado Disponible — 9 cupos</Typography>
              </Stack>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <CheckCircleIcon color="success" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                <Typography>Edad Apropiada — 13 años</Typography>
              </Stack>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <CheckCircleIcon color="success" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                <Typography>Documentos Básicos Completos</Typography>
              </Stack>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1}
                sx={{
                  transition: 'transform .2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}
              >
                <WarningAmberIcon color="warning" sx={{ transition: 'transform .2s ease', '&:hover': { transform: 'scale(1.2) rotate(15deg)' } }} />
                <Typography>Verificación Pendiente</Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? '#102f4d' : '#E3F2FD',
                transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `${glow} 3.2s ease-in-out infinite`,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: isDark ? '0 8px 24px rgba(2,136,209,0.2)' : '0 8px 24px rgba(1,87,155,0.15)',
                }
              }}
            >
              <Typography fontWeight="bold" color="primary">
                Evaluación de Riesgo: BAJO
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                • Sin antecedentes disciplinarios reportados <br />
                • Información consistente en toda la aplicación <br />
                • No hay alertas del sistema
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 1200ms`,
              opacity: 0,
              transition: 'box-shadow .3s ease',
              background: isDark 
                ? 'linear-gradient(135deg, rgba(2,136,209,0.05), rgba(250,204,21,0.03))'
                : 'linear-gradient(135deg, rgba(2,136,209,0.08), rgba(250,204,21,0.05))',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <AutoAwesomeIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold">
                Acciones Rápidas
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {[
                {
                  title: 'Aceptar Solicitud',
                  description: 'Aprobar y continuar con el proceso',
                  icon: <CheckCircleIcon />,
                  color: 'success',
                },
                {
                  title: 'Solicitar Información',
                  description: 'Pedir documentos o datos adicionales',
                  icon: <ContactMailIcon />,
                  color: 'info',
                },
                {
                  title: 'Programar Entrevista',
                  description: 'Agendar reunión con representantes',
                  icon: <AssessmentIcon />,
                  color: 'primary',
                },
                {
                  title: 'Rechazar Solicitud',
                  description: 'Denegar el proceso de inscripción',
                  icon: <WarningAmberIcon />,
                  color: 'error',
                },
              ].map((action, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `2px solid transparent`,
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: isDark
                          ? '0 16px 40px rgba(250,204,21,0.15)'
                          : '0 16px 40px rgba(2,136,209,0.15)',
                        borderColor: 'red',
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          mb: 2,
                          color: 'red',
                          transition: 'transform .3s ease',
                          '&:hover': { transform: 'scale(1.2) rotate(5deg)' },
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Alertas y Notificaciones */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              animation: `${fadeInUp} 700ms cubic-bezier(.2,.9,.3,1) forwards 1400ms`,
              opacity: 0,
            }}
          >
            <Alert 
              severity="info" 
              icon={<AutoAwesomeIcon />}
              sx={{
                borderRadius: 3,
                transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark ? '0 8px 24px rgba(2,136,209,0.2)' : '0 8px 24px rgba(2,136,209,0.15)',
                }
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                <strong>Sugerencia del Sistema:</strong> Esta solicitud cumple con todos los requisitos básicos. 
                Se recomienda programar una entrevista con los representantes en los próximos 3 días hábiles.
              </Typography>
            </Alert>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}