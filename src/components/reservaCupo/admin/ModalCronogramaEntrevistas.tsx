// src/components/reservaCupo/admin/ModalCronogramaEntrevistas.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
  alpha,
  Badge,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { reservaCupoService } from '@/services/reservaCupoService';
import {
  Close as CloseIcon,
  CalendarMonthRounded as CalendarMonthIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  TableChartRounded as TableChartIcon,
  PictureAsPdfRounded as PdfIcon,
  PrintRounded as PrintIcon,
  EventAvailableRounded as EventIcon,
  HourglassEmptyRounded as HourglassIcon,
  CheckCircleRounded as CheckCircleIcon,
  CancelRounded as CancelIcon,
  LocationOnRounded as LocationIcon,
  VideocamRounded as VideoIcon,
  WhatsApp as WhatsAppIcon,
  EditCalendarRounded as EditCalendarIcon,
  FilterListRounded as FilterListIcon,
  ViewAgendaRounded as ViewAgendaIcon,
  TableRowsRounded as TableRowsIcon,
  FamilyRestroomRounded as FamilyIcon,
  SchoolRounded as SchoolIcon,
  ScheduleRounded as ScheduleIcon,
  OpenInNewRounded as OpenInNewIcon,
  Refresh as RefreshIcon,
  HowToRegRounded as HowToRegIcon,
  BookmarkAddedRounded as BookmarkAddedIcon,
} from '@mui/icons-material';
import { ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { BtnDescarga, getInitials, usePalette } from './common';

interface ModalCronogramaEntrevistasProps {
  open: boolean;
  onClose: () => void;
  hermanosList: ReservaCupoHermanoData[];
  onEditarEntrevista: (hermano: ReservaCupoHermanoData) => void;
  onRefresh: () => void;
  onExportarPdf: () => void;
  onExportarExcel: () => void;
  exportandoPdf: boolean;
  exportandoExcel: boolean;
  onCambiarEstadoEntrevista?: (
    hermanoId: number,
    nuevoEstado: 'pendiente' | 'programada' | 'realizada' | 'aprobada' | 'no_asistio',
    hermanoIds?: number[]
  ) => Promise<void>;
  onPromoverHermano?: (hermano: ReservaCupoHermanoData) => void;
  onDescargarPDF?: (codigo: string) => void;
  promoviendoHermanoId?: number | null;
}

interface GrupoDiaEntrevistas {
  fechaKey: string;
  fechaTexto: string;
  items: ReservaCupoHermanoData[];
}

export const ModalCronogramaEntrevistas: React.FC<ModalCronogramaEntrevistasProps> = ({
  open,
  onClose,
  hermanosList,
  onEditarEntrevista,
  onRefresh,
  onExportarPdf,
  onExportarExcel,
  exportandoPdf,
  exportandoExcel,
  onCambiarEstadoEntrevista,
  onPromoverHermano,
  onDescargarPDF,
  promoviendoHermanoId = null,
}) => {
  const { theme, isDark, gold: accentColor } = usePalette();

  const [tabActual, setTabActual] = useState<'cronograma' | 'pendientes' | 'todos'>('cronograma');
  const [vistaModo, setVistaModo] = useState<'agenda' | 'tabla'>('agenda');
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [filtroModalidad, setFiltroModalidad] = useState<string>('');
  const [enviandoWhatsAppId, setEnviandoWhatsAppId] = useState<number | null>(null);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(null);

  // Acción rápida para calificar la entrevista (Aprobada / No Asistió)
  const handleCambiarEstado = async (
    hermano: ReservaCupoHermanoData,
    nuevoEstado: 'pendiente' | 'programada' | 'realizada' | 'aprobada' | 'no_asistio'
  ) => {
    setCambiandoEstadoId(hermano.id);
    const labelEstado =
      nuevoEstado === 'aprobada'
        ? 'Aprobada'
        : nuevoEstado === 'no_asistio'
        ? 'No Asistió'
        : nuevoEstado === 'programada'
        ? 'Programada'
        : 'Pendiente';
    const toastId = toast.loading(`Actualizando entrevista a "${labelEstado}"...`);
    try {
      if (onCambiarEstadoEntrevista) {
        await onCambiarEstadoEntrevista(hermano.id, nuevoEstado);
      } else {
        const resp = await reservaCupoService.actualizarEstadoEntrevistaHermano(hermano.id, {
          estado_entrevista: nuevoEstado,
        });
        if (resp?.success) {
          toast.success(resp.message || `Entrevista actualizada a ${labelEstado}`, { id: toastId });
          onRefresh();
        } else {
          toast.error(resp?.message || 'No se pudo actualizar el estado', { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error al actualizar entrevista', { id: toastId });
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  // Estadísticas globales del cronograma
  const stats = useMemo(() => {
    let programadas = 0;
    let aprobadas = 0;
    let pendientes = 0;
    let noAsistio = 0;

    for (const h of hermanosList) {
      if (h.estado_entrevista === 'programada') programadas++;
      else if (h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada') aprobadas++;
      else if (h.estado_entrevista === 'no_asistio') noAsistio++;
      else pendientes++;
    }

    return {
      total: hermanosList.length,
      programadas,
      aprobadas,
      pendientes,
      noAsistio,
    };
  }, [hermanosList]);

  // Lista de fechas únicas disponibles en las entrevistas agendadas
  const fechasDisponibles = useMemo(() => {
    const setFechas = new Set<string>();
    for (const h of hermanosList) {
      if (h.fecha_entrevista_solo_fecha) {
        setFechas.add(h.fecha_entrevista_solo_fecha);
      }
    }
    return Array.from(setFechas).sort();
  }, [hermanosList]);

  // Filtrado de registros
  const hermanosFiltrados = useMemo(() => {
    return hermanosList.filter((h) => {
      // Filtro por tab principal
      if (tabActual === 'cronograma') {
        if (!h.fecha_entrevista && h.estado_entrevista !== 'programada' && h.estado_entrevista !== 'aprobada') {
          return false;
        }
      } else if (tabActual === 'pendientes') {
        if (h.estado_entrevista === 'programada' || h.estado_entrevista === 'aprobada' || h.fecha_entrevista) {
          return false;
        }
      }

      // Filtro por búsqueda de texto
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nombresH = (h.nombres || '').toLowerCase();
        const apellidosH = (h.apellido_paterno || '').toLowerCase();
        const ciH = (h.ci || '').toLowerCase();
        const codReserva = (h.codigo_reserva || '').toLowerCase();
        const tutor = (h.tutor_nombre || '').toLowerCase();
        const tel = (h.tutor_telefono || '').toLowerCase();
        const regular = (h.regular_nombre_completo || '').toLowerCase();

        const coincide =
          nombresH.includes(q) ||
          apellidosH.includes(q) ||
          ciH.includes(q) ||
          codReserva.includes(q) ||
          tutor.includes(q) ||
          tel.includes(q) ||
          regular.includes(q);

        if (!coincide) return false;
      }

      // Filtro por estado entrevista
      if (filtroEstado) {
        if (filtroEstado === 'pendiente') {
          if (h.estado_entrevista && h.estado_entrevista !== 'pendiente') return false;
        } else if (h.estado_entrevista !== filtroEstado) {
          return false;
        }
      }

      // Filtro por fecha
      if (filtroFecha && h.fecha_entrevista_solo_fecha !== filtroFecha) {
        return false;
      }

      // Filtro por modalidad
      if (filtroModalidad && h.modalidad_entrevista !== filtroModalidad) {
        return false;
      }

      return true;
    });
  }, [hermanosList, tabActual, search, filtroEstado, filtroFecha, filtroModalidad]);

  // Ordenar cronológicamente de forma estricta (fecha_entrevista ASC)
  const cronogramaOrdenado = useMemo(() => {
    const copia = [...hermanosFiltrados];
    copia.sort((a, b) => {
      if (!a.fecha_entrevista && !b.fecha_entrevista) return a.id - b.id;
      if (!a.fecha_entrevista) return 1;
      if (!b.fecha_entrevista) return -1;
      return new Date(a.fecha_entrevista).getTime() - new Date(b.fecha_entrevista).getTime();
    });
    return copia;
  }, [hermanosFiltrados]);

  // Agrupar por días para la vista de agenda
  const gruposPorDia = useMemo(() => {
    const map = new Map<string, GrupoDiaEntrevistas>();

    for (const h of cronogramaOrdenado) {
      const fechaKey = h.fecha_entrevista_solo_fecha || 'Sin Agendar';
      let fechaTexto = 'Sin Fecha Definida';

      if (h.fecha_entrevista) {
        try {
          const d = new Date(h.fecha_entrevista);
          fechaTexto = d.toLocaleDateString('es-BO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
        } catch {
          fechaTexto = fechaKey;
        }
      }

      if (!map.has(fechaKey)) {
        map.set(fechaKey, {
          fechaKey,
          fechaTexto,
          items: [],
        });
      }
      map.get(fechaKey)!.items.push(h);
    }

    return Array.from(map.values());
  }, [cronogramaOrdenado]);

  // Enviar mensaje automático por Bot de WhatsApp
  const handleEnviarRecordatorioWhatsApp = async (h: ReservaCupoHermanoData) => {
    const tel = (h.tutor_telefono || '').replace(/\D/g, '');
    if (!tel) {
      toast.error('El registro no cuenta con número de teléfono de WhatsApp.');
      return;
    }

    if (!h.fecha_entrevista) {
      toast.error('El postulante debe tener una fecha y hora de entrevista agendada.');
      return;
    }

    setEnviandoWhatsAppId(h.id);
    const toastId = toast.loading(`Enviando recordatorio vía Bot de WhatsApp a ${h.tutor_nombre}...`);
    try {
      const resp = await reservaCupoService.notificarEntrevistaHermanoWhatsApp(h.id);
      if (resp?.success) {
        toast.success(resp.message || 'Recordatorio enviado exitosamente por el bot de WhatsApp.', { id: toastId });
        onRefresh();
      } else {
        toast.error(resp?.message || 'El bot no pudo entregar el mensaje por WhatsApp.', { id: toastId });
      }
    } catch (err: any) {
      console.error('Error enviando recordatorio por bot:', err);
      const msg = err.response?.data?.message || err.message || 'Error al conectar con el servicio del bot de WhatsApp';
      toast.error(msg, { id: toastId });
    } finally {
      setEnviandoWhatsAppId(null);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 4 },
          bgcolor: isDark ? '#0f172a' : '#f8fafc',
          backgroundImage: 'none',
          boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.7)' : '0 25px 50px -12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          maxHeight: '92vh',
        },
      }}
    >
      {/* CABECERA INSTITUCIONAL */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          background: isDark
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: '#fff',
          position: 'relative',
          borderBottom: `2px solid ${accentColor}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                width: 52,
                height: 52,
                border: `2px solid ${alpha(accentColor, 0.8)}`,
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
                Cronograma de Entrevistas Familiares
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.88rem' }}>
                Agenda cronológica oficial de citas para postulantes con Prioridad Hermano · Gestión 2027
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <BtnDescarga
              label="Excel"
              icon={<TableChartIcon sx={{ fontSize: 18 }} />}
              color="#10b981"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              loading={exportandoExcel}
              disabled={exportandoPdf}
              onClick={onExportarExcel}
            />
            <BtnDescarga
              label="PDF"
              icon={<PdfIcon sx={{ fontSize: 18 }} />}
              color="#ef4444"
              gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              loading={exportandoPdf}
              disabled={exportandoExcel}
              onClick={onExportarPdf}
            />
            <Tooltip title="Imprimir cronograma">
              <IconButton
                onClick={handleImprimir}
                sx={{
                  bgcolor: alpha('#fff', 0.12),
                  color: '#fff',
                  '&:hover': { bgcolor: alpha('#fff', 0.22) },
                  borderRadius: '12px',
                }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={onRefresh}
                sx={{
                  bgcolor: alpha('#fff', 0.12),
                  color: '#fff',
                  '&:hover': { bgcolor: alpha('#fff', 0.22) },
                  borderRadius: '12px',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={onClose}
              sx={{
                color: '#fff',
                bgcolor: alpha('#fff', 0.1),
                '&:hover': { bgcolor: alpha('#fff', 0.25) },
                borderRadius: '12px',
                ml: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
        {/* KPI CARDS (RESUMEN EJECUTIVO) */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#1e293b', 0.6) : '#ffffff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                borderLeft: '4px solid #2563eb',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                CITAS PROGRAMADAS
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#2563eb">
                {stats.programadas}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                En agenda activa
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#1e293b', 0.6) : '#ffffff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                borderLeft: '4px solid #10b981',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                ENTREVISTAS APROBADAS
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#10b981">
                {stats.aprobadas}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Realizadas y conformes
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#1e293b', 0.6) : '#ffffff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                borderLeft: '4px solid #f59e0b',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PENDIENTES POR AGENDAR
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#f59e0b">
                {stats.pendientes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requieren fijar fecha
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: isDark ? alpha('#1e293b', 0.6) : '#ffffff',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                borderLeft: '4px solid #6366f1',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TOTAL POSTULANTES
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#6366f1">
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hermanitos registrados
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* TABS DE SELECCIÓN Y SWITCH DE VISTA */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2.5,
            borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
            pb: 1,
          }}
        >
          <Tabs
            value={tabActual}
            onChange={(_, val) => setTabActual(val)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 44,
              },
            }}
          >
            <Tab
              value="cronograma"
              label={`📅 Cronograma Agendado (${stats.programadas + stats.aprobadas})`}
            />
            <Tab
              value="pendientes"
              label={`⏳ Por Agendar (${stats.pendientes})`}
            />
            <Tab
              value="todos"
              label={`📋 Todos los Postulantes (${stats.total})`}
            />
          </Tabs>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Vista:
            </Typography>
            <Button
              size="small"
              variant={vistaModo === 'agenda' ? 'contained' : 'outlined'}
              startIcon={<ViewAgendaIcon />}
              onClick={() => setVistaModo('agenda')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Agenda por Día
            </Button>
            <Button
              size="small"
              variant={vistaModo === 'tabla' ? 'contained' : 'outlined'}
              startIcon={<TableRowsIcon />}
              onClick={() => setVistaModo('tabla')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Tabla Completa
            </Button>
          </Stack>
        </Box>

        {/* BARRA DE FILTROS ESPECÍFICOS */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: '16px',
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por hermano, tutor, CI, teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: accentColor, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2.8 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Día</InputLabel>
                <Select
                  value={filtroFecha}
                  label="Filtrar por Día"
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Todos los días</MenuItem>
                  {fechasDisponibles.map((f) => (
                    <MenuItem key={f} value={f}>
                      📅 {f}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2.6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado Cita</InputLabel>
                <Select
                  value={filtroEstado}
                  label="Estado Cita"
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="programada">📅 Programada</MenuItem>
                  <MenuItem value="aprobada">✅ Aprobada</MenuItem>
                  <MenuItem value="pendiente">⏳ Pendiente</MenuItem>
                  <MenuItem value="no_asistio">❌ No Asistió</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 2.6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Modalidad</InputLabel>
                <Select
                  value={filtroModalidad}
                  label="Modalidad"
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Todas las modalidades</MenuItem>
                  <MenuItem value="presencial">🏛️ Presencial (Colegio)</MenuItem>
                  <MenuItem value="virtual">💻 Virtual (Google Meet)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* LISTADO: MODO AGENDA O MODO TABLA */}
        {cronogramaOrdenado.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '20px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 54, color: 'text.secondary', opacity: 0.4, mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No se encontraron entrevistas para los criterios seleccionados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Intente ajustar los filtros de búsqueda o seleccionar otra fecha.
            </Typography>
          </Paper>
        ) : vistaModo === 'agenda' ? (
          /* VISTA AGENDA CRONOLÓGICA (AGRUPADA POR DÍA) */
          <Stack spacing={3}>
            {gruposPorDia.map((grupo) => (
              <Box key={grupo.fechaKey}>
                {/* ENCABEZADO DEL DÍA */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 1.8,
                    p: 1.5,
                    px: 2,
                    borderRadius: '14px',
                    bgcolor: isDark ? alpha('#2563eb', 0.15) : alpha('#2563eb', 0.08),
                    borderLeft: '5px solid #2563eb',
                  }}
                >
                  <CalendarMonthIcon sx={{ color: '#2563eb', fontSize: 24 }} />
                  <Typography variant="subtitle1" fontWeight={900} color="text.primary">
                    {grupo.fechaTexto}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${grupo.items.length} ${grupo.items.length === 1 ? 'entrevista' : 'entrevistas'}`}
                    sx={{
                      fontWeight: 800,
                      bgcolor: '#2563eb',
                      color: '#fff',
                      fontSize: '0.75rem',
                      height: 24,
                    }}
                  />
                </Box>

                {/* SLOTS DE ENTREVISTAS DEL DÍA */}
                <Grid container spacing={2}>
                  {grupo.items.map((h, idx) => {
                    const hora = h.fecha_entrevista_hora || (h.fecha_entrevista ? new Date(h.fecha_entrevista).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : 'Sin hora');
                    const esAprobada = h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada';
                    const esProgramada = h.estado_entrevista === 'programada';
                    const esNoAsistio = h.estado_entrevista === 'no_asistio';

                    return (
                      <Grid key={h.id} size={{ xs: 12, md: 6 }}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.2,
                            borderRadius: '16px',
                            bgcolor: isDark ? alpha('#1e293b', 0.7) : '#ffffff',
                            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                              borderColor: alpha(accentColor, 0.4),
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          {/* TOP: HORA Y ESTADO */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                icon={<ScheduleIcon sx={{ fontSize: '16px !important' }} />}
                                label={hora}
                                sx={{
                                  fontWeight: 900,
                                  fontSize: '0.9rem',
                                  bgcolor: isDark ? alpha('#2563eb', 0.25) : alpha('#2563eb', 0.12),
                                  color: '#2563eb',
                                  border: `1px solid ${alpha('#2563eb', 0.3)}`,
                                  px: 0.5,
                                }}
                              />
                              <Chip
                                size="small"
                                icon={
                                  h.modalidad_entrevista === 'virtual' ? (
                                    <VideoIcon sx={{ fontSize: '14px !important' }} />
                                  ) : (
                                    <LocationIcon sx={{ fontSize: '14px !important' }} />
                                  )
                                }
                                label={h.modalidad_entrevista === 'virtual' ? 'Virtual' : 'Presencial'}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  bgcolor: h.modalidad_entrevista === 'virtual' ? alpha('#8b5cf6', 0.15) : alpha('#059669', 0.12),
                                  color: h.modalidad_entrevista === 'virtual' ? '#8b5cf6' : '#059669',
                                }}
                              />
                            </Box>

                            <Chip
                              size="small"
                              label={
                                esAprobada
                                  ? 'Aprobada'
                                  : esProgramada
                                  ? 'Programada'
                                  : esNoAsistio
                                  ? 'No Asistió'
                                  : 'Pendiente'
                              }
                              color={
                                esAprobada
                                  ? 'success'
                                  : esProgramada
                                  ? 'primary'
                                  : esNoAsistio
                                  ? 'error'
                                  : 'warning'
                              }
                              sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                            />
                          </Box>

                          {/* DATOS DEL POSTULANTE */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: alpha('#2563eb', 0.15),
                                color: '#2563eb',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                              }}
                            >
                              {getInitials(h.nombres, h.apellido_paterno)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" fontWeight={800} noWrap>
                                {h.nombre_completo || `${h.nombres} ${h.apellido_paterno}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <SchoolIcon sx={{ fontSize: 16, color: accentColor }} />
                                <Box component="span" fontWeight={700} color="text.primary">
                                  {h.grado_solicitado_nombre || 'Grado no especificado'}
                                </Box>
                                <Box component="span" color="text.secondary">
                                  · Turno {h.turno_solicitado_nombre || '—'}
                                </Box>
                              </Typography>
                            </Box>
                          </Box>

                          {/* HERMANO REGULAR RESPALDO */}
                          <Box
                            sx={{
                              p: 1.2,
                              mb: 1.5,
                              borderRadius: '12px',
                              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                              border: `1px dashed ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FamilyIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                              <Box>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                  Hermano Regular:
                                </Typography>
                                <Typography variant="body2" fontWeight={700} noWrap>
                                  {h.regular_nombre_completo || 'Estudiante Regular'}
                                </Typography>
                              </Box>
                            </Box>
                            {h.regular_codigo && (
                              <Chip
                                size="small"
                                label={`Cód: ${h.regular_codigo}`}
                                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                              />
                            )}
                          </Box>

                          {/* TUTOR Y UBICACIÓN / ENLACE */}
                          <Stack spacing={0.6} sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <strong>Tutor:</strong> {h.tutor_nombre} ({h.tutor_parentesco}) · 📞 {h.tutor_telefono || 'Sin teléfono'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              {h.modalidad_entrevista === 'virtual' ? (
                                <>
                                  <VideoIcon sx={{ fontSize: 14, color: '#8b5cf6' }} />
                                  <span>Enlace: {h.enlace_entrevista ? <a href={h.enlace_entrevista} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{h.enlace_entrevista}</a> : 'Pendiente de generar'}</span>
                                </>
                              ) : (
                                <>
                                  <LocationIcon sx={{ fontSize: 14, color: '#059669' }} />
                                  <span>Lugar: {h.lugar_entrevista || 'Dirección del Colegio - Oficina Principal'}</span>
                                </>
                              )}
                            </Typography>
                            {h.observaciones_entrevista && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                💬 "{h.observaciones_entrevista}"
                              </Typography>
                            )}
                          </Stack>

                          {/* BOTONES DE ACCIÓN RÁPIDA */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 1,
                              pt: 1.5,
                              borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
                            }}
                          >
                            {/* Cupo status badge & Promover button / Recibo PDF */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                label={h.estado === 'en_espera' ? `Lista Espera #${h.posicion_espera || 1}` : 'Cupo Confirmado'}
                                sx={{
                                  height: 22,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  bgcolor: h.estado === 'en_espera' ? alpha('#f59e0b', 0.15) : alpha('#10b981', 0.15),
                                  color: h.estado === 'en_espera' ? '#d97706' : '#059669',
                                  border: `1px solid ${h.estado === 'en_espera' ? alpha('#f59e0b', 0.4) : alpha('#10b981', 0.4)}`,
                                }}
                              />

                              {/* Si está en lista de espera -> Botón Promover Directo */}
                              {h.estado === 'en_espera' && onPromoverHermano && (
                                <Tooltip title="Asignar y confirmar cupo titular para 2027">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    disabled={promoviendoHermanoId === h.id}
                                    startIcon={
                                      promoviendoHermanoId === h.id ? (
                                        <CircularProgress size={14} color="inherit" />
                                      ) : (
                                        <HowToRegIcon sx={{ fontSize: 16 }} />
                                      )
                                    }
                                    onClick={() => onPromoverHermano(h)}
                                    sx={{
                                      borderRadius: '8px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      textTransform: 'none',
                                      py: 0.3,
                                      px: 1,
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    }}
                                  >
                                    Promover Cupo
                                  </Button>
                                </Tooltip>
                              )}

                              {/* Si ya está confirmado -> Descargar Recibo */}
                              {h.estado === 'confirmada' && onDescargarPDF && (
                                <Tooltip title="Descargar comprobante oficial de reserva (PDF)">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<PdfIcon sx={{ fontSize: 15, color: '#ef4444' }} />}
                                    onClick={() => onDescargarPDF(h.codigo_reserva)}
                                    sx={{
                                      borderRadius: '8px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      textTransform: 'none',
                                      py: 0.3,
                                      px: 1,
                                      borderColor: alpha('#ef4444', 0.4),
                                      color: isDark ? '#f87171' : '#b91c1c',
                                      '&:hover': {
                                        borderColor: '#ef4444',
                                        bgcolor: alpha('#ef4444', 0.08),
                                      },
                                    }}
                                  >
                                    Recibo PDF
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>

                            {/* Acciones de Entrevista */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                              {/* Botón rápido Aprobar (si no está ya aprobada) */}
                              {!esAprobada && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  disabled={cambiandoEstadoId === h.id}
                                  startIcon={
                                    cambiandoEstadoId === h.id ? (
                                      <CircularProgress size={14} color="inherit" />
                                    ) : (
                                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                                    )
                                  }
                                  onClick={() => handleCambiarEstado(h, 'aprobada')}
                                  sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    py: 0.4,
                                    px: 1.2,
                                    bgcolor: '#16a34a',
                                    '&:hover': { bgcolor: '#15803d' },
                                  }}
                                >
                                  Aprobar
                                </Button>
                              )}

                              {/* Botón rápido No Asistió (si no está en no_asistio) */}
                              {!esNoAsistio && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  disabled={cambiandoEstadoId === h.id}
                                  startIcon={
                                    cambiandoEstadoId === h.id ? (
                                      <CircularProgress size={14} color="inherit" />
                                    ) : (
                                      <CancelIcon sx={{ fontSize: 15 }} />
                                    )
                                  }
                                  onClick={() => handleCambiarEstado(h, 'no_asistio')}
                                  sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.74rem',
                                    py: 0.4,
                                    px: 1,
                                  }}
                                >
                                  Faltó
                                </Button>
                              )}

                              {/* WhatsApp Bot */}
                              {h.tutor_telefono && (
                                <Tooltip title="Enviar recordatorio por WhatsApp Bot institucional">
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={enviandoWhatsAppId === h.id}
                                      onClick={() => handleEnviarRecordatorioWhatsApp(h)}
                                      sx={{
                                        color: '#16a34a',
                                        border: `1px solid ${alpha('#16a34a', 0.4)}`,
                                        borderRadius: '8px',
                                        p: 0.5,
                                        '&:hover': { bgcolor: alpha('#16a34a', 0.1) },
                                      }}
                                    >
                                      {enviandoWhatsAppId === h.id ? (
                                        <CircularProgress size={16} color="inherit" />
                                      ) : (
                                        <WhatsAppIcon sx={{ fontSize: 18 }} />
                                      )}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}

                              {/* Editar / Reprogramar Cita */}
                              <Tooltip title="Editar detalles de cita o cambiar horario">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEditarEntrevista(h)}
                                  sx={{
                                    border: `1px solid ${alpha('#2563eb', 0.4)}`,
                                    borderRadius: '8px',
                                    p: 0.5,
                                    '&:hover': { bgcolor: alpha('#2563eb', 0.1) },
                                  }}
                                >
                                  <EditCalendarIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}
          </Stack>
        ) : (
          /* VISTA TABLA CRONOLÓGICA COMPLETA */
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Fecha y Hora</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Postulante (Hermano)</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Grado / Turno</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Hermano Regular</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Tutor / Contacto</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Modalidad / Lugar</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cronogramaOrdenado.map((h, idx) => {
                  const esAprobada = h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada';
                  const esProgramada = h.estado_entrevista === 'programada';
                  const esNoAsistio = h.estado_entrevista === 'no_asistio';

                  return (
                    <TableRow
                      key={h.id}
                      hover
                      sx={{
                        '&:nth-of-type(even)': {
                          bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.01),
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={800} color="#2563eb">
                          {h.fecha_entrevista_formateada || (h.fecha_entrevista ? new Date(h.fecha_entrevista).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin agendar')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {h.nombre_completo || `${h.nombres} ${h.apellido_paterno}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CI: {h.ci || 'Sin CI'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {h.grado_solicitado_nombre || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Turno {h.turno_solicitado_nombre || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {h.regular_nombre_completo || '—'}
                        </Typography>
                        {h.regular_codigo && (
                          <Typography variant="caption" color="text.secondary">
                            Cód: {h.regular_codigo}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {h.tutor_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {h.tutor_parentesco} · 📞 {h.tutor_telefono || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={h.modalidad_entrevista === 'virtual' ? '💻 Virtual' : '🏛️ Presencial'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22, mb: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {h.modalidad_entrevista === 'virtual' ? (h.enlace_entrevista ? 'Meet disponible' : 'Enlace coord.') : (h.lugar_entrevista || 'Dirección')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            esAprobada
                              ? 'Aprobada'
                              : esProgramada
                              ? 'Programada'
                              : esNoAsistio
                              ? 'No Asistió'
                              : 'Pendiente'
                          }
                          color={
                            esAprobada
                              ? 'success'
                              : esProgramada
                              ? 'primary'
                              : esNoAsistio
                              ? 'error'
                              : 'warning'
                          }
                          sx={{ fontWeight: 800, fontSize: '0.72rem', height: 24 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          {/* Aprobar rápido */}
                          {!esAprobada && (
                            <Tooltip title="Aprobar Entrevista">
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={cambiandoEstadoId === h.id}
                                  onClick={() => handleCambiarEstado(h, 'aprobada')}
                                  sx={{ p: 0.4 }}
                                >
                                  {cambiandoEstadoId === h.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* No asistió rápido */}
                          {!esNoAsistio && (
                            <Tooltip title="Marcar No Asistió">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={cambiandoEstadoId === h.id}
                                  onClick={() => handleCambiarEstado(h, 'no_asistio')}
                                  sx={{ p: 0.4 }}
                                >
                                  {cambiandoEstadoId === h.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <CancelIcon sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* Promover si está en lista de espera */}
                          {h.estado === 'en_espera' && onPromoverHermano && (
                            <Tooltip title="Promover a cupo confirmado">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={promoviendoHermanoId === h.id}
                                  onClick={() => onPromoverHermano(h)}
                                  sx={{ p: 0.4, color: '#10b981' }}
                                >
                                  {promoviendoHermanoId === h.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <HowToRegIcon sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* Recibo PDF si confirmado */}
                          {h.estado === 'confirmada' && onDescargarPDF && (
                            <Tooltip title="Descargar Recibo Oficial PDF">
                              <IconButton
                                size="small"
                                onClick={() => onDescargarPDF(h.codigo_reserva)}
                                sx={{ p: 0.4, color: '#ef4444' }}
                              >
                                <PdfIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* WhatsApp */}
                          {h.tutor_telefono && (
                            <Tooltip title={enviandoWhatsAppId === h.id ? 'Enviando vía Bot...' : 'Enviar recordatorio WhatsApp vía Bot'}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={enviandoWhatsAppId === h.id}
                                  onClick={() => handleEnviarRecordatorioWhatsApp(h)}
                                  sx={{ p: 0.4 }}
                                >
                                  {enviandoWhatsAppId === h.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <WhatsAppIcon sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* Reprogramar / Editar */}
                          <Tooltip title="Editar / Reprogramar Cita">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                onEditarEntrevista(h);
                              }}
                              sx={{ p: 0.4 }}
                            >
                              <EditCalendarIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

