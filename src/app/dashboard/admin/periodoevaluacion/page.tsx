'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Fade, Snackbar, Alert, alpha, useTheme,
  Grid, Card, CardContent, Avatar, Chip, Stack, Divider, Collapse,
  IconButton, Tooltip, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Switch,
  FormControlLabel, Paper, Skeleton, Tab, Tabs, Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockClockIcon from '@mui/icons-material/LockClock';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import TuneIcon from '@mui/icons-material/Tune';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BalanceIcon from '@mui/icons-material/Balance';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PaletteIcon from '@mui/icons-material/Palette';

import { usePeriodosEvaluacion } from '@/hooks/usePeriodosEvaluacion';
import { useDimensionesEvaluacion } from '@/hooks/useDimensionesEvaluacion';
import { useAcademicos } from '@/hooks/useAcademicos';
import { PeriodoConEstado, PeriodoEvaluacionFormData } from '@/types/periodoEvaluacion';
import { DimensionEvaluacion, DimensionEvaluacionFormData, validarSumaPorcentajes } from '@/types/dimensionEvaluacion';
import { PeriodoAcademico } from '@/services/academicos';

// ─── Helpers comunes ─────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  activo:     { label: 'En curso',  color: '#10B981', icon: <PlayCircleIcon  sx={{ fontSize: 16 }} />, bg: 'rgba(16,185,129,0.12)' },
  proximo:    { label: 'Próximo',   color: '#3B82F6', icon: <AccessTimeIcon  sx={{ fontSize: 16 }} />, bg: 'rgba(59,130,246,0.12)'  },
  finalizado: { label: 'Finalizado',color: '#6B7280', icon: <CheckCircleIcon sx={{ fontSize: 16 }} />, bg: 'rgba(107,114,128,0.12)' },
};

const PERIODO_COLORS = ['#6366F1', '#0EA5E9', '#F59E0B', '#EC4899', '#10B981'];
const COLOR_OPTIONS   = ['#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#6366F1','#0EA5E9','#F97316','#14B8A6'];

function getPeriodoColor(idx: number) { return PERIODO_COLORS[idx % PERIODO_COLORS.length]; }

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <Card sx={{
      borderRadius: 3, border: `1px solid ${alpha(color, 0.25)}`,
      background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.03)})`,
      transition: 'all .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${alpha(color, 0.2)}` }
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 44, height: 44, borderRadius: 2 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: PERÍODOS (trimestres por año académico)
// ═══════════════════════════════════════════════════════════════════════════════

