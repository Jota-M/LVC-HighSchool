// src/components/preinscripciones/CentroReportesPreinscripcionTab.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Fade,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  SummarizeRounded as SummarizeRoundedIcon,
  Schedule as ScheduleIcon,
  SchoolRounded as SchoolRoundedIcon,
  AccountTreeRounded as AccountTreeRoundedIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
  PersonSearchRounded as PersonSearchRoundedIcon,
  TuneRounded as TuneRoundedIcon,
  PictureAsPdfRounded as PictureAsPdfRoundedIcon,
  TableChartRounded as TableChartRoundedIcon,
  Search as SearchIcon,
  ChevronRightRounded as ChevronRightIcon,
  EventSeat as EventSeatIcon,
} from '@mui/icons-material';
import preinscripcionService from '@/services/preinscripcionService';

export interface ReportePreinscripcionDef {
  id: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge?: string;
  estadoDefault?: string;
  filtros: Array<'grado' | 'nivel' | 'turno' | 'estado' | 'fechas' | 'search'>;
}

export const REPORTES_PREINSCRIPCION: ReportePreinscripcionDef[] = [
  {
    id: 'general',
    titulo: 'Nómina Consolidada Oficial 2027',
    descripcion: 'Padrón nominal completo de todas las solicitudes de preinscripción registradas, con estado administrativo y asignación de cupo.',
    icon: <SummarizeRoundedIcon />,
    color: '#0288d1',
    gradient: 'linear-gradient(135deg, #0288d1, #38bdf8)',
    badge: 'Oficial',
    filtros: ['turno', 'estado', 'fechas', 'search'],
  },
  {
    id: 'aprobados',
    titulo: 'Padrón de Postulantes Aprobados',
    descripcion: 'Listado nominal exclusivo de aspirantes admitidos y con cupo directo, listos para formalizar su matrícula escolar.',
    icon: <CheckCircleIcon />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    badge: 'Aprobados',
    estadoDefault: 'aprobada',
    filtros: ['grado', 'turno', 'fechas', 'search'],
  },
  {
    id: 'lista_espera',
    titulo: 'Padrón de Lista de Espera',
    descripcion: 'Nómina ordenada de postulantes en cola para vacantes disponibles, con orden de prelación, fecha y curso solicitado.',
    icon: <HourglassEmptyIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    badge: 'En Espera',
    estadoDefault: 'en_espera',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'por_grado_turno',
    titulo: 'Nómina por Grado y Turno',
    descripcion: 'Listado clasificado por curso específico (Inicial, Primaria, Secundaria) y jornada de asistencia (Mañana o Tarde).',
    icon: <ScheduleIcon />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    badge: 'Por Curso',
    filtros: ['grado', 'turno', 'estado', 'search'],
  },
  {
    id: 'contacto_tutores',
    titulo: 'Directorio de Contacto de Tutores',
    descripcion: 'Directorio telefónico de padres y apoderados con números de WhatsApp, CI y correo electrónico para citaciones.',
    icon: <PersonSearchRoundedIcon />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    badge: 'Comunicación',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'observados',
    titulo: 'Expedientes Observados y Docs Pendientes',
    descripcion: 'Control de postulaciones con requisitos documentales faltantes o que requieren corrección por parte de los padres.',
    icon: <WarningAmberIcon />,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    badge: 'Observaciones',
    estadoDefault: 'documentos_pendientes',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'balance_aforo',
    titulo: 'Balance Estadístico de Aforo y Vacantes',
    descripcion: 'Cuadro cuantitativo institucional: capacidad de aulas vs solicitudes aprobadas y plazas libres restantes.',
    icon: <EventSeatIcon />,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    badge: 'Estadístico',
    filtros: ['grado', 'turno'],
  },
];

interface CentroReportesPreinscripcionTabProps {
  grados: any[];
  turnos: any[];
  onSnackbar: (message: string, severity?: 'success' | 'error') => void;
}

