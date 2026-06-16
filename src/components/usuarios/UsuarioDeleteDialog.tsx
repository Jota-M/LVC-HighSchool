'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import {
  WarningAmber as WarningAmberIcon,
  Close as CloseIcon,
  DeleteForever as DeleteForeverIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario } from '../../services/usuariosService';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export default function UsuarioDeleteDialog({ open, onClose, usuario, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── tokens ──────────────────────────────────────────────────────────────────
  const brand = '#ef4444';
  const brandDim = isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.06)';
  const brandBorder = isDark ? 'rgba(239,68,68,0.28)' : 'rgba(239,68,68,0.22)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!usuario) return;
    setError('');
    setLoading(true);
    try {
      await usuariosService.eliminar(usuario.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
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
            ? `0 0 0 1px rgba(239,68,68,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.14)`,
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.5,
            }}>
              Administración · Usuarios
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                background: alpha(brand, 0.15),
                border: `1px solid ${alpha(brand, 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <WarningAmberIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary' }}>
                Eliminar usuario
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
      <DialogContent sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Card usuario a eliminar */}
        <Box sx={{
          p: 1.75, borderRadius: '12px',
          background: alpha(brand, 0.07),
          border: `1px dashed ${alpha(brand, 0.4)}`,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '9px', flexShrink: 0,
            background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PersonIcon sx={{ color: brand, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Usuario a eliminar:
            </Typography>
            <Typography fontWeight={700} fontSize={15} sx={{ color: brand }}>
              {usuario?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario?.email}
            </Typography>
          </Box>
        </Box>

        {/* Advertencias */}
        <Box sx={{
          p: 1.75, borderRadius: '12px',
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderLeft: '3px solid rgba(245,158,11,0.7)',
          display: 'flex', flexDirection: 'column', gap: 1.25,
        }}>
          {[
            'El usuario será marcado como eliminado y perderá todo acceso al sistema',
            'Esta acción NO se puede deshacer',
          ].map((msg, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(245,158,11,0.8)', mt: '6px', flexShrink: 0,
              }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: msg.replace('NO', '<strong>NO</strong>').replace('eliminado', '<strong>eliminado</strong>') }}
              />
            </Box>
          ))}
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
          No, Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
          sx={{
            flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            background: brand, color: '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.35)}`,
            '&:hover': { background: '#dc2626', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
            '&.Mui-disabled': { opacity: 0.35, background: brand, color: '#fff' },
          }}
        >
          {loading ? 'Eliminando...' : 'Sí, eliminar usuario'}
        </Button>
      </Box>
    </Dialog>
  );
}