function PeriodoEvaluacionCard({ periodo, onEdit, onToggle }: {
  periodo: PeriodoConEstado;
  onEdit: (p: PeriodoConEstado) => void;
  onToggle: (p: PeriodoConEstado) => void;
}) {
  const theme = useTheme();
  const cfg = ESTADO_CONFIG[periodo.estado];
  const barColor = periodo.estado === 'activo' ? '#10B981' : periodo.estado === 'proximo' ? '#3B82F6' : '#9CA3AF';

  return (
    <Card sx={{
      borderRadius: 3, position: 'relative', overflow: 'visible', transition: 'all .25s',
      border: `2px solid ${periodo.estado === 'activo' ? alpha(cfg.color, 0.45) : alpha(theme.palette.divider, 0.8)}`,
      opacity: periodo.activo ? 1 : 0.6,
      '&:hover': { boxShadow: `0 10px 28px ${alpha(cfg.color, 0.18)}`, transform: 'translateY(-4px)' }
    }}>
      <Box sx={{
        position: 'absolute', top: -14, left: 20,
        bgcolor: barColor, color: 'white', borderRadius: 2, px: 1.5, py: 0.3,
        fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1,
        boxShadow: `0 4px 12px ${alpha(barColor, 0.4)}`
      }}>
        T{periodo.orden}
      </Box>
      <CardContent sx={{ pt: 3, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.2, mb: 0.5 }}>{periodo.nombre}</Typography>
            {periodo.codigo && <Typography variant="caption" color="text.secondary" fontWeight="600">{periodo.codigo}</Typography>}
          </Box>
          <Chip icon={cfg.icon} label={cfg.label} size="small"
            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, border: `1px solid ${alpha(cfg.color, 0.3)}`, ml: 1, flexShrink: 0 }} />
        </Stack>

        <Stack spacing={0.5} mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatFecha(periodo.fecha_inicio)} — {formatFecha(periodo.fecha_fin)}
            </Typography>
          </Stack>
          {periodo.diasRestantes !== undefined && periodo.estado !== 'finalizado' && (
            <Typography variant="caption" sx={{ color: barColor, fontWeight: 700, pl: '23px' }}>
              {periodo.estado === 'activo' ? `${periodo.diasRestantes} días restantes` : `Inicia en ${periodo.diasRestantes} días`}
            </Typography>
          )}
        </Stack>

        {periodo.porcentajeAvance !== undefined && (
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">Avance</Typography>
              <Typography variant="caption" fontWeight="800" sx={{ color: barColor }}>{periodo.porcentajeAvance}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={periodo.porcentajeAvance} sx={{
              height: 8, borderRadius: 4, bgcolor: alpha(barColor, 0.15),
              '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 4 }
            }} />
          </Box>
        )}

        {periodo.observaciones && (
          <Typography variant="caption" color="text.secondary" sx={{
            display: 'block', mb: 1.5, p: 1, borderRadius: 1.5, bgcolor: alpha('#000', 0.04), fontStyle: 'italic'
          }}>{periodo.observaciones}</Typography>
        )}

        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tooltip title={periodo.activo ? 'Desactivar' : 'Activar'}>
            <IconButton size="small" onClick={() => onToggle(periodo)}
              sx={{ color: periodo.activo ? '#10B981' : 'text.disabled' }}>
              {periodo.activo ? <ToggleOnIcon sx={{ fontSize: 28 }} /> : <ToggleOffIcon sx={{ fontSize: 28 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(periodo)}
              sx={{ color: 'primary.main', bgcolor: alpha('#6366F1', 0.08), '&:hover': { bgcolor: alpha('#6366F1', 0.18) } }}>
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PeriodoAcademicoRow({ periodoAcademico, color, isExpanded, onToggleExpand, onAddPeriodo, onEditPeriodo, onTogglePeriodo }: {
  periodoAcademico: PeriodoAcademico; color: string; isExpanded: boolean;
  onToggleExpand: () => void; onAddPeriodo: (id: number) => void;
  onEditPeriodo: (p: PeriodoConEstado) => void; onTogglePeriodo: (p: PeriodoConEstado) => void;
}) {
  const theme = useTheme();
  const { periodos, loading: loadingHijos, estadisticas } = usePeriodosEvaluacion({ periodoAcademicoId: periodoAcademico.id });

  return (
    <Card sx={{
      borderRadius: 3, transition: 'all .2s',
      border: isExpanded ? `2px solid ${color}` : `1px solid ${theme.palette.divider}`,
      '&:hover': { boxShadow: `0 12px 32px ${alpha(color, 0.18)}` }
    }}>
      <Box onClick={onToggleExpand} sx={{ p: { xs: 2, md: 3 }, cursor: 'pointer' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 2, sm: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, flex: 1 }}>
            <Avatar sx={{ width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 }, bgcolor: color, borderRadius: 3 }}>
              <SchoolIcon sx={{ fontSize: { xs: 20, md: 28 }, color: 'white' }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Typography variant="h5" fontWeight="700"
                  sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
                  {periodoAcademico.nombre}
                </Typography>
                {periodoAcademico.codigo && (
                  <Chip label={periodoAcademico.codigo} size="small"
                    sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                )}
                {periodoAcademico.activo && (
                  <Chip label="Activo" size="small"
                    icon={<PlayCircleIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
                    sx={{ bgcolor: alpha('#10B981', 0.12), color: '#10B981', fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                )}
              </Stack>
              <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap" useFlexGap>
                <Chip label={`${estadisticas.total} trimestre${estadisticas.total !== 1 ? 's' : ''}`}
                  size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                {estadisticas.activos > 0 && (
                  <Chip label={`${estadisticas.activos} en curso`} size="small"
                    sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981', fontSize: '0.7rem', height: 22, fontWeight: 700 }} />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  {formatFecha(periodoAcademico.fecha_inicio)} — {formatFecha(periodoAcademico.fecha_fin)}
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
            <Tooltip title="Agregar trimestre">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAddPeriodo(periodoAcademico.id); }}
                sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}>
                <AddIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
              </IconButton>
            </Tooltip>
            <IconButton size="small" sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: alpha(color, 0.02) }}>
          {loadingHijos ? (
            <Grid container spacing={2}>{[1,2,3].map(n => <Grid size={{xs:12, sm:6, md:4}}  key={n}><Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} /></Grid>)}</Grid>
          ) : periodos.length === 0 ? (
            <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px dashed ${alpha(theme.palette.warning.main, 0.35)}`, borderRadius: 3 }}>
              <WarningAmberIcon sx={{ fontSize: 44, color: 'warning.main', mb: 1.5 }} />
              <Typography variant="h6" gutterBottom>Sin trimestres configurados</Typography>
              <Typography variant="body2" color="text.secondary" mb={2.5}>Creá los períodos de evaluación para este año académico</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAddPeriodo(periodoAcademico.id)} size="small" sx={{ borderRadius: 2.5, px: 3, fontWeight: 'bold' }}>
                Agregar primer trimestre
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {periodos.map((periodo, idx) => (
                <Grid size={{xs:12, sm:6, md:4}}  key={periodo.id}>
                  <Fade in timeout={300 + idx * 100}>
                    <Box><PeriodoEvaluacionCard periodo={periodo} onEdit={onEditPeriodo} onToggle={onTogglePeriodo} /></Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}

// ─── Form trimestre ───────────────────────────────────────────────────────────
const EMPTY_PERIODO: PeriodoEvaluacionFormData = {
  periodo_academico_id: 0, nombre: '', codigo: '', orden: 1,
  fecha_inicio: '', fecha_fin: '', activo: true, observaciones: '',
};

function PeriodoFormDialog({ open, onClose, onSave, editing, periodosAcademicos, defaultPeriodoAcademicoId }: {
  open: boolean; onClose: () => void; onSave: (d: PeriodoEvaluacionFormData) => Promise<void>;
  editing: PeriodoConEstado | null; periodosAcademicos: PeriodoAcademico[]; defaultPeriodoAcademicoId: number | null;
}) {
  const theme = useTheme();
  const [form, setForm] = useState<PeriodoEvaluacionFormData>(EMPTY_PERIODO);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (editing) {
      setForm({ periodo_academico_id: editing.periodo_academico_id, nombre: editing.nombre, codigo: editing.codigo || '',
        orden: editing.orden, fecha_inicio: editing.fecha_inicio.substring(0, 10),
        fecha_fin: editing.fecha_fin.substring(0, 10), activo: editing.activo, observaciones: editing.observaciones || '' });
    } else {
      setForm({ ...EMPTY_PERIODO, periodo_academico_id: defaultPeriodoAcademicoId || (periodosAcademicos[0]?.id ?? 0) });
    }
    setErrors({});
  }, [editing, open, defaultPeriodoAcademicoId, periodosAcademicos]);

  const set = (k: keyof PeriodoEvaluacionFormData, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.periodo_academico_id) errs.periodo_academico_id = 'Seleccioná un año académico';
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.fecha_inicio) errs.fecha_inicio = 'Requerida';
    if (!form.fecha_fin) errs.fecha_fin = 'Requerida';
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio >= form.fecha_fin) errs.fecha_fin = 'Debe ser posterior al inicio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', borderRadius: 2 }}>
            {editing ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="700">{editing ? 'Editar Trimestre' : 'Nuevo Trimestre'}</Typography>
            <Typography variant="caption" color="text.secondary">{editing ? editing.nombre : 'Configurá un período de evaluación'}</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>
          <TextField select label="Año académico" fullWidth required value={form.periodo_academico_id}
            onChange={e => set('periodo_academico_id', Number(e.target.value))}
            error={!!errors.periodo_academico_id} helperText={errors.periodo_academico_id}>
            {periodosAcademicos.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}{p.codigo ? ` (${p.codigo})` : ''}</MenuItem>)}
          </TextField>
          <Grid container spacing={2}>
            <Grid size={{xs:8}}>
              <TextField label="Nombre" fullWidth required value={form.nombre} onChange={e => set('nombre', e.target.value)}
                error={!!errors.nombre} helperText={errors.nombre} placeholder="Ej: Primer Trimestre" />
            </Grid>
            <Grid size={{xs:4}}>
              <TextField select label="Orden" fullWidth required value={form.orden} onChange={e => set('orden', Number(e.target.value))}>
                {[1,2,3].map(n => <MenuItem key={n} value={n}>{n}°</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          <TextField label="Código (opcional)" fullWidth value={form.codigo} onChange={e => set('codigo', e.target.value)} placeholder="Ej: T1-2025" />
          <Grid container spacing={2}>
            <Grid size={{xs:6}}>
              <TextField label="Fecha inicio" type="date" fullWidth required InputLabelProps={{ shrink: true }}
                value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)}
                error={!!errors.fecha_inicio} helperText={errors.fecha_inicio} />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField label="Fecha fin" type="date" fullWidth required InputLabelProps={{ shrink: true }}
                value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)}
                error={!!errors.fecha_fin} helperText={errors.fecha_fin} />
            </Grid>
          </Grid>
          <TextField label="Observaciones" multiline rows={2} fullWidth value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)} placeholder="Notas adicionales..." />
          <FormControlLabel
            control={<Switch checked={form.activo ?? true} onChange={e => set('activo', e.target.checked)} color="success" />}
            label={<Typography variant="body2" fontWeight="600">Período {form.activo ? 'activo' : 'inactivo'}</Typography>}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving} sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}>
          {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear trimestre'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: PONDERACIÓN (dimensiones de evaluación)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Card de dimensión ────────────────────────────────────────────────────────
function DimensionCard({ dimension, total, onEdit, onToggle, index }: {
  dimension: DimensionEvaluacion; total: number;
  onEdit: (d: DimensionEvaluacion) => void; onToggle: (d: DimensionEvaluacion) => void;
  index: number;
}) {
  const theme = useTheme();
  const color = dimension.color || PERIODO_COLORS[index % PERIODO_COLORS.length];
  const pct   = Number(dimension.porcentaje_ponderacion);

  return (
    <Card sx={{
      borderRadius: 3, transition: 'all .25s', position: 'relative', overflow: 'hidden',
      border: `2px solid ${dimension.activo ? alpha(color, 0.4) : alpha(theme.palette.divider, 0.6)}`,
      opacity: dimension.activo ? 1 : 0.55,
      '&:hover': { boxShadow: `0 10px 28px ${alpha(color, 0.2)}`, transform: 'translateY(-3px)' }
    }}>
      {/* Barra lateral de color */}
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: color, borderRadius: '12px 0 0 12px' }} />

      <CardContent sx={{ pl: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 44, height: 44, borderRadius: 2, fontWeight: 800, fontSize: '0.85rem' }}>
              {dimension.codigo}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.2 }}>{dimension.nombre}</Typography>
              {dimension.descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200 }}>
                  {dimension.descripcion}
                </Typography>
              )}
            </Box>
          </Box>
          {!dimension.activo && <Chip label="Inactivo" size="small" sx={{ bgcolor: alpha('#9CA3AF', 0.15), color: '#9CA3AF', fontWeight: 700 }} />}
        </Stack>

        {/* Porcentaje grande */}
        <Box sx={{ mb: 2, p: 2, borderRadius: 2.5, bgcolor: alpha(color, 0.07), textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="900" sx={{ color, lineHeight: 1 }}>
            {pct}%
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            de la nota final
          </Typography>
        </Box>

        {/* Barra visual */}
        <Box mb={2}>
          <LinearProgress variant="determinate" value={pct}
            sx={{ height: 10, borderRadius: 5, bgcolor: alpha(color, 0.15),
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 } }} />
        </Box>

        <Divider sx={{ mb: 1.5 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tooltip title={dimension.activo ? 'Desactivar dimensión' : 'Activar dimensión'}>
            <IconButton size="small" onClick={() => onToggle(dimension)}
              sx={{ color: dimension.activo ? '#10B981' : 'text.disabled' }}>
              {dimension.activo ? <ToggleOnIcon sx={{ fontSize: 28 }} /> : <ToggleOffIcon sx={{ fontSize: 28 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar dimensión">
            <IconButton size="small" onClick={() => onEdit(dimension)}
              sx={{ color: 'primary.main', bgcolor: alpha(color, 0.1), '&:hover': { bgcolor: alpha(color, 0.2) } }}>
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Indicador de suma ────────────────────────────────────────────────────────
function SumIndicator({ suma, esValida }: { suma: number; esValida: boolean }) {
  const theme = useTheme();
  const color  = esValida ? '#10B981' : suma > 100 ? '#EF4444' : '#F59E0B';
  const label  = esValida ? '✅ Ponderación correcta (100%)' : suma > 100 ? `⚠️ Excede el 100% (${suma}%)` : `⚠️ Faltan ${100 - suma}% para llegar al 100%`;

  return (
    <Paper elevation={0} sx={{
      p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2,
      border: `2px solid ${alpha(color, 0.4)}`,
      bgcolor: alpha(color, 0.06),
    }}>
      <Avatar sx={{ bgcolor: alpha(color, 0.15), color, borderRadius: 2, width: 44, height: 44 }}>
        {esValida ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight="700" sx={{ color }}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          La suma de dimensiones activas debe ser exactamente 100%
        </Typography>
      </Box>
      {/* Mini barra */}
      <Box sx={{ width: 120 }}>
        <LinearProgress variant="determinate" value={Math.min(suma, 100)}
          sx={{ height: 10, borderRadius: 5, bgcolor: alpha(color, 0.15),
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 } }} />
        <Typography variant="caption" fontWeight="800" sx={{ color, display: 'block', textAlign: 'right', mt: 0.3 }}>
          {suma}% / 100%
        </Typography>
      </Box>
    </Paper>
  );
}

// ─── Form dimensión ───────────────────────────────────────────────────────────
const EMPTY_DIMENSION: DimensionEvaluacionFormData = {
  nombre: '', codigo: '', descripcion: '', porcentaje_ponderacion: 0, color: '#3B82F6', orden: 1, activo: true,
};

function DimensionFormDialog({ open, onClose, onSave, editing, dimensiones }: {
  open: boolean; onClose: () => void;
  onSave: (d: DimensionEvaluacionFormData) => Promise<void>;
  editing: DimensionEvaluacion | null; dimensiones: DimensionEvaluacion[];
}) {
  const theme = useTheme();
  const [form, setForm] = useState<DimensionEvaluacionFormData>(EMPTY_DIMENSION);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (editing) {
      setForm({
        nombre: editing.nombre, codigo: editing.codigo, descripcion: editing.descripcion || '',
        porcentaje_ponderacion: Number(editing.porcentaje_ponderacion),
        color: editing.color || '#3B82F6', orden: editing.orden, activo: editing.activo,
      });
    } else {
      // Sugerir orden siguiente
      const maxOrden = dimensiones.reduce((m, d) => Math.max(m, d.orden), 0);
      setForm({ ...EMPTY_DIMENSION, orden: maxOrden + 1 });
    }
    setErrors({});
  }, [editing, open]);

  const set = (k: keyof DimensionEvaluacionFormData, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  // Preview de suma con el valor actual del form
  const sumaPreview = validarSumaPorcentajes(dimensiones, editing?.id ?? null, Number(form.porcentaje_ponderacion) || 0);
  const sumaOk = Math.round(sumaPreview) === 100;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.codigo.trim()) errs.codigo = 'El código es requerido';
    if (!form.porcentaje_ponderacion || form.porcentaje_ponderacion <= 0) errs.porcentaje_ponderacion = 'Debe ser mayor a 0';
    if (form.porcentaje_ponderacion > 100) errs.porcentaje_ponderacion = 'No puede superar 100';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };

  const previewColor = form.color || '#3B82F6';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: alpha(previewColor, 0.15), color: previewColor, borderRadius: 2, fontWeight: 800 }}>
            {form.codigo || <BalanceIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="700">{editing ? 'Editar Dimensión' : 'Nueva Dimensión'}</Typography>
            <Typography variant="caption" color="text.secondary">{editing ? editing.nombre : 'Creá una dimensión de evaluación'}</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>

          {/* Preview suma */}
          <Paper elevation={0} sx={{
            p: 1.5, borderRadius: 2, border: `1px solid ${alpha(sumaOk ? '#10B981' : '#F59E0B', 0.4)}`,
            bgcolor: alpha(sumaOk ? '#10B981' : '#F59E0B', 0.05),
            display: 'flex', alignItems: 'center', gap: 1.5
          }}>
            {sumaOk
              ? <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
              : <ErrorOutlineIcon sx={{ color: '#F59E0B', fontSize: 20 }} />}
            <Typography variant="body2" fontWeight="700" sx={{ color: sumaOk ? '#10B981' : '#F59E0B' }}>
              {sumaOk ? 'Ponderación balanceada (100%)' : `Total resultante: ${sumaPreview}% (debe ser 100%)`}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{xs:8}}>
              <TextField label="Nombre" fullWidth required value={form.nombre}
                onChange={e => set('nombre', e.target.value)} error={!!errors.nombre} helperText={errors.nombre}
                placeholder="Ej: Saber" />
            </Grid>
            <Grid size={{xs:4}}>
              <TextField label="Código" fullWidth required value={form.codigo}
                onChange={e => set('codigo', e.target.value.toUpperCase())}
                error={!!errors.codigo} helperText={errors.codigo}
                placeholder="SAB" inputProps={{ maxLength: 6 }} />
            </Grid>
          </Grid>

          <TextField label="Descripción (opcional)" multiline rows={2} fullWidth value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            placeholder="Ej: Conocimientos, conceptos y comprensión crítica" />

          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs:6}}>
              <TextField label="Porcentaje (%)" type="number" fullWidth required
                value={form.porcentaje_ponderacion}
                onChange={e => set('porcentaje_ponderacion', parseFloat(e.target.value) || 0)}
                error={!!errors.porcentaje_ponderacion} helperText={errors.porcentaje_ponderacion}
                inputProps={{ min: 0.01, max: 100, step: 0.01 }} />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField select label="Orden" fullWidth value={form.orden} onChange={e => set('orden', Number(e.target.value))}>
                {[1,2,3,4,5,6].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          {/* Selector de color */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <PaletteIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="600" color="text.secondary">Color de la dimensión</Typography>
              <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: previewColor, border: `2px solid ${alpha(previewColor, 0.5)}` }} />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {COLOR_OPTIONS.map(c => (
                <Box key={c} onClick={() => set('color', c)} sx={{
                  width: 32, height: 32, borderRadius: 2, bgcolor: c, cursor: 'pointer',
                  border: form.color === c ? `3px solid ${alpha('#000', 0.4)}` : '2px solid transparent',
                  boxShadow: form.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                  transition: 'all .15s', '&:hover': { transform: 'scale(1.2)' }
                }} />
              ))}
            </Stack>
          </Box>

          <FormControlLabel
            control={<Switch checked={form.activo ?? true} onChange={e => set('activo', e.target.checked)} color="success" />}
            label={<Typography variant="body2" fontWeight="600">Dimensión {form.activo ? 'activa' : 'inactiva'}</Typography>}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving} sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}>
          {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear dimensión'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Tab Ponderación completo ─────────────────────────────────────────────────
function TabPonderacion({ showSnackbar }: { showSnackbar: (msg: string, sev: 'success' | 'error' | 'info') => void }) {
  const theme = useTheme();
  const { dimensiones, loading, error, crearDimension, actualizarDimension, toggleActivo, sumaPorcentajes, esValida } = useDimensionesEvaluacion();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDim, setEditingDim] = useState<DimensionEvaluacion | null>(null);

  const handleSaveDimension = async (data: DimensionEvaluacionFormData) => {
    try {
      if (editingDim) {
        await actualizarDimension(editingDim.id, data);
        showSnackbar('✨ Dimensión actualizada', 'success');
      } else {
        await crearDimension(data);
        showSnackbar('🎉 Dimensión creada', 'success');
      }
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error al guardar'}`, 'error');
      throw err;
    }
  };

  const handleToggleDim = async (dim: DimensionEvaluacion) => {
    try {
      await toggleActivo(dim.id, !dim.activo);
      showSnackbar(`${!dim.activo ? '✅' : '⏸️'} Dimensión ${!dim.activo ? 'activada' : 'desactivada'}`, 'info');
    } catch (err: any) {
      showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error');
    }
  };

  return (
    <Box>
      {/* Header sección */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="700">Dimensiones de Evaluación</Typography>
          <Typography variant="body2" color="text.secondary">
            Modelo educativo boliviano · Ser / Saber / Hacer / Autoevaluación
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditingDim(null); setOpenDialog(true); }}
          sx={{ borderRadius: 3, fontWeight: 'bold', px: 3 }}>
          Nueva Dimensión
        </Button>
      </Box>

      {/* Indicador suma */}
      <Box mb={3}><SumIndicator suma={sumaPorcentajes} esValida={esValida} /></Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={3}>
          {[1,2,3,4].map(n => <Grid size={{xs:12, sm:6, md:3}}  key={n}><Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : dimensiones.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `2px dashed ${theme.palette.divider}` }}>
          <BalanceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No hay dimensiones configuradas</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingDim(null); setOpenDialog(true); }}
            sx={{ borderRadius: 3, px: 4, fontWeight: 'bold', mt: 2 }}>
            Crear primera dimensión
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {dimensiones.map((dim, idx) => (
            <Grid size={{xs:12, sm:6, md:3}}  key={dim.id}>
              <Fade in timeout={300 + idx * 80}>
                <Box>
                  <DimensionCard dimension={dim} total={sumaPorcentajes}
                    onEdit={(d) => { setEditingDim(d); setOpenDialog(true); }}
                    onToggle={handleToggleDim} index={idx} />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      <DimensionFormDialog
        open={openDialog} onClose={() => setOpenDialog(false)}
        onSave={handleSaveDimension} editing={editingDim} dimensiones={dimensiones}
      />
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const PeriodosEvaluacion: React.FC = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const { periodos: periodosAcademicos, loadingPeriodos } = useAcademicos({
    loadPeriodos: true, loadTurnos: false, loadNiveles: false,
    loadGrados: false, loadParalelos: false, loadMaterias: false, loadGradoMaterias: false,
  });

  const { estadisticas: statsGlobales, crearPeriodo, actualizarPeriodo, toggleActivo } = usePeriodosEvaluacion({});
  const { dimensiones, esValida: ponderacionOk } = useDimensionesEvaluacion();

  const [expandedPA, setExpandedPA] = useState<number | null>(null);
  const [openPeriodoDialog, setOpenPeriodoDialog] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoConEstado | null>(null);
  const [defaultPAId, setDefaultPAId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const showSnackbar = (message: string, severity: typeof snackbar.severity) =>
    setSnackbar({ open: true, message, severity });

  const handleSavePeriodo = async (data: PeriodoEvaluacionFormData) => {
    try {
      if (editingPeriodo) { await actualizarPeriodo(editingPeriodo.id, data); showSnackbar('✨ Trimestre actualizado', 'success'); }
      else { await crearPeriodo(data); showSnackbar('🎉 Trimestre creado', 'success'); }
    } catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error'); throw err; }
  };

  const handleTogglePeriodo = async (periodo: PeriodoConEstado) => {
    try {
      await toggleActivo(periodo.id, !periodo.activo);
      showSnackbar(`${!periodo.activo ? '✅' : '⏸️'} Trimestre ${!periodo.activo ? 'activado' : 'desactivado'}`, 'info');
    } catch (err: any) { showSnackbar(`❌ ${err.response?.data?.message || 'Error'}`, 'error'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Header ── */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                width: 64, height: 64, borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <EventNoteIcon sx={{ fontSize: 34, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Evaluación
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <TuneIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                  Períodos y ponderación del modelo educativo
                </Typography>
              </Box>
            </Box>

            {tab === 0 && (
              <Button variant="contained" size="large" startIcon={<AddIcon />}
                onClick={() => { setEditingPeriodo(null); setDefaultPAId(null); setOpenPeriodoDialog(true); }}
                sx={{
                  borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                  '&:hover': { transform: 'translateY(-3px)' }, transition: 'all .2s'
                }}>
                Nuevo Trimestre
              </Button>
            )}
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{xs:6, sm:3}}>
              <StatCard label="Total trimestres" value={statsGlobales.total} icon={<EventNoteIcon />} color={theme.palette.primary.main} />
            </Grid>
            <Grid size={{xs:6, sm:3}}>
              <StatCard label="En curso" value={statsGlobales.activos} icon={<PlayCircleIcon />} color="#10B981" />
            </Grid>
            <Grid size={{xs:6, sm:3}}>
              <StatCard label="Dimensiones" value={dimensiones.filter(d => d.activo).length} icon={<BalanceIcon />} color="#8B5CF6" />
            </Grid>
            <Grid size={{xs:6, sm:3}}>
              <StatCard label="Ponderación" value={ponderacionOk ? '✓ 100%' : '⚠ Error'} icon={<TuneIcon />} color={ponderacionOk ? '#10B981' : '#F59E0B'} />
            </Grid>
          </Grid>

          {/* Tabs */}
          <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
              <Tab label="Períodos / Trimestres" icon={<EventNoteIcon />} iconPosition="start"
                sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }} />
              <Tab
                label={
                  <Badge badgeContent={!ponderacionOk ? '!' : undefined} color="warning">
                    Ponderación (Ser / Saber / Hacer)
                  </Badge>
                }
                icon={<BalanceIcon />} iconPosition="start"
                sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' }} />
            </Tabs>
          </Card>
        </Box>
      </Fade>

      {/* ── Tab 0: Períodos ── */}
      {tab === 0 && (
        <>
          {loadingPeriodos ? (
            <Stack spacing={2}>{[1,2].map(n => <Skeleton key={n} variant="rounded" height={90} sx={{ borderRadius: 3 }} />)}</Stack>
          ) : periodosAcademicos.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `2px dashed ${theme.palette.divider}` }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No hay años académicos disponibles</Typography>
              <Typography variant="body2" color="text.disabled">Primero creá un período académico desde la sección de Académicos</Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {periodosAcademicos.map((pa, idx) => {
                const color = getPeriodoColor(idx);
                const isExpanded = expandedPA === pa.id;
                return (
                  <Fade in timeout={400 + idx * 120} key={pa.id}>
                    <Box>
                      <PeriodoAcademicoRow
                        periodoAcademico={pa} color={color} isExpanded={isExpanded}
                        onToggleExpand={() => setExpandedPA(isExpanded ? null : pa.id)}
                        onAddPeriodo={(id) => { setEditingPeriodo(null); setDefaultPAId(id); setOpenPeriodoDialog(true); }}
                        onEditPeriodo={(p) => { setEditingPeriodo(p); setDefaultPAId(null); setOpenPeriodoDialog(true); }}
                        onTogglePeriodo={handleTogglePeriodo}
                      />
                    </Box>
                  </Fade>
                );
              })}
            </Stack>
          )}
        </>
      )}

      {/* ── Tab 1: Ponderación ── */}
      {tab === 1 && (
        <Fade in timeout={400}>
          <Box><TabPonderacion showSnackbar={showSnackbar} /></Box>
        </Fade>
      )}

      {/* Dialogs */}
      <PeriodoFormDialog
        open={openPeriodoDialog} onClose={() => setOpenPeriodoDialog(false)}
        onSave={handleSavePeriodo} editing={editingPeriodo}
        periodosAcademicos={periodosAcademicos} defaultPeriodoAcademicoId={defaultPAId}
      />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PeriodosEvaluacion;