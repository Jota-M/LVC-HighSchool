// components/configuracion/PerfilTab.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Typography,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import configuracionService, { Perfil } from '@/services/configuracionService';

export default function PerfilTab() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionService.obtenerPerfil();
      setPerfil(data);
      setEmail(data.email);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!email || email === perfil?.email) return;

    try {
      setSaving(true);
      setError(null);
      await configuracionService.actualizarPerfil({ email });
      
      setSuccess('Email actualizado correctamente');
      await cargarPerfil();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar email');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (!perfil) {
    return (
      <Alert severity="error">No se pudo cargar la información del perfil</Alert>
    );
  }

  const emailCambiado = email !== perfil.email;

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Información General */}
      <Card>
        <CardHeader title="Información General" subheader="Datos básicos de tu cuenta" />
        <CardContent>
          <Grid container spacing={3}>
            {/* Username */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                value={perfil.username}
                disabled
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText="El nombre de usuario no se puede cambiar"
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {emailCambiado && (
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleGuardar}
                    disabled={saving}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Estado de la Cuenta */}
      <Card>
        <CardHeader title="Estado de la Cuenta" />
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                {perfil.activo ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <CancelIcon color="error" />
                )}
                <Typography fontWeight={500}>Estado:</Typography>
              </Box>
              <Chip
                label={perfil.activo ? 'Activa' : 'Inactiva'}
                color={perfil.activo ? 'success' : 'error'}
                size="small"
              />
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                {perfil.verificado ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <CancelIcon color="warning" />
                )}
                <Typography fontWeight={500}>Email Verificado:</Typography>
              </Box>
              <Chip
                label={perfil.verificado ? 'Verificado' : 'Pendiente'}
                color={perfil.verificado ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                <Typography fontWeight={500}>Último Acceso:</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {perfil.ultimo_acceso
                  ? new Date(perfil.ultimo_acceso).toLocaleString('es-BO')
                  : 'N/A'}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                <Typography fontWeight={500}>Miembro Desde:</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {new Date(perfil.created_at).toLocaleDateString('es-BO')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader
          title="Roles Asignados"
          subheader="Los roles determinan tus permisos en el sistema"
        />
        <CardContent>
          {perfil.roles && perfil.roles.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {perfil.roles.map((rol) => (
                <Chip
                  key={rol.id}
                  label={rol.nombre}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tienes roles asignados
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}