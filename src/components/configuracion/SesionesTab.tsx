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
} from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import configuracionService, { Sesion } from '@/services/configuracionService';

export default function SesionesTab() {
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
      return <SmartphoneIcon />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <TabletIcon />;
    }
    return <ComputerIcon />;
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

  if (loading && sesiones.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card>
        <CardHeader
          title="Sesiones Activas"
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
              >
                Cerrar Todas
              </Button>
            )
          }
        />
        <CardContent>
          {sesiones.length === 0 ? (
            <Alert severity="info">No tienes sesiones activas en otros dispositivos</Alert>
          ) : (
            <Stack spacing={2}>
              {sesiones.map((sesion, index) => (
                <Box
                  key={sesion.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box mt={0.5}>{getDeviceIcon(sesion.user_agent)}</Box>

                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {getDeviceName(sesion.user_agent)} - {getBrowserName(sesion.user_agent)}
                        </Typography>
                        {index === 0 && <Chip label="Sesión Actual" color="primary" size="small" />}
                      </Box>

                      <Stack spacing={0.5}>
                        {sesion.ip_address && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {sesion.ip_address}
                              {sesion.ubicacion && ` • ${sesion.ubicacion}`}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Iniciada: {new Date(sesion.created_at).toLocaleString('es-BO')}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Expira: {new Date(sesion.expires_at).toLocaleString('es-BO')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {index !== 0 && (
                      <IconButton
                        color="error"
                        onClick={() => handleCerrarSesion(sesion.id)}
                        disabled={actionLoading === sesion.id}
                      >
                        {actionLoading === sesion.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Box mt={3}>
        <Alert severity="warning">
          <strong>Nota de seguridad:</strong> Si ves alguna sesión que no reconoces, ciérrala
          inmediatamente y considera cambiar tu contraseña.
        </Alert>
      </Box>

      {/* Dialog de confirmación */}
      <Dialog open={showDialogCerrarTodas} onClose={() => setShowDialogCerrarTodas(false)}>
        <DialogTitle>¿Cerrar todas las sesiones?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se cerrarán todas las sesiones activas excepto la actual. Tendrás que iniciar sesión
            nuevamente en esos dispositivos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialogCerrarTodas(false)}>Cancelar</Button>
          <Button onClick={handleCerrarTodas} variant="contained" color="error" autoFocus>
            Cerrar Todas
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}   