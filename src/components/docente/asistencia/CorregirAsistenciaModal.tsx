'use client';
// components/docente/asistencia/CorregirAsistenciaModal.tsx
// ✅ VERSIÓN FINAL — incluye exportación PDF y Excel del estudiante

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Avatar, Chip, Button, IconButton,
  Select, MenuItem, TextField, Stack, Divider,
  CircularProgress, Tooltip, Fade, useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CloseRoundedIcon               from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon         from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon              from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon          from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon            from '@mui/icons-material/VerifiedRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import EditRoundedIcon                from '@mui/icons-material/EditRounded';
import SaveRoundedIcon                from '@mui/icons-material/SaveRounded';
import EventNoteRoundedIcon          from '@mui/icons-material/EventNoteRounded';
import PictureAsPdfRoundedIcon       from '@mui/icons-material/PictureAsPdfRounded';
import TableChartRoundedIcon         from '@mui/icons-material/TableChartRounded';

import { asistenciaService }         from '@/services/asistenciaService';
import { descargarReporteEstudiante } from '@/services/reportesAsistenciaService';
import { useCorregirAsistencia }      from '@/hooks/useAsistencia';
import { toast }                      from 'react-hot-toast';
import {
  EstudianteReporteClase,
  Asistencia,
  EstadoAsistencia,
  CorregirAsistenciaDTO,
} from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// CONSTANTES
// ──────────────────────────────────────────────

const ESTADOS: { value: EstadoAsistencia; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'presente',      label: 'Presente',      color: '#10b981', icon: <CheckCircleRoundedIcon /> },
  { value: 'ausente',       label: 'Ausente',       color: '#ef4444', icon: <CancelRoundedIcon /> },
  { value: 'tardanza',      label: 'Tardanza',      color: '#f59e0b', icon: <AccessTimeRoundedIcon /> },
  { value: 'justificado',   label: 'Justificado',   color: '#3b82f6', icon: <VerifiedRoundedIcon /> },
  { value: 'falta_parcial', label: 'Falta Parcial', color: '#8b5cf6', icon: <RemoveCircleOutlineRoundedIcon /> },
];

const getEstado = (v?: EstadoAsistencia) => ESTADOS.find(e => e.value === v);

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// BOTÓN DE DESCARGA
// ──────────────────────────────────────────────

const BtnDescarga: React.FC<{
  label: string; icon: React.ReactNode; color: string;
  gradient: string; loading: boolean; onClick: () => void;
}> = ({ label, icon, color, gradient, loading, onClick }) => (
  <Button
    size="small"
    onClick={onClick}
    disabled={loading}
    startIcon={loading ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : icon}
    sx={{
      background: gradient, color: '#fff', fontWeight: 800,
      textTransform: 'none', borderRadius: 2, px: 1.8, py: 0.6,
      fontSize: 12, boxShadow: `0 3px 10px ${alpha(color,0.35)}`,
      whiteSpace: 'nowrap', transition: 'all 0.25s ease',
      '&:hover': { background: gradient, filter: 'brightness(1.1)', transform: 'translateY(-2px)' },
      '&:active': { transform: 'scale(0.97)' },
      '&:disabled': { background: alpha('#9ca3af',0.3), color: 'text.disabled', boxShadow: 'none' },
    }}
  >
    {loading ? 'Generando...' : label}
  </Button>
);

// ──────────────────────────────────────────────
// FILA DE REGISTRO EDITABLE
// ──────────────────────────────────────────────

