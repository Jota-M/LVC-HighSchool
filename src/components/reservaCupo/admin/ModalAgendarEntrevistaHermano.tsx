// src/components/reservaCupo/admin/ModalAgendarEntrevistaHermano.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Alert,
  Avatar,
  Chip,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  EventAvailableRounded as EventIcon,
  Close as CloseIcon,
  LocationOnRounded as LocationIcon,
  VideocamRounded as VideoIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircleRounded as CheckCircleIcon,
  CancelRounded as CancelIcon,
  EditCalendarRounded as EditCalendarIcon,
  OpenInNewRounded as OpenInNewIcon,
  FamilyRestroomRounded as FamilyIcon,
  PersonRounded as PersonIcon,
} from '@mui/icons-material';
import { ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { reservaCupoService } from '@/services/reservaCupoService';
import { getInitials } from './common';

interface ModalAgendarEntrevistaHermanoProps {
  open: boolean;
  hermano: ReservaCupoHermanoData | null;
  onClose: () => void;
  onGuardar: (payload: {
    fecha_entrevista: string;
    modalidad_entrevista: 'presencial' | 'virtual';
    lugar_entrevista?: string;
    enlace_entrevista?: string;
    observaciones_entrevista?: string;
    notificar_whatsapp: boolean;
    hermano_ids?: number[];
  }) => Promise<void>;
  onCambiarEstadoEntrevista?: (
    nuevoEstado: 'pendiente' | 'programada' | 'realizada' | 'aprobada' | 'no_asistio',
    hermanoIds?: number[]
  ) => Promise<void>;
  isProcesando: boolean;
}

export const ModalAgendarEntrevistaHermano: React.FC<ModalAgendarEntrevistaHermanoProps> = ({
  open,
  hermano,
  onClose,
  onGuardar,
  onCambiarEstadoEntrevista,
  isProcesando,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [fechaHora, setFechaHora] = useState('');
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [lugar, setLugar] = useState('Dirección del Colegio - Oficina Principal');
  const [enlace, setEnlace] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [notificarWhatsapp, setNotificarWhatsapp] = useState(true);

  // Hermanos de la misma familia detectados
  const [hermanosFamilia, setHermanosFamilia] = useState<ReservaCupoHermanoData[]>([]);
  const [selectedHermanoIds, setSelectedHermanoIds] = useState<number[]>([]);
  const [loadingFamilia, setLoadingFamilia] = useState(false);

  // Inicializar con datos del hermano al abrir y consultar familia
  useEffect(() => {
    if (hermano && open) {
      if (hermano.fecha_entrevista_iso) {
        setFechaHora(hermano.fecha_entrevista_iso.slice(0, 16));
      } else {
        // Por defecto: mañana a las 09:00 AM
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        manana.setHours(9, 0, 0, 0);
        const yyyy = manana.getFullYear();
        const mm = String(manana.getMonth() + 1).padStart(2, '0');
        const dd = String(manana.getDate()).padStart(2, '0');
        const hh = String(manana.getHours()).padStart(2, '0');
        const min = String(manana.getMinutes()).padStart(2, '0');
        setFechaHora(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      }

      setModalidad(hermano.modalidad_entrevista || 'presencial');
      setLugar(hermano.lugar_entrevista || 'Dirección del Colegio - Oficina Principal');
      setEnlace(hermano.enlace_entrevista || '');
      setObservaciones(hermano.observaciones_entrevista || '');
      setNotificarWhatsapp(true);

      // Cargar otros hermanos de la misma familia
      cargarFamilia(hermano.id);
    } else {
      setHermanosFamilia([]);
      setSelectedHermanoIds([]);
    }
  }, [hermano, open]);

  const cargarFamilia = async (id: number) => {
    setLoadingFamilia(true);
    try {
      const resp = await reservaCupoService.obtenerFamiliaHermano(id);
      if (resp?.hermanosFamilia && resp.hermanosFamilia.length > 0) {
        setHermanosFamilia(resp.hermanosFamilia);
        setSelectedHermanoIds(resp.hermanosFamilia.map((h) => h.id));
      } else if (hermano) {
        setHermanosFamilia([hermano]);
        setSelectedHermanoIds([hermano.id]);
      }
    } catch (err) {
      console.warn('No se pudo cargar grupo familiar:', err);
      if (hermano) {
        setHermanosFamilia([hermano]);
        setSelectedHermanoIds([hermano.id]);
      }
    } finally {
      setLoadingFamilia(false);
    }
  };

  if (!hermano) return null;

  const esGrupoFamiliar = hermanosFamilia.length > 1;
  const yaProgramada = hermano.estado_entrevista === 'programada';
  const esAprobada = hermano.estado_entrevista === 'aprobada' || hermano.estado_entrevista === 'realizada';
  const esNoAsistio = hermano.estado_entrevista === 'no_asistio';

  const handleToggleHermano = (id: number) => {
    if (selectedHermanoIds.includes(id)) {
      if (selectedHermanoIds.length === 1) return; // Al menos uno seleccionado
      setSelectedHermanoIds(selectedHermanoIds.filter((x) => x !== id));
    } else {
      setSelectedHermanoIds([...selectedHermanoIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaHora) return;

    await onGuardar({
      fecha_entrevista: fechaHora,
      modalidad_entrevista: modalidad,
      lugar_entrevista: modalidad === 'presencial' ? lugar : undefined,
      enlace_entrevista: modalidad === 'virtual' ? enlace : undefined,
      observaciones_entrevista: observaciones,
      notificar_whatsapp: notificarWhatsapp,
      hermano_ids: selectedHermanoIds.length > 0 ? selectedHermanoIds : [hermano.id],
    });
  };

  // Enlace directo WhatsApp de contingencia
  const generarEnlaceWhatsAppWeb = () => {
    const tel = (hermano.tutor_telefono || '').replace(/\D/g, '');
    const num = tel.startsWith('591') ? tel : `591${tel}`;
    const fechaPretty = fechaHora ? fechaHora.replace('T', ' a horas ') : 'a coordinar';

    const nombresHermanos = hermanosFamilia
      .filter((h) => selectedHermanoIds.includes(h.id))
      .map((h) => `${h.nombres} ${h.apellido_paterno} (${h.codigo_reserva})`)
      .join(', ');

    const texto = encodeURIComponent(
      `Estimado/a ${hermano.tutor_nombre}, le comunicamos de la Unidad Educativa La Voz de Cristo que la entrevista institucional familiar para sus hijos postulantes: ${nombresHermanos} ha sido agendada para: ${fechaPretty} (${modalidad === 'presencial' ? `Lugar: ${lugar}` : `Enlace: ${enlace}`}). Para optimizar su tiempo, se llevará a cabo una sola entrevista conjunta para toda la familia. Es indispensable la asistencia del tutor junto con los postulantes.`
    );
    return `https://api.whatsapp.com/send?phone=${num}&text=${texto}`;
  };

  return (
    <Dialog
      open={open}
      onClose={isProcesando ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          backgroundImage: 'none',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Cabecera */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 46,
                height: 46,
                bgcolor: esGrupoFamiliar
                  ? alpha('#8b5cf6', 0.15)
                  : isDark
                  ? alpha('#38bdf8', 0.15)
                  : alpha('#0288d1', 0.12),
                color: esGrupoFamiliar ? '#8b5cf6' : isDark ? '#38bdf8' : '#0288d1',
                borderRadius: '14px',
              }}
            >
              {esGrupoFamiliar ? <FamilyIcon /> : <EventIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                {esGrupoFamiliar
                  ? yaProgramada
                    ? 'Reprogramar Entrevista Familiar'
                    : 'Agendar Entrevista Familiar Única'
                  : yaProgramada
                  ? 'Reprogramar Entrevista'
                  : 'Agendar Entrevista Institucional'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {esGrupoFamiliar
                  ? `👨‍👩‍👧‍👦 Cita conjunta para ${selectedHermanoIds.length} hermanos postulantes`
                  : 'Postulante Hermano · Admisión con Prioridad'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={isProcesando}
            sx={{
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 👨‍👩‍👧‍👦 Tarjeta Especial de Detección de Múltiples Hermanos de la misma familia */}
        {esGrupoFamiliar ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(139, 92, 246, 0.08)' : '#f5f3ff',
              border: `1.5px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : '#ddd6fe'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FamilyIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: isDark ? '#c4b5fd' : '#6d28d9' }}>
                Familia con {hermanosFamilia.length} Hermanos Postulantes
              </Typography>
              <Chip
                size="small"
                label="Entrevista Única"
                sx={{
                  ml: 'auto',
                  bgcolor: '#8b5cf6',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Para no hacer venir al padre de familia varias veces, la cita se agendará conjuntamente en la misma fecha y hora. Se enviará una única notificación por WhatsApp convocando a ambos.
            </Typography>

            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 0.8 }}>
              Hermanos postulantes incluidos en esta cita:
            </Typography>

            <Stack spacing={1}>
              {hermanosFamilia.map((h) => {
                const checked = selectedHermanoIds.includes(h.id);
                return (
                  <Box
                    key={h.id}
                    onClick={() => handleToggleHermano(h.id)}
                    sx={{
                      p: 1.2,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                      border: `1px solid ${
                        checked ? '#8b5cf6' : isDark ? '#334155' : '#e2e8f0'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                      },
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={() => handleToggleHermano(h.id)}
                      sx={{ p: 0.2, color: '#8b5cf6', '&.Mui-checked': { color: '#8b5cf6' } }}
                    />
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha('#8b5cf6', 0.18),
                        color: '#8b5cf6',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      }}
                    >
                      {getInitials(h.nombres, h.apellido_paterno)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={800} noWrap sx={{ color: 'text.primary', fontSize: '0.82rem' }}>
                        {h.nombres} {h.apellido_paterno} {h.apellido_materno || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>
                        {h.grado_solicitado_nombre || h.grado_nombre} ({h.turno_solicitado_nombre || h.turno_nombre || 'Mañana'}) · Cód: <strong>{h.codigo_reserva}</strong>
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={
                        h.estado_entrevista === 'programada'
                          ? 'Cita asignada'
                          : h.estado_entrevista === 'aprobada'
                          ? 'Aprobada'
                          : 'Pendiente'
                      }
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor:
                          h.estado_entrevista === 'programada'
                            ? alpha('#3b82f6', 0.15)
                            : h.estado_entrevista === 'aprobada'
                            ? alpha('#10b981', 0.15)
                            : alpha('#f59e0b', 0.15),
                        color:
                          h.estado_entrevista === 'programada'
                            ? '#3b82f6'
                            : h.estado_entrevista === 'aprobada'
                            ? '#10b981'
                            : '#f59e0b',
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>

            <Divider sx={{ my: 1.5, borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ddd6fe' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Hermano regular vinculado: <strong>{hermano.regular_nombre_completo || 'Estudiante Regular'}</strong> (Cód: {hermano.regular_codigo})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tutor: <strong>{hermano.tutor_nombre}</strong> · 📱 <strong>{hermano.tutor_telefono}</strong>
              </Typography>
            </Box>
          </Paper>
        ) : (
          /* Ficha Individual Estándar */
          <Box
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '14px',
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha('#10b981', 0.18),
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {getInitials(hermano.nombres, hermano.apellido_paterno)}
              </Avatar>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
                    {hermano.nombres} {hermano.apellido_paterno} {hermano.apellido_materno || ''}
                  </Typography>
                  <Chip
                    size="small"
                    label={hermano.codigo_reserva}
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      bgcolor: isDark ? alpha('#38bdf8', 0.2) : alpha('#0288d1', 0.12),
                      color: isDark ? '#38bdf8' : '#0288d1',
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Solicita: <strong>{hermano.grado_solicitado_nombre || hermano.grado_nombre}</strong> · Turno: <strong>{hermano.turno_solicitado_nombre || hermano.turno_nombre || 'Mañana'}</strong>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Hermano de: <strong>{hermano.regular_nombre_completo || 'Estudiante Regular'}</strong> (Cód: {hermano.regular_codigo})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tutor: <strong>{hermano.tutor_nombre}</strong> · 📱 <strong>{hermano.tutor_telefono}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Estado actual de la cita */}
        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Estado Actual:
          </Typography>
          <Chip
            size="small"
            label={
              esAprobada
                ? '✅ Entrevista Realizada / Aprobada'
                : esNoAsistio
                ? '❌ Postulante No Asistió'
                : yaProgramada
                ? `📅 Cita: ${hermano.fecha_entrevista_formateada || 'Programada'}`
                : '⏳ Pendiente de Programación'
            }
            sx={{
              fontWeight: 800,
              fontSize: '0.74rem',
              bgcolor: esAprobada
                ? alpha('#10b981', 0.15)
                : esNoAsistio
                ? alpha('#ef4444', 0.15)
                : yaProgramada
                ? alpha('#3b82f6', 0.15)
                : alpha('#f59e0b', 0.15),
              color: esAprobada
                ? '#10b981'
                : esNoAsistio
                ? '#ef4444'
                : yaProgramada
                ? '#3b82f6'
                : '#f59e0b',
            }}
          />
          {hermano.notificado_whatsapp && (
            <Chip
              size="small"
              icon={<WhatsAppIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
              label={`Notificado WA (${hermano.fecha_notificacion_formateada || 'Sí'})`}
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: alpha('#16a34a', 0.12),
                color: '#16a34a',
              }}
            />
          )}
        </Box>

        {/* Formulario de Agendamiento */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Fecha y Hora */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
                Fecha y Hora de la Entrevista {esGrupoFamiliar ? '(Válida para toda la familia)' : ''} *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Box>

            {/* Modalidad */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
                Modalidad
              </Typography>
              <ToggleButtonGroup
                value={modalidad}
                exclusive
                onChange={(_, val) => val && setModalidad(val)}
                fullWidth
                size="small"
                sx={{
                  borderRadius: '12px',
                  '& .MuiToggleButton-root': {
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 0.8,
                  },
                }}
              >
                <ToggleButton value="presencial">
                  <LocationIcon fontSize="small" sx={{ mr: 0.8 }} /> Presencial en Colegio
                </ToggleButton>
                <ToggleButton value="virtual">
                  <VideoIcon fontSize="small" sx={{ mr: 0.8 }} /> Virtual (Google Meet / Zoom)
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Lugar o Enlace */}
            {modalidad === 'presencial' ? (
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
                  Lugar en el Colegio
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Ej: Dirección del Colegio - Oficina Principal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Box>
            ) : (
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
                  Enlace de Reunión Virtual
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Box>
            )}

            {/* Observaciones / Instrucciones */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
                Instrucciones / Observaciones (opcional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder={
                  esGrupoFamiliar
                    ? 'Ej: Asistir con libreta anterior de ambos niños. Traer fotocopias de CI.'
                    : 'Ej: Presentar libreta del curso anterior. Asistir con 10 minutos de anticipación.'
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Box>

            {/* Switch WhatsApp */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#f0fdf4',
                border: `1px solid ${isDark ? 'rgba(22, 163, 74, 0.3)' : '#bbf7d0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WhatsAppIcon sx={{ color: '#16a34a', fontSize: 24 }} />
                <Box>
                  <Typography variant="body2" fontWeight={800} sx={{ color: isDark ? '#4ade80' : '#15803d' }}>
                    {esGrupoFamiliar
                      ? `Enviar 1 sola citación familiar por WhatsApp al tutor`
                      : 'Notificar citación al tutor por WhatsApp'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {esGrupoFamiliar
                      ? `El mensaje consolidará a los ${selectedHermanoIds.length} postulantes citados`
                      : 'Envío automático vía Evolution API con formato institucional'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={notificarWhatsapp}
                onChange={(e) => setNotificarWhatsapp(e.target.checked)}
                color="success"
              />
            </Box>

            {/* Acciones directas si la cita ya existe */}
            {yaProgramada && onCambiarEstadoEntrevista && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 1 }}>
                  {esGrupoFamiliar
                    ? `Acciones de Entrevista (Aplica a los ${selectedHermanoIds.length} hermanos):`
                    : 'Acciones sobre la Entrevista Actual:'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => onCambiarEstadoEntrevista('aprobada', selectedHermanoIds)}
                    disabled={isProcesando}
                    sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, flex: 1 }}
                  >
                    Marcar Aprobada(s)
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => onCambiarEstadoEntrevista('no_asistio', selectedHermanoIds)}
                    disabled={isProcesando}
                    sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, flex: 1 }}
                  >
                    Marcar No Asistió
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Botón WhatsApp de respaldo manual */}
            <Box sx={{ textAlign: 'center', pt: 0.5 }}>
              <Button
                size="small"
                variant="text"
                startIcon={<OpenInNewIcon sx={{ fontSize: '15px !important' }} />}
                href={generarEnlaceWhatsAppWeb()}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.74rem',
                  color: 'text.secondary',
                  fontWeight: 600,
                  '&:hover': { color: '#16a34a' },
                }}
              >
                Abrir WhatsApp Web directamente como respaldo
              </Button>
            </Box>

            {/* Botones principales */}
            <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isProcesando}
                sx={{
                  flex: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isProcesando || !fechaHora || selectedHermanoIds.length === 0}
                startIcon={isProcesando ? <CircularProgress size={18} color="inherit" /> : <EditCalendarIcon />}
                sx={{
                  flex: 1.8,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 800,
                  background: esGrupoFamiliar
                    ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  boxShadow: esGrupoFamiliar
                    ? '0 4px 15px rgba(124, 58, 237, 0.35)'
                    : '0 4px 15px rgba(2, 136, 209, 0.3)',
                }}
              >
                {isProcesando
                  ? 'Guardando...'
                  : yaProgramada
                  ? esGrupoFamiliar
                    ? 'Actualizar Cita Familiar'
                    : 'Actualizar Citación'
                  : esGrupoFamiliar
                  ? `Agendar Cita Familiar (${selectedHermanoIds.length})`
                  : 'Agendar y Notificar'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
