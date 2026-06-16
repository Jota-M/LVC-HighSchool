'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Fade,
  Grid,
  Paper,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Stack,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  Drawer,
  Switch,
  FormControlLabel,
  Slider,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  SwapHoriz as TransferIcon,
  Block as AnularIcon,
  ExitToApp as RetirarIcon,
  PictureAsPdf as PdfIcon,
  Upload as UploadIcon,
  CheckCircle as VerificarIcon,
  Delete as DeleteIcon,
  History as HistorialIcon,
  Description as DocIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useMatricula, useMatriculaDocumentos, useMatriculacion, useMatriculaPDF, useDisponibilidadParalelo } from '@/hooks/useMatriculacion';
import { useGestionAcademica } from '@/hooks/useRegistroCompleto';
import { useAcademicos } from '@/hooks/useAcademicos';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ESTADOS_MATRICULA,
  EstadoMatricula,
  TipoDocumentoMatricula,
  TIPOS_DOCUMENTO_MATRICULA,
} from '@/types/matriculacionTypes';

// ============================================================
// HELPERS
// ============================================================
const getEstadoColor = (estado: string): any => {
  const map: Record<string, string> = {
    activo: 'success', retirado: 'error', trasladado: 'warning',
    anulado: 'default', suspendido: 'warning', congelado: 'info',
  };
  return map[estado] ?? 'default';
};

const formatFecha = (fecha: string | null | undefined) => {
  if (!fecha) return '—';
  try { return format(new Date(fecha), 'dd MMM yyyy', { locale: es }); }
  catch { return fecha; }
};

const labelTipoDoc: Record<string, string> = {
  cedula_estudiante: 'Cédula Estudiante',
  certificado_nacimiento: 'Cert. Nacimiento',
  certificado_nacimiento_padre: 'Cert. Nacimiento Padre',
  libreta_notas: 'Libreta de Notas',
  foto_carnet: 'Foto Carnet',
  otro: 'Otro',
};

