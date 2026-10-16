// src/components/preinscripciones/ModalPostulantesCurso.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  Chip,
  Tooltip,
  Button,
  Card,
  CardContent,
  Fade,
  useTheme,
  alpha,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  EventSeat as EventSeatIcon,
  FamilyRestroom as FamilyRestroomIcon,
  DeleteForeverRounded as DeleteIcon,
  Star as StarIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { Preinscripcion } from '@/types/preinscripcionTypes';
import { Cupo } from '@/hooks/useCupos';
import { getInitials } from '@/components/reservaCupo/admin/common';
import { ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { reservaCupoService } from '@/services/reservaCupoService';
import { ModalEliminarHermanoAdmin } from '@/components/reservaCupo/admin/ModalEliminarHermanoAdmin';

interface ModalPostulantesCursoProps {
  open: boolean;
  onClose: () => void;
  cupo: Cupo | null;
  postulantes: Preinscripcion[];
  aforoTotal: number;
  regularesInscritos: number;
  regularesConfirmados: number;
  hermanosConfirmados: number;
  cuposSobrantes: number;
  onRevisar: (id: number) => void;
  onCupoUpdated?: () => void;
}

export const ModalPostulantesCurso: React.FC<ModalPostulantesCursoProps> = ({
  open,
  onClose,
  cupo,
  postulantes,
  aforoTotal,
  regularesInscritos,
  regularesConfirmados,
  hermanosConfirmados,
  cuposSobrantes,
  onRevisar,
  onCupoUpdated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Vista de Hermanos con Prioridad
  const [vistaHermanos, setVistaHermanos] = useState(false);
  const [hermanosCurso, setHermanosCurso] = useState<ReservaCupoHermanoData[]>([]);
  const [loadingHermanos, setLoadingHermanos] = useState(false);
  const [hermanoAEliminar, setHermanoAEliminar] = useState<ReservaCupoHermanoData | null>(null);
  const [modalEliminarHermanoOpen, setModalEliminarHermanoOpen] = useState(false);
  const [motivoEliminarHermano, setMotivoEliminarHermano] = useState('Registro duplicado por el tutor');
  const [isEliminandoHermano, setIsEliminandoHermano] = useState(false);

  const cargarHermanosCurso = async () => {
    if (!cupo?.grado_id) return;
    setLoadingHermanos(true);
    try {
      const resp = await reservaCupoService.listarHermanosAdmin({
        grado_solicitado_id: cupo.grado_id,
        turno_solicitado_id: cupo.turno_id,
        limit: 100,
      });
      setHermanosCurso(resp?.hermanos || []);
    } catch (err) {
      console.error('Error al cargar hermanos del curso:', err);
    } finally {
      setLoadingHermanos(false);
    }
  };

  useEffect(() => {
    if (open && cupo?.grado_id) {
      cargarHermanosCurso();
    } else {
      setVistaHermanos(false);
    }
  }, [open, cupo?.grado_id, cupo?.turno_id]);

  const handleAbrirEliminarHermano = (h: ReservaCupoHermanoData) => {
    setHermanoAEliminar(h);
    setMotivoEliminarHermano('Registro duplicado por el tutor');
    setModalEliminarHermanoOpen(true);
  };

  const handleConfirmarEliminarHermano = async () => {
    if (!hermanoAEliminar) return;
    setIsEliminandoHermano(true);
    try {
      const resp = await reservaCupoService.eliminarHermanoAdmin(
        hermanoAEliminar.id,
        motivoEliminarHermano.trim() || undefined
      );
      toast.success(resp.message || 'Cupo de hermano eliminado exitosamente');
      setModalEliminarHermanoOpen(false);
      setHermanoAEliminar(null);
      setMotivoEliminarHermano('Registro duplicado por el tutor');
      await cargarHermanosCurso();
      onCupoUpdated?.();
    } catch (err: any) {
      console.error('Error al eliminar cupo de hermano:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Error al eliminar el cupo de hermano');
    } finally {
      setIsEliminandoHermano(false);
    }
  };

  // ── Tokens idénticos al sistema de Reserva de Cupo ─────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Estilo uniforme para inputs
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': {
        borderColor: borderField,
        borderRadius: R,
      },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '1.5px',
        borderRadius: R,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`,
        borderRadius: R,
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  // Métricas del curso
  const postulantesConCupo = useMemo(
    () =>
      postulantes.filter(
        (p) => p.tiene_cupo_asignado || (p as any).tiene_cupo || p.estado === 'aprobada'
      ).length,
    [postulantes]
  );
  const postulantesEnEspera = useMemo(
    () =>
      postulantes.filter(
        (p) => p.estado === 'en_espera' || p.es_lista_espera
      ).length,
    [postulantes]
  );
  const postulantesPendientes = useMemo(
    () =>
      postulantes.filter(
        (p) =>
          p.estado === 'iniciada' ||
          (p.estado as string) === 'pendiente' ||
          p.estado === 'en_revision'
      ).length,
    [postulantes]
  );
  const vacantesLibresFinales = Math.max(0, cuposSobrantes - postulantesConCupo);

  // Filtrado de postulantes
  const postulantesFiltrados = useMemo(() => {
    return postulantes.filter((p) => {
      const tieneCupo = p.tiene_cupo_asignado || (p as any).tiene_cupo;
      const esEspera = p.estado === 'en_espera' || p.es_lista_espera;

      // Filtro por estado
      if (filtroEstado === 'con_cupo' && !tieneCupo && p.estado !== 'aprobada') return false;
      if (filtroEstado === 'en_espera' && !esEspera) return false;
      if (filtroEstado === 'pendientes' && (p.estado === 'aprobada' || p.estado === 'rechazada')) return false;

      // Filtro por búsqueda
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const nombreCompleto = (
        p.estudiante_nombre ||
        `${(p as any).estudiante_nombres || ''} ${(p as any).estudiante_apellido_paterno || ''} ${(p as any).estudiante_apellido_materno || ''}`
      ).toLowerCase();
      const ci = (p.estudiante_ci || '').toLowerCase();
      const tutor = (
        p.tutor_nombre ||
        `${(p as any).tutor_nombres || ''} ${(p as any).tutor_apellidos || ''}`
      ).toLowerCase();
      const codigo = (p.codigo_inscripcion || (p as any).codigo || '').toLowerCase();

      return (
        nombreCompleto.includes(q) ||
        ci.includes(q) ||
        tutor.includes(q) ||
        codigo.includes(q)
      );
    });
  }, [postulantes, filtroEstado, searchTerm]);

  if (!cupo) return null;

  const handleWhatsApp = (telefono?: string, estudianteNombre?: string) => {
    if (!telefono) return;
    const cleanPhone = telefono.replace(/\D/g, '');
    const telefonoFinal = cleanPhone.startsWith('591') ? cleanPhone : `591${cleanPhone}`;
    const mensaje = encodeURIComponent(
      `Estimado tutor de ${estudianteNombre || 'el postulante'}: Le escribimos del Colegio La Villa Cordillera respecto a su preinscripción para ${cupo.grado_nombre} (${cupo.turno_nombre || 'General'}).`
    );
    window.open(`https://wa.me/${telefonoFinal}?text=${mensaje}`, '_blank');
  };

  const getEstadoMeta = (p: Preinscripcion) => {
    const tieneCupo = Boolean(p.tiene_cupo_asignado || (p as any).tiene_cupo);
    const esAprobada = p.estado === 'aprobada';
    const esEspera = p.estado === 'en_espera' || p.es_lista_espera;
    const esRechazada = p.estado === 'rechazada';

    if (tieneCupo || esAprobada) {
      return {
        color: '#10b981',
        label: 'Con Cupo Asignado',
        shortLabel: 'Con Cupo',
        icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
      };
    }
    if (esEspera) {
      const pos = p.posicion_espera || (p as any).posicion_lista_espera;
      return {
        color: '#f59e0b',
        label: pos ? `En Espera #${pos}` : 'En Lista de Espera',
        shortLabel: pos ? `Espera #${pos}` : 'En Espera',
        icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
      };
    }
    if (esRechazada) {
      return {
        color: '#ef4444',
        label: 'Rechazada',
        shortLabel: 'Rechazada',
        icon: <CancelIcon sx={{ fontSize: 13 }} />,
      };
    }
    return {
      color: brand,
      label: 'Pendiente de Asignación',
      shortLabel: 'Pendiente',
      icon: <PersonIcon sx={{ fontSize: 13 }} />,
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── HEADER (Idéntico a ModalNominaAsegurados) ── */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3 },
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: brandDim,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.75),
                mb: 0.4,
              }}
            >
              Nómina de Postulantes Preinscritos · {cupo.nivel_academico_nombre || 'Nivel Académico'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: brand, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    lineHeight: 1.1,
                    color: 'text.primary',
                  }}
                >
                  {cupo.grado_nombre} ({cupo.turno_nombre || 'General'})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', mt: 0.2 }}>
                  {cupo.periodo_nombre || 'Gestión 2027'} · {postulantes.length} postulantes registrados
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Botón de Cierre estilizado */}
          <Box
            onClick={onClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              transition: 'all 0.15s',
              '&:hover': {
                background: alpha(brand, 0.12),
                borderColor: alpha(brand, 0.4),
                color: brand,
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Chips de Resumen de Balance del Grado (Aforo, Regulares, Hermanos, Sobran, Libres) */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 1 }}>
          <Chip
            size="small"
            label={`Aforo Total: ${aforoTotal}`}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: alpha('#3b82f6', 0.12),
              color: '#3b82f6',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '8px',
            }}
          />
          <Chip
            size="small"
            label={`Regulares Conf.: ${regularesConfirmados}`}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: alpha('#0288d1', 0.12),
              color: '#0288d1',
              border: '1px solid rgba(2,136,209,0.25)',
              borderRadius: '8px',
            }}
          />
          <Tooltip title="Clic para ver o eliminar registros duplicados de hermanos">
            <Chip
              size="small"
              clickable
              onClick={() => setVistaHermanos(!vistaHermanos)}
              label={`Prioridad Hermanos: ${hermanosCurso.length || hermanosConfirmados}`}
              icon={<StarIcon sx={{ fontSize: '13px !important', color: vistaHermanos ? '#fff !important' : '#e11d48 !important' }} />}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: vistaHermanos ? '#e11d48' : alpha('#e11d48', 0.12),
                color: vistaHermanos ? '#ffffff' : '#e11d48',
                border: `1px solid ${vistaHermanos ? '#e11d48' : 'rgba(225,29,72,0.3)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: vistaHermanos ? '#be123c' : alpha('#e11d48', 0.25),
                  transform: 'scale(1.04)',
                },
              }}
            />
          </Tooltip>
          <Chip
            size="small"
            label={`Sobran para Nuevos: ${cuposSobrantes}`}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: alpha('#10b981', 0.12),
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '8px',
            }}
          />
          <Chip
            size="small"
            label={`Vacantes Libres: ${vacantesLibresFinales}`}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: vacantesLibresFinales > 0 ? alpha('#10b981', 0.16) : alpha('#ef4444', 0.14),
              color: vacantesLibresFinales > 0 ? '#10b981' : '#ef4444',
              border: `1px solid ${vacantesLibresFinales > 0 ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '8px',
            }}
          />
        </Box>
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
        {/* SELECTOR DE VISTA: POSTULANTES NUEVOS vs HERMANOS CON PRIORIDAD */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={vistaHermanos ? 'hermanos' : 'postulantes'}
            onChange={(_, val) => {
              if (val !== null) setVistaHermanos(val === 'hermanos');
            }}
            sx={{
              background: bgField,
              p: 0.35,
              borderRadius: '12px',
              border: `1px solid ${borderField}`,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '9px',
                px: 2,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: isDark ? alpha(brand, 0.25) : alpha(brand, 0.15),
                  color: brand,
                  fontWeight: 800,
                },
              },
            }}
          >
            <ToggleButton value="postulantes">
              Postulantes Nuevos ({postulantes.length})
            </ToggleButton>
            <ToggleButton value="hermanos">
              Prioridad Hermanos ({hermanosCurso.length || hermanosConfirmados})
            </ToggleButton>
          </ToggleButtonGroup>

          {vistaHermanos && (
            <Chip
              size="small"
              icon={<StarIcon sx={{ fontSize: '13px !important' }} />}
              label="Gestión de Hermanos: Eliminar un registro duplicado libera la vacante de inmediato"
              sx={{
                bgcolor: alpha('#e11d48', 0.12),
                color: '#e11d48',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: '8px',
              }}
            />
          )}
        </Box>

        {vistaHermanos ? (
          /* ── VISTA DE HERMANOS CON PRIORIDAD Y BOTÓN DE ELIMINAR ── */
          <Box>
            {loadingHermanos ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={36} sx={{ color: brand, mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Cargando hermanos registrados para este curso...
                </Typography>
              </Box>
            ) : hermanosCurso.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  textAlign: 'center',
                  borderRadius: '16px',
                  bgcolor: bgField,
                  border: `1px solid ${borderField}`,
                }}
              >
                <FamilyRestroomIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body1" fontWeight={700} color="text.secondary">
                  No hay hermanos registrados con prioridad en este curso
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Los registros de hermanos nuevos vinculados a estudiantes regulares aparecerán listados aquí.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {hermanosCurso.map((h) => {
                  const esEspera = h.estado === 'en_espera';
                  const nombreCompleto = `${h.nombres} ${h.apellido_paterno} ${h.apellido_materno || ''}`.trim();
                  return (
                    <Grid key={h.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Fade in timeout={250}>
                        <Card
                          sx={{
                            height: '100%',
                            borderRadius: '16px',
                            border: `1.5px solid ${alpha(esEspera ? '#f59e0b' : '#10b981', 0.4)}`,
                            background: isDark ? 'rgba(255, 255, 255, 0.035)' : '#ffffff',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: `0 8px 20px ${alpha(esEspera ? '#f59e0b' : '#10b981', 0.22)}`,
                              borderColor: esEspera ? '#f59e0b' : '#10b981',
                            },
                          }}
                        >
                          <Box>
                            {/* Badges superiores */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                icon={esEspera ? <WarningAmberIcon sx={{ fontSize: '12px !important' }} /> : <CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                                label={esEspera ? `Espera #${h.posicion_espera || 1}` : 'Cupo Confirmado'}
                                sx={{
                                  height: 20,
                                  fontSize: '0.64rem',
                                  fontWeight: 800,
                                  bgcolor: esEspera ? alpha('#f59e0b', 0.15) : alpha('#10b981', 0.15),
                                  color: esEspera ? '#d97706' : '#10b981',
                                  border: `1px solid ${alpha(esEspera ? '#f59e0b' : '#10b981', 0.3)}`,
                                }}
                              />
                              <Chip
                                size="small"
                                icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                                label="Prioridad Familiar"
                                sx={{
                                  height: 20,
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  bgcolor: isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.15),
                                  color: isDark ? '#facc15' : '#0288d1',
                                }}
                              />
                            </Box>

                            {/* Datos del hermano */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: alpha(esEspera ? '#f59e0b' : '#10b981', 0.15),
                                  color: esEspera ? '#d97706' : '#10b981',
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  border: `1.5px solid ${alpha(esEspera ? '#f59e0b' : '#10b981', 0.4)}`,
                                }}
                              >
                                {getInitials(h.nombres, h.apellido_paterno)}
                              </Avatar>
                              <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
                                  {nombreCompleto}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  CI: <strong>{h.ci || 'Sin CI'}</strong> · Cód: <strong>{h.codigo_reserva}</strong>
                                </Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 1, borderColor: borderField }} />

                            {/* Hermano regular y Tutor */}
                            <Stack spacing={0.6} sx={{ mb: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Hermano de: <strong>{h.regular_nombre_completo || 'Estudiante Regular'}</strong> (Cód: {h.regular_codigo})
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Tutor: {h.tutor_nombre} ({h.tutor_parentesco}) · 📱 {h.tutor_telefono}
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Botones de acción: WhatsApp y ELIMINAR CUPO */}
                          <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: `1px solid ${borderField}` }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<WhatsAppIcon sx={{ fontSize: '15px !important' }} />}
                              onClick={() => handleWhatsApp(h.tutor_telefono, nombreCompleto)}
                              sx={{
                                flex: 1,
                                borderRadius: '9px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                py: 0.5,
                              }}
                            >
                              WhatsApp
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon sx={{ fontSize: '15px !important' }} />}
                              onClick={() => handleAbrirEliminarHermano(h)}
                              sx={{
                                flex: 1.3,
                                borderRadius: '9px',
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                py: 0.5,
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                              }}
                            >
                              Eliminar Cupo
                            </Button>
                          </Box>
                        </Card>
                      </Fade>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        ) : (
          /* ── VISTA NORMAL DE POSTULANTES NUEVOS ── */
          <>
            {/* BARRA DE FILTROS Y CONTROLES (bgField + borderField) */}
            <Box
              sx={{
                p: 1.8,
                mb: 2.5,
                borderRadius: R,
                background: bgField,
                border: `1px solid ${borderField}`,
              }}
            >
              <Grid container spacing={1.5} alignItems="center">
                {/* Buscador */}
                <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por postulante, CI, tutor o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: brand }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <Box
                        onClick={() => setSearchTerm('')}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          '&:hover': { color: brand },
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </Box>
                    </InputAdornment>
                  ) : null,
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Toggle de Estados (Pills idéntico a ModalNominaAsegurados) */}
            <Grid size={{ xs: 12, sm: 8, md: 5.5 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={filtroEstado}
                onChange={(_, val) => val && setFiltroEstado(val)}
                sx={{
                  width: '100%',
                  bgcolor: bgField,
                  borderRadius: R,
                  p: 0.3,
                  border: `1px solid ${borderField}`,
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    border: 'none',
                    py: 0.5,
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <ToggleButton value="todos">Todos ({postulantes.length})</ToggleButton>
                <ToggleButton
                  value="con_cupo"
                  sx={{ '&.Mui-selected': { bgcolor: alpha('#10b981', 0.18), color: '#10b981 !important' } }}
                >
                  Con Cupo ({postulantesConCupo})
                </ToggleButton>
                <ToggleButton
                  value="en_espera"
                  sx={{ '&.Mui-selected': { bgcolor: alpha('#f59e0b', 0.18), color: '#f59e0b !important' } }}
                >
                  En Espera ({postulantesEnEspera})
                </ToggleButton>
                <ToggleButton
                  value="pendientes"
                  sx={{ '&.Mui-selected': { bgcolor: alpha(brand, 0.18), color: `${brand} !important` } }}
                >
                  Pendientes ({postulantesPendientes})
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Alternador de Vista (Tarjetas vs Tabla) */}
            <Grid size={{ xs: 12, sm: 4, md: 1.5 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={viewMode}
                onChange={(_, val) => val && setViewMode(val)}
                sx={{
                  bgcolor: bgField,
                  borderRadius: R,
                  p: 0.3,
                  border: `1px solid ${borderField}`,
                  '& .MuiToggleButton-root': {
                    p: 0.6,
                    borderRadius: '10px',
                    border: 'none',
                    '&.Mui-selected': {
                      bgcolor: alpha(brand, 0.2),
                      color: brand,
                    },
                  },
                }}
              >
                <Tooltip title="Vista en Tarjetas">
                  <ToggleButton value="cards">
                    <GridViewIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Vista en Tabla">
                  <ToggleButton value="table">
                    <TableRowsIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>

        {/* ── CONTENIDO: CARDS O TABLA ── */}
        {postulantesFiltrados.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: bgField,
              border: `1px solid ${borderField}`,
            }}
          >
            <PersonIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="body1" fontWeight={700} color="text.secondary">
              {postulantes.length === 0
                ? 'No hay postulantes preinscritos para este curso'
                : 'No se encontraron postulantes para los filtros seleccionados'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {postulantes.length === 0
                ? `Actualmente sobran ${cuposSobrantes} cupos tras descontar regulares y prioridad hermanos.`
                : 'Prueba cambiando el término de búsqueda o el filtro de estado.'}
            </Typography>
          </Paper>
        ) : viewMode === 'cards' ? (
          /* ─── VISTA CARDS (Estilo idéntico a ModalNominaAsegurados) ─── */
          <Grid container spacing={2}>
            {postulantesFiltrados.map((p) => {
              const meta = getEstadoMeta(p);
              const nombrePostulante =
                p.estudiante_nombre ||
                `${(p as any).estudiante_nombres || ''} ${(p as any).estudiante_apellido_paterno || ''} ${(p as any).estudiante_apellido_materno || ''}`.trim() ||
                'Postulante';
              const initial = nombrePostulante.charAt(0).toUpperCase();
              const tutorNombre =
                p.tutor_nombre ||
                `${(p as any).tutor_nombres || ''} ${(p as any).tutor_apellidos || ''}`.trim() ||
                'No registrado';
              const codigo = p.codigo_inscripcion || (p as any).codigo || `#${p.id}`;

              return (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Fade in timeout={250}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '16px',
                        border: `1.5px solid ${alpha(meta.color, 0.35)}`,
                        background: isDark ? 'rgba(255, 255, 255, 0.035)' : '#ffffff',
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${alpha(meta.color, 0.22)}`,
                          borderColor: meta.color,
                        },
                      }}
                    >
                      {/* Badge Turno Preferido arriba a la izquierda */}
                      <Chip
                        label={
                          p.turno_preferido_id === 1 || (p as any).turno_nombre?.toLowerCase().includes('mañana')
                            ? '☀️ Turno Mañana'
                            : '🌅 Turno Tarde'
                        }
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 1,
                          fontWeight: 700,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor:
                            p.turno_preferido_id === 1 ? alpha('#3b82f6', 0.12) : alpha('#f59e0b', 0.12),
                          color: p.turno_preferido_id === 1 ? '#3b82f6' : '#f59e0b',
                          border: `1px solid ${alpha(
                            p.turno_preferido_id === 1 ? '#3b82f6' : '#f59e0b',
                            0.25
                          )}`,
                        }}
                      />

                      {/* Badge Estado arriba a la derecha */}
                      <Chip
                        icon={meta.icon}
                        label={meta.shortLabel}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          fontWeight: 800,
                          fontSize: '0.62rem',
                          height: 20,
                          backgroundColor: alpha(meta.color, 0.15),
                          color: meta.color,
                          border: `1px solid ${alpha(meta.color, 0.35)}`,
                          '& .MuiChip-icon': { ml: 0.4, color: `${meta.color} !important` },
                        }}
                      />

                      <CardContent sx={{ p: 1.8, pt: 4, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Avatar 52x52 con tonalidad semántica */}
                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            sx={{
                              width: 52,
                              height: 52,
                              margin: '0 auto',
                              bgcolor: alpha(meta.color, 0.16),
                              color: meta.color,
                              border: `2px solid ${alpha(meta.color, 0.3)}`,
                              boxShadow: `0 4px 12px ${alpha(meta.color, 0.18)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.05rem',
                            }}
                          >
                            {initial}
                          </Avatar>
                        </Box>

                        {/* Nombre del Postulante */}
                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          sx={{
                            fontSize: '0.88rem',
                            lineHeight: 1.25,
                            mb: 0.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {nombrePostulante}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.8 }}>
                          CI: <strong>{p.estudiante_ci || 'S/N'}</strong> · Cód: {codigo}
                        </Typography>

                        {/* Procedencia y Tutor */}
                        <Box
                          sx={{
                            p: 0.7,
                            borderRadius: '9px',
                            background: bgField,
                            border: `1px solid ${borderField}`,
                            mb: 1,
                            textAlign: 'left',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.66rem', color: 'text.secondary', display: 'block' }}>
                            Tutor: <strong>{tutorNombre}</strong>
                          </Typography>
                          {p.tutor_telefono && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.66rem',
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.3,
                                mt: 0.2,
                              }}
                            >
                              <PhoneIcon sx={{ fontSize: 11 }} /> {p.tutor_telefono}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ fontSize: '0.64rem', color: 'text.secondary', display: 'block', mt: 0.2 }}>
                            Registro: {p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : 'Reciente'}
                          </Typography>
                        </Box>

                        {/* Acciones al pie de la card */}
                        <Box sx={{ mt: 'auto', pt: 0.8, borderTop: `1px solid ${borderField}`, display: 'flex', gap: 1 }}>
                          {p.tutor_telefono && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<WhatsAppIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleWhatsApp(p.tutor_telefono, nombrePostulante)}
                              sx={{
                                flex: 1,
                                borderRadius: '9px',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                textTransform: 'none',
                                py: 0.4,
                                borderColor: alpha('#25D366', 0.5),
                                color: '#25D366',
                                '&:hover': {
                                  bgcolor: alpha('#25D366', 0.1),
                                  borderColor: '#25D366',
                                },
                              }}
                            >
                              WhatsApp
                            </Button>
                          )}

                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                            onClick={() => {
                              onClose();
                              onRevisar(p.id);
                            }}
                            sx={{
                              flex: 1,
                              borderRadius: '9px',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              textTransform: 'none',
                              py: 0.4,
                              background: isDark
                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                              color: isDark ? '#000' : '#fff',
                              boxShadow: 'none',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 12px ${alpha(brand, 0.3)}`,
                              },
                            }}
                          >
                            Revisar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          /* ─── VISTA TABLA ELEGANTE (Idéntica a ModalNominaAsegurados) ─── */
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: 460,
              borderRadius: R,
              border: `1px solid ${borderField}`,
              background: bgField,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      bgcolor: isDark ? '#101624' : '#f1f5f9',
                      textTransform: 'uppercase',
                    },
                  }}
                >
                  <TableCell width={45}>#</TableCell>
                  <TableCell>Postulante</TableCell>
                  <TableCell>Turno</TableCell>
                  <TableCell>Estado de Cupo</TableCell>
                  <TableCell>Tutor / Contacto</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {postulantesFiltrados.map((p, idx) => {
                  const meta = getEstadoMeta(p);
                  const nombrePostulante =
                    p.estudiante_nombre ||
                    `${(p as any).estudiante_nombres || ''} ${(p as any).estudiante_apellido_paterno || ''} ${(p as any).estudiante_apellido_materno || ''}`.trim() ||
                    'Postulante';
                  const initial = nombrePostulante.charAt(0).toUpperCase();
                  const tutorNombre =
                    p.tutor_nombre ||
                    `${(p as any).tutor_nombres || ''} ${(p as any).tutor_apellidos || ''}`.trim() ||
                    'No registrado';
                  const codigo = p.codigo_inscripcion || (p as any).codigo || `#${p.id}`;

                  return (
                    <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              bgcolor: alpha(meta.color, 0.2),
                              color: meta.color,
                            }}
                          >
                            {initial}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: '0.82rem' }}>
                              {nombrePostulante}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              CI: <strong>{p.estudiante_ci || 'S/N'}</strong> · Cód: {codigo}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={p.turno_preferido_id === 1 ? '☀️ Mañana' : '🌅 Tarde'}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 20,
                            bgcolor: p.turno_preferido_id === 1 ? alpha('#3b82f6', 0.12) : alpha('#f59e0b', 0.12),
                            color: p.turno_preferido_id === 1 ? '#3b82f6' : '#f59e0b',
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          icon={meta.icon}
                          label={meta.label}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                            bgcolor: alpha(meta.color, 0.14),
                            color: meta.color,
                            '& .MuiChip-icon': { color: `${meta.color} !important` },
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {tutorNombre}
                        </Typography>
                        {p.tutor_telefono ? (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.4,
                              fontSize: '0.68rem',
                            }}
                          >
                            <PhoneIcon sx={{ fontSize: 11 }} /> {p.tutor_telefono}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                            Sin teléfono
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
                          {p.tutor_telefono && (
                            <Tooltip title="Contactar por WhatsApp">
                              <IconButton
                                size="small"
                                onClick={() => handleWhatsApp(p.tutor_telefono, nombrePostulante)}
                                sx={{
                                  borderRadius: '8px',
                                  color: '#25D366',
                                  bgcolor: alpha('#25D366', 0.08),
                                  border: `1px solid ${alpha('#25D366', 0.3)}`,
                                  '&:hover': {
                                    bgcolor: alpha('#25D366', 0.18),
                                  },
                                }}
                              >
                                <WhatsAppIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                            onClick={() => {
                              onClose();
                              onRevisar(p.id);
                            }}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              py: 0.3,
                              px: 1.2,
                              borderColor: alpha(brand, 0.4),
                              color: brand,
                              '&:hover': {
                                borderColor: brand,
                                bgcolor: alpha(brand, 0.1),
                              },
                            }}
                          >
                            Revisar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          borderTop: `1px solid ${borderField}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', fontWeight: 600 }}>
          {vistaHermanos
            ? `Mostrando ${hermanosCurso.length} hermanos con prioridad registrados para este curso`
            : `Mostrando ${postulantesFiltrados.length} de ${postulantes.length} postulantes preinscritos`}
        </Typography>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            px: 2.5,
            border: `1px solid ${borderField}`,
            color: 'text.secondary',
            '&:hover': {
              borderColor: brand,
              color: brand,
              bgcolor: alpha(brand, 0.08),
            },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>

      {/* MODAL PARA ELIMINAR CUPO DE HERMANO */}
      <ModalEliminarHermanoAdmin
        open={modalEliminarHermanoOpen}
        hermano={hermanoAEliminar}
        motivo={motivoEliminarHermano}
        isProcesando={isEliminandoHermano}
        onClose={() => {
          if (!isEliminandoHermano) {
            setModalEliminarHermanoOpen(false);
            setHermanoAEliminar(null);
          }
        }}
        onMotivoChange={setMotivoEliminarHermano}
        onConfirmar={handleConfirmarEliminarHermano}
      />
    </Dialog>
  );
};
