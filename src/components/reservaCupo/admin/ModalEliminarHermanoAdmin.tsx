// src/components/reservaCupo/admin/ModalEliminarHermanoAdmin.tsx
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
  Stack,
} from '@mui/material';
import {
  DeleteForeverRounded as DeleteIcon,
  Close as CloseIcon,
  WarningAmberRounded as WarningIcon,
  SchoolRounded as SchoolIcon,
  PersonRounded as PersonIcon,
} from '@mui/icons-material';
import { ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { getInitials } from './common';

interface ModalEliminarHermanoAdminProps {
  open: boolean;
  hermano: ReservaCupoHermanoData | null;
  motivo: string;
  isProcesando: boolean;
  onClose: () => void;
  onMotivoChange: (val: string) => void;
  onConfirmar: () => void;
}

const MOTIVOS_RAPIDOS = [
  'Registro duplicado por el tutor',
  'Registro duplicado (doble envío)',
  'Desistimiento voluntario de la familia',
  'Error en datos del postulante',
];

export const ModalEliminarHermanoAdmin: React.FC<ModalEliminarHermanoAdminProps> = ({
  open,
  hermano,
  motivo,
  isProcesando,
  onClose,
  onMotivoChange,
  onConfirmar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!hermano) return null;

  const esEspera = hermano.estado === 'en_espera';
  const nombreHermano = `${hermano.nombres} ${hermano.apellido_paterno} ${hermano.apellido_materno || ''}`.trim();

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
              <DeleteIcon sx={{ fontSize: 24 }} />
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
                Control de Cupos · Prioridad Familiar
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color: 'text.primary' }}>
                Eliminar Registro de Hermano
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={isProcesando}
            sx={{
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderRadius: '10px',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, pt: 0, pb: 3 }}>
        {/* TARJETA DEL HERMANO */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '16px',
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: alpha('#ef4444', 0.15),
                color: '#ef4444',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: `1.5px solid ${alpha('#ef4444', 0.4)}`,
              }}
            >
              {getInitials(hermano.nombres, hermano.apellido_paterno)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
                {nombreHermano}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 0.3 }}>
                <Chip
                  size="small"
                  label={`Cód: ${hermano.codigo_reserva}`}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    bgcolor: alpha('#0288d1', 0.12),
                    color: '#0288d1',
                  }}
                />
                <Chip
                  size="small"
                  label={esEspera ? `Lista de Espera #${hermano.posicion_espera || 1}` : 'Cupo Confirmado'}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    bgcolor: esEspera ? alpha('#f59e0b', 0.15) : alpha('#10b981', 0.15),
                    color: esEspera ? '#d97706' : '#10b981',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  CI: {hermano.ci || 'Sin CI'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Grado solicitado y Regular vinculado */}
          <Stack spacing={0.6} sx={{ pt: 1, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Curso Solicitado: <strong>{hermano.grado_solicitado_nombre || hermano.grado_nombre}</strong> ({hermano.turno_solicitado_nombre || hermano.turno_nombre || 'Mañana'})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Hermano de: <strong>{hermano.regular_nombre_completo || 'Estudiante Regular'}</strong> (Cód: {hermano.regular_codigo})
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ALERTA INFORMATIVA */}
        <Alert
          severity="warning"
          icon={<WarningIcon sx={{ fontSize: 22 }} />}
          sx={{
            mb: 2.5,
            borderRadius: '14px',
            fontWeight: 500,
            fontSize: '0.82rem',
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          {esEspera ? (
            <>
              Al eliminar este registro, se retirará de la <strong>Lista de Espera</strong> y se reordenarán las posiciones de los demás hermanos postulantes.
            </>
          ) : (
            <>
              Al eliminar este registro, <strong>el cupo quedará libre de inmediato</strong> y se descontará del conteo de hermanos con prioridad, liberando vacante para nuevos postulantes.
            </>
          )}
        </Alert>

        {/* MOTIVOS RÁPIDOS */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.8 }}>
            Sugerencia de motivo (clic para autocompletar):
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {MOTIVOS_RAPIDOS.map((m) => (
              <Chip
                key={m}
                size="small"
                label={m}
                clickable
                onClick={() => onMotivoChange(m)}
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  bgcolor: motivo === m ? alpha('#ef4444', 0.18) : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                  color: motivo === m ? '#ef4444' : 'text.primary',
                  border: `1px solid ${motivo === m ? '#ef4444' : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* CAMPO DE MOTIVO */}
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Motivo de la eliminación *"
          placeholder="Especifique el motivo (ej. Tutor registró 2 veces al mismo hermanito)..."
          value={motivo}
          onChange={(e) => onMotivoChange(e.target.value)}
          disabled={isProcesando}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
            },
          }}
        />

        {/* BOTONES DE ACCIÓN */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isProcesando}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              borderColor: alpha(isDark ? '#fff' : '#000', 0.2),
              color: 'text.primary',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={onConfirmar}
            disabled={isProcesando || !motivo.trim()}
            startIcon={isProcesando ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              px: 3,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)',
            }}
          >
            {isProcesando ? 'Eliminando...' : 'Confirmar Eliminación'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEliminarHermanoAdmin;
