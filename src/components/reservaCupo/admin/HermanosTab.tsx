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
} from '@mui/icons-material';
import { ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { BtnDescarga, getInitials, usePalette } from './common';

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
      ) : hermanosList.length === 0 ? (
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
          {hermanosList.map((h) => {
            const esEspera = h.estado === 'en_espera';
            const cardBorder = esEspera
              ? isDark ? 'rgba(245, 158, 11, 0.6)' : '#fcd34d'
              : isDark ? 'rgba(16, 185, 129, 0.6)' : '#86efac';
            const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff';

            return (
              <Grid key={h.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Fade in timeout={300}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: `1px solid ${
                        esEspera
                          ? alpha('#f59e0b', 0.45)
                          : alpha('#10b981', 0.45)
                      }`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      boxShadow: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 10px 22px ${alpha(esEspera ? '#f59e0b' : '#10b981', 0.2)}`,
                        borderColor: esEspera ? '#f59e0b' : '#10b981',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Badges superiores y acción rápida */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            icon={esEspera ? <WarningAmberIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} /> : <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
                            label={esEspera ? `Lista de Espera · Puesto #${h.posicion_espera || 1}` : 'Cupo Directo Confirmado'}
                            sx={{
                              bgcolor: esEspera ? '#f59e0b' : '#10b981',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                            }}
                          />
                          <Chip
                            size="small"
                            icon={<StarIcon sx={{ fontSize: '13px !important', color: isDark ? '#000 !important' : '#fff !important' }} />}
                            label="Prioridad Familiar"
                            sx={{
                              bgcolor: isDark ? '#facc15' : '#0288d1',
                              color: isDark ? '#000' : '#fff',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                            }}
                          />
                          <Chip
                            size="small"
                            icon={
                              h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada' ? (
                                <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />
                              ) : h.estado_entrevista === 'no_asistio' ? (
                                <WarningAmberIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />
                              ) : h.estado_entrevista === 'programada' ? (
                                <EventIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />
                              ) : (
                                <HourglassIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />
                              )
                            }
                            label={
                              h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada'
                                ? 'Entrevista Aprobada'
                                : h.estado_entrevista === 'no_asistio'
                                ? 'No Asistió a Entrevista'
                                : h.estado_entrevista === 'programada'
                                ? `Cita: ${h.fecha_entrevista_formateada || 'Programada'}`
                                : 'Entrevista Pendiente'
                            }
                            sx={{
                              bgcolor:
                                h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada'
                                  ? '#059669'
                                  : h.estado_entrevista === 'no_asistio'
                                  ? '#dc2626'
                                  : h.estado_entrevista === 'programada'
                                  ? '#2563eb'
                                  : '#d97706',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        <Tooltip title="Eliminar este cupo de hermano (ej. duplicados)">
                          <IconButton
                            size="small"
                            onClick={() => onEliminarHermano(h)}
                            sx={{
                              color: '#ef4444',
                              bgcolor: alpha('#ef4444', 0.08),
                              borderRadius: '8px',
                              p: 0.6,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha('#ef4444', 0.2),
                                transform: 'scale(1.08)',
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Datos del Hermano Postulante */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: esEspera ? alpha('#f59e0b', 0.2) : alpha('#10b981', 0.2),
                            color: esEspera ? '#d97706' : '#10b981',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            border: `1.5px solid ${esEspera ? '#f59e0b' : '#10b981'}`,
                          }}
                        >
                          {getInitials(h.nombres, h.apellido_paterno)}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
                            {h.nombres} {h.apellido_paterno} {h.apellido_materno || ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            CI: <strong>{h.ci || 'Sin CI registrado'}</strong> · Cód: <strong>{h.codigo_reserva}</strong>
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Grado y Turno Solicitado */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                          Grado y Turno Solicitado para 2027:
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color={isDark ? '#facc15' : '#01579b'}>
                          {h.grado_solicitado_nombre || h.grado_nombre} ({h.nivel_solicitado_nombre || h.nivel_nombre || 'Nivel'})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Turno: <strong>{h.turno_solicitado_nombre || h.turno_nombre || 'Mañana'}</strong>
                        </Typography>
                      </Box>

                      {/* Estudiante Regular Vinculado */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                          Hermano del Estudiante Regular:
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {h.regular_nombre_completo || [h.regular_nombres, h.regular_apellidos].filter(Boolean).join(' ') || 'Estudiante Regular'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cód: {h.regular_codigo} · CI: {h.regular_ci || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Tutor */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                          Tutor: {h.tutor_nombre} ({h.tutor_parentesco})
                        </Typography>
                        <Typography variant="caption" color="#10b981" fontWeight={700}>
                          📱 {h.tutor_telefono}
                        </Typography>
                      </Box>

                      {/* Botones de Acción */}
                      <Stack spacing={1} sx={{ mt: 'auto' }}>
                        {/* Botón de Gestión de Entrevista */}
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<EventIcon />}
                          onClick={() => onAgendarEntrevista?.(h)}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 800,
                            py: 0.8,
                            background:
                              h.estado_entrevista === 'programada'
                                ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                : h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada'
                                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            boxShadow: '0 4px 15px rgba(2, 136, 209, 0.25)',
                          }}
                        >
                          {h.estado_entrevista === 'programada'
                            ? `📅 Reprogramar (${h.fecha_entrevista_formateada || 'Ver Cita'})`
                            : h.estado_entrevista === 'aprobada' || h.estado_entrevista === 'realizada'
                            ? '✅ Entrevista Aprobada (Ver)'
                            : '📅 Agendar Entrevista'}
                        </Button>

                        {esEspera && (
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={promoviendoHermanoId === h.id}
                            startIcon={promoviendoHermanoId === h.id ? <CircularProgress size={16} color="inherit" /> : <HowToRegIcon />}
                            onClick={() => onPromoverHermano(h)}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 800,
                              py: 0.9,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            {promoviendoHermanoId === h.id ? 'Asignando Cupo...' : 'Promover / Confirmar Cupo'}
                          </Button>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8, pt: 0.5, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<WhatsAppIcon sx={{ color: '#16a34a' }} />}
                            onClick={() => {
                              const tel = (h.tutor_telefono || '').replace(/\D/g, '');
                              const num = tel.startsWith('591') ? tel : `591${tel}`;
                              const txt = encodeURIComponent(
                                `Estimado/a ${h.tutor_nombre}, le contactamos del colegio La Voz de Cristo referente a la solicitud de cupo de ${h.nombres} ${h.apellido_paterno} (Código: ${h.codigo_reserva}).`
                              );
                              window.open(`https://api.whatsapp.com/send?phone=${num}&text=${txt}`, '_blank');
                            }}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}
                          >
                            WhatsApp
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<PdfIcon sx={{ color: '#ef4444' }} />}
                            onClick={() => onDescargarPDF(h.codigo_reserva)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}
                          >
                            Recibo PDF
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon sx={{ fontSize: '15px !important' }} />}
                            onClick={() => onEliminarHermano(h)}
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
