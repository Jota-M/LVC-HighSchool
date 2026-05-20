'use client';
// components/padre/asistencia/MisPermisos.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Skeleton,
  Stack,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BlockIcon from '@mui/icons-material/Block';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import {
  SolicitudPermisoHijo,
  EstadoPermiso,
  Paginacion,
} from '@/types/padreAsistenciaTypes';
import { MOTIVOS_PERMISO } from '@/types/asistenciaTypes';
import { useDetallePermiso } from '@/hooks/usePadreAsistencia';

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const ESTADO_CONFIG: Record<EstadoPermiso, { label: string; color: string; gradient: string; icon: React.ReactNode }> = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} /> },
  aprobada:  { label: 'Aprobada',  color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> },
  rechazada: { label: 'Rechazada', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)', icon: <CancelRoundedIcon sx={{ fontSize: 16 }} /> },
  cancelada: { label: 'Cancelada', color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)', icon: <BlockIcon sx={{ fontSize: 16 }} /> },
};

const formatFecha = (fecha: string) =>
  new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const formatFechaCorta = (fecha: string) =>
  new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

// ──────────────────────────────────────────────
// DIÁLOGO DE CANCELACIÓN
// ──────────────────────────────────────────────

const ConfirmarCancelacionDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  isLoading?: boolean;
}> = ({ open, onClose, onConfirmar, isLoading }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>¿Cancelar solicitud?</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        Esta acción no se puede deshacer. La solicitud pasará al estado "Cancelada" y no podrá ser aprobada ni rechazada.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
      <Button onClick={onClose} disabled={isLoading} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
        Volver
      </Button>
      <Button
        onClick={onConfirmar}
        disabled={isLoading}
        variant="contained"
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          bgcolor: '#ef4444',
          '&:hover': { bgcolor: '#dc2626' },
        }}
      >
        Sí, cancelar
      </Button>
    </DialogActions>
  </Dialog>
);

// ──────────────────────────────────────────────
// TARJETA DE PERMISO
// ──────────────────────────────────────────────

interface TarjetaPermisoProps {
  solicitud: SolicitudPermisoHijo;
  onCancelar: (id: number) => void;
  isSubmitting?: boolean;
  delay?: number;
}

