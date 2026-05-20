'use client';
// components/padre/asistencia/SolicitarPermisoModal.tsx

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { HijoInfo, CrearPermisoHijoDTO,  } from '@/types/padreAsistenciaTypes';
import { MOTIVOS_PERMISO } from '@/types/asistenciaTypes';

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

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

  const hoy = new Date().toISOString().slice(0, 10);
  const [paso, setPaso] = useState(0);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState<FormState>({
    fecha_ausencia:        '',
    motivo:                '',
    descripcion:           '',
    es_dia_completo:       true,
    hora_inicio:           '',
    hora_fin:              '',
    asignacion_docente_id: '',
  });

  const [errores, setErrores] = useState<Partial<FormState>>({});

  const handleChange = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errores[key]) setErrores(prev => ({ ...prev, [key]: '' }));
  };

  const validarPaso1 = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.fecha_ausencia) e.fecha_ausencia = 'Seleccioná la fecha de ausencia';
    if (!form.motivo)         e.motivo         = 'Seleccioná el motivo';
    if (!form.es_dia_completo) {
      if (!form.hora_inicio) e.hora_inicio = 'Indicá la hora de inicio';
      if (!form.hora_fin)    e.hora_fin    = 'Indicá la hora de fin';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSiguiente = () => {
    if (paso === 0 && !validarPaso1()) return;
    setPaso(p => p + 1);
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        alert('El archivo no puede superar los 5 MB');
        return;
      }
      setArchivo(f);
    }
  };

  const handleSubmit = async () => {
    if (!hijo) return;

    const data: CrearPermisoHijoDTO = {
      estudiante_id:         hijo.estudiante_id,
      fecha_ausencia:        form.fecha_ausencia,
      motivo:                form.motivo as any,
      descripcion:           form.descripcion || undefined,
      es_dia_completo:       form.es_dia_completo,
      hora_inicio:           !form.es_dia_completo ? form.hora_inicio : undefined,
      hora_fin:              !form.es_dia_completo ? form.hora_fin    : undefined,
      asignacion_docente_id: form.asignacion_docente_id
        ? parseInt(form.asignacion_docente_id)
        : null,
    };

    const ok = await onSubmit(data, archivo ?? undefined);
    if (ok) {
      setExito(true);
      setTimeout(() => {
        setExito(false);
        setPaso(0);
        setForm({
          fecha_ausencia: '', motivo: '', descripcion: '',
          es_dia_completo: true, hora_inicio: '', hora_fin: '',
          asignacion_docente_id: '',
        });
        setArchivo(null);
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setPaso(0);
    setExito(false);
    setErrores({});
    setArchivo(null);
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
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, #1e1e2e, #1a1a2a)'
            : '#fff',
          boxShadow: isDark
            ? '0 24px 80px rgba(0,0,0,0.6)'
            : '0 24px 80px rgba(0,0,0,0.12)',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#f59e0b', 0.15)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha('#f59e0b', 0.08)} 0%, #fff 100%)`,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
              }}
            >
              <EventBusyIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                Solicitar permiso
              </Typography>
              {hijo && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Para {hijo.nombres} {hijo.apellidos}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={isSubmitting}
            size="small"
            sx={{
              bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
              borderRadius: 2,
              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08) },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Estado de éxito */}
        {exito ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 5,
              animation: `${popIn} 0.4s cubic-bezier(0.34,1.56,0.64,1)`,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>
            <Typography variant="h6" fontWeight={900} gutterBottom>
              ¡Solicitud enviada!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              El docente recibirá tu solicitud y te notificaremos cuando sea revisada.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ animation: `${fadeUp} 0.3s ease-out` }}>
            {/* Pasos */}
            <Stepper activeStep={paso} orientation="vertical" sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: 13 } }}>
              {/* ─── PASO 1: Datos del permiso ─── */}
              <Step>
                <StepLabel>Datos del permiso</StepLabel>
                <StepContent>
                  <Box sx={{ pt: 1.5, pb: 2 }}>
                    {/* Fecha */}
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
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    {/* Motivo */}
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Motivo de la ausencia
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {MOTIVOS_PERMISO.map(m => (
                        <Chip
                          key={m.value}
                          label={`${m.icon} ${m.label}`}
                          onClick={() => handleChange('motivo', m.value)}
                          variant={form.motivo === m.value ? 'filled' : 'outlined'}
                          size="small"
                          sx={{
                            height: 30,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            ...(form.motivo === m.value
                              ? {
                                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                  color: '#fff',
                                  border: 'none',
                                  boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                                }
                              : {
                                  bgcolor: 'transparent',
                                  borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.12),
                                  '&:hover': {
                                    borderColor: '#f59e0b',
                                    bgcolor: alpha('#f59e0b', 0.08),
                                  },
                                }),
                          }}
                        />
                      ))}
                    </Box>
                    {errores.motivo && (
                      <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                        {errores.motivo}
                      </Typography>
                    )}

                    {/* ¿Día completo? */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                        mb: form.es_dia_completo ? 0 : 2,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.es_dia_completo}
                            onChange={e => handleChange('es_dia_completo', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#f59e0b' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f59e0b' },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              Día completo
                            </Typography>
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
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Box>
                    )}

                    {/* Materia específica (opcional) */}
                    {materiasDisponibles.length > 0 && (
                      <FormControl size="small" fullWidth sx={{ mt: 2 }}>
                        <InputLabel sx={{ fontWeight: 600, fontSize: 13 }}>
                          Materia afectada (opcional)
                        </InputLabel>
                        <Select
                          value={form.asignacion_docente_id}
                          label="Materia afectada (opcional)"
                          onChange={e => handleChange('asignacion_docente_id', e.target.value)}
                          sx={{ borderRadius: 2, fontSize: 13 }}
                        >
                          <MenuItem value="">Todas las materias del día</MenuItem>
                          {materiasDisponibles.map(m => (
                            <MenuItem key={m.asignacion_id} value={m.asignacion_id.toString()}>
                              {m.materia_nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleSiguiente}
                    sx={{
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                      '&:hover': { boxShadow: '0 6px 16px rgba(245,158,11,0.4)' },
                    }}
                  >
                    Continuar
                  </Button>
                </StepContent>
              </Step>

              {/* ─── PASO 2: Descripción y adjunto ─── */}
              <Step>
                <StepLabel>Descripción y documentación</StepLabel>
                <StepContent>
                  <Box sx={{ pt: 1.5, pb: 2 }}>
                    {/* Resumen del paso 1 */}
                    {form.fecha_ausencia && motivoSeleccionado && (
                      <Alert
                        severity="info"
                        icon={<Box sx={{ fontSize: 18 }}>{motivoSeleccionado.icon}</Box>}
                        sx={{
                          mb: 2,
                          borderRadius: 2.5,
                          fontSize: 13,
                          fontWeight: 600,
                          border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                          background: isDark ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.05),
                          '& .MuiAlert-icon': { alignItems: 'center' },
                        }}
                      >
                        {new Date(form.fecha_ausencia + 'T12:00:00').toLocaleDateString('es-BO', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                        {' · '}
                        {motivoSeleccionado.label}
                        {!form.es_dia_completo && form.hora_inicio && form.hora_fin && (
                          <> · {form.hora_inicio} – {form.hora_fin}</>
                        )}
                      </Alert>
                    )}

                    {/* Descripción */}
                    <TextField
                      label="Descripción (opcional)"
                      multiline
                      rows={3}
                      size="small"
                      fullWidth
                      value={form.descripcion}
                      onChange={e => handleChange('descripcion', e.target.value)}
                      placeholder="Agregá detalles adicionales sobre el motivo de la ausencia..."
                      sx={{
                        mb: 2.5,
                        '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: 13 },
                      }}
                    />

                    {/* Adjunto */}
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Documento de respaldo (opcional · max. 5 MB)
                      </Typography>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleArchivoChange}
                        style={{ display: 'none' }}
                      />
                      {archivo ? (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                            bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AttachFileIcon sx={{ fontSize: 20, color: '#10b981' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>
                                {archivo.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(archivo.size / 1024).toFixed(0)} KB
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => setArchivo(null)}
                            sx={{
                              bgcolor: alpha('#ef4444', 0.1),
                              color: '#ef4444',
                              borderRadius: 1.5,
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          startIcon={<AttachFileIcon />}
                          onClick={() => fileInputRef.current?.click()}
                          size="small"
                          sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: 12,
                            borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
                            color: 'text.secondary',
                            '&:hover': {
                              borderColor: '#f59e0b',
                              bgcolor: alpha('#f59e0b', 0.05),
                              color: '#f59e0b',
                            },
                          }}
                        >
                          Adjuntar certificado o documento
                        </Button>
                      )}
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        Formatos aceptados: PDF, JPG, PNG
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setPaso(0)}
                      disabled={isSubmitting}
                      sx={{
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
                      }}
                    >
                      Volver
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <NoteAddIcon />}
                      sx={{
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                        '&:hover': { boxShadow: '0 6px 16px rgba(16,185,129,0.4)' },
                        '&.Mui-disabled': { opacity: 0.6 },
                      }}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SolicitarPermisoModal;