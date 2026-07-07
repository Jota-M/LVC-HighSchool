'use client';
// app/dashboard/docente/asistencia/[id]/page.tsx
// Estructura idéntica a notas/[id]/page.tsx — tabs: Pase de Lista | Resumen | Permisos

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, Chip, Fade,
  useTheme, alpha, LinearProgress, Stack, CircularProgress,
  Avatar, Button, TextField, Select, MenuItem, Tooltip,
  Collapse, IconButton, ToggleButton, ToggleButtonGroup,
  InputAdornment, Alert, Snackbar,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  useMisAsignaciones,
  useListaDia,
  useSolicitudesPermiso,
  useReporteClase,
  useCorregirAsistencia,
} from '@/hooks/useAsistencia';
import { AsignacionDocente, asistenciaService, solicitudPermisoService } from '@/services/asistenciaService';
import {
  EstudianteDia, RegistroMasivoItem, EstadoAsistencia,
  SolicitudPermiso, MOTIVOS_PERMISO, ESTADOS_PERMISO,
  HistorialPermiso, EstudianteReporteClase, Asistencia,
  CorregirAsistenciaDTO,
} from '@/types/asistenciaTypes';
import {
  descargarPaseDia, descargarPeriodoClase, descargarReporteEstudiante,
} from '@/services/reportesAsistenciaService';
import { toast } from 'react-hot-toast';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const usePalette = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ─── Config de tabs ───────────────────────────────────────────────────────────
const TABS = [
  { label: 'Pase de Lista', key: 'lista' },
  { label: 'Resumen', key: 'resumen' },
  { label: 'Permisos', key: 'permisos' },
];

// ─── Config estados asistencia ────────────────────────────────────────────────
const ESTADOS_CONFIG = [
  { value: 'presente' as EstadoAsistencia, label: 'Presente', labelCorto: 'P', color: '#10b981' },
  { value: 'ausente' as EstadoAsistencia, label: 'Ausente', labelCorto: 'A', color: '#ef4444' },
  { value: 'tardanza' as EstadoAsistencia, label: 'Tardanza', labelCorto: 'T', color: '#f59e0b' },
  { value: 'justificado' as EstadoAsistencia, label: 'Justificado', labelCorto: 'J', color: '#3b82f6' },
  { value: 'falta_parcial' as EstadoAsistencia, label: 'F. Parcial', labelCorto: 'FP', color: '#8b5cf6' },
];

const getEstCfg = (v?: EstadoAsistencia) => ESTADOS_CONFIG.find(e => e.value === v);

// ═══════════════════════════════════════════════════════
// SECCIÓN: PASE DE LISTA
// ═══════════════════════════════════════════════════════

const BtnEstado: React.FC<{
  cfg: typeof ESTADOS_CONFIG[0];
  selected: boolean;
  onClick: () => void;
}> = ({ cfg, selected, onClick }) => {
  const { isDark } = usePalette();
  return (
    <Tooltip title={cfg.label} placement="top">
      <Box
        onClick={onClick}
        sx={{
          px: 1.2, py: 0.7, borderRadius: 2, cursor: 'pointer',
          border: `1.5px solid ${selected ? cfg.color : 'transparent'}`,
          bgcolor: selected ? alpha(cfg.color, 0.15) : isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
          color: selected ? cfg.color : 'text.disabled',
          fontWeight: 800, fontSize: 12,
          transition: 'all 0.15s',
          userSelect: 'none',
          '&:hover': {
            border: `1.5px solid ${cfg.color}`,
            color: cfg.color,
            bgcolor: alpha(cfg.color, 0.08),
          },
        }}
      >
        {cfg.labelCorto}
      </Box>
    </Tooltip>
  );
};