const TarjetaPermiso: React.FC<TarjetaPermisoProps> = ({ solicitud, onCancelar, isSubmitting, delay = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandido, setExpandido] = useState(false);
  const [cancelarDialog, setCancelarDialog] = useState(false);

  const cfg = ESTADO_CONFIG[solicitud.estado];
  const motivo = MOTIVOS_PERMISO.find(m => m.value === solicitud.motivo);
  const { solicitud: detalle, historial, isLoading: loadingDetalle } = useDetallePermiso(
    expandido ? solicitud.id : null
  );

  return (
    <>
      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(cfg.color, solicitud.estado === 'rechazada' ? 0.4 : 0.2)}`,
          background: isDark
            ? `linear-gradient(145deg, ${alpha(cfg.color, 0.1)} 0%, ${alpha(cfg.color, 0.03)} 100%)`
            : `linear-gradient(145deg, ${alpha(cfg.color, 0.05)} 0%, #fff 100%)`,
          animation: `${fadeUp} 0.4s ease-out ${delay}s both`,
          transition: 'box-shadow 0.2s ease',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(cfg.color, 0.15)}`,
          },
          '&::before': {
            content: '""',
            display: 'block',
            height: '3px',
            background: cfg.gradient,
          },
        }}
      >
        {/* Header de la tarjeta */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            cursor: 'pointer',
          }}
          onClick={() => setExpandido(v => !v)}
        >
          {/* Ícono del motivo */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: cfg.gradient,
              boxShadow: `0 4px 16px ${alpha(cfg.color, 0.35)}`,
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {motivo?.icon ?? '📋'}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body1" fontWeight={800} noWrap>
                {motivo?.label ?? solicitud.motivo}
              </Typography>
              <Chip
                size="small"
                icon={<Box sx={{ color: `${cfg.color} !important`, display: 'flex', alignItems: 'center' }}>{cfg.icon}</Box>}
                label={cfg.label}
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 800,
                  bgcolor: alpha(cfg.color, isDark ? 0.2 : 0.12),
                  color: cfg.color,
                  border: `1px solid ${alpha(cfg.color, 0.3)}`,
                  borderRadius: 1.5,
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                📅 {formatFechaCorta(solicitud.fecha_ausencia)}
              </Typography>
              {solicitud.materia_nombre && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  · 📚 {solicitud.materia_nombre}
                </Typography>
              )}
              {!solicitud.es_dia_completo && solicitud.hora_inicio && solicitud.hora_fin && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  · ⏰ {solicitud.hora_inicio?.slice(0,5)} – {solicitud.hora_fin?.slice(0,5)}
                </Typography>
              )}
              {solicitud.archivo_adjunto_url && (
                <Chip
                  size="small"
                  label="Con adjunto"
                  icon={<AttachFileIcon sx={{ fontSize: '12px !important' }} />}
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    borderRadius: 1.5,
                  }}
                />
              )}
            </Box>

            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              Código: {solicitud.codigo_solicitud}
            </Typography>
          </Box>

          {/* Expandir/colapsar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {solicitud.estado === 'pendiente' && (
              <Tooltip title="Cancelar solicitud">
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); setCancelarDialog(true); }}
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.06),
                    color: '#ef4444',
                    borderRadius: 2,
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    '&:hover': { bgcolor: alpha('#ef4444', 0.15) },
                  }}
                >
                  <BlockIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" sx={{ borderRadius: 2 }}>
              {expandido ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
        </Box>

        {/* Alerta de rechazo siempre visible */}
        {solicitud.estado === 'rechazada' && solicitud.motivo_rechazo && !expandido && (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert
              severity="error"
              icon={<WarningAmberIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: 2,
                py: 0.5,
                fontSize: 12,
                background: isDark ? alpha('#ef4444', 0.1) : alpha('#ef4444', 0.06),
                border: `1px solid ${alpha('#ef4444', 0.2)}`,
              }}
            >
              <Typography variant="caption" fontWeight={700}>
                Motivo de rechazo: {solicitud.motivo_rechazo}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Detalle expandido */}
        <Collapse in={expandido}>
          <Divider sx={{ borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05) }} />
          <Box sx={{ p: 2.5 }}>
            {loadingDetalle ? (
              <Stack spacing={1}>
                {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={36} sx={{ borderRadius: 2 }} />)}
              </Stack>
            ) : (
              <>
                {/* Datos completos */}
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Detalle de la solicitud
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                  {[
                    { label: 'Fecha ausencia', value: formatFecha(solicitud.fecha_ausencia) },
                    { label: 'Tipo', value: solicitud.es_dia_completo ? 'Día completo' : `${solicitud.hora_inicio?.slice(0,5)} a ${solicitud.hora_fin?.slice(0,5)}` },
                    { label: 'Materia', value: solicitud.materia_nombre ?? 'Todas las materias' },
                    { label: 'Enviada el', value: formatFechaCorta(solicitud.created_at) },
                  ].map(item => (
                    <Box key={item.label}>
                      <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ display: 'block', mb: 0.25 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {solicitud.descripcion && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                      Descripción
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {solicitud.descripcion}
                    </Typography>
                  </Box>
                )}

                {solicitud.estado === 'rechazada' && solicitud.motivo_rechazo && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
                    <Typography variant="caption" fontWeight={700}>
                      Motivo del rechazo: {solicitud.motivo_rechazo}
                    </Typography>
                    {solicitud.observaciones_revisor && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {solicitud.observaciones_revisor}
                      </Typography>
                    )}
                  </Alert>
                )}

                {solicitud.estado === 'aprobada' && solicitud.observaciones_revisor && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
                    <Typography variant="caption" fontWeight={700}>
                      {solicitud.observaciones_revisor}
                    </Typography>
                  </Alert>
                )}

                {/* Historial de estados */}
                {historial.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <HistoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Historial de estados
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      {historial.map((h) => {
                        const hCfg = ESTADO_CONFIG[h.estado_nuevo as EstadoPermiso] ?? ESTADO_CONFIG.pendiente;
                        return (
                          <Box
                            key={h.id}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: isDark ? alpha(hCfg.color, 0.08) : alpha(hCfg.color, 0.05),
                              border: `1px solid ${alpha(hCfg.color, 0.15)}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Box sx={{ color: hCfg.color }}>{hCfg.icon}</Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" fontWeight={800} sx={{ color: hCfg.color }}>
                                {hCfg.label}
                              </Typography>
                              {h.comentario && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {h.comentario}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: 11 }}>
                              {new Date(h.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Box>

      <ConfirmarCancelacionDialog
        open={cancelarDialog}
        onClose={() => setCancelarDialog(false)}
        onConfirmar={() => { setCancelarDialog(false); onCancelar(solicitud.id); }}
        isLoading={isSubmitting}
      />
    </>
  );
};