const FilaRegistro: React.FC<{
  registro:  Asistencia;
  onGuardar: (id: number, data: CorregirAsistenciaDTO) => Promise<boolean>;
  isSaving:  boolean;
}> = ({ registro, onGuardar, isSaving }) => {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';

  const [editando,      setEditando]      = useState(false);
  const [estadoEdit,    setEstadoEdit]    = useState<EstadoAsistencia>(registro.estado);
  const [justificacion, setJustificacion] = useState(registro.justificacion ?? '');
  const [observaciones, setObservaciones] = useState(registro.observaciones ?? '');

  const estadoInfo = getEstado(registro.estado);
  const color      = estadoInfo?.color ?? '#9ca3af';

  const handleGuardar = async () => {
    const ok = await onGuardar(registro.id, {
      estado: estadoEdit,
      justificacion: justificacion || undefined,
      observaciones: observaciones || undefined,
    });
    if (ok) setEditando(false);
  };

  const fecha = new Date(registro.fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <Box sx={{
      borderRadius: 2.5,
      border: `1.5px solid ${alpha(color, editando ? 0.4 : 0.15)}`,
      background: isDark
        ? `linear-gradient(135deg,${alpha(color,0.1)},${alpha(color,0.03)})`
        : `linear-gradient(135deg,${alpha(color,0.06)},#fff)`,
      overflow: 'hidden', transition: 'all 0.3s ease',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(color,0.15),
          '& svg': { fontSize: 20, color },
        }}>
          {estadoInfo?.icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={800} sx={{ color }}>
              {estadoInfo?.label}
            </Typography>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{fecha}</Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
            {registro.hora_marcacion} · {registro.marcado_por_username ?? 'Sistema'}
          </Typography>
        </Box>

        <Tooltip title={editando ? 'Cancelar' : 'Corregir'}>
          <IconButton
            size="small"
            onClick={() => {
              setEditando(e => !e);
              if (editando) {
                setEstadoEdit(registro.estado);
                setJustificacion(registro.justificacion ?? '');
                setObservaciones(registro.observaciones ?? '');
              }
            }}
            sx={{
              bgcolor: editando ? alpha('#ef4444',0.1) : isDark ? alpha('#fbbf24',0.1) : alpha('#3b82f6',0.08),
              color:   editando ? '#ef4444' : isDark ? '#fbbf24' : '#3b82f6',
              '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.2s ease',
            }}
          >
            {editando ? <CloseRoundedIcon fontSize="small" /> : <EditRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {!editando && registro.justificacion && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">📝 {registro.justificacion}</Typography>
        </Box>
      )}

      {editando && (
        <Fade in>
          <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${alpha(color,0.2)}`, pt: 2 }}>
            <Select
              fullWidth size="small" value={estadoEdit}
              onChange={e => setEstadoEdit(e.target.value as EstadoAsistencia)}
              sx={{ mb: 1.5, borderRadius: 2, fontSize: 14, fontWeight: 700 }}
            >
              {ESTADOS.map(op => (
                <MenuItem key={op.value} value={op.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ '& svg': { fontSize: 18, color: op.color } }}>{op.icon}</Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: op.color }}>
                      {op.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth size="small" placeholder="Justificación (opcional)"
              value={justificacion} onChange={e => setJustificacion(e.target.value)}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
            />
            <TextField
              fullWidth size="small" placeholder="Observaciones (opcional)"
              value={observaciones} onChange={e => setObservaciones(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
            />
            <Button
              fullWidth variant="contained" size="small"
              onClick={handleGuardar} disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveRoundedIcon />}
              sx={{
                borderRadius: 2, fontWeight: 800, textTransform: 'none',
                background: 'linear-gradient(135deg,#10b981,#34d399)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                '&:hover': { background: 'linear-gradient(135deg,#059669,#10b981)' },
              }}
            >
              {isSaving ? 'Guardando...' : 'Guardar corrección'}
            </Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────

interface Props {
  open:              boolean;
  estudiante:        EstudianteReporteClase | null;
  asignacionId:      number;
  onClose:           () => void;
  onCorreccionExito: () => void;
}

// ──────────────────────────────────────────────
// MODAL PRINCIPAL
// ──────────────────────────────────────────────

const CorregirAsistenciaModal: React.FC<Props> = ({
  open, estudiante, asignacionId, onClose, onCorreccionExito,
}) => {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';

  const [registros,  setRegistros]  = useState<Asistencia[]>([]);
  const [isLoading,  setIsLoading]  = useState(false);

  // Estado de descarga individual por formato
  const [descargando, setDescargando] = useState<'pdf' | 'excel' | null>(null);

  const { corregir, isSubmitting } = useCorregirAsistencia(onCorreccionExito);

  const cargarRegistros = useCallback(async () => {
    if (!estudiante || !asignacionId) return;
    setIsLoading(true);
    try {
      const res = await asistenciaService.listar({
        matricula_id: estudiante.matricula_id,
        asignacion_docente_id: asignacionId,
        limit: 60,
      });
      setRegistros(res.data.asistencias);
    } catch {
      setRegistros([]);
    } finally {
      setIsLoading(false);
    }
  }, [estudiante, asignacionId]);

  useEffect(() => {
    if (open) cargarRegistros();
  }, [open, cargarRegistros]);

  // ── Exportar reporte del estudiante ────────────────────────
  const handleExportar = useCallback(async (formato: 'pdf' | 'excel') => {
    if (!estudiante) return;
    setDescargando(formato);
    try {
      await descargarReporteEstudiante({
        matricula_id:          estudiante.matricula_id,
        asignacion_docente_id: asignacionId,
        codigo_estudiante:     estudiante.estudiante_codigo,
        formato,
      });
      toast.success(`Reporte descargado (${formato.toUpperCase()})`);
    } catch {
      toast.error('Error al generar el reporte');
    } finally {
      setDescargando(null);
    }
  }, [estudiante, asignacionId]);

  if (!estudiante) return null;

  const iniciales = `${estudiante.estudiante_nombres[0]}${estudiante.estudiante_apellidos[0]}`;
  const pct       = Number(estudiante.porcentaje_asistencia ?? 0);
  const color     = pct >= 80 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <Dialog
      open={open} onClose={onClose}
      maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))'
            : 'linear-gradient(145deg,#fff,#f9fafb)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? alpha('#fff',0.1) : alpha('#000',0.05)}`,
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          maxHeight: '90vh',
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            width: 52, height: 52, fontWeight: 800, fontSize: 16,
            background: `linear-gradient(135deg,${color},${alpha(color,0.7)})`,
            border: `3px solid ${alpha(color,0.3)}`,
            boxShadow: `0 4px 16px ${alpha(color,0.35)}`,
          }}>
            {iniciales}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={900}>
              {estudiante.estudiante_apellidos}, {estudiante.estudiante_nombres}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {estudiante.estudiante_codigo}
              </Typography>
              <Chip label={`${pct}% asistencia`} size="small" sx={{
                bgcolor: alpha(color,0.15), color,
                fontWeight: 800, fontSize: 11, height: 22, borderRadius: 1.5,
                border: `1px solid ${alpha(color,0.3)}`,
              }} />
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{
            bgcolor: isDark ? alpha('#fff',0.06) : alpha('#000',0.04),
            '&:hover': { bgcolor: isDark ? alpha('#fff',0.1) : alpha('#000',0.08) },
          }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Mini resumen */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {[
            { v: estudiante.presentes,        c: '#10b981', label: 'P' },
            { v: estudiante.ausentes,         c: '#ef4444', label: 'A' },
            { v: estudiante.tardanzas,        c: '#f59e0b', label: 'T' },
            { v: estudiante.justificados,     c: '#3b82f6', label: 'J' },
            { v: estudiante.faltas_parciales, c: '#8b5cf6', label: 'FP' },
          ].map(s => (
            <Box key={s.label} sx={{
              px: 1.5, py: 0.5, borderRadius: 1.5,
              display: 'flex', alignItems: 'center', gap: 0.75,
              bgcolor: alpha(s.c, isDark ? 0.15 : 0.1),
              border: `1px solid ${alpha(s.c,0.25)}`,
            }}>
              <Typography variant="caption" fontWeight={900} sx={{ color: s.c }}>{s.v}</Typography>
              <Typography variant="caption" color="text.disabled" fontWeight={700}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </DialogTitle>

      <Divider />

      {/* ── Historial ── */}
      <DialogContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EventNoteRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={700} color="text.secondary">
            Historial de asistencia
          </Typography>
          <Chip label={registros.length} size="small" sx={{
            height: 20, fontSize: 11, fontWeight: 800,
            bgcolor: isDark ? alpha('#fff',0.08) : alpha('#000',0.05),
          }} />
        </Box>

        {isLoading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Box key={i} sx={{
                height: 60, borderRadius: 2.5,
                bgcolor: isDark ? alpha('#fff',0.05) : alpha('#000',0.04),
              }} />
            ))}
          </Stack>
        ) : registros.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Sin registros de asistencia para esta materia
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {registros.map(r => (
              <FilaRegistro
                key={r.id}
                registro={r}
                onGuardar={async (id, data) => {
                  const ok = await corregir(id, data);
                  if (ok) await cargarRegistros();
                  return ok;
                }}
                isSaving={isSubmitting}
              />
            ))}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      {/* ── Footer: exportar + cerrar ── */}
      <DialogActions sx={{ px: 3, py: 2.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        {/* Botones de exportación del estudiante */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.disabled" fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
            Exportar reporte:
          </Typography>
          <BtnDescarga
            label="PDF"
            icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 15 }} />}
            color="#ef4444"
            gradient="linear-gradient(135deg,#ef4444,#f87171)"
            loading={descargando === 'pdf'}
            onClick={() => handleExportar('pdf')}
          />
          <BtnDescarga
            label="Excel"
            icon={<TableChartRoundedIcon sx={{ fontSize: 15 }} />}
            color="#10b981"
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            loading={descargando === 'excel'}
            onClick={() => handleExportar('excel')}
          />
        </Box>

        <Button onClick={onClose} variant="outlined" sx={{
          borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3,
        }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorregirAsistenciaModal;