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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
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
  CancelOutlined as CancelIcon,
  WarningAmber as WarningAmberIcon,
  Close as CloseIcon,
  RestartAlt as RestartAltIcon,
  Star as StarIcon,
  HowToReg as HowToRegIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import reservaCupoService from '@/services/reservaCupoService';
import { ReservaCupoData, ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
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
    id: 'no_continua',
    titulo: 'Constancias de No Continuidad 2027',
    descripcion: 'Padrón de estudiantes regulares que declararon no continuar en el colegio, con motivos y cupos liberados.',
    icon: <CancelIcon />,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    badge: 'Liberados',
    filtros: ['grado', 'nivel', 'search'],
  },
  {
    id: 'anulaciones',
    titulo: 'Reporte de Solicitudes y Bajas de Cupo',
    descripcion: 'Control administrativo de solicitudes de anulación y reservas canceladas por los padres o secretaría.',
    icon: <WarningAmberIcon />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    badge: 'Bajas',
    filtros: ['grado', 'search'],
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
  {
    id: 'hermanos',
    titulo: 'Padrón de Hermanos Nuevos (Prioridad Familiar)',
    descripcion: 'Nómina oficial completa de hermanitos postulantes para 2027: cupos confirmados y lista de espera con datos del hermano regular.',
    icon: <StarIcon />,
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308, #f59e0b)',
    badge: 'Hermanos',
    filtros: ['grado', 'search'],
  },
  {
    id: 'hermanos_espera',
    titulo: 'Lista de Espera de Hermanos 2027',
    descripcion: 'Control prioritario de hermanitos postulantes en espera (Puesto #1, #2, ...) a la espera de liberación de vacantes.',
    icon: <StarIcon />,
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    badge: 'En Espera',
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
  const [estadoFilter, setEstadoFilter] = useState<string>('');
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

  // Estados para Acciones Administrativas (Anulación y Reactivación)
  const [modalAnulacionOpen, setModalAnulacionOpen] = useState(false);
  const [modalReactivacionOpen, setModalReactivacionOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaCupoData | null>(null);
  const [motivoAdmin, setMotivoAdmin] = useState('');
  const [isProcesandoAccion, setIsProcesandoAccion] = useState(false);

  // Estados para Tab de Solicitudes de Anulación
  const [solicitudes, setSolicitudes] = useState<ReservaCupoData[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  // Estados para Tab de Hermanos de Estudiantes (Prioridad Familiar)
  const [hermanosList, setHermanosList] = useState<ReservaCupoHermanoData[]>([]);
  const [loadingHermanos, setLoadingHermanos] = useState(false);
  const [filtroEstadoHermano, setFiltroEstadoHermano] = useState('');
  const [searchHermano, setSearchHermano] = useState('');
  const [promoviendoHermanoId, setPromoviendoHermanoId] = useState<number | null>(null);
  const [exportandoHermanosExcel, setExportandoHermanosExcel] = useState(false);
  const [exportandoHermanosPdf, setExportandoHermanosPdf] = useState(false);

  // Estadísticas cuantitativas
  const [stats, setStats] = useState({
    total_reservas: 0,
    total_confirmadas: 0,
    total_no_continua: 0,
    total_solicitud_anulacion: 0,
    total_anuladas: 0,
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
          total_confirmadas: Number(data.resumen.total_confirmadas ?? data.resumen.total_reservas ?? 0),
          total_no_continua: Number(data.resumen.total_no_continua || 0),
          total_solicitud_anulacion: Number(data.resumen.total_solicitud_anulacion || 0),
          total_anuladas: Number(data.resumen.total_anuladas || 0),
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

  // Cargar solicitudes de anulación pendientes
  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const data = await reservaCupoService.listarAdmin({
        estado: 'solicitud_anulacion',
        limit: 100,
      });
      setSolicitudes(data?.reservas || []);
    } catch (err) {
      console.error('Error al cargar solicitudes de anulación:', err);
    } finally {
      setLoadingSolicitudes(false);
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
        estado: estadoFilter || undefined,
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

  // Cargar hermanos
  const cargarHermanos = async () => {
    setLoadingHermanos(true);
    try {
      const data = await reservaCupoService.listarHermanosAdmin({
        estado: filtroEstadoHermano || undefined,
        search: searchHermano.trim() || undefined,
        limit: 100
      });
      setHermanosList(data?.hermanos || []);
    } catch (err) {
      console.error('Error al listar hermanos:', err);
    } finally {
      setLoadingHermanos(false);
    }
  };

  const handlePromoverHermano = async (hermano: ReservaCupoHermanoData) => {
    const nombreCompleto = `${hermano.nombres} ${hermano.apellido_paterno}`;
    if (!window.confirm(`¿Confirmar asignación de cupo directo para ${nombreCompleto}? Pasará de Lista de Espera a Confirmado.`)) {
      return;
    }
    setPromoviendoHermanoId(hermano.id);
    try {
      const res = await reservaCupoService.promoverHermanoAdmin(hermano.id, 'Promovido manualmente por administración tras vacancia');
      toast.success(res.message || `Cupo confirmado para ${nombreCompleto}`);
      cargarHermanos();
      cargarEstadisticas();
    } catch (err: any) {
      console.error('Error al promover hermano:', err);
      toast.error(err.response?.data?.message || 'Error al promover hermano');
    } finally {
      setPromoviendoHermanoId(null);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    cargarSolicitudes();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      cargarSolicitudes();
    } else if (activeTab === 4) {
      cargarHermanos();
    }
  }, [activeTab, filtroEstadoHermano, searchHermano]);

  useEffect(() => {
    cargarReservas();
  }, [page, searchTerm, gradoFilter, nivelFilter, estadoFilter]);

  // Manejo de exportación de Hermanos (Excel / PDF)
  const handleExportarHermanosExcel = async () => {
    setExportandoHermanosExcel(true);
    try {
      await reservaCupoService.exportarReporteHermanos('excel', {
        search: searchHermano.trim() || undefined,
        estado: filtroEstadoHermano || undefined,
      });
      toast.success('Padrón de Hermanos descargado en Excel correctamente');
    } catch (err) {
      console.error('Error al exportar hermanos a Excel:', err);
      toast.error('Error al exportar padrón de hermanos a Excel.');
    } finally {
      setExportandoHermanosExcel(false);
    }
  };

  const handleExportarHermanosPdf = async () => {
    setExportandoHermanosPdf(true);
    try {
      await reservaCupoService.exportarReporteHermanos('pdf', {
        search: searchHermano.trim() || undefined,
        estado: filtroEstadoHermano || undefined,
      });
      toast.success('Padrón de Hermanos descargado en PDF correctamente');
    } catch (err) {
      console.error('Error al exportar hermanos a PDF:', err);
      toast.error('Error al exportar padrón de hermanos a PDF.');
    } finally {
      setExportandoHermanosPdf(false);
    }
  };

  // Manejo de exportación rápida (Cabecera)
  const handleExportarExcel = async () => {
    if (activeTab === 4) {
      return handleExportarHermanosExcel();
    }
    setExportandoExcel(true);
    try {
      await reservaCupoService.exportarReporte('excel', {
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
        estado: estadoFilter || undefined,
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
    if (activeTab === 4) {
      return handleExportarHermanosPdf();
    }
    setExportandoPdf(true);
    try {
      await reservaCupoService.exportarReporte('pdf', {
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
        estado: estadoFilter || undefined,
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
      if (reporteSeleccionado.id === 'hermanos' || reporteSeleccionado.id === 'hermanos_espera') {
        const estadoHermanos = reporteSeleccionado.id === 'hermanos_espera' ? 'en_espera' : undefined;
        await reservaCupoService.exportarReporteHermanos(formato, {
          search: repSearch.trim() || undefined,
          grado_solicitado_id: repGradoId ? Number(repGradoId) : undefined,
          estado: estadoHermanos,
        });
        toast.success(`Reporte ${reporteSeleccionado.titulo} (${formato.toUpperCase()}) generado con éxito`);
        return;
      }

      let estadoFiltroReporte = undefined;
      if (reporteSeleccionado.id === 'no_continua') estadoFiltroReporte = 'no_continua';
      if (reporteSeleccionado.id === 'anulaciones') estadoFiltroReporte = 'anulada';

      await reservaCupoService.exportarReporte(formato, {
        search: repSearch.trim() || undefined,
        grado_destino_id: repGradoId ? Number(repGradoId) : undefined,
        nivel_destino_id: repNivelId ? Number(repNivelId) : undefined,
        estado: estadoFiltroReporte,
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

  // Controladores de Acciones Administrativas
  const handleAbrirAnular = (r: ReservaCupoData) => {
    setReservaSeleccionada(r);
    setMotivoAdmin(r.motivo_anulacion || '');
    setModalAnulacionOpen(true);
  };

  const handleConfirmarAnulacion = async () => {
    if (!reservaSeleccionada) return;
    if (!motivoAdmin.trim()) {
      toast.error('Debe ingresar un motivo para anular la reserva');
      return;
    }
    setIsProcesandoAccion(true);
    try {
      const resp = await reservaCupoService.anularReservaAdmin(reservaSeleccionada.id, motivoAdmin.trim());
      toast.success(resp.message || 'Reserva anulada exitosamente');
      setModalAnulacionOpen(false);
      setReservaSeleccionada(null);
      setMotivoAdmin('');
      cargarReservas();
      cargarEstadisticas();
      cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al anular reserva:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Error al anular la reserva');
    } finally {
      setIsProcesandoAccion(false);
    }
  };

  const handleAbrirReactivar = (r: ReservaCupoData) => {
    setReservaSeleccionada(r);
    setMotivoAdmin('');
    setModalReactivacionOpen(true);
  };

  const handleConfirmarReactivacion = async () => {
    if (!reservaSeleccionada) return;
    setIsProcesandoAccion(true);
    try {
      const resp = await reservaCupoService.reactivarReservaAdmin(reservaSeleccionada.id, motivoAdmin.trim() || undefined);
      toast.success(resp.message || 'Reserva reactivada y cupo restablecido exitosamente');
      setModalReactivacionOpen(false);
      setReservaSeleccionada(null);
      setMotivoAdmin('');
      cargarReservas();
      cargarEstadisticas();
      cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al reactivar reserva:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Error al reactivar la reserva');
    } finally {
      setIsProcesandoAccion(false);
    }
  };

  const getEstadoBadgeConfig = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return {
          label: 'Confirmada',
          color: '#10b981',
          bg: alpha('#10b981', 0.15),
          icon: <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981 !important' }} />,
        };
      case 'no_continua':
        return {
          label: 'No Continuará',
          color: '#ef4444',
          bg: alpha('#ef4444', 0.15),
          icon: <CancelIcon sx={{ fontSize: 13, color: '#ef4444 !important' }} />,
        };
      case 'solicitud_anulacion':
        return {
          label: 'Solicitud Anulación',
          color: '#f59e0b',
          bg: alpha('#f59e0b', 0.18),
          icon: <WarningAmberIcon sx={{ fontSize: 13, color: '#f59e0b !important' }} />,
        };
      case 'anulada':
      case 'cancelada':
        return {
          label: 'Anulada / Cancelada',
          color: '#64748b',
          bg: alpha('#64748b', 0.18),
          icon: <CloseIcon sx={{ fontSize: 13, color: '#64748b !important' }} />,
        };
      default:
        return {
          label: estado || 'Registrado',
          color: '#3b82f6',
          bg: alpha('#3b82f6', 0.15),
          icon: <BookmarkAddedIcon sx={{ fontSize: 13, color: '#3b82f6 !important' }} />,
        };
    }
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

            {/* ══ STATS CARDS (CONFIRMADAS, NO CONTINÚAN, SOLICITUDES, ANULADAS) ══ */}
            <Grid container spacing={2.5} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Confirmadas"
                  value={loadingStats ? '...' : stats.total_confirmadas}
                  icon={<CheckCircleIcon />}
                  color="#10b981"
                  subtitle="Continuarán en el colegio"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="No Continuarán"
                  value={loadingStats ? '...' : stats.total_no_continua}
                  icon={<CancelIcon />}
                  color="#ef4444"
                  subtitle="Cupos liberados para 2027"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Solicitud Anulación"
                  value={loadingStats ? '...' : stats.total_solicitud_anulacion}
                  icon={<WarningAmberIcon />}
                  color="#f59e0b"
                  subtitle="Pendientes de revisión admin"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Anuladas / Bajas"
                  value={loadingStats ? '...' : stats.total_anuladas}
                  icon={<CloseIcon />}
                  color="#64748b"
                  subtitle="Bajas confirmadas por admin"
                />
              </Grid>
            </Grid>

            {/* Sub-barra de conteo por niveles */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Distribución Académica:
              </Typography>
              <Chip
                size="small"
                label={`Inicial: ${loadingStats ? '...' : stats.total_inicial}`}
                sx={{ fontWeight: 700, bgcolor: alpha('#ec4899', 0.12), color: '#ec4899', border: '1px solid rgba(236,72,153,0.25)' }}
              />
              <Chip
                size="small"
                label={`Primaria: ${loadingStats ? '...' : stats.total_primaria}`}
                sx={{ fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
              />
              <Chip
                size="small"
                label={`Secundaria: ${loadingStats ? '...' : stats.total_secundaria}`}
                sx={{ fontWeight: 700, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Total registros procesados: <strong>{loadingStats ? '...' : stats.total_reservas}</strong>
              </Typography>
            </Box>

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
                <Tab
                  icon={
                    <Badge
                      badgeContent={stats.total_solicitud_anulacion}
                      color="warning"
                      sx={{
                        mr: 1,
                        '& .MuiBadge-badge': {
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          height: 18,
                          minWidth: 18,
                        },
                      }}
                    >
                      <WarningAmberIcon sx={{ fontSize: 20 }} />
                    </Badge>
                  }
                  iconPosition="start"
                  label="Solicitudes de Anulación"
                />
                <Tab icon={<StarIcon sx={{ mr: 1 }} />} iconPosition="start" label="Hermanos (Prioridad Familiar)" />
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
                    <Grid size={{ xs: 12, md: 3.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por nombre, CI, código, tutor o teléfono..."
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

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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

                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Estado / Decisión</InputLabel>
                        <Select
                          value={estadoFilter}
                          label="Estado / Decisión"
                          onChange={(e) => {
                            setEstadoFilter(e.target.value);
                            setPage(1);
                          }}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="">Todos los estados</MenuItem>
                          <MenuItem value="confirmada">Confirmada (Continuará)</MenuItem>
                          <MenuItem value="no_continua">No Continuará (Liberado)</MenuItem>
                          <MenuItem value="solicitud_anulacion">Solicitud de Anulación</MenuItem>
                          <MenuItem value="anulada">Anulada / Cancelada</MenuItem>
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
                          setEstadoFilter('');
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
                      const isNoContinua = r.estado === 'no_continua';
                      const isSolicitudAnulacion = r.estado === 'solicitud_anulacion';

                      // Estilos visuales dinámicos según el tipo de reserva
                      let cardBorder = isDark ? '#334155' : alpha(theme.palette.divider, 0.15);
                      let cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff';
                      let cardShadow = 'none';
                      let cardHoverShadow = `0 14px 28px ${alpha(isDark ? '#facc15' : '#0288d1', 0.25)}`;
                      let cardHoverBorder = isDark ? '#facc15' : '#0288d1';
                      let topBarGradient: string | null = null;

                      if (isNoContinua) {
                        cardBorder = isDark ? 'rgba(239, 68, 68, 0.65)' : '#fca5a5';
                        cardBg = isDark
                          ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.14) 0%, rgba(30, 41, 59, 0.88) 100%)'
                          : 'linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)';
                        cardShadow = '0 8px 24px rgba(239, 68, 68, 0.16)';
                        cardHoverShadow = '0 16px 32px rgba(239, 68, 68, 0.32)';
                        cardHoverBorder = '#ef4444';
                        topBarGradient = 'linear-gradient(90deg, #ef4444, #dc2626)';
                      } else if (isSolicitudAnulacion) {
                        cardBorder = isDark ? 'rgba(245, 158, 11, 0.75)' : '#fcd34d';
                        cardBg = isDark
                          ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.88) 100%)'
                          : 'linear-gradient(180deg, #fffdf0 0%, #ffffff 100%)';
                        cardShadow = '0 8px 24px rgba(245, 158, 11, 0.2)';
                        cardHoverShadow = '0 16px 32px rgba(245, 158, 11, 0.38)';
                        cardHoverBorder = '#f59e0b';
                        topBarGradient = 'linear-gradient(90deg, #f59e0b, #d97706)';
                      }

                      return (
                        <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <Fade in timeout={300}>
                            <Card
                              sx={{
                                height: '100%',
                                borderRadius: '20px',
                                border: `1.5px solid ${cardBorder}`,
                                bgcolor: cardBg,
                                boxShadow: cardShadow,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  transform: 'translateY(-8px)',
                                  boxShadow: cardHoverShadow,
                                  borderColor: cardHoverBorder,
                                },
                              }}
                            >
                              {/* Barra superior de acento para no continuará o solicitud */}
                              {topBarGradient && (
                                <Box
                                  sx={{
                                    height: 5,
                                    width: '100%',
                                    background: topBarGradient,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    zIndex: 2,
                                  }}
                                />
                              )}

                              {/* Badge de estado dinámico superior izquierdo */}
                              {(() => {
                                const estadoCfg = getEstadoBadgeConfig(r.estado);
                                return (
                                  <Chip
                                    icon={estadoCfg.icon}
                                    label={estadoCfg.label}
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 14,
                                      left: 12,
                                      zIndex: 1,
                                      fontWeight: 800,
                                      fontSize: '0.68rem',
                                      borderRadius: '8px',
                                      bgcolor: estadoCfg.bg,
                                      color: estadoCfg.color,
                                      border: `1px solid ${alpha(estadoCfg.color, 0.35)}`,
                                      boxShadow: isNoContinua || isSolicitudAnulacion ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                      '& .MuiChip-icon': { ml: 0.5 },
                                    }}
                                  />
                                );
                              })()}

                              {/* Badge de gestión superior derecho */}
                              <Chip
                                label="2027"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 14,
                                  right: 12,
                                  zIndex: 1,
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  borderRadius: '8px',
                                  bgcolor: isNoContinua
                                    ? alpha('#ef4444', 0.2)
                                    : isSolicitudAnulacion
                                      ? alpha('#f59e0b', 0.2)
                                      : (isDark ? alpha('#facc15', 0.2) : alpha('#0288d1', 0.15)),
                                  color: isNoContinua
                                    ? '#ef4444'
                                    : isSolicitudAnulacion
                                      ? '#f59e0b'
                                      : (isDark ? '#facc15' : '#0288d1'),
                                }}
                              />

                              <CardContent sx={{ p: 3, pt: 5.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                                      bgcolor: isNoContinua
                                        ? '#ef4444'
                                        : isSolicitudAnulacion
                                          ? '#f59e0b'
                                          : (isDark ? '#facc15' : '#0288d1'),
                                      color: isNoContinua || isSolicitudAnulacion ? '#ffffff' : (isDark ? '#000' : '#fff'),
                                      fontSize: '1.8rem',
                                      fontWeight: 800,
                                      border: `3px solid ${isNoContinua
                                        ? '#ef4444'
                                        : isSolicitudAnulacion
                                          ? '#f59e0b'
                                          : alpha(isDark ? '#facc15' : '#0288d1', 0.3)
                                        }`,
                                      boxShadow: `0 8px 16px ${isNoContinua
                                        ? 'rgba(239, 68, 68, 0.3)'
                                        : isSolicitudAnulacion
                                          ? 'rgba(245, 158, 11, 0.3)'
                                          : alpha(isDark ? '#facc15' : '#0288d1', 0.2)
                                        }`,
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
                                    mb: 1.5,
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

                                {/* Mensajes de motivos si existen */}
                                {r.motivo_no_continua && (
                                  <Alert
                                    severity="error"
                                    icon={<CancelIcon fontSize="inherit" />}
                                    sx={{ mb: 1.5, py: 0.2, px: 1, fontSize: '0.72rem', borderRadius: '10px', textAlign: 'left' }}
                                  >
                                    <strong>No continúa:</strong> {r.motivo_no_continua}
                                  </Alert>
                                )}
                                {r.motivo_anulacion && (
                                  <Alert
                                    severity={r.estado === 'solicitud_anulacion' ? 'warning' : 'info'}
                                    icon={r.estado === 'solicitud_anulacion' ? <WarningAmberIcon fontSize="inherit" /> : <CloseIcon fontSize="inherit" />}
                                    sx={{ mb: 1.5, py: 0.2, px: 1, fontSize: '0.72rem', borderRadius: '10px', textAlign: 'left' }}
                                  >
                                    <strong>{r.estado === 'solicitud_anulacion' ? 'Solicitud:' : 'Motivo anulación:'}</strong> {r.motivo_anulacion}
                                  </Alert>
                                )}

                                {/* Barra de acciones de la card */}
                                <Stack direction="row" spacing={0.8} justifyContent="center" sx={{ mt: 'auto', flexWrap: 'wrap' }}>
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

                                  {/* Botón de anulación si está confirmada */}
                                  {r.estado === 'confirmada' && (
                                    <Tooltip title="Anular Reserva">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleAbrirAnular(r)}
                                        sx={{
                                          bgcolor: alpha('#ef4444', 0.1),
                                          color: '#ef4444',
                                          '&:hover': { bgcolor: alpha('#ef4444', 0.25) },
                                        }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {/* Botón de revisar / aprobar solicitud de anulación */}
                                  {r.estado === 'solicitud_anulacion' && (
                                    <Tooltip title="Revisar y Anular Solicitud">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleAbrirAnular(r)}
                                        sx={{
                                          bgcolor: alpha('#f59e0b', 0.15),
                                          color: '#f59e0b',
                                          border: '1px solid #f59e0b',
                                          '&:hover': { bgcolor: alpha('#f59e0b', 0.3) },
                                        }}
                                      >
                                        <WarningAmberIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {/* Botón de reactivar si fue anulada, cancelada o marcada no continua */}
                                  {(r.estado === 'anulada' || r.estado === 'cancelada' || r.estado === 'no_continua') && (
                                    <Tooltip title="Reactivar / Restablecer Reserva">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleAbrirReactivar(r)}
                                        sx={{
                                          bgcolor: alpha('#10b981', 0.15),
                                          color: '#10b981',
                                          border: '1px solid #10b981',
                                          '&:hover': { bgcolor: alpha('#10b981', 0.3) },
                                        }}
                                      >
                                        <RestartAltIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
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
                          const isNoContinua = r.estado === 'no_continua';
                          const isSolicitudAnulacion = r.estado === 'solicitud_anulacion';

                          return (
                            <TableRow
                              key={r.id}
                              hover
                              sx={{
                                bgcolor: isNoContinua
                                  ? (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)')
                                  : isSolicitudAnulacion
                                    ? (isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.06)')
                                    : 'transparent',
                                borderLeft: isNoContinua
                                  ? '4px solid #ef4444'
                                  : isSolicitudAnulacion
                                    ? '4px solid #f59e0b'
                                    : '4px solid transparent',
                                '&:hover': {
                                  bgcolor: isNoContinua
                                    ? (isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.09)')
                                    : isSolicitudAnulacion
                                      ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.11)')
                                      : (isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.04)'),
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
                                {(() => {
                                  const estadoCfg = getEstadoBadgeConfig(r.estado);
                                  return (
                                    <Box>
                                      <Chip
                                        size="small"
                                        icon={estadoCfg.icon}
                                        label={estadoCfg.label}
                                        sx={{
                                          bgcolor: estadoCfg.bg,
                                          color: estadoCfg.color,
                                          fontWeight: 800,
                                          fontSize: '0.72rem',
                                          borderRadius: '6px',
                                          border: `1px solid ${alpha(estadoCfg.color, 0.25)}`,
                                          '& .MuiChip-icon': { ml: 0.5 },
                                        }}
                                      />
                                      {r.motivo_no_continua && (
                                        <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontSize: '0.68rem', mt: 0.5, maxWidth: 160 }}>
                                          {r.motivo_no_continua}
                                        </Typography>
                                      )}
                                      {r.motivo_anulacion && (
                                        <Typography variant="caption" sx={{ display: 'block', color: 'warning.main', fontSize: '0.68rem', mt: 0.5, maxWidth: 160 }}>
                                          {r.motivo_anulacion}
                                        </Typography>
                                      )}
                                    </Box>
                                  );
                                })()}
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

                                  {/* Botón de anular si está confirmada */}
                                  {r.estado === 'confirmada' && (
                                    <Tooltip title="Anular Reserva">
                                      <IconButton
                                        size="small"
                                        sx={{ color: '#ef4444' }}
                                        onClick={() => handleAbrirAnular(r)}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {/* Botón de revisar / aprobar solicitud de anulación */}
                                  {r.estado === 'solicitud_anulacion' && (
                                    <Tooltip title="Revisar y Anular Solicitud">
                                      <IconButton
                                        size="small"
                                        sx={{ color: '#f59e0b', bgcolor: alpha('#f59e0b', 0.1) }}
                                        onClick={() => handleAbrirAnular(r)}
                                      >
                                        <WarningAmberIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {/* Botón de reactivar si está anulada, cancelada o no continua */}
                                  {(r.estado === 'anulada' || r.estado === 'cancelada' || r.estado === 'no_continua') && (
                                    <Tooltip title="Reactivar / Restablecer Reserva">
                                      <IconButton
                                        size="small"
                                        sx={{ color: '#10b981', bgcolor: alpha('#10b981', 0.1) }}
                                        onClick={() => handleAbrirReactivar(r)}
                                      >
                                        <RestartAltIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
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
                TAB 1: SOLICITUDES DE ANULACIÓN DE CUPO (BANDEJA DE BAJAS)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 1 && (
              <Box>
                {/* Header informativo del Tab */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '20px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
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
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        color: '#ffffff',
                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <WarningAmberIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={800}>
                          Bandeja de Solicitudes de Anulación de Cupo
                        </Typography>
                        <Chip
                          size="small"
                          label={`${solicitudes.length} pendiente(s)`}
                          sx={{
                            fontWeight: 800,
                            bgcolor: alpha('#f59e0b', 0.15),
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                        Gestione las peticiones enviadas por los padres o tutores para la Gestión 2027. Puede confirmar la anulación definitiva liberando la plaza o mantener el cupo si la familia decidió continuar.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={cargarSolicitudes}
                    disabled={loadingSolicitudes}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
                  >
                    Actualizar Bandeja
                  </Button>
                </Paper>

                {/* Contenido de Solicitudes */}
                {loadingSolicitudes ? (
                  <Grid container spacing={3}>
                    {[1, 2, 3].map((i) => (
                      <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
                        <Skeleton height={340} sx={{ borderRadius: '20px' }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : solicitudes.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      borderRadius: '20px',
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', opacity: 0.7, mb: 1.5 }} />
                    <Typography variant="h6" fontWeight={800} color="text.primary">
                      No hay solicitudes de anulación pendientes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mt: 1 }}>
                      Todas las reservas de cupo para la Gestión 2027 se encuentran activas y al día. Cuando un padre o tutor solicite la baja desde su recibo digital, aparecerá aquí para su revisión administrativa.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {solicitudes.map((s) => {
                      const nivelColor = getNivelColor(s.nivel_destino_nombre);
                      return (
                        <Grid key={s.id} size={{ xs: 12, md: 6, lg: 4 }}>
                          <Card
                            sx={{
                              height: '100%',
                              borderRadius: '22px',
                              border: `2px solid ${isDark ? 'rgba(245, 158, 11, 0.65)' : '#f59e0b'}`,
                              bgcolor: isDark
                                ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                : 'linear-gradient(180deg, #fffdf0 0%, #ffffff 100%)',
                              boxShadow: '0 10px 28px rgba(245, 158, 11, 0.22)',
                              overflow: 'hidden',
                              p: 2.5,
                              pt: 3,
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: '0 16px 36px rgba(245, 158, 11, 0.38)',
                                borderColor: '#d97706',
                              },
                            }}
                          >
                            {/* Barra superior de acento degradado ámbar resplandeciente */}
                            <Box
                              sx={{
                                height: 6,
                                width: '100%',
                                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 2,
                              }}
                            />

                            {/* Cabecera de la solicitud */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Chip
                                icon={<WarningAmberIcon sx={{ fontSize: 14, color: '#f59e0b !important' }} />}
                                label="Solicitud de Anulación"
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  bgcolor: alpha('#f59e0b', 0.2),
                                  color: '#f59e0b',
                                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                                }}
                              />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                {s.fecha_solicitud_anulacion ? new Date(s.fecha_solicitud_anulacion).toLocaleDateString() : 'Pendiente'}
                              </Typography>
                            </Box>

                            {/* Datos del Estudiante */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              <Avatar
                                src={s.estudiante_foto_url || undefined}
                                sx={{
                                  width: 52,
                                  height: 52,
                                  bgcolor: '#f59e0b',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '1.2rem',
                                  border: '3px solid #f59e0b',
                                  boxShadow: '0 6px 14px rgba(245, 158, 11, 0.35)',
                                }}
                              >
                                {!s.estudiante_foto_url && getInitials(s.estudiante_nombres, s.estudiante_apellido_paterno)}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
                                  {s.estudiante_nombre_completo}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  CI: <strong>{s.estudiante_ci}</strong> · Cód: {s.estudiante_codigo}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Grado Destino */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                              <Chip
                                label={s.grado_destino_nombre}
                                size="small"
                                sx={{
                                  bgcolor: nivelColor,
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                }}
                              />
                              <Chip
                                label={`Cód: ${s.codigo_reserva}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                              />
                            </Box>

                            {/* Tutor / Persona que solicitó */}
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                mb: 2,
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                                Tutor Solicitante ({s.tutor_parentesco}):
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {s.tutor_nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                CI: {s.tutor_ci} · 📱 {s.tutor_telefono}
                              </Typography>
                            </Box>

                            {/* Motivo declarado por el tutor */}
                            <Box
                              sx={{
                                p: 1.75,
                                borderRadius: '12px',
                                bgcolor: alpha('#f59e0b', 0.08),
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                mb: 2.5,
                                flex: 1,
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                                Motivo expuesto por el tutor:
                              </Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.4 }}>
                                "{s.motivo_anulacion || 'Sin motivo especificado'}"
                              </Typography>
                            </Box>

                            {/* Botones de Acción */}
                            <Stack spacing={1} sx={{ mt: 'auto' }}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  startIcon={<CancelIcon />}
                                  onClick={() => handleAbrirAnular(s)}
                                  sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    py: 0.8,
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  }}
                                >
                                  Aprobar Anulación
                                </Button>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  color="success"
                                  size="small"
                                  startIcon={<RestartAltIcon />}
                                  onClick={() => handleAbrirReactivar(s)}
                                  sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    py: 0.8,
                                  }}
                                >
                                  Mantener Cupo
                                </Button>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<WhatsAppIcon sx={{ color: '#16a34a' }} />}
                                  onClick={() => handleWhatsApp(s)}
                                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}
                                >
                                  WhatsApp Tutor
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<PdfIcon sx={{ color: '#ef4444' }} />}
                                  onClick={() => handleDescargarPDF(s.codigo_reserva)}
                                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}
                                >
                                  Ver Recibo
                                </Button>
                              </Box>
                            </Stack>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: CENTRO DE REPORTES Y EXPORTACIÓN (ESTILO DOCENTE NOTAS)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 2 && (
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
                TAB 3: DESGLOSE POR GRADO (DISTRIBUCIÓN CUANTITATIVA)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 3 && (
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

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4: HERMANOS POSTULANTES (PRIORIDAD FAMILIAR)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 4 && (
              <Box>
                {/* BARRA DE FILTROS PARA HERMANOS */}
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
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar hermano, CI, regular o código..."
                        value={searchHermano}
                        onChange={(e) => setSearchHermano(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: searchHermano ? (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setSearchHermano('')}>
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

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Estado de Cupo</InputLabel>
                        <Select
                          value={filtroEstadoHermano}
                          label="Estado de Cupo"
                          onChange={(e) => setFiltroEstadoHermano(e.target.value)}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="">Todos los hermanos</MenuItem>
                          <MenuItem value="confirmada">Confirmada (Cupo Directo)</MenuItem>
                          <MenuItem value="en_espera">En Lista de Espera (Prioritaria)</MenuItem>
                          <MenuItem value="solicitud_anulacion">Solicitud de Anulación</MenuItem>
                          <MenuItem value="anulada">Anulada / Cancelada</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', flexWrap: 'wrap' }}>
                        <BtnDescarga
                          label="Excel"
                          icon={<TableChartRoundedIcon sx={{ fontSize: 18 }} />}
                          color="#10b981"
                          gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                          loading={exportandoHermanosExcel}
                          disabled={exportandoHermanosPdf}
                          onClick={handleExportarHermanosExcel}
                        />
                        <BtnDescarga
                          label="PDF"
                          icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} />}
                          color="#ef4444"
                          gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                          loading={exportandoHermanosPdf}
                          disabled={exportandoHermanosExcel}
                          onClick={handleExportarHermanosPdf}
                        />
                        <Tooltip title="Actualizar lista de hermanos">
                          <IconButton
                            onClick={cargarHermanos}
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
                </Paper>

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
                                borderRadius: '20px',
                                border: `1.5px solid ${cardBorder}`,
                                bgcolor: cardBg,
                                boxShadow: esEspera
                                  ? (isDark ? '0 8px 24px rgba(245, 158, 11, 0.15)' : '0 8px 24px rgba(245, 158, 11, 0.1)')
                                  : (isDark ? '0 8px 24px rgba(16, 185, 129, 0.15)' : '0 8px 24px rgba(16, 185, 129, 0.1)'),
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Badges superiores */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
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
                                  {esEspera && (
                                    <Button
                                      fullWidth
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      disabled={promoviendoHermanoId === h.id}
                                      startIcon={promoviendoHermanoId === h.id ? <CircularProgress size={16} color="inherit" /> : <HowToRegIcon />}
                                      onClick={() => handlePromoverHermano(h)}
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

                                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 0.5 }}>
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
                                      onClick={() => handleDescargarPDF(h.codigo_reserva)}
                                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}
                                    >
                                      Recibo PDF
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
            )}
          </Box>
        </Fade>

        {/* ══════════════════════════════════════════════════════════════════
            MODAL DE ANULACIÓN ADMINISTRATIVA (ESTILO RESERVA-CUPO)
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog
          open={modalAnulacionOpen}
          onClose={() => !isProcesandoAccion && setModalAnulacionOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              bgcolor: isDark ? '#09101d' : '#ffffff',
              border: `1px solid ${alpha('#ef4444', 0.35)}`,
              boxShadow: isDark
                ? '0 24px 64px rgba(0,0,0,0.75)'
                : '0 24px 64px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            },
          }}
        >
          {/* HEADER */}
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '13px',
                    bgcolor: alpha('#ef4444', 0.12),
                    border: `1px solid ${alpha('#ef4444', 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    flexShrink: 0,
                  }}
                >
                  <CancelIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#ef4444',
                    }}
                  >
                    Administración · Control de Cupos 2027
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color: 'text.primary' }}>
                    Anular Reserva de Cupo
                  </Typography>
                </Box>
              </Box>

              <Box
                onClick={() => !isProcesandoAccion && setModalAnulacionOpen(false)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '9px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: 'text.secondary',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  '&:hover': {
                    background: alpha('#ef4444', 0.12),
                    borderColor: alpha('#ef4444', 0.4),
                    color: '#ef4444',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>

            <Box
              sx={{
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                width: '100%',
              }}
            />
          </Box>

          <DialogContent sx={{ px: 3, py: 2 }}>
            <Alert
              severity="warning"
              sx={{
                mb: 2.5,
                borderRadius: '14px',
                bgcolor: alpha('#f59e0b', 0.1),
                border: `1px solid ${alpha('#f59e0b', 0.25)}`,
                color: isDark ? '#fbbf24' : '#b45309',
                '& .MuiAlert-icon': { color: '#f59e0b' },
              }}
            >
              <strong>Advertencia de Liberación:</strong> Al anular esta reserva, la plaza escolar quedará disponible para reasignación en la Gestión 2027.
              Si los padres se arrepienten, <strong>no podrán registrarse por la web pública</strong> y deberán acudir a secretaría para una reactivación.
            </Alert>

            {reservaSeleccionada && (
              <Box
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: '16px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={reservaSeleccionada.estudiante_foto_url || undefined}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                      }}
                    >
                      {!reservaSeleccionada.estudiante_foto_url && getInitials(reservaSeleccionada.estudiante_nombres, reservaSeleccionada.estudiante_apellido_paterno)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                        {reservaSeleccionada.estudiante_nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                        CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{reservaSeleccionada.estudiante_ci}</strong> · Cód: {reservaSeleccionada.estudiante_codigo}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={reservaSeleccionada.grado_destino_nombre}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                      color: isDark ? '#facc15' : '#0288d1',
                      border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" display="block">
                  Tutor a cargo: <strong>{reservaSeleccionada.tutor_nombre}</strong> ({reservaSeleccionada.tutor_parentesco}) · 📱 {reservaSeleccionada.tutor_telefono}
                </Typography>

                {reservaSeleccionada.motivo_anulacion && reservaSeleccionada.estado === 'solicitud_anulacion' && (
                  <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '10px', bgcolor: alpha('#f59e0b', 0.1), border: '1px solid rgba(245,158,11,0.25)' }}>
                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                      Motivo declarado por el tutor en su solicitud:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', mt: 0.3 }}>
                      "{reservaSeleccionada.motivo_anulacion}"
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Motivo Administrativo de la Anulación *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                required
                placeholder="Indique la justificación oficial (ej. Solicitud voluntaria del tutor, cambio de radicatoria, cupo liberado para lista de espera)..."
                value={motivoAdmin}
                onChange={(e) => setMotivoAdmin(e.target.value)}
                disabled={isProcesandoAccion}
                helperText="Este motivo quedará asentado en el historial de auditoría de secretaría"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Box>
          </DialogContent>

          {/* FOOTER */}
          <Box
            sx={{
              px: 3,
              pb: 3,
              pt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            }}
          >
            <Button
              variant="text"
              color="inherit"
              onClick={() => setModalAnulacionOpen(false)}
              disabled={isProcesandoAccion}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              }}
            >
              Cancelar
            </Button>

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              onClick={handleConfirmarAnulacion}
              disabled={isProcesandoAccion || !motivoAdmin.trim()}
              startIcon={isProcesandoAccion ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isProcesandoAccion ? 'Procesando...' : 'Confirmar Anulación Oficial'}
            </Button>
          </Box>
        </Dialog>

        {/* ══════════════════════════════════════════════════════════════════
            MODAL DE REACTIVACIÓN ADMINISTRATIVA (ESTILO RESERVA-CUPO)
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog
          open={modalReactivacionOpen}
          onClose={() => !isProcesandoAccion && setModalReactivacionOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              bgcolor: isDark ? '#09101d' : '#ffffff',
              border: `1px solid ${alpha('#10b981', 0.35)}`,
              boxShadow: isDark
                ? '0 24px 64px rgba(0,0,0,0.75)'
                : '0 24px 64px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            },
          }}
        >
          {/* HEADER */}
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '13px',
                    bgcolor: alpha('#10b981', 0.12),
                    border: `1px solid ${alpha('#10b981', 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                >
                  <RestartAltIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#10b981',
                    }}
                  >
                    Restablecimiento Oficial · Gestión 2027
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color: 'text.primary' }}>
                    Reactivar / Restablecer Reserva
                  </Typography>
                </Box>
              </Box>

              <Box
                onClick={() => !isProcesandoAccion && setModalReactivacionOpen(false)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '9px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: 'text.secondary',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  '&:hover': {
                    background: alpha('#10b981', 0.12),
                    borderColor: alpha('#10b981', 0.4),
                    color: '#10b981',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>

            <Box
              sx={{
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                width: '100%',
              }}
            />
          </Box>

          <DialogContent sx={{ px: 3, py: 2 }}>
            <Alert
              severity="success"
              sx={{
                mb: 2.5,
                borderRadius: '14px',
                bgcolor: alpha('#10b981', 0.1),
                border: `1px solid ${alpha('#10b981', 0.25)}`,
                color: isDark ? '#34d399' : '#047857',
                '& .MuiAlert-icon': { color: '#10b981' },
              }}
            >
              <strong>Restablecimiento de Plaza Escolar:</strong> Al reactivar, la reserva volverá a estado <strong>Confirmada</strong> para la Gestión 2027.
              Esta acción resuelve de manera exclusiva el caso en que la familia se arrepintió de la baja o solicitó continuar presencialmente en secretaría.
            </Alert>

            {reservaSeleccionada && (
              <Box
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: '16px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={reservaSeleccionada.estudiante_foto_url || undefined}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: isDark ? '#facc15' : '#0288d1',
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        border: `2px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                      }}
                    >
                      {!reservaSeleccionada.estudiante_foto_url && getInitials(reservaSeleccionada.estudiante_nombres, reservaSeleccionada.estudiante_apellido_paterno)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                        {reservaSeleccionada.estudiante_nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                        CI: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{reservaSeleccionada.estudiante_ci}</strong> · Cód: {reservaSeleccionada.codigo_reserva}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={reservaSeleccionada.grado_destino_nombre}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      bgcolor: alpha(isDark ? '#facc15' : '#0288d1', 0.15),
                      color: isDark ? '#facc15' : '#0288d1',
                      border: `1px solid ${alpha(isDark ? '#facc15' : '#0288d1', 0.3)}`,
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" display="block">
                  Tutor registrado: <strong>{reservaSeleccionada.tutor_nombre}</strong> · 📱 {reservaSeleccionada.tutor_telefono}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Notas de Reactivación / Justificación (Opcional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Ej. Familia solicitó reactivación presencial en secretaría tras desistir de la baja escolar..."
                value={motivoAdmin}
                onChange={(e) => setMotivoAdmin(e.target.value)}
                disabled={isProcesandoAccion}
                helperText="Anotación interna para constancia de restitución del cupo"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Box>
          </DialogContent>

          {/* FOOTER */}
          <Box
            sx={{
              px: 3,
              pb: 3,
              pt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            }}
          >
            <Button
              variant="text"
              color="inherit"
              onClick={() => setModalReactivacionOpen(false)}
              disabled={isProcesandoAccion}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              }}
            >
              Cancelar
            </Button>

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              onClick={handleConfirmarReactivacion}
              disabled={isProcesandoAccion}
              startIcon={isProcesandoAccion ? <CircularProgress size={16} color="inherit" /> : <RestartAltIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isProcesandoAccion ? 'Restableciendo...' : 'Confirmar Reactivación'}
            </Button>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
}
