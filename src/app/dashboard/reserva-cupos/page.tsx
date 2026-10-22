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
  ToggleButtonGroup,
  ToggleButton,
  alpha,
  Grid,
  Paper,
  Chip,
  Badge,
} from '@mui/material';
import {
  BookmarkAdded as BookmarkAddedIcon,
  ViewModule as ViewModuleIcon,
  TableRows as TableRowsIcon,
  Add as AddIcon,
  PictureAsPdfRounded as PictureAsPdfRoundedIcon,
  TableChartRounded as TableChartRoundedIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  ListAlt as ListAltIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
  HowToReg as HowToRegIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import reservaCupoService, {
  BalanceCuposAseguradosData,
  BalanceCupoGrado,
  EstudianteCupoAsegurado,
  EstadoCampanaWhatsApp,
} from '@/services/reservaCupoService';
import { ReservaCupoData, ReservaCupoHermanoData } from '@/types/reservaCupoTypes';
import { gestionAcademicaService } from '@/services/estudiantesService';

// Componentes modulares
import {
  StatCard,
  BtnDescarga,
  bounce,
  usePalette,
} from '@/components/reservaCupo/admin/common';
import { ListaReservasTab } from '@/components/reservaCupo/admin/ListaReservasTab';
import { SolicitudesAnulacionTab } from '@/components/reservaCupo/admin/SolicitudesAnulacionTab';
import { HermanosTab } from '@/components/reservaCupo/admin/HermanosTab';
import {
  CentroReportesTab,
  REPORTES_DISPONIBLES,
  ReporteDef,
} from '@/components/reservaCupo/admin/CentroReportesTab';
import { ModalAnulacionAdmin } from '@/components/reservaCupo/admin/ModalAnulacionAdmin';
import { ModalReactivacionAdmin } from '@/components/reservaCupo/admin/ModalReactivacionAdmin';
import { ModalNominaAsegurados } from '@/components/reservaCupo/admin/ModalNominaAsegurados';
import { ModalEliminarHermanoAdmin } from '@/components/reservaCupo/admin/ModalEliminarHermanoAdmin';
import { ModalAgendarEntrevistaHermano } from '@/components/reservaCupo/admin/ModalAgendarEntrevistaHermano';
import { ModalCampanaWhatsAppAdmin } from '@/components/reservaCupo/admin/ModalCampanaWhatsAppAdmin';
import CuposAseguradosTab from '@/components/reservaCupo/admin/CuposAseguradosTab';

export default function ReservaCuposDashboardPage() {
  const router = useRouter();
  const { theme, isDark, gold, gradBg } = usePalette();

  // 0: Lista de Reservas, 1: Solicitudes de Anulación, 2: Hermanos, 3: Centro de Reportes, 4: Cupos Asegurados
  const [activeTab, setActiveTab] = useState(0);

  // Por defecto en 'cards' como en el módulo de Estudiantes
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Paramétricas
  const [grados, setGrados] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);

  // Tab 0: Reservas
  const [reservas, setReservas] = useState<ReservaCupoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradoFilter, setGradoFilter] = useState<number | ''>('');
  const [nivelFilter, setNivelFilter] = useState<number | ''>('');
  const [turnoFilter, setTurnoFilter] = useState<number | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Exportación rápida en cabecera
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);

  // Tab 1: Solicitudes de Anulación
  const [solicitudes, setSolicitudes] = useState<ReservaCupoData[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  // Tab 2: Hermanos (Prioridad Familiar)
  const [hermanosList, setHermanosList] = useState<ReservaCupoHermanoData[]>([]);
  const [loadingHermanos, setLoadingHermanos] = useState(false);
  const [filtroEstadoHermano, setFiltroEstadoHermano] = useState('');
  const [searchHermano, setSearchHermano] = useState('');
  const [promoviendoHermanoId, setPromoviendoHermanoId] = useState<number | null>(null);
  const [exportandoHermanosExcel, setExportandoHermanosExcel] = useState(false);
  const [exportandoHermanosPdf, setExportandoHermanosPdf] = useState(false);
  const [hermanoSeleccionadoEliminar, setHermanoSeleccionadoEliminar] = useState<ReservaCupoHermanoData | null>(null);
  const [modalEliminarHermanoOpen, setModalEliminarHermanoOpen] = useState(false);
  const [motivoEliminarHermano, setMotivoEliminarHermano] = useState('Registro duplicado por el tutor');
  const [isEliminandoHermano, setIsEliminandoHermano] = useState(false);

  // Gestión de Entrevista para Hermanos (Tab 2)
  const [filtroEstadoEntrevistaHermano, setFiltroEstadoEntrevistaHermano] = useState('');
  const [hermanoSeleccionadoEntrevista, setHermanoSeleccionadoEntrevista] = useState<ReservaCupoHermanoData | null>(null);
  const [modalEntrevistaHermanoOpen, setModalEntrevistaHermanoOpen] = useState(false);
  const [isProcesandoEntrevistaHermano, setIsProcesandoEntrevistaHermano] = useState(false);

  // Tab 3: Centro de Reportes (Tipo Docente)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteDef>(REPORTES_DISPONIBLES[0]);
  const [repGradoId, setRepGradoId] = useState<number | ''>('');
  const [repNivelId, setRepNivelId] = useState<number | ''>('');
  const [repTurnoId, setRepTurnoId] = useState<number | ''>('');
  const [repSearch, setRepSearch] = useState('');
  const [repDescargandoPdf, setRepDescargandoPdf] = useState(false);
  const [repDescargandoExcel, setRepDescargandoExcel] = useState(false);

  // Tab 4: Balance de Cupos Asegurados (Continuidad de Estudiantes Regulares)
  const [balanceAsegurados, setBalanceAsegurados] = useState<BalanceCuposAseguradosData | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Modal para detalle de estudiantes asegurados de un grado en Tab 4
  const [modalEstudiantesBalanceOpen, setModalEstudiantesBalanceOpen] = useState(false);
  const [gradoSeleccionadoBalance, setGradoSeleccionadoBalance] = useState<BalanceCupoGrado | null>(null);
  const [filtroEstadoEstudiantesBalance, setFiltroEstadoEstudiantesBalance] = useState<'todos' | 'confirmados' | 'pendientes' | 'no_continua'>('todos');
  const [filtroTurnoModalBalance, setFiltroTurnoModalBalance] = useState<number | ''>('');
  const [searchEstudiantesBalance, setSearchEstudiantesBalance] = useState('');
  const [listaEstudiantesBalance, setListaEstudiantesBalance] = useState<EstudianteCupoAsegurado[]>([]);
  const [loadingEstudiantesBalance, setLoadingEstudiantesBalance] = useState(false);
  const [totalEstudiantesBalance, setTotalEstudiantesBalance] = useState(0);
  const [enviandoWhatsAppId, setEnviandoWhatsAppId] = useState<number | null>(null);
  const [enviandoWhatsAppMasivo, setEnviandoWhatsAppMasivo] = useState(false);
  const [modalCampanaWhatsAppOpen, setModalCampanaWhatsAppOpen] = useState(false);
  const [estadoCampanaWhatsApp, setEstadoCampanaWhatsApp] = useState<EstadoCampanaWhatsApp | null>(null);
  const [isProcesandoCampana, setIsProcesandoCampana] = useState(false);

  // Modales de acciones administrativas (Anulación y Reactivación)
  const [modalAnulacionOpen, setModalAnulacionOpen] = useState(false);
  const [modalReactivacionOpen, setModalReactivacionOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaCupoData | null>(null);
  const [motivoAdmin, setMotivoAdmin] = useState('');
  const [isProcesandoAccion, setIsProcesandoAccion] = useState(false);

  // Estadísticas globales
  const [stats, setStats] = useState({
    total_reservas: 0,
    total_confirmadas: 0,
    total_no_continua: 0,
    total_solicitud_anulacion: 0,
    total_anuladas: 0,
    total_inicial: 0,
    total_primaria: 0,
    total_secundaria: 0,
    total_hermanos: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Niveles académicos estándar
  const nivelesAcademicos = [
    { id: 1, nombre: 'Nivel Inicial' },
    { id: 2, nombre: 'Nivel Primaria' },
    { id: 3, nombre: 'Nivel Secundaria' },
  ];

  // Cargar parametricas (grados y turnos)
  useEffect(() => {
    const cargarParametricas = async () => {
      try {
        const [dataGrados, resTurnos] = await Promise.all([
          gestionAcademicaService.obtenerGrados(),
          api.get('/turno'),
        ]);
        setGrados(dataGrados || []);
        const listaTurnos = Array.isArray(resTurnos.data)
          ? resTurnos.data
          : (resTurnos.data?.data?.turnos || resTurnos.data?.turnos || []);
        setTurnos(listaTurnos || []);
      } catch (err) {
        console.error('Error al cargar grados o turnos:', err);
      }
    };
    cargarParametricas();
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
          total_hermanos: Number(data.resumen.total_hermanos || 0),
        });
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Cargar reservas (Tab 0)
  const cargarReservas = async () => {
    setIsLoading(true);
    try {
      const data = await reservaCupoService.listarAdmin({
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
        turno_destino_id: turnoFilter ? Number(turnoFilter) : undefined,
        estado: estadoFilter || undefined,
        page,
        limit: rowsPerPage,
      });

      if (data) {
        setReservas(data.reservas || []);
        if (data.paginacion) {
          setTotalPages(data.paginacion.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error al listar reservas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar solicitudes de anulación pendientes (Tab 1)
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

  // Cargar hermanos postulantes (Tab 2)
  const cargarHermanos = async () => {
    setLoadingHermanos(true);
    try {
      const data = await reservaCupoService.listarHermanosAdmin({
        estado: filtroEstadoHermano || undefined,
        estado_entrevista: filtroEstadoEntrevistaHermano || undefined,
        search: searchHermano.trim() || undefined,
        limit: 100,
      });
      setHermanosList(data?.hermanos || []);
    } catch (err) {
      console.error('Error al listar hermanos:', err);
    } finally {
      setLoadingHermanos(false);
    }
  };

  // Cargar balance de cupos asegurados (Tab 4)
  const cargarBalanceAsegurados = async () => {
    setLoadingBalance(true);
    try {
      const data = await reservaCupoService.obtenerBalanceCuposAsegurados(2027);
      setBalanceAsegurados(data);
    } catch (err) {
      console.error('Error al cargar balance de cupos asegurados:', err);
      toast.error('Error al cargar balance de cupos asegurados');
    } finally {
      setLoadingBalance(false);
    }
  };

  // Cargar estudiantes de un curso asegurado para el modal
  const cargarEstudiantesGradoBalance = async (
    gradoId?: number,
    turnoId?: number | '',
    estado?: 'todos' | 'confirmados' | 'pendientes' | 'no_continua',
    busqueda?: string
  ) => {
    if (!gradoId) return;
    setLoadingEstudiantesBalance(true);
    try {
      const data = await reservaCupoService.obtenerEstudiantesCuposAsegurados({
        grado_destino_id: gradoId,
        turno_destino_id: turnoId ? Number(turnoId) : undefined,
        estado_confirmacion: estado || 'todos',
        busqueda: busqueda?.trim() || undefined,
        limite: 150,
      });
      setListaEstudiantesBalance(data?.estudiantes || []);
      setTotalEstudiantesBalance(data?.total || 0);
    } catch (err) {
      console.error('Error al cargar estudiantes con cupo asegurado:', err);
      toast.error('Error al cargar estudiantes del grado');
    } finally {
      setLoadingEstudiantesBalance(false);
    }
  };

  const handleAbrirDetalleGrado = (grado: BalanceCupoGrado) => {
    setGradoSeleccionadoBalance(grado);
    setFiltroEstadoEstudiantesBalance('todos');
    setFiltroTurnoModalBalance('');
    setSearchEstudiantesBalance('');
    setModalEstudiantesBalanceOpen(true);
    cargarEstudiantesGradoBalance(grado.grado_destino_id, '', 'todos', '');
  };

  const handleEmitirReporteGrado = (gradoId: number) => {
    const repNomina = REPORTES_DISPONIBLES.find((r) => r.id === 'por_grado_turno') || REPORTES_DISPONIBLES[1];
    setReporteSeleccionado(repNomina);
    setRepGradoId(gradoId);
    setActiveTab(3);
    toast('Selecciona el turno y descarga la nómina oficial en PDF o Excel', { icon: 'ℹ️' });
  };

  const handleEnviarRecordatorioWhatsApp = async (estudiante: EstudianteCupoAsegurado, mensajePersonalizado?: string) => {
    if (!estudiante.tutor_telefono) {
      toast.error('No hay número de teléfono o celular registrado para este tutor');
      return;
    }

    setEnviandoWhatsAppId(estudiante.estudiante_id);
    const toastId = toast.loading(`Enviando recordatorio directo vía Evolution API a ${estudiante.tutor_nombre || 'tutor'}...`);

    try {
      const res = await reservaCupoService.enviarRecordatorioContinuidadWhatsApp({
        estudiante_id: estudiante.estudiante_id,
        tutor_telefono: estudiante.tutor_telefono,
        tutor_nombre: estudiante.tutor_nombre || undefined,
        nombre_completo: estudiante.nombre_completo,
        ci: estudiante.ci,
        grado_destino_nombre: estudiante.grado_destino_nombre,
        turno_destino_nombre: estudiante.turno_destino_nombre,
        mensaje_personalizado: mensajePersonalizado,
        anio_destino: 2027
      });

      toast.success(res.message || 'Recordatorio enviado directamente vía WhatsApp (Evolution API)', { id: toastId });
    } catch (error) {
      console.error('Error al enviar recordatorio por WhatsApp:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || 'Error al enviar recordatorio vía WhatsApp';
      toast.error(msg, { id: toastId });
    } finally {
      setEnviandoWhatsAppId(null);
    }
  };

  const handleEnviarRecordatorioWhatsAppMasivo = async (estudiantes: EstudianteCupoAsegurado[]) => {
    const pendientesConTel = estudiantes.filter(e => e.estado_confirmacion === 'PENDIENTE' && Boolean(e.tutor_telefono));
    if (pendientesConTel.length === 0) {
      toast.error('No hay estudiantes pendientes con número de WhatsApp registrado');
      return;
    }

    setEnviandoWhatsAppMasivo(true);
    const toastId = toast.loading(`Encolando ${pendientesConTel.length} recordatorios vía Evolution API...`);

    try {
      const res = await reservaCupoService.enviarRecordatorioContinuidadMasivoWhatsApp({
        estudiantes: pendientesConTel,
        anio_destino: 2027
      });

      toast.success(res.message || `Se encolaron ${pendientesConTel.length} recordatorios de cupo por WhatsApp`, { id: toastId });
    } catch (error) {
      console.error('Error en envío masivo de recordatorios:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || 'Error al enviar recordatorios masivos';
      toast.error(msg, { id: toastId });
    } finally {
      setEnviandoWhatsAppMasivo(false);
    }
  };

  // Consultar estado de campaña WhatsApp masiva y polling en tiempo real
  const consultarEstadoCampana = async () => {
    try {
      const estado = await reservaCupoService.obtenerEstadoCampanaWhatsApp();
      setEstadoCampanaWhatsApp(estado);
      return estado;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    consultarEstadoCampana();
  }, []);

  useEffect(() => {
    if (!estadoCampanaWhatsApp?.activo) return;
    const interval = setInterval(async () => {
      const est = await consultarEstadoCampana();
      if (!est?.activo) {
        clearInterval(interval);
        cargarBalanceAsegurados();
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [estadoCampanaWhatsApp?.activo]);

  const handleIniciarCampanaMasiva = async (params: {
    grado_destino_id?: number | 'todos';
    delay_min_seg?: number;
    delay_max_seg?: number;
  }) => {
    setIsProcesandoCampana(true);
    try {
      const res = await reservaCupoService.iniciarCampanaWhatsApp({
        grado_destino_id: params.grado_destino_id,
        delay_min_seg: params.delay_min_seg,
        delay_max_seg: params.delay_max_seg,
        anio_destino: 2027
      });
      toast.success(res.message);
      await consultarEstadoCampana();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || 'Error al iniciar campaña');
    } finally {
      setIsProcesandoCampana(false);
    }
  };

  const handleDetenerCampanaMasiva = async () => {
    setIsProcesandoCampana(true);
    try {
      const res = await reservaCupoService.detenerCampanaWhatsApp();
      toast.success(res.message);
      await consultarEstadoCampana();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || 'Error al detener campaña');
    } finally {
      setIsProcesandoCampana(false);
    }
  };

  // Efectos de carga
  useEffect(() => {
    cargarEstadisticas();
    cargarSolicitudes();
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      cargarReservas();
    } else if (activeTab === 1) {
      cargarSolicitudes();
    } else if (activeTab === 2) {
      cargarHermanos();
    } else if (activeTab === 4) {
      cargarBalanceAsegurados();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 2) {
      cargarHermanos();
    }
  }, [searchHermano, filtroEstadoHermano, filtroEstadoEntrevistaHermano]);

  useEffect(() => {
    if (activeTab === 0) {
      cargarReservas();
    }
  }, [page, searchTerm, gradoFilter, nivelFilter, turnoFilter, estadoFilter]);

  // Manejo de exportación de Hermanos
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

  // Promover hermano a confirmado
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

  // Exportación rápida de la cabecera
  const handleExportarExcel = async () => {
    if (activeTab === 2) {
      return handleExportarHermanosExcel();
    }
    setExportandoExcel(true);
    try {
      await reservaCupoService.exportarReporte('excel', {
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
        turno_destino_id: turnoFilter ? Number(turnoFilter) : undefined,
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
    if (activeTab === 2) {
      return handleExportarHermanosPdf();
    }
    setExportandoPdf(true);
    try {
      await reservaCupoService.exportarReporte('pdf', {
        search: searchTerm.trim() || undefined,
        grado_destino_id: gradoFilter ? Number(gradoFilter) : undefined,
        nivel_destino_id: nivelFilter ? Number(nivelFilter) : undefined,
        turno_destino_id: turnoFilter ? Number(turnoFilter) : undefined,
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

  // Centro de reportes (Tab 3)
  const handleDescargarReporteCentro = async (formato: 'pdf' | 'excel') => {
    const setLoader = formato === 'pdf' ? setRepDescargandoPdf : setRepDescargandoExcel;
    setLoader(true);
    try {
      if (reporteSeleccionado.id === 'hermanos' || reporteSeleccionado.id === 'hermanos_espera') {
        const estadoHermanos = reporteSeleccionado.id === 'hermanos_espera' ? 'en_espera' : undefined;
        await reservaCupoService.exportarReporteHermanos(formato, {
          search: repSearch.trim() || undefined,
          grado_solicitado_id: repGradoId ? Number(repGradoId) : undefined,
          turno_solicitado_id: repTurnoId ? Number(repTurnoId) : undefined,
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
        turno_destino_id: repTurnoId ? Number(repTurnoId) : undefined,
        estado: estadoFiltroReporte,
        tipo_reporte: reporteSeleccionado.id,
        titulo_reporte: reporteSeleccionado.titulo,
      });
      toast.success(`Reporte ${reporteSeleccionado.titulo} (${formato.toUpperCase()}) generado con éxito`);
    } catch (err) {
      console.error('Error al descargar reporte:', err);
      toast.error(`Error al generar el reporte en ${formato.toUpperCase()}`);
    } finally {
      setLoader(false);
    }
  };

  const handleDescargarPDFRecibo = (codigo: string) => {
    reservaCupoService.descargarPDF(codigo);
  };

  const handleImprimirRecibo = (codigo: string) => {
    const url = reservaCupoService.getReciboPDFUrl(codigo, true);
    window.open(url, '_blank');
  };

  const handleWhatsAppReserva = (r: ReservaCupoData) => {
    const tel = r.tutor_telefono.replace(/\D/g, '');
    const numWhatsapp = tel.startsWith('591') ? tel : `591${tel}`;
    const texto = encodeURIComponent(
      `Hola ${r.tutor_nombre}, le saludamos de la U.E.P. La Voz de Cristo respecto a la Reserva de Cupo de ${r.estudiante_nombre_completo} para la Gestión 2027 (Código: ${r.codigo_reserva}).`
    );
    window.open(`https://api.whatsapp.com/send?phone=${numWhatsapp}&text=${texto}`, '_blank');
  };

  // Modales de anulación / reactivación
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

  // Eliminación definitiva de hermano (libera cupo en caso de duplicados)
  const handleAbrirEliminarHermano = (hermano: ReservaCupoHermanoData) => {
    setHermanoSeleccionadoEliminar(hermano);
    setMotivoEliminarHermano('Registro duplicado por el tutor');
    setModalEliminarHermanoOpen(true);
  };

  const handleConfirmarEliminarHermano = async () => {
    if (!hermanoSeleccionadoEliminar) return;
    setIsEliminandoHermano(true);
    try {
      const resp = await reservaCupoService.eliminarHermanoAdmin(
        hermanoSeleccionadoEliminar.id,
        motivoEliminarHermano.trim() || undefined
      );
      toast.success(resp.message || 'Registro de hermano eliminado y cupo liberado exitosamente');
      setModalEliminarHermanoOpen(false);
      setHermanoSeleccionadoEliminar(null);
      setMotivoEliminarHermano('Registro duplicado por el tutor');
      cargarHermanos();
      cargarEstadisticas();
      cargarBalanceAsegurados();
    } catch (err: any) {
      console.error('Error al eliminar cupo de hermano:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Error al eliminar el registro de hermano');
    } finally {
      setIsEliminandoHermano(false);
    }
  };

  // Manejadores para la entrevista de hermanos
  const handleAbrirAgendarEntrevista = (hermano: ReservaCupoHermanoData) => {
    setHermanoSeleccionadoEntrevista(hermano);
    setModalEntrevistaHermanoOpen(true);
  };

  const handleGuardarEntrevistaHermano = async (payload: {
    fecha_entrevista: string;
    modalidad_entrevista: 'presencial' | 'virtual';
    lugar_entrevista?: string;
    enlace_entrevista?: string;
    observaciones_entrevista?: string;
    notificar_whatsapp: boolean;
    hermano_ids?: number[];
  }) => {
    if (!hermanoSeleccionadoEntrevista) return;
    setIsProcesandoEntrevistaHermano(true);
    try {
      const resp = await reservaCupoService.agendarEntrevistaHermano(
        hermanoSeleccionadoEntrevista.id,
        payload
      );
      toast.success(resp.message || 'Entrevista agendada exitosamente');
      if (payload.notificar_whatsapp) {
        if (resp.whatsapp?.enviado) {
          toast.success('Citación enviada por WhatsApp al tutor');
        } else if (resp.whatsapp?.error) {
          toast('Cita guardada pero hubo un aviso en WhatsApp: ' + resp.whatsapp.error, { icon: '⚠️' });
        }
      }
      setModalEntrevistaHermanoOpen(false);
      setHermanoSeleccionadoEntrevista(null);
      cargarHermanos();
    } catch (err: any) {
      console.error('Error al agendar entrevista:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Error al agendar entrevista');
    } finally {
      setIsProcesandoEntrevistaHermano(false);
    }
  };

  const handleCambiarEstadoEntrevistaHermano = async (
    nuevoEstado: 'pendiente' | 'programada' | 'realizada' | 'aprobada' | 'no_asistio',
    hermanoIds?: number[]
  ) => {
    if (!hermanoSeleccionadoEntrevista) return;
    setIsProcesandoEntrevistaHermano(true);
    try {
      const resp = await reservaCupoService.actualizarEstadoEntrevistaHermano(
        hermanoSeleccionadoEntrevista.id,
        {
          estado_entrevista: nuevoEstado,
          hermano_ids: hermanoIds && hermanoIds.length > 0 ? hermanoIds : [hermanoSeleccionadoEntrevista.id],
        }
      );
      toast.success(resp.message || `Estado de entrevista actualizado a "${nuevoEstado}"`);
      setModalEntrevistaHermanoOpen(false);
      setHermanoSeleccionadoEntrevista(null);
      cargarHermanos();
    } catch (err: any) {
      console.error('Error al cambiar estado de entrevista:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Error al cambiar estado de entrevista');
    } finally {
      setIsProcesandoEntrevistaHermano(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            {/* ══ HEADER PRINCIPAL ══ */}
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
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3, mt: 0.5 }}>
                  Supervisa y gestiona la continuidad de estudiantes regulares. Exporta reportes oficiales en PDF y Excel como en notas.
                </Typography>
              </Box>

              {/* DERECHA: BOTONES DE ACCIÓN RÁPIDA */}
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
                <BtnDescarga
                  label="Exportar Excel"
                  icon={<TableChartRoundedIcon sx={{ fontSize: 20 }} />}
                  color="#10b981"
                  gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                  loading={exportandoExcel || exportandoHermanosExcel}
                  disabled={exportandoPdf || exportandoHermanosPdf}
                  onClick={handleExportarExcel}
                />

                <BtnDescarga
                  label="Exportar PDF"
                  icon={<PictureAsPdfRoundedIcon sx={{ fontSize: 20 }} />}
                  color="#ef4444"
                  gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                  loading={exportandoPdf || exportandoHermanosPdf}
                  disabled={exportandoExcel || exportandoHermanosExcel}
                  onClick={handleExportarPDF}
                />

                {activeTab === 0 && (
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      borderRadius: '12px',
                      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                      p: 0.3,
                      '& .MuiToggleButton-root': {
                        borderRadius: '10px !important',
                        border: 'none',
                        px: 1.8,
                        py: 0.7,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.82rem',
                        color: 'text.secondary',
                        '&.Mui-selected': {
                          background: gradBg,
                          color: isDark ? '#000' : '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="cards">
                      <ViewModuleIcon sx={{ fontSize: 19, mr: 0.6 }} />
                      Tarjetas
                    </ToggleButton>
                    <ToggleButton value="table">
                      <TableRowsIcon sx={{ fontSize: 19, mr: 0.6 }} />
                      Tabla
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/reserva-cupo')}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 3,
                    py: 1.1,
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                    boxShadow: isDark ? '0 4px 14px rgba(250, 204, 21, 0.4)' : '0 4px 14px rgba(2, 136, 209, 0.4)',
                    '&:hover': {
                      background: isDark
                        ? 'linear-gradient(135deg, #eab308 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #0277bd 0%, #014377 100%)',
                    },
                  }}
                >
                  Nueva Reserva
                </Button>
              </Box>
            </Box>

            {/* ══ TARJETAS DE ESTADÍSTICAS CUANTITATIVAS ══ */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Reservas"
                  value={loadingStats ? '...' : stats.total_reservas}
                  icon={<BookmarkAddedIcon />}
                  color={isDark ? '#facc15' : '#0288d1'}
                  subtitle="Respuestas registradas 2027"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Confirmadas"
                  value={loadingStats ? '...' : stats.total_confirmadas}
                  icon={<CheckCircleIcon />}
                  color="#10b981"
                  subtitle="Cupo asegurado para 2027"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="No Continuarán"
                  value={loadingStats ? '...' : stats.total_no_continua}
                  icon={<CancelIcon />}
                  color="#ef4444"
                  subtitle="Cupos liberados para nuevos"
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

            {/* ══ PESTAÑAS (TABS) - ESTILO OFICIAL DOCENTE NOTAS / CALIFICACIONES ══ */}
            <Fade in timeout={450}>
              <Box sx={{ mb: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    background: gradBg,
                    borderRadius: '16px',
                    p: { xs: 0.6, md: 0.9 },
                    minHeight: { xs: 40, md: 48 },
                    boxShadow: isDark
                      ? '0 6px 22px rgba(250, 204, 21, 0.28)'
                      : '0 6px 22px rgba(2, 136, 209, 0.28)',
                    '& .MuiTabs-flexContainer': {
                      flexWrap: 'nowrap',
                      gap: 0.6,
                    },
                    '& .MuiTabs-scrollButtons': {
                      color: isDark ? '#000' : '#fff',
                      width: { xs: 28, md: 40 },
                      flexShrink: 0,
                      '&.Mui-disabled': { opacity: 0.3 },
                    },
                    '& .MuiTab-root': {
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      minWidth: 'max-content',
                      flexShrink: 0,
                      minHeight: { xs: 38, md: 44 },
                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                      whiteSpace: 'nowrap',
                      color: isDark ? alpha('#000', 0.72) : alpha('#fff', 0.85),
                      px: { xs: 2, md: 2.8 },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        color: isDark ? '#000' : '#fff',
                        bgcolor: isDark ? alpha('#000', 0.1) : alpha('#fff', 0.12),
                      },
                    },
                    '& .Mui-selected': {
                      color: `${isDark ? '#000' : '#fff'} !important`,
                      bgcolor: isDark ? alpha('#000', 0.2) : alpha('#fff', 0.24),
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: isDark ? '#000' : '#fff',
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                >
                  <Tab
                    icon={<ListAltIcon sx={{ mr: 0.8, fontSize: 19 }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span>Lista de Reservas</span>
                        {stats.total_reservas > 0 && (
                          <Box
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
                              color: isDark ? '#000' : '#fff',
                              borderRadius: '20px',
                              px: 0.9,
                              py: 0.1,
                            }}
                          >
                            {stats.total_reservas}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    icon={<WarningAmberIcon sx={{ mr: 0.8, fontSize: 19 }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span>Solicitudes de Anulación</span>
                        {stats.total_solicitud_anulacion > 0 && (
                          <Box
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: '#ef4444',
                              color: '#ffffff',
                              borderRadius: '20px',
                              px: 0.9,
                              py: 0.1,
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                            }}
                          >
                            {stats.total_solicitud_anulacion}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    icon={<StarIcon sx={{ mr: 0.8, fontSize: 19 }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span>Hermanos (Prioridad Familiar)</span>
                        {hermanosList.length > 0 && (
                          <Box
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
                              color: isDark ? '#000' : '#fff',
                              borderRadius: '20px',
                              px: 0.9,
                              py: 0.1,
                            }}
                          >
                            {hermanosList.length}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    icon={<AssessmentIcon sx={{ mr: 0.8, fontSize: 19 }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span>Centro de Reportes</span>
                        <Box
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
                            color: isDark ? '#000' : '#fff',
                            borderRadius: '20px',
                            px: 0.9,
                            py: 0.1,
                          }}
                        >
                          9 Informes
                        </Box>
                      </Box>
                    }
                  />
                  <Tab
                    icon={<HowToRegIcon sx={{ mr: 0.8, fontSize: 19 }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span>Cupos Asegurados (Continuidad)</span>
                        <Box
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
                            color: isDark ? '#000' : '#fff',
                            borderRadius: '20px',
                            px: 0.9,
                            py: 0.1,
                          }}
                        >
                          {balanceAsegurados?.totales_globales?.total_asegurados
                            ? `${balanceAsegurados.totales_globales.total_confirmados}/${balanceAsegurados.totales_globales.total_asegurados}`
                            : '2027'}
                        </Box>
                      </Box>
                    }
                  />
                </Tabs>
              </Box>
            </Fade>

            {/* TAB 0: LISTA DE RESERVAS */}
            {activeTab === 0 && (
              <ListaReservasTab
                reservas={reservas}
                isLoading={isLoading}
                viewMode={viewMode}
                grados={grados}
                turnos={turnos}
                nivelesAcademicos={nivelesAcademicos}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                gradoFilter={gradoFilter}
                setGradoFilter={setGradoFilter}
                nivelFilter={nivelFilter}
                setNivelFilter={setNivelFilter}
                turnoFilter={turnoFilter}
                setTurnoFilter={setTurnoFilter}
                estadoFilter={estadoFilter}
                setEstadoFilter={setEstadoFilter}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                onDescargarPDF={handleDescargarPDFRecibo}
                onImprimir={handleImprimirRecibo}
                onWhatsApp={handleWhatsAppReserva}
                onAbrirAnular={handleAbrirAnular}
                onAbrirReactivar={handleAbrirReactivar}
              />
            )}

            {/* TAB 1: SOLICITUDES DE ANULACIÓN */}
            {activeTab === 1 && (
              <SolicitudesAnulacionTab
                solicitudes={solicitudes}
                loadingSolicitudes={loadingSolicitudes}
                onRefresh={cargarSolicitudes}
                onAbrirAnular={handleAbrirAnular}
                onAbrirReactivar={handleAbrirReactivar}
                onWhatsApp={handleWhatsAppReserva}
                onDescargarPDF={handleDescargarPDFRecibo}
              />
            )}

            {/* TAB 2: HERMANOS (PRIORIDAD FAMILIAR) */}
            {activeTab === 2 && (
              <HermanosTab
                hermanosList={hermanosList}
                loadingHermanos={loadingHermanos}
                searchHermano={searchHermano}
                onSearchHermanoChange={setSearchHermano}
                filtroEstadoHermano={filtroEstadoHermano}
                onFiltroEstadoHermanoChange={setFiltroEstadoHermano}
                filtroEstadoEntrevista={filtroEstadoEntrevistaHermano}
                onFiltroEstadoEntrevistaChange={setFiltroEstadoEntrevistaHermano}
                onRefresh={cargarHermanos}
                onExportarExcel={handleExportarHermanosExcel}
                onExportarPdf={handleExportarHermanosPdf}
                exportandoExcel={exportandoHermanosExcel}
                exportandoPdf={exportandoHermanosPdf}
                promoviendoHermanoId={promoviendoHermanoId}
                onPromoverHermano={handlePromoverHermano}
                onDescargarPDF={handleDescargarPDFRecibo}
                onEliminarHermano={handleAbrirEliminarHermano}
                onAgendarEntrevista={handleAbrirAgendarEntrevista}
              />
            )}

            {/* TAB 3: CENTRO DE REPORTES Y EXPORTACIÓN */}
            {activeTab === 3 && (
              <CentroReportesTab
                reporteSeleccionado={reporteSeleccionado}
                onSeleccionarReporte={setReporteSeleccionado}
                repGradoId={repGradoId}
                onRepGradoChange={setRepGradoId}
                repNivelId={repNivelId}
                onRepNivelChange={setRepNivelId}
                repTurnoId={repTurnoId}
                onRepTurnoChange={setRepTurnoId}
                repSearch={repSearch}
                onRepSearchChange={setRepSearch}
                grados={grados}
                turnos={turnos}
                nivelesAcademicos={nivelesAcademicos}
                descargandoPdf={repDescargandoPdf}
                descargandoExcel={repDescargandoExcel}
                onDescargar={handleDescargarReporteCentro}
              />
            )}

            {/* TAB 4: CUPOS ASEGURADOS (CONTINUIDAD REGULARES) */}
            {activeTab === 4 && (
              <CuposAseguradosTab
                balanceAsegurados={balanceAsegurados}
                loadingBalance={loadingBalance}
                estadoCampana={estadoCampanaWhatsApp}
                onRefresh={cargarBalanceAsegurados}
                onAbrirDetalleGrado={handleAbrirDetalleGrado}
                onEmitirReporte={handleEmitirReporteGrado}
                onAbrirCampanaWhatsApp={() => setModalCampanaWhatsAppOpen(true)}
                onDetenerCampana={handleDetenerCampanaMasiva}
              />
            )}
          </Box>
        </Fade>

        {/* MODAL DE ANULACIÓN DE RESERVA */}
        <ModalAnulacionAdmin
          open={modalAnulacionOpen}
          reserva={reservaSeleccionada}
          motivo={motivoAdmin}
          isProcesando={isProcesandoAccion}
          onClose={() => {
            setModalAnulacionOpen(false);
            setReservaSeleccionada(null);
          }}
          onMotivoChange={setMotivoAdmin}
          onConfirmar={handleConfirmarAnulacion}
        />

        {/* MODAL DE REACTIVACIÓN DE RESERVA */}
        <ModalReactivacionAdmin
          open={modalReactivacionOpen}
          reserva={reservaSeleccionada}
          motivo={motivoAdmin}
          isProcesando={isProcesandoAccion}
          onClose={() => {
            setModalReactivacionOpen(false);
            setReservaSeleccionada(null);
          }}
          onMotivoChange={setMotivoAdmin}
          onConfirmar={handleConfirmarReactivacion}
        />

        {/* MODAL PARA ELIMINAR CUPO DE HERMANO (REGISTROS DUPLICADOS O BAJAS) */}
        <ModalEliminarHermanoAdmin
          open={modalEliminarHermanoOpen}
          hermano={hermanoSeleccionadoEliminar}
          motivo={motivoEliminarHermano}
          isProcesando={isEliminandoHermano}
          onClose={() => {
            if (!isEliminandoHermano) {
              setModalEliminarHermanoOpen(false);
              setHermanoSeleccionadoEliminar(null);
            }
          }}
          onMotivoChange={setMotivoEliminarHermano}
          onConfirmar={handleConfirmarEliminarHermano}
        />

        {/* MODAL DE NÓMINA DE ESTUDIANTES CON CUPO ASEGURADO */}
        <ModalNominaAsegurados
          open={modalEstudiantesBalanceOpen}
          grado={gradoSeleccionadoBalance}
          estudiantes={listaEstudiantesBalance}
          loading={loadingEstudiantesBalance}
          total={totalEstudiantesBalance}
          filtroEstado={filtroEstadoEstudiantesBalance}
          filtroTurno={filtroTurnoModalBalance}
          search={searchEstudiantesBalance}
          onClose={() => setModalEstudiantesBalanceOpen(false)}
          onFiltroEstadoChange={(estado) => {
            setFiltroEstadoEstudiantesBalance(estado);
            if (gradoSeleccionadoBalance) {
              cargarEstudiantesGradoBalance(
                gradoSeleccionadoBalance.grado_destino_id,
                filtroTurnoModalBalance,
                estado,
                searchEstudiantesBalance
              );
            }
          }}
          onFiltroTurnoChange={(turnoId) => {
            setFiltroTurnoModalBalance(turnoId);
            if (gradoSeleccionadoBalance) {
              cargarEstudiantesGradoBalance(
                gradoSeleccionadoBalance.grado_destino_id,
                turnoId,
                filtroEstadoEstudiantesBalance,
                searchEstudiantesBalance
              );
            }
          }}
          onSearchChange={(query) => {
            setSearchEstudiantesBalance(query);
            if (gradoSeleccionadoBalance) {
              cargarEstudiantesGradoBalance(
                gradoSeleccionadoBalance.grado_destino_id,
                filtroTurnoModalBalance,
                filtroEstadoEstudiantesBalance,
                query
              );
            }
          }}
          onEnviarWhatsApp={handleEnviarRecordatorioWhatsApp}
          enviandoWhatsAppId={enviandoWhatsAppId}
          enviandoWhatsAppMasivo={enviandoWhatsAppMasivo}
          onEnviarWhatsAppMasivo={handleEnviarRecordatorioWhatsAppMasivo}
        />

        {/* MODAL DE CAMPAÑA MASIVA WHATSAPP ANTI-BANEO (COLEGIO COMPLETO O GRADO) */}
        <ModalCampanaWhatsAppAdmin
          open={modalCampanaWhatsAppOpen}
          grados={balanceAsegurados?.grados || []}
          totalPendientesColegio={
            balanceAsegurados?.totales_globales?.total_restantes ??
            balanceAsegurados?.resumen?.total_restantes ??
            0
          }
          estadoCampana={estadoCampanaWhatsApp}
          isProcesando={isProcesandoCampana}
          onClose={() => setModalCampanaWhatsAppOpen(false)}
          onIniciarCampana={handleIniciarCampanaMasiva}
          onDetenerCampana={handleDetenerCampanaMasiva}
        />

        {/* MODAL DE AGENDAR / REPROGRAMAR ENTREVISTA DE HERMANO */}
        <ModalAgendarEntrevistaHermano
          open={modalEntrevistaHermanoOpen}
          hermano={hermanoSeleccionadoEntrevista}
          onClose={() => {
            setModalEntrevistaHermanoOpen(false);
            setHermanoSeleccionadoEntrevista(null);
          }}
          onGuardar={handleGuardarEntrevistaHermano}
          onCambiarEstadoEntrevista={handleCambiarEstadoEntrevistaHermano}
          isProcesando={isProcesandoEntrevistaHermano}
        />
      </Container>
    </Box>
  );
}
