'use client';
// components/estudiante/tareas/DetalleEvaluacionEstudiante.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, Typography, Chip, Divider, Stack, Skeleton,
  IconButton, useTheme, alpha, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
  LinearProgress,
  Alert,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
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
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import api from '@/lib/api';
import { entregasService } from '@/services/notasService';
import type { TareaEstudiante, EstadoTarea } from '@/types/estudiante';

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoTarea, { label: string; color: string; gradient: string }> = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  entregado: { label: 'Entregado', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)' },
  atrasado: { label: 'Atrasado', color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)' },
  ausente: { label: 'Ausente', color: '#6b7280', gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)' },
};

const DIMENSIONES: Record<string, { label: string; color: string }> = {
  SER: { label: 'Ser', color: '#10B981' },
  SAB: { label: 'Saber', color: '#3B82F6' },
  HAC: { label: 'Hacer', color: '#F59E0B' },
  AUTO: { label: 'Autoevaluación', color: '#8B5CF6' },
};

const TIPOS_LABELS: Record<string, string> = {
  // Saber
  examen:              'Examen',
  exposicion:          'Exposición',
  cuestionario:        'Cuestionario',
  tarea:               'Tarea',
  ficha_trabajo:       'Ficha de trabajo',
  investigacion:       'Investigación',
  evaluacion_oral:     'Evaluación oral',
  // Hacer
  trabajo_practico:    'Trabajo práctico',
  manualidad:          'Manualidad',
  experimento:         'Experimento',
  actividad_practica:  'Actividad práctica',
  ejercicio_practico:  'Ejercicio práctico',
  trabajo_grupal:      'Trabajo grupal',
  proyecto:            'Proyecto',
  demostracion:        'Demostración',
  produccion_creativa: 'Producción creativa',
  // Compatibilidad
  trabajo:             'Trabajo',
  practica:            'Práctica',
  quiz:                'Quiz',
  participacion:       'Participación',
  general:             'General',
  ser:                 'Actitudinal',
};

// ──────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────

interface CriterioRubrica {
  id: number;
  criterio: string;
  descripcion?: string;
  nivel_excelente?: string;
  nivel_bueno?: string;
  nivel_basico?: string;
  puntos_posibles: number;
}

interface DetalleCompleto {
  modalidad?: 'presencial' | 'virtual';
  duracion_minutos?: number | null;
  fecha_hora_inicio?: string | null;
  fecha_hora_fin?: string | null;
  permite_entrega_archivo?: boolean;
  foto_url?: string | null;
  pdf_url?: string | null;
  pdf_nombre?: string | null;
  instrucciones?: string | null;
  descripcion?: string | null;
  rubrica: CriterioRubrica[];
}

// ──────────────────────────────────────────────
// ANIMACIONES
// ──────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

const formatFechaLarga = (f: string | null | undefined) =>
  f ? new Date(f).toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : null;

const formatFechaCorta = (f: string | null | undefined) =>
  f ? new Date(f).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

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

// ──────────────────────────────────────────────
// SECCIÓN GENÉRICA
// ──────────────────────────────────────────────

const Seccion: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  label, children, icon,
}) => (
  <Box sx={{ animation: `${fadeUp} 0.3s ease-out` }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      {icon && <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>}
      <Typography variant="caption" fontWeight={800} color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 10 }}>
        {label}
      </Typography>
    </Box>
    {children}
  </Box>
);

// ──────────────────────────────────────────────
// RÚBRICA
// ──────────────────────────────────────────────