// ──────────────────────────────────────────────
// PROPS PRINCIPALES
// ──────────────────────────────────────────────

interface Props {
  solicitudes: SolicitudPermisoHijo[];
  paginacion: Paginacion;
  isLoading?: boolean;
  isSubmitting?: boolean;
  filtroEstado?: EstadoPermiso | '';
  onFiltroEstadoChange: (estado: EstadoPermiso | '') => void;
  onPaginaChange: (page: number) => void;
  onCancelar: (id: number) => void;
  pendientesCount?: number;
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

const MisPermisos: React.FC<Props> = ({
  solicitudes,
  paginacion,
  isLoading = false,
  isSubmitting = false,
  filtroEstado = '',
  onFiltroEstadoChange,
  onPaginaChange,
  onCancelar,
  pendientesCount = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 4,
              height: 28,
              borderRadius: 2,
              background: 'linear-gradient(180deg, #f59e0b, #d97706)',
            }}
          />
          <Typography variant="h6" fontWeight={800}>
            Mis solicitudes
          </Typography>
          {pendientesCount > 0 && (
            <Chip
              size="small"
              label={`${pendientesCount} pendiente${pendientesCount > 1 ? 's' : ''}`}
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 800,
                bgcolor: isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.12),
                color: isDark ? '#fbbf24' : '#d97706',
                borderRadius: 1.5,
                animation: pendientesCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            />
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={filtroEstado}
            onChange={e => onFiltroEstadoChange(e.target.value as EstadoPermiso | '')}
            displayEmpty
            renderValue={v => v ? ESTADO_CONFIG[v as EstadoPermiso]?.label : 'Todos'}
            sx={{
              borderRadius: 2.5,
              fontSize: 13,
              fontWeight: 600,
              bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02),
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(ESTADO_CONFIG).map(([val, cfg]) => (
              <MenuItem key={val} value={val}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                  {cfg.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lista */}
      {isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      ) : solicitudes.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 7,
            borderRadius: 3,
            background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            border: `2px dashed ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}
        >
          <EventBusyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            {filtroEstado ? `No hay solicitudes ${ESTADO_CONFIG[filtroEstado]?.label.toLowerCase()}s` : 'No enviaste solicitudes de permiso aún'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Usá el botón "Solicitar permiso" para enviar tu primera solicitud
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {solicitudes.map((s, i) => (
            <TarjetaPermiso
              key={s.id}
              solicitud={s}
              onCancelar={onCancelar}
              isSubmitting={isSubmitting}
              delay={i * 0.06}
            />
          ))}
        </Stack>
      )}

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={paginacion.totalPages}
            page={paginacion.page}
            onChange={(_, p) => onPaginaChange(p)}
            shape="rounded"
            size="small"
            sx={{
              '& .Mui-selected': {
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24) !important',
                color: '#fff !important',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default MisPermisos;