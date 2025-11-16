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
          borderRadius: 3,
          overflow: 'visible',
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
            : 'none',
        },
      }}
    >
      {/* Icono de advertencia flotante */}
      <Box
        sx={{
          position: 'absolute',
          top: -32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.4)}`,
          border: `4px solid ${theme.palette.background.paper}`,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'translateX(-50%) scale(1)',
            },
            '50%': {
              transform: 'translateX(-50%) scale(1.05)',
            },
          },
        }}
      >
        <WarningAmberIcon sx={{ color: 'white', fontSize: 32 }} />
      </Box>

      <DialogTitle
        sx={{
          pt: 5,
          pb: 2,
          textAlign: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Confirmar Eliminación
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta es una acción irreversible
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Collapse in={!!error}>
          <Alert
            severity="error"
            variant="filled"
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24,
              },
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Card del usuario a eliminar */}
        <Box
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            background: alpha(theme.palette.error.main, 0.08),
            border: `2px dashed ${alpha(theme.palette.error.main, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)}, ${alpha(theme.palette.error.dark, 0.2)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            <PersonIcon sx={{ color: theme.palette.error.main, fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Usuario a eliminar:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main">
              {usuario?.username}
            </Typography>
          </Box>
        </Box>

        {/* Mensaje de advertencia */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.warning.main, 0.08),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              lineHeight: 1.6,
              mb: 1.5,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: theme.palette.warning.main,
                mt: 0.7,
                flexShrink: 0,
              }}
            />
            El usuario será marcado como eliminado y no podrá acceder al sistema
          </Typography>
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              lineHeight: 1.6,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: theme.palette.warning.main,
                mt: 0.7,
                flexShrink: 0,
              }}
            />
            Esta acción no se puede deshacer
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          gap: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
            fontWeight: 600,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          Cancelar
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
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
            },
            '&:disabled': {
              boxShadow: 'none',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Eliminar Usuario'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}