// components/usuarios/UsuarioFormDialog.tsx
'use client';

import { useState, useEffect, Key } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Alert,
  Chip,
  OutlinedInput,
  IconButton,
  Typography,
  InputAdornment,
  alpha,
  useTheme,
  Slide,
  Collapse,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Badge,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import StarsIcon from '@mui/icons-material/Stars';
import usuariosService, { Usuario, UsuarioFormData } from '../../../services/usuariosService';
import rolesService, { Rol } from '../../../services/rolesService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export default function UsuarioFormDialog({ open, onClose, usuario, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<UsuarioFormData>({
    username: '',
    email: '',
    password: '',
    activo: true,
    rolIds: [],
  });

  useEffect(() => {
    if (open) {
      cargarRoles();
    }
  }, [open]);

  useEffect(() => {
    if (usuario) {
      const usuarioRolIds = usuario.roles?.map((r: { id: any; }) => r.id) || [];
      setFormData((prev: any) => ({
        ...prev,
        username: usuario.username,
        email: usuario.email,
        activo: usuario.activo,
        rolIds: usuarioRolIds,
      }));
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        activo: true,
        rolIds: [],
      });
    }
    setError('');
  }, [usuario, roles]);

  const cargarRoles = async () => {
    try {
      const rolesData = await rolesService.listar();
      setRoles(rolesData);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (usuario) {
        const dataToUpdate: any = {
          username: formData.username,
          email: formData.email,
          activo: formData.activo,
          rolIds: formData.rolIds,
        };
        await usuariosService.actualizar(usuario.id, dataToUpdate);
      } else {
        if (!formData.password) {
          setError('La contraseña es requerida');
          setLoading(false);
          return;
        }
        await usuariosService.crear(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  const isEditing = !!usuario;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' } as any}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          maxHeight: '90vh',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: `0 25px 50px -12px ${alpha(theme.palette.common.black, 0.4)}`,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header Espectacular */}
        <DialogTitle
          sx={{
            p: 3,
            background: isEditing
              ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.dark, 0.08)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.dark, 0.08)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Zoom in={open} style={{ transitionDelay: '100ms' }}>
                <Badge
                  badgeContent={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: isEditing ? theme.palette.warning.main : theme.palette.success.main,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.2)' },
                      },
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: isEditing
                        ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                        : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      boxShadow: `0 8px 24px ${alpha(
                        isEditing ? theme.palette.warning.main : theme.palette.success.main,
                        0.4
                      )}`,
                    }}
                  >
                    {isEditing ? <EditIcon sx={{ fontSize: 32 }} /> : <PersonAddIcon sx={{ fontSize: 32 }} />}
                  </Avatar>
                </Badge>
              </Zoom>
              <Box>
                <Typography variant="h4" fontWeight="800">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEditing ? 'Actualiza la información del usuario' : 'Completa los datos para crear la cuenta'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'rotate(90deg)',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Content con Scroll */}
        <DialogContent sx={{ p: 3, maxHeight: '60vh', overflow: 'auto' }}>
          <Collapse in={!!error}>
            <Alert
              severity="error"
              variant="filled"
              onClose={() => setError('')}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Collapse>

          <Stack spacing={3}>
            {/* Card: Información Personal */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      Información Personal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Datos básicos del usuario
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    label="Nombre de Usuario"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    fullWidth
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    label="Correo Electrónico"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    fullWidth
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {!usuario && (
                    <TextField
  label="Contraseña"
  type={showPassword ? 'text' : 'password'}
  value={formData.password}
  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
  required
  fullWidth
  disabled={loading}
  helperText="Mínimo 8 caracteres"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <LockIcon color="primary" />
      </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Card: Roles y Permisos */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 100%)`,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: theme.palette.secondary.main,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      color: theme.palette.secondary.main,
                    }}
                  >
                    <AdminPanelSettingsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      Roles y Permisos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Asigna roles al usuario
                    </Typography>
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Seleccionar Roles</InputLabel>
                  <Select
                    multiple
                    value={formData.rolIds}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rolIds: e.target.value as number[],
                      })
                    }
                    input={<OutlinedInput label="Seleccionar Roles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {selected.map((id: Key | null | undefined) => {
                          const rol = roles.find(r => r.id === id);
                          return (
                            <Chip
                              key={id}
                              label={rol?.nombre || `Rol ID ${id}`}
                              size="small"
                              icon={<StarsIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.3)}, ${alpha(theme.palette.secondary.dark, 0.2)})`,
                                border: `1.5px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    {roles.map((rol) => (
                      <MenuItem key={rol.id} value={rol.id}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {rol.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rol.descripcion}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Card: Estado de la Cuenta */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `2px solid ${formData.activo ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.grey[500], 0.3)}`,
                background: formData.activo
                  ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, transparent 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.05)} 0%, transparent 100%)`,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: formData.activo ? theme.palette.success.main : theme.palette.grey[500],
                  boxShadow: `0 8px 24px ${alpha(
                    formData.activo ? theme.palette.success.main : theme.palette.grey[500],
                    0.15
                  )}`,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: formData.activo
                          ? alpha(theme.palette.success.main, 0.15)
                          : alpha(theme.palette.grey[500], 0.15),
                        color: formData.activo ? theme.palette.success.main : theme.palette.grey[500],
                      }}
                    >
                      {formData.activo ? <CheckCircleIcon /> : <ShieldIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Estado de la Cuenta
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.activo
                          ? 'Usuario activo - Puede acceder al sistema'
                          : 'Usuario inactivo - Sin acceso al sistema'}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    disabled={loading}
                    color="success"
                    sx={{
                      '& .MuiSwitch-thumb': {
                        boxShadow: formData.activo
                          ? `0 0 12px ${alpha(theme.palette.success.main, 0.6)}`
                          : 'none',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            p: 3,
            gap: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            size="large"
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
            fullWidth
            startIcon={loading ? null : isEditing ? <EditIcon /> : <PersonAddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              background: isEditing
                ? `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              boxShadow: `0 8px 24px ${alpha(
                isEditing ? theme.palette.warning.main : theme.palette.success.main,
                0.4
              )}`,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 32px ${alpha(
                  isEditing ? theme.palette.warning.main : theme.palette.success.main,
                  0.5
                )}`,
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}