// src/components/cupos/CupoFormDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Stack,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '@/lib/api';
import { useCupos } from '@/hooks/useCupos';

interface CupoFormDialogProps {
  open: boolean;
  cupo: any | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const CupoFormDialog: React.FC<CupoFormDialogProps> = ({
  open,
  cupo,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── tokens ──────────────────────────────────────────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.10)' : 'rgba(2,136,209,0.07)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.28)' : 'rgba(2,136,209,0.22)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const R = '12px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}` },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
  };

  const { createCupo, updateCupo } = useCupos();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    periodo_academico_id: '',
    grado_id: '',
    turno_id: '',
    cupos_totales: '',
    activo: true,
    observaciones: '',
  });

  // ── efectos ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [periodosRes, gradosRes, turnosRes] = await Promise.all([
          api.get('/public/academicos/periodo-activo'),
          api.get('/public/academicos/grados'),
          api.get('/public/academicos/turnos'),
        ]);
        const periodo = periodosRes.data.data?.periodo;
        setPeriodos(periodo ? [periodo] : []);
        setGrados(gradosRes.data.data?.grados || []);
        setTurnos(turnosRes.data.data?.turnos || []);
        if (periodo && !cupo)
          setFormData(prev => ({ ...prev, periodo_academico_id: periodo.id }));
      } catch (err) {
        console.error('Error al cargar opciones:', err);
      }
    };
    if (open) loadOptions();
  }, [open, cupo]);

  useEffect(() => {
    if (cupo) {
      setFormData({
        periodo_academico_id: cupo.periodo_academico_id || '',
        grado_id: cupo.grado_id || '',
        turno_id: cupo.turno_id || '',
        cupos_totales: cupo.cupos_totales || '',
        activo: cupo.activo ?? true,
        observaciones: cupo.observaciones || '',
      });
    } else {
      setFormData({ periodo_academico_id: '', grado_id: '', turno_id: '', cupos_totales: '', activo: true, observaciones: '' });
    }
    setErrors({});
    setError(null);
  }, [cupo, open]);

  // ── lógica ──────────────────────────────────────────────────────────────────
  const validate = () => {
    const e: any = {};
    if (!formData.periodo_academico_id) e.periodo_academico_id = 'Seleccione un período académico';
    if (!formData.grado_id) e.grado_id = 'Seleccione un grado';
    if (!formData.turno_id) e.turno_id = 'Seleccione un turno';
    if (!formData.cupos_totales || parseInt(formData.cupos_totales) < 1)
      e.cupos_totales = 'Ingrese cupos totales (mínimo 1)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const data = {
        periodo_academico_id: parseInt(formData.periodo_academico_id),
        grado_id: parseInt(formData.grado_id),
        turno_id: parseInt(formData.turno_id),
        cupos_totales: parseInt(formData.cupos_totales),
        activo: formData.activo,
        observaciones: formData.observaciones || undefined,
      };
      if (cupo) {
        await updateCupo(cupo.id, { cupos_totales: data.cupos_totales, activo: data.activo, observaciones: data.observaciones });
        onSuccess('Cupo actualizado correctamente');
      } else {
        await createCupo(data);
        onSuccess('Cupo creado correctamente');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cupo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  // ── render ──────────────────────────────────────────────────────────────────
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
              Cupos · {cupo ? 'Editar' : 'Nuevo'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                background: alpha(brand, 0.15), border: `1px solid ${alpha(brand, 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cupo
                  ? <EditIcon sx={{ color: brand, fontSize: 18 }} />
                  : <EventSeatIcon sx={{ color: brand, fontSize: 18 }} />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', lineHeight: 1.2 }}>
                  {cupo ? 'Editar cupo' : 'Nuevo cupo'}
                </Typography>
                {cupo && (
                  <Typography variant="caption" color="text.secondary">
                    {cupo.grado_nombre}
                  </Typography>
                )}
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
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2}>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: R }}>
              {error}
            </Alert>
          )}

          {/* Período */}
          <FormControl fullWidth error={!!errors.periodo_academico_id} disabled={!!cupo} sx={fieldSx}>
            <Select
              value={formData.periodo_academico_id}
              onChange={e => handleChange('periodo_academico_id', e.target.value)}
              displayEmpty
              renderValue={val => {
                const p = periodos.find(x => x.id === val);
                return p
                  ? <Typography variant="body2">{p.nombre} {p.activo ? '· Activo' : ''}</Typography>
                  : <Typography variant="body2" color="text.secondary">Período académico *</Typography>;
              }}
            >
              {periodos.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre} ({p.activo ? 'Activo' : 'Inactivo'})
                </MenuItem>
              ))}
            </Select>
            {errors.periodo_academico_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.periodo_academico_id}
              </Typography>
            )}
          </FormControl>

          {/* Grado + Turno */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth error={!!errors.grado_id} disabled={!!cupo} sx={fieldSx}>
              <Select
                value={formData.grado_id}
                onChange={e => handleChange('grado_id', e.target.value)}
                displayEmpty
                renderValue={val => {
                  const g = grados.find(x => x.id === val);
                  return g
                    ? <Typography variant="body2">{g.nivel_nombre} — {g.nombre}</Typography>
                    : <Typography variant="body2" color="text.secondary">Grado *</Typography>;
                }}
              >
                {grados.map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.nivel_nombre} — {g.nombre}</MenuItem>
                ))}
              </Select>
              {errors.grado_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.grado_id}</Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.turno_id} disabled={!!cupo} sx={fieldSx}>
              <Select
                value={formData.turno_id}
                onChange={e => handleChange('turno_id', e.target.value)}
                displayEmpty
                renderValue={val => {
                  const t = turnos.find(x => x.id === val);
                  return t
                    ? <Typography variant="body2">{t.nombre} · {t.hora_inicio}–{t.hora_fin}</Typography>
                    : <Typography variant="body2" color="text.secondary">Turno *</Typography>;
                }}
              >
                {turnos.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.nombre} ({t.hora_inicio} - {t.hora_fin})</MenuItem>
                ))}
              </Select>
              {errors.turno_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.turno_id}</Typography>
              )}
            </FormControl>
          </Stack>

          {/* Cupos totales */}
          <TextField
            fullWidth
            type="number"
            label="Cupos totales *"
            value={formData.cupos_totales}
            onChange={e => handleChange('cupos_totales', e.target.value)}
            error={!!errors.cupos_totales}
            helperText={errors.cupos_totales || 'Cantidad máxima de estudiantes'}
            inputProps={{ min: 1, max: 100 }}
            sx={fieldSx}
          />

          {/* Activo */}
          <Box sx={{
            p: 1.75, borderRadius: R,
            background: formData.activo ? alpha('#10b981', 0.07) : alpha(theme.palette.grey[500], 0.06),
            border: `1px solid ${formData.activo ? alpha('#10b981', 0.25) : alpha(theme.palette.grey[500], 0.2)}`,
            transition: 'all 0.25s',
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={e => handleChange('activo', e.target.checked)}
                  color="success"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
                  {formData.activo
                    ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                    : <RadioButtonUncheckedIcon sx={{ color: 'action.disabled', fontSize: 18 }} />}
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      Cupo {formData.activo ? 'activo' : 'inactivo'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.activo
                        ? 'Disponible para preinscripciones'
                        : 'No disponible para preinscripciones'}
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0, width: '100%' }}
            />
          </Box>

          {/* Observaciones */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={e => handleChange('observaciones', e.target.value)}
            placeholder="Notas adicionales sobre este cupo..."
            sx={fieldSx}
          />

          {/* Info al editar */}
          {cupo && (
            <Box sx={{
              p: 1.75, borderRadius: R,
              background: alpha(brand, 0.07), border: `1px solid ${alpha(brand, 0.2)}`,
            }}>
              <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: 'block', mb: 0.75 }}>
                Información actual
              </Typography>
              {[
                `Cupos ocupados: ${cupo.cupos_ocupados}`,
                `Cupos disponibles: ${cupo.cupos_disponibles}`,
              ].map(line => (
                <Typography key={line} variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8 }}>
                  · {line}
                </Typography>
              ))}
              {cupo.cupos_ocupados > 0 && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                  ⚠ No puede reducir los cupos por debajo de {cupo.cupos_ocupados}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', gap: 1.25, borderTop: `1px solid ${borderField}` }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600,
            color: 'text.secondary', border: `1px solid ${borderField}`,
            '&:hover': { borderColor: alpha(brand, 0.5), color: brand, background: alpha(brand, 0.05) },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading
            ? <CircularProgress size={16} color="inherit" />
            : cupo ? <SaveIcon /> : <EventSeatIcon />}
          sx={{
            flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            background: brand, color: isDark ? '#000' : '#fff',
            boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
            '&:hover': {
              background: isDark ? '#eab308' : '#01579b',
              boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
            },
            '&.Mui-disabled': { opacity: 0.35, background: brand, color: isDark ? '#000' : '#fff' },
          }}
        >
          {loading ? 'Guardando...' : cupo ? 'Actualizar cupo' : 'Crear cupo'}
        </Button>
      </Box>
    </Dialog>
  );
};