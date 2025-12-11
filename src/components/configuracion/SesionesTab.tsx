// components/configuracion/SesionesTab.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DevicesIcon from '@mui/icons-material/Devices';
import LanguageIcon from '@mui/icons-material/Language';
import configuracionService, { Sesion } from '@/services/configuracionService';

export default function SesionesTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showDialogCerrarTodas, setShowDialogCerrarTodas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    cargarSesiones();
  }, []);

  const cargarSesiones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionService.obtenerSesiones();
      setSesiones(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = async (sesionId: number) => {
    try {
      setActionLoading(sesionId);
      setError(null);
      await configuracionService.cerrarSesion(sesionId);

      setSuccess('Sesión cerrada correctamente');
      await cargarSesiones();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cerrar sesión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCerrarTodas = async () => {
    try {
      setLoading(true);
      setError(null);
      const cantidad = await configuracionService.cerrarTodasSesiones();

      setSuccess(`${cantidad} sesión${cantidad !== 1 ? 'es' : ''} cerrada${cantidad !== 1 ? 's' : ''}`);
      await cargarSesiones();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cerrar sesiones');
    } finally {
      setLoading(false);
      setShowDialogCerrarTodas(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <SmartphoneIcon sx={{ fontSize: 28 }} />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <TabletIcon sx={{ fontSize: 28 }} />;
    }
    return <ComputerIcon sx={{ fontSize: 28 }} />;
  };

  const getDeviceName = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Móvil';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Escritorio';
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Desconocido';
  };

  const formatFechaRelativa = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;

    return date.toLocaleDateString('es-BO');
  };

  if (loading && sesiones.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress 
          sx={{ 
            color: isDark ? '#facc15' : '#0288d1',
            animationDuration: '0.8s'
          }} 
          size={50}
        />
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
            '& .MuiAlert-icon': {
              color: isDark ? '#facc15' : '#0288d1'
            }
          }} 
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: isDark 
              ? `0 8px 24px ${alpha('#facc15', 0.1)}`
              : `0 8px 24px ${alpha('#0288d1', 0.1)}`,
          }
        }}
      >
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1.5}>
              <DevicesIcon sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                Sesiones Activas
              </Typography>
            </Box>
          }
          subheader="Administra los dispositivos donde has iniciado sesión"
          action={
            sesiones.length > 1 && (
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<ExitToAppIcon />}
                onClick={() => setShowDialogCerrarTodas(true)}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: `0 4px 14px ${alpha('#ef4444', 0.4)}`,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: `0 6px 20px ${alpha('#ef4444', 0.5)}`,
                  }
                }}
              >
                Cerrar Todas
              </Button>
            )
          }
          sx={{
            background: isDark
              ? alpha('#facc15', 0.05)
              : alpha('#0288d1', 0.05),
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`
          }}
        />
        <CardContent>
          {sesiones.length === 0 ? (
            <Alert 
              severity="info"
              sx={{
                borderRadius: 2,
                border: `1px solid ${isDark ? alpha('#facc15', 0.3) : alpha('#0288d1', 0.3)}`,
                backgroundColor: isDark ? alpha('#facc15', 0.1) : alpha('#0288d1', 0.1),
                '& .MuiAlert-icon': {
                  color: isDark ? '#facc15' : '#0288d1'
                }
              }}
            >
              No tienes sesiones activas en otros dispositivos
            </Alert>
          ) : (
            <Stack spacing={2}>
              {sesiones.map((sesion, index) => (
                <Box
                  key={sesion.id}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                    backgroundColor: index === 0 
                      ? (isDark 
                          ? alpha('#facc15', 0.05) 
                          : alpha('#0288d1', 0.05))
                      : (isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02)),
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                      boxShadow: isDark 
                        ? `0 4px 12px ${alpha('#facc15', 0.1)}`
                        : `0 4px 12px ${alpha('#0288d1', 0.1)}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    {/* Icono del dispositivo */}
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDark
                          ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                        color: isDark ? '#000' : '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {getDeviceIcon(sesion.user_agent)}
                    </Box>

                    {/* Información de la sesión */}
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1.5} flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {getDeviceName(sesion.user_agent)} • {getBrowserName(sesion.user_agent)}
                        </Typography>
                        {index === 0 && (
                          <Chip 
                            label="Sesión Actual" 
                            size="small"
                            sx={{
                              background: isDark
                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                              color: isDark ? '#000' : '#fff',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                      </Box>

                      <Stack spacing={1}>
                        {sesion.ip_address && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <LanguageIcon 
                              fontSize="small" 
                              sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 18 }} 
                            />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              {sesion.ip_address}
                              {sesion.ubicacion && (
                                <>
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      mx: 1, 
                                      color: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3) 
                                    }}
                                  >
                                    •
                                  </Box>
                                  {sesion.ubicacion}
                                </>
                              )}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon 
                            fontSize="small" 
                            sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 18 }} 
                          />
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Iniciada {formatFechaRelativa(sesion.created_at)}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon 
                            fontSize="small" 
                            sx={{ color: isDark ? '#facc15' : '#0288d1', fontSize: 18 }} 
                          />
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Expira {formatFechaRelativa(sesion.expires_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Botón de cerrar sesión */}
                    {index !== 0 && (
                      <Tooltip title="Cerrar sesión">
                        <IconButton
                          onClick={() => handleCerrarSesion(sesion.id)}
                          disabled={actionLoading === sesion.id}
                          sx={{
                            color: '#ef4444',
                            backgroundColor: alpha('#ef4444', 0.1),
                            border: `1px solid ${alpha('#ef4444', 0.2)}`,
                            '&:hover': {
                              backgroundColor: alpha('#ef4444', 0.2),
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {actionLoading === sesion.id ? (
                            <CircularProgress size={24} sx={{ color: '#ef4444' }} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Alert de seguridad */}
      <Box mt={3}>
        <Alert 
          severity="warning"
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
            backgroundColor: alpha('#f59e0b', 0.1),
            '& .MuiAlert-icon': {
              color: '#f59e0b'
            }
          }}
        >
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Nota de seguridad:
          </Typography>
          <Typography variant="body2">
            Si ves alguna sesión que no reconoces, ciérrala inmediatamente y considera cambiar tu contraseña.
          </Typography>
        </Alert>
      </Box>

      {/* Dialog de confirmación */}
      <Dialog 
        open={showDialogCerrarTodas} 
        onClose={() => setShowDialogCerrarTodas(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ¿Cerrar todas las sesiones?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se cerrarán todas las sesiones activas excepto la actual. Tendrás que iniciar sesión
            nuevamente en esos dispositivos.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setShowDialogCerrarTodas(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCerrarTodas} 
            variant="contained" 
            autoFocus
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: `0 4px 14px ${alpha('#ef4444', 0.4)}`,
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              }
            }}
          >
            Cerrar Todas
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}