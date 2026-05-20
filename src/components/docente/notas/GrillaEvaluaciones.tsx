'use client';
// components/docente/notas/GrillaEvaluaciones.tsx
import React, { useState, useRef } from 'react';
import {
  Box, Typography, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Stack, Tooltip, Divider, Tabs, Tab, CircularProgress,
  Switch, FormControlLabel, Alert, useTheme, alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AddRoundedIcon          from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon       from '@mui/icons-material/DeleteRounded';
import CloseIcon               from '@mui/icons-material/Close';
import ImageRoundedIcon        from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import AddCircleOutlineIcon    from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon       from '@mui/icons-material/DeleteOutline';
import VisibilityIcon          from '@mui/icons-material/Visibility';
import VisibilityOffIcon       from '@mui/icons-material/VisibilityOff';
import RefreshRoundedIcon      from '@mui/icons-material/RefreshRounded';
import AssignmentRoundedIcon   from '@mui/icons-material/AssignmentRounded';

import {
  Evaluacion, DimensionEvaluacion, CrearEvaluacionDTO,
  CriterioRubrica, TIPOS_EVALUACION, DIMENSIONES_CONFIG,
  CodigoDimension,
} from '@/types/notasTypes';
import { adjuntosService } from '@/services/notasService';
import { toast } from 'react-hot-toast';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 2.5 }}>{value === index && children}</Box>
);

