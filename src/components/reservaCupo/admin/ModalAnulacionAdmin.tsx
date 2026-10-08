// src/components/reservaCupo/admin/ModalAnulacionAdmin.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Alert,
  Avatar,
  Chip,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CancelOutlined as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ReservaCupoData } from '@/types/reservaCupoTypes';
import { getInitials } from './common';

interface ModalAnulacionAdminProps {
  open: boolean;
  reserva: ReservaCupoData | null;
  motivo: string;
  isProcesando: boolean;
  onClose: () => void;
  onMotivoChange: (val: string) => void;
  onConfirmar: () => void;
}

export const ModalAnulacionAdmin: React.FC<ModalAnulacionAdminProps> = ({
  open,
  reserva,
  motivo,
  isProcesando,
  onClose,
  onMotivoChange,
  onConfirmar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={() => !isProcesando && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: isDark ? '#09101d' : '#ffffff',
          border: `1px solid ${alpha('#ef4444', 0.35)}`,
          boxShadow: isDark
            ? '0 24px 64px rgba(0,0,0,0.75)'
            : '0 24px 64px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      }}
    >
      {/* HEADER */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '13px',
                bgcolor: alpha('#ef4444', 0.12),
                border: `1px solid ${alpha('#ef4444', 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                flexShrink: 0,
              }}
            >
              <CancelIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#ef4444',
                }}
              >
                Administración · Control de Cupos 2027
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color: 'text.primary' }}>
                Anular Reserva de Cupo
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={() => !isProcesando && onClose()}
            sx={{
              borderRadius: '9px',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            height: 3,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            width: '100%',
          }}
        />
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Alert
          severity="warning"
          sx={{
            mb: 2.5,
            borderRadius: '14px',
            bgcolor: alpha('#f59e0b', 0.1),
            border: `1px solid ${alpha('#f59e0b', 0.25)}`,
            color: isDark ? '#fbbf24' : '#b45309',
            '& .MuiAlert-icon': { color: '#f59e0b' },
          }}
        >
          <strong>Advertencia de Liberación:</strong> Al anular esta reserva, la plaza escolar quedará disponible para reasignación en la Gestión 2027.
        </Alert>

        {reserva && (
          <Box
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={reserva.estudiante_foto_url || undefined}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: isDark ? '#facc15' : '#0288d1',
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 800,
                  }}
                >
                  {!reserva.estudiante_foto_url && getInitials(reserva.estudiante_nombres, reserva.estudiante_apellido_paterno)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                    {reserva.estudiante_nombre_completo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                    CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{reserva.estudiante_ci}</strong> · Cód: {reserva.estudiante_codigo}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={reserva.grado_destino_nombre}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" display="block">
              Tutor a cargo: <strong>{reserva.tutor_nombre}</strong> ({reserva.tutor_parentesco}) · 📱 {reserva.tutor_telefono}
            </Typography>

            {reserva.motivo_anulacion && reserva.estado === 'solicitud_anulacion' && (
              <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '10px', bgcolor: alpha('#f59e0b', 0.1), border: '1px solid rgba(245,158,11,0.25)' }}>
                <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                  Motivo declarado por el tutor en su solicitud:
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', mt: 0.3 }}>
                  "{reserva.motivo_anulacion}"
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Motivo Administrativo de la Anulación *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            required
            placeholder="Indique la justificación oficial (ej. Solicitud voluntaria del tutor, cambio de radicatoria)..."
            value={motivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            disabled={isProcesando}
            helperText="Este motivo quedará registrado en el historial de auditoría de secretaría"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
        </Box>
      </DialogContent>

      {/* FOOTER */}
      <Box
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
        }}
      >
        <Button
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isProcesando}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
        >
          Cancelar
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="contained"
          onClick={onConfirmar}
          disabled={isProcesando || !motivo.trim()}
          startIcon={isProcesando ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
          }}
        >
          {isProcesando ? 'Procesando...' : 'Confirmar Anulación Oficial'}
        </Button>
      </Box>
    </Dialog>
  );
};
export default ModalAnulacionAdmin;
