'use client';
// app/dashboard/docente/calificaciones/[id]/practica/[evaluacionId]/page.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Container, Typography, Chip, Paper, Avatar,
  TextField, Button, Stack, CircularProgress, Tooltip,
  IconButton, Divider, Alert, useTheme, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, ToggleButton, ToggleButtonGroup,
  FormControlLabel, Checkbox, Menu, MenuItem,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { toast } from 'react-hot-toast';

import { evaluacionesService, entregasService, calificacionesService } from '@/services/notasService';
import { Evaluacion, EstudianteEntregaItem } from '@/types/notasTypes';

// ─── Helpers de Estilo (Idénticos a Examen Virtual y Asistencia LVC) ─────────
const getPctColor = (pct: number) => {
  if (pct >= 85) return '#10b981';
  if (pct >= 51) return '#f59e0b';
  return '#ef4444';
};

const getPctGrad = (pct: number) => {
  if (pct >= 85) return 'linear-gradient(135deg,#10b981,#34d399)';
  if (pct >= 51) return 'linear-gradient(135deg,#f59e0b,#fbbf24)';
  return 'linear-gradient(135deg,#ef4444,#f87171)';
};

function esImagenUrl(url?: string | null, nombre?: string | null): boolean {
  const str = (url || nombre || '').toLowerCase();
  return (
    str.includes('.jpg') ||
    str.includes('.jpeg') ||
    str.includes('.png') ||
    str.includes('.webp') ||
    str.includes('.gif') ||
    str.includes('image/') ||
    str.includes('cloudinary.com')
  );
}

function esPdfUrl(url?: string | null, nombre?: string | null): boolean {
  const str = (url || nombre || '').toLowerCase();
  return str.includes('.pdf');
}

export default function RevisarPracticaDigitalPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const routeId = String(params.id ?? '');
  const evaluacionId = Number(params.evaluacionId ?? 0);
  const paramMatriculaId = searchParams.get('matricula') ? Number(searchParams.get('matricula')) : null;

  // Tokens de diseño exactos de Examen Virtual (LVC Design System)
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const brand = gold;
  const brandDim = isDark ? 'rgba(250,204,21,0.08)' : 'rgba(2,136,209,0.08)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.22)' : 'rgba(2,136,209,0.22)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const borderField = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  // ── Datos de la evaluación ──
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [cargandoEval, setCargandoEval] = useState(true);

  // ── Lista de estudiantes y entregas ──
  const [estudiantes, setEstudiantes] = useState<EstudianteEntregaItem[]>([]);
  const [cargandoEntregas, setCargandoEntregas] = useState(true);
  const [matriculaSeleccionadaId, setMatriculaSeleccionadaId] = useState<number | null>(null);

  // ── Filtros y búsqueda ──
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'completos' | 'sin_entrega'>('todos');
  const [tabMovil, setTabMovil] = useState<'lista' | 'revision'>('lista');

  // ── Modal Lightbox de Visualización de Foto / Documento ──
  const [modalAdjuntoUrl, setModalAdjuntoUrl] = useState<string | null>(null);
  const [modalAdjuntoTipo, setModalAdjuntoTipo] = useState<'imagen' | 'pdf'>('imagen');
  const [modalAdjuntoTitulo, setModalAdjuntoTitulo] = useState<string>('');
  const [zoomNivel, setZoomNivel] = useState<number>(1);
  const [rotacion, setRotacion] = useState<number>(0);
  const [fotoIndex, setFotoIndex] = useState<number>(0);

  // ── Formulario de Calificación local ──
  const [puntajeInput, setPuntajeInput] = useState<string>('');
  const [estaAusente, setEstaAusente] = useState<boolean>(false);
  const [observacionInput, setObservacionInput] = useState<string>('');
  const [guardandoNota, setGuardandoNota] = useState(false);

  // ── Cargar evaluación ──
  const cargarEvaluacion = useCallback(async () => {
    if (!evaluacionId) return;
    setCargandoEval(true);
    try {
      const res = await evaluacionesService.obtenerPorId(evaluacionId);
      setEvaluacion(res.data.evaluacion);
    } catch (err: any) {
      console.error('Error al cargar evaluación:', err);
      toast.error('No se pudo cargar la evaluación');
    } finally {
      setCargandoEval(false);
    }
  }, [evaluacionId]);

  // ── Lista de prácticas digitales disponibles en este curso ──
  const [practicasDigitales, setPracticasDigitales] = useState<Evaluacion[]>([]);
  const [anchorElPracticas, setAnchorElPracticas] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const [asigId, perId] = routeId.split('-').map(Number);
    if (asigId && perId) {
      evaluacionesService.listar({
        asignacion_docente_id: asigId,
        periodo_evaluacion_id: perId,
        activo: true,
        limit: 100,
      }).then(res => {
        const digital = (res.data.evaluaciones || []).filter((e: Evaluacion) => e.permite_entrega_archivo);
        setPracticasDigitales(digital);
      }).catch(() => {});
    }
  }, [routeId]);

  // ── Cargar entregas de los estudiantes ──
  const cargarEntregas = useCallback(async () => {
    if (!evaluacionId) return;
    setCargandoEntregas(true);
    try {
      const res = await entregasService.obtenerEntregasDocente(evaluacionId);
      const lista = res.data.entregas || [];
      setEstudiantes(lista);

      // Si viene por query param ?matricula=
      if (paramMatriculaId) {
        const found = lista.find(e => e.matricula_id === paramMatriculaId);
        if (found) {
          setMatriculaSeleccionadaId(found.matricula_id);
          return;
        }
      }

      // Si no hay seleccionado, seleccionar el primer estudiante con entrega pendiente o el primero
      if (!matriculaSeleccionadaId && lista.length > 0) {
        const pendiente = lista.find(e => Boolean(e.archivo_url) && !e.calificado) || lista[0];
        setMatriculaSeleccionadaId(pendiente.matricula_id);
      }
    } catch (err: any) {
      console.error('Error al cargar entregas:', err);
      toast.error('Error al cargar entregas de la práctica');
    } finally {
      setCargandoEntregas(false);
    }
  }, [evaluacionId, paramMatriculaId, matriculaSeleccionadaId]);

  useEffect(() => {
    cargarEvaluacion();
    cargarEntregas();
  }, [cargarEvaluacion, cargarEntregas]);

  // Estudiante actual
  const estudianteActual = useMemo(() => {
    return estudiantes.find(e => e.matricula_id === matriculaSeleccionadaId) || null;
  }, [estudiantes, matriculaSeleccionadaId]);

  // Sincronizar inputs locales al cambiar de estudiante
  useEffect(() => {
    if (estudianteActual) {
      setPuntajeInput(
        estudianteActual.puntaje_obtenido !== null && estudianteActual.puntaje_obtenido !== undefined
          ? String(estudianteActual.puntaje_obtenido)
          : ''
      );
      setEstaAusente(Boolean(estudianteActual.esta_ausente));
      setObservacionInput(estudianteActual.observacion_docente || '');
      setZoomNivel(1);
      setRotacion(0);
      setFotoIndex(0);
    }
  }, [estudianteActual]);

  // Lista unificada de archivos entregados por el estudiante
  const listaArchivos = useMemo(() => {
    if (!estudianteActual) return [];
    if (Array.isArray(estudianteActual.archivos) && estudianteActual.archivos.length > 0) {
      return estudianteActual.archivos;
    }
    if (estudianteActual.archivo_url) {
      return [{
        url: estudianteActual.archivo_url,
        nombre: estudianteActual.archivo_nombre || 'archivo_entrega',
        tipo: esPdfUrl(estudianteActual.archivo_url, estudianteActual.archivo_nombre) ? 'application/pdf' : 'image/jpeg',
        tamano: estudianteActual.archivo_tamano || undefined,
      }];
    }
    return [];
  }, [estudianteActual]);

  const totalFotos = listaArchivos.length;
  const fotoSeguraIndex = Math.min(Math.max(0, fotoIndex), Math.max(0, totalFotos - 1));
  const archivoActual = listaArchivos[fotoSeguraIndex] || null;
  const tieneVariosArchivos = totalFotos > 1;

  const irAFotoAnterior = useCallback(() => {
    setFotoIndex(prev => {
      const nuevo = Math.max(0, prev - 1);
      if (modalAdjuntoUrl && listaArchivos[nuevo]) {
        setModalAdjuntoUrl(listaArchivos[nuevo].url);
        setModalAdjuntoTipo(esPdfUrl(listaArchivos[nuevo].url, listaArchivos[nuevo].nombre) ? 'pdf' : 'imagen');
      }
      return nuevo;
    });
  }, [modalAdjuntoUrl, listaArchivos]);

  const irAFotoSiguiente = useCallback(() => {
    setFotoIndex(prev => {
      const nuevo = Math.min(totalFotos - 1, prev + 1);
      if (modalAdjuntoUrl && listaArchivos[nuevo]) {
        setModalAdjuntoUrl(listaArchivos[nuevo].url);
        setModalAdjuntoTipo(esPdfUrl(listaArchivos[nuevo].url, listaArchivos[nuevo].nombre) ? 'pdf' : 'imagen');
      }
      return nuevo;
    });
  }, [totalFotos, modalAdjuntoUrl, listaArchivos]);

  const seleccionarFoto = useCallback((idx: number) => {
    setFotoIndex(idx);
    if (modalAdjuntoUrl && listaArchivos[idx]) {
      setModalAdjuntoUrl(listaArchivos[idx].url);
      setModalAdjuntoTipo(esPdfUrl(listaArchivos[idx].url, listaArchivos[idx].nombre) ? 'pdf' : 'imagen');
    }
  }, [modalAdjuntoUrl, listaArchivos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && tieneVariosArchivos) {
        irAFotoAnterior();
      } else if (e.key === 'ArrowRight' && tieneVariosArchivos) {
        irAFotoSiguiente();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tieneVariosArchivos, irAFotoAnterior, irAFotoSiguiente]);

  // Estudiantes filtrados
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(e => {
      const q = busqueda.trim().toLowerCase();
      const matchBusqueda =
        !q ||
        e.estudiante_nombres.toLowerCase().includes(q) ||
        e.estudiante_apellidos.toLowerCase().includes(q) ||
        e.estudiante_codigo.toLowerCase().includes(q);

      if (!matchBusqueda) return false;

      const tieneArchivo = Boolean(e.archivo_url);
      const estaCalificado = Boolean(e.calificado);

      if (filtroEstado === 'pendientes') return tieneArchivo && !estaCalificado;
      if (filtroEstado === 'completos') return estaCalificado;
      if (filtroEstado === 'sin_entrega') return !tieneArchivo;
      return true;
    });
  }, [estudiantes, busqueda, filtroEstado]);

  // Índices para navegación siguiente/anterior
  const indiceActual = useMemo(() => {
    return estudiantesFiltrados.findIndex(e => e.matricula_id === matriculaSeleccionadaId);
  }, [estudiantesFiltrados, matriculaSeleccionadaId]);

  const anteriorEstudiante = useMemo(() => {
    if (indiceActual > 0) return estudiantesFiltrados[indiceActual - 1];
    return null;
  }, [estudiantesFiltrados, indiceActual]);

  const siguienteEstudiante = useMemo(() => {
    if (indiceActual >= 0 && indiceActual < estudiantesFiltrados.length - 1) {
      return estudiantesFiltrados[indiceActual + 1];
    }
    return null;
  }, [estudiantesFiltrados, indiceActual]);

  // Métricas idénticas al ribbon de Examen Virtual
  const totalInscritos = estudiantes.length;
  const totalEntregados = estudiantes.filter(e => Boolean(e.archivo_url)).length;
  const totalCalificadosCompletos = estudiantes.filter(e => Boolean(e.calificado)).length;
  const totalPendientesRevision = estudiantes.filter(e => Boolean(e.archivo_url) && !e.calificado).length;
  const totalSinEntrega = totalInscritos - totalEntregados;

  const puntajeMaximo = evaluacion?.puntaje_maximo || 100;

  const notasCalificadas = estudiantes
    .filter(e => typeof e.puntaje_obtenido === 'number' && !e.esta_ausente)
    .map(e => Number(e.puntaje_obtenido));

  const totalAprobados = notasCalificadas.filter(n => puntajeMaximo > 0 && (n / puntajeMaximo) * 100 >= 51).length;

  const promedioCalificados = notasCalificadas.length > 0
    ? Math.round((notasCalificadas.reduce((a, b) => a + b, 0) / notasCalificadas.length) * 10) / 10
    : null;

  const porcentajePromedio = promedioCalificados != null && puntajeMaximo > 0
    ? Math.round((promedioCalificados / puntajeMaximo) * 100)
    : 0;

  // Manejo de Guardado de Nota
  const handleGuardarCalificacion = async (avanzarSiguiente: boolean = false) => {
    if (!estudianteActual || !evaluacion) return;

    let notaNum = 0;
    if (!estaAusente) {
      const parsed = parseFloat(puntajeInput);
      if (isNaN(parsed)) {
        toast.error('Ingrese un puntaje válido o marque como ausente');
        return;
      }
      if (parsed < 0 || parsed > evaluacion.puntaje_maximo) {
        toast.error(`La nota debe estar entre 0 y ${evaluacion.puntaje_maximo} pts`);
        return;
      }
      notaNum = parsed;
    }

    setGuardandoNota(true);
    try {
      await calificacionesService.guardarIndividual({
        evaluacion_id: evaluacion.id,
        matricula_id: estudianteActual.matricula_id,
        puntaje_obtenido: estaAusente ? 0 : notaNum,
        esta_ausente: estaAusente,
        observacion: observacionInput.trim() || undefined,
      });

      toast.success(
        estaAusente
          ? `Marcado como Ausente: ${estudianteActual.estudiante_apellidos}`
          : `Calificación guardada: ${notaNum} / ${evaluacion.puntaje_maximo} pts`
      );

      // Actualizar en memoria local
      setEstudiantes(prev =>
        prev.map(item =>
          item.matricula_id === estudianteActual.matricula_id
            ? {
                ...item,
                puntaje_obtenido: estaAusente ? 0 : notaNum,
                esta_ausente: estaAusente,
                observacion_docente: observacionInput.trim() || null,
                calificado: true,
              }
            : item
        )
      );

      if (avanzarSiguiente && siguienteEstudiante) {
        setMatriculaSeleccionadaId(siguienteEstudiante.matricula_id);
      }
    } catch (err: any) {
      console.error('Error al guardar calificación:', err);
      toast.error(err.response?.data?.message || 'Error al guardar la calificación');
    } finally {
      setGuardandoNota(false);
    }
  };

  // Descarga limpia con Blob
  const handleDescargarArchivo = async (url: string, nombreDescarga: string) => {
    try {
      toast.loading('Iniciando descarga...', { id: 'descargando' });
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('No se pudo descargar el archivo');
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nombreDescarga;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success('Archivo descargado correctamente', { id: 'descargando' });
    } catch {
      window.open(url, '_blank');
      toast.success('Abriendo en nueva pestaña...', { id: 'descargando' });
    }
  };

  if (cargandoEval) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} sx={{ color: gold }} />
      </Box>
    );
  }

  if (!evaluacion) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          No se encontró la evaluación especificada o no tiene permisos para acceder.
        </Alert>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push(`/dashboard/docente/calificaciones/${routeId}`)}
          sx={{ mt: 2 }}
        >
          Volver a Planilla de Calificaciones
        </Button>
      </Container>
    );
  }

  const tieneFoto = esImagenUrl(estudianteActual?.archivo_url, estudianteActual?.archivo_nombre);
  const tienePdf = esPdfUrl(estudianteActual?.archivo_url, estudianteActual?.archivo_nombre);

  const pctEstudianteActual = estudianteActual && puntajeMaximo > 0 && typeof estudianteActual.puntaje_obtenido === 'number'
    ? (estudianteActual.puntaje_obtenido / puntajeMaximo) * 100
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 1.5, sm: 3 }, px: { xs: 1, sm: 2.5, md: 4 }, width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Container maxWidth="xl" disableGutters sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>

        {/* ── Volver a planilla de calificaciones y selector de cambio de práctica ── */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box
            onClick={() => router.push(`/dashboard/docente/calificaciones/${routeId}`)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.8,
              cursor: 'pointer', color: 'text.secondary', fontSize: { xs: 12, sm: 13 }, fontWeight: 700,
              p: 0.8, borderRadius: '8px',
              transition: 'all 0.15s ease',
              '&:hover': { color: gold, bgcolor: alpha(gold, 0.08) },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
            Volver a Planilla de Calificaciones
          </Box>

          {/* Selector para cambiar de práctica si existen varias */}
          {practicasDigitales.length > 1 && (
            <Box>
              <Button
                size="small"
                onClick={(e) => setAnchorElPracticas(e.currentTarget)}
                endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '10px',
                  border: `1.5px solid ${alpha('#3b82f6', 0.45)}`,
                  bgcolor: isDark ? alpha('#3b82f6', 0.16) : alpha('#3b82f6', 0.1),
                  color: isDark ? '#60a5fa' : '#2563eb',
                  fontWeight: 700,
                  fontSize: 12.5,
                  textTransform: 'none',
                  py: 0.6,
                  px: 1.8,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isDark ? alpha('#3b82f6', 0.26) : alpha('#3b82f6', 0.18),
                    borderColor: '#3b82f6',
                  },
                }}
              >
                Cambiar práctica ({practicasDigitales.findIndex(p => p.id === evaluacionId) + 1} de {practicasDigitales.length})
              </Button>

              <Menu
                anchorEl={anchorElPracticas}
                open={Boolean(anchorElPracticas)}
                onClose={() => setAnchorElPracticas(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 290,
                    maxWidth: 380,
                    borderRadius: '16px',
                    bgcolor: isDark ? '#0d1726' : '#ffffff',
                    border: `1.5px solid ${alpha('#3b82f6', 0.35)}`,
                    boxShadow: isDark
                      ? '0 16px 36px rgba(0,0,0,0.65)'
                      : '0 16px 36px rgba(59,130,246,0.18)',
                    p: 0.8,
                  },
                }}
              >
                <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Prácticas Digitales Disponibles ({practicasDigitales.length})
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Selecciona la práctica que deseas calificar:
                  </Typography>
                </Box>
                {practicasDigitales.map((p) => {
                  const esActual = p.id === evaluacionId;
                  return (
                    <MenuItem
                      key={p.id}
                      selected={esActual}
                      onClick={() => {
                        setAnchorElPracticas(null);
                        if (!esActual) {
                          router.push(`/dashboard/docente/calificaciones/${routeId}/practica/${p.id}`);
                        }
                      }}
                      sx={{
                        borderRadius: '10px',
                        my: 0.3,
                        py: 1.1,
                        px: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.15s ease',
                        bgcolor: esActual ? (isDark ? alpha('#3b82f6', 0.2) : alpha('#3b82f6', 0.12)) : 'transparent',
                        '&:hover': {
                          bgcolor: alpha('#3b82f6', isDark ? 0.25 : 0.16),
                          transform: 'translateX(3px)',
                        },
                      }}
                    >
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        bgcolor: alpha('#3b82f6', 0.15),
                        border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <CloudUploadRoundedIcon sx={{ fontSize: 17, color: '#3b82f6' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: esActual ? 800 : 600, color: esActual ? (isDark ? '#93c5fd' : '#1d4ed8') : 'text.primary' }} noWrap>
                          {p.nombre}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.2 }}>
                          /{p.puntaje_maximo} pts
                        </Typography>
                      </Box>
                      {esActual ? (
                        <Chip size="small" label="Viendo" sx={{ fontSize: 10, fontWeight: 800, height: 20, bgcolor: '#3b82f6', color: '#fff' }} />
                      ) : (
                        <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      )}
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          )}
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            1. HEADER RESUMEN (Coherencia exacta con Examen Virtual LVC)
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap', gap: 2, mb: 2.5, p: { xs: 1.8, sm: 2.5 }, borderRadius: '16px',
          border: `1.5px solid ${borderField}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          width: '100%', boxSizing: 'border-box',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              bgcolor: brandDim, border: `1px solid ${brandBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CloudUploadRoundedIcon sx={{ color: gold, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{
                background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1.2, mb: 0.3, fontSize: { xs: 17, sm: 20 },
              }}>
                {evaluacion.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 12 }}>
                {evaluacion.materia_nombre ? `${evaluacion.materia_nombre} · ` : ''}
                {evaluacion.grado_nombre ? `${evaluacion.grado_nombre} "${evaluacion.paralelo_nombre}" · ` : ''}
                <strong>{totalInscritos}</strong> estudiantes · Puntaje máx: <strong>{puntajeMaximo} pts</strong>
                {evaluacion.fecha_limite ? ` · Límite: ${new Date(evaluacion.fecha_limite).toLocaleDateString()} ${new Date(evaluacion.fecha_limite).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}>
            {/* Refrescar */}
            <Tooltip title="Actualizar datos y entregas">
              <IconButton
                size="small"
                onClick={cargarEntregas}
                sx={{
                  borderRadius: '10px',
                  border: `1px solid ${borderField}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: 'text.secondary',
                  '&:hover': { color: gold, borderColor: brandBorder },
                  p: 0.9,
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Badge de Promedio de la Clase - Estilo elegante LVC */}
            <Box sx={{
              px: 2, py: 0.9, borderRadius: '12px',
              border: `1.5px solid ${alpha(getPctColor(porcentajePromedio), 0.35)}`,
              bgcolor: isDark ? alpha(getPctColor(porcentajePromedio), 0.1) : alpha(getPctColor(porcentajePromedio), 0.06),
              display: 'flex', alignItems: 'center', gap: 1.2,
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: getPctColor(porcentajePromedio),
                boxShadow: `0 0 8px ${getPctColor(porcentajePromedio)}`,
              }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Promedio del curso
                </Typography>
                <Typography variant="body2" fontWeight={900} sx={{ color: getPctColor(porcentajePromedio), lineHeight: 1.1, fontSize: 13 }}>
                  {promedioCalificados != null ? `${promedioCalificados} pts (${porcentajePromedio}%)` : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            2. STAT CARDS (Sleek Ribbon idéntico a Examen Virtual)
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: { xs: 1, sm: 1.5 },
          mb: 2.5,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {[
            { label: 'Total Estudiantes', value: totalInscritos, color: '#3b82f6' },
            { label: 'Prácticas Entregadas', value: totalEntregados, color: '#8b5cf6' },
            { label: 'Por Calificar', value: totalPendientesRevision, color: '#f59e0b' },
            { label: 'Calificados', value: totalCalificadosCompletos, color: '#10b981' },
            { label: 'Sin Entrega', value: totalSinEntrega, color: '#ef4444' },
            { label: 'Aprobados (≥51%)', value: totalAprobados, color: '#10b981' },
          ].map(s => (
            <Box key={s.label} sx={{
              p: { xs: 1.2, sm: 1.5 },
              borderRadius: '12px',
              border: `1px solid ${isDark ? alpha(s.color, 0.22) : alpha(s.color, 0.2)}`,
              bgcolor: isDark ? alpha(s.color, 0.05) : alpha(s.color, 0.03),
              borderLeft: `3.5px solid ${s.color}`,
              minWidth: 0,
              overflow: 'hidden',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark ? '0 6px 16px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.06)',
              }
            }}>
              <Typography variant="h6" fontWeight={900} sx={{ color: s.color, lineHeight: 1.1, mb: 0.3, fontSize: { xs: 16, sm: 18 } }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: { xs: 10, sm: 11 }, display: 'block', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            3. BARRA DE BÚSQUEDA Y FILTROS (100% Responsivo en móvil)
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'flex', gap: 1.5,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 2.5,
          p: { xs: 1.2, sm: 1.5 }, borderRadius: '14px',
          border: `1.5px solid ${borderField}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <TextField
            size="small"
            placeholder="Buscar estudiante por nombre o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
            sx={{
              flex: 1, minWidth: 0, width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: 13,
                bgcolor: bgField,
                '& fieldset': { borderColor: borderField },
                '&:hover fieldset': { borderColor: alpha(brand, 0.4) },
                '&.Mui-focused fieldset': { borderColor: brand },
              }
            }}
          />

          <Box sx={{
            overflowX: 'auto',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            py: 0.2,
          }}>
            <ToggleButtonGroup
              value={filtroEstado}
              exclusive
              onChange={(_, v) => v && setFiltroEstado(v)}
              size="small"
              sx={{
                bgcolor: bgField,
                p: 0.4,
                borderRadius: '10px',
                border: `1px solid ${borderField}`,
                display: 'flex',
                width: 'max-content',
                '& .MuiToggleButton-root': {
                  borderRadius: '8px !important',
                  px: 1.4, py: 0.6,
                  fontWeight: 700,
                  fontSize: 11.5,
                  textTransform: 'none',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: 'text.primary',
                  }
                }
              }}
            >
              <ToggleButton value="todos">Todos ({estudiantes.length})</ToggleButton>
              <ToggleButton value="pendientes" sx={{ '&.Mui-selected': { bgcolor: alpha('#f59e0b', 0.15) + ' !important', color: '#f59e0b !important' } }}>
                ⏳ Por calificar ({totalPendientesRevision})
              </ToggleButton>
              <ToggleButton value="completos" sx={{ '&.Mui-selected': { bgcolor: alpha('#10b981', 0.15) + ' !important', color: '#10b981 !important' } }}>
                ✓ Calificados ({totalCalificadosCompletos})
              </ToggleButton>
              <ToggleButton value="sin_entrega" sx={{ '&.Mui-selected': { bgcolor: alpha('#64748b', 0.15) + ' !important', color: '#94a3b8 !important' } }}>
                Sin entrega ({totalSinEntrega})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ── Selector de Pestañas para Móvil (Lista vs Revisión) ── */}
        <Box sx={{
          display: { xs: 'flex', lg: 'none' },
          mb: 2, bgcolor: bgField, p: 0.5, borderRadius: '12px',
          border: `1px solid ${borderField}`, width: '100%', boxSizing: 'border-box'
        }}>
          <Button
            fullWidth
            onClick={() => setTabMovil('lista')}
            sx={{
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              py: 0.8,
              bgcolor: tabMovil === 'lista' ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
              color: tabMovil === 'lista' ? gold : 'text.secondary',
              boxShadow: tabMovil === 'lista' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Estudiantes ({estudiantesFiltrados.length})
          </Button>
          <Button
            fullWidth
            onClick={() => setTabMovil('revision')}
            disabled={!matriculaSeleccionadaId}
            sx={{
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              py: 0.8,
              bgcolor: tabMovil === 'revision' ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
              color: tabMovil === 'revision' ? gold : 'text.secondary',
              boxShadow: tabMovil === 'revision' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Revisión {estudianteActual ? `· ${estudianteActual.estudiante_nombres.split(' ')[0]}` : ''}
          </Button>
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            4. WORKSPACE EN 2 PANELES: LISTA ESTUDIANTES + REVISIÓN DETALLADA
           ═════════════════════════════════════════════════════════════════════ */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
          gap: 2.5,
          alignItems: 'start',
          width: '100%',
          minWidth: 0,
        }}>

          {/* ── PANEL IZQUIERDO: LISTA DE ESTUDIANTES ── */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: tabMovil === 'lista' ? 'block' : 'none', lg: 'block' },
              p: { xs: 1.5, sm: 2 },
              borderRadius: '14px',
              border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              minWidth: 0, width: '100%', boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}` }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Estudiantes ({estudiantesFiltrados.length})
              </Typography>
            </Box>

            {cargandoEntregas ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ color: gold }} />
              </Box>
            ) : estudiantesFiltrados.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  No se encontraron estudiantes para este filtro.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ maxHeight: '72vh', overflowY: 'auto', pr: 0.5 }}>
                {estudiantesFiltrados.map((item, i) => {
                  const tieneArchivo = Boolean(item.archivo_url);
                  const seleccionado = item.matricula_id === matriculaSeleccionadaId;
                  const pctItem = puntajeMaximo > 0 ? ((item.puntaje_obtenido ?? 0) / puntajeMaximo) * 100 : 0;
                  const colorItem = item.esta_ausente ? '#ef4444' : item.calificado ? getPctColor(pctItem) : '#64748b';

                  return (
                    <Box
                      key={item.matricula_id}
                      onClick={() => {
                        setMatriculaSeleccionadaId(item.matricula_id);
                        setTabMovil('revision');
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.2,
                        p: 1.3,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: `1.5px solid ${seleccionado
                          ? brandBorder
                          : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)
                        }`,
                        bgcolor: seleccionado
                          ? (isDark ? alpha(gold, 0.12) : alpha(gold, 0.07))
                          : (isDark ? alpha('#fff', 0.015) : '#fcfdfe'),
                        boxShadow: seleccionado
                          ? (isDark ? `0 4px 14px rgba(0,0,0,0.4), inset 3px 0 0 ${gold}` : `0 4px 14px ${alpha(gold, 0.25)}, inset 3px 0 0 ${gold}`)
                          : 'none',
                        transition: 'all 0.16s ease',
                        '&:hover': {
                          transform: 'translateX(3px)',
                          borderColor: brandBorder,
                        },
                      }}
                    >
                      {/* Avatar + Nombre + Código */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ minWidth: 20, textAlign: 'center', flexShrink: 0 }}>
                          {i + 1}
                        </Typography>
                        <Avatar
                          src={item.estudiante_foto || undefined}
                          sx={{
                            width: 36, height: 36, fontSize: 12, fontWeight: 800, flexShrink: 0,
                            background: item.calificado ? getPctGrad(pctItem) : alpha('#64748b', 0.2),
                            color: '#fff',
                            border: `2px solid ${alpha(colorItem, 0.35)}`,
                          }}
                        >
                          {item.estudiante_nombres.charAt(0)}{item.estudiante_apellidos.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight={800} noWrap sx={{ fontSize: 13, maxWidth: { xs: 125, sm: 170, md: 'none' } }}>
                            {item.estudiante_apellidos}, {item.estudiante_nombres}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5 }}>
                            {item.estudiante_codigo}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Puntaje o Estado */}
                      {item.esta_ausente ? (
                        <Chip
                          label="Ausente"
                          size="small"
                          sx={{ fontSize: 9.5, height: 18, color: '#ef4444', bgcolor: alpha('#ef4444', 0.12), fontWeight: 800, flexShrink: 0 }}
                        />
                      ) : item.calificado ? (
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="body2" fontWeight={900} sx={{ color: colorItem, fontSize: 13, lineHeight: 1 }}>
                            {item.puntaje_obtenido ?? 0} <span style={{ fontSize: 10, color: 'gray' }}>/ {puntajeMaximo}</span>
                          </Typography>
                          <Box sx={{ width: { xs: 45, sm: 60 }, height: 4, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06), mt: 0.5, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${Math.min(100, Math.max(0, pctItem))}%`, background: getPctGrad(pctItem), borderRadius: 2 }} />
                          </Box>
                        </Box>
                      ) : tieneArchivo ? (
                        <Chip
                          icon={<HourglassEmptyRoundedIcon sx={{ fontSize: '11px !important', color: '#f59e0b' }} />}
                          label="Por calificar"
                          size="small"
                          sx={{ fontSize: 9.5, height: 18, color: '#f59e0b', bgcolor: alpha('#f59e0b', 0.12), fontWeight: 700, flexShrink: 0 }}
                        />
                      ) : (
                        <Chip
                          label="Sin entrega"
                          size="small"
                          sx={{ fontSize: 9.5, height: 18, color: 'text.disabled', flexShrink: 0 }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* ── PANEL DERECHO: REVISIÓN DETALLADA DE LA PRÁCTICA ── */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: tabMovil === 'revision' ? 'block' : 'none', lg: 'block' },
              p: { xs: 1.8, sm: 3 },
              borderRadius: '14px',
              border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
              bgcolor: isDark ? alpha('#fff', 0.02) : '#ffffff',
              minWidth: 0, width: '100%', boxSizing: 'border-box',
            }}
          >
            {!estudianteActual ? (
              <Box sx={{ py: 12, textAlign: 'center' }}>
                <CloudUploadRoundedIcon sx={{ fontSize: 48, color: alpha(gold, 0.4), mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800}>
                  Selecciona un estudiante
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mt: 0.5 }}>
                  Elige a un estudiante de la lista izquierda para inspeccionar su entrega fotográfica y calificar la práctica.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setTabMovil('lista')}
                  sx={{ display: { xs: 'inline-flex', lg: 'none' }, mt: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Ver lista de estudiantes
                </Button>
              </Box>
            ) : (
              <Box>
                {/* Botón volver a lista en móvil */}
                <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 1.5 }}>
                  <Button
                    size="small"
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => setTabMovil('lista')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 12,
                      color: 'text.secondary',
                      p: 0.5,
                    }}
                  >
                    ← Volver a lista de estudiantes
                  </Button>
                </Box>

                {/* Cabecera del Estudiante (Idéntica a Examen Virtual) */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 2, pb: 2.2, mb: 3,
                  borderBottom: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 46, height: 46, fontSize: 15, fontWeight: 900,
                        background: estudianteActual.calificado ? getPctGrad(pctEstudianteActual) : alpha('#64748b', 0.2),
                        color: '#fff',
                        border: `2px solid ${alpha(gold, 0.35)}`,
                      }}
                    >
                      {estudianteActual.estudiante_nombres.charAt(0)}{estudianteActual.estudiante_apellidos.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        {estudianteActual.estudiante_apellidos}, {estudianteActual.estudiante_nombres}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Código: {estudianteActual.estudiante_codigo} · Entregado:{' '}
                        {estudianteActual.fecha_entrega
                          ? new Date(estudianteActual.fecha_entrega).toLocaleString('es-BO', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })
                          : 'Sin entrega de archivo'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Puntuación y Flechas de Navegación */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', fontSize: 10.5, letterSpacing: 0.5 }}>
                        PUNTAJE ACTUAL
                      </Typography>
                      <Typography variant="h5" fontWeight={900} sx={{ color: gold, lineHeight: 1 }}>
                        {estudianteActual.esta_ausente ? 'Ausente' : (estudianteActual.puntaje_obtenido ?? '—')}{' '}
                        <span style={{ fontSize: '0.85rem', color: 'gray' }}>/ {puntajeMaximo} pts</span>
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    {/* Controles secuenciales Anterior / Siguiente */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="Estudiante anterior">
                        <span>
                          <IconButton
                            disabled={!anteriorEstudiante || guardandoNota}
                            onClick={() => anteriorEstudiante && setMatriculaSeleccionadaId(anteriorEstudiante.matricula_id)}
                            size="small"
                            sx={{ border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}` }}
                          >
                            <NavigateBeforeRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Siguiente estudiante">
                        <span>
                          <IconButton
                            disabled={!siguienteEstudiante || guardandoNota}
                            onClick={() => siguienteEstudiante && setMatriculaSeleccionadaId(siguienteEstudiante.matricula_id)}
                            size="small"
                            sx={{ border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}` }}
                          >
                            <NavigateNextRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* ── CUERPO: VISUALIZACIÓN DE LA EVIDENCIA FOTOGRÁFICA / ARCHIVO ── */}
                <Stack spacing={2.5}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: '12px',
                      border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      bgcolor: isDark ? alpha('#fff', 0.015) : '#fcfdfe',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: gold }}>
                          Entrega Digital de la Práctica
                        </Typography>
                        {archivoActual && (
                          <Chip
                            label={esPdfUrl(archivoActual.url, archivoActual.nombre) ? 'Documento PDF' : `Foto ${fotoSeguraIndex + 1} de ${totalFotos}`}
                            size="small"
                            sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
                          />
                        )}
                        {tieneVariosArchivos && (
                          <Chip
                            label={`${totalFotos} fotos subidas`}
                            size="small"
                            sx={{ fontSize: 10, height: 20, bgcolor: alpha(gold, 0.18), color: gold, fontWeight: 800, border: `1px solid ${brandBorder}` }}
                          />
                        )}
                        {estudianteActual.estado_entrega === 'tardia' && (
                          <Chip
                            label="Entrega tardía"
                            size="small"
                            sx={{ fontSize: 10, height: 20, bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b', fontWeight: 800 }}
                          />
                        )}
                      </Box>

                      {archivoActual?.tamano && (
                        <Typography variant="caption" color="text.secondary">
                          Tamaño foto actual: {(archivoActual.tamano / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      )}
                    </Box>

                    {/* Comentario del estudiante si existe */}
                    {estudianteActual.comentario_estudiante ? (
                      <Box sx={{
                        p: 1.8, borderRadius: '10px',
                        bgcolor: bgField,
                        border: `1px solid ${borderField}`,
                        mb: 2,
                      }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
                          Comentario del estudiante:
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontStyle: 'italic' }}>
                          "{estudianteActual.comentario_estudiante}"
                        </Typography>
                      </Box>
                    ) : null}

                    {/* Barra y carrusel de miniaturas cuando hay varias fotos */}
                    {tieneVariosArchivos && (
                      <Box sx={{
                        mb: 2,
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${borderField}`,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2, px: 0.5 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ color: gold, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <ImageRoundedIcon sx={{ fontSize: 16 }} />
                            Páginas de la práctica: Página {fotoSeguraIndex + 1} de {totalFotos}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={fotoSeguraIndex === 0}
                              onClick={irAFotoAnterior}
                              startIcon={<NavigateBeforeRoundedIcon />}
                              sx={{
                                py: 0.2, px: 1,
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '8px',
                                borderColor: borderField,
                                color: 'text.secondary',
                                '&:not(:disabled):hover': { color: gold, borderColor: gold, bgcolor: alpha(gold, 0.08) }
                              }}
                            >
                              Anterior
                            </Button>
                            <Chip
                              label={`${fotoSeguraIndex + 1} / ${totalFotos}`}
                              size="small"
                              sx={{
                                fontSize: 11,
                                fontWeight: 800,
                                height: 24,
                                bgcolor: alpha(gold, 0.15),
                                color: gold,
                                border: `1px solid ${alpha(gold, 0.3)}`
                              }}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={fotoSeguraIndex >= totalFotos - 1}
                              onClick={irAFotoSiguiente}
                              endIcon={<NavigateNextRoundedIcon />}
                              sx={{
                                py: 0.2, px: 1,
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '8px',
                                borderColor: borderField,
                                color: 'text.secondary',
                                '&:not(:disabled):hover': { color: gold, borderColor: gold, bgcolor: alpha(gold, 0.08) }
                              }}
                            >
                              Siguiente
                            </Button>
                          </Box>
                        </Box>

                        {/* Tira horizontal de miniaturas clickeables */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                          overflowX: 'auto',
                          pb: 0.5,
                          pt: 0.3,
                          px: 0.5,
                          '&::-webkit-scrollbar': { height: 6 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: alpha(gold, 0.3), borderRadius: 3 }
                        }}>
                          {listaArchivos.map((arch, idx) => {
                            const esActivo = idx === fotoSeguraIndex;
                            const archEsPdf = esPdfUrl(arch.url, arch.nombre);
                            return (
                              <Box
                                key={idx}
                                onClick={() => seleccionarFoto(idx)}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 0.4,
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                <Box sx={{
                                  position: 'relative',
                                  width: 62,
                                  height: 62,
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: esActivo ? `2.5px solid ${gold}` : `1.5px solid ${borderField}`,
                                  boxShadow: esActivo ? `0 0 12px ${alpha(gold, 0.5)}` : 'none',
                                  transform: esActivo ? 'scale(1.05)' : 'scale(1)',
                                  transition: 'all 0.15s ease',
                                  bgcolor: isDark ? '#09101d' : '#f1f5f9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  {archEsPdf ? (
                                    <PictureAsPdfRoundedIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                                  ) : (
                                    <Box
                                      component="img"
                                      src={arch.url}
                                      alt={`Página ${idx + 1}`}
                                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  )}
                                  <Box sx={{
                                    position: 'absolute',
                                    top: 2,
                                    left: 2,
                                    px: 0.6,
                                    py: 0.1,
                                    borderRadius: '4px',
                                    bgcolor: esActivo ? gold : 'rgba(0,0,0,0.65)',
                                    color: esActivo ? '#000' : '#fff',
                                    fontSize: 9,
                                    fontWeight: 900,
                                    lineHeight: 1.2,
                                  }}>
                                    {idx + 1}
                                  </Box>
                                </Box>
                                <Typography variant="caption" sx={{
                                  fontSize: 10,
                                  fontWeight: esActivo ? 800 : 600,
                                  color: esActivo ? gold : 'text.secondary'
                                }}>
                                  Foto {idx + 1}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                    {/* ── VISUALIZACIÓN DE ARCHIVO / IMAGEN EN EL MISMO LUGAR (Exacto Examen Virtual) ── */}
                    {archivoActual ? (() => {
                      const isPdf = esPdfUrl(archivoActual.url, archivoActual.nombre);
                      return (
                        <Box sx={{
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: `1.5px solid ${borderField}`,
                          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: brandBorder }
                        }}>
                          {/* Barra superior de la evidencia */}
                          <Box sx={{
                            px: 2, py: 1.2,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 1,
                            bgcolor: brandDim,
                            borderBottom: `1px solid ${borderField}`,
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Avatar sx={{
                                width: 28, height: 28,
                                bgcolor: isPdf ? alpha('#ef4444', 0.15) : alpha(gold, 0.15),
                                color: isPdf ? '#ef4444' : gold,
                              }}>
                                {isPdf ? (
                                  <PictureAsPdfRoundedIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <ImageRoundedIcon sx={{ fontSize: 16 }} />
                                )}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={800} sx={{ display: 'block', lineHeight: 1.1, color: 'text.primary' }}>
                                  {isPdf
                                    ? 'Documento adjunto (PDF)'
                                    : tieneVariosArchivos
                                      ? `Evidencia fotográfica · Página ${fotoSeguraIndex + 1} de ${totalFotos}`
                                      : 'Evidencia fotográfica adjunta'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
                                  {archivoActual.nombre || 'Archivo entregado por el estudiante'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={isPdf ? <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} /> : <FullscreenRoundedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => {
                                  setModalAdjuntoUrl(archivoActual.url);
                                  setModalAdjuntoTipo(isPdf ? 'pdf' : 'imagen');
                                  setModalAdjuntoTitulo(`Práctica · ${estudianteActual.estudiante_nombres} ${estudianteActual.estudiante_apellidos} (Foto ${fotoSeguraIndex + 1}/${totalFotos})`);
                                  setZoomNivel(1);
                                  setRotacion(0);
                                }}
                                sx={{
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  fontSize: 11.5,
                                  py: 0.4, px: 1.5,
                                  borderColor: brandBorder,
                                  color: gold,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                                  '&:hover': {
                                    borderColor: gold,
                                    bgcolor: alpha(gold, 0.12),
                                  }
                                }}
                              >
                                {isPdf ? 'Abrir PDF en visor' : 'Inspeccionar imagen'}
                              </Button>

                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleDescargarArchivo(
                                  archivoActual.url,
                                  archivoActual.nombre || `practica_${estudianteActual.estudiante_apellidos}_foto_${fotoSeguraIndex + 1}.jpg`
                                )}
                                sx={{
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  fontSize: 11.5,
                                  py: 0.4, px: 1.5,
                                  bgcolor: '#059669',
                                  color: '#fff',
                                  '&:hover': { bgcolor: '#047857' }
                                }}
                              >
                                Descargar
                              </Button>
                            </Box>
                          </Box>

                          {!isPdf ? (
                            <Box
                              onClick={() => {
                                setModalAdjuntoUrl(archivoActual.url);
                                setModalAdjuntoTipo('imagen');
                                setModalAdjuntoTitulo(`Práctica · ${estudianteActual.estudiante_nombres} ${estudianteActual.estudiante_apellidos} (Foto ${fotoSeguraIndex + 1}/${totalFotos})`);
                                setZoomNivel(1);
                                setRotacion(0);
                              }}
                              sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                background: isDark
                                  ? 'linear-gradient(180deg, #09101d 0%, #060a14 100%)'
                                  : 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                                '&:hover .preview-overlay': { opacity: 1 },
                                '&:hover img': { transform: 'scale(1.015)' }
                              }}
                            >
                              {/* Botón flotante Anterior en la imagen */}
                              {tieneVariosArchivos && (
                                <IconButton
                                  size="small"
                                  disabled={fotoSeguraIndex === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    irAFotoAnterior();
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 5,
                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                    color: '#fff',
                                    border: `1px solid ${alpha(gold, 0.4)}`,
                                    backdropFilter: 'blur(4px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)', color: gold },
                                    '&:disabled': { opacity: 0.15, bgcolor: 'rgba(0,0,0,0.2)' }
                                  }}
                                >
                                  <NavigateBeforeRoundedIcon fontSize="medium" />
                                </IconButton>
                              )}

                              {/* Botón flotante Siguiente en la imagen */}
                              {tieneVariosArchivos && (
                                <IconButton
                                  size="small"
                                  disabled={fotoSeguraIndex >= totalFotos - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    irAFotoSiguiente();
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    right: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 5,
                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                    color: '#fff',
                                    border: `1px solid ${alpha(gold, 0.4)}`,
                                    backdropFilter: 'blur(4px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)', color: gold },
                                    '&:disabled': { opacity: 0.15, bgcolor: 'rgba(0,0,0,0.2)' }
                                  }}
                                >
                                  <NavigateNextRoundedIcon fontSize="medium" />
                                </IconButton>
                              )}

                              <Box
                                component="img"
                                src={archivoActual.url}
                                alt={`Evidencia fotográfica ${fotoSeguraIndex + 1}`}
                                sx={{
                                  maxHeight: 460,
                                  maxWidth: '100%',
                                  borderRadius: '10px',
                                  objectFit: 'contain',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                  transition: 'transform 0.25s ease',
                                }}
                              />
                              <Box
                                className="preview-overlay"
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  bgcolor: 'rgba(9, 16, 29, 0.65)',
                                  backdropFilter: 'blur(3px)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 1.2,
                                  opacity: 0,
                                  transition: 'opacity 0.2s ease',
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: 13,
                                }}
                              >
                                <Box sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  px: 2, py: 0.9, borderRadius: '20px',
                                  bgcolor: 'rgba(0,0,0,0.65)', border: `1px solid ${alpha(gold, 0.4)}`,
                                  color: gold,
                                }}>
                                  <ZoomInRoundedIcon sx={{ fontSize: 19 }} />
                                  Haz clic para ampliar con zoom y rotación
                                </Box>
                              </Box>
                            </Box>
                          ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Archivo PDF adjunto. Haz clic en "Abrir PDF en visor" para inspeccionarlo en pantalla completa.
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })() : (
                      <Box sx={{
                        p: 4, textAlign: 'center', borderRadius: '12px',
                        border: `1.5px dashed ${borderField}`,
                        bgcolor: bgField,
                      }}>
                        <WarningAmberRoundedIcon sx={{ fontSize: 44, color: '#f59e0b', mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight={800}>
                          Sin evidencia de entrega
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 360, mx: 'auto', mt: 0.5 }}>
                          El estudiante no ha adjuntado ningún archivo para esta práctica. Puedes asignarle un puntaje directamente o marcarlo como ausente.
                        </Typography>
                      </Box>
                    )}
                  </Paper>

                  {/* ── PANEL DE ASIGNACIÓN DE CALIFICACIÓN (Coherente con Examen Virtual) ── */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: '12px',
                      border: `1.5px solid ${brandBorder}`,
                      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: gold }}>
                        <StarRoundedIcon sx={{ fontSize: 18 }} />
                        Calificación y Retroalimentación del Docente
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, gap: 2.5, alignItems: 'start' }}>
                      {/* Puntos Asignados */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', mb: 0.8, fontSize: 11, textTransform: 'uppercase' }}>
                          Puntos (Máx {puntajeMaximo})
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          disabled={estaAusente}
                          value={estaAusente ? '' : puntajeInput}
                          placeholder="0"
                          onChange={e => setPuntajeInput(e.target.value)}
                          inputProps={{
                            min: 0,
                            max: puntajeMaximo,
                            step: 0.5,
                            style: { fontWeight: 900, fontSize: 18, textAlign: 'center' }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              bgcolor: bgField,
                              '& fieldset': { borderColor: borderField },
                              '&:hover fieldset': { borderColor: alpha(brand, 0.4) },
                              '&.Mui-focused fieldset': { borderColor: brand },
                            }
                          }}
                        />

                        {/* Atajos de porcentajes */}
                        {!estaAusente && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'center' }}>
                            {[1, 0.8, 0.6, 0].map(factor => {
                              const val = Math.round(puntajeMaximo * factor * 10) / 10;
                              return (
                                <Chip
                                  key={factor}
                                  label={factor === 1 ? '100%' : factor === 0 ? '0' : `${Math.round(factor * 100)}%`}
                                  size="small"
                                  clickable
                                  onClick={() => setPuntajeInput(String(val))}
                                  sx={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    height: 20,
                                    bgcolor: bgField,
                                    border: `1px solid ${borderField}`,
                                    '&:hover': { bgcolor: alpha(gold, 0.15), color: gold }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )}

                        {/* Switch / Checkbox de Ausente */}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={estaAusente}
                              onChange={e => setEstaAusente(e.target.checked)}
                              color="error"
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ fontWeight: 700, color: estaAusente ? '#ef4444' : 'text.secondary' }}>
                              Ausente
                            </Typography>
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>

                      {/* Observación / Retroalimentación */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', mb: 0.8, fontSize: 11, textTransform: 'uppercase' }}>
                          Retroalimentación para el estudiante (opcional)
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2.5}
                          placeholder="Escribe comentarios u observaciones que el estudiante y sus padres verán..."
                          value={observacionInput}
                          onChange={e => setObservacionInput(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              fontSize: 13,
                              bgcolor: bgField,
                              '& fieldset': { borderColor: borderField },
                              '&:hover fieldset': { borderColor: alpha(brand, 0.4) },
                              '&.Mui-focused fieldset': { borderColor: brand },
                            }
                          }}
                        />

                        {/* Botones de acción */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.2, mt: 2 }}>
                          <Button
                            variant="contained"
                            disabled={guardandoNota}
                            startIcon={guardandoNota ? <CircularProgress size={16} /> : <SaveRoundedIcon />}
                            onClick={() => handleGuardarCalificacion(false)}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 800,
                              fontSize: 12.5,
                              px: 2.2, py: 0.8,
                              bgcolor: gold,
                              color: isDark ? '#000' : '#fff',
                              '&:hover': {
                                bgcolor: goldEnd,
                              }
                            }}
                          >
                            Guardar nota
                          </Button>

                          {siguienteEstudiante && (
                            <Button
                              variant="contained"
                              disabled={guardandoNota}
                              endIcon={<NavigateNextRoundedIcon />}
                              onClick={() => handleGuardarCalificacion(true)}
                              sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: 12.5,
                                px: 2.2, py: 0.8,
                                bgcolor: '#10b981',
                                color: '#fff',
                                '&:hover': { bgcolor: '#059669' }
                              }}
                            >
                              Guardar y siguiente
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Stack>
              </Box>
            )}
          </Paper>
        </Box>

        {/* ═════════════════════════════════════════════════════════════════════
            5. MODAL LIGHTBOX FULLSCREEN (Idéntico a Examen Virtual)
           ═════════════════════════════════════════════════════════════════════ */}
        <Dialog
          open={Boolean(modalAdjuntoUrl)}
          onClose={() => setModalAdjuntoUrl(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: bgModal,
              backgroundImage: 'none',
              borderRadius: '16px',
              border: `1.5px solid ${borderField}`,
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 25px 60px rgba(0,0,0,0.8), 0 0 1px rgba(250,204,21,0.2)'
                : '0 20px 40px rgba(0,0,0,0.18)',
            }
          }}
        >
          {/* Header del Lightbox */}
          <Box sx={{
            px: 2.5, py: 1.8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${borderField}`,
            bgcolor: isDark ? 'rgba(9, 16, 29, 0.95)' : '#ffffff',
            flexWrap: 'wrap', gap: 1.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{
                width: 38, height: 38,
                bgcolor: modalAdjuntoTipo === 'imagen' ? alpha(gold, 0.15) : alpha('#ef4444', 0.15),
                color: modalAdjuntoTipo === 'imagen' ? gold : '#ef4444',
                border: `1px solid ${modalAdjuntoTipo === 'imagen' ? alpha(gold, 0.3) : alpha('#ef4444', 0.3)}`,
              }}>
                {modalAdjuntoTipo === 'imagen' ? (
                  <ImageRoundedIcon fontSize="small" />
                ) : (
                  <PictureAsPdfRoundedIcon fontSize="small" />
                )}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: 'text.primary' }}>
                  {modalAdjuntoTitulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {modalAdjuntoTipo === 'imagen' ? 'Evidencia fotográfica adjunta del estudiante' : 'Documento PDF adjunto del estudiante'}
                </Typography>
              </Box>
            </Box>

            {/* Controles de Foto Anterior / Siguiente si hay varias fotos */}
            {tieneVariosArchivos && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.8,
                bgcolor: isDark ? 'rgba(250,204,21,0.08)' : 'rgba(2,136,209,0.08)',
                px: 1.2, py: 0.5, borderRadius: '10px',
                border: `1px solid ${brandBorder}`,
              }}>
                <IconButton
                  size="small"
                  disabled={fotoSeguraIndex === 0}
                  onClick={irAFotoAnterior}
                  sx={{ color: gold, '&:disabled': { opacity: 0.3 } }}
                >
                  <NavigateBeforeRoundedIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" fontWeight={800} sx={{ color: gold, minWidth: 72, textAlign: 'center', fontSize: 11 }}>
                  Foto {fotoSeguraIndex + 1} / {totalFotos}
                </Typography>
                <IconButton
                  size="small"
                  disabled={fotoSeguraIndex >= totalFotos - 1}
                  onClick={irAFotoSiguiente}
                  sx={{ color: gold, '&:disabled': { opacity: 0.3 } }}
                >
                  <NavigateNextRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Controles de Zoom, Rotación y Descarga */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              p: 0.5, borderRadius: '12px', border: `1px solid ${borderField}`
            }}>
              {modalAdjuntoTipo === 'imagen' && (
                <>
                  <Tooltip title="Alejar (-)">
                    <span>
                      <IconButton
                        size="small"
                        disabled={zoomNivel <= 0.5}
                        onClick={() => setZoomNivel(z => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                        sx={{
                          borderRadius: '8px',
                          color: 'text.secondary',
                          '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                        }}
                      >
                        <ZoomOutRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Chip
                    label={`${Math.round(zoomNivel * 100)}%`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: 11,
                      minWidth: 54,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      color: gold,
                      border: `1px solid ${alpha(gold, 0.2)}`,
                    }}
                  />

                  <Tooltip title="Acercar (+)">
                    <span>
                      <IconButton
                        size="small"
                        disabled={zoomNivel >= 3.0}
                        onClick={() => setZoomNivel(z => Math.min(3.0, Math.round((z + 0.25) * 100) / 100))}
                        sx={{
                          borderRadius: '8px',
                          color: 'text.secondary',
                          '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                        }}
                      >
                        <ZoomInRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Girar 90°">
                    <IconButton
                      size="small"
                      onClick={() => setRotacion(r => (r + 90) % 360)}
                      sx={{
                        borderRadius: '8px',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                      }}
                    >
                      <RotateRightRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Restablecer">
                    <IconButton
                      size="small"
                      onClick={() => { setZoomNivel(1); setRotacion(0); }}
                      sx={{
                        borderRadius: '8px',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                      }}
                    >
                      <RestartAltRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: borderField }} />
                </>
              )}

              {modalAdjuntoUrl && (
                <Tooltip title="Descargar archivo original">
                  <IconButton
                    size="small"
                    onClick={() => handleDescargarArchivo(modalAdjuntoUrl, 'evidencia_practica.jpg')}
                    sx={{
                      borderRadius: '8px',
                      color: 'text.secondary',
                      '&:hover': { bgcolor: alpha(gold, 0.15), color: gold },
                    }}
                  >
                    <FileDownloadRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Cerrar visor">
                <IconButton
                  size="small"
                  onClick={() => setModalAdjuntoUrl(null)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: alpha('#ef4444', 0.2), color: '#ef4444' },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Viewport del visor */}
          <DialogContent sx={{
            p: 3,
            minHeight: { xs: 360, sm: 480 },
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            background: isDark
              ? 'radial-gradient(ellipse at center, #0f1c3f 0%, #070c18 100%)'
              : 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
          }}>
            {/* Flechas flotantes en el modal cuando hay varias fotos */}
            {tieneVariosArchivos && (
              <IconButton
                size="large"
                disabled={fotoSeguraIndex === 0}
                onClick={irAFotoAnterior}
                sx={{
                  position: 'absolute',
                  left: { xs: 8, sm: 20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: `1.5px solid ${alpha(gold, 0.5)}`,
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.95)', color: gold },
                  '&:disabled': { opacity: 0.15, bgcolor: 'rgba(0,0,0,0.2)' }
                }}
              >
                <NavigateBeforeRoundedIcon fontSize="large" />
              </IconButton>
            )}

            {tieneVariosArchivos && (
              <IconButton
                size="large"
                disabled={fotoSeguraIndex >= totalFotos - 1}
                onClick={irAFotoSiguiente}
                sx={{
                  position: 'absolute',
                  right: { xs: 8, sm: 20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: `1.5px solid ${alpha(gold, 0.5)}`,
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.95)', color: gold },
                  '&:disabled': { opacity: 0.15, bgcolor: 'rgba(0,0,0,0.2)' }
                }}
              >
                <NavigateNextRoundedIcon fontSize="large" />
              </IconButton>
            )}

            {modalAdjuntoTipo === 'imagen' && modalAdjuntoUrl ? (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `scale(${zoomNivel}) rotate(${rotacion}deg)`,
                transformOrigin: 'center center',
                maxWidth: '100%',
              }}>
                <Box
                  component="img"
                  src={modalAdjuntoUrl}
                  alt={modalAdjuntoTitulo}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    borderRadius: '12px',
                    boxShadow: isDark
                      ? '0 24px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.08)'
                      : '0 20px 40px rgba(0, 0, 0, 0.15)',
                    objectFit: 'contain',
                    userSelect: 'none',
                  }}
                />
              </Box>
            ) : modalAdjuntoTipo === 'pdf' && modalAdjuntoUrl ? (
              <Box
                component="iframe"
                src={modalAdjuntoUrl}
                title={modalAdjuntoTitulo}
                sx={{
                  width: '100%',
                  height: '70vh',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                }}
              />
            ) : null}
          </DialogContent>

          {/* Footer con ayuda */}
          {modalAdjuntoTipo === 'imagen' && (
            <Box sx={{
              px: 3, py: 1.2,
              borderTop: `1px solid ${borderField}`,
              bgcolor: isDark ? 'rgba(9, 16, 29, 0.95)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'text.secondary',
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <FullscreenRoundedIcon sx={{ fontSize: 16, color: gold }} />
                Controles disponibles: Usa los botones de la barra superior para acercar, alejar o rotar la fotografía.
              </Typography>
              <Chip
                label="Visor LVC"
                size="small"
                sx={{ fontSize: 10, height: 20, bgcolor: brandDim, color: gold, border: `1px solid ${brandBorder}` }}
              />
            </Box>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}