// ── Editor rúbrica ─────────────────────────────────────────────────────────
const EditorRubrica: React.FC<{ criterios: CriterioRubrica[]; puntajeMaximo: number; onChange: (c: CriterioRubrica[]) => void }> = ({ criterios, puntajeMaximo, onChange }) => {
  const { isDark, gold } = usePalette();
  const suma = criterios.reduce((s, c) => s + Number(c.puntos_posibles || 0), 0);
  const excede = suma > puntajeMaximo;
  const agregar = () => onChange([...criterios, { orden: criterios.length + 1, criterio: '', puntos_posibles: 0 }]);
  const upd = (i: number, k: keyof CriterioRubrica, v: any) => { const cp = [...criterios]; (cp[i] as any)[k] = v; onChange(cp); };
  const del = (i: number) => onChange(criterios.filter((_, j) => j !== i).map((c, j) => ({ ...c, orden: j + 1 })));
  const sx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold } } };
  return (
    <Box>
      {excede && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>Suma ({suma}) supera el máximo ({puntajeMaximo}).</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">Suma: <strong style={{ color: excede ? '#dc2626' : '#16a34a' }}>{suma}</strong> / {puntajeMaximo} pts</Typography>
        <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={agregar} sx={{ textTransform: 'none', fontWeight: 600, color: gold }}>Agregar criterio</Button>
      </Box>
      {criterios.length === 0 && <Box sx={{ textAlign: 'center', py: 4, borderRadius: '12px', border: `1.5px dashed ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}` }}><Typography variant="caption" color="text.disabled" fontWeight={600}>Sin criterios todavía</Typography></Box>}
      <Stack spacing={1.5}>
        {criterios.map((c, i) => (
          <Box key={i} sx={{ p: 2, borderRadius: '12px', border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`, bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa' }}>
            <Grid container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 6 }}><TextField label={`Criterio ${i + 1} *`} size="small" fullWidth value={c.criterio} onChange={e => upd(i, 'criterio', e.target.value)} placeholder="Ej: Presentación..." sx={sx} /></Grid>
              <Grid size={{ xs: 8, sm: 4 }}><TextField label="Puntos *" size="small" fullWidth type="number" value={c.puntos_posibles} onChange={e => upd(i, 'puntos_posibles', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.5 }} sx={sx} /></Grid>
              <Grid size={{ xs: 4, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pt: '8px !important' }}>
                <IconButton size="small" onClick={() => del(i)} sx={{ color: isDark ? alpha('#fff', 0.3) : '#d1d5db', '&:hover': { color: '#dc2626' } }}><DeleteOutlineIcon fontSize="small" /></IconButton>
              </Grid>
              <Grid size={{ xs: 12 }}><TextField label="Descripción (opcional)" size="small" fullWidth value={c.descripcion ?? ''} onChange={e => upd(i, 'descripcion', e.target.value)} sx={sx} /></Grid>
            </Grid>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// ── Modal crear evaluación ──────────────────────────────────────────────────
interface ModalProps {
  open: boolean; onClose: () => void;
  onCrear: (d: CrearEvaluacionDTO, foto?: File, pdf?: File, criterios?: CriterioRubrica[]) => void;
  asignacion_docente_id: number; periodo_evaluacion_id: number;
  dimensionActiva: CodigoDimension; dimensiones: DimensionEvaluacion[]; isLoading: boolean;
}

const ModalCrearEvaluacion: React.FC<ModalProps> = ({ open, onClose, onCrear, asignacion_docente_id, periodo_evaluacion_id, dimensionActiva, dimensiones, isLoading }) => {
  const { isDark, gold, gradBg } = usePalette();
  const [tab, setTab] = useState(0);
  const dimActiva = dimensiones.find(d => d.codigo === dimensionActiva);
  const [form, setForm] = useState<Partial<CrearEvaluacionDTO>>({ asignacion_docente_id, periodo_evaluacion_id, dimension_evaluacion_id: dimActiva?.id, puntaje_maximo: 100, peso_en_dimension: 1, visible_para_padres: false });
  const [foto, setFoto] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [criterios, setCriterios] = useState<CriterioRubrica[]>([]);
  const fotoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTab(0);
      setForm({ asignacion_docente_id, periodo_evaluacion_id, dimension_evaluacion_id: dimActiva?.id, puntaje_maximo: 100, peso_en_dimension: 1, visible_para_padres: false });
      setFoto(null); setPdf(null); setCriterios([]);
    }
  }, [open, dimActiva?.id]);

  const set = (k: keyof CrearEvaluacionDTO, v: any) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.nombre || !form.dimension_evaluacion_id) return;
    onCrear(form as CrearEvaluacionDTO, foto ?? undefined, pdf ?? undefined, criterios.length > 0 ? criterios : undefined);
    onClose();
  };

  const sx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: gold } }, '& .MuiInputLabel-root.Mui-focused': { color: gold } };
  const cfg = DIMENSIONES_CONFIG[dimensionActiva];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', bgcolor: isDark ? '#0f172a' : '#fff', border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}` } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
          Nueva evaluación
          <Chip label={cfg.label} size="small" sx={{ bgcolor: alpha(cfg.color, 0.15), color: cfg.color, fontWeight: 700, fontSize: 11 }} />
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, background: gradBg, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13, borderRadius: '10px', color: isDark ? alpha('#000', 0.65) : alpha('#fff', 0.75), '&.Mui-selected': { color: isDark ? '#000' : '#fff' } }, '& .MuiTabs-indicator': { bgcolor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0' } }}>
        <Tab label="Básico" /><Tab label="Adjuntos" /><Tab label="Rúbrica" />
      </Tabs>

      <DialogContent sx={{ pt: 0 }}>
        <TabPanel value={tab} index={0}>
          <Stack spacing={2.5}>
            <TextField label="Nombre *" fullWidth size="small" placeholder="Ej: Examen Parcial 1..." value={form.nombre ?? ''} onChange={e => set('nombre', e.target.value)} sx={sx} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" required sx={sx}>
                  <InputLabel>Dimensión</InputLabel>
                  <Select value={form.dimension_evaluacion_id ?? ''} label="Dimensión" onChange={e => set('dimension_evaluacion_id', e.target.value)}>
                    {dimensiones.map(d => { const c = DIMENSIONES_CONFIG[d.codigo as CodigoDimension]; return <MenuItem key={d.id} value={d.id}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c?.color ?? d.color }} />{d.nombre} ({d.porcentaje_ponderacion}%)</Box></MenuItem>; })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" sx={sx}>
                  <InputLabel>Tipo</InputLabel>
                  <Select value={form.tipo ?? ''} label="Tipo" onChange={e => set('tipo', e.target.value)}>
                    {TIPOS_EVALUACION.map(t => <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}><TextField label="Puntaje máximo *" type="number" fullWidth size="small" value={form.puntaje_maximo ?? 100} onChange={e => set('puntaje_maximo', parseFloat(e.target.value))} inputProps={{ min: 1, step: 1 }} sx={sx} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><TextField label="Peso en dimensión" type="number" fullWidth size="small" value={form.peso_en_dimension ?? 1} onChange={e => set('peso_en_dimension', parseFloat(e.target.value))} inputProps={{ min: 0.1, step: 0.1 }} helperText="Peso relativo" sx={sx} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Fecha" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={form.fecha ?? ''} onChange={e => set('fecha', e.target.value || undefined)} sx={sx} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Fecha límite" type="datetime-local" fullWidth size="small" InputLabelProps={{ shrink: true }} helperText="Para tareas y proyectos" value={form.fecha_limite ?? ''} onChange={e => set('fecha_limite', e.target.value || undefined)} sx={sx} /></Grid>
            </Grid>
            <TextField label="Instrucciones (visible para padres)" fullWidth size="small" multiline rows={2} value={form.instrucciones ?? ''} onChange={e => set('instrucciones', e.target.value)} sx={sx} />
            <TextField label="Descripción interna" fullWidth size="small" multiline rows={2} value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)} sx={sx} />
            <FormControlLabel control={<Switch checked={form.visible_para_padres ?? false} onChange={e => set('visible_para_padres', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: gold }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: gold } }} />} label={<Typography variant="body2">Publicar inmediatamente (visible para padres)</Typography>} />
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><ImageRoundedIcon fontSize="small" sx={{ color: gold }} /> Foto del enunciado</Typography>
              <input ref={fotoRef} type="file" accept="image/*" hidden onChange={e => setFoto(e.target.files?.[0] ?? null)} />
              {foto ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', border: `1.5px solid ${alpha(gold, 0.4)}`, bgcolor: isDark ? alpha(gold, 0.05) : alpha(gold, 0.04) }}>
                  <Box component="img" src={URL.createObjectURL(foto)} alt="preview" sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={600} noWrap>{foto.name}</Typography><Typography variant="caption" color="text.secondary">{(foto.size / 1024).toFixed(1)} KB</Typography></Box>
                  <IconButton size="small" onClick={() => setFoto(null)} sx={{ color: '#dc2626' }}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ) : <Button variant="outlined" startIcon={<ImageRoundedIcon />} onClick={() => fotoRef.current?.click()} sx={{ borderColor: alpha(gold, 0.5), color: gold, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Seleccionar imagen</Button>}
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><PictureAsPdfRoundedIcon fontSize="small" sx={{ color: '#dc2626' }} /> PDF de instrucciones</Typography>
              <input ref={pdfRef} type="file" accept="application/pdf" hidden onChange={e => setPdf(e.target.files?.[0] ?? null)} />
              {pdf ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', bgcolor: alpha('#dc2626', 0.06), border: `1.5px solid ${alpha('#dc2626', 0.2)}` }}>
                  <PictureAsPdfRoundedIcon sx={{ color: '#dc2626', fontSize: 28 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={600} noWrap>{pdf.name}</Typography><Typography variant="caption" color="text.secondary">{(pdf.size / 1024).toFixed(1)} KB</Typography></Box>
                  <IconButton size="small" onClick={() => setPdf(null)} sx={{ color: '#dc2626' }}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ) : <Button variant="outlined" startIcon={<PictureAsPdfRoundedIcon />} onClick={() => pdfRef.current?.click()} sx={{ borderColor: alpha('#dc2626', 0.4), color: '#dc2626', borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Seleccionar PDF</Button>}
            </Box>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <EditorRubrica criterios={criterios} puntajeMaximo={form.puntaje_maximo ?? 100} onChange={setCriterios} />
        </TabPanel>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.secondary' }}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.nombre || !form.dimension_evaluacion_id || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}
          sx={{ background: gradBg, color: isDark ? '#000' : '#fff', fontWeight: 700, borderRadius: '10px', textTransform: 'none', px: 3, '&:hover': { opacity: 0.88 }, '&.Mui-disabled': { opacity: 0.45 } }}>
          {isLoading ? 'Creando...' : 'Crear Evaluación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Card de evaluación ─────────────────────────────────────────────────────
const EvaluacionCard: React.FC<{
  evaluacion: Evaluacion; isSelected: boolean;
  dimensionColor: string; dimensionBg: string;
  onSeleccionar: () => void; onEliminar: () => void;
  onPublicar: () => void; onDespublicar: () => void; index: number;
}> = ({ evaluacion, isSelected, dimensionColor, dimensionBg, onSeleccionar, onEliminar, onPublicar, onDespublicar, index }) => {
  const { isDark } = usePalette();
  const tipo = TIPOS_EVALUACION.find(t => t.value === evaluacion.tipo);

  return (
    <Box onClick={onSeleccionar} sx={{
      borderRadius: '14px',
      border: `1.5px solid ${isSelected ? dimensionColor : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      bgcolor: isSelected ? isDark ? alpha(dimensionColor, 0.12) : alpha(dimensionBg, 0.6) : isDark ? alpha('#fff', 0.02) : '#fafafa',
      p: 2, cursor: 'pointer',
      animation: `${fadeInUp} 0.3s ease-out ${index * 0.06}s both`,
      transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
      '&:hover': { borderColor: dimensionColor, transform: 'translateY(-1px)', bgcolor: isDark ? alpha(dimensionColor, 0.08) : alpha(dimensionBg, 0.4), boxShadow: `0 4px 16px ${alpha(dimensionColor, 0.12)}` },
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <AssignmentRoundedIcon sx={{ fontSize: 15, color: isSelected ? dimensionColor : 'text.disabled', flexShrink: 0 }} />
            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: isSelected ? dimensionColor : 'text.primary' }}>{evaluacion.nombre}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            {tipo && <Chip label={`${tipo.icon} ${tipo.label}`} size="small" sx={{ fontSize: 10, height: 18, bgcolor: isDark ? alpha('#fff', 0.07) : '#f0f0f0' }} />}
            <Chip label={`Máx: ${evaluacion.puntaje_maximo}`} size="small" sx={{ fontSize: 10, height: 18, bgcolor: isSelected ? alpha(dimensionColor, 0.15) : isDark ? alpha('#fff', 0.07) : '#f0f0f0', color: isSelected ? dimensionColor : undefined }} />
            {evaluacion.peso_en_dimension != null && <Chip label={`Peso: ${evaluacion.peso_en_dimension}`} size="small" sx={{ fontSize: 10, height: 18, bgcolor: isDark ? alpha('#fff', 0.07) : '#f0f0f0' }} />}
            {evaluacion.fecha && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>📅 {evaluacion.fecha}</Typography>}
            {evaluacion.foto_url && <Tooltip title="Tiene foto"><ImageRoundedIcon sx={{ fontSize: 13, color: isDark ? '#facc15' : '#0288d1' }} /></Tooltip>}
            {evaluacion.pdf_url && <Tooltip title="Tiene PDF"><PictureAsPdfRoundedIcon sx={{ fontSize: 13, color: '#dc2626' }} /></Tooltip>}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0, alignItems: 'center' }}>
          {isSelected && <Chip label="Activa" size="small" sx={{ bgcolor: alpha(dimensionColor, 0.2), color: dimensionColor, fontWeight: 700, fontSize: 10, height: 18 }} />}
          <Tooltip title={evaluacion.visible_para_padres ? 'Ocultar a padres' : 'Publicar a padres'}>
            <IconButton size="small" onClick={e => { e.stopPropagation(); evaluacion.visible_para_padres ? onDespublicar() : onPublicar(); }} sx={{ color: evaluacion.visible_para_padres ? '#16a34a' : isDark ? alpha('#fff', 0.25) : '#d1d5db', '&:hover': { color: '#16a34a' } }}>
              {evaluacion.visible_para_padres ? <VisibilityIcon sx={{ fontSize: 15 }} /> : <VisibilityOffIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar evaluación">
            <IconButton size="small" onClick={e => { e.stopPropagation(); onEliminar(); }} sx={{ color: isDark ? alpha('#fff', 0.25) : '#d1d5db', '&:hover': { color: '#dc2626' } }}>
              <DeleteRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

// ── Props y componente principal ───────────────────────────────────────────
interface Props {
  asignacion_docente_id: number;
  periodo_evaluacion_id: number;
  dimensionActiva: CodigoDimension;
  evaluaciones: Evaluacion[];
  dimensiones: DimensionEvaluacion[];
  isLoading: boolean;
  isSubmitting: boolean;
  evaluacionSeleccionada: number | null;
  onSeleccionarEvaluacion: (ev: Evaluacion) => void;
  onCrear: (d: CrearEvaluacionDTO, foto?: File, pdf?: File, criterios?: CriterioRubrica[]) => void;
  onEliminar: (id: number) => void;
  onRefrescar: () => void;
}

const GrillaEvaluaciones: React.FC<Props> = ({
  asignacion_docente_id, periodo_evaluacion_id,
  dimensionActiva, evaluaciones,
  dimensiones, isLoading, isSubmitting, evaluacionSeleccionada,
  onSeleccionarEvaluacion, onCrear, onEliminar, onRefrescar,
}) => {
  const { isDark, gold, gradBg } = usePalette();
  const [modalOpen, setModalOpen] = useState(false);
  const cfg = DIMENSIONES_CONFIG[dimensionActiva];

  const handlePublicar = async (id: number) => {
    try { await adjuntosService.publicar(id); toast.success('Publicada — visible para padres'); onRefrescar(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error al publicar'); }
  };
  const handleDespublicar = async (id: number) => {
    try { await adjuntosService.despublicar(id); toast.success('Ocultada'); onRefrescar(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error al despublicar'); }
  };

  return (
    <Box sx={{ borderRadius: '16px', border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`, overflow: 'hidden', bgcolor: isDark ? alpha('#fff', 0.02) : '#fff', boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)' }}>

      {/* Header con color de la dimensión activa */}
      <Box sx={{
        px: 2.5, py: 2,
        background: `linear-gradient(135deg, ${alpha(cfg.color, isDark ? 0.2 : 0.1)} 0%, ${alpha(cfg.color, isDark ? 0.06 : 0.03)} 100%)`,
        borderBottom: `1.5px solid ${alpha(cfg.color, 0.25)}`,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Box sx={{ width: 42, height: 42, borderRadius: '12px', flexShrink: 0, bgcolor: alpha(cfg.color, isDark ? 0.25 : 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${alpha(cfg.color, 0.3)}` }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: cfg.color }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: cfg.color, lineHeight: 1.2 }}>{cfg.label}</Typography>
            <Chip label={`${cfg.porcentaje}% de la nota`} size="small" sx={{ bgcolor: alpha(cfg.color, 0.15), color: cfg.color, fontWeight: 700, fontSize: 10, height: 18 }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            {cfg.descripcion} · {evaluaciones.length} evaluación{evaluaciones.length !== 1 ? 'es' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
          <Tooltip title="Refrescar">
            <IconButton size="small" onClick={onRefrescar} sx={{ color: cfg.color, opacity: 0.7, '&:hover': { opacity: 1 } }}>
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => setModalOpen(true)}
            sx={{ bgcolor: cfg.color, color: '#fff', fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: 12, px: 1.5, '&:hover': { bgcolor: cfg.color, opacity: 0.88 }, boxShadow: `0 2px 10px ${alpha(cfg.color, 0.4)}` }}>
            Nueva
          </Button>
        </Box>
      </Box>

      {/* Lista */}
      <Box sx={{ p: 2 }}>
        {isLoading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <CircularProgress size={26} sx={{ color: cfg.color }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Cargando...</Typography>
          </Box>
        ) : evaluaciones.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, borderRadius: '12px', border: `1.5px dashed ${alpha(cfg.color, 0.35)}`, bgcolor: isDark ? alpha(cfg.color, 0.04) : alpha(cfg.bgColor, 0.3) }}>
            <Typography variant="body2" sx={{ color: cfg.color, fontWeight: 700, mb: 0.5 }}>Sin evaluaciones en {cfg.label}</Typography>
            <Typography variant="caption" color="text.secondary">Hacé clic en "Nueva" para agregar la primera</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {evaluaciones.map((ev, i) => (
              <EvaluacionCard key={ev.id} evaluacion={ev} index={i}
                dimensionColor={cfg.color} dimensionBg={cfg.bgColor}
                isSelected={evaluacionSeleccionada === ev.id}
                onSeleccionar={() => onSeleccionarEvaluacion(ev)}
                onEliminar={() => onEliminar(ev.id)}
                onPublicar={() => handlePublicar(ev.id)}
                onDespublicar={() => handleDespublicar(ev.id)}
              />
            ))}
          </Stack>
        )}
      </Box>

      <ModalCrearEvaluacion open={modalOpen} onClose={() => setModalOpen(false)}
        onCrear={(d, f, p, c) => { onCrear(d, f, p, c); setModalOpen(false); }}
        asignacion_docente_id={asignacion_docente_id} periodo_evaluacion_id={periodo_evaluacion_id}
        dimensionActiva={dimensionActiva} dimensiones={dimensiones} isLoading={isSubmitting}
      />
    </Box>
  );
};

export default GrillaEvaluaciones;