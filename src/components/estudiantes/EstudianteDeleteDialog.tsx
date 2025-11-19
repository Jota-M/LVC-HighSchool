// components/estudiantes/EstudianteDeleteDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  Avatar,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteIcon from '@mui/icons-material/Delete';
import estudiantesService, { Estudiante } from '../../services/estudiantesService';

interface Props {
  open: boolean;
  onClose: () => void;
  estudiante: Estudiante | null;
  onSuccess: () => void;
}

export default function EstudianteDeleteDialog({ open, onClose, estudiante, onSuccess }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!estudiante) return;

    try {
      setLoading(true);
      setError('');

      await estudiantesService.eliminar(estudiante.id);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el estudiante');
    } finally {
      setLoading(false);
    }
  };

  if (!estudiante) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDark ? '#1a1f2e' : '#fff',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight={700}>
            Confirmar Eliminación
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Avatar
            src={estudiante.foto_url || '/default-avatar.png'}
            alt={estudiante.nombres}
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 2,
              border: '3px solid #f44336',
            }}
          />

          <Typography variant="body1" gutterBottom>
            ¿Está seguro que desea eliminar al estudiante?
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: isDark ? '#0d1117' : '#f5f5f5',
              borderRadius: 1,
              border: '1px solid',
              borderColor: isDark ? '#30363d' : '#e0e0e0',
            }}
          >
            <Typography variant="h6" fontWeight={600} color="primary">
              {estudiante.nombres} {estudiante.apellidos}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Documento: {estudiante.documento_identidad}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Esta acción no se puede deshacer
            </Typography>
            <Typography variant="body2">
              El estudiante será marcado como eliminado en el sistema, pero sus registros históricos se conservarán.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}