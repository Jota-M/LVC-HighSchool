// src/components/reservaCupo/admin/CentroReportesTab.tsx
import React from 'react';
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
} from '@mui/material';
import {
  SummarizeRounded as SummarizeRoundedIcon,
  Schedule as ScheduleIcon,
  SchoolRounded as SchoolRoundedIcon,
  AccountTreeRounded as AccountTreeRoundedIcon,
  CancelOutlined as CancelIcon,
  WarningAmber as WarningAmberIcon,
  PersonSearchRounded as PersonSearchRoundedIcon,
  Star as StarIcon,
  TuneRounded as TuneRoundedIcon,
  PictureAsPdfRounded as PictureAsPdfRoundedIcon,
  TableChartRounded as TableChartRoundedIcon,
  Search as SearchIcon,
  ChevronRightRounded as ChevronRightIcon,
  CheckCircleRounded as CheckCircleIcon,
} from '@mui/icons-material';
import { BtnDescarga, usePalette } from './common';

export interface ReporteDef {
  id: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge?: string;
  filtros: Array<'grado' | 'nivel' | 'turno' | 'search'>;
}

export const REPORTES_DISPONIBLES: ReporteDef[] = [
  {
    id: 'general',
    titulo: 'Reporte General Consolidado 2027',
    descripcion: 'Nómina oficial completa con estadísticas globales de todos los estudiantes regulares reservados.',
    icon: <SummarizeRoundedIcon />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    badge: 'Oficial',
    filtros: ['turno', 'search'],
  },
  {
    id: 'por_grado_turno',
    titulo: 'Nómina por Grado y Turno',
    descripcion: 'Listado nominal oficial filtrado por curso y turno específico (ej: 1ro Mañana o 1ro Tarde), con totales por jornada.',
    icon: <ScheduleIcon />,
    color: '#0288d1',
    gradient: 'linear-gradient(135deg, #0288d1, #38bdf8)',
    badge: 'Por Turno',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'por_grado',
    titulo: 'Nómina por Grado Destino',
    descripcion: 'Listado nominal exclusivo de los estudiantes que avanzan a un curso específico (Pre-Kínder a 6to Secundaria).',
    icon: <SchoolRoundedIcon />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'por_nivel',
    titulo: 'Reporte por Nivel Educativo',
    descripcion: 'Agrupación clasificada por Nivel Inicial, Primaria o Secundaria con conteo de cupos y subtotales.',
    icon: <AccountTreeRoundedIcon />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    filtros: ['nivel', 'search'],
  },
  {
    id: 'no_continua',
    titulo: 'Constancias de No Continuidad 2027',
    descripcion: 'Padrón de estudiantes regulares que declararon no continuar en el colegio, con motivos y cupos liberados.',
    icon: <CancelIcon />,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    badge: 'Liberados',
    filtros: ['grado', 'nivel', 'turno', 'search'],
  },
  {
    id: 'anulaciones',
    titulo: 'Reporte de Solicitudes y Bajas de Cupo',
    descripcion: 'Control administrativo de solicitudes de anulación y reservas canceladas por los padres o secretaría.',
    icon: <WarningAmberIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    badge: 'Bajas',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'contacto_tutores',
    titulo: 'Padrón de Contacto de Tutores',
    descripcion: 'Directorio de padres y tutores que realizaron la reserva, con teléfonos WhatsApp y documentos de identidad.',
    icon: <PersonSearchRoundedIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    badge: 'Contacto',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'hermanos',
    titulo: 'Padrón de Hermanos Nuevos (Prioridad Familiar)',
    descripcion: 'Nómina oficial completa de hermanitos postulantes para 2027: cupos confirmados y lista de espera con datos del hermano regular.',
    icon: <StarIcon />,
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308, #f59e0b)',
    badge: 'Hermanos',
    filtros: ['grado', 'turno', 'search'],
  },
  {
    id: 'hermanos_espera',
    titulo: 'Lista de Espera de Hermanos 2027',
    descripcion: 'Control prioritario de hermanitos postulantes en espera (Puesto #1, #2, ...) a la espera de liberación de vacantes.',
    icon: <StarIcon />,
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    badge: 'En Espera',
    filtros: ['grado', 'turno', 'search'],
  },
];

