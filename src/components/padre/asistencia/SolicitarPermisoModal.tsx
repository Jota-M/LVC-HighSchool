'use client';
// components/padre/asistencia/SolicitarPermisoModal.tsx
// Rediseño: mismo lenguaje visual que ProductoFormDialog — header con
// watermark decorativo, eyebrow + ícono en recuadro, secciones con
// SectionLabel (ícono + etiqueta + regla), inputs con fieldSx (radio,
// foco con glow), footer fijo con Cancelar/Enviar. Se reemplaza el
// Stepper por un formulario de una sola vista (como el de productos);
// la validación ocurre al enviar.

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { keyframes } from '@mui/system';

import { HijoInfo, CrearPermisoHijoDTO } from '@/types/padreAsistenciaTypes';
import { MOTIVOS_PERMISO } from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const popIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`;

// ──────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CrearPermisoHijoDTO, archivo?: File) => Promise<boolean>;
  hijo: HijoInfo | null;
  materiasDisponibles?: { asignacion_id: number; materia_nombre: string }[];
  isSubmitting?: boolean;
}

interface FormState {
  fecha_ausencia: string;
  motivo: string;
  descripcion: string;
  es_dia_completo: boolean;
  hora_inicio: string;
  hora_fin: string;
  asignacion_docente_id: string; // '' = día completo
}

// ── pequeño helper visual: eyebrow de sección (ícono + etiqueta + regla) ────
const SectionLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode; brand: string; borderField: string }> = ({
  icon, children, brand, borderField,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
    <Box sx={{ display: 'flex', color: alpha(brand, 0.85), '& svg': { fontSize: 15 } }}>{icon}</Box>
    <Typography
      sx={{
        fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', background: borderField }} />
  </Box>
);

// ──────────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────────

const SolicitarPermisoModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  hijo,
  materiasDisponibles = [],
  isSubmitting = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── tokens (mismo criterio que ProductoFormDialog, en tono ámbar) ────────
  const brand = isDark ? '#fbbf24' : '#f59e0b';
  const brandSoft = isDark ? '#f59e0b' : '#b45309';
  const brandDim = isDark ? 'rgba(251,191,36,0.12)' : 'rgba(245,158,11,0.10)';
  const brandBorder = isDark ? 'rgba(251,191,36,0.25)' : 'rgba(245,158,11,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
      '&.Mui-disabled': { background: bgFieldAlt },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  const hoy = new Date().toISOString().slice(0, 10);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState<FormState>({
    fecha_ausencia: '',
    motivo: '',
    descripcion: '',
    es_dia_completo: true,
    hora_inicio: '',
    hora_fin: '',
    asignacion_docente_id: '',
  });

  const [errores, setErrores] = useState<Partial<FormState>>({});
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errores[key]) setErrores(prev => ({ ...prev, [key]: '' }));
  };

  const validar = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.fecha_ausencia) e.fecha_ausencia = 'Seleccioná la fecha de ausencia';
    if (!form.motivo) e.motivo = 'Seleccioná el motivo';
    if (!form.es_dia_completo) {
      if (!form.hora_inicio) e.hora_inicio = 'Indicá la hora de inicio';
      if (!form.hora_fin) e.hora_fin = 'Indicá la hora de fin';
    }
    setErrores(e);
    if (Object.keys(e).length > 0) {
      setError('Completá los campos obligatorios para continuar');
      return false;
    }
    setError(null);
    return true;
  };

  const validarYSetearArchivo = (f: File | undefined) => {
    if (!f) return;
    const esValido = f.type.startsWith('image/') || f.type === 'application/pdf';
    if (!esValido) {
      setError('El archivo debe ser una imagen (JPG, PNG) o un PDF');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar los 5 MB');
      return;
    }
    setArchivo(f);
    setArchivoPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
    setError(null);
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validarYSetearArchivo(e.target.files?.[0]);
  };

  const handleDropArchivo = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    validarYSetearArchivo(e.dataTransfer.files?.[0]);
  };

  const quitarArchivo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivo(null);
    setArchivoPreview(null);
  };

  const resetForm = () => {
    setForm({
      fecha_ausencia: '', motivo: '', descripcion: '',
      es_dia_completo: true, hora_inicio: '', hora_fin: '',
      asignacion_docente_id: '',
    });
    setArchivo(null);
    setArchivoPreview(null);
    setErrores({});
    setError(null);
  };

  const handleSubmit = async () => {
    if (!hijo || !validar()) return;

    const data: CrearPermisoHijoDTO = {
      estudiante_id: hijo.estudiante_id,
      fecha_ausencia: form.fecha_ausencia,
      motivo: form.motivo as any,
      descripcion: form.descripcion || undefined,
      es_dia_completo: form.es_dia_completo,
      hora_inicio: !form.es_dia_completo ? form.hora_inicio : undefined,
      hora_fin: !form.es_dia_completo ? form.hora_fin : undefined,
      asignacion_docente_id: form.asignacion_docente_id
        ? parseInt(form.asignacion_docente_id)
        : null,
    };

    try {
      const ok = await onSubmit(data, archivo ?? undefined);
      if (ok) {
        setExito(true);
        setTimeout(() => {
          setExito(false);
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setExito(false);
    resetForm();
    onClose();
  };

  const motivoSeleccionado = MOTIVOS_PERMISO.find(m => m.value === form.motivo);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(251,191,36,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{
          px: 3, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden',
          borderBottom: `1px solid ${borderField}`,
          background: `linear-gradient(135deg, ${brandDim} 0%, transparent 65%)`,
        }}
      >
        {/* watermark decorativo sutil */}
        <EventBusyRoundedIcon
          sx={{
            position: 'absolute', right: -14, top: -18, fontSize: 120,
            color: brand, opacity: isDark ? 0.05 : 0.06, transform: 'rotate(-12deg)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
              }}
            >
              {hijo ? `Para ${hijo.nombres} ${hijo.apellidos}` : 'Nueva solicitud'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <EventBusyRoundedIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                Solicitar permiso
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={handleClose}
            sx={{
              width: 32, height: 32, borderRadius: '9px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              opacity: isSubmitting ? 0.4 : 1,
              transition: 'all 0.15s',
              '&:hover': isSubmitting ? {} : { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 3, py: 2.75 }}>
        {exito ? (
          <Box sx={{ textAlign: 'center', py: 5, animation: `${popIn} 0.4s cubic-bezier(0.34,1.56,0.64,1)` }}>
            <Box
              sx={{
                width: 80, height: 80, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3,
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>
            <Typography variant="h6" fontWeight={900} gutterBottom>
              ¡Solicitud enviada!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              El docente recibirá tu solicitud y te notificaremos cuando sea revisada.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {error && (
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha('#ef4444', 0.1), border: `1px solid ${alpha('#ef4444', 0.25)}`, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
                {error}
              </Box>
            )}

            {/* ── Sección: datos del permiso ── */}
            <Box>
              <SectionLabel icon={<CalendarMonthRoundedIcon />} brand={brand} borderField={borderField}>
                Datos del permiso
              </SectionLabel>

              <Stack spacing={1.5} sx={{ mt: 1.25 }}>
                <TextField
                  label="Fecha de ausencia"
                  type="date"
                  size="small"
                  fullWidth
                  value={form.fecha_ausencia}
                  onChange={e => handleChange('fecha_ausencia', e.target.value)}
                  error={!!errores.fecha_ausencia}
                  helperText={errores.fecha_ausencia}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: hoy }}
                  sx={fieldSx}
                />

                {/* Motivo */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Motivo de la ausencia
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {MOTIVOS_PERMISO.map(m => (
                      <Chip
                        key={m.value}
                        label={`${m.icon} ${m.label}`}
                        onClick={() => handleChange('motivo', m.value)}
                        variant={form.motivo === m.value ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                          height: 30, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          borderRadius: '10px', transition: 'all 0.15s',
                          ...(form.motivo === m.value
                            ? {
                              background: `linear-gradient(135deg, ${brand}, ${brandSoft})`,
                              color: isDark ? '#000' : '#fff',
                              border: 'none',
                              boxShadow: `0 2px 8px ${alpha(brand, 0.4)}`,
                            }
                            : {
                              bgcolor: bgFieldAlt,
                              borderColor: borderField,
                              '&:hover': { borderColor: alpha(brand, 0.5), bgcolor: alpha(brand, 0.06) },
                            }),
                        }}
                      />
                    ))}
                  </Box>
                  {errores.motivo && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
                      {errores.motivo}
                    </Typography>
                  )}
                </Box>

                {/* ¿Día completo? */}
                <Box
                  sx={{
                    p: 1.5, borderRadius: '12px', background: bgFieldAlt,
                    border: `1px solid ${borderField}`,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.es_dia_completo}
                        onChange={e => handleChange('es_dia_completo', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: brand },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: brand },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700}>Día completo</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {form.es_dia_completo
                            ? 'Ausencia en todas las materias del día'
                            : 'Solo en un horario específico'}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Horario parcial */}
                {!form.es_dia_completo && (
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      label="Hora inicio"
                      type="time"
                      size="small"
                      fullWidth
                      value={form.hora_inicio}
                      onChange={e => handleChange('hora_inicio', e.target.value)}
                      error={!!errores.hora_inicio}
                      helperText={errores.hora_inicio}
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="Hora fin"
                      type="time"
                      size="small"
                      fullWidth
                      value={form.hora_fin}
                      onChange={e => handleChange('hora_fin', e.target.value)}
                      error={!!errores.hora_fin}
                      helperText={errores.hora_fin}
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                  </Box>
                )}

                {/* Materia específica (opcional) */}
                {materiasDisponibles.length > 0 && (
                  <TextField
                    select
                    label="Materia afectada (opcional)"
                    value={form.asignacion_docente_id}
                    onChange={e => handleChange('asignacion_docente_id', e.target.value)}
                    size="small"
                    fullWidth
                    sx={fieldSx}
                  >
                    <MenuItem value="">Todas las materias del día</MenuItem>
                    {materiasDisponibles.map(m => (
                      <MenuItem key={m.asignacion_id} value={m.asignacion_id.toString()}>
                        {m.materia_nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Stack>
            </Box>

            {/* ── Sección: descripción y adjunto ── */}
            <Box>
              <SectionLabel icon={<DescriptionRoundedIcon />} brand={brand} borderField={borderField}>
                Descripción y documentación
              </SectionLabel>

              <Stack spacing={1.5} sx={{ mt: 1.25 }}>
                {form.fecha_ausencia && motivoSeleccionado && (
                  <Box
                    sx={{
                      p: 1.25, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1,
                      bgcolor: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.06),
                      border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                      fontSize: 13, fontWeight: 600, color: 'text.secondary',
                    }}
                  >
                    <Box sx={{ fontSize: 16 }}>{motivoSeleccionado.icon}</Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {new Date(form.fecha_ausencia + 'T12:00:00').toLocaleDateString('es-BO', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                      {' · '}{motivoSeleccionado.label}
                      {!form.es_dia_completo && form.hora_inicio && form.hora_fin && (
                        <> · {form.hora_inicio} – {form.hora_fin}</>
                      )}
                    </Typography>
                  </Box>
                )}

                <TextField
                  label="Descripción (opcional)"
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  value={form.descripcion}
                  onChange={e => handleChange('descripcion', e.target.value)}
                  placeholder="Agregá detalles adicionales sobre el motivo de la ausencia..."
                  sx={fieldSx}
                />

                {/* Adjunto — dropzone con previsualización, idéntico a productos */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Documento de respaldo (opcional)
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleArchivoChange}
                  />
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDropArchivo}
                    sx={{
                      borderRadius: '16px', cursor: 'pointer',
                      py: archivo ? 2.5 : 4, px: 3,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', gap: 0.5, position: 'relative',
                      background: dragOver ? alpha(brand, 0.08) : bgFieldAlt,
                      border: `1.5px dashed ${dragOver ? brand : archivo ? alpha('#10b981', 0.4) : borderField}`,
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: alpha(brand, 0.5), background: alpha(brand, 0.04) },
                    }}
                  >
                    {archivo && (
                      <Box
                        onClick={quitarArchivo}
                        sx={{
                          position: 'absolute', top: 10, right: 10,
                          width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'text.secondary', background: bgField, border: `1px solid ${borderField}`,
                          '&:hover': { background: alpha('#ef4444', 0.1), borderColor: alpha('#ef4444', 0.3), color: '#ef4444' },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 13 }} />
                      </Box>
                    )}

                    {archivoPreview ? (
                      <Box
                        component="img"
                        src={archivoPreview}
                        alt="Vista previa"
                        sx={{
                          width: 84, height: 84, borderRadius: '12px', objectFit: 'cover', mb: 0.75,
                          border: `1px solid ${borderField}`,
                        }}
                      />
                    ) : archivo ? (
                      <Box
                        sx={{
                          width: 60, height: 72, borderRadius: '10px', mb: 0.75,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: alpha('#10b981', 0.12), border: `1px solid ${alpha('#10b981', 0.3)}`,
                        }}
                      >
                        <InsertDriveFileRoundedIcon sx={{ color: '#10b981', fontSize: 28 }} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 52, height: 52, borderRadius: '50%', mb: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.3)}`,
                        }}
                      >
                        <AttachFileRoundedIcon sx={{ color: brand, fontSize: 24 }} />
                      </Box>
                    )}

                    <Typography variant="body2" fontWeight={800}>
                      {archivo ? archivo.name : 'Arrastrá tu documento acá'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                      {archivo ? `${(archivo.size / 1024).toFixed(0)} KB` : 'Admite PDF, JPG o PNG · máx. 5MB'}
                    </Typography>

                    <Button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      size="small"
                      variant="contained"
                      disableElevation
                      sx={{
                        borderRadius: '10px', px: 2.25, textTransform: 'none', fontWeight: 700,
                        background: isDark ? 'rgba(255,255,255,0.10)' : '#111827',
                        color: '#fff',
                        '&:hover': { background: isDark ? 'rgba(255,255,255,0.16)' : '#000' },
                      }}
                    >
                      {archivo ? 'Cambiar documento' : 'Elegir archivo'}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>

      {/* ── FOOTER ── */}
      {!exito && (
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': { background: brandSoft, boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.5, background: brand, color: isDark ? '#000' : '#fff' },
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export default SolicitarPermisoModal;