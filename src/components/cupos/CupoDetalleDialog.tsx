// src/components/cupos/CupoDetalleDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import api from '@/lib/api';

interface CupoDetalleDialogProps {
  open: boolean;
  cupo: any | null;
  onClose: () => void;
  onEdit: () => void;
}

export const CupoDetalleDialog: React.FC<CupoDetalleDialogProps> = ({
  open,
  cupo,
  onClose,
  onEdit,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [loading, setLoading] = useState(false);
  const [preinscripciones, setPreinscripciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreinscripciones = async () => {
      if (!cupo?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/preinscripcion', {
          params: { cupo_preinscripcion_id: cupo.id, limit: 100 },
        });
        setPreinscripciones(response.data.data?.preinscripciones || []);
      } catch (err: any) {
        setError('Error al cargar preinscripciones vinculadas');
      } finally {
        setLoading(false);
      }
    };
    if (open && cupo) loadPreinscripciones();
  }, [open, cupo]);

  if (!cupo) return null;

  const pct = (cupo.cupos_ocupados / cupo.cupos_totales) * 100;
  const ocupColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';

  const infoRows = [
    { icon: <EventIcon />, label: 'Periodo Académico', value: cupo.periodo_nombre },
    { icon: <SchoolIcon />, label: 'Grado', value: cupo.grado_nombre },
    { icon: <AccessTimeIcon />, label: 'Turno', value: cupo.turno_nombre },
    { icon: <PeopleIcon />, label: 'Cupos Totales', value: cupo.cupos_totales },
    {
      icon: <AssignmentIcon />,
      label: 'Fecha de Creación',
      value: new Date(cupo.created_at).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
    },
  ];

  const getEstadoColor = (estado: string) => {
    const map: Record<string, string> = {
      aprobada: '#10b981',
      rechazada: '#ef4444',
      en_revision: '#9c27b0',
      pendiente: '#f59e0b',
    };
    return map[estado] || '#757575';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: `1px solid ${alpha(accent, 0.2)}`,
          backgroundImage: 'none',
          overflow: 'hidden',
        },
      }}
    >
      {/* TÍTULO con gradiente */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EventSeatIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#000' : '#fff' }}>
                Detalles del Cupo
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#00000099' : '#ffffff99' }}>
                {cupo.grado_nombre} — {cupo.turno_nombre}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: isDark ? '#000' : '#fff',
              '&:hover': { bgcolor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>

          {/* Chips de estado */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={cupo.activo ? 'Activo' : 'Inactivo'}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: cupo.activo ? alpha('#10b981', 0.15) : alpha('#888', 0.15),
                color: cupo.activo ? '#10b981' : '#888',
              }}
            />
            {cupo.nivel_academico_nombre && (
              <Chip
                label={cupo.nivel_academico_nombre}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                }}
              />
            )}
          </Stack>

          {/* Barra de ocupación */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${alpha(ocupColor, 0.2)}`,
              bgcolor: alpha(ocupColor, 0.05),
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="body1" fontWeight={700}>Ocupación</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: ocupColor }}>
                {cupo.cupos_ocupados}/{cupo.cupos_totales}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(pct, 100)}
              sx={{
                height: 10,
                borderRadius: '5px',
                bgcolor: alpha(ocupColor, 0.12),
                '& .MuiLinearProgress-bar': {
                  borderRadius: '5px',
                  backgroundColor: ocupColor,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
              {pct.toFixed(1)}% ocupado · {cupo.cupos_disponibles} cupos disponibles
            </Typography>
          </Box>

          <Divider />

          {/* Info en grid de 2 columnas */}
          <Box>
            <Typography variant="body1" fontWeight={700} mb={2}>Información</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              {infoRows.map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: alpha(accent, 0.04),
                    border: `1px solid ${alpha(accent, 0.1)}`,
                  }}
                >
                  <Box sx={{ color: accent, display: 'flex', '& svg': { fontSize: 18 } }}>
                    {row.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {row.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {row.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Observaciones */}
          {cupo.observaciones && (
            <>
              <Divider />
              <Box>
                <Typography variant="body1" fontWeight={700} mb={1.5}>Observaciones</Typography>
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: '12px',
                    border: `1px solid ${alpha(accent, 0.2)}`,
                    bgcolor: alpha(accent, 0.06),
                    '& .MuiAlert-icon': { color: accent },
                  }}
                >
                  {cupo.observaciones}
                </Alert>
              </Box>
            </>
          )}

          {/* Preinscripciones vinculadas */}
          <Divider />
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="body1" fontWeight={700}>
                Preinscripciones Vinculadas
              </Typography>
              <Chip
                label={preinscripciones.length}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                }}
              />
            </Stack>

            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={32} sx={{ color: accent }} />
              </Box>
            ) : error ? (
              <Alert severity="warning" sx={{ borderRadius: '12px' }}>{error}</Alert>
            ) : preinscripciones.length > 0 ? (
              <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
                <Stack spacing={1}>
                  {preinscripciones.map((p) => {
                    const estadoColor = getEstadoColor(p.estado);
                    return (
                      <Paper
                        key={p.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: `1px solid ${alpha(estadoColor, 0.2)}`,
                          bgcolor: alpha(estadoColor, 0.04),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {p.estudiante_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.codigo_inscripcion}
                          </Typography>
                        </Box>
                        <Chip
                          label={p.estado}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: alpha(estadoColor, 0.15),
                            color: estadoColor,
                          }}
                        />
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            ) : (
              <Alert
                severity="info"
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${alpha(accent, 0.2)}`,
                  bgcolor: alpha(accent, 0.05),
                  '& .MuiAlert-icon': { color: accent },
                }}
              >
                No hay preinscripciones vinculadas a este cupo
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={onEdit}
          startIcon={<EditIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            color: isDark ? '#000' : '#fff',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark
                ? '0 6px 20px rgba(250,204,21,0.35)'
                : '0 6px 20px rgba(2,136,209,0.35)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};