const TablaRubrica: React.FC<{ criterios: CriterioRubrica[]; puntajeMax: number }> = ({
  criterios, puntajeMax,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const total = criterios.reduce((a, c) => a + Number(c.puntos_posibles), 0);

  return (
    <TableContainer component={Paper} elevation={0} sx={{
      borderRadius: 2.5,
      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
      background: isDark ? alpha('#fff', 0.02) : '#fafafa',
    }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{
            '& th': {
              fontWeight: 800, fontSize: 11, color: 'text.secondary', py: 1.25,
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
            },
          }}>
            <TableCell>Criterio</TableCell>
            <TableCell align="right">Puntos</TableCell>
            <TableCell align="right">%</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {criterios.map((c, i) => {
            const pct = Math.round((Number(c.puntos_posibles) / puntajeMax) * 100);
            return (
              <TableRow key={c.id} sx={{
                animation: `${fadeUp} 0.3s ease-out ${i * 0.04}s both`,
                '& td': { fontSize: 13, py: 1.25, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}` },
                '&:last-child td': { borderBottom: 'none' },
              }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>{c.criterio}</Typography>
                  {c.descripcion && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>{c.descripcion}</Typography>
                  )}
                  {(c.nivel_excelente || c.nivel_bueno || c.nivel_basico) && (
                    <Box sx={{ mt: 0.75, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {c.nivel_excelente && (
                        <Chip size="small" label={`Excelente: ${c.nivel_excelente}`}
                          sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: alpha('#10b981', 0.1), color: '#10b981', borderRadius: 1 }} />
                      )}
                      {c.nivel_bueno && (
                        <Chip size="small" label={`Bueno: ${c.nivel_bueno}`}
                          sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', borderRadius: 1 }} />
                      )}
                      {c.nivel_basico && (
                        <Chip size="small" label={`Básico: ${c.nivel_basico}`}
                          sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', borderRadius: 1 }} />
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={800} sx={{ fontSize: 14 }}>{c.puntos_posibles}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 11 }}>{pct}%</Typography>
                    <LinearProgress variant="determinate" value={pct} sx={{
                      height: 4, borderRadius: 2, mt: 0.25,
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                      '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 2 },
                    }} />
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow sx={{ '& td': { py: 1.25, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) } }}>
            <TableCell><Typography variant="body2" fontWeight={800} sx={{ fontSize: 13 }}>Total</Typography></TableCell>
            <TableCell align="right"><Typography variant="body2" fontWeight={900} sx={{ fontSize: 14 }}>{total}</Typography></TableCell>
            <TableCell align="right">
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ fontSize: 11 }}>
                {Math.round((total / puntajeMax) * 100)}%
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

interface Props {
  tarea: TareaEstudiante | null;
  open: boolean;
  onClose: () => void;
}

const DetalleEvaluacionEstudiante: React.FC<Props> = ({ tarea, open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const accentColor = isDark ? '#facc15' : '#0288d1';
  const accentColorEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${accentColor} 0%, ${accentColorEnd} 100%)`;
  const textOnAccent = isDark ? '#000000' : '#ffffff';

  const [detalle, setDetalle] = useState<DetalleCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [entrega, setEntrega] = useState<{
    id?: number | null;
    archivo_url?: string | null;
    archivo_nombre?: string | null;
    fecha_entrega?: string | null;
    comentario_estudiante?: string | null;
    archivos?: Array<{ url: string; nombre?: string; tamano?: number; tipo?: string }>;
  } | null>(null);
  const [archivosAEntregar, setArchivosAEntregar] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Array<{ file: File; url: string; isImg: boolean }>>([]);
  const [comentarioEntrega, setComentarioEntrega] = useState('');
  const [enviandoEntrega, setEnviandoEntrega] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Estados para modal de previsualización de imágenes y descarga
  const [modalPreviewOpen, setModalPreviewOpen] = useState(false);
  const [modalPreviewUrl, setModalPreviewUrl] = useState<string>('');
  const [modalPreviewTitulo, setModalPreviewTitulo] = useState<string>('');
  const [modalPreviewNombreArchivo, setModalPreviewNombreArchivo] = useState<string>('');

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

  const handleAgregarArchivos = (nuevos: FileList | null) => {
    if (!nuevos || nuevos.length === 0) return;
    const arrayNuevos = Array.from(nuevos);
    setArchivosAEntregar(prev => {
      const combinados = [...prev, ...arrayNuevos];
      if (combinados.length > 10) {
        toast.error('Puedes adjuntar un máximo de 10 fotografías o documentos.');
        return combinados.slice(0, 10);
      }
      return combinados;
    });
  };

  const handleRemoverArchivo = (index: number) => {
    setArchivosAEntregar(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const list = archivosAEntregar.map(file => {
      const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
      const url = URL.createObjectURL(file);
      return { file, url, isImg };
    });
    setLocalPreviews(list);
    return () => {
      list.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [archivosAEntregar]);

  useEffect(() => {
    if (!open || !tarea) {
      setDetalle(null);
      setEntrega(null);
      setArchivosAEntregar([]);
      setComentarioEntrega('');
      return;
    }
    if (tarea.entrega_archivo_url || tarea.entrega_archivos) {
      setEntrega({
        id: tarea.entrega_id,
        archivo_url: tarea.entrega_archivo_url,
        archivo_nombre: tarea.entrega_archivo_nombre,
        fecha_entrega: tarea.entrega_fecha,
        comentario_estudiante: tarea.entrega_comentario,
        archivos: (tarea.entrega_archivos as any) || undefined,
      });
    } else {
      setEntrega(null);
    }
    setIsLoading(true);
    Promise.all([
      api.get(`/notas/evaluaciones/${tarea.evaluacion_id}/publica`).catch(() => null),
      api.get(`/notas/evaluaciones/${tarea.evaluacion_id}/rubrica`).catch(() => ({ data: { data: { criterios: [] } } })),
    ])
      .then(([evalRes, rubricaRes]) => {
        const ev = evalRes?.data?.data?.evaluacion;
        const entregaPub = evalRes?.data?.data?.entrega;
        if (entregaPub) {
          setEntrega(entregaPub);
        }
        setDetalle({
          modalidad: ev?.modalidad ?? tarea.modalidad ?? 'presencial',
          duracion_minutos: ev?.duracion_minutos ?? tarea.duracion_minutos ?? null,
          fecha_hora_inicio: ev?.fecha_hora_inicio ?? tarea.fecha_hora_inicio ?? null,
          fecha_hora_fin: ev?.fecha_hora_fin ?? tarea.fecha_hora_fin ?? null,
          permite_entrega_archivo: ev?.permite_entrega_archivo ?? tarea.permite_entrega_archivo ?? false,
          foto_url: ev?.foto_url ?? tarea.foto_url ?? null,
          pdf_url: ev?.pdf_url ?? tarea.pdf_url ?? null,
          pdf_nombre: ev?.pdf_nombre ?? tarea.pdf_nombre ?? null,
          instrucciones: ev?.instrucciones ?? tarea.instrucciones ?? null,
          descripcion: ev?.descripcion ?? tarea.descripcion ?? null,
          rubrica: rubricaRes?.data?.data?.criterios ?? evalRes?.data?.data?.rubrica ?? [],
        });
      })
      .catch(() => setDetalle({
        modalidad: tarea.modalidad ?? 'presencial',
        duracion_minutos: tarea.duracion_minutos ?? null,
        fecha_hora_inicio: tarea.fecha_hora_inicio ?? null,
        fecha_hora_fin: tarea.fecha_hora_fin ?? null,
        permite_entrega_archivo: tarea.permite_entrega_archivo ?? false,
        foto_url: tarea.foto_url ?? null,
        pdf_url: tarea.pdf_url ?? null,
        pdf_nombre: tarea.pdf_nombre ?? null,
        instrucciones: tarea.instrucciones ?? null,
        descripcion: tarea.descripcion ?? null,
        rubrica: []
      }))
      .finally(() => setIsLoading(false));
  }, [open, tarea]);

  if (!tarea) return null;

  const cfg = ESTADO_CONFIG[tarea.estado_calculado];
  const dimCfg = tarea.dimension_codigo ? DIMENSIONES[tarea.dimension_codigo] : null;
  const cdias = colorDias(tarea.dias_restantes, tarea.estado_calculado, isDark);
  const permiteArchivo = Boolean(tarea.permite_entrega_archivo || detalle?.permite_entrega_archivo);
  const plazoExpirado = tarea.fecha_limite ? new Date() > new Date(tarea.fecha_limite) : false;

  const handleSubirEntrega = async () => {
    if (archivosAEntregar.length === 0 || !tarea) return;
    setEnviandoEntrega(true);
    try {
      const res = await entregasService.entregarTareaEstudiante(tarea.evaluacion_id, archivosAEntregar, comentarioEntrega);
      toast.success('¡Práctica entregada con éxito!');
      setEntrega(res.data.entrega);
      setArchivosAEntregar([]);
      setComentarioEntrega('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al entregar archivo');
    } finally {
      setEnviandoEntrega(false);
    }
  };

  const handleEliminarEntrega = async () => {
    if (!tarea) return;
    if (!window.confirm('¿Estás seguro de anular tu entrega? Podrás subir otro archivo antes de la fecha límite.')) return;
    setEnviandoEntrega(true);
    try {
      await entregasService.eliminarEntregaEstudiante(tarea.evaluacion_id);
      toast.success('Entrega anulada');
      setEntrega(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al anular entrega');
    } finally {
      setEnviandoEntrega(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          background: isDark ? 'linear-gradient(145deg, #1a1a2e, #16162a)' : '#fff',
          borderLeft: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
          boxShadow: isDark ? '-8px 0 40px rgba(0,0,0,0.5)' : '-8px 0 40px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{
        p: 3,
        background: isDark
          ? `linear-gradient(135deg, ${alpha(cfg.color, 0.18)} 0%, ${alpha(cfg.color, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(cfg.color, 0.08)} 0%, #fff 100%)`,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
        position: 'sticky', top: 0, zIndex: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {tarea.materia_nombre}
              </Typography>
              {dimCfg && (
                <Chip size="small" label={dimCfg.label}
                  sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: alpha(dimCfg.color, 0.12), color: dimCfg.color, borderRadius: 1.5 }} />
              )}
              {tarea.tipo && (
                <Chip size="small" label={TIPOS_LABELS[tarea.tipo] ?? tarea.tipo}
                  sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05), borderRadius: 1.5 }} />
              )}
            </Box>

            <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2, mb: 1.25 }}>
              {tarea.evaluacion_nombre}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={cfg.label} sx={{
                height: 24, fontSize: 12, fontWeight: 800,
                background: cfg.gradient, color: '#fff', border: 'none',
                boxShadow: `0 2px 8px ${alpha(cfg.color, 0.4)}`,
              }} />
              {tarea.materia_codigo?.startsWith('INI-') || tarea.materia_nombre?.toLowerCase().includes('desarrollo') ? (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.25, borderRadius: 2,
                  bgcolor: alpha('#8b5cf6', isDark ? 0.25 : 0.12),
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}>
                  <ChildCareRoundedIcon sx={{ fontSize: 15, color: '#8b5cf6' }} />
                  <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#c4b5fd' : '#6d28d9', fontSize: 11 }}>
                    Desarrollo Cualitativo
                  </Typography>
                </Box>
              ) : tarea.nota_sobre_100 != null && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.25, borderRadius: 2,
                  bgcolor: isDark ? alpha(cfg.color, 0.15) : alpha(cfg.color, 0.1),
                  border: `1px solid ${alpha(cfg.color, 0.3)}`,
                }}>
                  <GradeIcon sx={{ fontSize: 14, color: cfg.color }} />
                  <Typography variant="caption" fontWeight={900} sx={{ color: cfg.color, fontSize: 13 }}>
                    {tarea.nota_sobre_100}/100
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    ({tarea.puntaje_obtenido}/{tarea.puntaje_maximo} pts)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <IconButton onClick={onClose} size="small"
            sx={{ bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05), borderRadius: 2, flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── CUERPO ── */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          <Stack spacing={2}>
            {[80, 60, 120, 200].map((h, i) => (
              <Skeleton key={i} variant="rounded" height={h} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={3} divider={<Divider sx={{ borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />}>

            {/* ── BANNER AUTOEVALUACIÓN ── */}
            {(tarea.dimension_codigo === 'AUT' || tarea.dimension_codigo === 'AUTO') && (
              <Box sx={{
                p: 2.5, borderRadius: 3,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha('#8b5cf6', 0.2)} 0%, rgba(15, 23, 42, 0.7) 100%)`
                  : `linear-gradient(135deg, ${alpha('#8b5cf6', 0.12)} 0%, #ffffff 100%)`,
                border: `1.5px solid ${alpha('#8b5cf6', 0.4)}`,
                display: 'flex', flexDirection: 'column', gap: 1.5,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeRoundedIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: isDark ? '#c084fc' : '#7c3aed' }}>
                    Autoevaluación Trimestral (5%)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6 }}>
                  {tarea.puntaje_obtenido != null
                    ? `Ya completaste tu autoevaluación con una calificación de ${tarea.puntaje_obtenido}/5 pts. Puedes revisarla o actualizar tu reflexión en la vista completa.`
                    : 'Ingresa para seleccionar tu nivel del 1 al 5 y responder las preguntas de autorreflexión guiada.'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    onClose();
                    router.push(`/dashboard/estudiante/tareas/${tarea.evaluacion_id}`);
                  }}
                  sx={{
                    borderRadius: '12px', fontWeight: 800, textTransform: 'none', py: 1.1,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                    },
                  }}
                >
                  {tarea.puntaje_obtenido != null
                    ? 'Ver / Editar mi Autoevaluación'
                    : 'Calificar mi Autoevaluación Ahora'}
                </Button>
              </Box>
            )}

            {/* ── BANNER EXAMEN VIRTUAL ── */}
            {(detalle?.modalidad === 'virtual' || tarea.modalidad === 'virtual') && (
              <Box sx={{
                p: 2.5, borderRadius: 3,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(accentColor, 0.16)} 0%, rgba(15, 23, 42, 0.7) 100%)`
                  : `linear-gradient(135deg, ${alpha(accentColor, 0.1)} 0%, #ffffff 100%)`,
                border: `1.5px solid ${alpha(accentColor, 0.35)}`,
                display: 'flex', flexDirection: 'column', gap: 1.5,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerRoundedIcon sx={{ color: accentColor, fontSize: 22 }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: accentColor }}>
                    Evaluación en Modalidad Virtual
                  </Typography>
                </Box>
                {(() => {
                  const now = new Date();
                  const fechaInicioRaw = detalle?.fecha_hora_inicio ?? tarea.fecha_hora_inicio;
                  const fechaFinRaw = detalle?.fecha_hora_fin ?? tarea.fecha_hora_fin;
                  const duracionMin = detalle?.duracion_minutos ?? tarea.duracion_minutos;

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
                    if (!d) return '';
                    return d.toLocaleString('es-BO', {
                      timeZone: 'America/La_Paz',
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    });
                  };

                  const dInicio = parseFechaBolivia(fechaInicioRaw);
                  const dFin = parseFechaBolivia(fechaFinRaw);

                  const noIniciadoAun = Boolean(dInicio && now < dInicio);
                  const yaExpiro = Boolean(dFin && now > dFin && tarea.puntaje_obtenido == null);
                  const fechaInicioTxt = formatFechaHora(fechaInicioRaw);
                  const fechaFinTxt = formatFechaHora(fechaFinRaw);

                  return (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6 }}>
                        Este examen se rinde en línea en la plataforma escolar. Cuenta con cronómetro regresivo y guardado automático de respuestas.
                        {duracionMin ? ` Duración límite: ${duracionMin} minutos.` : ''}
                      </Typography>

                      {noIniciadoAun && (
                        <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>
                          ⏰ <strong>Examen Programado:</strong> Se habilitará el <strong>{fechaInicioTxt}</strong>. No podrás comenzar a responder antes de esa fecha y hora.
                        </Alert>
                      )}

                      {yaExpiro && (
                        <Alert severity="warning" sx={{ borderRadius: 2, fontSize: 13 }}>
                          ⌛ <strong>Plazo Finalizado:</strong> El periodo para rendir este examen finalizó el <strong>{fechaFinTxt}</strong>.
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        startIcon={<PlayArrowRoundedIcon />}
                        disabled={Boolean(noIniciadoAun || yaExpiro)}
                        onClick={() => {
                          onClose();
                          router.push(`/dashboard/estudiante/examenes/${tarea.evaluacion_id}`);
                        }}
                        sx={{
                          borderRadius: '12px', fontWeight: 800, textTransform: 'none', py: 1.1,
                          background: gradBg,
                          color: textOnAccent,
                          boxShadow: `0 4px 14px ${alpha(accentColor, 0.35)}`,
                          '&:hover': {
                            boxShadow: `0 6px 20px ${alpha(accentColor, 0.5)}`,
                          },
                        }}
                      >
                        {tarea.puntaje_obtenido != null
                          ? 'Ver Examen Rendido'
                          : noIniciadoAun
                            ? `Disponible el ${fechaInicioTxt}`
                            : yaExpiro
                              ? 'Plazo Finalizado'
                              : 'Rendir Examen Virtual'}
                      </Button>
                    </>
                  );
                })()}
              </Box>
            )}

            {/* ── FECHAS ── */}
            <Seccion label="Fechas" icon={<EventIcon sx={{ fontSize: 14 }} />}>
              <Stack spacing={1}>
                {tarea.fecha_evaluacion && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13 }}>
                      Fecha de evaluación
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                      {formatFechaCorta(tarea.fecha_evaluacion)}
                    </Typography>
                  </Box>
                )}
                {tarea.fecha_limite && (
                  <Box sx={{
                    p: 1.75, borderRadius: 2.5,
                    bgcolor: isDark ? alpha(cdias, 0.1) : alpha(cdias, 0.06),
                    border: `1px solid ${alpha(cdias, 0.25)}`,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="caption" fontWeight={800}
                          sx={{ color: cdias, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.25 }}>
                          Fecha límite de entrega
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                          {formatFechaLarga(tarea.fecha_limite)}
                        </Typography>
                      </Box>
                      <Chip size="small" label={formatDias(tarea.dias_restantes)} sx={{
                        height: 22, fontSize: 10, fontWeight: 800,
                        bgcolor: alpha(cdias, isDark ? 0.2 : 0.12), color: cdias,
                        border: `1px solid ${alpha(cdias, 0.3)}`, borderRadius: 1.5, flexShrink: 0,
                      }} />
                    </Box>
                  </Box>
                )}
                {tarea.fecha_registro && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13 }}>
                      Nota registrada el
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                      {formatFechaCorta(tarea.fecha_registro)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Seccion>

            {/* ── DESCRIPCIÓN E INSTRUCCIONES ── */}
            {(detalle?.descripcion || detalle?.instrucciones || detalle?.foto_url) && (
              <Seccion label="Descripción e instrucciones" icon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}>
                <Stack spacing={1.5}>
                  {detalle.descripcion && (
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.disabled"
                        sx={{ fontSize: 11, display: 'block', mb: 0.5 }}>Descripción</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6 }}>
                        {detalle.descripcion}
                      </Typography>
                    </Box>
                  )}
                  {detalle.instrucciones && (
                    <Box sx={{
                      p: 2, borderRadius: 2.5,
                      bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.04),
                      border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                    }}>
                      <Typography variant="caption" fontWeight={800}
                        sx={{ color: isDark ? '#60a5fa' : '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, display: 'block', mb: 0.75 }}>
                        Instrucciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {detalle.instrucciones}
                      </Typography>
                    </Box>
                  )}
                  {detalle.foto_url && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>
                        📸 Imagen consigna del docente:
                      </Typography>
                      <Box
                        component="img"
                        src={detalle.foto_url}
                        alt="Consigna del docente"
                        onClick={() => abrirPrevisualizacion(detalle.foto_url!, 'Consigna del docente', 'consigna_docente.jpg')}
                        sx={{
                          width: '100%',
                          maxHeight: 220,
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.12)}`,
                          cursor: 'pointer',
                          mb: 1,
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VisibilityRoundedIcon sx={{ fontSize: 15 }} />}
                          onClick={() => abrirPrevisualizacion(detalle.foto_url!, 'Consigna del docente', 'consigna_docente.jpg')}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: 12,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                            color: '#ffffff',
                            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
                              boxShadow: '0 6px 18px rgba(79, 70, 229, 0.55)',
                            },
                          }}
                        >
                          Previsualizar foto
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DownloadRoundedIcon sx={{ fontSize: 15 }} />}
                          onClick={() => handleDescargarArchivo(detalle.foto_url!, 'consigna_docente.jpg')}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: 12,
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: '#ffffff',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.55)',
                            },
                          }}
                        >
                          Descargar foto
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Seccion>
            )}

            {/* ── ENTREGA DE TRABAJO (SI PERMITE ENTREGA DE ARCHIVO) ── */}
            {permiteArchivo && (
              <Seccion label="Entrega de tu trabajo" icon={<CloudUploadRoundedIcon sx={{ fontSize: 14 }} />}>
                <Box sx={{
                  p: 2.2, borderRadius: 2.5,
                  bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.03),
                  border: `1.5px solid ${alpha('#3b82f6', 0.25)}`,
                }}>
                  {entrega ? (
                    // Estado: Archivo entregado
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981' }}>
                            Trabajo entregado
                          </Typography>
                        </Box>
                        {entrega.fecha_entrega && (
                          <Chip
                            size="small"
                            icon={<AccessTimeRoundedIcon sx={{ fontSize: '13px !important' }} />}
                            label={formatFechaLarga(entrega.fecha_entrega)}
                            sx={{ fontSize: 11, fontWeight: 700, height: 24, bgcolor: alpha('#10b981', isDark ? 0.2 : 0.1), color: '#10b981' }}
                          />
                        )}
                      </Box>

                      {/* Archivos subidos (Soporta múltiples fotos o archivo único) */}
                      {Array.isArray(entrega.archivos) && entrega.archivos.length > 1 ? (
                        <Stack spacing={1.2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">
                              {entrega.archivos.length} fotografías / páginas de tu entrega:
                            </Typography>
                          </Box>
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                            gap: 1.2
                          }}>
                            {entrega.archivos.map((arch, idx) => {
                              const archEsFoto = esImagen(arch.url || arch.nombre);
                              return (
                                <Paper
                                  key={idx}
                                  elevation={0}
                                  sx={{
                                    p: 1.2,
                                    borderRadius: 2,
                                    bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                    {archEsFoto ? (
                                      <Box
                                        component="img"
                                        src={arch.url}
                                        alt={`Foto ${idx + 1}`}
                                        onClick={() => abrirPrevisualizacion(arch.url, `Página ${idx + 1}: ${arch.nombre || 'foto.jpg'}`, arch.nombre || `foto_${idx + 1}.jpg`)}
                                        sx={{
                                          width: 44,
                                          height: 44,
                                          borderRadius: 1.5,
                                          objectFit: 'cover',
                                          cursor: 'pointer',
                                          border: `1px solid ${alpha('#10b981', 0.5)}`,
                                          flexShrink: 0
                                        }}
                                      />
                                    ) : (
                                      <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 24, flexShrink: 0 }} />
                                    )}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                      <Typography variant="caption" fontWeight={800} sx={{ color: '#10b981', display: 'block', lineHeight: 1.2 }}>
                                        Foto {idx + 1}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: 11 }}>
                                        {arch.nombre || `Página ${idx + 1}`}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'flex-end' }}>
                                    {archEsFoto && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => abrirPrevisualizacion(arch.url, `Página ${idx + 1}: ${arch.nombre || 'foto.jpg'}`, arch.nombre || `foto_${idx + 1}.jpg`)}
                                        sx={{ py: 0.2, px: 1, fontSize: 11, borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
                                      >
                                        Ver
                                      </Button>
                                    )}
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleDescargarArchivo(arch.url, arch.nombre || `foto_${idx + 1}.jpg`)}
                                      sx={{
                                        py: 0.2, px: 1, fontSize: 11, borderRadius: 1.5, textTransform: 'none', fontWeight: 800,
                                        bgcolor: '#059669', color: '#fff', '&:hover': { bgcolor: '#047857' }
                                      }}
                                    >
                                      Descargar
                                    </Button>
                                  </Box>
                                </Paper>
                              );
                            })}
                          </Box>
                        </Stack>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                            {esImagen(entrega.archivo_url || entrega.archivo_nombre) ? (
                              <Box
                                component="img"
                                src={entrega.archivo_url || ''}
                                alt="Miniatura entrega"
                                onClick={() => abrirPrevisualizacion(entrega.archivo_url || '', 'Tu entrega de trabajo', entrega.archivo_nombre || 'mi_entrega.jpg')}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 1.5,
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  border: `1px solid ${alpha('#10b981', 0.5)}`,
                                  flexShrink: 0,
                                }}
                              />
                            ) : entrega.archivo_nombre?.toLowerCase().endsWith('.pdf') ? (
                              <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 24, flexShrink: 0 }} />
                            ) : (
                              <ImageIcon sx={{ color: '#3b82f6', fontSize: 24, flexShrink: 0 }} />
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: 13 }}>
                                {entrega.archivo_nombre || 'Archivo_entregado'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Subido a la plataforma
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {esImagen(entrega.archivo_url || entrega.archivo_nombre) && (
                              <Button
                                variant="contained" size="small"
                                startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => abrirPrevisualizacion(entrega.archivo_url || '', 'Tu entrega de trabajo', entrega.archivo_nombre || 'mi_entrega.jpg')}
                                sx={{
                                  borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: 12, flexShrink: 0,
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                  color: '#ffffff',
                                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
                                  },
                                }}
                              >
                                Previsualizar foto
                              </Button>
                            )}
                            <Button
                              variant="contained" size="small"
                              startIcon={<DownloadRoundedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleDescargarArchivo(entrega.archivo_url || '', entrega.archivo_nombre || 'mi_entrega')}
                              sx={{
                                borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: 12, flexShrink: 0,
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
                            <Button
                              variant="outlined" size="small"
                              startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                              href={entrega.archivo_url || '#'}
                              target="_blank" rel="noopener noreferrer"
                              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 12, flexShrink: 0 }}
                            >
                              Ver
                            </Button>
                          </Box>
                        </Paper>
                      )}

                      {entrega.comentario_estudiante && (
                        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02) }}>
                          <Typography variant="caption" color="text.disabled" fontWeight={700}>Tu comentario:</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, mt: 0.2 }}>
                            {entrega.comentario_estudiante}
                          </Typography>
                        </Box>
                      )}

                      {/* Acciones si aún está dentro del plazo */}
                      {!plazoExpirado ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 0.5 }}>
                          <Button
                            size="small" color="error" variant="text"
                            startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                            disabled={enviandoEntrega}
                            onClick={handleEliminarEntrega}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2 }}
                          >
                            Anular entrega
                          </Button>
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 2, fontSize: 12, py: 0.2 }}>
                          🔒 El plazo de entrega ha vencido. Tu trabajo fue registrado satisfactoriamente.
                        </Alert>
                      )}
                    </Stack>
                  ) : plazoExpirado ? (
                    // Estado: No entregó y plazo vencido
                    <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12.5, py: 0.5 }}>
                      ⏰ <strong>Plazo de entrega finalizado:</strong> La fecha límite expiró el {formatFechaLarga(tarea.fecha_limite)}. Ya no es posible subir trabajos para esta evaluación.
                    </Alert>
                  ) : (
                    // Estado: Pendiente de entrega dentro del plazo
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
                          Sube las fotografías o resolución de tu práctica
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                          Puedes seleccionar hasta 10 fotos directamente de las hojas de tu cuaderno/práctica (o documento PDF).
                        </Typography>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf,image/*"
                          multiple
                          hidden
                          onChange={e => {
                            handleAgregarArchivos(e.target.files);
                            e.target.value = '';
                          }}
                        />

                        {/* Lista de archivos seleccionados */}
                        {archivosAEntregar.length > 0 && (
                          <Stack spacing={1} sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" fontWeight={800} color="text.secondary">
                                {archivosAEntregar.length} archivo(s) seleccionado(s) (máx. 10):
                              </Typography>
                              {archivosAEntregar.length < 10 && (
                                <Button
                                  size="small"
                                  startIcon={<CloudUploadRoundedIcon />}
                                  onClick={() => fileInputRef.current?.click()}
                                  sx={{ fontSize: 11, textTransform: 'none', fontWeight: 700 }}
                                >
                                  + Agregar más fotos
                                </Button>
                              )}
                            </Box>

                            <Box sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', sm: archivosAEntregar.length > 1 ? 'repeat(2, 1fr)' : '1fr' },
                              gap: 1.2
                            }}>
                              {localPreviews.map((item, idx) => (
                                <Paper
                                  key={idx}
                                  elevation={0}
                                  sx={{
                                    p: 1.2,
                                    borderRadius: 2,
                                    bgcolor: isDark ? alpha('#3b82f6', 0.12) : alpha('#3b82f6', 0.06),
                                    border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                    {item.isImg ? (
                                      <Box
                                        component="img"
                                        src={item.url}
                                        alt={`Miniatura ${idx + 1}`}
                                        onClick={() => abrirPrevisualizacion(item.url, `Foto ${idx + 1}: ${item.file.name}`, item.file.name)}
                                        sx={{
                                          width: 38,
                                          height: 38,
                                          borderRadius: 1.2,
                                          objectFit: 'cover',
                                          cursor: 'pointer',
                                          border: `1px solid ${alpha('#3b82f6', 0.4)}`,
                                          flexShrink: 0
                                        }}
                                      />
                                    ) : (
                                      <AttachFileRoundedIcon sx={{ color: '#3b82f6', fontSize: 24, flexShrink: 0 }} />
                                    )}
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="caption" fontWeight={800} noWrap sx={{ display: 'block', fontSize: 12 }}>
                                        {item.file.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {item.isImg && (
                                      <IconButton
                                        size="small"
                                        onClick={() => abrirPrevisualizacion(item.url, `Foto ${idx + 1}: ${item.file.name}`, item.file.name)}
                                        sx={{ color: '#3b82f6', p: 0.5 }}
                                        title="Ver foto"
                                      >
                                        <VisibilityRoundedIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoverArchivo(idx)}
                                      sx={{ color: '#ef4444', p: 0.5 }}
                                      title="Quitar foto"
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              ))}
                            </Box>
                          </Stack>
                        )}

                        {archivosAEntregar.length === 0 && (
                          <Button
                            variant="outlined" fullWidth
                            startIcon={<CloudUploadRoundedIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              py: 1.8, borderRadius: 2.5, textTransform: 'none', fontWeight: 700, fontSize: 13,
                              borderStyle: 'dashed', borderWidth: '1.5px',
                              borderColor: alpha('#3b82f6', 0.5), color: isDark ? '#60a5fa' : '#2563eb',
                              '&:hover': { borderStyle: 'dashed', borderWidth: '1.5px', bgcolor: alpha('#3b82f6', 0.08) },
                            }}
                          >
                            📷 Seleccionar fotos de la práctica (o PDF)
                          </Button>
                        )}
                      </Box>

                      <TextField
                        placeholder="Mensaje o aclaración para el docente (opcional)..."
                        fullWidth size="small" multiline rows={2}
                        value={comentarioEntrega}
                        onChange={e => setComentarioEntrega(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 13 },
                        }}
                      />

                      <Button
                        variant="contained" fullWidth
                        disabled={archivosAEntregar.length === 0 || enviandoEntrega}
                        onClick={handleSubirEntrega}
                        startIcon={enviandoEntrega ? <CircularProgress size={16} color="inherit" /> : <CloudUploadRoundedIcon />}
                        sx={{
                          py: 1.3, borderRadius: '12px', textTransform: 'none', fontWeight: 900, fontSize: 14,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            boxShadow: '0 8px 26px rgba(16, 185, 129, 0.6)',
                            transform: 'translateY(-1px)',
                          },
                          '&.Mui-disabled': { opacity: 0.5 },
                        }}
                      >
                        {enviandoEntrega
                          ? 'Subiendo fotos y entregando...'
                          : `Confirmar y entregar (${archivosAEntregar.length} ${archivosAEntregar.length === 1 ? 'archivo' : 'fotos'})`}
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Seccion>
            )}

            {/* ── ARCHIVOS ── */}
            {(detalle?.foto_url || detalle?.pdf_url) && (
              <Seccion label="Archivos adjuntos">
                <Stack spacing={1.25}>
                  {detalle.foto_url && (
                    <Box>
                      <Box component="img" src={detalle.foto_url} alt="Imagen de la evaluación"
                        sx={{
                          width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 2.5,
                          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), mb: 1,
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <Button variant="outlined" size="small"
                        startIcon={<ImageIcon sx={{ fontSize: 16 }} />}
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        href={detalle.foto_url} target="_blank" rel="noopener noreferrer"
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, fontSize: 12 }}>
                        Ver imagen completa
                      </Button>
                    </Box>
                  )}
                  {detalle.pdf_url && (
                    <Button variant="outlined" size="small" fullWidth
                      startIcon={<PictureAsPdfIcon sx={{ fontSize: 18, color: '#ef4444' }} />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                      href={detalle.pdf_url} target="_blank" rel="noopener noreferrer"
                      sx={{
                        borderRadius: 2.5, textTransform: 'none', fontWeight: 700, fontSize: 13,
                        justifyContent: 'flex-start', gap: 1, p: 1.5,
                        borderColor: alpha('#ef4444', 0.3), color: isDark ? '#f87171' : '#ef4444',
                        bgcolor: isDark ? alpha('#ef4444', 0.07) : alpha('#ef4444', 0.03),
                        '&:hover': { borderColor: '#ef4444', bgcolor: alpha('#ef4444', 0.1) },
                      }}>
                      {detalle.pdf_nombre ?? 'Abrir PDF de instrucciones'}
                    </Button>
                  )}
                </Stack>
              </Seccion>
            )}

            {/* ── RÚBRICA ── */}
            {detalle?.rubrica && detalle.rubrica.length > 0 && (
              <Seccion label="Rúbrica de evaluación" icon={<ScaleIcon sx={{ fontSize: 14 }} />}>
                <TablaRubrica criterios={detalle.rubrica} puntajeMax={tarea.puntaje_maximo} />
              </Seccion>
            )}

            {/* ── RESULTADO ── */}
            {(tarea.nota_sobre_100 != null || tarea.observacion_docente) && (
              <Seccion label="Tu resultado" icon={<GradeIcon sx={{ fontSize: 14 }} />}>
                <Stack spacing={1.5}>
                  {tarea.nota_sobre_100 != null && (
                    <Box sx={{
                      p: 2.5, borderRadius: 2.5, textAlign: 'center',
                      background: cfg.gradient,
                      boxShadow: `0 4px 20px ${alpha(cfg.color, 0.3)}`,
                    }}>
                      {tarea.puntaje_maximo === 0 ? (
                        <>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                            Práctica Formativa
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha('#fff', 0.9), mt: 0.5 }}>
                            Revisada por el docente · Sin nota numérica
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="h2" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
                            {tarea.nota_sobre_100}
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), fontWeight: 700 }}>
                            sobre 100 puntos
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                            {tarea.puntaje_obtenido} / {tarea.puntaje_maximo} pts
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  {tarea.observacion_docente && (
                    <Box sx={{
                      p: 2, borderRadius: 2.5,
                      bgcolor: isDark ? alpha('#3b82f6', 0.08) : alpha('#3b82f6', 0.04),
                      border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                        <CommentIcon sx={{ fontSize: 14, color: isDark ? '#60a5fa' : '#3b82f6' }} />
                        <Typography variant="caption" fontWeight={800}
                          sx={{ color: isDark ? '#60a5fa' : '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                          Observación del docente
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{tarea.observacion_docente}"
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Seccion>
            )}

            {/* ── DATOS DE LA EVALUACIÓN ── */}
            <Seccion label="Datos de la evaluación">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {[
                  tarea.puntaje_maximo === 0
                    ? { label: 'Tipo de tarea', value: 'Práctica formativa (Sin nota)' }
                    : { label: 'Puntaje máximo', value: `${tarea.puntaje_maximo} pts` },
                  tarea.puntaje_maximo === 0
                    ? { label: 'Nivel', value: 'Inicial' }
                    : { label: 'Peso en dimensión', value: `×${tarea.peso_en_dimension}` },
                  { label: 'Período', value: tarea.periodo_nombre },
                  {
                    label: 'Publicado el', value: tarea.publicado_en
                      ? new Date(tarea.publicado_en).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'
                  },
                ].map(item => (
                  <Box key={item.label} sx={{
                    p: 1.5, borderRadius: 2,
                    bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                  }}>
                    <Typography variant="caption" color="text.disabled" fontWeight={700}
                      sx={{ fontSize: 10, display: 'block', mb: 0.25 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Seccion>

          </Stack>
        )}
      </Box>

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
              <CloseIcon />
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
    </Drawer>
  );
};

export default DetalleEvaluacionEstudiante;