interface CentroReportesTabProps {
  reporteSeleccionado: ReporteDef;
  onSeleccionarReporte: (rep: ReporteDef) => void;
  repGradoId: number | '';
  onRepGradoChange: (val: number | '') => void;
  repNivelId: number | '';
  onRepNivelChange: (val: number | '') => void;
  repTurnoId: number | '';
  onRepTurnoChange: (val: number | '') => void;
  repSearch: string;
  onRepSearchChange: (val: string) => void;
  grados: any[];
  turnos: any[];
  nivelesAcademicos: Array<{ id: number; nombre: string }>;
  descargandoPdf: boolean;
  descargandoExcel: boolean;
  onDescargar: (formato: 'pdf' | 'excel') => void;
}

export const CentroReportesTab: React.FC<CentroReportesTabProps> = ({
  reporteSeleccionado,
  onSeleccionarReporte,
  repGradoId,
  onRepGradoChange,
  repNivelId,
  onRepNivelChange,
  repTurnoId,
  onRepTurnoChange,
  repSearch,
  onRepSearchChange,
  grados,
  turnos,
  nivelesAcademicos,
  descargandoPdf,
  descargandoExcel,
  onDescargar,
}) => {
  const { theme, isDark, gold: accentColor, gradBg } = usePalette();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* IZQUIERDA: CATÁLOGO DE REPORTES */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={800}>
              Catálogo de Reportes Oficiales
            </Typography>
            <Chip
              label={`${REPORTES_DISPONIBLES.length} formatos`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.68rem',
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              }}
            />
          </Box>

          <Grid container spacing={2}>
            {REPORTES_DISPONIBLES.map((rep) => {
              const seleccionado = reporteSeleccionado.id === rep.id;
              return (
                <Grid key={rep.id} size={{ xs: 12, sm: 6 }}>
                  <Fade in timeout={300}>
                    <Card
                      onClick={() => onSeleccionarReporte(rep)}
                      sx={{
                        height: '100%',
                        borderRadius: '18px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: `1.5px solid ${seleccionado ? rep.color : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                        bgcolor: seleccionado
                          ? alpha(rep.color, isDark ? 0.12 : 0.06)
                          : isDark
                            ? alpha('#fff', 0.02)
                            : '#ffffff',
                        boxShadow: seleccionado
                          ? `0 10px 24px ${alpha(rep.color, 0.25)}`
                          : isDark
                            ? '0 4px 14px rgba(0,0,0,0.2)'
                            : '0 4px 14px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          borderColor: rep.color,
                          boxShadow: `0 12px 26px ${alpha(rep.color, 0.22)}`,
                          '& .btn-gestionar': {
                            backgroundColor: alpha(rep.color, 0.18),
                            borderColor: rep.color,
                            transform: 'translateX(2px)',
                          },
                        },
                      }}
                    >
                      {/* Badge superior izquierdo */}
                      <Chip
                        label={rep.badge || 'Oficial'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          zIndex: 1,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                          bgcolor: alpha(rep.color, 0.15),
                          color: rep.color,
                          border: `1px solid ${alpha(rep.color, 0.35)}`,
                        }}
                      />

                      {/* Chips derecha */}
                      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', gap: 0.6 }}>
                        {seleccionado && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: `${rep.color} !important` }} />}
                            label="Activo"
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              height: 22,
                              bgcolor: alpha(rep.color, 0.18),
                              color: rep.color,
                              border: `1px solid ${alpha(rep.color, 0.35)}`,
                            }}
                          />
                        )}
                        <Chip
                          label="2027"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 22,
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                            color: 'text.secondary',
                            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 2.2, pt: 4.8, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Icono Avatar centrado 64x64 */}
                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            sx={{
                              width: 64,
                              height: 64,
                              margin: '0 auto',
                              background: rep.gradient,
                              color: '#ffffff',
                              boxShadow: `0 8px 18px ${alpha(rep.color, 0.35)}`,
                              border: `3px solid ${alpha(rep.color, 0.25)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '& svg': { fontSize: 32 },
                            }}
                          >
                            {rep.icon}
                          </Avatar>
                        </Box>

                        {/* Título del Reporte */}
                        <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ fontSize: '1.02rem', lineHeight: 1.25, mb: 0.5 }}>
                          {rep.titulo}
                        </Typography>

                        {/* Descripción */}
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4, mb: 1.5, flex: 1 }}>
                          {rep.descripcion}
                        </Typography>

                        {/* Botón de acción directo .btn-gestionar */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', pt: 1.2, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}>
                          <Button
                            className="btn-gestionar"
                            size="small"
                            variant="outlined"
                            endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              px: 1.8,
                              py: 0.4,
                              borderColor: alpha(rep.color, 0.4),
                              color: rep.color,
                              bgcolor: alpha(rep.color, 0.08),
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {seleccionado ? 'Configurando Ahora' : 'Seleccionar Reporte'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* DERECHA: PANEL DE CONFIGURACIÓN Y DESCARGA */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#ffffff',
              border: `1.5px solid ${alpha(reporteSeleccionado.color, 0.35)}`,
              boxShadow: isDark
                ? `0 10px 30px ${alpha(reporteSeleccionado.color, 0.15)}`
                : `0 10px 25px ${alpha(reporteSeleccionado.color, 0.08)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: reporteSeleccionado.gradient,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <TuneRoundedIcon sx={{ color: reporteSeleccionado.color }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: reporteSeleccionado.color }}>
                Configurar y Descargar
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
              Genera el documento en formato oficial para la <strong>Gestión 2027</strong> con encabezado institucional, sellos y tablas comparativas.
            </Typography>

            <Stack spacing={2.5}>
              {reporteSeleccionado.filtros.includes('nivel') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Nivel Educativo</InputLabel>
                  <Select
                    value={repNivelId}
                    label="Nivel Educativo"
                    onChange={(e) => onRepNivelChange(e.target.value as number | '')}
                    sx={{
                      borderRadius: '14px',
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(reporteSeleccionado.color, 0.4),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: reporteSeleccionado.color,
                      },
                    }}
                  >
                    <MenuItem value="">Todos los Niveles</MenuItem>
                    {nivelesAcademicos.map((n) => (
                      <MenuItem key={n.id} value={n.id}>
                        {n.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {reporteSeleccionado.filtros.includes('grado') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Grado Destino 2027</InputLabel>
                  <Select
                    value={repGradoId}
                    label="Grado Destino 2027"
                    onChange={(e) => onRepGradoChange(e.target.value as number | '')}
                    sx={{
                      borderRadius: '14px',
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(reporteSeleccionado.color, 0.4),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: reporteSeleccionado.color,
                      },
                    }}
                  >
                    <MenuItem value="">Todos los Grados</MenuItem>
                    {grados.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {reporteSeleccionado.filtros.includes('turno') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Turno Escolar</InputLabel>
                  <Select
                    value={repTurnoId}
                    label="Turno Escolar"
                    onChange={(e) => onRepTurnoChange(e.target.value as number | '')}
                    sx={{
                      borderRadius: '14px',
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(reporteSeleccionado.color, 0.4),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: reporteSeleccionado.color,
                      },
                    }}
                  >
                    <MenuItem value="">Todos los Turnos (Mañana y Tarde)</MenuItem>
                    {turnos.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.nombre.toLowerCase().includes('mañana') ? '☀️ ' : '🌅 '}
                        Turno {t.nombre} {t.hora_inicio && t.hora_fin ? `(${t.hora_inicio.slice(0, 5)} - ${t.hora_fin.slice(0, 5)})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {reporteSeleccionado.filtros.includes('search') && (
                <TextField
                  fullWidth
                  size="small"
                  label="Filtrar por estudiante, CI o tutor (opcional)"
                  value={repSearch}
                  onChange={(e) => onRepSearchChange(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      '&:hover fieldset': {
                        borderColor: alpha(reporteSeleccionado.color, 0.4),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: reporteSeleccionado.color,
                      },
                    },
                  }}
                />
              )}

              <Box
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                  Parámetros de Emisión:
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Gestión: <strong>2027</strong> · Tipo: <strong>Estudiantes Regulares</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Grado: <strong>{repGradoId ? grados.find((g) => g.id === repGradoId)?.nombre : 'Consolidado Global'}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Turno: <strong>{repTurnoId ? `Turno ${turnos.find((t) => t.id === repTurnoId)?.nombre}` : 'Todos los Turnos (Mañana y Tarde)'}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Nivel: <strong>{repNivelId ? nivelesAcademicos.find((n) => n.id === repNivelId)?.nombre : 'Todos los Niveles'}</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <BtnDescarga
                  label="Descargar PDF"
                  icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 22 }} />}
                  color="#ef4444"
                  gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                  loading={descargandoPdf}
                  disabled={descargandoExcel}
                  onClick={() => onDescargar('pdf')}
                />

                <BtnDescarga
                  label="Descargar Excel"
                  icon={<TableChartRoundedIcon sx={{ fontSize: 22 }} />}
                  color="#10b981"
                  gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                  loading={descargandoExcel}
                  disabled={descargandoPdf}
                  onClick={() => onDescargar('excel')}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default CentroReportesTab;