const FilaEstudianteLista: React.FC<{
  est: EstudianteDia;
  num: number;
  marcacion?: RegistroMasivoItem;
  onMarcar: (id: number, datos: Partial<RegistroMasivoItem>) => void;
}> = ({ est, num, marcacion, onMarcar }) => {
  const { isDark } = usePalette();
  const [showObs, setShowObs] = useState(false);
  const [obs, setObs] = useState(marcacion?.observaciones ?? '');

  const estadoActual = marcacion?.estado;
  const cfg = getEstCfg(estadoActual);
  const iniciales = `${est.estudiante_nombres[0]}${est.estudiante_apellidos[0]}`;

  const handleEstado = (valor: EstadoAsistencia) => {
    if (estadoActual === valor) {
      onMarcar(est.matricula_id, { estado: undefined as any });
    } else {
      onMarcar(est.matricula_id, { matricula_id: est.matricula_id, estado: valor, observaciones: obs || undefined });
    }
  };

  return (
    <Box sx={{
      borderRadius: '12px',
      border: `1.5px solid ${estadoActual ? alpha(cfg!.color, 0.3) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      bgcolor: estadoActual
        ? isDark ? alpha(cfg!.color, 0.08) : alpha(cfg!.color, 0.04)
        : isDark ? alpha('#fff', 0.02) : '#fff',
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 1, sm: 1.5 },
        px: 2, py: 1.5,
      }}>
        {/* Fila superior: número + avatar + nombre + observación */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          {/* Número */}
          <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ minWidth: 22, textAlign: 'center', flexShrink: 0 }}>
            {num}
          </Typography>

          {/* Avatar */}
          <Avatar src={est.estudiante_foto ?? undefined} sx={{
            width: 36, height: 36, fontSize: 12, fontWeight: 800, flexShrink: 0,
            bgcolor: estadoActual ? alpha(cfg!.color, 0.7) : alpha('#9ca3af', 0.5),
          }}>
            {iniciales}
          </Avatar>

          {/* Nombre — ahora con espacio real para respirar */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: estadoActual ? cfg!.color : 'text.primary' }}>
              {est.estudiante_apellidos}, {est.estudiante_nombres}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
              {est.estudiante_codigo}
            </Typography>
          </Box>

          {/* Observación toggle — se mueve acá arriba en mobile */}
          <Tooltip title="Observación">
            <IconButton size="small" onClick={() => setShowObs(s => !s)} sx={{
              flexShrink: 0,
              color: obs ? '#f59e0b' : 'text.disabled',
              bgcolor: obs ? alpha('#f59e0b', 0.1) : 'transparent',
              '&:hover': { color: '#f59e0b', bgcolor: alpha('#f59e0b', 0.08) },
            }}>
              {showObs ? <ExpandLessIcon fontSize="small" /> : <CommentRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Fila inferior en mobile / misma fila en desktop: botones de estado */}
        <Box sx={{
          display: 'flex',
          gap: 0.5,
          flexShrink: 0,
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          pl: { xs: '52px', sm: 0 }, // alinea con el nombre (22px num + 36px avatar aprox + gaps)
        }}>
          {ESTADOS_CONFIG.map(op => (
            <BtnEstado key={op.value} cfg={op} selected={estadoActual === op.value} onClick={() => handleEstado(op.value)} />
          ))}
        </Box>
      </Box>

      <Collapse in={showObs}>
        <Box sx={{ px: 2, pb: 2 }}>
          <TextField size="small" fullWidth placeholder="Observación (opcional)"
            value={obs}
            onChange={e => setObs(e.target.value)}
            onBlur={() => estadoActual && onMarcar(est.matricula_id, { observaciones: obs || undefined })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

const SeccionLista: React.FC<{
  asignacionId: number;
  fecha: string;
  onGuardadoExito: () => void;
}> = ({ asignacionId, fecha, onGuardadoExito }) => {
  const { isDark, gold, gradBg } = usePalette();
  const {
    lista, marcaciones, isLoading, isSaving, porcentajeCompletado,
    cargarLista, marcarEstudiante, marcarTodos, guardarMasivo,
  } = useListaDia();

  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarLista(asignacionId, fecha);
  }, [asignacionId, fecha]);

  const listaFiltrada = busqueda.trim()
    ? lista.filter(e =>
      `${e.estudiante_nombres} ${e.estudiante_apellidos} ${e.estudiante_codigo}`
        .toLowerCase().includes(busqueda.toLowerCase())
    )
    : lista;

  const marcados = Object.keys(marcaciones).length;
  const isComplete = porcentajeCompletado === 100;

  const handleGuardar = async () => {
    const ok = await guardarMasivo(asignacionId, fecha);
    if (ok) onGuardadoExito();
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={28} sx={{ color: gold }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Cargando lista...
        </Typography>
      </Box>
    );
  }

  if (lista.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 7 }}>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Sin estudiantes en esta materia
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra de progreso */}
      <Box sx={{
        p: 2.5, borderRadius: '12px', mb: 3,
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" fontWeight={700}>Progreso del pase</Typography>
          <Typography variant="body2" fontWeight={800} sx={{ color: isComplete ? '#10b981' : gold }}>
            {marcados} / {lista.length} ({porcentajeCompletado}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate" value={porcentajeCompletado}
          sx={{
            height: 8, borderRadius: 4,
            bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
            '& .MuiLinearProgress-bar': {
              background: isComplete ? 'linear-gradient(90deg,#10b981,#34d399)' : gradBg,
              borderRadius: 4,
            },
          }}
        />
        {isComplete && (
          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, mt: 0.5, display: 'block' }}>
            ✓ Lista completa — lista para guardar
          </Typography>
        )}
      </Box>

      {/* Controles */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Buscar estudiante..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.disabled" fontWeight={700}>Todos:</Typography>
          {ESTADOS_CONFIG.slice(0, 3).map(op => (
            <Tooltip key={op.value} title={`Marcar todos: ${op.label}`}>
              <Box
                onClick={() => marcarTodos(op.value)}
                sx={{
                  px: 1.5, py: 0.6, borderRadius: 2, cursor: 'pointer',
                  border: `1.5px solid ${alpha(op.color, 0.4)}`,
                  color: op.color, fontWeight: 800, fontSize: 12,
                  bgcolor: alpha(op.color, 0.06),
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: alpha(op.color, 0.15) },
                }}
              >
                {op.labelCorto}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Lista */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        {listaFiltrada.map((est, i) => (
          <FilaEstudianteLista
            key={est.matricula_id}
            est={est} num={i + 1}
            marcacion={marcaciones[est.matricula_id]}
            onMarcar={marcarEstudiante}
          />
        ))}
      </Stack>

      {/* Footer guardar */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        p: 2.5, borderRadius: '12px',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {marcados} de {lista.length} marcados
          </Typography>
          {marcados < lista.length && (
            <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
              {lista.length - marcados} sin marcar
            </Typography>
          )}
        </Box>
        <Button
          variant="contained" size="large"
          onClick={handleGuardar}
          disabled={isSaving || marcados === 0}
          startIcon={isSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveRoundedIcon />}
          sx={{
            background: marcados > 0 ? gradBg : undefined,
            color: '#fff', fontWeight: 800,
            px: 4, py: 1.2, borderRadius: 2.5,
            textTransform: 'none', fontSize: '0.95rem',
            boxShadow: marcados > 0 ? `0 4px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.35)}` : undefined,
            '&:hover': { background: marcados > 0 ? gradBg : undefined, filter: 'brightness(1.08)' },
            '&:disabled': { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06), color: 'text.disabled' },
          }}
        >
          {isSaving ? 'Guardando...' : `Guardar lista (${marcados})`}
        </Button>
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════
// SECCIÓN: RESUMEN
// ═══════════════════════════════════════════════════════

const getPctColor = (p: number) => p >= 80 ? '#10b981' : p >= 65 ? '#f59e0b' : '#ef4444';
const getPctGrad = (p: number) =>
  p >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' :
    p >= 65 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
      'linear-gradient(90deg,#ef4444,#f87171)';

// Modal de corrección individual
const ModalCorreccion: React.FC<{
  open: boolean;
  estudiante: EstudianteReporteClase | null;
  asignacionId: number;
  onClose: () => void;
  onExito: () => void;
}> = ({ open, estudiante, asignacionId, onClose, onExito }) => {
  const { isDark, gold, gradBg } = usePalette();
  const [registros, setRegistros] = useState<Asistencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [descargando, setDescargando] = useState<'pdf' | 'excel' | null>(null);
  const { corregir, isSubmitting } = useCorregirAsistencia(onExito);

  useEffect(() => {
    if (!open || !estudiante) return;
    setIsLoading(true);
    asistenciaService.listar({ matricula_id: estudiante.matricula_id, asignacion_docente_id: asignacionId, limit: 60 })
      .then(res => setRegistros(res.data.asistencias))
      .catch(() => setRegistros([]))
      .finally(() => setIsLoading(false));
  }, [open, estudiante, asignacionId]);

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    if (!estudiante) return;
    setDescargando(formato);
    try {
      await descargarReporteEstudiante({
        matricula_id: estudiante.matricula_id,
        asignacion_docente_id: asignacionId,
        codigo_estudiante: estudiante.estudiante_codigo,
        formato,
      });
      toast.success(`Reporte descargado (${formato.toUpperCase()})`);
    } catch { toast.error('Error al generar el reporte'); }
    finally { setDescargando(null); }
  };

  if (!open || !estudiante) return null;

  const pct = Number(estudiante.porcentaje_asistencia ?? 0);
  const color = getPctColor(pct);

  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <Box onClick={e => e.stopPropagation()} sx={{
        width: '100%', maxWidth: 560, maxHeight: '85vh',
        borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        bgcolor: isDark ? '#1e1e2e' : '#fff',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
        boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              width: 48, height: 48, fontWeight: 800, fontSize: 15,
              background: getPctGrad(pct), border: `2px solid ${alpha(color, 0.3)}`,
            }}>
              {estudiante.estudiante_nombres[0]}{estudiante.estudiante_apellidos[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={900}>
                {estudiante.estudiante_apellidos}, {estudiante.estudiante_nombres}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">{estudiante.estudiante_codigo}</Typography>
                <Chip label={`${pct}%`} size="small" sx={{
                  height: 20, fontSize: 10, fontWeight: 800,
                  bgcolor: alpha(color, 0.15), color,
                  border: `1px solid ${alpha(color, 0.3)}`,
                }} />
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Mini stats */}
          <Box sx={{ display: 'flex', gap: 0.8, mt: 2, flexWrap: 'wrap' }}>
            {[
              { v: estudiante.presentes, c: '#10b981', l: 'P' },
              { v: estudiante.ausentes, c: '#ef4444', l: 'A' },
              { v: estudiante.tardanzas, c: '#f59e0b', l: 'T' },
              { v: estudiante.justificados, c: '#3b82f6', l: 'J' },
            ].map(s => (
              <Box key={s.l} sx={{
                px: 1.2, py: 0.4, borderRadius: 1.5,
                bgcolor: alpha(s.c, isDark ? 0.15 : 0.1),
                border: `1px solid ${alpha(s.c, 0.25)}`,
                display: 'flex', gap: 0.5,
              }}>
                <Typography variant="caption" fontWeight={900} sx={{ color: s.c }}>{s.v}</Typography>
                <Typography variant="caption" color="text.disabled" fontWeight={700}>{s.l}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Historial */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={22} sx={{ color: gold }} />
            </Box>
          ) : registros.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Sin registros de asistencia
            </Typography>
          ) : (
            <Stack spacing={1}>
              {registros.map(r => (
                <FilaRegistroEditable
                  key={r.id} registro={r}
                  onGuardar={async (id, data) => {
                    const ok = await corregir(id, data);
                    if (ok) {
                      // Recargar registros
                      const res = await asistenciaService.listar({
                        matricula_id: estudiante.matricula_id,
                        asignacion_docente_id: asignacionId, limit: 60,
                      });
                      setRegistros(res.data.asistencias);
                    }
                    return ok;
                  }}
                  isSaving={isSubmitting}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer exportación */}
        <Box sx={{
          p: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="text.disabled" fontWeight={700}>Exportar:</Typography>
            {(['pdf', 'excel'] as const).map(fmt => (
              <Button key={fmt} size="small"
                onClick={() => handleExportar(fmt)}
                disabled={!!descargando}
                startIcon={descargando === fmt
                  ? <CircularProgress size={12} sx={{ color: '#fff' }} />
                  : fmt === 'pdf'
                    ? <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} />
                    : <TableChartRoundedIcon sx={{ fontSize: 14 }} />
                }
                sx={{
                  textTransform: 'none', fontWeight: 700, fontSize: 12,
                  borderRadius: 1.5, px: 1.5, py: 0.5, color: '#fff',
                  background: fmt === 'pdf'
                    ? 'linear-gradient(135deg,#ef4444,#f87171)'
                    : 'linear-gradient(135deg,#10b981,#34d399)',
                  '&:disabled': { background: alpha('#9ca3af', 0.3), color: 'text.disabled' },
                }}
              >
                {descargando === fmt ? '...' : fmt.toUpperCase()}
              </Button>
            ))}
          </Box>
          <Button onClick={onClose} variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const FilaRegistroEditable: React.FC<{
  registro: Asistencia;
  onGuardar: (id: number, data: CorregirAsistenciaDTO) => Promise<boolean>;
  isSaving: boolean;
}> = ({ registro, onGuardar, isSaving }) => {
  const { isDark } = usePalette();
  const [editando, setEditando] = useState(false);
  const [estadoEdit, setEstadoEdit] = useState<EstadoAsistencia>(registro.estado);
  const [justificacion, setJustificacion] = useState(registro.justificacion ?? '');
  const [observaciones, setObservaciones] = useState(registro.observaciones ?? '');

  const cfg = getEstCfg(registro.estado);
  const color = cfg?.color ?? '#9ca3af';

  const fecha = new Date(registro.fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const handleGuardar = async () => {
    const ok = await onGuardar(registro.id, { estado: estadoEdit, justificacion: justificacion || undefined, observaciones: observaciones || undefined });
    if (ok) setEditando(false);
  };

  return (
    <Box sx={{
      borderRadius: '10px',
      border: `1.5px solid ${alpha(color, editando ? 0.4 : 0.15)}`,
      bgcolor: isDark ? alpha(color, 0.06) : alpha(color, 0.03),
      overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(color, 0.15),
        }}>
          <Typography variant="caption" fontWeight={900} sx={{ color, fontSize: 12 }}>
            {cfg?.labelCorto ?? '?'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color }}>{cfg?.label}</Typography>
          <Typography variant="caption" color="text.disabled">{fecha} · {registro.hora_marcacion}</Typography>
        </Box>
        <Tooltip title={editando ? 'Cancelar' : 'Corregir'}>
          <IconButton size="small" onClick={() => setEditando(e => !e)} sx={{
            color: editando ? '#ef4444' : isDark ? '#facc15' : '#0288d1',
            bgcolor: editando ? alpha('#ef4444', 0.1) : alpha(isDark ? '#facc15' : '#0288d1', 0.08),
          }}>
            {editando ? <CloseRoundedIcon fontSize="small" /> : <EditRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={editando}>
        <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${alpha(color, 0.15)}`, pt: 1.5 }}>
          <Select fullWidth size="small" value={estadoEdit}
            onChange={e => setEstadoEdit(e.target.value as EstadoAsistencia)}
            sx={{ mb: 1, borderRadius: 2, fontSize: 14, fontWeight: 700 }}
          >
            {ESTADOS_CONFIG.map(op => (
              <MenuItem key={op.value} value={op.value}>
                <Typography variant="body2" fontWeight={700} sx={{ color: op.color }}>{op.label}</Typography>
              </MenuItem>
            ))}
          </Select>
          <TextField fullWidth size="small" placeholder="Justificación (opcional)"
            value={justificacion} onChange={e => setJustificacion(e.target.value)}
            sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
          />
          <TextField fullWidth size="small" placeholder="Observaciones (opcional)"
            value={observaciones} onChange={e => setObservaciones(e.target.value)}
            sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
          />
          <Button fullWidth variant="contained" size="small"
            onClick={handleGuardar} disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveRoundedIcon />}
            sx={{
              borderRadius: 2, fontWeight: 800, textTransform: 'none',
              background: 'linear-gradient(135deg,#10b981,#34d399)',
              '&:hover': { background: 'linear-gradient(135deg,#059669,#10b981)' },
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar corrección'}
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

const SeccionResumen: React.FC<{
  asignacionId: number;
  triggerRecarga: number;
}> = ({ asignacionId, triggerRecarga }) => {
  const { isDark, gold, gradBg } = usePalette();
  const { estudiantes, resumen, isLoading, cargar, refrescar } = useReporteClase();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'criticos' | 'perfectos'>('todos');
  const [estudianteModal, setEstudianteModal] = useState<EstudianteReporteClase | null>(null);
  const [descargando, setDescargando] = useState<'pdf' | 'excel' | null>(null);

  useEffect(() => { cargar(asignacionId); }, [asignacionId, triggerRecarga]);

  const filtrados = React.useMemo(() => {
    let lista = [...estudiantes];
    if (filtro === 'criticos') lista = lista.filter(e => Number(e.porcentaje_asistencia) < 70);
    if (filtro === 'perfectos') lista = lista.filter(e => Number(e.porcentaje_asistencia) === 100);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(e =>
        `${e.estudiante_nombres} ${e.estudiante_apellidos} ${e.estudiante_codigo}`.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [estudiantes, busqueda, filtro]);

  const handleExportarClase = async (formato: 'pdf' | 'excel') => {
    setDescargando(formato);
    try {
      await descargarPeriodoClase({ asignacion_docente_id: asignacionId, formato });
      toast.success(`Reporte descargado (${formato.toUpperCase()})`);
    } catch { toast.error('Error al generar el reporte'); }
    finally { setDescargando(null); }
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={28} sx={{ color: gold }} />
      </Box>
    );
  }

  if (!resumen) {
    return (
      <Box sx={{ textAlign: 'center', py: 7 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Sin datos de asistencia aún. Pasá lista para ver el resumen.
        </Typography>
      </Box>
    );
  }

  const promedio = Number(resumen.promedio_asistencia ?? 0);

  return (
    <Box>
      {/* Header resumen */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2, mb: 3, p: 2.5, borderRadius: '12px',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoGraphRoundedIcon sx={{ color: gold, fontSize: 24 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{
              background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Resumen de asistencia
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {resumen.total_estudiantes} estudiantes · {resumen.total_dias_registrados} días registrados
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box onClick={() => refrescar()} sx={{
            display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
            color: 'text.disabled', fontSize: 12, fontWeight: 600,
            '&:hover': { color: gold },
          }}>
            <RefreshRoundedIcon sx={{ fontSize: 16 }} />
            Refrescar
          </Box>
          <Box sx={{
            px: 2.5, py: 1, borderRadius: 2.5,
            background: getPctGrad(promedio),
            boxShadow: `0 4px 14px ${alpha(getPctColor(promedio), 0.35)}`,
          }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
              {Math.round(promedio)}%
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.9), fontSize: 10 }}>Promedio</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5, mb: 3,
      }}>
        {[
          { label: 'Estudiantes', value: resumen.total_estudiantes, color: '#3b82f6' },
          { label: 'Días registrados', value: resumen.total_dias_registrados, color: '#8b5cf6' },
          { label: 'Presentes', value: resumen.presentes, color: '#10b981' },
          { label: 'Ausentes', value: resumen.ausentes, color: '#ef4444' },
          { label: 'Tardanzas', value: resumen.tardanzas, color: '#f59e0b' },
          { label: 'Críticos <70%', value: resumen.estudiantes_criticos, color: '#ef4444' },
        ].map(s => (
          <Box key={s.label} sx={{
            p: 2, borderRadius: '12px',
            border: `1.5px solid ${alpha(s.color, 0.2)}`,
            bgcolor: isDark ? alpha(s.color, 0.08) : alpha(s.color, 0.04),
          }}>
            <Typography variant="h5" fontWeight={900} sx={{ color: s.color, lineHeight: 1, mb: 0.5 }}>
              {s.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Exportar clase */}
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
        p: 2, borderRadius: '12px', mb: 3,
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}>
        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
          📊 Reporte de clase
        </Typography>
        {(['pdf', 'excel'] as const).map(fmt => (
          <Button key={fmt} size="small"
            onClick={() => handleExportarClase(fmt)}
            disabled={!!descargando}
            startIcon={descargando === fmt
              ? <CircularProgress size={12} sx={{ color: '#fff' }} />
              : fmt === 'pdf'
                ? <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} />
                : <TableChartRoundedIcon sx={{ fontSize: 14 }} />
            }
            sx={{
              textTransform: 'none', fontWeight: 700, fontSize: 12,
              borderRadius: 1.5, px: 1.5, py: 0.5, color: '#fff',
              background: fmt === 'pdf'
                ? 'linear-gradient(135deg,#ef4444,#f87171)'
                : 'linear-gradient(135deg,#10b981,#34d399)',
              boxShadow: `0 2px 8px ${alpha(fmt === 'pdf' ? '#ef4444' : '#10b981', 0.3)}`,
              '&:disabled': { background: alpha('#9ca3af', 0.3), color: 'text.disabled', boxShadow: 'none' },
            }}
          >
            {descargando === fmt ? 'Generando...' : fmt.toUpperCase()}
          </Button>
        ))}
      </Box>

      {/* Filtros */}
      <Box sx={{
        display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3,
        p: 2, borderRadius: '12px',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}>
        <TextField size="small" placeholder="Buscar estudiante..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1, minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: 14 } }}
        />
        <ToggleButtonGroup value={filtro} exclusive onChange={(_, v) => v && setFiltro(v)} size="small"
          sx={{ '& .MuiToggleButton-root': { borderRadius: '8px !important', px: 1.5, fontWeight: 700, fontSize: 12, textTransform: 'none' } }}
        >
          <ToggleButton value="todos">Todos ({estudiantes.length})</ToggleButton>
          <ToggleButton value="criticos" sx={{ color: '#ef4444', '&.Mui-selected': { bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' } }}>
            ⚠️ Críticos ({resumen.estudiantes_criticos})
          </ToggleButton>
          <ToggleButton value="perfectos" sx={{ color: '#10b981', '&.Mui-selected': { bgcolor: alpha('#10b981', 0.1), color: '#10b981' } }}>
            🏆 100% ({estudiantes.filter(e => Number(e.porcentaje_asistencia) === 100).length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Lista estudiantes */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {filtrados.map((est, i) => {
          const pct = Number(est.porcentaje_asistencia ?? 0);
          const color = getPctColor(pct);
          return (
            <Box key={est.matricula_id} sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              gap: { xs: 1.2, md: 2 },
              p: 1.5, borderRadius: '12px',
              border: `1.5px solid ${alpha(color, Number(pct) < 70 ? 0.25 : 0.1)}`,
              bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.02),
              transition: 'all 0.15s',
              '&:hover': { transform: { md: 'translateX(4px)' }, '& .btn-corregir': { opacity: 1 } },
            }}>

              {/* Bloque 1: número + avatar + nombre — order 1 en ambos */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, order: 1, flex: { md: '1 1 auto' } }}>
                <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ minWidth: 22, textAlign: 'center', flexShrink: 0 }}>
                  {i + 1}
                </Typography>
                <Avatar src={est.estudiante_foto ?? undefined} sx={{
                  width: 36, height: 36, fontSize: 12, fontWeight: 800, flexShrink: 0,
                  background: getPctGrad(pct), border: `2px solid ${alpha(color, 0.3)}`,
                }}>
                  {est.estudiante_nombres[0]}{est.estudiante_apellidos[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="body2" fontWeight={800} noWrap>
                      {est.estudiante_apellidos}, {est.estudiante_nombres}
                    </Typography>
                    {Number(pct) < 70 && (
                      <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#ef4444', flexShrink: 0 }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.disabled">{est.estudiante_codigo}</Typography>
                </Box>
              </Box>

              {/* Bloque 2: stats + barra — order 2 en ambos */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, md: 2 },
                pl: { xs: '52px', md: 0 },
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                order: 2,
                flexShrink: 0,
              }}>
                {/* Stats mini */}
                <Box sx={{ display: 'flex', gap: 0.7, flexShrink: 0 }}>
                  {[
                    { v: est.presentes, c: '#10b981', l: 'P' },
                    { v: est.ausentes, c: '#ef4444', l: 'A' },
                    { v: est.tardanzas, c: '#f59e0b', l: 'T' },
                    { v: est.justificados, c: '#3b82f6', l: 'J' },
                  ].map(s => (
                    <Box key={s.l} sx={{
                      px: 1, py: 0.3, borderRadius: 1.5,
                      bgcolor: alpha(s.c, isDark ? 0.15 : 0.1),
                      border: `1px solid ${alpha(s.c, 0.22)}`,
                      display: 'flex', alignItems: 'center', gap: 0.4,
                    }}>
                      <Typography variant="caption" fontWeight={800} sx={{ color: s.c, fontSize: 11 }}>{s.v}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, fontWeight: 700 }}>{s.l}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Barra % */}
                <Box sx={{ flex: { xs: 1, md: 'unset' }, width: { xs: 'auto', md: 90 }, minWidth: { xs: 100, md: 90 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>Asistencia</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color, fontSize: 10 }}>{pct}%</Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06), overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, background: getPctGrad(pct), borderRadius: 3 }} />
                  </Box>
                </Box>
              </Box>

              {/* Botón corregir — order 0 en mobile (aparece pegado al nombre arriba), order 3 en desktop (al final) */}
              <Tooltip title="Ver historial / corregir">
                <Box
                  className="btn-corregir"
                  onClick={() => setEstudianteModal(est)}
                  sx={{
                    opacity: { xs: 1, md: 0 },
                    transition: 'opacity 0.15s',
                    width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: isDark ? alpha(gold, 0.12) : alpha(gold, 0.08),
                    border: `1px solid ${alpha(gold, 0.25)}`,
                    cursor: 'pointer', flexShrink: 0,
                    order: { xs: -1, md: 3 },
                    alignSelf: { xs: 'flex-start', md: 'center' },
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  <EditRoundedIcon sx={{ fontSize: 15, color: gold }} />
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Stack>

      {/* Modal corrección */}
      <ModalCorreccion
        open={!!estudianteModal}
        estudiante={estudianteModal}
        asignacionId={asignacionId}
        onClose={() => setEstudianteModal(null)}
        onExito={() => { refrescar(); setEstudianteModal(null); }}
      />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════
// SECCIÓN: PERMISOS
// ═══════════════════════════════════════════════════════

const SeccionPermisos: React.FC<{ asignacionId: number }> = ({ asignacionId }) => {
  const { isDark, gold, gradBg } = usePalette();
  const {
    solicitudes, isLoading, isSubmitting, cambiarEstado,
  } = useSolicitudesPermiso({ estado: 'pendiente', asignacion_docente_id: asignacionId, limit: 50 });

  const [rechazarId, setRechazarId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [historialMap, setHistorialMap] = useState<Record<number, HistorialPermiso[]>>({});
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  const handleAprobar = async (id: number) => {
    await cambiarEstado(id, { estado: 'aprobada' });
  };

  const handleRechazar = async () => {
    if (!rechazarId) return;
    const ok = await cambiarEstado(rechazarId, { estado: 'rechazada', motivo_rechazo: motivoRechazo });
    if (ok) { setRechazarId(null); setMotivoRechazo(''); }
  };

  const toggleExpand = async (id: number) => {
    const next = new Set(expandidos);
    if (next.has(id)) { next.delete(id); }
    else {
      next.add(id);
      if (!historialMap[id]) {
        try {
          const res = await solicitudPermisoService.obtenerHistorial(id);
          setHistorialMap(prev => ({ ...prev, [id]: res.data.historial }));
        } catch { }
      }
    }
    setExpandidos(next);
  };

  if (isLoading) return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <CircularProgress size={28} sx={{ color: gold }} />
    </Box>
  );

  if (solicitudes.length === 0) return (
    <Box sx={{
      textAlign: 'center', py: 8, borderRadius: '16px',
      border: `2px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
    }}>
      <NotificationsActiveIcon sx={{ fontSize: 44, color: 'text.disabled', opacity: 0.4, mb: 1.5 }} />
      <Typography variant="h6" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
        Sin permisos pendientes
      </Typography>
      <Typography variant="body2" color="text.disabled">
        No hay solicitudes por revisar para esta materia
      </Typography>
    </Box>
  );

  return (
    <Stack spacing={2}>
      {solicitudes.map(s => {
        const motivo = MOTIVOS_PERMISO.find(m => m.value === s.motivo);
        const nombreEst = `${s.estudiante_apellidos}, ${s.estudiante_nombres}`;
        const fecha = new Date(s.fecha_ausencia + 'T12:00:00').toLocaleDateString('es-BO', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        });
        const diff = Math.ceil((new Date(s.fecha_ausencia + 'T12:00:00').getTime() - Date.now()) / 86400000);
        const urgente = diff <= 1;
        const expandido = expandidos.has(s.id);

        return (
          <Box key={s.id} sx={{
            borderRadius: '14px',
            border: `1.5px solid ${urgente ? alpha('#f59e0b', 0.4) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            bgcolor: urgente
              ? isDark ? alpha('#f59e0b', 0.06) : alpha('#f59e0b', 0.03)
              : isDark ? alpha('#fff', 0.02) : '#fff',
          }}>
            <Box sx={{ p: 2 }}>
              {/* Header permiso */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                <Avatar sx={{
                  width: 40, height: 40, fontSize: 12, fontWeight: 800,
                  bgcolor: urgente ? alpha('#f59e0b', 0.7) : alpha('#3b82f6', 0.6),
                }}>
                  {s.estudiante_nombres?.[0]}{s.estudiante_apellidos?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                    <Typography variant="body2" fontWeight={800}>{nombreEst}</Typography>
                    {urgente && (
                      <Chip label={diff <= 0 ? '¡HOY!' : '¡MAÑANA!'} size="small" sx={{
                        height: 20, fontSize: 10, fontWeight: 900,
                        bgcolor: alpha('#f59e0b', 0.15), color: '#d97706',
                        border: `1px solid ${alpha('#f59e0b', 0.35)}`,
                      }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={`${motivo?.icon} ${motivo?.label}`} size="small" sx={{
                      height: 22, fontSize: 11, fontWeight: 600,
                      bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.04),
                    }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <CalendarMonthIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{fecha}</Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => toggleExpand(s.id)} sx={{ color: 'text.disabled' }}>
                  {expandido ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button fullWidth variant="contained" size="small"
                  onClick={() => handleAprobar(s.id)} disabled={isSubmitting}
                  startIcon={<CheckCircleRoundedIcon fontSize="small" />}
                  sx={{
                    background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff',
                    fontWeight: 800, textTransform: 'none', borderRadius: 2,
                    '&:hover': { background: 'linear-gradient(135deg,#059669,#10b981)' },
                    '&:disabled': { background: alpha('#9ca3af', 0.3), color: 'text.disabled' },
                  }}
                >
                  Aprobar
                </Button>
                <Button fullWidth variant="outlined" size="small"
                  onClick={() => setRechazarId(s.id)} disabled={isSubmitting}
                  startIcon={<CancelRoundedIcon fontSize="small" />}
                  sx={{
                    borderColor: '#ef4444', borderWidth: 1.5, color: '#ef4444',
                    fontWeight: 800, textTransform: 'none', borderRadius: 2,
                    '&:hover': { borderWidth: 1.5, bgcolor: alpha('#ef4444', 0.06) },
                  }}
                >
                  Rechazar
                </Button>
              </Box>
            </Box>

            {/* Detalle expandible */}
            <Collapse in={expandido}>
              <Box sx={{
                px: 2, pb: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`, pt: 1.5,
              }}>
                {s.descripcion && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10 }}>
                      Descripción
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{s.descripcion}</Typography>
                  </Box>
                )}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10 }}>
                    Tipo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                    {s.es_dia_completo ? 'Día completo' : `Parcial: ${s.hora_inicio} – ${s.hora_fin}`}
                  </Typography>
                </Box>
                {s.archivo_adjunto_url && (
                  <Button size="small" variant="outlined" startIcon={<AttachFileIcon />}
                    href={s.archivo_adjunto_url} target="_blank"
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, mb: 1.5 }}
                  >
                    Ver adjunto
                  </Button>
                )}
                {/* Historial */}
                {historialMap[s.id]?.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10, display: 'block', mb: 1 }}>
                      Historial
                    </Typography>
                    <Stack spacing={0.75}>
                      {historialMap[s.id].map((h, i) => {
                        const colorNuevo = ESTADOS_PERMISO.find(e => e.value === h.estado_nuevo)?.color ?? '#9ca3af';
                        return (
                          <Box key={h.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', pl: 1.5, borderLeft: `2px solid ${alpha(colorNuevo, 0.4)}` }}>
                            <Box sx={{ flex: 1 }}>
                              <Chip label={h.estado_nuevo} size="small" sx={{
                                height: 18, fontSize: 10, fontWeight: 700,
                                bgcolor: alpha(colorNuevo, 0.12), color: colorNuevo,
                              }} />
                              {h.comentario && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 11 }}>
                                  {h.comentario}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                                {new Date(h.created_at).toLocaleString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {/* Modal rechazo */}
      {rechazarId !== null && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 1300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }} onClick={() => setRechazarId(null)}>
          <Box onClick={e => e.stopPropagation()} sx={{
            width: '100%', maxWidth: 420, borderRadius: '16px', p: 3,
            bgcolor: isDark ? '#1e1e2e' : '#fff',
            border: `1.5px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Rechazar solicitud</Typography>
            <TextField fullWidth multiline rows={3} size="small"
              label="Motivo del rechazo" placeholder="Ingresá el motivo..."
              value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button onClick={() => setRechazarId(null)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleRechazar}
                disabled={!motivoRechazo.trim() || isSubmitting}
                sx={{
                  textTransform: 'none', fontWeight: 800, borderRadius: 2,
                  background: 'linear-gradient(135deg,#ef4444,#f87171)',
                  '&:disabled': { background: alpha('#9ca3af', 0.3), color: 'text.disabled' },
                }}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar rechazo'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Stack>
  );
};

// ═══════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════

export default function DocenteAsistenciaDetailPage() {
  const { isDark, gold, goldEnd, gradBg } = usePalette();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const asignacionId = Number(params.id);
  const fecha = searchParams.get('fecha') ?? new Date().toISOString().slice(0, 10);

  const { asignaciones, isLoading: loadingAsig } = useMisAsignaciones();
  const asignacion: AsignacionDocente | undefined = asignaciones.find(a => a.asignacion_id === asignacionId);

  const [tab, setTab] = useState(0);
  const [triggerResumen, setTriggerResumen] = useState(0);

  useEffect(() => {
    if (!loadingAsig && asignaciones.length > 0 && !asignacion) {
      router.replace('/dashboard/docente/asistencia');
    }
  }, [loadingAsig, asignaciones, asignacion, router]);

  if (loadingAsig || !asignacion) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <LinearProgress sx={{ borderRadius: 4, height: 4 }} />
        </Container>
      </Box>
    );
  }

  const fechaDisplay = new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3 }}>
            <Box onClick={() => router.push('/dashboard/docente/asistencia')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                '&:hover': { color: gold }, transition: 'color 0.15s',
              }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a mis materias
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EventAvailableIcon sx={{ color: gold, fontSize: 34 }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                    fontWeight: 800, background: gradBg,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {asignacion.materia_nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4, flexWrap: 'wrap' }}>
                    <Chip label={fechaDisplay} size="small"
                      sx={{
                        background: gradBg, color: isDark ? '#000' : '#fff',
                        fontWeight: 700, fontSize: 11, textTransform: 'capitalize',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {asignacion.grado_nombre} "{asignacion.paralelo_nombre}" · {asignacion.turno_nombre}
                      · {asignacion.total_estudiantes} estudiantes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ TABS ══ */}
        <Fade in timeout={450}>
          <Box sx={{ mb: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              sx={{
                background: gradBg, borderRadius: '16px', p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px', textTransform: 'none', fontWeight: 600, minHeight: 48,
                  color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.8),
                  '&:hover': { color: isDark ? '#000' : '#fff' },
                },
                '& .Mui-selected': { color: `${isDark ? '#000' : '#fff'} !important` },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0',
                },
              }}
            >
              {TABS.map(t => (
                <Tab key={t.key} label={t.label} />
              ))}
            </Tabs>
          </Box>
        </Fade>

        {/* ══ CONTENIDO ══ */}
        <Fade in timeout={500} key={tab}>
          <Box>
            {tab === 0 && (
              <SeccionLista
                asignacionId={asignacionId}
                fecha={fecha}
                onGuardadoExito={() => {
                  setTriggerResumen(n => n + 1);
                  setTab(1);
                }}
              />
            )}
            {tab === 1 && (
              <SeccionResumen asignacionId={asignacionId} triggerRecarga={triggerResumen} />
            )}
            {tab === 2 && (
              <SeccionPermisos asignacionId={asignacionId} />
            )}
          </Box>
        </Fade>

      </Container>
    </Box>
  );
}