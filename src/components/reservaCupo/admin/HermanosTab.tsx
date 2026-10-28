// src/components/reservaCupo/admin/HermanosTab.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Skeleton,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Stack,
  Button,
  CircularProgress,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TableChartRounded as TableChartRoundedIcon,
  PictureAsPdfRounded as PictureAsPdfRoundedIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircle as CheckCircleIcon,
  HowToReg as HowToRegIcon,
  WhatsApp as WhatsAppIcon,
  PictureAsPdf as PdfIcon,
  DeleteForeverRounded as DeleteIcon,
  EventAvailableRounded as EventIcon,
  HourglassEmptyRounded as HourglassIcon,
  EditCalendarRounded as EditCalendarIcon,
  FamilyRestroomRounded as FamilyIcon,
} from '@mui/icons-material';
import { ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { BtnDescarga, getInitials, usePalette } from './common';

export interface FamiliaGrupo {
  key: string;
  tutor_nombre: string;
  tutor_telefono: string;
  tutor_parentesco: string;
  tutor_ci?: string;
  regular_nombre_completo: string;
  regular_codigo?: string;
  regular_ci?: string;
  regular_foto_url?: string;
  fecha_registro_minima: string;
  hermanos: ReservaCupoHermanoData[];
}

interface HermanosTabProps {
  hermanosList: ReservaCupoHermanoData[];
  loadingHermanos: boolean;
  searchHermano: string;
  onSearchHermanoChange: (val: string) => void;
  filtroEstadoHermano: string;
  onFiltroEstadoHermanoChange: (val: string) => void;
  filtroEstadoEntrevista?: string;
  onFiltroEstadoEntrevistaChange?: (val: string) => void;
  exportandoExcel: boolean;
  exportandoPdf: boolean;
  onExportarExcel: () => void;
  onExportarPdf: () => void;
  onRefresh: () => void;
  promoviendoHermanoId: number | null;
  onPromoverHermano: (hermano: ReservaCupoHermanoData) => void;
  onDescargarPDF: (codigo: string) => void;
  onEliminarHermano: (hermano: ReservaCupoHermanoData) => void;
  onAgendarEntrevista?: (hermano: ReservaCupoHermanoData) => void;
}

export const HermanosTab: React.FC<HermanosTabProps> = ({
  hermanosList,
  loadingHermanos,
  searchHermano,
  onSearchHermanoChange,
  filtroEstadoHermano,
  onFiltroEstadoHermanoChange,
  filtroEstadoEntrevista = '',
  onFiltroEstadoEntrevistaChange,
  exportandoExcel,
  exportandoPdf,
  onExportarExcel,
  onExportarPdf,
  onRefresh,
  promoviendoHermanoId,
  onPromoverHermano,
  onDescargarPDF,
  onEliminarHermano,
  onAgendarEntrevista,
}) => {
  const { theme, isDark, gold: accentColor, gradBg } = usePalette();

  // Agrupar hermanos en una sola Card por familia y ordenar por fecha de registro de cupo ASC
  const familiasAgrupadas = React.useMemo(() => {
    const map = new Map<string, FamiliaGrupo>();
    for (const h of hermanosList) {
      const key = h.hermano_regular_id
        ? `reg_${h.hermano_regular_id}`
        : (h.tutor_ci && h.tutor_ci.trim()
            ? `ci_${h.tutor_ci.trim()}`
            : (h.tutor_telefono && h.tutor_telefono.trim()
                ? `tel_${h.tutor_telefono.trim()}`
                : `h_${h.id}`));

      if (!map.has(key)) {
        map.set(key, {
          key,
          tutor_nombre: h.tutor_nombre,
          tutor_telefono: h.tutor_telefono,
          tutor_parentesco: h.tutor_parentesco,
          tutor_ci: h.tutor_ci,
          regular_nombre_completo:
            h.regular_nombre_completo ||
            [h.regular_nombres, h.regular_apellidos].filter(Boolean).join(' ') ||
            'Estudiante Regular',
          regular_codigo: h.regular_codigo || undefined,
          regular_ci: h.regular_ci || undefined,
          regular_foto_url: h.regular_foto_url || undefined,
          fecha_registro_minima: h.fecha_reserva || '',
          hermanos: [],
        });
      }
      const fam = map.get(key)!;
      fam.hermanos.push(h);
      if (h.fecha_reserva && (!fam.fecha_registro_minima || h.fecha_reserva < fam.fecha_registro_minima)) {
        fam.fecha_registro_minima = h.fecha_reserva;
      }
    }

    const listaFamilias = Array.from(map.values());
    // Ordenar de forma estricta según el orden de registro del cupo (fecha_reserva ASC)
    listaFamilias.sort((a, b) => {
      if (!a.fecha_registro_minima) return 1;
      if (!b.fecha_registro_minima) return -1;
      return new Date(a.fecha_registro_minima).getTime() - new Date(b.fecha_registro_minima).getTime();
    });

    return listaFamilias;
  }, [hermanosList]);

  // Enlace directo WhatsApp sin códigos de estudiante y con enlace a Google Maps institucional
  const handleAbrirWhatsAppFamilia = (fam: FamiliaGrupo) => {
    const tel = (fam.tutor_telefono || '').replace(/\D/g, '');
    const num = tel.startsWith('591') ? tel : `591${tel}`;

    const nombresHermanos = fam.hermanos
      .map((h) => `${h.nombres} ${h.apellido_paterno} (${h.grado_solicitado_nombre || h.grado_nombre})`)
      .join(', ');

    const primerH = fam.hermanos[0];
    const tieneEntrevista = primerH?.estado_entrevista === 'programada' && primerH?.fecha_entrevista_formateada;

    let texto = '';
    if (tieneEntrevista) {
      const lugar = primerH.modalidad_entrevista === 'virtual'
        ? `Enlace de reunión: ${primerH.enlace_entrevista || 'Por coordinar'}`
        : `Lugar: ${primerH.lugar_entrevista || 'Dirección del Colegio - Oficina Principal'}`;

      const linkMaps = primerH.modalidad_entrevista !== 'virtual'
        ? '\n\n📍 *Ubicación del Colegio (Google Maps):*\nhttps://maps.app.goo.gl/dWapCMNPguGBMUTv9'
        : '';

      const hijosTexto = fam.hermanos.length > 1
        ? `sus hijos postulantes: ${nombresHermanos}`
        : `su hijo(a) postulante: ${nombresHermanos}`;

      texto = `Estimado/a ${fam.tutor_nombre}, le comunicamos de la Unidad Educativa La Voz de Cristo que la entrevista institucional familiar para ${hijosTexto} ha sido agendada para: *${primerH.fecha_entrevista_formateada}* (${lugar}). Para optimizar su tiempo, se llevará a cabo una sola entrevista conjunta para toda la familia. Es indispensable la asistencia del tutor junto con los postulantes.${linkMaps}\n\nSecretaría: +591 69624189`;
    } else {
      const hijosTexto = fam.hermanos.length > 1
        ? `sus hijos postulantes: ${nombresHermanos}`
        : `su hijo(a) postulante: ${nombresHermanos}`;

      texto = `Estimado/a ${fam.tutor_nombre}, le contactamos del colegio La Voz de Cristo referente a la postulación con Prioridad Hermano para ${hijosTexto}. Nos comunicaremos a la brevedad para coordinar la entrevista institucional familiar.\n\n📍 *Ubicación del Colegio (Google Maps):*\nhttps://maps.app.goo.gl/dWapCMNPguGBMUTv9\n\nSecretaría: +591 69624189`;
    }

    window.open(`https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <Box>
      {/* BARRA DE FILTROS PARA HERMANOS (Estilo Docente Calificaciones / Notas) */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: '18px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar hermano, CI, regular o código..."
              value={searchHermano}
              onChange={(e) => onSearchHermanoChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: accentColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchHermano ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchHermanoChange('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& fieldset': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: accentColor,
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado de Cupo</InputLabel>
              <Select
                value={filtroEstadoHermano}
                label="Estado de Cupo"
                onChange={(e) => onFiltroEstadoHermanoChange(e.target.value)}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  },
                }}
              >
                <MenuItem value="">Todos los cupos</MenuItem>
                <MenuItem value="confirmada">Confirmada (Cupo Directo)</MenuItem>
                <MenuItem value="en_espera">En Lista de Espera</MenuItem>
                <MenuItem value="solicitud_anulacion">Solicitud de Anulación</MenuItem>
                <MenuItem value="anulada">Anulada / Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado Entrevista</InputLabel>
              <Select
                value={filtroEstadoEntrevista}
                label="Estado Entrevista"
                onChange={(e) => onFiltroEstadoEntrevistaChange?.(e.target.value)}
                sx={{
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(isDark ? '#fff' : '#000', 0.1),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(accentColor, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  },
                }}
              >
                <MenuItem value="">Todas las entrevistas</MenuItem>
                <MenuItem value="pendiente">⏳ Entrevista Pendiente</MenuItem>
                <MenuItem value="programada">📅 Entrevista Programada</MenuItem>
                <MenuItem value="aprobada">✅ Entrevista Aprobada</MenuItem>
                <MenuItem value="no_asistio">❌ No Asistió</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 3.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', flexWrap: 'wrap' }}>
              <BtnDescarga
                label="Excel"
                icon={<TableChartRoundedIcon sx={{ fontSize: 18 }} />}
                color="#10b981"
                gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                loading={exportandoExcel}
                disabled={exportandoPdf}
                onClick={onExportarExcel}
              />
              <BtnDescarga
                label="PDF"
                icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} />}
                color="#ef4444"
                gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                loading={exportandoPdf}
                disabled={exportandoExcel}
                onClick={onExportarPdf}
              />
              <Tooltip title="Actualizar lista de hermanos">
                <IconButton
                  onClick={onRefresh}
                  disabled={loadingHermanos}
                  sx={{
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    borderRadius: '12px',
                    p: 1.1,
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Acceso Rápido a Estados de Entrevista */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
            mt: 2,
            pt: 1.5,
            borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`,
          }}
        >
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mr: 0.5 }}>
            Filtro Rápido:
          </Typography>
          <Chip
            clickable
            size="small"
            label="Todos los Hermanos"
            color={filtroEstadoEntrevista === '' ? 'primary' : 'default'}
            variant={filtroEstadoEntrevista === '' ? 'filled' : 'outlined'}
            onClick={() => onFiltroEstadoEntrevistaChange?.('')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            clickable
            size="small"
            icon={<EventIcon sx={{ fontSize: '15px !important', color: filtroEstadoEntrevista === 'programada' ? '#fff !important' : '#2563eb !important' }} />}
            label="📅 Ver Solo Citas Programadas"
            color={filtroEstadoEntrevista === 'programada' ? 'primary' : 'default'}
            variant={filtroEstadoEntrevista === 'programada' ? 'filled' : 'outlined'}
            onClick={() => onFiltroEstadoEntrevistaChange?.(filtroEstadoEntrevista === 'programada' ? '' : 'programada')}
            sx={{
              fontWeight: 800,
              bgcolor: filtroEstadoEntrevista === 'programada' ? '#2563eb !important' : undefined,
              color: filtroEstadoEntrevista === 'programada' ? '#fff !important' : undefined,
              borderColor: alpha('#2563eb', 0.4),
            }}
          />
          <Chip
            clickable
            size="small"
            icon={<HourglassIcon sx={{ fontSize: '14px !important', color: filtroEstadoEntrevista === 'pendiente' ? '#fff !important' : '#d97706 !important' }} />}
            label="⏳ Pendientes de Entrevista"
            color={filtroEstadoEntrevista === 'pendiente' ? 'warning' : 'default'}
            variant={filtroEstadoEntrevista === 'pendiente' ? 'filled' : 'outlined'}
            onClick={() => onFiltroEstadoEntrevistaChange?.(filtroEstadoEntrevista === 'pendiente' ? '' : 'pendiente')}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            clickable
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: filtroEstadoEntrevista === 'aprobada' ? '#fff !important' : '#059669 !important' }} />}
            label="✅ Entrevistas Aprobadas"
            color={filtroEstadoEntrevista === 'aprobada' ? 'success' : 'default'}
            variant={filtroEstadoEntrevista === 'aprobada' ? 'filled' : 'outlined'}
            onClick={() => onFiltroEstadoEntrevistaChange?.(filtroEstadoEntrevista === 'aprobada' ? '' : 'aprobada')}
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>

      {/* CONTENIDO DE HERMANOS */}
      {loadingHermanos ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton height={280} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : familiasAgrupadas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '18px',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <StarIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            No se encontraron postulantes hermanos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Los hermanos nuevos registrados por los padres de familia aparecerán listados aquí.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {familiasAgrupadas.map((fam) => {
            const esMultiHermano = fam.hermanos.length > 1;
            const primerHermano = fam.hermanos[0];
            const esEsperaGlobal = fam.hermanos.some((h) => h.estado === 'en_espera');

            // Determinar estado de entrevista de la familia
            const todosAprobados = fam.hermanos.every(
              (h) => h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada'
            );
            const algunNoAsistio = fam.hermanos.some((h) => h.estado_entrevista === 'no_asistio');
            const algunProgramada = fam.hermanos.some((h) => h.estado_entrevista === 'programada');
            const estadoEntrevistaGlobal = todosAprobados
              ? 'aprobada'
              : algunNoAsistio
              ? 'no_asistio'
              : algunProgramada
              ? 'programada'
              : 'pendiente';

            const cardBorderColor = esMultiHermano
              ? isDark ? 'rgba(99, 102, 241, 0.55)' : '#818cf8'
              : esEsperaGlobal
              ? isDark ? 'rgba(245, 158, 11, 0.55)' : '#fcd34d'
              : isDark ? 'rgba(16, 185, 129, 0.55)' : '#86efac';

            return (
              <Grid
                key={fam.key}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Fade in timeout={300}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      border: `1.5px solid ${cardBorderColor}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      boxShadow: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 10px 20px ${alpha(
                          esMultiHermano ? '#6366f1' : esEsperaGlobal ? '#f59e0b' : '#10b981',
                          0.18
                        )}`,
                        borderColor: esMultiHermano ? '#6366f1' : esEsperaGlobal ? '#f59e0b' : '#10b981',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Badges superiores y acción rápida */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1.2,
                          gap: 0.8,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                          {esMultiHermano ? (
                            <Chip
                              size="small"
                              icon={<FamilyIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                              label={`Familia · ${fam.hermanos.length} Hermanos`}
                              sx={{
                                bgcolor: '#4f46e5',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                height: 22,
                              }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              icon={
                                esEsperaGlobal ? (
                                  <WarningAmberIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />
                                ) : (
                                  <CheckCircleIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />
                                )
                              }
                              label={
                                esEsperaGlobal
                                  ? `Lista Espera #${primerHermano.posicion_espera || 1}`
                                  : 'Cupo Confirmado'
                              }
                              sx={{
                                bgcolor: esEsperaGlobal ? '#f59e0b' : '#10b981',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                height: 22,
                              }}
                            />
                          )}

                          <Chip
                            size="small"
                            icon={<StarIcon sx={{ fontSize: '12px !important', color: isDark ? '#000 !important' : '#fff !important' }} />}
                            label="Prioridad"
                            sx={{
                              bgcolor: isDark ? '#facc15' : '#0288d1',
                              color: isDark ? '#000' : '#fff',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              height: 22,
                            }}
                          />

                          <Chip
                            size="small"
                            icon={
                              estadoEntrevistaGlobal === 'aprobada' ? (
                                <CheckCircleIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />
                              ) : estadoEntrevistaGlobal === 'no_asistio' ? (
                                <WarningAmberIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />
                              ) : estadoEntrevistaGlobal === 'programada' ? (
                                <EventIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />
                              ) : (
                                <HourglassIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />
                              )
                            }
                            label={
                              estadoEntrevistaGlobal === 'aprobada'
                                ? 'Entrevista Aprobada'
                                : estadoEntrevistaGlobal === 'no_asistio'
                                ? 'No Asistió'
                                : estadoEntrevistaGlobal === 'programada'
                                ? primerHermano.fecha_entrevista_formateada
                                  ? `Cita: ${primerHermano.fecha_entrevista_formateada}`
                                  : 'Cita Programada'
                                : 'Entrevista Pendiente'
                            }
                            sx={{
                              bgcolor:
                                estadoEntrevistaGlobal === 'aprobada'
                                  ? '#059669'
                                  : estadoEntrevistaGlobal === 'no_asistio'
                                  ? '#dc2626'
                                  : estadoEntrevistaGlobal === 'programada'
                                  ? '#2563eb'
                                  : '#d97706',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              height: 22,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Estudiante Regular Vinculado y Tutor de la Familia */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          mb: 1.2,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0.8 }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ fontSize: '0.7rem' }}>
                              Hermano(s) del Regular:
                            </Typography>
                            <Typography variant="body2" fontWeight={800} noWrap color={isDark ? '#e2e8f0' : '#1e293b'} sx={{ fontSize: '0.82rem' }}>
                              {fam.regular_nombre_completo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              Cód: <strong>{fam.regular_codigo}</strong> {fam.regular_ci ? `· CI: ${fam.regular_ci}` : ''}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ fontSize: '0.7rem' }}>
                              Tutor: {fam.tutor_nombre}
                            </Typography>
                            <Typography variant="caption" color="#10b981" fontWeight={700} display="block" sx={{ fontSize: '0.72rem' }}>
                              📱 {fam.tutor_telefono}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Banner Destacado cuando la entrevista está Programada */}
                      {estadoEntrevistaGlobal === 'programada' && primerHermano.fecha_entrevista_formateada && (
                        <Box
                          sx={{
                            p: 1.2,
                            mb: 1.2,
                            borderRadius: '10px',
                            bgcolor: isDark ? alpha('#2563eb', 0.16) : alpha('#2563eb', 0.07),
                            border: `1.5px solid ${alpha('#2563eb', 0.35)}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.4,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <EventIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                              <Typography variant="subtitle2" fontWeight={800} color="#2563eb" sx={{ fontSize: '0.78rem' }}>
                                Cita: {primerHermano.fecha_entrevista_formateada}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={primerHermano.modalidad_entrevista === 'virtual' ? '🌐 Virtual' : '📍 Presencial'}
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                bgcolor: alpha('#2563eb', 0.15),
                                color: isDark ? '#93c5fd' : '#1d4ed8',
                              }}
                            />
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
                            <strong>Lugar / Enlace:</strong> {primerHermano.modalidad_entrevista === 'virtual' ? (primerHermano.enlace_entrevista || 'Por definir') : (primerHermano.lugar_entrevista || 'Dirección del Colegio - Oficina Principal')}
                          </Typography>

                          {primerHermano.observaciones_entrevista && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem', fontStyle: 'italic', lineHeight: 1.2 }}>
                              <strong>Nota:</strong> {primerHermano.observaciones_entrevista}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Lista de Hermanos Postulantes en esta Familia */}
                      {esMultiHermano ? (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={800}
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.8, display: 'block', fontSize: '0.7rem' }}
                          >
                            Hijos convocados a la entrevista ({fam.hermanos.length}):
                          </Typography>
                          <Stack
                            spacing={0.8}
                            sx={{
                              maxHeight: 185,
                              overflowY: 'auto',
                              pr: 0.5,
                              '&::-webkit-scrollbar': { width: '4px' },
                              '&::-webkit-scrollbar-thumb': {
                                bgcolor: alpha(isDark ? '#fff' : '#000', 0.2),
                                borderRadius: '4px',
                              },
                            }}
                          >
                            {fam.hermanos.map((h) => {
                              const esEspera = h.estado === 'en_espera';
                              return (
                                <Box
                                  key={h.id}
                                  sx={{
                                    p: '6px 10px',
                                    borderRadius: '10px',
                                    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                    border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                                    <Avatar
                                      sx={{
                                        width: 26,
                                        height: 26,
                                        bgcolor: esEspera ? alpha('#f59e0b', 0.2) : alpha('#10b981', 0.2),
                                        color: esEspera ? '#d97706' : '#10b981',
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        border: `1px solid ${esEspera ? '#f59e0b' : '#10b981'}`,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {getInitials(h.nombres, h.apellido_paterno)}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight={800}
                                        noWrap
                                        sx={{ color: 'text.primary', fontSize: '0.8rem', lineHeight: 1.2 }}
                                      >
                                        {h.nombres} {h.apellido_paterno}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                        display="block"
                                        sx={{ fontSize: '0.68rem', lineHeight: 1.1 }}
                                      >
                                        {h.ci ? `${h.ci} · ` : ''}{h.grado_solicitado_nombre || h.grado_nombre} ({h.turno_solicitado_nombre || h.turno_nombre || 'Mañana'})
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                    <Chip
                                      size="small"
                                      label={esEspera ? `Esp #${h.posicion_espera || 1}` : 'Confirmado'}
                                      sx={{
                                        bgcolor: esEspera ? alpha('#f59e0b', 0.15) : alpha('#10b981', 0.15),
                                        color: esEspera ? '#d97706' : '#059669',
                                        fontWeight: 800,
                                        fontSize: '0.65rem',
                                        height: 20,
                                        px: 0.3,
                                      }}
                                    />
                                    {esEspera && (
                                      <Tooltip title="Promover cupo">
                                        <IconButton
                                          size="small"
                                          color="success"
                                          disabled={promoviendoHermanoId === h.id}
                                          onClick={() => onPromoverHermano(h)}
                                          sx={{ p: 0.3 }}
                                        >
                                          {promoviendoHermanoId === h.id ? (
                                            <CircularProgress size={12} color="inherit" />
                                          ) : (
                                            <HowToRegIcon sx={{ fontSize: 14 }} />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    <Tooltip title={`Recibo PDF (${h.nombres})`}>
                                      <IconButton
                                        size="small"
                                        onClick={() => onDescargarPDF(h.codigo_reserva)}
                                        sx={{ p: 0.3, color: '#ef4444' }}
                                      >
                                        <PdfIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title={`Eliminar cupo (${h.nombres})`}>
                                      <IconButton
                                        size="small"
                                        onClick={() => onEliminarHermano(h)}
                                        sx={{
                                          p: 0.3,
                                          color: '#94a3b8',
                                          '&:hover': { color: '#ef4444' },
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>
                      ) : (
                        <>
                          {/* Datos del Hermano Postulante Individual */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: esEsperaGlobal ? alpha('#f59e0b', 0.2) : alpha('#10b981', 0.2),
                                color: esEsperaGlobal ? '#d97706' : '#10b981',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                border: `1.5px solid ${esEsperaGlobal ? '#f59e0b' : '#10b981'}`,
                              }}
                            >
                              {getInitials(primerHermano.nombres, primerHermano.apellido_paterno)}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
                                {primerHermano.nombres} {primerHermano.apellido_paterno} {primerHermano.apellido_materno || ''}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                CI: <strong>{primerHermano.ci || 'Sin CI registrado'}</strong> · Cupo: <strong>{primerHermano.codigo_reserva}</strong>
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 1.5 }} />

                          {/* Grado y Turno Solicitado */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                              Grado y Turno Solicitado para 2027:
                            </Typography>
                            <Typography variant="body2" fontWeight={800} color={isDark ? '#facc15' : '#01579b'}>
                              {primerHermano.grado_solicitado_nombre || primerHermano.grado_nombre} (
                              {primerHermano.nivel_solicitado_nombre || primerHermano.nivel_nombre || 'Nivel'})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Turno: <strong>{primerHermano.turno_solicitado_nombre || primerHermano.turno_nombre || 'Mañana'}</strong>
                            </Typography>
                          </Box>
                        </>
                      )}

                      {/* Botones de Acción de la Familia */}
                      <Stack spacing={1} sx={{ mt: 'auto' }}>
                        {/* Botón Principal de Agendar / Reprogramar Entrevista */}
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={
                            estadoEntrevistaGlobal === 'programada' ? (
                              <EditCalendarIcon />
                            ) : (
                              <EventIcon />
                            )
                          }
                          onClick={() => onAgendarEntrevista?.(primerHermano)}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 800,
                            py: 0.9,
                            background:
                              estadoEntrevistaGlobal === 'programada'
                                ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                : estadoEntrevistaGlobal === 'aprobada'
                                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                : esMultiHermano
                                ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            boxShadow: esMultiHermano
                              ? '0 4px 15px rgba(79, 70, 229, 0.3)'
                              : '0 4px 15px rgba(2, 136, 209, 0.25)',
                          }}
                        >
                          {esMultiHermano
                            ? estadoEntrevistaGlobal === 'programada'
                              ? '✏️ Reprogramar Cita Familiar'
                              : estadoEntrevistaGlobal === 'aprobada'
                              ? '✅ Entrevista Familiar Aprobada (Ver)'
                              : `📅 Agendar Cita Familiar (${fam.hermanos.length} Hermanos)`
                            : estadoEntrevistaGlobal === 'programada'
                            ? '✏️ Reprogramar Cita'
                            : estadoEntrevistaGlobal === 'aprobada'
                            ? '✅ Entrevista Aprobada (Ver)'
                            : '📅 Agendar Entrevista'}
                        </Button>

                        {/* Botón de promover para cupo individual en espera */}
                        {!esMultiHermano && esEsperaGlobal && (
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={promoviendoHermanoId === primerHermano.id}
                            startIcon={
                              promoviendoHermanoId === primerHermano.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <HowToRegIcon />
                              )
                            }
                            onClick={() => onPromoverHermano(primerHermano)}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 800,
                              py: 0.9,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            {promoviendoHermanoId === primerHermano.id ? 'Asignando Cupo...' : 'Promover / Confirmar Cupo'}
                          </Button>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8, pt: 0.5, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<WhatsAppIcon sx={{ color: '#16a34a' }} />}
                            onClick={() => handleAbrirWhatsAppFamilia(fam)}
                            sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary' }}
                          >
                            {esMultiHermano ? 'WhatsApp Familiar' : 'WhatsApp'}
                          </Button>

                          {!esMultiHermano && (
                            <>
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<PdfIcon sx={{ color: '#ef4444' }} />}
                                onClick={() => onDescargarPDF(primerHermano.codigo_reserva)}
                                sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary' }}
                              >
                                Recibo PDF
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon sx={{ fontSize: '15px !important' }} />}
                                onClick={() => onEliminarHermano(primerHermano)}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  borderColor: alpha('#ef4444', 0.4),
                                  color: '#ef4444',
                                  px: 1.2,
                                  py: 0.3,
                                  '&:hover': {
                                    borderColor: '#ef4444',
                                    bgcolor: alpha('#ef4444', 0.08),
                                  },
                                }}
                              >
                                Eliminar Cupo
                              </Button>
                            </>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
export default HermanosTab;