export const CentroReportesPreinscripcionTab: React.FC<CentroReportesPreinscripcionTabProps> = ({
  grados,
  turnos,
  onSnackbar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReportePreinscripcionDef>(
    REPORTES_PREINSCRIPCION[0]
  );

  // Filtros
  const [repGrado, setRepGrado] = useState<string>('todos');
  const [repTurno, setRepTurno] = useState<string>('todos');
  const [repEstado, setRepEstado] = useState<string>('todos');
  const [repFechaInicio, setRepFechaInicio] = useState<string>('');
  const [repFechaFin, setRepFechaFin] = useState<string>('');
  const [repSearch, setRepSearch] = useState<string>('');

  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [descargandoExcel, setDescargandoExcel] = useState(false);

  const handleSeleccionarReporte = (rep: ReportePreinscripcionDef) => {
    setReporteSeleccionado(rep);
    if (rep.estadoDefault) {
      setRepEstado(rep.estadoDefault);
    } else {
      setRepEstado('todos');
    }
  };

  const handleDescargar = async (formato: 'pdf' | 'excel') => {
    try {
      if (formato === 'pdf') setDescargandoPdf(true);
      else setDescargandoExcel(true);

      const params: any = {
        titulo_reporte: reporteSeleccionado.titulo,
        search: repSearch || undefined,
        grado: repGrado !== 'todos' ? repGrado : undefined,
        turno: repTurno !== 'todos' ? repTurno : undefined,
        estado: repEstado !== 'todos' ? repEstado : undefined,
        fecha_inicio: repFechaInicio || undefined,
        fecha_fin: repFechaFin || undefined,
      };

      await preinscripcionService.exportarReporte(formato, params);
      onSnackbar(`Reporte "${reporteSeleccionado.titulo}" descargado exitosamente en formato ${formato.toUpperCase()}`, 'success');
    } catch (err: any) {
      console.error('Error al descargar reporte:', err);
      onSnackbar(err.message || 'Error al generar el reporte', 'error');
    } finally {
      if (formato === 'pdf') setDescargandoPdf(false);
      else setDescargandoExcel(false);
    }
  };

  return (
    <Box>
      {/* ══ HEADER DEL CENTRO DE REPORTES ══ */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3.5,
          borderRadius: '20px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 8px 20px ${alpha(accent, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <SummarizeRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                Centro Oficial de Reportes de Preinscripciones
              </Typography>
              <Chip
                size="small"
                label="Gestión 2027"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha(accent, 0.15),
                  color: accent,
                  border: `1px solid ${alpha(accent, 0.3)}`,
                  fontSize: '0.68rem',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              Generación de nóminas oficiales, padrones de admisión, listas de espera y análisis de aforo en PDF y Excel para secretaría y dirección.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ══ CATÁLOGO DE REPORTES Y PANEL DE CONFIGURACIÓN ══ */}
      <Grid container spacing={3}>
        {/* Columna Izquierda: Tarjetas de Reportes */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Selecciona un Tipo de Reporte
          </Typography>

          <Grid container spacing={2}>
            {REPORTES_PREINSCRIPCION.map((rep) => {
              const seleccionado = reporteSeleccionado.id === rep.id;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={rep.id}>
                  <Card
                    onClick={() => handleSeleccionarReporte(rep)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '16px',
                      border: `2px solid ${seleccionado ? rep.color : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                      bgcolor: seleccionado
                        ? alpha(rep.color, isDark ? 0.08 : 0.05)
                        : isDark
                        ? alpha('#fff', 0.02)
                        : '#fff',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: seleccionado ? 'translateY(-3px)' : 'none',
                      boxShadow: seleccionado ? `0 8px 24px ${alpha(rep.color, 0.25)}` : 'none',
                      '&:hover': {
                        borderColor: rep.color,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 20px ${alpha(rep.color, 0.18)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(rep.color, 0.15),
                            color: rep.color,
                            width: 44,
                            height: 44,
                          }}
                        >
                          {rep.icon}
                        </Avatar>
                        {rep.badge && (
                          <Chip
                            size="small"
                            label={rep.badge}
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              bgcolor: alpha(rep.color, 0.15),
                              color: rep.color,
                            }}
                          />
                        )}
                      </Box>

                      <Typography variant="subtitle1" fontWeight={800} color="text.primary" gutterBottom>
                        {rep.titulo}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rep.descripcion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Columna Derecha: Configuración, Filtros y Descarga */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
              position: 'sticky',
              top: 20,
            }}
          >
            {/* Header del Reporte Activo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(reporteSeleccionado.color, 0.15),
                  color: reporteSeleccionado.color,
                  width: 50,
                  height: 50,
                }}
              >
                {reporteSeleccionado.icon}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                  Reporte Configurado
                </Typography>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  {reporteSeleccionado.titulo}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {reporteSeleccionado.descripcion}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneRoundedIcon sx={{ fontSize: 18, color: reporteSeleccionado.color }} />
              Filtros y Parámetros del Reporte
            </Typography>

            <Stack spacing={2} mb={3.5}>
              {/* Grado */}
              {reporteSeleccionado.filtros.includes('grado') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Filtrar por Grado</InputLabel>
                  <Select
                    value={repGrado}
                    label="Filtrar por Grado"
                    onChange={(e) => setRepGrado(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="todos">Todos los Grados</MenuItem>
                    {grados.map((g: any) => (
                      <MenuItem key={g.id || g.nombre} value={g.nombre || String(g.id)}>
                        {g.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Turno */}
              {reporteSeleccionado.filtros.includes('turno') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Turno</InputLabel>
                  <Select
                    value={repTurno}
                    label="Turno"
                    onChange={(e) => setRepTurno(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="todos">Todos los Turnos</MenuItem>
                    <MenuItem value="mañana">Turno Mañana</MenuItem>
                    <MenuItem value="tarde">Turno Tarde</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Estado */}
              {reporteSeleccionado.filtros.includes('estado') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Estado de Preinscripción</InputLabel>
                  <Select
                    value={repEstado}
                    label="Estado de Preinscripción"
                    onChange={(e) => setRepEstado(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="todos">Todos los Estados</MenuItem>
                    <MenuItem value="iniciada">Iniciada</MenuItem>
                    <MenuItem value="datos_completos">Datos Completos</MenuItem>
                    <MenuItem value="documentos_pendientes">Documentos Pendientes</MenuItem>
                    <MenuItem value="en_revision">En Revisión</MenuItem>
                    <MenuItem value="documentos_aprobados">Documentos Aprobados</MenuItem>
                    <MenuItem value="aprobada">Aprobada</MenuItem>
                    <MenuItem value="en_espera">En Lista de Espera</MenuItem>
                    <MenuItem value="convertida">Convertida / Matriculada</MenuItem>
                    <MenuItem value="rechazada">Rechazada</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Búsqueda */}
              {reporteSeleccionado.filtros.includes('search') && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filtro opcional por postulante, CI o tutor..."
                  value={repSearch}
                  onChange={(e) => setRepSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              )}

              {/* Rango de Fechas */}
              {reporteSeleccionado.filtros.includes('fechas') && (
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha Desde"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={repFechaInicio}
                      onChange={(e) => setRepFechaInicio(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha Hasta"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={repFechaFin}
                      onChange={(e) => setRepFechaFin(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                </Grid>
              )}
            </Stack>

            {/* Botones de Descarga */}
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                disabled={descargandoPdf || descargandoExcel}
                startIcon={descargandoPdf ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfRoundedIcon />}
                onClick={() => handleDescargar('pdf')}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 800,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  },
                }}
              >
                {descargandoPdf ? 'Generando PDF...' : 'Descargar PDF'}
              </Button>

              <Button
                fullWidth
                variant="contained"
                disabled={descargandoPdf || descargandoExcel}
                startIcon={descargandoExcel ? <CircularProgress size={18} color="inherit" /> : <TableChartRoundedIcon />}
                onClick={() => handleDescargar('excel')}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 800,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  },
                }}
              >
                {descargandoExcel ? 'Generando Excel...' : 'Descargar Excel'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
