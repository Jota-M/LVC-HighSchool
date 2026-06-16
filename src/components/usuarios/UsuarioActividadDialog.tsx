'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  List,
  ListItem,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Computer as ComputerIcon,
  History as HistoryIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material';
import usuariosService, { Usuario } from '../../services/usuariosService';

interface Actividad {
  id: number;
  accion: string;
  modulo: string;
  resultado: string;
  mensaje: string;
  created_at: string;
  ip_address: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

export default function UsuarioActividadDialog({ open, onClose, usuario }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  // ── tokens ──────────────────────────────────────────────────────────────────
  const brand = isDark ? '#a78bfa' : '#7c3aed';
  const brandDim = isDark ? 'rgba(167,139,250,0.10)' : 'rgba(124,58,237,0.07)';
  const brandBorder = isDark ? 'rgba(167,139,250,0.28)' : 'rgba(124,58,237,0.22)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';

  // ── efectos ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open && usuario) cargarActividad();
  }, [open, usuario]);

  const cargarActividad = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const response = await usuariosService.obtenerActividad(usuario.id, 50);
      setActividades(response.data.actividad);
    } catch (err) {
      console.error('Error al cargar actividad:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── helpers ─────────────────────────────────────────────────────────────────
  const getResultadoConfig = (resultado: string) => {
    switch (resultado) {
      case 'exitoso':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />,
          dot: '#10b981',
          bg: isDark ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.07)',
          border: 'rgba(16,185,129,0.25)',
          accent: '#10b981',
          label: 'Exitoso',
        };
      case 'fallido':
        return {
          color: 'error' as const,
          icon: <ErrorIcon sx={{ fontSize: 16, color: '#fff' }} />,
          dot: '#ef4444',
          bg: isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.07)',
          border: 'rgba(239,68,68,0.25)',
          accent: '#ef4444',
          label: 'Fallido',
        };
      default:
        return {
          color: 'default' as const,
          icon: <InfoIcon sx={{ fontSize: 16, color: '#fff' }} />,
          dot: '#64748b',
          bg: isDark ? 'rgba(100,116,139,0.10)' : 'rgba(100,116,139,0.07)',
          border: 'rgba(100,116,139,0.2)',
          accent: '#64748b',
          label: 'Info',
        };
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (date.toDateString() === hoy.toDateString()) return `Hoy a las ${hora}`;
    if (date.toDateString() === ayer.toDateString()) return `Ayer a las ${hora}`;
    return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.5,
            }}>
              Usuarios · Actividad reciente
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HistoryIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', lineHeight: 1.2 }}>
                  Historial de actividad
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usuario?.username} · {actividades.length} registros
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            onClick={onClose}
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
      <DialogContent sx={{ px: 0, py: 0, maxHeight: '62vh', overflow: 'auto' }}>

        {/* Estado: cargando */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
            <CircularProgress size={40} thickness={3} sx={{ color: brand }} />
            <Typography variant="body2" color="text.secondary">Cargando actividad...</Typography>
          </Box>
        )}

        {/* Estado: vacío */}
        {!loading && actividades.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, px: 3, gap: 1.5 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '14px',
              background: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.2)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <InboxIcon sx={{ color: brand, fontSize: 32 }} />
            </Box>
            <Typography fontWeight={700} color="text.secondary">Sin actividad registrada</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
              Las acciones del usuario aparecerán aquí cuando opere en el sistema
            </Typography>
          </Box>
        )}

        {/* Lista de actividades */}
        {!loading && actividades.length > 0 && (
          <Box sx={{ position: 'relative', px: 3, py: 2.5 }}>
            {/* línea de timeline */}
            <Box sx={{
              position: 'absolute',
              left: 44, top: 0, bottom: 0, width: '1.5px',
              background: `linear-gradient(180deg, ${alpha(brand, 0.5)}, ${alpha(brand, 0.1)}, transparent)`,
            }} />

            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {actividades.map(actividad => {
                const cfg = getResultadoConfig(actividad.resultado);
                return (
                  <ListItem key={actividad.id} disablePadding sx={{ alignItems: 'flex-start', gap: 1.5 }}>

                    {/* dot */}
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, mt: 0.25,
                      background: cfg.dot, zIndex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 0 3px ${bgModal}, 0 0 0 4px ${alpha(cfg.dot, 0.3)}`,
                    }}>
                      {cfg.icon}
                    </Box>

                    {/* card */}
                    <Box sx={{
                      flex: 1, borderRadius: '12px',
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderLeft: `3px solid ${cfg.accent}`,
                      p: 1.75,
                      transition: 'all 0.15s',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: `0 4px 16px ${alpha(cfg.accent, 0.15)}`,
                      },
                    }}>
                      {/* fila superior */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75, gap: 1, flexWrap: 'wrap' }}>
                        <Typography fontWeight={700} fontSize={14} color="text.primary">
                          {actividad.accion}
                        </Typography>
                        <Chip
                          label={cfg.label}
                          size="small"
                          color={cfg.color}
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em' }}
                        />
                      </Box>

                      {/* mensaje */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, lineHeight: 1.6 }}>
                        {actividad.mensaje}
                      </Typography>

                      {/* metadatos */}
                      <Box sx={{
                        pt: 1.25, borderTop: `1px solid ${alpha(cfg.accent, 0.15)}`,
                        display: 'flex', flexWrap: 'wrap', gap: 1,
                      }}>
                        {[
                          { icon: <ComputerIcon sx={{ fontSize: 13 }} />, label: actividad.modulo },
                          { icon: <LocationOnIcon sx={{ fontSize: 13 }} />, label: actividad.ip_address },
                          { icon: <ScheduleIcon sx={{ fontSize: 13 }} />, label: formatearFecha(actividad.created_at) },
                        ].map(({ icon, label }) => (
                          <Box key={label} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            px: 1, py: 0.25, borderRadius: '6px',
                            background: alpha(cfg.accent, 0.08),
                            color: 'text.secondary',
                          }}>
                            {icon}
                            <Typography variant="caption" fontWeight={600}>{label}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${borderField}` }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3,
            background: brand, color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
            '&:hover': {
              background: isDark ? '#8b5cf6' : '#6d28d9',
              boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
            },
          }}
        >
          Cerrar
        </Button>
      </Box>
    </Dialog>
  );
}