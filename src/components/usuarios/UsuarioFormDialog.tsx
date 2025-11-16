// components/usuarios/UsuarioFormDialog.tsx
'use client';

import { useState, useEffect } from 'react';
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
  Paper,
  Grow,
  Zoom,
  keyframes,
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
} from '@mui/icons-material';
import StarsIcon from '@mui/icons-material/Stars';
import usuariosService, { Usuario, UsuarioFormData } from '../../services/usuariosService';
import rolesService, { Rol } from '../../services/rolesService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
`;

export default function UsuarioFormDialog({ open, onClose, usuario, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      const usuarioRolIds = usuario.roles?.map(r => r.id) || [];
      setFormData(prev => ({
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
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' } as any}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 100px rgba(59, 130, 246, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header Ultra Moderno */}
        <DialogTitle
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            pt: 2.5,
            background: isEditing
              ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.dark, 0.08)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.dark, 0.08)} 100%)`,
            backdropFilter: 'blur(20px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: isEditing
                ? `linear-gradient(90deg, transparent, ${theme.palette.warning.main}, transparent)`
                : `linear-gradient(90deg, transparent, ${theme.palette.success.main}, transparent)`,
              animation: `${shimmer} 2s infinite`,
              backgroundSize: '1000px 100%',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Zoom in={open} style={{ transitionDelay: '100ms' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: isEditing
                    ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                    : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${alpha(
                    isEditing ? theme.palette.warning.main : theme.palette.success.main,
                    0.4
                  )}`,
                  animation: `${float} 3s ease-in-out infinite`,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: 2.5,
                    padding: '2px',
                    background: `linear-gradient(135deg, ${alpha('#fff', 0.4)}, transparent)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  },
                }}
              >
                {isEditing ? (
                  <EditIcon sx={{ color: 'white', fontSize: 24 }} />
                ) : (
                  <PersonAddIcon sx={{ color: 'white', fontSize: 24 }} />
                )}
              </Box>
            </Zoom>
            <Grow in={open} style={{ transformOrigin: '0 0 0', transitionDelay: '150ms' }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEditing ? 'Actualizar información' : 'Crear cuenta de usuario'}
                </Typography>
              </Box>
            </Grow>
          </Box>
          <IconButton 
            onClick={handleClose} 
            size="small" 
            disabled={loading}
            sx={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'rotate(90deg) scale(1.1)',
                bgcolor: alpha(theme.palette.error.main, 0.15),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5, maxHeight: '60vh', overflow: 'auto' }}>
          <Collapse in={!!error}>
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
                animation: 'shake 0.5s',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
                  '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
                },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Collapse>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Campos Compactos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre de Usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                required
                fullWidth
                disabled={loading}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon 
                        fontSize="small" 
                        sx={{ 
                          color: focusedField === 'username' ? theme.palette.primary.main : 'action',
                          transition: 'all 0.3s',
                          transform: focusedField === 'username' ? 'scale(1.2)' : 'scale(1)',
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: focusedField === 'username' 
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  },
                }}
              />

              <TextField
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                fullWidth
                disabled={loading}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon 
                        fontSize="small" 
                        sx={{ 
                          color: focusedField === 'email' ? theme.palette.primary.main : 'action',
                          transition: 'all 0.3s',
                          transform: focusedField === 'email' ? 'scale(1.2)' : 'scale(1)',
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: focusedField === 'email' 
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  },
                }}
              />

              {!usuario && (
                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  fullWidth
                  disabled={loading}
                  size="small"
                  helperText="Mínimo 8 caracteres"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon 
                          fontSize="small" 
                          sx={{ 
                            color: focusedField === 'password' ? theme.palette.primary.main : 'action',
                            transition: 'all 0.3s',
                            transform: focusedField === 'password' ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
                          }} 
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            transition: 'all 0.3s',
                            '&:hover': { 
                              transform: 'scale(1.2) rotate(15deg)',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: focusedField === 'password' 
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />
              )}
            </Box>

            {/* Roles con efecto mágico */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.03)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AdminPanelSettingsIcon fontSize="small" color="primary" sx={{ animation: `${float} 2s ease-in-out infinite` }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Roles y Permisos
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const rol = roles.find(r => r.id === id);
                        return (
                          <Chip
                            key={id}
                            label={rol?.nombre || `Rol ID ${id}`}
                            size="small"
                            icon={<StarsIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              fontWeight: 600,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.primary.dark, 0.2)})`,
                              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                              transition: 'all 0.2s',
                              animation: `${glow} 2s ease-in-out infinite`,
                              '&:hover': {
                                transform: 'translateY(-3px) scale(1.05)',
                                boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {roles.map((rol) => (
                    <MenuItem
                      key={rol.id}
                      value={rol.id}
                      sx={{
                        borderRadius: 1.5,
                        mx: 0.5,
                        my: 0.25,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        },
                      }}
                    >
                      <Box>
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
            </Box>

            {/* Estado Activo/Inactivo Ultra Moderno */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: formData.activo
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.grey[500], 0.08),
                border: `2px solid ${formData.activo
                  ? theme.palette.success.main
                  : alpha(theme.palette.grey[500], 0.3)}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: formData.activo
                  ? `0 0 30px ${alpha(theme.palette.success.main, 0.3)}`
                  : 'none',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: formData.activo
                    ? `0 0 40px ${alpha(theme.palette.success.main, 0.4)}`
                    : `0 8px 24px ${alpha(theme.palette.grey[500], 0.15)}`,
                },
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.checked })
                    }
                    disabled={loading}
                    color="success"
                    sx={{
                      '& .MuiSwitch-thumb': {
                        transition: 'all 0.3s',
                        boxShadow: formData.activo 
                          ? `0 0 20px ${alpha(theme.palette.success.main, 0.8)}`
                          : 'none',
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon
                      fontSize="small"
                      sx={{
                        color: formData.activo ? theme.palette.success.main : theme.palette.action.disabled,
                        transition: 'all 0.3s',
                        animation: formData.activo ? `${float} 2s ease-in-out infinite` : 'none',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        Usuario {formData.activo ? 'Activo' : 'Inactivo'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.activo
                          ? 'Puede acceder al sistema'
                          : 'Sin acceso al sistema'}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
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
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              borderWidth: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
            startIcon={loading ? null : isEditing ? <EditIcon /> : <PersonAddIcon />}
            sx={{
              flex: 1,
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
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover': {
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: `0 16px 32px ${alpha(
                  isEditing ? theme.palette.warning.main : theme.palette.success.main,
                  0.6
                )}`,
                '&::before': {
                  left: '100%',
                },
              },
              '&:active': {
                transform: 'translateY(-2px) scale(0.98)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditing ? (
              'Guardar Cambios'
            ) : (
              'Crear Usuario'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}