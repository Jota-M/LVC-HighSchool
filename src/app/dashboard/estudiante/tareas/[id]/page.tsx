'use client';
// app/dashboard/estudiante/tareas/[id]/page.tsx
// Vista completa de detalle de tarea / evaluación para el estudiante

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Container, Typography, Chip, Divider, Stack, Skeleton,
  IconButton, useTheme, alpha, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
  LinearProgress, Alert, Grid, Card, CardContent, Tooltip,
  TextField, CircularProgress, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import EventIcon from '@mui/icons-material/Event';
import ScaleIcon from '@mui/icons-material/Scale';
import CommentIcon from '@mui/icons-material/Comment';
import GradeIcon from '@mui/icons-material/Grade';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BlockIcon from '@mui/icons-material/Block';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { toast } from 'react-hot-toast';

import api from '@/lib/api';
import estudianteService from '@/services/estudianteService';
import { entregasService } from '@/services/notasService';
import type { TareaEstudiante, EstadoTarea } from '@/types/estudiante';

// ─── Niveles de Autoevaluación (1 a 5 pts directos · 5% ponderado) ───
const NIVELES_AUTO = [
  { valor: 5, label: 'Excelente', emoji: '🌟', color: '#10b981', desc: 'Cumplí plenamente con mis responsabilidades y metas' },
  { valor: 4, label: 'Muy bueno', emoji: '✨', color: '#3b82f6', desc: 'Buen desempeño, participación constante y cumplimiento' },
  { valor: 3, label: 'Aceptable', emoji: '👍', color: '#eab308', desc: 'Cumplí con lo básico e indispensable requerido' },
  { valor: 2, label: 'En desarrollo', emoji: '⚠️', color: '#f97316', desc: 'Tuve dificultades y faltas de compromiso' },
  { valor: 1, label: 'Necesito mejorar', emoji: '🛑', color: '#ef4444', desc: 'No alcancé los objetivos mínimos esperados' },
];

