// src/app/dashboard/reserva-cupos/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  useTheme,
  Fade,
  keyframes,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Skeleton,
  Stack,
  Divider,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  BookmarkAdded as BookmarkAddedIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  ListAlt as ListAltIcon,
  Clear as ClearIcon,
  Badge as BadgeIcon,
  TableChart as TableChartIcon,
  AutoStories as AutoStoriesIcon,
  Download as DownloadIcon,
  SummarizeRounded as SummarizeRoundedIcon,
  SchoolRounded as SchoolRoundedIcon,
  AccountTreeRounded as AccountTreeRoundedIcon,
  PersonSearchRounded as PersonSearchRoundedIcon,
  PictureAsPdfRounded as PictureAsPdfRoundedIcon,
  TableChartRounded as TableChartRoundedIcon,
  TuneRounded as TuneRoundedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import reservaCupoService from '@/services/reservaCupoService';
import { ReservaCupoData } from '@/types/reservaCupoTypes';
import { gestionAcademicaService } from '@/services/estudiantesService';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        background: isDark
          ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
          : `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `2px solid ${color}30`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${color}20`,
          borderColor: `${color}60`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          top: -10,
          opacity: 0.1,
          transform: 'rotate(15deg)',
          '& svg': { fontSize: 100 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}20`,
              '& svg': { fontSize: 24, color },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

// ── Botón Descarga institucional tipo Docente / Notas ─────────────────────────
const BtnDescarga: React.FC<{
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, icon, color, gradient, loading, onClick, disabled }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Button
      size="medium"
      onClick={onClick}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : icon}
      sx={{
        background: gradient,
        color: '#fff',
        fontWeight: 800,
        textTransform: 'none',
        borderRadius: '12px',
        px: 3,
        py: 1.1,
        boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
        transition: 'all 0.2s',
        '&:hover': {
          background: gradient,
          filter: 'brightness(1.08)',
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          background: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
          color: 'text.disabled',
          boxShadow: 'none',
        },
      }}
    >
      {loading ? 'Generando...' : label}
    </Button>
  );
};

// ── Tipos de Reportes disponibles (Catálogo idéntico a Reportes Docentes) ──────
interface ReporteDef {
  id: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge?: string;
  filtros: Array<'grado' | 'nivel' | 'search'>;
}

const REPORTES_DISPONIBLES: ReporteDef[] = [
  {
    id: 'general',
    titulo: 'Reporte General Consolidado 2027',
    descripcion: 'Nómina oficial completa con estadísticas globales de todos los estudiantes regulares reservados.',
    icon: <SummarizeRoundedIcon />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    badge: 'Oficial',
    filtros: ['search'],
  },
  {
    id: 'por_grado',
    titulo: 'Nómina por Grado Destino',
    descripcion: 'Listado nominal exclusivo de los estudiantes que avanzan a un curso específico (Pre-Kínder a 6to Secundaria).',
    icon: <SchoolRoundedIcon />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    filtros: ['grado', 'search'],
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
    id: 'contacto_tutores',
    titulo: 'Padrón de Contacto de Tutores',
    descripcion: 'Directorio de padres y tutores que realizaron la reserva, con teléfonos WhatsApp y documentos de identidad.',
    icon: <PersonSearchRoundedIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    badge: 'Contacto',
    filtros: ['grado', 'search'],
  },
];

export default function ReservaCuposDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  // 0: Lista de Reservas, 1: Reportes y Exportación, 2: Desglose por Grado
  const [activeTab, setActiveTab] = useState(0);

  // Por defecto en 'cards' como en el módulo de Estudiantes
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Datos
  const [reservas, setReservas] = useState<ReservaCupoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grados, setGrados] = useState<any[]>([]);

  // Filtros de la lista
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState<number | ''>('');
  const [nivelFilter, setNivelFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados de exportación rápida en cabecera
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);

  // Estados para el Tab de Reportes (Tipo Docente)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteDef>(REPORTES_DISPONIBLES[0]);
  const [repGradoId, setRepGradoId] = useState<number | ''>('');
  const [repNivelId, setRepNivelId] = useState<number | ''>('');
  const [repSearch, setRepSearch] = useState('');
  const [repDescargandoPdf, setRepDescargandoPdf] = useState(false);
  const [repDescargandoExcel, setRepDescargandoExcel] = useState(false);

  // Estadísticas cuantitativas
  const [stats, setStats] = useState({
    total_reservas: 0,
    total_inicial: 0,
    total_primaria: 0,
    total_secundaria: 0,
  });
  const [porGradoStats, setPorGradoStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Niveles académicos estándar
  const nivelesAcademicos = [
    { id: 1, nombre: 'Nivel Inicial' },
    { id: 2, nombre: 'Nivel Primaria' },
    { id: 3, nombre: 'Nivel Secundaria' },
  ];

  // Cargar grados para los selectores
  useEffect(() => {
    const cargarGrados = async () => {
      try {
        const data = await gestionAcademicaService.obtenerGrados();
        setGrados(data || []);
      } catch (err) {
        console.error('Error al cargar grados:', err);
      }
    };
    cargarGrados();
  }, []);

  // Cargar estadísticas globales
  const cargarEstadisticas = async () => {
    setLoadingStats(true);
    try {
      const data = await reservaCupoService.obtenerEstadisticas();
      if (data && data.resumen) {
        setStats({
          total_reservas: Number(data.resumen.total_reservas || 0),
          total_inicial: Number(data.resumen.total_inicial || 0),
          total_primaria: Number(data.resumen.total_primaria || 0),
          total_secundaria: Number(data.resumen.total_secundaria || 0),
        });
        setPorGradoStats(data.por_grado || []);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Cargar reservas
  const cargarReservas = async () => {
    setIsLoading(true);
    try {
      const data = await reservaCupoService.listarAdmin({
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
        page,
        limit: rowsPerPage,
      });

      if (data) {
        setReservas(data.reservas || []);
        if (data.paginacion) {
          setTotalItems(data.paginacion.total || 0);
          setTotalPages(data.paginacion.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error al listar reservas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [page, searchTerm, gradoFilter, nivelFilter]);

  // Manejo de exportación rápida (Cabecera)
  const handleExportarExcel = async () => {
    setExportandoExcel(true);
    try {
      await reservaCupoService.exportarReporte('excel', {
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
      });
      toast.success('Reporte Excel descargado correctamente');
    } catch (err) {
      console.error('Error al exportar a Excel:', err);
      toast.error('Error al exportar reporte a Excel.');
    } finally {
      setExportandoExcel(false);
    }
  };

  const handleExportarPDF = async () => {
    setExportandoPdf(true);
    try {
      await reservaCupoService.exportarReporte('pdf', {
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
      });
      toast.success('Reporte PDF descargado correctamente');
    } catch (err) {
      console.error('Error al exportar a PDF:', err);
      toast.error('Error al exportar reporte a PDF.');
    } finally {
      setExportandoPdf(false);
    }
  };

  // Manejo de descarga desde el Centro de Reportes (Tipo Docente)
  const handleDescargarReporteCentro = async (formato: 'pdf' | 'excel') => {
    const setLoader = formato === 'pdf' ? setRepDescargandoPdf : setRepDescargandoExcel;
    setLoader(true);
    try {
      await reservaCupoService.exportarReporte(formato, {
        search: repSearch.trim() || undefined,
        grado_destino_id: repGradoId ? Number(repGradoId) : undefined,
        nivel_destino_id: repNivelId ? Number(repNivelId) : undefined,
      });
      toast.success(`Reporte ${reporteSeleccionado.titulo} (${formato.toUpperCase()}) generado con éxito`);
    } catch (err) {
      console.error('Error al descargar reporte:', err);
      toast.error(`Error al generar el reporte en ${formato.toUpperCase()}`);
    } finally {
      setLoader(false);
    }
  };

  const handleDescargarPDF = (codigo: string) => {
    reservaCupoService.descargarPDF(codigo);
  };

  const handleImprimir = (codigo: string) => {
    const url = reservaCupoService.getReciboPDFUrl(codigo, true);
    window.open(url, '_blank');
  };

  const handleWhatsApp = (r: ReservaCupoData) => {
    const tel = r.tutor_telefono.replace(/\D/g, '');
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;
    const texto = encodeURIComponent(
      `Hola ${r.tutor_nombre}, le saludamos de la U.E.P. La Voz de Cristo respecto a la Reserva de Cupo de ${r.estudiante_nombre_completo} para la Gestión 2027 (Código: ${r.codigo_reserva}).`
    );
    window.open(`https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`, '_blank');
  };

  const getNivelColor = (nivel: string) => {
    const n = (nivel || '').toLowerCase();
    if (n.includes('inicial')) return '#ec4899';
    if (n.includes('primaria')) return '#10b981';
    if (n.includes('secundaria')) return '#6366f1';
    return '#0288d1';
  };

  const getInitials = (nombres?: string, paterno?: string) => {
    const n = nombres ? nombres.trim()[0] : '';
    const p = paterno ? paterno.trim()[0] : '';
    return `${n}${p}`.toUpperCase() || 'E';
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            {/* ══ HEADER (Estilo Estudiantes + Acciones) ══ */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 3,
              }}
            >
              {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BookmarkAddedIcon
                    sx={{
                      color: isDark ? '#facc15' : '#0288d1',
                      fontSize: 38,
                      animation: `${bounce} 1.5s infinite`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 800,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Reserva de Cupos 2027
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 0.3,
                    mt: 0.5,
                  }}
                >
                  Supervisa y gestiona la continuidad de estudiantes regulares. Exporta reportes oficiales en PDF y Excel como en notas.
                </Typography>
              </Box>

              {/* DERECHA: BOTONES DE EXPORTACIÓN TIPO DOCENTES + TOGGLE VIEW + NUEVO */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                {/* Botón Exportar Excel (Estilo Docentes) */}
                <BtnDescarga
                  label="Exportar Excel"
                  icon={<TableChartRoundedIcon sx={{ fontSize: 20 }} />}
                  color="#10b981"
                  gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                  loading={exportandoExcel}
                  disabled={exportandoPdf}
                  onClick={handleExportarExcel}
                />

                {/* Botón Exportar PDF (Estilo Docentes) */}
                <BtnDescarga
                  label="Exportar PDF"
                  icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 20 }} />}
                  color="#ef4444"
                  gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                  loading={exportandoPdf}
                  disabled={exportandoExcel}
                  onClick={handleExportarPDF}
                />

                {/* Toggle View Mode (Cards / Tabla) - Como en Estudiantes */}
                {activeTab === 0 && (
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                      borderRadius: '12px',
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: '10px',
                        px: 2,
                        py: 0.9,
                        fontWeight: 700,
                        '&.Mui-selected': {
                          bgcolor: isDark ? '#facc15' : '#0288d1',
                          color: isDark ? '#000' : '#fff',
                          '&:hover': {
                            bgcolor: isDark ? '#f59e0b' : '#01579b',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="cards">
                      <ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                      Cards
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableRowsIcon sx={{ mr: 0.5, fontSize: 18 }} />
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={() => {
                      cargarReservas();
                      cargarEstadisticas();
                    }}
                    sx={{
                      bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                      borderRadius: '12px',
                      p: 1.1,
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/reserva-cupo')}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 1.1,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                    boxShadow: isDark
                      ? '0 8px 25px rgba(250, 204, 21, 0.35)'
                      : '0 8px 25px rgba(1, 87, 155, 0.35)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Nueva Reserva
                </Button>
              </Box>
            </Box>

            {/* ══ STATS CARDS (4 TARJETAS) ══ */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Reservas"
                  value={loadingStats ? '...' : stats.total_reservas}
                  icon={<BookmarkAddedIcon />}
                  color={isDark ? '#facc15' : '#0288d1'}
                  subtitle="Gestión Académica 2027"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Nivel Inicial"
                  value={loadingStats ? '...' : stats.total_inicial}
                  icon={<SchoolIcon />}
                  color="#ec4899"
                  subtitle="Pre-Kínder y Kínder"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Nivel Primaria"
                  value={loadingStats ? '...' : stats.total_primaria}
                  icon={<AutoStoriesIcon />}
                  color="#10b981"
                  subtitle="1ro a 6to Primaria"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Nivel Secundaria"
                  value={loadingStats ? '...' : stats.total_secundaria}
                  icon={<AssessmentIcon />}
                  color="#6366f1"
                  subtitle="1ro a 6to Secundaria"
                />
              </Grid>
            </Grid>

            {/* ══ PESTAÑAS (TABS) ══ */}
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                p: 0.8,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    minHeight: 44,
                    borderRadius: '12px',
                    px: 3,
                  },
                  '& .Mui-selected': {
                    bgcolor: isDark ? alpha('#facc15', 0.15) : alpha('#0288d1', 0.1),
                    color: isDark ? '#facc15 !important' : '#0288d1 !important',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: isDark ? '#facc15' : '#0288d1',
                    height: 3,
                    borderRadius: '3px',
                  },
                }}
              >
                <Tab icon={<ListAltIcon sx={{ mr: 1 }} />} iconPosition="start" label="Lista de Reservas" />
                <Tab icon={<AssessmentIcon sx={{ mr: 1 }} />} iconPosition="start" label="Centro de Reportes y Exportación" />
                <Tab icon={<AutoStoriesIcon sx={{ mr: 1 }} />} iconPosition="start" label="Desglose por Grado" />
              </Tabs>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════════
                TAB 0: LISTA DE RESERVAS (CARDS POR DEFECTO O TABLA)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 0 && (
              <Box>
                {/* BARRA DE FILTROS Y BÚSQUEDA */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: '18px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por nombre, CI, código de reserva, tutor o teléfono..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: searchTerm ? (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setSearchTerm('')}>
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

                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Nivel Educativo</InputLabel>
                        <Select
                          value={nivelFilter}
                          label="Nivel Educativo"
                          onChange={(e) => {
                            setNivelFilter(e.target.value as number | '');
                            setPage(1);
                          }}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="">Todos los niveles</MenuItem>
                          {nivelesAcademicos.map((n) => (
                            <MenuItem key={n.id} value={n.id}>
                              {n.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Grado Destino</InputLabel>
                        <Select
                          value={gradoFilter}
                          label="Grado Destino"
                          onChange={(e) => {
                            setGradoFilter(e.target.value as number | '');
                            setPage(1);
                          }}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="">Todos los grados</MenuItem>
                          {grados.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                              {g.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        onClick={() => {
                          setSearchTerm('');
                          setGradoFilter('');
                          setNivelFilter('');
                          setPage(1);
                        }}
                        sx={{
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 0.9,
                        }}
                      >
                        Limpiar Filtros
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* CONTENIDO: CARDS (POR DEFECTO) O TABLA */}
                {isLoading ? (
                  <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Skeleton height={280} sx={{ borderRadius: '20px' }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : reservas.length === 0 ? (
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
                    <BookmarkAddedIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} color="text.secondary">
                      No se encontraron reservas de cupo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {searchTerm || gradoFilter || nivelFilter
                        ? 'Intenta ajustar los criterios de búsqueda o limpiar los filtros.'
                        : 'Aún no se han registrado reservas para la Gestión 2027.'}
                    </Typography>
                  </Paper>
                ) : viewMode === 'cards' ? (
                  /* ─── VISTA CARDS (Estilo exacto de Estudiantes) ─── */
                  <Grid container spacing={3}>
                    {reservas.map((r) => {
                      const nivelColor = getNivelColor(r.nivel_destino_nombre);
                      return (
                        <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <Fade in timeout={300}>
                            <Card
                              sx={{
                                height: '100%',
                                borderRadius: '20px',
                                border: `1px solid ${isDark ? '#334155' : alpha(theme.palette.divider, 0.15)}`,
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'visible',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  transform: 'translateY(-8px)',
                                  boxShadow: `0 14px 28px ${alpha(isDark ? '#facc15' : '#0288d1', 0.25)}`,
                                  borderColor: isDark ? '#facc15' : '#0288d1',
                                },
                              }}
                            >
                              {/* Badge de estado superior izquierdo */}
                              <Chip
                                label="Confirmado"
                                size="small"
                                color="success"
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  left: 12,
                                  zIndex: 1,
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  borderRadius: '8px',
                                }}
                              />

                              {/* Badge de gestión superior derecho */}
                              <Chip
                                label="2027"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  zIndex: 1,
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  borderRadius: '8px',
                                  bgcolor: isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.15),
                                  color: isDark ? '#facc15' : '#0288d1',
                                }}
                              />

                              <CardContent sx={{ p: 3, pt: 5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Avatar con badge del grado destino */}
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  badgeContent={
                                    <Tooltip title={`Grado Destino: ${r.grado_destino_nombre}`}>
                                      <Chip
                                        icon={<SchoolIcon sx={{ fontSize: 13, color: '#fff !important' }} />}
                                        label={r.grado_destino_nombre.split(' ')[0]}
                                        size="small"
                                        sx={{
                                          height: 22,
                                          fontWeight: 800,
                                          fontSize: '0.68rem',
                                          bgcolor: nivelColor,
                                          color: '#ffffff',
                                          '& .MuiChip-icon': { ml: 0.5 },
                                        }}
                                      />
                                    </Tooltip>
                                  }
                                >
                                  <Avatar
                                    src={r.estudiante_foto_url || undefined}
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      margin: '0 auto 12px',
                                      bgcolor: isDark ? '#facc15' : '#0288d1',
                                      color: isDark ? '#000' : '#fff',
                                      fontSize: '1.8rem',
                                      fontWeight: 800,
                                      border: `3px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                                      boxShadow: `0 8px 16px ${alpha(isDark ? '#facc15' : '#0288d1', 0.2)}`,
                                    }}
                                  >
                                    {!r.estudiante_foto_url && getInitials(r.estudiante_nombres, r.estudiante_apellido_paterno)}
                                  </Avatar>
                                </Badge>

                                {/* Nombre del Estudiante */}
                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1rem', lineHeight: 1.25, mb: 0.5 }}>
                                  {r.estudiante_nombre_completo}
                                </Typography>

                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                  CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{r.estudiante_ci}</strong> · Cód: {r.estudiante_codigo}
                                </Typography>

                                {/* Chip Código de Reserva */}
                                <Chip
                                  label={r.codigo_reserva}
                                  size="small"
                                  sx={{
                                    mx: 'auto',
                                    mb: 2,
                                    height: 22,
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                  }}
                                />

                                {/* Grado Destino */}
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 1.2,
                                    mb: 2,
                                    borderRadius: '12px',
                                    bgcolor: alpha(nivelColor, 0.08),
                                    border: `1px solid ${alpha(nivelColor, 0.25)}`,
                                  }}
                                >
                                  <Typography variant="caption" sx={{ color: nivelColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Destino 2027
                                  </Typography>
                                  <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary', mt: 0.2 }}>
                                    {r.grado_destino_nombre}
                                  </Typography>
                                  {r.grado_actual_nombre && (
                                    <Typography variant="caption" color="text.secondary">
                                      Actual: {r.grado_actual_nombre}
                                    </Typography>
                                  )}
                                </Paper>

                                {/* Contenedor Tutor / Responsable */}
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: '12px',
                                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                    textAlign: 'left',
                                    mt: 'auto',
                                    mb: 2,
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                      Persona a cargo:
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={r.tutor_parentesco}
                                      sx={{
                                        height: 18,
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        bgcolor: isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.15),
                                        color: isDark ? '#facc15' : '#0288d1',
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="body2" fontWeight={700} noWrap>
                                    {r.tutor_nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    📱 {r.tutor_telefono} · CI: {r.tutor_ci}
                                  </Typography>
                                </Box>

                                {/* Barra de acciones de la card */}
                                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 'auto' }}>
                                  <Tooltip title="Descargar Recibo en PDF">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDescargarPDF(r.codigo_reserva)}
                                      sx={{
                                        bgcolor: alpha('#ef4444', 0.1),
                                        color: '#ef4444',
                                        '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
                                      }}
                                    >
                                      <PdfIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Ver / Imprimir Recibo">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleImprimir(r.codigo_reserva)}
                                      sx={{
                                        bgcolor: alpha('#0288d1', 0.1),
                                        color: isDark ? '#38bdf8' : '#0288d1',
                                        '&:hover': { bgcolor: alpha('#0288d1', 0.2) },
                                      }}
                                    >
                                      <PrintIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Contactar por WhatsApp">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleWhatsApp(r)}
                                      sx={{
                                        bgcolor: alpha('#16a34a', 0.1),
                                        color: '#16a34a',
                                        '&:hover': { bgcolor: alpha('#16a34a', 0.2) },
                                      }}
                                    >
                                      <WhatsAppIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Fade>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  /* ─── VISTA TABLA (Data Grid clásico) ─── */
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      borderRadius: '18px',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                    }}
                  >
                    <Table>
                      <TableHead sx={{ bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Estudiante</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Código / CI</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Destino 2027</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Persona que Reservó</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Contacto</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reservas.map((r) => {
                          const nivelColor = getNivelColor(r.nivel_destino_nombre);
                          return (
                            <TableRow
                              key={r.id}
                              hover
                              sx={{
                                '&:hover': {
                                  bgcolor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.04)',
                                },
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar
                                    src={r.estudiante_foto_url || undefined}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: isDark ? '#facc15' : '#0288d1',
                                      color: isDark ? '#000' : '#fff',
                                      fontWeight: 800,
                                      fontSize: '0.9rem',
                                    }}
                                  >
                                    {!r.estudiante_foto_url && getInitials(r.estudiante_nombres, r.estudiante_apellido_paterno)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={800}>
                                      {r.estudiante_nombre_completo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Reserva: <strong>{r.codigo_reserva}</strong>
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" fontWeight={700}>
                                  {r.estudiante_ci}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Cód: {r.estudiante_codigo}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  label={r.grado_destino_nombre}
                                  sx={{
                                    bgcolor: nivelColor,
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    borderRadius: '8px',
                                  }}
                                />
                                {r.grado_actual_nombre && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.3 }}>
                                    De: {r.grado_actual_nombre}
                                  </Typography>
                                )}
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {r.tutor_nombre}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={r.tutor_parentesco}
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    bgcolor: isDark ? alpha('#facc15', 0.15) : alpha('#0288d1', 0.12),
                                    color: isDark ? '#facc15' : '#0288d1',
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography variant="caption" fontWeight={700} display="block">
                                  📱 {r.tutor_telefono}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  CI: {r.tutor_ci}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  icon={<CheckCircleIcon fontSize="small" sx={{ color: '#16a34a !important' }} />}
                                  label="Confirmado"
                                  sx={{
                                    bgcolor: alpha('#16a34a', 0.12),
                                    color: '#16a34a',
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                    borderRadius: '6px',
                                  }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title="Descargar Recibo en PDF">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleDescargarPDF(r.codigo_reserva)}
                                    >
                                      <PdfIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Ver / Imprimir Recibo">
                                    <IconButton
                                      size="small"
                                      color="info"
                                      onClick={() => handleImprimir(r.codigo_reserva)}
                                    >
                                      <PrintIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Contactar por WhatsApp">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleWhatsApp(r)}
                                    >
                                      <WhatsAppIcon fontSize="small" />
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

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, p) => setPage(p)}
                      color="primary"
                      shape="rounded"
                      size="large"
                      sx={{
                        '& .Mui-selected': {
                          bgcolor: isDark ? '#facc15 !important' : '#0288d1 !important',
                          color: isDark ? '#000 !important' : '#fff !important',
                          fontWeight: 800,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 1: CENTRO DE REPORTES Y EXPORTACIÓN (ESTILO DOCENTE NOTAS)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 1 && (
              <Box>
                <Grid container spacing={3}>
                  {/* IZQUIERDA: CATÁLOGO DE REPORTES (CARDS DE SELECCIÓN) */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                      Catálogo de Reportes Oficiales
                    </Typography>
                    <Grid container spacing={2}>
                      {REPORTES_DISPONIBLES.map((rep) => {
                        const seleccionado = reporteSeleccionado.id === rep.id;
                        return (
                          <Grid key={rep.id} size={{ xs: 12, sm: 6 }}>
                            <Card
                              onClick={() => setReporteSeleccionado(rep)}
                              sx={{
                                height: '100%',
                                p: 2.5,
                                borderRadius: '18px',
                                cursor: 'pointer',
                                position: 'relative',
                                border: seleccionado
                                  ? `2px solid ${rep.color}`
                                  : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                bgcolor: seleccionado
                                  ? isDark
                                    ? alpha(rep.color, 0.08)
                                    : alpha(rep.color, 0.04)
                                  : isDark
                                  ? 'rgba(30, 41, 59, 0.6)'
                                  : '#ffffff',
                                boxShadow: seleccionado
                                  ? `0 8px 24px ${alpha(rep.color, 0.25)}`
                                  : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  borderColor: rep.color,
                                  boxShadow: `0 10px 22px ${alpha(rep.color, 0.2)}`,
                                },
                              }}
                            >
                              {rep.badge && (
                                <Chip
                                  label={rep.badge}
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    height: 20,
                                    fontWeight: 800,
                                    fontSize: '0.65rem',
                                    bgcolor: alpha(rep.color, 0.15),
                                    color: rep.color,
                                  }}
                                />
                              )}

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: rep.gradient,
                                    color: '#ffffff',
                                    '& svg': { fontSize: 24 },
                                  }}
                                >
                                  {rep.icon}
                                </Box>
                                <Box sx={{ pr: rep.badge ? 6 : 0 }}>
                                  <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                    {rep.titulo}
                                  </Typography>
                                </Box>
                              </Box>

                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                                {rep.descripcion}
                              </Typography>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>

                  {/* DERECHA: PANEL DE CONFIGURACIÓN Y DESCARGA (COMO DOCENTES) */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '20px',
                        bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                        border: `1.5px solid ${alpha(reporteSeleccionado.color, 0.3)}`,
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

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Genera el documento en formato oficial para la <strong>Gestión 2027</strong> con encabezado institucional, sellos y tablas comparativas.
                      </Typography>

                      <Stack spacing={2.5}>
                        {reporteSeleccionado.filtros.includes('nivel') && (
                          <FormControl fullWidth size="small">
                            <InputLabel>Nivel Educativo</InputLabel>
                            <Select
                              value={repNivelId}
                              label="Nivel Educativo"
                              onChange={(e) => setRepNivelId(e.target.value as number | '')}
                              sx={{ borderRadius: '12px' }}
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
                              onChange={(e) => setRepGradoId(e.target.value as number | '')}
                              sx={{ borderRadius: '12px' }}
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

                        {reporteSeleccionado.filtros.includes('search') && (
                          <TextField
                            fullWidth
                            size="small"
                            label="Filtrar por estudiante, CI o tutor (opcional)"
                            value={repSearch}
                            onChange={(e) => setRepSearch(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}

                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
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
                            • Nivel: <strong>{repNivelId ? nivelesAcademicos.find((n) => n.id === repNivelId)?.nombre : 'Todos los Niveles'}</strong>
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* Botones de Descarga idénticos a los de Notas de Docentes */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <BtnDescarga
                            label="Descargar PDF"
                            icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 22 }} />}
                            color="#ef4444"
                            gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                            loading={repDescargandoPdf}
                            disabled={repDescargandoExcel}
                            onClick={() => handleDescargarReporteCentro('pdf')}
                          />

                          <BtnDescarga
                            label="Descargar Excel"
                            icon={<TableChartRoundedIcon sx={{ fontSize: 22 }} />}
                            color="#10b981"
                            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                            loading={repDescargandoExcel}
                            disabled={repDescargandoPdf}
                            onClick={() => handleDescargarReporteCentro('excel')}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: DESGLOSE POR GRADO (DISTRIBUCIÓN CUANTITATIVA)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 2 && (
              <Box>
                <Grid container spacing={2.5}>
                  {loadingStats ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                      <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton height={120} sx={{ borderRadius: '16px' }} />
                      </Grid>
                    ))
                  ) : porGradoStats.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 6,
                          textAlign: 'center',
                          borderRadius: '18px',
                          bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No hay información de grados disponible.
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    porGradoStats.map((item) => {
                      const nivelColor = getNivelColor(item.nivel_nombre);
                      return (
                        <Grid key={item.grado_id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: '18px',
                              bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                              border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-3px)',
                                borderColor: nivelColor,
                                boxShadow: `0 10px 25px ${alpha(nivelColor, 0.15)}`,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={800}>
                                {item.grado_nombre}
                              </Typography>
                              <Chip
                                size="small"
                                label={item.nivel_nombre}
                                sx={{
                                  bgcolor: alpha(nivelColor, 0.15),
                                  color: nivelColor,
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  borderRadius: '6px',
                                }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 2 }}>
                              <Typography variant="h3" fontWeight={800} color={nivelColor}>
                                {item.total_reservados}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                Estudiante(s) Reservado(s)
                              </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  setGradoFilter(item.grado_id);
                                  setActiveTab(0);
                                }}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  p: 0,
                                  color: isDark ? '#facc15' : '#0288d1',
                                }}
                              >
                                Ver listado de este grado →
                              </Button>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })
                  )}
                </Grid>
              </Box>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
