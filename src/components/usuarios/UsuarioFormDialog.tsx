// components/usuarios/UsuarioFormDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Alert,
  Chip,
  OutlinedInput,
  Typography,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
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
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario, UsuarioFormData } from '../../services/usuariosService';
import rolesService, { Rol } from '../../services/rolesService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export default function UsuarioFormDialog({ open, onClose, usuario, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEditing = !!usuario;

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

  // ── tokens ──────────────────────────────────────────────────────────────────
  const brand = isEditing
    ? (isDark ? '#fbbf24' : '#d97706')   // amber para edición
    : (isDark ? '#34d399' : '#059669');   // green para creación

  const brandDim = isEditing
    ? (isDark ? 'rgba(251,191,36,0.10)' : 'rgba(217,119,6,0.07)')
    : (isDark ? 'rgba(52,211,153,0.10)' : 'rgba(5,150,105,0.07)');

  const brandBorder = isEditing
    ? (isDark ? 'rgba(251,191,36,0.28)' : 'rgba(217,119,6,0.22)')
    : (isDark ? 'rgba(52,211,153,0.28)' : 'rgba(5,150,105,0.22)');

  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const R = '12px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}` },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  // ── efectos ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) cargarRoles();
  }, [open]);

  useEffect(() => {
    if (usuario) {
      setFormData(prev => ({
        ...prev,
        username: usuario.username,
        email: usuario.email,
        activo: usuario.activo,
        rolIds: usuario.roles?.map(r => r.id) || [],
      }));
    } else {
      setFormData({ username: '', email: '', password: '', activo: true, rolIds: [] });
    }
    setError('');
  }, [usuario, roles]);

  const cargarRoles = async () => {
    try {
      const data = await rolesService.listar();
      setRoles(data);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (usuario) {
        await usuariosService.actualizar(usuario.id, {
          username: formData.username,
          email: formData.email,
          activo: formData.activo,
          rolIds: formData.rolIds,
        });
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
    if (!loading) { setError(''); onClose(); }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px ${alpha(brand, 0.06)}, 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.14)`,
        },
      }}
    >
      <form onSubmit={handleSubmit}>

        {/* ── HEADER ── */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.5,
              }}>
                Administración · {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isEditing
                    ? <EditIcon sx={{ color: brand, fontSize: 18 }} />
                    : <PersonAddIcon sx={{ color: brand, fontSize: 18 }} />}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary' }}>
                  {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={handleClose}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${borderField}`,
                color: 'text.secondary', transition: 'all 0.15s',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <DialogContent sx={{ px: 3, py: 3, maxHeight: '60vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Campos base */}
          <TextField
            label="Nombre de usuario"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            required fullWidth disabled={loading} size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          <TextField
            label="Correo electrónico"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required fullWidth disabled={loading} size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {!usuario && (
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required fullWidth disabled={loading} size="small"
              helperText="Mínimo 8 caracteres"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(v => !v)}>
                      {showPassword
                        ? <VisibilityOffIcon fontSize="small" />
                        : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          )}

          {/* Roles */}
          <Box sx={{
            p: 1.75, borderRadius: '12px',
            background: alpha(brand, 0.06), border: `1px solid ${alpha(brand, 0.2)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
              <AdminPanelSettingsIcon sx={{ color: brand, fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Roles y permisos
              </Typography>
            </Box>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <Select
                multiple
                value={formData.rolIds}
                onChange={e => setFormData({ ...formData, rolIds: e.target.value as number[] })}
                input={<OutlinedInput />}
                displayEmpty
                disabled={loading}
                renderValue={selected =>
                  selected.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Seleccionar roles...</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(id => {
                        const rol = roles.find(r => r.id === id);
                        return (
                          <Chip
                            key={id}
                            label={rol?.nombre || `Rol ${id}`}
                            size="small"
                            sx={{
                              height: 20, fontSize: '0.7rem', fontWeight: 700,
                              bgcolor: alpha(brand, 0.15), color: brand,
                              border: `1px solid ${alpha(brand, 0.3)}`,
                            }}
                          />
                        );
                      })}
                    </Box>
                  )
                }
              >
                {roles.map(rol => (
                  <MenuItem key={rol.id} value={rol.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{rol.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{rol.descripcion}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Estado activo */}
          <Box sx={{
            p: 1.75, borderRadius: '12px',
            background: formData.activo ? alpha('#10b981', 0.07) : alpha(theme.palette.grey[500], 0.06),
            border: `1px solid ${formData.activo ? alpha('#10b981', 0.25) : alpha(theme.palette.grey[500], 0.2)}`,
            transition: 'all 0.25s',
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  disabled={loading}
                  color="success"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
                  {formData.activo
                    ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                    : <RadioButtonUncheckedIcon sx={{ color: 'action.disabled', fontSize: 18 }} />}
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      Usuario {formData.activo ? 'activo' : 'inactivo'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.activo ? 'Puede acceder al sistema' : 'Sin acceso al sistema'}
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0, width: '100%' }}
            />
          </Box>
        </DialogContent>

        {/* ── FOOTER ── */}
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', gap: 1.25, borderTop: `1px solid ${borderField}` }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600,
              color: 'text.secondary', border: `1px solid ${borderField}`,
              '&:hover': { borderColor: alpha(brand, 0.5), color: brand, background: alpha(brand, 0.05) },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading
              ? <CircularProgress size={16} color="inherit" />
              : isEditing ? <EditIcon /> : <PersonAddIcon />}
            sx={{
              flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': {
                background: isEditing
                  ? (isDark ? '#f59e0b' : '#b45309')
                  : (isDark ? '#10b981' : '#047857'),
                boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
              },
              '&.Mui-disabled': { opacity: 0.35, background: brand, color: isDark ? '#000' : '#fff' },
            }}
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </Box>
      </form>
    </Dialog>
  );
}