// ─── Animaciones ──────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Configuración de Estados y Dimensiones ───────────────────
const ESTADO_CONFIG: Record<EstadoTarea, { label: string; color: string; gradient: string }> = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  entregado: { label: 'Entregado', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  atrasado: { label: 'Atrasado', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
  ausente: { label: 'Ausente', color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)' },
};

const DIMENSIONES: Record<string, { label: string; color: string }> = {
  SER: { label: 'Ser', color: '#10B981' },
  SAB: { label: 'Saber', color: '#3B82F6' },
  HAC: { label: 'Hacer', color: '#F59E0B' },
  AUTO: { label: 'Autoevaluación', color: '#8B5CF6' },
  AUT: { label: 'Autoevaluación', color: '#8B5CF6' },
};

const TIPOS_LABELS: Record<string, string> = {
  tarea: 'Tarea',
  examen: 'Examen',
  trabajo: 'Trabajo',
  practica: 'Práctica',
  proyecto: 'Proyecto',
  exposicion: 'Exposición',
  quiz: 'Quiz',
};

// ─── Tipos Locales ────────────────────────────────────────────
interface CriterioRubrica {
  id: number;
  criterio: string;
  descripcion?: string;
  nivel_excelente?: string;
  nivel_bueno?: string;
  nivel_basico?: string;
  puntos_posibles: number;
}

interface EvaluacionCompleta {
  id: number;
  titulo?: string;
  nombre?: string;
  modalidad?: 'presencial' | 'virtual';
  tipo?: string;
  duracion_minutos?: number | null;
  fecha_hora_inicio?: string | null;
  fecha_hora_fin?: string | null;
  foto_url?: string | null;
  pdf_url?: string | null;
  pdf_nombre?: string | null;
  instrucciones?: string | null;
  descripcion?: string | null;
  puntaje_maximo?: number;
  peso_en_dimension?: number;
  fecha_evaluacion?: string | null;
  fecha_limite?: string | null;
  permite_entrega_archivo?: boolean;
  rubrica: CriterioRubrica[];
}

// ─── Helpers de Fecha ─────────────────────────────────────────
const parseFechaBolivia = (val?: string | null) => {
  if (!val) return null;
  if (typeof val === 'string') {
    const s = val.trim();
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(s)) {
      return new Date(`${s.replace(' ', 'T')}-04:00`);
    }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const formatFechaHora = (val?: string | null) => {
  const d = parseFechaBolivia(val);
  if (!d) return '—';
  return d.toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatFechaLarga = (val?: string | null) => {
  const d = parseFechaBolivia(val);
  if (!d) return '—';
  return d.toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatDias = (dias: number | null | undefined) => {
  if (dias == null) return 'Sin fecha límite';
  if (dias < 0) return `Venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días restantes`;
};

const colorDias = (dias: number | null | undefined, estado: EstadoTarea, isDark: boolean) => {
  if (estado === 'entregado') return isDark ? '#34d399' : '#10b981';
  if (estado === 'atrasado') return isDark ? '#f87171' : '#ef4444';
  if (dias == null) return isDark ? '#9ca3af' : '#6b7280';
  if (dias <= 1) return isDark ? '#f87171' : '#ef4444';
  if (dias <= 3) return isDark ? '#fbbf24' : '#f59e0b';
  return isDark ? '#9ca3af' : '#6b7280';
};

// ─── Ícono de Estado ──────────────────────────────────────────
const EstadoIcon: React.FC<{ estado: EstadoTarea; size?: number }> = ({ estado, size = 20 }) => {
  const sx = { fontSize: size };
  if (estado === 'entregado') return <CheckCircleRoundedIcon sx={sx} />;
  if (estado === 'atrasado') return <CancelRoundedIcon sx={sx} />;
  if (estado === 'ausente') return <BlockIcon sx={sx} />;
  return <AccessTimeRoundedIcon sx={sx} />;
};

// ─── Componente Principal de Página de Detalle ────────────────
export default function TareaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const evaluacionId = Number(params?.id);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';

  const [tarea, setTarea] = useState<TareaEstudiante | null>(null);
  const [evaluacion, setEvaluacion] = useState<EvaluacionCompleta | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para entrega de archivos del estudiante
  const [entrega, setEntrega] = useState<{
    id: number;
    archivo_url: string;
    archivo_nombre?: string | null;
    archivo_tipo?: string | null;
    archivo_tamano?: number | null;
    archivos?: Array<{ url: string; nombre?: string; tipo?: string; tamano?: number }> | null;
    fecha_entrega?: string | null;
    comentario_estudiante?: string | null;
  } | null>(null);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Array<{ file: File; url: string; isImage: boolean }>>([]);
  const [comentarioEntrega, setComentarioEntrega] = useState('');
  const [subiendoEntrega, setSubiendoEntrega] = useState(false);
  const [eliminandoEntrega, setEliminandoEntrega] = useState(false);
  const [cambiandoEntrega, setCambiandoEntrega] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para modal de previsualización de imágenes y descarga
  const [modalPreviewOpen, setModalPreviewOpen] = useState(false);
  const [modalPreviewUrl, setModalPreviewUrl] = useState<string>('');
  const [modalPreviewTitulo, setModalPreviewTitulo] = useState<string>('');
  const [modalPreviewNombreArchivo, setModalPreviewNombreArchivo] = useState<string>('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const esImagen = (urlOrName?: string | null): boolean => {
    if (!urlOrName) return false;
    return /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(urlOrName) || urlOrName.startsWith('data:image/');
  };

  const abrirPrevisualizacion = (url: string, tituloModal: string, nombreArchivo?: string) => {
    setModalPreviewUrl(url);
    setModalPreviewTitulo(tituloModal);
    setModalPreviewNombreArchivo(nombreArchivo || 'foto_evaluacion.jpg');
    setModalPreviewOpen(true);
  };

  const handleDescargarArchivo = async (url: string, nombreArchivo: string = 'foto.jpg') => {
    try {
      let downloadUrl = url;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/') && !downloadUrl.includes('fl_attachment')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Error al obtener archivo');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Descargando imagen...');
    } catch {
      let fallbackUrl = url;
      if (fallbackUrl.includes('cloudinary.com') && fallbackUrl.includes('/upload/') && !fallbackUrl.includes('fl_attachment')) {
        fallbackUrl = fallbackUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.target = '_blank';
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const list = archivosSeleccionados.map(f => {
      const isImg = f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.name);
      return {
        file: f,
        url: URL.createObjectURL(f),
        isImage: isImg,
      };
    });
    setLocalPreviews(list);

    return () => {
      list.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [archivosSeleccionados]);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const total = archivosSeleccionados.length + newFiles.length;
    if (total > 10) {
      toast.error('Puedes subir un máximo de 10 fotografías o documentos en total');
      return;
    }
    for (const f of newFiles) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`El archivo "${f.name}" supera los 10 MB`);
        return;
      }
    }
    setArchivosSeleccionados(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index));
  };

  const cargarDatos = React.useCallback(async () => {
    if (!evaluacionId || isNaN(evaluacionId)) return;
    setLoading(true);
    try {
      // 1. Obtener la lista de tareas del estudiante para encontrar la metadata del estudiante (nota, estado, observaciones)
      const resTareas = await estudianteService.getTareas().catch(() => null);
      let foundTarea: TareaEstudiante | null = null;
      if (resTareas?.data?.tareas) {
        const found = resTareas.data.tareas.find((t: TareaEstudiante) => t.evaluacion_id === evaluacionId);
        if (found) {
          foundTarea = found;
          setTarea(found);
          if (found.entrega_archivo_url) {
            setEntrega({
              id: found.entrega_id || 0,
              archivo_url: found.entrega_archivo_url,
              archivo_nombre: found.entrega_archivo_nombre,
              archivos: found.entrega_archivos || (found.entrega_archivo_url ? [{ url: found.entrega_archivo_url, nombre: found.entrega_archivo_nombre || undefined }] : undefined),
              fecha_entrega: found.entrega_fecha,
              comentario_estudiante: found.entrega_comentario,
            });
          }
        }
      }

      // 2. Obtener la evaluación pública y su rúbrica (usando /publica para estudiantes y padres)
      const [evalPublicaRes, rubricaRes] = await Promise.all([
        api.get(`/notas/evaluaciones/${evaluacionId}/publica`).catch(() => null),
        api.get(`/notas/evaluaciones/${evaluacionId}/rubrica`).catch(() => null),
      ]);

      const ev = evalPublicaRes?.data?.data?.evaluacion;
      const rubricaList = rubricaRes?.data?.data?.criterios || evalPublicaRes?.data?.data?.rubrica || [];
      const entregaPublica = evalPublicaRes?.data?.data?.entrega;

      if (entregaPublica) {
        setEntrega(entregaPublica);
      }

      setEvaluacion({
        id: ev?.id || evaluacionId,
        titulo: ev?.titulo || ev?.nombre || foundTarea?.evaluacion_nombre,
        nombre: ev?.nombre || ev?.titulo || foundTarea?.evaluacion_nombre,
        modalidad: ev?.modalidad || foundTarea?.modalidad,
        tipo: ev?.tipo || foundTarea?.tipo,
        duracion_minutos: ev?.duracion_minutos ?? foundTarea?.duracion_minutos,
        fecha_hora_inicio: ev?.fecha_hora_inicio ?? foundTarea?.fecha_hora_inicio,
        fecha_hora_fin: ev?.fecha_hora_fin ?? foundTarea?.fecha_hora_fin,
        foto_url: ev?.foto_url || foundTarea?.foto_url || null,
        pdf_url: ev?.pdf_url || foundTarea?.pdf_url || null,
        pdf_nombre: ev?.pdf_nombre || foundTarea?.pdf_nombre || null,
        instrucciones: ev?.instrucciones || foundTarea?.instrucciones || null,
        descripcion: ev?.descripcion || foundTarea?.descripcion || null,
        puntaje_maximo: ev?.puntaje_maximo ?? foundTarea?.puntaje_maximo,
        peso_en_dimension: ev?.peso_en_dimension ?? foundTarea?.peso_en_dimension,
        fecha_evaluacion: ev?.fecha || ev?.fecha_evaluacion || foundTarea?.fecha_evaluacion,
        fecha_limite: ev?.fecha_limite ?? foundTarea?.fecha_limite,
        permite_entrega_archivo: Boolean(ev?.permite_entrega_archivo ?? foundTarea?.permite_entrega_archivo),
        rubrica: rubricaList,
      });
    } catch (err) {
      console.error('Error al cargar detalle de evaluación:', err);
    } finally {
      setLoading(false);
    }
  }, [evaluacionId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Estados para Autoevaluación
  const [autoPuntaje, setAutoPuntaje] = useState<number>(5);
  const [autoP1, setAutoP1] = useState<string>('');
  const [autoP2, setAutoP2] = useState<string>('');
  const [autoP3, setAutoP3] = useState<string>('');
  const [guardandoAuto, setGuardandoAuto] = useState<boolean>(false);

  // Valores unificados
  const titulo = evaluacion?.titulo || evaluacion?.nombre || tarea?.evaluacion_nombre || `Evaluación #${evaluacionId}`;
  const modalidad = evaluacion?.modalidad || tarea?.modalidad || 'presencial';
  const esVirtual = modalidad === 'virtual';
  const tipoEvaluacion = evaluacion?.tipo || tarea?.tipo || 'tarea';
  const estado: EstadoTarea = tarea?.estado_calculado || 'pendiente';
  const cfgEstado = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  const dimensionCodigo = (tarea?.dimension_codigo || '').toUpperCase();
  const dimCfg = DIMENSIONES[dimensionCodigo] || null;
  const esAutoevaluacion = dimensionCodigo === 'AUT' || dimensionCodigo === 'AUTO' || dimCfg?.label === 'Autoevaluación';

  const cdias = colorDias(tarea?.dias_restantes, estado, isDark);

  const puntajeMax = esAutoevaluacion ? 5 : (evaluacion?.puntaje_maximo ?? tarea?.puntaje_maximo ?? 100);
  const notaObtenida = esAutoevaluacion ? tarea?.puntaje_obtenido : (tarea?.nota_sobre_100 ?? tarea?.puntaje_obtenido);

  // Sincronizar respuestas previas si ya existen
  useEffect(() => {
    if (esAutoevaluacion) {
      if (tarea?.puntaje_obtenido != null) {
        setAutoPuntaje(Number(tarea.puntaje_obtenido));
      }
      if (tarea?.observacion_docente) {
        const obs = tarea.observacion_docente;
        const m1 = obs.match(/•\s*Aprendizaje:\s*([^\n•]+)/);
        const m2 = obs.match(/•\s*Dificultades:\s*([^\n•]+)/);
        const m3 = obs.match(/•\s*Metas:\s*([^\n•]+)/);
        if (m1 || m2 || m3) {
          if (m1) setAutoP1(m1[1].trim());
          if (m2) setAutoP2(m2[1].trim());
          if (m3) setAutoP3(m3[1].trim());
        } else {
          setAutoP1(obs);
        }
      }
    }
  }, [tarea, esAutoevaluacion]);

  const handleGuardarAutoevaluacion = async () => {
    if (!autoPuntaje || autoPuntaje < 1 || autoPuntaje > 5) {
      toast.error('Por favor selecciona una calificación del 1 al 5');
      return;
    }
    setGuardandoAuto(true);
    try {
      await estudianteService.enviarAutoevaluacion({
        evaluacion_id: evaluacionId,
        puntaje: autoPuntaje,
        respuestas: {
          p1: autoP1.trim() || undefined,
          p2: autoP2.trim() || undefined,
          p3: autoP3.trim() || undefined,
        },
      });
      toast.success('¡Tu autoevaluación ha sido registrada exitosamente!');
      await cargarDatos();
    } catch (err: any) {
      console.error('Error al guardar autoevaluación:', err);
      toast.error(err.response?.data?.message || 'Error al guardar autoevaluación');
    } finally {
      setGuardandoAuto(false);
    }
  };

  // Subida y eliminación de entrega digital
  const handleSubirEntrega = async () => {
    if (archivosSeleccionados.length === 0) {
      toast.error('Por favor selecciona al menos una fotografía o archivo (PDF/Imagen)');
      return;
    }
    setSubiendoEntrega(true);
    try {
      const res = await entregasService.entregarTareaEstudiante(
        evaluacionId,
        archivosSeleccionados,
        comentarioEntrega.trim() || undefined
      );
      toast.success(res.message || '¡Trabajo entregado exitosamente!');
      setArchivosSeleccionados([]);
      setComentarioEntrega('');
      setCambiandoEntrega(false);
      await cargarDatos();
    } catch (err: any) {
      console.error('Error al subir entrega:', err);
      toast.error(err.response?.data?.message || 'Error al subir entrega');
    } finally {
      setSubiendoEntrega(false);
    }
  };

  const handleEliminarEntrega = async () => {
    if (!confirm('¿Estás seguro de anular tu entrega? Podrás volver a subirla mientras el plazo siga vigente.')) return;
    setEliminandoEntrega(true);
    try {
      const res = await entregasService.eliminarEntregaEstudiante(evaluacionId);
      toast.success(res.message || 'Entrega eliminada');
      setEntrega(null);
      setCambiandoEntrega(false);
      await cargarDatos();
    } catch (err: any) {
      console.error('Error al eliminar entrega:', err);
      toast.error(err.response?.data?.message || 'Error al eliminar entrega');
    } finally {
      setEliminandoEntrega(false);
    }
  };

  // Control virtual y fechas
  const now = new Date();
  const dInicio = parseFechaBolivia(evaluacion?.fecha_hora_inicio ?? tarea?.fecha_hora_inicio);
  const dFin = parseFechaBolivia(evaluacion?.fecha_hora_fin ?? tarea?.fecha_hora_fin);
  const noIniciadoAun = Boolean(dInicio && now < dInicio);
  const yaExpiro = Boolean(dFin && now > dFin && notaObtenida == null);
  const fechaInicioTxt = formatFechaHora(evaluacion?.fecha_hora_inicio ?? tarea?.fecha_hora_inicio);
  const fechaFinTxt = formatFechaHora(evaluacion?.fecha_hora_fin ?? tarea?.fecha_hora_fin);

  // Materiales y entrega
  const fotoUrl = evaluacion?.foto_url || tarea?.foto_url || null;
  const pdfUrl = evaluacion?.pdf_url || tarea?.pdf_url || null;
  const pdfNombre = evaluacion?.pdf_nombre || tarea?.pdf_nombre || 'Abrir documento PDF adjunto';
  const permiteEntrega = Boolean(evaluacion?.permite_entrega_archivo ?? tarea?.permite_entrega_archivo);
  const dFechaLimite = parseFechaBolivia(evaluacion?.fecha_limite ?? tarea?.fecha_limite);
  const yaExpiroFechaLimite = Boolean(dFechaLimite && now > dFechaLimite);
  const fechaLimiteTxt = formatFechaLarga(evaluacion?.fecha_limite ?? tarea?.fecha_limite);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2.5, md: 4 } }}>
      <Container maxWidth="xl">

        {/* ══ BARRA SUPERIOR: REGRESAR Y ACCIONES ══ */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.push('/dashboard/estudiante/tareas')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 13,
              borderColor: alpha(accentColor, 0.35),
              color: accentColor,
              px: 2,
              py: 0.8,
              '&:hover': {
                borderColor: accentColor,
                bgcolor: alpha(accentColor, 0.08),
              },
            }}
          >
            Volver a Tareas
          </Button>

          <Tooltip title="Actualizar información">
            <IconButton
              onClick={cargarDatos}
              disabled={loading}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${alpha(accentColor, 0.25)}`,
                bgcolor: isDark ? alpha(accentColor, 0.08) : alpha(accentColor, 0.05),
                color: accentColor,
                p: 1.1,
                '&:hover': { bgcolor: alpha(accentColor, 0.15) },
              }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: '20px' }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Skeleton variant="rounded" height={380} sx={{ borderRadius: '20px' }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rounded" height={380} sx={{ borderRadius: '20px' }} />
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <Box sx={{ animation: `${fadeSlideUp} 0.35s ease-out both` }}>

            {/* ══ HERO CARD: INFORMACIÓN PRINCIPAL DE LA EVALUACIÓN ══ */}
            <Card
              sx={{
                borderRadius: '20px',
                mb: 3.5,
                border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(cfgEstado.color, 0.12)} 0%, rgba(15, 23, 42, 0.85) 100%)`
                  : `linear-gradient(135deg, ${alpha(cfgEstado.color, 0.07)} 0%, #ffffff 100%)`,
                boxShadow: isDark
                  ? '0 8px 32px rgba(0,0,0,0.45)'
                  : '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2.5 }}>

                  {/* Metadatos y Título */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.2 }}>
                      {tarea?.materia_nombre && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <MenuBookRoundedIcon sx={{ fontSize: 16, color: accentColor }} />
                          <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary', fontSize: 14 }}>
                            {tarea.materia_nombre}
                          </Typography>
                        </Box>
                      )}

                      {dimCfg && (
                        <>
                          <Typography variant="caption" color="text.disabled">·</Typography>
                          <Chip
                            size="small"
                            label={dimCfg.label}
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 800,
                              bgcolor: alpha(dimCfg.color, 0.15),
                              color: dimCfg.color,
                              border: `1px solid ${alpha(dimCfg.color, 0.3)}`,
                              borderRadius: '8px',
                            }}
                          />
                        </>
                      )}

                      <Chip
                        size="small"
                        label={TIPOS_LABELS[tipoEvaluacion] ?? tipoEvaluacion}
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05),
                          color: 'text.secondary',
                          borderRadius: '8px',
                        }}
                      />

                      {esVirtual && (
                        <Chip
                          size="small"
                          icon={<ComputerRoundedIcon sx={{ fontSize: '13px !important' }} />}
                          label="En Línea"
                          sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 800,
                            bgcolor: isDark ? alpha('#0288d1', 0.25) : alpha('#0288d1', 0.12),
                            color: isDark ? '#38bdf8' : '#0288d1',
                            border: `1px solid ${alpha('#0288d1', 0.35)}`,
                            borderRadius: '8px',
                            '& .MuiChip-icon': { color: isDark ? '#38bdf8' : '#0288d1' },
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
                        fontWeight: 900,
                        lineHeight: 1.25,
                        color: 'text.primary',
                        mb: 1.5,
                      }}
                    >
                      {titulo}
                    </Typography>

                    {/* Chips de Estado y Fecha Límite */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<EstadoIcon estado={estado} size={16} />}
                        label={cfgEstado.label}
                        sx={{
                          height: 28,
                          fontSize: 12,
                          fontWeight: 800,
                          background: cfgEstado.gradient,
                          color: '#ffffff',
                          borderRadius: '10px',
                          boxShadow: `0 3px 12px ${alpha(cfgEstado.color, 0.4)}`,
                          '& .MuiChip-icon': { color: '#ffffff' },
                        }}
                      />

                      {tarea?.fecha_limite && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <EventIcon sx={{ fontSize: 16, color: cdias }} />
                          <Typography variant="body2" fontWeight={800} sx={{ color: cdias, fontSize: 13 }}>
                            {formatDias(tarea.dias_restantes)}
                          </Typography>
                        </Box>
                      )}

                      {tarea?.periodo_nombre && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <CalendarMonthIcon sx={{ fontSize: 15 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12 }}>
                            {tarea.periodo_nombre}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Bloque Nota (Si está calificada o es Autoevaluación) */}
                  {notaObtenida != null ? (
                    <Box
                      sx={{
                        p: 2.2,
                        minWidth: { xs: '100%', sm: 170 },
                        textAlign: 'center',
                        borderRadius: '16px',
                        background: esAutoevaluacion
                          ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
                          : cfgEstado.gradient,
                        color: '#ffffff',
                        boxShadow: `0 6px 20px ${alpha(esAutoevaluacion ? '#8b5cf6' : cfgEstado.color, 0.4)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, mb: 0.2 }}>
                        <GradeIcon sx={{ fontSize: 18 }} />
                        <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
                          {esAutoevaluacion ? 'Tu Autoevaluación' : 'Tu Calificación'}
                        </Typography>
                      </Box>
                      <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1, my: 0.5, fontSize: '2.5rem' }}>
                        {notaObtenida}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700, fontSize: 11.5 }}>
                        sobre {puntajeMax} puntos
                      </Typography>
                    </Box>
                  ) : esAutoevaluacion ? (
                    <Box
                      sx={{
                        p: 2,
                        minWidth: { xs: '100%', sm: 180 },
                        textAlign: 'center',
                        borderRadius: '16px',
                        bgcolor: alpha('#8b5cf6', isDark ? 0.15 : 0.1),
                        border: `1.5px dashed ${alpha('#8b5cf6', 0.5)}`,
                        color: isDark ? '#c084fc' : '#7c3aed',
                      }}
                    >
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 24, mb: 0.5 }} />
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13, display: 'block' }}>
                        Autoevaluación Pendiente
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: 11 }}>
                        Califica tu desempeño abajo
                      </Typography>
                    </Box>
                  ) : esVirtual && estado !== 'entregado' ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 22 }} />}
                      disabled={Boolean(noIniciadoAun || yaExpiro)}
                      onClick={() => router.push(`/dashboard/estudiante/examenes/${evaluacionId}`)}
                      sx={{
                        borderRadius: '14px',
                        py: 1.5,
                        px: 3.5,
                        fontWeight: 900,
                        fontSize: 14,
                        textTransform: 'none',
                        background: gradBg,
                        color: textOnAccent,
                        boxShadow: `0 6px 22px ${alpha(accentColor, 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 8px 28px ${alpha(accentColor, 0.55)}`,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {noIniciadoAun
                        ? `Disponible el ${fechaInicioTxt}`
                        : yaExpiro
                          ? 'Plazo Finalizado'
                          : 'Rendir Examen Ahora'}
                    </Button>
                  ) : null}

                </Box>
              </CardContent>
            </Card>

            {/* ══ CONTENIDO PRINCIPAL: 2 COLUMNAS (LAYOUT EDITORIAL DOCENTE) ══ */}
            <Grid container spacing={3}>

              {/* ── COLUMNA IZQUIERDA: INSTRUCCIONES, ARCHIVOS, RÚBRICA Y FEEDBACK ── */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>

                  {/* ── 0. Tarjeta Especial de Autoevaluación Interactiva ── */}
                  {esAutoevaluacion && (
                    <Card
                      sx={{
                        borderRadius: '20px',
                        border: `2px solid ${alpha('#8b5cf6', 0.35)}`,
                        background: isDark
                          ? `linear-gradient(135deg, ${alpha('#8b5cf6', 0.12)} 0%, rgba(15, 23, 42, 0.75) 100%)`
                          : `linear-gradient(135deg, ${alpha('#8b5cf6', 0.08)} 0%, #ffffff 100%)`,
                        boxShadow: isDark
                          ? '0 10px 30px rgba(139, 92, 246, 0.18)'
                          : '0 8px 24px rgba(139, 92, 246, 0.12)',
                        overflow: 'hidden',
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        {/* Encabezado */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{
                              width: 38, height: 38, borderRadius: '12px',
                              bgcolor: alpha('#8b5cf6', 0.18),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#a855f7',
                            }}>
                              <AutoAwesomeRoundedIcon sx={{ fontSize: 22 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight={900} sx={{ color: isDark ? '#e9d5ff' : '#6b21a8', lineHeight: 1.2 }}>
                                Mi Autoevaluación Trimestral
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Dimensión Autoevaluación · 5% de tu calificación final
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            size="small"
                            label={notaObtenida != null ? 'Completada / Calificada' : 'Sin calificar'}
                            icon={notaObtenida != null ? <CheckCircleRoundedIcon sx={{ fontSize: '15px !important' }} /> : <AccessTimeRoundedIcon sx={{ fontSize: '15px !important' }} />}
                            sx={{
                              fontWeight: 800,
                              fontSize: 11.5,
                              bgcolor: notaObtenida != null ? alpha('#10b981', 0.15) : alpha('#f59e0b', 0.15),
                              color: notaObtenida != null ? '#10b981' : '#f59e0b',
                              border: `1px solid ${alpha(notaObtenida != null ? '#10b981' : '#f59e0b', 0.3)}`,
                              borderRadius: '8px',
                            }}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.6, mb: 3 }}>
                          Reflexiona con honestidad sobre tu compromiso, puntualidad, participación y aprendizaje en esta materia.
                          Selecciona tu calificación del <strong>1 al 5</strong> y responde a las preguntas de autorreflexión guiada.
                        </Typography>

                        {/* SELECTOR DE ESCALA 1 A 5 PTS */}
                        <Box sx={{ mb: 3.5 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, display: 'block', mb: 1.5, color: isDark ? '#c084fc' : '#7c3aed' }}>
                            Paso 1: Selecciona tu calificación (Escala de 1 a 5 puntos)
                          </Typography>

                          <Grid container spacing={1.5}>
                            {NIVELES_AUTO.map((nivel) => {
                              const isSelected = autoPuntaje === nivel.valor;
                              return (
                                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={nivel.valor}>
                                  <Box
                                    onClick={() => setAutoPuntaje(nivel.valor)}
                                    sx={{
                                      p: 1.8,
                                      borderRadius: '14px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      textAlign: 'center',
                                      border: `2px solid ${isSelected ? nivel.color : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                                      bgcolor: isSelected
                                        ? alpha(nivel.color, isDark ? 0.22 : 0.1)
                                        : isDark ? alpha('#fff', 0.02) : '#fafafa',
                                      boxShadow: isSelected ? `0 4px 16px ${alpha(nivel.color, 0.35)}` : 'none',
                                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                      '&:hover': {
                                        borderColor: nivel.color,
                                        bgcolor: alpha(nivel.color, isDark ? 0.15 : 0.06),
                                        transform: 'translateY(-2px)',
                                      },
                                    }}
                                  >
                                    <Typography sx={{ fontSize: '1.6rem', lineHeight: 1, mb: 0.6 }}>
                                      {nivel.emoji}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.3 }}>
                                      <Typography variant="h6" fontWeight={900} sx={{ color: isSelected ? nivel.color : 'text.primary', fontSize: 18, lineHeight: 1 }}>
                                        {nivel.valor}
                                      </Typography>
                                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: 11 }}>
                                        / 5 pts
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={800} sx={{ color: isSelected ? nivel.color : 'text.primary', fontSize: 12, mb: 0.5 }}>
                                      {nivel.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5, lineHeight: 1.3, display: 'block' }}>
                                      {nivel.desc}
                                    </Typography>
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>

                        {/* PREGUNTAS DE AUTORREFLEXIÓN */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, display: 'block', mb: 1.5, color: isDark ? '#c084fc' : '#7c3aed' }}>
                            Paso 2: Responde a las preguntas de autorreflexión guiada
                          </Typography>

                          <Stack spacing={2}>
                            {/* Pregunta 1 */}
                            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa', border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha('#8b5cf6', 0.2), color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                  1
                                </Box>
                                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                  ¿Qué aprendí en esta materia durante este trimestre?
                                </Typography>
                              </Box>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Describe los temas o aprendizajes más significativos que lograste..."
                                value={autoP1}
                                onChange={(e) => setAutoP1(e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontSize: 13.5,
                                    bgcolor: isDark ? 'rgba(15,23,42,0.5)' : '#ffffff',
                                  },
                                }}
                              />
                            </Box>

                            {/* Pregunta 2 */}
                            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa', border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha('#8b5cf6', 0.2), color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                  2
                                </Box>
                                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                  ¿Cuáles fueron mis mayores dificultades y cómo logré superarlas?
                                </Typography>
                              </Box>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Menciona qué contenidos o situaciones te costaron y cómo buscaste resolverlo..."
                                value={autoP2}
                                onChange={(e) => setAutoP2(e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontSize: 13.5,
                                    bgcolor: isDark ? 'rgba(15,23,42,0.5)' : '#ffffff',
                                  },
                                }}
                              />
                            </Box>

                            {/* Pregunta 3 */}
                            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa', border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}` }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha('#8b5cf6', 0.2), color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                  3
                                </Box>
                                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                  ¿Qué metas o compromisos asumo para el siguiente período?
                                </Typography>
                              </Box>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Indica qué hábitos, puntualidad o esfuerzo te comprometes a mantener o mejorar..."
                                value={autoP3}
                                onChange={(e) => setAutoP3(e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontSize: 13.5,
                                    bgcolor: isDark ? 'rgba(15,23,42,0.5)' : '#ffffff',
                                  },
                                }}
                              />
                            </Box>
                          </Stack>
                        </Box>

                        {/* BOTÓN ENVIAR */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          {notaObtenida != null && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Calificación actual: {notaObtenida} / 5 pts
                            </Typography>
                          )}
                          <Button
                            variant="contained"
                            size="large"
                            disabled={guardandoAuto}
                            onClick={handleGuardarAutoevaluacion}
                            startIcon={guardandoAuto ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRoundedIcon />}
                            sx={{
                              borderRadius: '12px',
                              px: 4,
                              py: 1.3,
                              fontWeight: 900,
                              fontSize: 14,
                              textTransform: 'none',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                              color: '#ffffff',
                              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                              '&:hover': {
                                boxShadow: '0 6px 22px rgba(139, 92, 246, 0.6)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            {guardandoAuto
                              ? 'Guardando...'
                              : notaObtenida != null
                                ? 'Actualizar mi Autoevaluación'
                                : 'Enviar mi Autoevaluación'}
                          </Button>
                        </Box>

                      </CardContent>
                    </Card>
                  )}

                  {/* 1. Modalidad Virtual (Si aplica) */}
                  {esVirtual && (
                    <Card
                      sx={{
                        borderRadius: '18px',
                        border: `1.5px solid ${alpha(accentColor, 0.35)}`,
                        background: isDark
                          ? `linear-gradient(135deg, ${alpha(accentColor, 0.12)} 0%, rgba(15, 23, 42, 0.6) 100%)`
                          : `linear-gradient(135deg, ${alpha(accentColor, 0.08)} 0%, #ffffff 100%)`,
                        boxShadow: `0 4px 20px ${alpha(accentColor, 0.1)}`,
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <ComputerRoundedIcon sx={{ color: accentColor, fontSize: 22 }} />
                          <Typography variant="subtitle1" fontWeight={800} sx={{ color: accentColor }}>
                            Evaluación en Modalidad Virtual
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.6, mb: 2 }}>
                          Este examen se realiza íntegramente en la plataforma escolar. Las preguntas pueden ser de opción múltiple, verdadero/falso o desarrollo breve.
                          {evaluacion?.duracion_minutos ? ` Dispondrás de un tiempo límite de ${evaluacion.duracion_minutos} minutos.` : ''}
                        </Typography>

                        {noIniciadoAun && (
                          <Alert severity="info" sx={{ borderRadius: '12px', fontSize: 13, mb: 2 }}>
                            ⏰ <strong>Examen Programado:</strong> Se habilitará el <strong>{fechaInicioTxt}</strong>. No podrás comenzar a responder antes de esa fecha y hora.
                          </Alert>
                        )}

                        {yaExpiro && (
                          <Alert severity="warning" sx={{ borderRadius: '12px', fontSize: 13, mb: 2 }}>
                            ⌛ <strong>Plazo Finalizado:</strong> El periodo para rendir este examen finalizó el <strong>{fechaFinTxt}</strong>.
                          </Alert>
                        )}

                        <Button
                          variant="contained"
                          startIcon={<PlayArrowRoundedIcon />}
                          disabled={Boolean(noIniciadoAun || yaExpiro)}
                          onClick={() => router.push(`/dashboard/estudiante/examenes/${evaluacionId}`)}
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 800,
                            textTransform: 'none',
                            py: 1.2,
                            px: 3,
                            background: gradBg,
                            color: textOnAccent,
                            boxShadow: `0 4px 16px ${alpha(accentColor, 0.35)}`,
                            '&:hover': {
                              boxShadow: `0 6px 22px ${alpha(accentColor, 0.5)}`,
                            },
                          }}
                        >
                          {notaObtenida != null
                            ? 'Ver Mis Respuestas y Resultados'
                            : noIniciadoAun
                              ? `Disponible el ${fechaInicioTxt}`
                              : yaExpiro
                                ? 'Plazo Finalizado'
                                : 'Comenzar Examen Virtual'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* 2. Descripción e Instrucciones de la Práctica */}
                  <Card
                    sx={{
                      borderRadius: '18px',
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                      background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <InfoOutlinedIcon sx={{ color: accentColor, fontSize: 20 }} />
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                          Consigna e Instrucciones
                        </Typography>
                      </Box>

                      {evaluacion?.descripcion || tarea?.descripcion ? (
                        <Box sx={{ mb: 2.5 }}>
                          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, display: 'block', mb: 0.8 }}>
                            Descripción General
                          </Typography>
                          <Typography variant="body1" color="text.primary" sx={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {evaluacion?.descripcion || tarea?.descripcion}
                          </Typography>
                        </Box>
                      ) : null}

                      {evaluacion?.instrucciones || tarea?.instrucciones ? (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '14px',
                            bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.04),
                            border: `1.5px solid ${alpha('#3b82f6', 0.25)}`,
                          }}
                        >
                          <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#60a5fa' : '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, display: 'block', mb: 0.8 }}>
                            Instrucciones Específicas
                          </Typography>
                          <Typography variant="body2" color="text.primary" sx={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {evaluacion?.instrucciones || tarea?.instrucciones}
                          </Typography>
                        </Box>
                      ) : null}

                      {!evaluacion?.descripcion && !tarea?.descripcion && !evaluacion?.instrucciones && !tarea?.instrucciones && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          El docente no incluyó instrucciones adicionales para esta evaluación.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* 3. Materiales y Archivos Adjuntos del Docente */}
                  {(fotoUrl || pdfUrl) && (
                    <Card
                      sx={{
                        borderRadius: '18px',
                        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                        background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: 2 }}>
                          Materiales y Consignas del Docente
                        </Typography>

                        <Stack spacing={2.5}>
                          {fotoUrl && (
                            <Box>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>
                                📸 Imagen del enunciado / práctica:
                              </Typography>
                              <Box
                                component="img"
                                src={fotoUrl}
                                alt="Material adjunto por el docente"
                                onClick={() => abrirPrevisualizacion(fotoUrl, 'Consigna del docente', 'consigna_docente.jpg')}
                                sx={{
                                  width: '100%',
                                  maxHeight: 500,
                                  objectFit: 'contain',
                                  borderRadius: '14px',
                                  border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
                                  bgcolor: isDark ? alpha('#000', 0.35) : '#f8fafc',
                                  display: 'block',
                                  mb: 1.5,
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease',
                                  '&:hover': { transform: 'scale(1.005)' },
                                }}
                              />
                              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<VisibilityRoundedIcon />}
                                  onClick={() => abrirPrevisualizacion(fotoUrl, 'Consigna del docente', 'consigna_docente.jpg')}
                                  sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                    color: '#ffffff',
                                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
                                      boxShadow: '0 6px 18px rgba(79, 70, 229, 0.55)',
                                      transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  Previsualizar foto
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<DownloadRoundedIcon />}
                                  onClick={() => handleDescargarArchivo(fotoUrl, 'consigna_docente.jpg')}
                                  sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    color: '#ffffff',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                                      boxShadow: '0 6px 18px rgba(16, 185, 129, 0.55)',
                                      transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  Descargar foto
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                  href={fotoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                                >
                                  Abrir en pestaña
                                </Button>
                              </Box>
                            </Box>
                          )}

                          {pdfUrl && (
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 22 }} />}
                              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                borderRadius: '14px',
                                p: 1.8,
                                justifyContent: 'flex-start',
                                gap: 1.5,
                                textTransform: 'none',
                                fontWeight: 800,
                                borderColor: alpha('#ef4444', 0.35),
                                color: isDark ? '#f87171' : '#dc2626',
                                bgcolor: isDark ? alpha('#ef4444', 0.08) : alpha('#ef4444', 0.04),
                                '&:hover': {
                                  borderColor: '#ef4444',
                                  bgcolor: alpha('#ef4444', 0.12),
                                },
                              }}
                            >
                              {pdfNombre}
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  {/* 4. Tarjeta de Entrega Digital del Estudiante */}
                  {permiteEntrega && (
                    <Card
                      sx={{
                        borderRadius: '20px',
                        border: `2px solid ${entrega
                          ? alpha('#10b981', 0.45)
                          : yaExpiroFechaLimite
                            ? alpha('#ef4444', 0.45)
                            : alpha('#3b82f6', 0.45)
                          }`,
                        background: isDark
                          ? `linear-gradient(135deg, ${alpha(entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6', 0.1)} 0%, rgba(15, 23, 42, 0.85) 100%)`
                          : `linear-gradient(135deg, ${alpha(entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6', 0.05)} 0%, #ffffff 100%)`,
                        boxShadow: `0 8px 30px ${alpha(entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6', 0.18)}`,
                        overflow: 'hidden',
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        {/* Cabecera de la Entrega */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{
                              width: 42, height: 42, borderRadius: '12px',
                              bgcolor: alpha(entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6', 0.18),
                              color: entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {entrega ? <CheckCircleRoundedIcon sx={{ fontSize: 24 }} /> : <CloudUploadRoundedIcon sx={{ fontSize: 24 }} />}
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                                Entrega de tu Trabajo
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Subida digital en plataforma (PDF o Imágenes)
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            size="small"
                            label={
                              entrega
                                ? '✓ Trabajo Entregado'
                                : yaExpiroFechaLimite
                                  ? '⌛ Plazo Expirado'
                                  : 'Pendiente de Entrega'
                            }
                            sx={{
                              fontWeight: 800,
                              fontSize: 12,
                              height: 26,
                              bgcolor: entrega
                                ? alpha('#10b981', 0.18)
                                : yaExpiroFechaLimite
                                  ? alpha('#ef4444', 0.18)
                                  : alpha('#3b82f6', 0.18),
                              color: entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6',
                              border: `1px solid ${alpha(entrega ? '#10b981' : yaExpiroFechaLimite ? '#ef4444' : '#3b82f6', 0.35)}`,
                              borderRadius: '8px',
                            }}
                          />
                        </Box>

                        {/* Caso A: Ya hay entrega realizada y no está en modo cambiar archivo */}
                        {entrega && !cambiandoEntrega ? (() => {
                          const listaEntregada = Array.isArray(entrega.archivos) && entrega.archivos.length > 0
                            ? entrega.archivos
                            : (entrega.archivo_url ? [{ url: entrega.archivo_url, nombre: entrega.archivo_nombre || 'mi_entrega.jpg' }] : []);

                          return (
                            <Box>
                              <Box sx={{
                                p: 2,
                                borderRadius: '16px',
                                bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
                                border: `1.5px solid ${alpha('#10b981', 0.35)}`,
                                mb: 2.5,
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      size="small"
                                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '15px !important' }} />}
                                      label={listaEntregada.length > 1 ? `${listaEntregada.length} fotos entregadas` : '1 archivo entregado'}
                                      sx={{
                                        fontWeight: 800,
                                        bgcolor: alpha('#10b981', 0.2),
                                        color: '#10b981',
                                        border: '1px solid rgba(16,185,129,0.4)',
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5 }}>
                                      Entregado el {formatFechaHora(entrega.fecha_entrega)}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Galería de fotos / documentos entregados */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: listaEntregada.length > 1 ? 'repeat(2, 1fr)' : '1fr', md: listaEntregada.length > 2 ? 'repeat(3, 1fr)' : (listaEntregada.length > 1 ? 'repeat(2, 1fr)' : '1fr') }, gap: 1.5, mb: 1.5 }}>
                                  {listaEntregada.map((arch, idx) => {
                                    const esImg = esImagen(arch.url || arch.nombre);
                                    return (
                                      <Box key={idx}>
                                        <Box sx={{
                                          p: 1.5,
                                          borderRadius: '12px',
                                          bgcolor: isDark ? 'rgba(0,0,0,0.25)' : '#ffffff',
                                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: 1,
                                          height: '100%',
                                        }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                            <Chip
                                              label={`Página / Foto #${idx + 1}`}
                                              size="small"
                                              sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: alpha('#10b981', 0.15), color: '#10b981' }}
                                            />
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120, fontSize: 10.5 }}>
                                              {arch.nombre || `Foto_${idx + 1}.jpg`}
                                            </Typography>
                                          </Box>

                                          {esImg ? (
                                            <Box
                                              onClick={() => abrirPrevisualizacion(arch.url, `Página ${idx + 1} - Tu entrega`, arch.nombre || `entrega_foto_${idx + 1}.jpg`)}
                                              sx={{
                                                height: 140,
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#f1f5f9',
                                                border: `1px solid ${alpha('#10b981', 0.3)}`,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                '&:hover img': { transform: 'scale(1.03)' },
                                              }}
                                            >
                                              <Box
                                                component="img"
                                                src={arch.url}
                                                alt={`Foto ${idx + 1}`}
                                                sx={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'contain',
                                                  transition: 'transform 0.2s ease',
                                                }}
                                              />
                                            </Box>
                                          ) : (
                                            <Box sx={{
                                              height: 100,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              bgcolor: alpha('#ef4444', 0.08),
                                              borderRadius: '8px',
                                              gap: 1,
                                            }}>
                                              <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 36 }} />
                                              <Typography variant="caption" fontWeight={700} color="#ef4444">
                                                Documento PDF
                                              </Typography>
                                            </Box>
                                          )}

                                          <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 0.5 }}>
                                            {esImg && (
                                              <Button
                                                fullWidth
                                                variant="contained"
                                                size="small"
                                                startIcon={<VisibilityRoundedIcon sx={{ fontSize: 13 }} />}
                                                onClick={() => abrirPrevisualizacion(arch.url, `Página ${idx + 1} - Tu entrega`, arch.nombre || `entrega_foto_${idx + 1}.jpg`)}
                                                sx={{
                                                  borderRadius: '8px',
                                                  fontWeight: 800,
                                                  fontSize: 11,
                                                  textTransform: 'none',
                                                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                                  color: '#ffffff',
                                                  py: 0.4,
                                                }}
                                              >
                                                Ver
                                              </Button>
                                            )}
                                            <Button
                                              fullWidth
                                              variant="outlined"
                                              size="small"
                                              startIcon={<DownloadRoundedIcon sx={{ fontSize: 13 }} />}
                                              onClick={() => handleDescargarArchivo(arch.url, arch.nombre || `entrega_${idx + 1}.jpg`)}
                                              sx={{
                                                borderRadius: '8px',
                                                fontWeight: 800,
                                                fontSize: 11,
                                                textTransform: 'none',
                                                py: 0.4,
                                              }}
                                            >
                                              Descargar
                                            </Button>
                                          </Box>
                                        </Box>
                                      </Box>
                                    );
                                  })}
                                </Box>

                                {entrega.comentario_estudiante && (
                                  <Box sx={{
                                    mt: 1.5,
                                    p: 1.2,
                                    borderRadius: '10px',
                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                                  }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.2 }}>
                                      Tu comentario:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: 13 }}>
                                      "{entrega.comentario_estudiante}"
                                    </Typography>
                                  </Box>
                                )}
                              </Box>

                              {/* Opciones antes de fecha límite */}
                              {!yaExpiroFechaLimite ? (
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setCambiandoEntrega(true)}
                                    sx={{
                                      borderRadius: '10px',
                                      fontWeight: 800,
                                      textTransform: 'none',
                                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                      color: '#ffffff',
                                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    Reemplazar fotos / entrega
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    disabled={eliminandoEntrega}
                                    onClick={handleEliminarEntrega}
                                    startIcon={eliminandoEntrega ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineRoundedIcon />}
                                    sx={{
                                      borderRadius: '10px',
                                      fontWeight: 700,
                                      textTransform: 'none',
                                    }}
                                  >
                                    {eliminandoEntrega ? 'Eliminando...' : 'Anular entrega'}
                                  </Button>
                                </Box>
                              ) : (
                                <Alert severity="info" sx={{ borderRadius: '12px', fontSize: 12.5 }}>
                                  🔒 <strong>Plazo de entrega concluido:</strong> Tu trabajo se encuentra registrado y ya no es posible modificar el archivo.
                                </Alert>
                              )}
                            </Box>
                          );
                        })() : yaExpiroFechaLimite ? (
                          /* Caso B: No entregó y el plazo ya venció */
                          <Alert severity="error" sx={{ borderRadius: '14px', fontSize: 13.5 }}>
                            ⌛ <strong>Plazo de entrega finalizado:</strong> La fecha límite para subir este trabajo concluyó el <strong>{fechaLimiteTxt}</strong>. El sistema no permite envíos fuera de término.
                          </Alert>
                        ) : (
                          /* Caso C: Subir nueva entrega o reemplazar entrega previa */
                          <Box>
                            {/* Input oculto múltiple */}
                            <input
                              type="file"
                              multiple
                              ref={fileInputRef}
                              accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
                              style={{ display: 'none' }}
                              onChange={e => {
                                handleFilesAdded(e.target.files);
                                e.target.value = '';
                              }}
                            />

                            {/* Información para el estudiante o padre */}
                            <Alert
                              severity="info"
                              icon={<CloudUploadRoundedIcon fontSize="inherit" />}
                              sx={{
                                mb: 2,
                                borderRadius: '12px',
                                fontSize: 12.8,
                                bgcolor: isDark ? alpha('#3b82f6', 0.12) : alpha('#3b82f6', 0.06),
                                border: `1px solid ${alpha('#3b82f6', 0.25)}`,
                              }}
                            >
                              📸 <strong>Puedes subir varias fotos:</strong> Toma fotos claras a las páginas de tu cuaderno o práctica y súbelas aquí (hasta 10 fotos). También puedes subir un documento PDF si lo prefieres.
                            </Alert>

                            {/* Zona de fotos seleccionadas o placeholder */}
                            {archivosSeleccionados.length === 0 ? (
                              <Box
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                  p: 4,
                                  textAlign: 'center',
                                  borderRadius: '16px',
                                  border: `2px dashed ${alpha(accentColor, 0.45)}`,
                                  bgcolor: isDark ? alpha(accentColor, 0.06) : alpha(accentColor, 0.03),
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  mb: 2.5,
                                  '&:hover': {
                                    borderColor: accentColor,
                                    bgcolor: alpha(accentColor, isDark ? 0.12 : 0.07),
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                <CloudUploadRoundedIcon sx={{ fontSize: 50, color: accentColor, mb: 1 }} />
                                <Typography variant="h6" fontWeight={800} color="text.primary">
                                  Haz clic para seleccionar tus fotos o documentos
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 12 }}>
                                  Puedes seleccionar varias fotos a la vez desde tu celular o computadora (máximo 10 fotos · hasta 10 MB c/u)
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<AttachFileRoundedIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }}
                                  sx={{
                                    mt: 2,
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    px: 2.5,
                                    bgcolor: accentColor,
                                    color: textOnAccent,
                                  }}
                                >
                                  Elegir fotos / archivos
                                </Button>
                              </Box>
                            ) : (
                              <Box sx={{ mb: 2.5 }}>
                                {/* Barra superior de archivos seleccionados */}
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                  mb: 1.5,
                                }}>
                                  <Chip
                                    icon={<CheckCircleRoundedIcon sx={{ fontSize: '15px !important' }} />}
                                    label={`${archivosSeleccionados.length} foto(s) / archivo(s) listos para entregar (máx. 10)`}
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 800 }}
                                  />

                                  {archivosSeleccionados.length < 10 && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<CloudUploadRoundedIcon />}
                                      onClick={() => fileInputRef.current?.click()}
                                      sx={{
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        fontSize: 12,
                                        textTransform: 'none',
                                        borderColor: alpha(accentColor, 0.4),
                                        color: accentColor,
                                      }}
                                    >
                                      + Agregar más fotos
                                    </Button>
                                  )}
                                </Box>

                                {/* Cuadrícula de fotos seleccionadas */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: localPreviews.length > 1 ? 'repeat(2, 1fr)' : '1fr', md: localPreviews.length > 2 ? 'repeat(3, 1fr)' : (localPreviews.length > 1 ? 'repeat(2, 1fr)' : '1fr') }, gap: 1.5 }}>
                                  {localPreviews.map((item, idx) => (
                                    <Box key={idx}>
                                      <Box sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1.5px solid ${alpha('#10b981', 0.4)}`,
                                        bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.04),
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                      }}>
                                        {/* Botón eliminar individual */}
                                        <Tooltip title="Quitar esta foto">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleRemoveFile(idx)}
                                            sx={{
                                              position: 'absolute',
                                              top: 6,
                                              right: 6,
                                              bgcolor: alpha('#ef4444', 0.15),
                                              color: '#ef4444',
                                              zIndex: 2,
                                              p: 0.4,
                                              '&:hover': { bgcolor: '#ef4444', color: '#fff' },
                                            }}
                                          >
                                            <CloseRoundedIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                        </Tooltip>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 3 }}>
                                          <Chip
                                            label={`Foto #${idx + 1}`}
                                            size="small"
                                            sx={{ height: 20, fontSize: 10.5, fontWeight: 900, bgcolor: '#10b981', color: '#fff' }}
                                          />
                                          <Typography variant="caption" fontWeight={700} noWrap sx={{ maxWidth: 140 }}>
                                            {item.file.name}
                                          </Typography>
                                        </Box>

                                        {item.isImage ? (
                                          <Box
                                            onClick={() => abrirPrevisualizacion(item.url, `Vista previa: ${item.file.name}`, item.file.name)}
                                            sx={{
                                              height: 130,
                                              borderRadius: '8px',
                                              overflow: 'hidden',
                                              bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#fff',
                                              border: `1px solid ${alpha('#10b981', 0.3)}`,
                                              cursor: 'pointer',
                                              position: 'relative',
                                              '&:hover img': { transform: 'scale(1.03)' },
                                            }}
                                          >
                                            <Box
                                              component="img"
                                              src={item.url}
                                              alt={`Preview ${idx + 1}`}
                                              sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                transition: 'transform 0.2s ease',
                                              }}
                                            />
                                          </Box>
                                        ) : (
                                          <Box sx={{
                                            height: 90,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: alpha('#ef4444', 0.08),
                                            borderRadius: '8px',
                                            gap: 1,
                                          }}>
                                            <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 32 }} />
                                            <Typography variant="caption" fontWeight={700} color="#ef4444">
                                              Archivo PDF
                                            </Typography>
                                          </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.5 }}>
                                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                          </Typography>
                                          {item.isImage && (
                                            <Button
                                              size="small"
                                              variant="text"
                                              startIcon={<VisibilityRoundedIcon sx={{ fontSize: 13 }} />}
                                              onClick={() => abrirPrevisualizacion(item.url, `Foto #${idx + 1}`, item.file.name)}
                                              sx={{ fontSize: 11, fontWeight: 800, textTransform: 'none', p: 0.3 }}
                                            >
                                              Inspeccionar
                                            </Button>
                                          )}
                                        </Box>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {/* Comentario opcional */}
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              rows={2}
                              label="Comentario o nota para el docente (opcional)"
                              placeholder="Ej: Profesor, le adjunto las fotos del desarrollo de la práctica..."
                              value={comentarioEntrega}
                              onChange={e => setComentarioEntrega(e.target.value)}
                              sx={{
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                  fontSize: 13.5,
                                  bgcolor: isDark ? 'rgba(15,23,42,0.5)' : '#ffffff',
                                },
                              }}
                            />

                            {/* Botones de acción */}
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {cambiandoEntrega && (
                                <Button
                                  variant="outlined"
                                  size="medium"
                                  onClick={() => {
                                    setCambiandoEntrega(false);
                                    setArchivosSeleccionados([]);
                                  }}
                                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                                >
                                  Cancelar
                                </Button>
                              )}

                              <Button
                                variant="contained"
                                size="large"
                                disabled={archivosSeleccionados.length === 0 || subiendoEntrega}
                                onClick={handleSubirEntrega}
                                startIcon={subiendoEntrega ? <CircularProgress size={18} color="inherit" /> : <CloudUploadRoundedIcon />}
                                sx={{
                                  borderRadius: '12px',
                                  px: 4,
                                  py: 1.3,
                                  fontWeight: 900,
                                  fontSize: 15,
                                  textTransform: 'none',
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: '#ffffff',
                                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    boxShadow: '0 8px 28px rgba(16, 185, 129, 0.6)',
                                    transform: 'translateY(-2px)',
                                  },
                                  '&.Mui-disabled': {
                                    background: alpha('#6b7280', 0.25),
                                    color: alpha('#fff', 0.4),
                                  },
                                }}
                              >
                                {subiendoEntrega
                                  ? 'Subiendo entrega...'
                                  : archivosSeleccionados.length > 1
                                    ? `Entregar ${archivosSeleccionados.length} fotos / archivos`
                                    : cambiandoEntrega
                                      ? 'Actualizar mi entrega'
                                      : 'Confirmar y entregar trabajo'}
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* 4. Rúbrica de Evaluación */}
                  {evaluacion?.rubrica && evaluacion.rubrica.length > 0 && (
                    <Card
                      sx={{
                        borderRadius: '18px',
                        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                        background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <ScaleIcon sx={{ color: accentColor, fontSize: 20 }} />
                          <Typography variant="h6" fontWeight={800} color="text.primary">
                            Rúbrica de Calificación ({evaluacion.rubrica.length} criterios)
                          </Typography>
                        </Box>

                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{
                            borderRadius: '14px',
                            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                            background: isDark ? alpha('#fff', 0.02) : '#fafafa',
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) }}>
                                <TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Criterio y Niveles de Desempeño</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12, width: 90 }}>Puntos</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12, width: 80 }}>%</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {evaluacion.rubrica.map((crit) => {
                                const pct = Math.round((Number(crit.puntos_posibles) / puntajeMax) * 100);
                                return (
                                  <TableRow key={crit.id}>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13.5 }}>
                                        {crit.criterio}
                                      </Typography>
                                      {crit.descripcion && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5, display: 'block', mt: 0.3 }}>
                                          {crit.descripcion}
                                        </Typography>
                                      )}
                                      {(crit.nivel_excelente || crit.nivel_bueno || crit.nivel_basico) && (
                                        <Box sx={{ mt: 1, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                                          {crit.nivel_excelente && (
                                            <Chip
                                              size="small"
                                              label={`Excelente: ${crit.nivel_excelente}`}
                                              sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981', borderRadius: '6px' }}
                                            />
                                          )}
                                          {crit.nivel_bueno && (
                                            <Chip
                                              size="small"
                                              label={`Bueno: ${crit.nivel_bueno}`}
                                              sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha('#3b82f6', 0.12), color: '#3b82f6', borderRadius: '6px' }}
                                            />
                                          )}
                                          {crit.nivel_basico && (
                                            <Chip
                                              size="small"
                                              label={`Básico: ${crit.nivel_basico}`}
                                              sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b', borderRadius: '6px' }}
                                            />
                                          )}
                                        </Box>
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight={900} sx={{ fontSize: 14 }}>
                                        {crit.puntos_posibles}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="caption" fontWeight={800} color="text.secondary">
                                        {pct}%
                                      </Typography>
                                      <LinearProgress
                                        variant="determinate"
                                        value={pct}
                                        sx={{
                                          height: 4,
                                          borderRadius: 2,
                                          mt: 0.5,
                                          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                                          '& .MuiLinearProgress-bar': { bgcolor: accentColor, borderRadius: 2 },
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* 5. Observación y Retroalimentación del Docente */}
                  {tarea?.observacion_docente && !esAutoevaluacion && (
                    <Card
                      sx={{
                        borderRadius: '18px',
                        border: `1.5px solid ${alpha('#3b82f6', 0.35)}`,
                        bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.04),
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                          <CommentIcon sx={{ color: isDark ? '#60a5fa' : '#2563eb', fontSize: 20 }} />
                          <Typography variant="subtitle1" fontWeight={800} sx={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
                            Comentario y Retroalimentación del Docente
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6, fontSize: 14.5 }}>
                          "{tarea.observacion_docente}"
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                </Stack>
              </Grid>

              {/* ── COLUMNA DERECHA: SIDEBAR DE DATOS, FECHAS Y METADATOS ── */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>

                  {/* 1. Tarjeta de Fechas y Cronograma */}
                  <Card
                    sx={{
                      borderRadius: '18px',
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                      background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
                        Cronograma de Entrega
                      </Typography>

                      <Stack spacing={2}>
                        {tarea?.fecha_limite && (
                          <Box
                            sx={{
                              p: 1.8,
                              borderRadius: '14px',
                              bgcolor: isDark ? alpha(cdias, 0.12) : alpha(cdias, 0.06),
                              border: `1px solid ${alpha(cdias, 0.3)}`,
                            }}
                          >
                            <Typography variant="caption" fontWeight={800} sx={{ color: cdias, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10.5, display: 'block', mb: 0.4 }}>
                              Fecha Límite
                            </Typography>
                            <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13.5 }}>
                              {formatFechaLarga(tarea.fecha_limite)}
                            </Typography>
                            <Chip
                              size="small"
                              label={formatDias(tarea.dias_restantes)}
                              sx={{
                                mt: 1,
                                height: 22,
                                fontSize: 11,
                                fontWeight: 800,
                                bgcolor: alpha(cdias, 0.15),
                                color: cdias,
                                border: `1px solid ${alpha(cdias, 0.35)}`,
                                borderRadius: '6px',
                              }}
                            />
                          </Box>
                        )}

                        {evaluacion?.fecha_evaluacion && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13 }}>
                              Fecha programada:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              {formatFechaHora(evaluacion.fecha_evaluacion)}
                            </Typography>
                          </Box>
                        )}

                        {tarea?.publicado_en && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13 }}>
                              Publicada el:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              {formatFechaHora(tarea.publicado_en)}
                            </Typography>
                          </Box>
                        )}

                        {tarea?.fecha_registro && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13 }}>
                              Nota asentada:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              {formatFechaHora(tarea.fecha_registro)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* 2. Parámetros Académicos */}
                  <Card
                    sx={{
                      borderRadius: '18px',
                      border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                      background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
                        Datos de Calificación
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: 10.5, display: 'block', mb: 0.3 }}>
                            Puntaje Máximo
                          </Typography>
                          <Typography variant="body1" fontWeight={900} sx={{ fontSize: 15 }}>
                            {puntajeMax} pts
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: 10.5, display: 'block', mb: 0.3 }}>
                            Ponderación
                          </Typography>
                          <Typography variant="body1" fontWeight={900} sx={{ fontSize: 15 }}>
                            {esAutoevaluacion ? '5% trimestral' : `×${evaluacion?.peso_en_dimension ?? tarea?.peso_en_dimension ?? 1}`}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02), gridColumn: 'span 2' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: 10.5, display: 'block', mb: 0.3 }}>
                            Dimensión Curricular
                          </Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ fontSize: 13, color: dimCfg ? dimCfg.color : 'text.primary' }}>
                            {dimCfg ? `${dimCfg.label} (${dimensionCodigo})` : (dimensionCodigo || 'No especificada')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                </Stack>
              </Grid>

            </Grid>

          </Box>
        )}

      </Container>

      {/* ── MODAL DE PREVISUALIZACIÓN DE FOTO ── */}
      <Dialog
        open={modalPreviewOpen}
        onClose={() => setModalPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            border: `1.5px solid ${alpha(accentColor, 0.3)}`,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon sx={{ color: accentColor }} />
            <Typography variant="subtitle1" fontWeight={800}>
              {modalPreviewTitulo || 'Previsualización de Foto'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadRoundedIcon />}
              onClick={() => handleDescargarArchivo(modalPreviewUrl, modalPreviewNombreArchivo)}
              sx={{
                borderRadius: '10px',
                fontWeight: 800,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                },
              }}
            >
              Descargar foto
            </Button>
            <IconButton onClick={() => setModalPreviewOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: isDark ? alpha('#000', 0.35) : '#f8fafc',
            minHeight: 320,
          }}
        >
          {modalPreviewUrl ? (
            <Box
              component="img"
              src={modalPreviewUrl}
              alt="Previsualización"
              sx={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: '12px',
                objectFit: 'contain',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No se pudo cargar la imagen.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