// ============================================================
// DIALOGO GENÉRICO DE CONFIRMACIÓN CON INPUT
// ============================================================
interface DialogConfirmProps {
  open: boolean;
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: 'error' | 'warning' | 'info' | 'success';
  inputLabel?: string;
  inputRequired?: boolean;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

const DialogConfirm: React.FC<DialogConfirmProps> = ({
  open, title, description, icon, color = 'error',
  inputLabel, inputRequired = true, confirmLabel = 'Confirmar',
  loading, onConfirm, onClose,
}) => {
  const [value, setValue] = useState('');
  const theme = useTheme();

  const handleConfirm = () => {
    if (inputRequired && !value.trim()) return;
    onConfirm(value);
    setValue('');
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon}
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: inputLabel ? 2 : 0 }}>
          {description}
        </Typography>
        {inputLabel && (
          <TextField
            fullWidth
            label={inputLabel}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={color}
          disabled={loading || (inputRequired && !!inputLabel && !value.trim())}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================
// DIALOGO TRANSFERIR PARALELO
// ============================================================
interface DialogTransferirProps {
  open: boolean;
  loading: boolean;
  matricula: any;
  onConfirm: (nuevoParaleloId: number, motivo: string) => void;
  onClose: () => void;
}

const DialogTransferir: React.FC<DialogTransferirProps> = ({
  open, loading, matricula, onConfirm, onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  const [nuevoParaleloId, setNuevoParaleloId] = useState<number | ''>('');
  const [motivo, setMotivo] = useState('');

  // Cargar paralelos reales
  const { paralelos, cargarParalelos, loadingParalelos } = useAcademicos({
    autoLoad: false,
    loadPeriodos: false, loadTurnos: false, loadNiveles: false,
    loadGrados: false, loadParalelos: true, loadMaterias: false, loadGradoMaterias: false,
  });

  React.useEffect(() => {
    if (open) {
      cargarParalelos();
    }
  }, [open]);
  // Verificar disponibilidad del paralelo seleccionado
  const paraleloIdParaVerificar =
    nuevoParaleloId && nuevoParaleloId !== matricula?.paralelo_id
      ? Number(nuevoParaleloId)
      : null;

  const { disponibilidad, isLoading: isVerificando } = useDisponibilidadParalelo(
    paraleloIdParaVerificar,
    matricula?.periodo_id ?? null
  );

  const fieldStyle = {
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: accentColor },
      '&.Mui-focused fieldset': { borderColor: accentColor },
    },
  };

  const handleConfirm = () => {
    if (!nuevoParaleloId || !motivo.trim()) return;
    onConfirm(Number(nuevoParaleloId), motivo);
    setNuevoParaleloId('');
    setMotivo('');
  };

  const handleClose = () => {
    setNuevoParaleloId('');
    setMotivo('');
    onClose();
  };

  const puedeConfirmar = nuevoParaleloId &&
    nuevoParaleloId !== matricula?.paralelo_id &&
    motivo.trim() &&
    disponibilidad?.capacidad.puede_matricular;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TransferIcon color="warning" />
          <Box>
            <Typography variant="h6" fontWeight={700}>Transferir a otro paralelo</Typography>
            {matricula && (
              <Typography variant="caption" color="text.secondary">
                Actual: {matricula.grado_nombre} · {matricula.paralelo_nombre} · {matricula.turno_nombre}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>

          {/* Selector de paralelo */}
          <FormControl fullWidth sx={fieldStyle} disabled={loadingParalelos}>
            <InputLabel>
              {loadingParalelos ? 'Cargando paralelos...' : 'Paralelo destino *'}
            </InputLabel>
            <Select
              value={nuevoParaleloId}
              onChange={(e) => setNuevoParaleloId(e.target.value as number)}
              label={loadingParalelos ? 'Cargando paralelos...' : 'Paralelo destino *'}
              startAdornment={loadingParalelos ? (
                <InputAdornment position="start">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined}
            >
              {paralelos
                .filter((p: any) => p.id !== matricula?.paralelo_id)
                .map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {p.grado_nombre} — {p.nombre}
                      </Typography>
                      <Chip
                        label={p.turno_nombre}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20, flexShrink: 0 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Card de disponibilidad */}
          {nuevoParaleloId && nuevoParaleloId !== matricula?.paralelo_id && (
            isVerificando ? (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha(accentColor, 0.08),
                border: `1px solid ${alpha(accentColor, 0.2)}`,
              }}>
                <CircularProgress size={16} sx={{ color: accentColor }} />
                <Typography variant="caption" color="text.secondary">
                  Verificando disponibilidad...
                </Typography>
              </Box>
            ) : disponibilidad ? (
              <Alert
                severity={disponibilidad.capacidad.puede_matricular ? 'success' : 'error'}
                sx={{ borderRadius: '12px', py: 0.5 }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {disponibilidad.paralelo.nombre} · {disponibilidad.paralelo.grado}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {disponibilidad.paralelo.turno}
                  {disponibilidad.paralelo.aula && ` · Aula ${disponibilidad.paralelo.aula}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Typography variant="caption">
                    Ocupados: <strong>{disponibilidad.capacidad.ocupada}/{disponibilidad.capacidad.maxima}</strong>
                  </Typography>
                  <Typography variant="caption">
                    Libres: <strong>{disponibilidad.capacidad.disponible}</strong>
                  </Typography>
                </Box>
                {!disponibilidad.capacidad.puede_matricular && (
                  <Typography variant="caption" color="error" fontWeight={700} display="block" sx={{ mt: 0.5 }}>
                    ⚠️ Sin cupos disponibles en este paralelo
                  </Typography>
                )}
              </Alert>
            ) : null
          )}

          {/* Motivo */}
          <TextField
            fullWidth
            label="Motivo de la transferencia *"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            rows={3}
            placeholder="Describe el motivo de la transferencia..."
            sx={fieldStyle}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={loading || !puedeConfirmar}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TransferIcon />}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          {loading ? 'Transfiriendo...' : 'Transferir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================
// DIALOGO SUBIR DOCUMENTOS
// ============================================================
interface DialogSubirDocProps {
  open: boolean;
  loading: boolean;
  onConfirm: (file: File, tipo: string, observaciones: string) => void;
  onClose: () => void;
}

const DialogSubirDoc: React.FC<DialogSubirDocProps> = ({ open, loading, onConfirm, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<string>('cedula_estudiante');
  const [observaciones, setObservaciones] = useState('');

  const handleConfirm = () => {
    if (!file) return;
    onConfirm(file, tipo, observaciones);
    setFile(null);
    setTipo('cedula_estudiante');
    setObservaciones('');
  };

  const handleClose = () => {
    setFile(null);
    setTipo('cedula_estudiante');
    setObservaciones('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UploadIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Subir Documento</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Documento</InputLabel>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              label="Tipo de Documento"
              sx={{ borderRadius: '12px' }}
            >
              {TIPOS_DOCUMENTO_MATRICULA.map((t) => (
                <MenuItem key={t} value={t}>{labelTipoDoc[t] ?? t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.5 }}
          >
            {file ? file.name : 'Seleccionar archivo'}
            <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Button>

          <TextField
            fullWidth
            label="Observaciones (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            multiline
            rows={2}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !file}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          {loading ? 'Subiendo...' : 'Subir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================
// DRAWER EDITAR MATRÍCULA
// ============================================================
interface DrawerEditarProps {
  open: boolean;
  onClose: () => void;
  matricula: any;
  onGuardar: (data: any) => void;
  isGuardando: boolean;
}

const DrawerEditar: React.FC<DrawerEditarProps> = ({
  open, onClose, matricula, onGuardar, isGuardando,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  // Cargar paralelos reales via useAcademicos
  const { paralelos, cargarParalelos, loadingParalelos } = useAcademicos({
    autoLoad: false,
    loadPeriodos: false,
    loadTurnos: false,
    loadNiveles: false,
    loadGrados: false,
    loadParalelos: true,
    loadMaterias: false,
    loadGradoMaterias: false,
  });

  // Cargar paralelos cuando se abre el drawer
  React.useEffect(() => {
    if (open) {
      cargarParalelos();
    }
  }, [open]);

  // Form state inicializado con datos actuales
  const [form, setForm] = React.useState({
    paralelo_id: matricula?.paralelo_id ?? '',
    es_repitente: matricula?.es_repitente ?? false,
    es_becado: matricula?.es_becado ?? false,
    porcentaje_beca: matricula?.porcentaje_beca ?? 0,
    tipo_beca: matricula?.tipo_beca ?? '',
    observaciones: matricula?.observaciones ?? '',
  });

  // Resetear form cuando se abre con datos nuevos
  React.useEffect(() => {
    if (open && matricula) {
      setForm({
        paralelo_id: matricula.paralelo_id ?? '',
        es_repitente: matricula.es_repitente ?? false,
        es_becado: matricula.es_becado ?? false,
        porcentaje_beca: matricula.porcentaje_beca ?? 0,
        tipo_beca: matricula.tipo_beca ?? '',
        observaciones: matricula.observaciones ?? '',
      });
    }
  }, [open, matricula]);

  // Verificar disponibilidad solo si cambió el paralelo
  const paraleloIdParaVerificar =
    form.paralelo_id && form.paralelo_id !== matricula?.paralelo_id
      ? Number(form.paralelo_id)
      : null;

  const { disponibilidad, isLoading: isVerificando } = useDisponibilidadParalelo(
    paraleloIdParaVerificar,
    matricula?.periodo_id ?? null
  );

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = () => {
    onGuardar({
      paralelo_id: form.paralelo_id ? Number(form.paralelo_id) : undefined,
      es_repitente: form.es_repitente,
      es_becado: form.es_becado,
      porcentaje_beca: form.es_becado ? Number(form.porcentaje_beca) : null,
      tipo_beca: form.es_becado ? form.tipo_beca || null : null,
      observaciones: form.observaciones || null,
    });
  };

  const cambiandoParalelo = form.paralelo_id && form.paralelo_id !== matricula?.paralelo_id;

  const fieldStyle = {
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: accentColor },
      '&.Mui-focused fieldset': {
        borderColor: accentColor,
        boxShadow: `0 0 0 2px ${alpha(accentColor, 0.2)}`,
      },
    },
  };

  const switchSx = {
    '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : '#fff',
          backdropFilter: 'blur(20px)',
          borderLeft: '2px solid',
          borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ p: 3, background: accentGradient, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EditIcon sx={{ color: isDark ? '#000' : '#fff' }} />
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#000' : '#fff' }}>
                Editar Matrícula
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }}>
                {matricula?.numero_matricula}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: isDark ? '#000' : '#fff' }}>
            <BackIcon />
          </IconButton>
        </Box>

        {/* Info del estudiante */}
        <Box sx={{
          mt: 2, p: 1.5, borderRadius: '12px',
          backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Avatar src={matricula?.estudiante_foto ?? undefined} sx={{ width: 40, height: 40 }}>
            {matricula?.estudiante_nombres?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#000' : '#fff' }}>
              {matricula?.estudiante_nombres} {matricula?.estudiante_apellido_paterno}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }}>
              Actual: {matricula?.grado_nombre} · {matricula?.paralelo_nombre} · {matricula?.turno_nombre}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── FORM ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={3}>

          {/* PARALELO */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: accentColor }}>
              📚 Paralelo
            </Typography>

            <FormControl fullWidth sx={fieldStyle} disabled={loadingParalelos}>
              <InputLabel>
                {loadingParalelos ? 'Cargando paralelos...' : 'Seleccionar Paralelo'}
              </InputLabel>
              <Select
                value={form.paralelo_id}
                onChange={(e) => handleChange('paralelo_id', e.target.value)}
                label={loadingParalelos ? 'Cargando paralelos...' : 'Seleccionar Paralelo'}
                startAdornment={loadingParalelos ? (
                  <InputAdornment position="start">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined}
              >
                {paralelos.map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {p.grado_nombre} — {p.nombre}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Chip label={p.turno_nombre} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        {p.id === matricula?.paralelo_id && (
                          <Chip label="Actual" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20 }} />
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Card de disponibilidad cuando cambia el paralelo */}
            {cambiandoParalelo && (
              <Box sx={{ mt: 1.5 }}>
                {isVerificando ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: '12px',
                    backgroundColor: alpha(accentColor, 0.08), border: `1px solid ${alpha(accentColor, 0.2)}` }}>
                    <CircularProgress size={16} sx={{ color: accentColor }} />
                    <Typography variant="caption" color="text.secondary">Verificando disponibilidad...</Typography>
                  </Box>
                ) : disponibilidad ? (
                  <Alert
                    severity={disponibilidad.capacidad.puede_matricular ? 'success' : 'error'}
                    sx={{ borderRadius: '12px', border: '1px solid', py: 0.5,
                      borderColor: disponibilidad.capacidad.puede_matricular
                        ? alpha('#10b981', 0.4) : alpha('#ef4444', 0.4) }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {disponibilidad.paralelo.nombre} · {disponibilidad.paralelo.grado}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {disponibilidad.paralelo.turno}
                      {disponibilidad.paralelo.aula && ` · Aula ${disponibilidad.paralelo.aula}`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Typography variant="caption">Ocupados: <strong>{disponibilidad.capacidad.ocupada}/{disponibilidad.capacidad.maxima}</strong></Typography>
                      <Typography variant="caption">Libres: <strong>{disponibilidad.capacidad.disponible}</strong></Typography>
                      <Typography variant="caption">Ocupación: <strong>{disponibilidad.capacidad.porcentaje_ocupacion}%</strong></Typography>
                    </Box>
                    {!disponibilidad.capacidad.puede_matricular && (
                      <Typography variant="caption" color="error" fontWeight={700} display="block" sx={{ mt: 0.5 }}>
                        ⚠️ No hay cupos disponibles en este paralelo
                      </Typography>
                    )}
                  </Alert>
                ) : null}
              </Box>
            )}
          </Box>

          <Divider />

          {/* CONDICIÓN ACADÉMICA */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: accentColor }}>
              🔄 Condición Académica
            </Typography>
            <Box sx={{
              p: 2, borderRadius: '12px', border: '2px solid',
              borderColor: isDark ? 'rgba(250,204,21,0.2)' : 'rgba(2,136,209,0.2)',
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.es_repitente}
                    onChange={(e) => handleChange('es_repitente', e.target.checked)}
                    sx={switchSx}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Estudiante Repitente</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Activar si el estudiante repite el grado este periodo
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>

          <Divider />

          {/* BECA */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: accentColor }}>
              🎓 Beca
            </Typography>
            <Box sx={{
              p: 2, borderRadius: '12px', border: '2px solid',
              borderColor: isDark ? 'rgba(250,204,21,0.2)' : 'rgba(2,136,209,0.2)',
              mb: form.es_becado ? 2 : 0,
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.es_becado}
                    onChange={(e) => handleChange('es_becado', e.target.checked)}
                    sx={switchSx}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Estudiante Becado</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Activar si el estudiante cuenta con beca
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {form.es_becado && (
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Porcentaje de Beca</Typography>
                    <Chip
                      label={`${form.porcentaje_beca}%`}
                      size="small"
                      sx={{ fontWeight: 700, backgroundColor: alpha(accentColor, 0.15), color: accentColor }}
                    />
                  </Box>
                  <Slider
                    value={Number(form.porcentaje_beca)}
                    onChange={(_, val) => handleChange('porcentaje_beca', val)}
                    min={0} max={100} step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' },
                    ]}
                    sx={{ color: accentColor, '& .MuiSlider-markLabel': { fontSize: '0.7rem' } }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Tipo de Beca"
                  value={form.tipo_beca}
                  onChange={(e) => handleChange('tipo_beca', e.target.value)}
                  placeholder="Ej: Académica, Deportiva, Municipal..."
                  sx={fieldStyle}
                />
              </Stack>
            )}
          </Box>

          <Divider />

          {/* OBSERVACIONES */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: accentColor }}>
              📝 Observaciones
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observaciones"
              value={form.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Notas adicionales sobre la matrícula..."
              sx={fieldStyle}
            />
          </Box>

        </Stack>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{
        p: 3, flexShrink: 0,
        borderTop: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        display: 'flex', gap: 2,
      }}>
        <Button fullWidth variant="outlined" onClick={onClose}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleGuardar}
          disabled={
            isGuardando ||
            (!!cambiandoParalelo && (!disponibilidad || !disponibilidad.capacidad.puede_matricular))
          }
          startIcon={isGuardando ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
          sx={{
            borderRadius: '12px', textTransform: 'none', fontWeight: 700,
            background: accentGradient, color: isDark ? '#000' : '#fff',
            '&:hover': { opacity: 0.9 },
          }}
        >
          {isGuardando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>
    </Drawer>
  );
};

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
export default function DetalleMatriculaPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isDark = theme.palette.mode === 'dark';
  const matriculaId = Number(params.id);

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentGradient = isDark
    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';

  // Hooks
  const {
    matricula, documentos, historial, isLoading, error, refetch,
    transferir, cambiarEstado, eliminar,
    isTransfiriendo, isCambiandoEstado, isEliminando,
  } = useMatricula(matriculaId);

  const {
    subir, verificar, eliminar: eliminarDoc,
    isSubiendo, isVerificando, isEliminando: isEliminandoDoc,
  } = useMatriculaDocumentos(matriculaId);

  const { retirar, isRetirando, actualizar, isActualizando } = useMatriculacion();
  const { descargarPDF, verPreview, isDownloading } = useMatriculaPDF();
  const { periodos, obtenerTodosLosParalelos } = useGestionAcademica();

  // Dialogs
  const [drawerEditar, setDrawerEditar] = useState(false);
  const [dialogRetirar, setDialogRetirar] = useState(false);
  const [dialogCambiarEstado, setDialogCambiarEstado] = useState(false);
  const [dialogTransferir, setDialogTransferir] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [dialogSubirDoc, setDialogSubirDoc] = useState(false);
  const [dialogEliminarDoc, setDialogEliminarDoc] = useState<number | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoMatricula>('anulado');

  // Paper style reutilizable
  const paperSx = {
    p: 3,
    borderRadius: '20px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '2px solid',
    borderColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.15)',
  };

  // ---- Loading / Error ----
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  if (error || !matricula) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '16px' }}>
          No se pudo cargar la matrícula. Verifica que el ID sea correcto.
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => router.back()} sx={{ mt: 2, textTransform: 'none' }}>
          Volver
        </Button>
      </Container>
    );
  }

  const nombreCompleto = `${matricula.estudiante_nombres} ${matricula.estudiante_apellido_paterno} ${matricula.estudiante_apellido_materno ?? ''}`.trim();
  const esActivo = matricula.estado === 'activo';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={400}>
          <Box>

            {/* ── HEADER ── */}
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => router.back()}
                sx={{
                  mb: 2, textTransform: 'none', fontWeight: 600, borderRadius: '12px',
                  color: accentColor,
                  '&:hover': { backgroundColor: alpha(accentColor, 0.08) },
                }}
              >
                Volver
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SchoolIcon sx={{ color: accentColor, fontSize: 32 }} />
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      Detalle de Matrícula
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={matricula.numero_matricula}
                      variant="outlined"
                      size="small"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, borderColor: accentColor, color: accentColor }}
                    />
                    <Chip
                      label={ESTADOS_MATRICULA[matricula.estado]?.label ?? matricula.estado}
                      size="small"
                      color={getEstadoColor(matricula.estado)}
                      sx={{ fontWeight: 600 }}
                    />
                    {matricula.es_repitente && <Chip label="Repitente" size="small" color="warning" />}
                    {matricula.es_becado && <Chip label={`Becado ${matricula.porcentaje_beca}%`} size="small" sx={{ color: 'gold', borderColor: 'gold' }} variant="outlined" />}
                  </Box>
                </Box>

                {/* ACCIONES PRINCIPALES */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={isDownloading ? <CircularProgress size={16} /> : <PdfIcon />}
                    onClick={() => descargarPDF(matriculaId)}
                    disabled={isDownloading}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: accentColor, color: accentColor }}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={() => verPreview(matriculaId)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: accentColor, color: accentColor }}
                  >
                    Ver PDF
                  </Button>
                  {esActivo && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setDrawerEditar(true)}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, background: accentGradient, color: isDark ? '#000' : '#fff' }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<TransferIcon />}
                        onClick={() => setDialogTransferir(true)}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08), color: 'text.primary' }}
                      >
                        Transferir
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<RetirarIcon />}
                        onClick={() => setDialogRetirar(true)}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                      >
                        Retirar
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<AnularIcon />}
                    onClick={() => setDialogCambiarEstado(true)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                  >
                    Estado
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* ── GRID PRINCIPAL ── */}
            <Grid container spacing={3}>

              {/* ── COLUMNA IZQUIERDA ── */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>

                  {/* DATOS DEL ESTUDIANTE */}
                  <Paper elevation={0} sx={paperSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PersonIcon sx={{ color: accentColor }} />
                      <Typography variant="h6" fontWeight={700}>Estudiante</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={matricula.estudiante_foto ?? undefined}
                        sx={{ width: 80, height: 80, mb: 1.5, boxShadow: `0 4px 16px ${alpha(accentColor, 0.4)}` }}
                      >
                        {matricula.estudiante_nombres.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} textAlign="center">{nombreCompleto}</Typography>
                      <Chip label={matricula.estudiante_codigo} size="small" variant="outlined" sx={{ mt: 0.5, fontFamily: 'monospace' }} />
                    </Box>

                    <Stack spacing={1.5} divider={<Divider />}>
                      {[
                        { label: 'CI', value: matricula.estudiante_ci ?? '—' },
                        { label: 'Fecha Nac.', value: formatFecha(matricula.estudiante_fecha_nacimiento) },
                        { label: 'Teléfono', value: matricula.estudiante_telefono ?? '—' },
                        { label: 'Email', value: (matricula as any).estudiante_email ?? '—' },
                        { label: 'Ciudad', value: (matricula as any).estudiante_ciudad ?? '—' },
                      ].map(({ label, value }) => (
                        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>{label.toUpperCase()}</Typography>
                          <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ maxWidth: '60%', wordBreak: 'break-word' }}>{value}</Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<PersonIcon />}
                      onClick={() => router.push(`/dashboard/estudiantes/${matricula.estudiante_id}`)}
                      sx={{ mt: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: accentColor, color: accentColor }}
                    >
                      Ver perfil completo
                    </Button>
                  </Paper>

                  {/* DATOS ACADÉMICOS */}
                  <Paper elevation={0} sx={paperSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <SchoolIcon sx={{ color: accentColor }} />
                      <Typography variant="h6" fontWeight={700}>Datos Académicos</Typography>
                    </Box>

                    <Stack spacing={1.5} divider={<Divider />}>
                      {[
                        { label: 'Periodo', value: matricula.periodo_nombre },
                        { label: 'Nivel', value: matricula.nivel_nombre },
                        { label: 'Grado', value: matricula.grado_nombre },
                        { label: 'Paralelo', value: matricula.paralelo_nombre },
                        { label: 'Turno', value: matricula.turno_nombre },
                        { label: 'Aula', value: matricula.aula ?? '—' },
                        { label: 'Fecha Matrícula', value: formatFecha(matricula.fecha_matricula) },
                        ...(matricula.fecha_retiro ? [{ label: 'Fecha Retiro', value: formatFecha(matricula.fecha_retiro) }] : []),
                        ...(matricula.motivo_retiro ? [{ label: 'Motivo Retiro', value: matricula.motivo_retiro }] : []),
                      ].map(({ label, value }) => (
                        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>{label.toUpperCase()}</Typography>
                          <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ maxWidth: '60%', wordBreak: 'break-word' }}>{value}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                </Stack>
              </Grid>

              {/* ── COLUMNA DERECHA ── */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>

                  {/* DOCUMENTOS */}
                  <Paper elevation={0} sx={paperSx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocIcon sx={{ color: accentColor }} />
                        <Typography variant="h6" fontWeight={700}>Documentos</Typography>
                        <Badge badgeContent={documentos.length} color="primary" sx={{ ml: 1 }} />
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => setDialogSubirDoc(true)}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, background: accentGradient, color: isDark ? '#000' : '#fff' }}
                      >
                        Subir
                      </Button>
                    </Box>

                    {documentos.length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <DocIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">No hay documentos registrados</Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {documentos.map((doc, i) => (
                          <React.Fragment key={doc.id}>
                            {i > 0 && <Divider />}
                            <ListItem sx={{ px: 0, py: 1.5 }}>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <DocIcon sx={{ color: doc.verificado ? 'success.main' : 'text.disabled' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {labelTipoDoc[doc.tipo_documento] ?? doc.tipo_documento}
                                    </Typography>
                                    <Chip
                                      label={doc.verificado ? 'Verificado' : 'Pendiente'}
                                      size="small"
                                      color={doc.verificado ? 'success' : 'default'}
                                      sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">{doc.nombre_archivo}</Typography>
                                    {doc.verificado_por_username && (
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Verificado por: {doc.verificado_por_username} · {formatFecha(doc.fecha_verificacion)}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Ver documento">
                                    <IconButton size="small" onClick={() => window.open(doc.url_archivo, '_blank')}>
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {!doc.verificado && (
                                    <Tooltip title="Verificar">
                                      <IconButton size="small" color="success" onClick={() => verificar(doc.id)}
                                        disabled={isVerificando}>
                                        <VerificarIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {!doc.verificado && (
                                    <Tooltip title="Eliminar">
                                      <IconButton size="small" color="error" onClick={() => setDialogEliminarDoc(doc.id)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Paper>

                  {/* OBSERVACIONES / BECA */}
                  {(matricula.observaciones || matricula.es_becado) && (
                    <Paper elevation={0} sx={paperSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <InfoIcon sx={{ color: accentColor }} />
                        <Typography variant="h6" fontWeight={700}>Información Adicional</Typography>
                      </Box>
                      <Stack spacing={2}>
                        {matricula.es_becado && (
                          <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: alpha('#f59e0b', 0.1), border: '1px solid', borderColor: alpha('#f59e0b', 0.3) }}>
                            <Typography variant="body2" fontWeight={700} color="warning.main">
                              🎓 Becado — {matricula.porcentaje_beca}%
                              {matricula.tipo_beca && ` · ${matricula.tipo_beca}`}
                            </Typography>
                          </Box>
                        )}
                        {matricula.observaciones && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>OBSERVACIONES</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{matricula.observaciones}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* HISTORIAL */}
                  <Paper elevation={0} sx={paperSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HistorialIcon sx={{ color: accentColor }} />
                      <Typography variant="h6" fontWeight={700}>Historial de Cambios</Typography>
                    </Box>

                    {historial.length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <HistorialIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Sin historial registrado</Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {historial.map((h, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <Divider />}
                            <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                              <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                <CalendarIcon sx={{ fontSize: 18, color: accentColor }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight={600}>{h.mensaje}</Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    {h.usuario && (
                                      <Typography variant="caption" color="text.secondary">
                                        Por: {h.usuario} · {' '}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFecha(h.created_at)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Paper>

                  {/* ZONA PELIGROSA */}
                  {matricula.estado !== 'activo' && (
                    <Paper elevation={0} sx={{ ...paperSx, borderColor: alpha('#ef4444', 0.3) }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <WarningIcon color="error" />
                        <Typography variant="h6" fontWeight={700} color="error">Zona Peligrosa</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Esta matrícula no está activa. Si lo necesitas, puedes eliminarla permanentemente del sistema.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDialogEliminar(true)}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                      >
                        Eliminar matrícula
                      </Button>
                    </Paper>
                  )}

                </Stack>
              </Grid>
            </Grid>

          </Box>
        </Fade>
      </Container>

      {/* ── DRAWER EDITAR ── */}
      <DrawerEditar
        open={drawerEditar}
        onClose={() => setDrawerEditar(false)}
        matricula={matricula}
        isGuardando={isActualizando}
        onGuardar={(data) => {
          actualizar(
            { matriculaId, data },
            {
              onSuccess: () => {
                setDrawerEditar(false);
                refetch();
              },
            }
          );
        }}
      />

      {/* ── DIÁLOGOS ── */}

      {/* Retirar */}
      <DialogConfirm
        open={dialogRetirar}
        title="Retirar Matrícula"
        description="El estudiante quedará retirado de este periodo. Esta acción puede revertirse cambiando el estado."
        icon={<RetirarIcon color="error" />}
        color="error"
        inputLabel="Motivo del retiro"
        confirmLabel="Retirar"
        loading={isRetirando}
        onConfirm={(motivo) => {
          retirar(
            { matriculaId, data: { motivo_retiro: motivo } },
            { onSuccess: () => { setDialogRetirar(false); refetch(); } }
          );
        }}
        onClose={() => setDialogRetirar(false)}
      />

      {/* Cambiar estado */}
      <Dialog open={dialogCambiarEstado} onClose={() => setDialogCambiarEstado(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EditIcon color="warning" />
            <Typography variant="h6" fontWeight={700}>Cambiar Estado</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as EstadoMatricula)}
                label="Nuevo Estado"
                sx={{ borderRadius: '12px' }}
              >
                {(Object.entries(ESTADOS_MATRICULA) as [EstadoMatricula, { label: string; color: string }][])
                  .filter(([key]) => key !== matricula.estado)
                  .map(([key, val]) => (
                    <MenuItem key={key} value={key}>{val.label}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogCambiarEstado(false)} variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              cambiarEstado(
                { estado: nuevoEstado },
                { onSuccess: () => { setDialogCambiarEstado(false); refetch(); } }
              );
            }}
            variant="contained"
            color="warning"
            disabled={isCambiandoEstado}
            startIcon={isCambiandoEstado ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {isCambiandoEstado ? 'Actualizando...' : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transferir paralelo */}
      <DialogTransferir
        open={dialogTransferir}
        loading={isTransfiriendo}
        matricula={matricula}
        onConfirm={(nuevoParaleloId, motivo) => {
          transferir(
            { nuevo_paralelo_id: nuevoParaleloId, motivo },
            { onSuccess: () => { setDialogTransferir(false); refetch(); } }
          );
        }}
        onClose={() => setDialogTransferir(false)}
      />

      {/* Eliminar matrícula */}
      <DialogConfirm
        open={dialogEliminar}
        title="Eliminar Matrícula"
        description="Esta acción no se puede deshacer. La matrícula será eliminada permanentemente del sistema."
        icon={<DeleteIcon color="error" />}
        color="error"
        inputLabel="Escribe el número de matrícula para confirmar"
        confirmLabel="Eliminar definitivamente"
        loading={isEliminando}
        onConfirm={() => {
          eliminar(undefined, {
            onSuccess: () => router.push('/dashboard/matriculacion'),
          });
        }}
        onClose={() => setDialogEliminar(false)}
      />

      {/* Subir documento */}
      <DialogSubirDoc
        open={dialogSubirDoc}
        loading={isSubiendo}
        onConfirm={(file, tipo, observaciones) => {
          subir(
            { files: [file], metadata: [{ tipo_documento: tipo as TipoDocumentoMatricula, observaciones }] },
            { onSuccess: () => setDialogSubirDoc(false) }
          );
        }}
        onClose={() => setDialogSubirDoc(false)}
      />

      {/* Eliminar documento */}
      <DialogConfirm
        open={dialogEliminarDoc !== null}
        title="Eliminar Documento"
        description="El documento será eliminado permanentemente. Solo puedes eliminar documentos no verificados."
        icon={<DeleteIcon color="error" />}
        color="error"
        inputRequired={false}
        confirmLabel="Eliminar"
        loading={isEliminandoDoc}
        onConfirm={() => {
          if (dialogEliminarDoc) {
            eliminarDoc(dialogEliminarDoc, { onSuccess: () => setDialogEliminarDoc(null) });
          }
        }}
        onClose={() => setDialogEliminarDoc(null)}
      />
    </Box>
  );
}