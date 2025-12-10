'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  alpha,
  useTheme,
  Slide,
  Collapse,
  keyframes,
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

const pulse = keyframes`
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(244, 67, 54, 0.4); }
  50% { box-shadow: 0 0 40px rgba(244, 67, 54, 0.7); }
`;

export default function UsuarioDeleteDialog({
  open,
  onClose,
  usuario,
  onSuccess,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' } as any}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'visible',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 100px rgba(244, 67, 54, 0.15)'
            : '0 25px 50px -12px rgba(244, 67, 54, 0.4)',
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        },
      }}
    >
      {/* Icono de advertencia flotante ULTRA MODERNO */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 12px 40px ${alpha(theme.palette.error.main, 0.6)}`,
          border: `4px solid ${theme.palette.background.paper}`,
          animation: `${pulse} 2s ease-in-out infinite, ${glow} 2s ease-in-out infinite`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            padding: '4px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.6)}, transparent)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: `${pulse} 2s ease-in-out infinite`,
          },
        }}
      >
        <WarningAmberIcon sx={{ color: 'white', fontSize: 40 }} />
      </Box>

      <DialogTitle
        sx={{
          pt: 6,
          pb: 2,
          textAlign: 'center',
          position: 'relative',
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, transparent 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
        }}
      >
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'rotate(90deg) scale(1.15)',
              bgcolor: alpha(theme.palette.error.main, 0.15),
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography 
          variant="h4" 
          fontWeight={800}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          ¡Momento!
        </Typography>
        <Typography variant="body1" fontWeight={600} color="text.secondary">
          Estás a punto de eliminar un usuario
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Esta acción es irreversible
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Collapse in={!!error}>
          <Alert
            severity="error"
            variant="filled"
            sx={{
              mb: 3,
              borderRadius: 3,
              animation: `${shake} 0.5s`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.3)}`,
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Card del usuario a eliminar - ULTRA MODERNO */}
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
            border: `2px dashed ${theme.palette.error.main}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 32px ${alpha(theme.palette.error.main, 0.25)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${theme.palette.error.main}, transparent)`,
            },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.4)}`,
              border: `3px solid ${alpha(theme.palette.error.main, 0.3)}`,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -3,
                borderRadius: 3,
                padding: '3px',
                background: `linear-gradient(135deg, ${alpha('#fff', 0.4)}, transparent)`,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              },
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
              Usuario a eliminar:
            </Typography>
            <Typography variant="h5" fontWeight={800} color="error.main" sx={{ mb: 0.5 }}>
              {usuario?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usuario?.email}
            </Typography>
          </Box>
        </Box>

        {/* Mensajes de advertencia - MEJORADOS */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.warning.main, 0.04)} 100%)`,
            border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: `linear-gradient(180deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              borderRadius: '3px 0 0 3px',
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              lineHeight: 1.8,
              mb: 2,
              fontWeight: 500,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.warning.main,
                mt: 0.8,
                flexShrink: 0,
                boxShadow: `0 0 12px ${alpha(theme.palette.warning.main, 0.6)}`,
              }}
            />
            El usuario será marcado como <strong>eliminado</strong> y perderá todo acceso al sistema
          </Typography>
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.warning.main,
                mt: 0.8,
                flexShrink: 0,
                boxShadow: `0 0 12px ${alpha(theme.palette.warning.main, 0.6)}`,
              }}
            />
            Esta acción <strong>NO se puede deshacer</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 3,
          gap: 2,
          borderTop: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
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
            borderRadius: 3,
            borderWidth: 2,
            py: 1.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
            },
          }}
        >
          No, Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          size="large"
          disabled={loading}
          startIcon={loading ? null : <DeleteForeverIcon />}
          sx={{
            flex: 1,
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 3,
            py: 1.5,
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.4)}`,
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
              boxShadow: `0 16px 32px ${alpha(theme.palette.error.main, 0.6)}`,
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: 'translateY(-2px) scale(0.98)',
            },
            '&:disabled': {
              background: theme.palette.action.disabledBackground,
              boxShadow: 'none',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sí, Eliminar Usuario'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}