'use client';
// components/docente/inicial/PanelTareasInicial.tsx
// Panel con diseño de Secundaria para Nivel Inicial (Pre-Kínder / Kínder):
// - Listado con tarjetas expandibles (EvaluacionCard idéntica a Secundaria)
// - Formulario de creación/edición en 2 columnas con bloques SectionHeader y Panel Lateral de Vista Previa en Vivo (igual a Nueva Evaluación)
// - Sin notas numéricas ni ponderaciones de dimensiones (SER/SABER/HACER/AUTO)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Container, Typography, Chip, Button, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  Avatar, Stack, useTheme, alpha, Fade, IconButton, Paper, Switch,
  FormControlLabel, Collapse, LinearProgress, Divider,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  AssignmentRounded as AssignmentIcon,
  ArrowBackRounded as ArrowBackIcon,
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  VisibilityRounded as VisibilityIcon,
  VisibilityOffRounded as VisibilityOffIcon,
  KeyboardArrowUpRounded as ArrowUpIcon,
  KeyboardArrowDownRounded as ArrowDownIcon,
  PictureAsPdfRounded as PdfIcon,
  ImageRounded as ImageIcon,
  CalendarTodayRounded as CalendarIcon,
  CloudUploadRounded as UploadIcon,
  ComputerRounded as ComputerIcon,
  CheckCircleRounded as CheckCircleIcon,
  HourglassEmptyRounded as HourglassIcon,
  AutoAwesomeRounded as SparklesIcon,
  RefreshRounded as RefreshIcon,
  OpenInNewRounded as OpenInNewIcon,
  CloseRounded as CloseIcon,
  InfoOutlined as InfoIcon,
  BookmarkRounded as BookmarkIcon,
  GroupsRounded as GroupsIcon,
  AttachFileRounded as AttachIcon,
  GradeRounded as GradeIcon,
  LightbulbOutlined as LightbulbIcon,
  CommentRounded as CommentIcon,
  CheckRounded as CheckIcon,
  DescriptionOutlined as DescriptionIcon,
  SchoolRounded as SchoolIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import type { MateriaDocenteNotas, Evaluacion, DimensionEvaluacion } from '@/types/notasTypes';
import {
  evaluacionesService,
  adjuntosService,
  entregasService,
  calificacionesService,
  dimensionesService,
} from '@/services/notasService';

// ─── Animaciones ─────────────────────────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Estilos y helpers compartidos con Secundaria ─────────────────────────────
const cardSx = (isDark: boolean) => ({
  borderRadius: '20px',
  border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
  overflow: 'hidden',
  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.04)',
});

const inputSx = (accent: string) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&:hover fieldset': { borderColor: accent },
    '&.Mui-focused fieldset': { borderColor: accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: accent },
});

// ─── Section Header reutilizable de Secundaria ──────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent: string;
  isDark: boolean;
}> = ({ icon, title, subtitle, accent, isDark }) => (
  <Box sx={{
    px: 2.5, py: 2,
    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#f8f9fa', 0.7),
    display: 'flex', alignItems: 'center', gap: 1.5,
  }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
      bgcolor: alpha(accent, isDark ? 0.2 : 0.1),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: accent,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

// ─── Tipos pedagógicos de práctica en Nivel Inicial ──────────────────────────
export interface TipoPracticaInicial {
  value: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
}

export const TIPOS_PRACTICA_INICIAL: TipoPracticaInicial[] = [
  { value: 'grafomotricidad', label: 'Grafomotricidad', icon: '✏️', color: '#3b82f6', desc: 'Trazos, líneas punteadas, vocales y números' },
  { value: 'plastica', label: 'Actividad Plástica', icon: '🎨', color: '#ec4899', desc: 'Dibujo, pintura, plastilina, rasgado y modelado' },
  { value: 'cognitivo', label: 'Desarrollo Cognitivo', icon: '🧠', color: '#8b5cf6', desc: 'Colores, figuras geométricas, seriación y memoria' },
  { value: 'motricidad', label: 'Psicomotricidad', icon: '🏃', color: '#10b981', desc: 'Coordinación motriz, recortado y lateralidad' },
  { value: 'lenguaje', label: 'Lenguaje y Expresión', icon: '📚', color: '#f59e0b', desc: 'Cuentos, rimas, canciones y vocabulario' },
  { value: 'socioafectivo', label: 'Vida Práctica y Valores', icon: '🤝', color: '#06b6d4', desc: 'Hábitos de higiene, convivencia y autonomía' },
];

export interface PanelTareasInicialProps {
  materia: MateriaDocenteNotas;
  asignacionId: number;
  periodoId: number;
  paraleloId?: number;
  gradoId?: number;
  modoInicial?: 'lista' | 'crear';
  editId?: number | null;
  onVolver?: () => void;
}

interface EntregaEstudianteItem {
  matricula_id: number;
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_foto?: string;
  entrega_id?: number;
  archivo_url?: string;
  archivo_nombre?: string;
  archivos?: Array<{ url: string; nombre: string; tipo: string; tamano: number }>;
  comentario_estudiante?: string;
  fecha_entrega?: string;
  estado_entrega: string;
  observacion_docente?: string;
  calificado: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export const PanelTareasInicial: React.FC<PanelTareasInicialProps> = ({
  materia,
  asignacionId,
  periodoId,
  modoInicial = 'lista',
  editId: editIdProp,
  onVolver,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Paleta estética dorada/azul ──
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  const onGrad = isDark ? '#000' : '#fff';
  const accentColor = gold;

  // ── Estados de vista ──
  const [vista, setVista] = useState<'lista' | 'editor'>(modoInicial === 'crear' ? 'editor' : 'lista');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimensionId, setDimensionId] = useState<number | null>(null);

  // ── Estados de formulario (Crear / Editar) ──
  const [editandoId, setEditandoId] = useState<number | null>(editIdProp ?? null);
  const [titulo, setTitulo] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('grafomotricidad');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [permiteEntregaVirtual, setPermiteEntregaVirtual] = useState(true);
  const [visibleFamilias, setVisibleFamilias] = useState(true);
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);
  const [previewExistentePdf, setPreviewExistentePdf] = useState<string | null>(null);
  const [previewExistenteFoto, setPreviewExistenteFoto] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Modal Eliminar ──
  const [dlgEliminar, setDlgEliminar] = useState<Evaluacion | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // ── Modal Entregas de Familias ──
  const [evEntregas, setEvEntregas] = useState<Evaluacion | null>(null);
  const [listaEntregas, setListaEntregas] = useState<EntregaEstudianteItem[]>([]);
  const [loadingEntregas, setLoadingEntregas] = useState(false);
  const [obsMap, setObsMap] = useState<Record<number, string>>({});
  const [guardandoObsId, setGuardandoObsId] = useState<number | null>(null);

  // Cargar dimensiones para satisfacer la restricción FK en la base de datos
  useEffect(() => {
    dimensionesService.listar()
      .then(res => {
        const dims: DimensionEvaluacion[] = res.data?.dimensiones ?? [];
        const target = dims.find(d => d.codigo === 'HAC') || dims[0];
        if (target) setDimensionId(target.id);
      })
      .catch(() => setDimensionId(1));
  }, []);

  // Cargar lista de prácticas
  const cargarPracticas = useCallback(async () => {
    if (!asignacionId || !periodoId) return;
    setLoading(true);
    try {
      const res = await evaluacionesService.listar({
        asignacion_docente_id: asignacionId,
        periodo_evaluacion_id: periodoId,
        activo: true,
        limit: 100,
      });
      setEvaluaciones(res.data?.evaluaciones ?? []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al cargar prácticas');
    } finally {
      setLoading(false);
    }
  }, [asignacionId, periodoId]);

  useEffect(() => {
    cargarPracticas();
  }, [cargarPracticas]);

  // Si viene editIdProp, cargar datos de la evaluación para edición
  useEffect(() => {
    if (!editIdProp) return;
    evaluacionesService.obtenerPorId(editIdProp)
      .then(res => {
        const ev = res.data?.evaluacion;
        if (ev) {
          setEditandoId(ev.id);
          setTitulo(ev.nombre || '');
          setDescripcion(ev.descripcion || ev.instrucciones || '');
          setFechaLimite(ev.fecha_limite ? ev.fecha_limite.split('T')[0] : '');
          setPermiteEntregaVirtual(Boolean(ev.permite_entrega_archivo));
          setVisibleFamilias(Boolean(ev.visible_para_padres));
          setPreviewExistentePdf(ev.pdf_url || null);
          setPreviewExistenteFoto(ev.foto_url || null);
          const tipoMatch = TIPOS_PRACTICA_INICIAL.find(t => t.value === ev.tipo);
          if (tipoMatch) setTipoSeleccionado(tipoMatch.value);
          setVista('editor');
        }
      })
      .catch(() => {});
  }, [editIdProp]);

  // Publicar / Ocultar a padres
  const handlePublicar = async (id: number) => {
    try {
      await adjuntosService.publicar(id);
      toast.success('Práctica visible para las familias');
      cargarPracticas();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al publicar');
    }
  };

  const handleDespublicar = async (id: number) => {
    try {
      await adjuntosService.despublicar(id);
      toast.success('Práctica ocultada para las familias');
      cargarPracticas();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al despublicar');
    }
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = async () => {
    if (!dlgEliminar) return;
    setEliminando(true);
    try {
      await evaluacionesService.eliminar(dlgEliminar.id);
      toast.success('Práctica eliminada');
      setDlgEliminar(null);
      cargarPracticas();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al eliminar');
    } finally {
      setEliminando(false);
    }
  };

  // Abrir editor para nueva práctica
  const handleIniciarNueva = () => {
    setEditandoId(null);
    setTitulo('');
    setTipoSeleccionado('grafomotricidad');
    setDescripcion('');
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setFechaLimite(d.toISOString().split('T')[0]);
    setPermiteEntregaVirtual(true);
    setVisibleFamilias(true);
    setArchivoAdjunto(null);
    setPreviewExistentePdf(null);
    setPreviewExistenteFoto(null);
    setVista('editor');
  };

  // Abrir editor para editar práctica existente
  const handleIniciarEditar = (ev: Evaluacion) => {
    setEditandoId(ev.id);
    setTitulo(ev.nombre || '');
    setDescripcion(ev.descripcion || ev.instrucciones || '');
    setFechaLimite(ev.fecha_limite ? ev.fecha_limite.split('T')[0] : '');
    setPermiteEntregaVirtual(Boolean(ev.permite_entrega_archivo));
    setVisibleFamilias(Boolean(ev.visible_para_padres));
    setPreviewExistentePdf(ev.pdf_url || null);
    setPreviewExistenteFoto(ev.foto_url || null);
    setArchivoAdjunto(null);
    const tipoMatch = TIPOS_PRACTICA_INICIAL.find(t => t.value === ev.tipo);
    if (tipoMatch) setTipoSeleccionado(tipoMatch.value);
    setVista('editor');
  };

  // Guardar Práctica (Crear o Actualizar)
  const handleGuardarPractica = async () => {
    if (!titulo.trim()) {
      toast.error('El nombre de la práctica es requerido');
      return;
    }
    if (!dimensionId) {
      toast.error('Cargando configuración, intenta nuevamente en unos segundos');
      return;
    }

    setGuardando(true);
    try {
      if (editandoId) {
        // Actualizar
        await evaluacionesService.actualizar(editandoId, {
          nombre: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha_limite: fechaLimite || undefined,
          visible_para_padres: visibleFamilias,
          permite_entrega_archivo: permiteEntregaVirtual,
          tipo: tipoSeleccionado as any,
          puntaje_maximo: 0,
        });

        if (archivoAdjunto) {
          const isPdf = archivoAdjunto.type === 'application/pdf' || archivoAdjunto.name.endsWith('.pdf');
          if (isPdf) {
            await adjuntosService.subirPdf(editandoId, archivoAdjunto);
          } else {
            await adjuntosService.subirFoto(editandoId, archivoAdjunto);
          }
        }
        toast.success('Práctica actualizada correctamente');
      } else {
        // Crear
        const res = await evaluacionesService.crear({
          asignacion_docente_id: asignacionId,
          periodo_evaluacion_id: periodoId,
          dimension_evaluacion_id: dimensionId,
          nombre: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: new Date().toISOString().split('T')[0],
          fecha_limite: fechaLimite || undefined,
          visible_para_padres: visibleFamilias,
          permite_entrega_archivo: permiteEntregaVirtual,
          tipo: tipoSeleccionado as any,
          puntaje_maximo: 0,
          modalidad: permiteEntregaVirtual ? 'virtual' : 'presencial',
        });

        const idCreado = res.data?.evaluacion?.id;
        if (idCreado && archivoAdjunto) {
          try {
            const isPdf = archivoAdjunto.type === 'application/pdf' || archivoAdjunto.name.endsWith('.pdf');
            if (isPdf) {
              await adjuntosService.subirPdf(idCreado, archivoAdjunto);
            } else {
              await adjuntosService.subirFoto(idCreado, archivoAdjunto);
            }
          } catch (fileErr) {
            console.error('Error al subir adjunto inicial:', fileErr);
          }
        }
        toast.success('Práctica publicada exitosamente');
      }

      setVista('lista');
      cargarPracticas();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al guardar la práctica');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir entregas de familias
  const handleVerEntregas = async (ev: Evaluacion) => {
    setEvEntregas(ev);
    setLoadingEntregas(true);
    try {
      const res = await entregasService.obtenerEntregasDocente(ev.id);
      const items = (res.data?.entregas ?? []) as EntregaEstudianteItem[];
      setListaEntregas(items);

      const map: Record<number, string> = {};
      items.forEach(it => {
        if (it.observacion_docente) {
          map[it.matricula_id] = it.observacion_docente;
        }
      });
      setObsMap(map);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al cargar entregas');
    } finally {
      setLoadingEntregas(false);
    }
  };

  // Guardar observación cualitativa
  const handleGuardarObservacion = async (matriculaId: number) => {
    if (!evEntregas) return;
    setGuardandoObsId(matriculaId);
    try {
      const texto = obsMap[matriculaId] || 'Revisado ⭐';
      await calificacionesService.guardarIndividual({
        evaluacion_id: evEntregas.id,
        matricula_id: matriculaId,
        puntaje_obtenido: 0,
        observacion: texto,
      });
      toast.success('Observación guardada');
      setListaEntregas(prev => prev.map(item =>
        item.matricula_id === matriculaId
          ? { ...item, observacion_docente: texto, calificado: true }
          : item
      ));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al guardar observación');
    } finally {
      setGuardandoObsId(null);
    }
  };

  const tipoActual = TIPOS_PRACTICA_INICIAL.find(t => t.value === tipoSeleccionado) || TIPOS_PRACTICA_INICIAL[0];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: VISTA EDITOR (2 COLUMNAS IDÉNTICA A "NUEVA EVALUACIÓN" DE SECUNDARIA)
  // ════════════════════════════════════════════════════════════════════════════
  if (vista === 'editor') {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Fade in timeout={350}>
            <Box>

              {/* Botón Volver al Listado */}
              <Box
                onClick={() => setVista('lista')}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                  cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                  '&:hover': { color: gold }, transition: 'color .15s',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Volver a prácticas asignadas
              </Box>

              {/* Encabezado Principal */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AssignmentIcon sx={{
                  color: gold, fontSize: 34,
                  animation: `${bounceIcon} 1.5s ease-in-out infinite`,
                }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', md: '2rem' }, fontWeight: 800,
                    background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {editandoId ? 'Editar Práctica de Inicial' : 'Nueva Práctica para Nivel Inicial'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {materia.grado_nombre} "{materia.paralelo_nombre}" · {materia.trimestre_nombre || materia.periodo_nombre} · Prácticas Formativas (Sin Nota)
                  </Typography>
                </Box>
              </Box>

              {/* Banner contextual de Inicial */}
              <Box sx={{
                p: 2, mb: 3.5, borderRadius: '16px',
                border: `1.5px solid ${alpha(gold, 0.25)}`,
                bgcolor: isDark ? alpha(gold, 0.05) : alpha(gold, 0.03),
                display: 'flex', alignItems: 'center', gap: 1.8,
              }}>
                <SparklesIcon sx={{ color: gold, fontSize: 28, flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: gold }}>
                    En Nivel Inicial no hay ponderación de dimensiones numéricas
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2, fontSize: 12 }}>
                    Este formulario te permite programar fichas, consignas y guías de trabajo para las familias. Si habilitás la recepción virtual, los padres podrán subir fotografías o evidencias del avance de sus hijos.
                  </Typography>
                </Box>
              </Box>

              {/* ══ GRID 2 COLUMNAS (Estilo Secundaria) ══ */}
              <Grid container spacing={3.5} alignItems="flex-start">

                {/* ── COLUMNA PRINCIPAL (Formulario por Bloques) ── */}
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Box sx={{ animation: `${fadeUp} 0.3s ease-out`, display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* BLOQUE 1: Información Básica */}
                    <Box sx={cardSx(isDark)}>
                      <SectionHeader
                        icon={<AssignmentIcon sx={{ fontSize: 18 }} />}
                        title="1. Información de la Práctica"
                        subtitle="Nombre, tipo de actividad pedagógica e instrucciones para la familia"
                        accent={accentColor}
                        isDark={isDark}
                      />
                      <Box sx={{ p: 2.5 }}>
                        <Stack spacing={2.5}>
                          {/* Nombre de la práctica */}
                          <TextField
                            label="Nombre de la práctica o ficha *"
                            fullWidth
                            placeholder="Ej: Ficha de Trazo de la Vocal A, Reconociendo los Colores Primarios..."
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            sx={inputSx(accentColor)}
                          />

                          {/* Selector de Tipo de Práctica Inicial */}
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}
                              sx={{ mb: 1.2, display: 'block', fontSize: '0.88rem' }}>
                              Tipo de actividad pedagógica
                            </Typography>
                            <Box sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                              gap: 1.2,
                            }}>
                              {TIPOS_PRACTICA_INICIAL.map(t => {
                                const sel = tipoSeleccionado === t.value;
                                return (
                                  <Box
                                    key={t.value}
                                    onClick={() => setTipoSeleccionado(t.value)}
                                    sx={{
                                      p: 1.5, borderRadius: '14px', cursor: 'pointer',
                                      border: `1.5px solid ${sel ? t.color : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                      bgcolor: sel
                                        ? alpha(t.color, isDark ? 0.2 : 0.1)
                                        : isDark ? alpha('#fff', 0.02) : '#fafafa',
                                      transition: 'all 0.18s ease',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: t.color,
                                        bgcolor: alpha(t.color, isDark ? 0.25 : 0.14),
                                      },
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography sx={{ fontSize: '1.2rem' }}>{t.icon}</Typography>
                                      <Typography variant="body2" fontWeight={800} sx={{ color: sel ? t.color : 'text.primary' }}>
                                        {t.label}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, display: 'block', lineHeight: 1.3 }}>
                                      {t.desc}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>

                          {/* Consigna / Instrucciones */}
                          <TextField
                            label="Consigna o Instrucciones para las familias"
                            placeholder="Describí los pasos que deben seguir en casa con el niño (ej: Colorear la ficha con lápices de cera, recortar y pegar bolitas de papel sobre el contorno, o tomar una fotografía al terminar)..."
                            multiline
                            rows={4}
                            fullWidth
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            sx={inputSx(accentColor)}
                          />
                        </Stack>
                      </Box>
                    </Box>

                    {/* BLOQUE 2: Ficha y Material Adjunto */}
                    <Box sx={cardSx(isDark)}>
                      <SectionHeader
                        icon={<AttachIcon sx={{ fontSize: 18 }} />}
                        title="2. Ficha o Guía Imprimible (Material de Apoyo)"
                        subtitle="Subí la hoja de trabajo en PDF o imagen para que los padres la descarguen"
                        accent={accentColor}
                        isDark={isDark}
                      />
                      <Box sx={{ p: 2.5 }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 20 * 1024 * 1024) {
                                toast.error('El archivo no debe superar los 20MB');
                                return;
                              }
                              setArchivoAdjunto(file);
                            }
                          }}
                        />

                        <Box sx={{
                          p: 3, borderRadius: '16px',
                          border: `2px dashed ${archivoAdjunto || previewExistentePdf || previewExistenteFoto ? gold : isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
                          bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}>
                          <UploadIcon sx={{ fontSize: 36, color: gold, mb: 1 }} />
                          <Typography variant="subtitle1" fontWeight={800}>
                            {archivoAdjunto
                              ? archivoAdjunto.name
                              : previewExistentePdf
                                ? 'Ficha PDF adjunta guardada'
                                : previewExistenteFoto
                                  ? 'Ficha Imagen adjunta guardada'
                                  : 'Arrastrá o seleccioná una ficha en PDF o Imagen'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            {archivoAdjunto
                              ? `${(archivoAdjunto.size / 1024 / 1024).toFixed(2)} MB`
                              : 'Permite a los padres imprimir la tarea o revisarla en su celular.'}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => fileInputRef.current?.click()}
                              startIcon={<AttachIcon />}
                              sx={{
                                textTransform: 'none', borderRadius: '10px', fontWeight: 700,
                                borderColor: gold, color: gold,
                              }}
                            >
                              {archivoAdjunto ? 'Reemplazar archivo' : 'Seleccionar Ficha'}
                            </Button>
                            {archivoAdjunto && (
                              <Button
                                size="small"
                                color="error"
                                onClick={() => setArchivoAdjunto(null)}
                                sx={{ textTransform: 'none', borderRadius: '10px' }}
                              >
                                Quitar selección
                              </Button>
                            )}
                            {(previewExistentePdf || previewExistenteFoto) && !archivoAdjunto && (
                              <Button
                                size="small"
                                component="a"
                                href={previewExistentePdf || previewExistenteFoto || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                sx={{ textTransform: 'none', borderRadius: '10px' }}
                              >
                                Ver archivo actual
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* BLOQUE 3: Modalidad y Entregas */}
                    <Box sx={cardSx(isDark)}>
                      <SectionHeader
                        icon={<CalendarIcon sx={{ fontSize: 18 }} />}
                        title="3. Modalidad y Recepción de Entregas"
                        subtitle="Fecha de presentación y opciones para recepción de fotos en clases virtuales"
                        accent={accentColor}
                        isDark={isDark}
                      />
                      <Box sx={{ p: 2.5 }}>
                        <Stack spacing={2.5}>
                          <TextField
                            label="Fecha límite de presentación"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={fechaLimite}
                            onChange={e => setFechaLimite(e.target.value)}
                            sx={inputSx(accentColor)}
                          />

                          <Box sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc', p: 2, borderRadius: '14px' }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={permiteEntregaVirtual}
                                  onChange={e => setPermiteEntregaVirtual(e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={800}>
                                    Permitir entrega digital por plataforma
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Habilita que los padres suban fotografías de la tarea o cuaderno directamente desde su cuenta.
                                  </Typography>
                                </Box>
                              }
                            />

                            <Divider sx={{ my: 1.5 }} />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={visibleFamilias}
                                  onChange={e => setVisibleFamilias(e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={800}>
                                    Visible de inmediato para las familias
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Si lo desactivás, se guardará como borrador y no aparecerá aún a los padres de familia.
                                  </Typography>
                                </Box>
                              }
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Box>

                    {/* Botones de acción inferiores */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 4 }}>
                      <Button
                        onClick={() => setVista('lista')}
                        disabled={guardando}
                        sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary', px: 3 }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleGuardarPractica}
                        disabled={guardando}
                        sx={{
                          borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 4, py: 1.2,
                          background: gradBg, color: onGrad, fontSize: 14,
                          boxShadow: `0 4px 14px ${alpha(gold, 0.35)}`,
                        }}
                      >
                        {guardando ? (
                          <CircularProgress size={22} sx={{ color: onGrad }} />
                        ) : editandoId ? (
                          'Guardar Cambios'
                        ) : (
                          'Publicar Práctica'
                        )}
                      </Button>
                    </Box>

                  </Box>
                </Grid>

                {/* ── COLUMNA LATERAL (Resumen / Live Preview Idéntico a Secundaria) ── */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Box sx={{
                    position: { lg: 'sticky' }, top: { lg: 24 },
                    display: 'flex', flexDirection: 'column', gap: 2.5,
                  }}>

                    {/* Tarjeta de Vista Previa */}
                    <Box sx={cardSx(isDark)}>
                      <Box sx={{
                        px: 2.5, py: 1.8, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <VisibilityIcon sx={{ fontSize: 16, color: gold }} />
                          Vista Previa de la Práctica
                        </Typography>
                        <Chip
                          label={visibleFamilias ? 'Publicada' : 'Borrador'}
                          size="small"
                          sx={{
                            fontSize: 10, fontWeight: 800, height: 20,
                            bgcolor: visibleFamilias ? alpha('#16a34a', 0.15) : alpha('#f59e0b', 0.15),
                            color: visibleFamilias ? '#16a34a' : '#f59e0b',
                          }}
                        />
                      </Box>

                      <Box sx={{ p: 2.5 }}>
                        {/* Simulación de tarjeta tal como la verá la familia */}
                        <Box sx={{
                          p: 2, borderRadius: '16px',
                          border: `1.5px solid ${alpha(tipoActual.color, 0.35)}`,
                          bgcolor: isDark ? alpha(tipoActual.color, 0.08) : alpha(tipoActual.color, 0.04),
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={`${tipoActual.icon} ${tipoActual.label}`}
                              size="small"
                              sx={{
                                fontSize: 10.5, fontWeight: 800,
                                bgcolor: alpha(tipoActual.color, 0.2), color: tipoActual.color,
                              }}
                            />
                            <Chip
                              label="Sin Nota Numérica"
                              size="small"
                              sx={{ fontSize: 10, fontWeight: 700, bgcolor: alpha(gold, 0.15), color: gold }}
                            />
                          </Box>

                          <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem', lineHeight: 1.3, mb: 0.8 }}>
                            {titulo || 'Título de la práctica...'}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 1.5, whiteSpace: 'pre-line' }}>
                            {descripcion || 'Aquí se mostrarán las instrucciones que los padres leerán para apoyar a su hijo en casa.'}
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'text.secondary' }}>
                            <span>Entrega: <strong>{fechaLimite || 'Por definir'}</strong></span>
                            {permiteEntregaVirtual && (
                              <Chip
                                icon={<ComputerIcon sx={{ fontSize: '11px !important' }} />}
                                label="Recepción virtual"
                                size="small"
                                sx={{ height: 18, fontSize: 9.5, fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Tarjeta de Consejos Pedagógicos Inicial */}
                    <Box sx={{
                      p: 2.5, borderRadius: '18px',
                      bgcolor: isDark ? alpha(gold, 0.04) : alpha('#0288d1', 0.04),
                      border: `1px solid ${alpha(gold, 0.2)}`,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LightbulbIcon sx={{ color: gold, fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: gold }}>
                          Consejos para Nivel Inicial
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, lineHeight: 1.5 }}>
                        • Utilizá instrucciones cortas y numeradas para que los padres de familia guíen la actividad paso a paso.<br />
                        • Si es una actividad manual o plástica, recordales qué materiales sencillos tener listos.<br />
                        • La entrega virtual fotográfica es ideal para registrar el progreso psicomotriz de los niños en casa.
                      </Typography>
                    </Box>

                  </Box>
                </Grid>

              </Grid>

            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: VISTA LISTADO (TARJETAS EXPANDIBLES IDÉNTICAS A SECUNDARIA)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ══ HEADER (Idéntico a Secundaria) ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3 }}>
            {onVolver && (
              <Box
                onClick={onVolver}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                  cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                  '&:hover': { color: gold }, transition: 'color 0.15s',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Volver a mis materias
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <GradeIcon sx={{ color: gold, fontSize: 34, animation: `${bounceIcon} 1.5s ease-in-out infinite` }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                    fontWeight: 800, background: gradBg,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {materia.materia_nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4, flexWrap: 'wrap' }}>
                    <Chip
                      label={materia.trimestre_nombre || materia.periodo_nombre}
                      size="small"
                      sx={{ background: gradBg, color: onGrad, fontWeight: 700, fontSize: 11 }}
                    />
                    <Chip
                      label="Nivel Inicial · Formativa"
                      size="small"
                      sx={{
                        bgcolor: alpha(gold, isDark ? 0.2 : 0.12),
                        color: gold, fontWeight: 700, fontSize: 11,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {materia.grado_nombre} "{materia.paralelo_nombre}" · {materia.turno_nombre} · {materia.total_estudiantes} estudiantes
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Botón Nueva Evaluación / Práctica (Estilo Secundaria) */}
              <Box
                component="button"
                onClick={handleIniciarNueva}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8,
                  px: 2.2, py: 1.1, borderRadius: '12px', border: 'none',
                  background: gradBg, color: onGrad,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  boxShadow: `0 4px 14px ${alpha(gold, 0.3)}`,
                  transition: 'opacity .15s, transform .15s',
                  '&:hover': { opacity: 0.9, transform: 'translateY(-1px)' },
                  alignSelf: 'flex-start',
                }}
              >
                <AddIcon sx={{ fontSize: 17 }} />
                Nueva práctica
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ BANNER INFORMATIVO INICIAL ══ */}
        <Fade in timeout={450}>
          <Box sx={{
            p: 2, mb: 3, borderRadius: '16px',
            bgcolor: isDark ? alpha(gold, 0.04) : alpha('#0288d1', 0.03),
            border: `1px solid ${alpha(gold, 0.2)}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <SchoolIcon sx={{ color: gold, fontSize: 24, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5 }}>
              En <strong>Nivel Inicial</strong> este espacio está destinado a la publicación de <strong>prácticas y fichas formativas sin nota</strong>. Las entregas permiten acompañar el desarrollo motriz y cognitivo sin ponderación porcentual.
            </Typography>
          </Box>
        </Fade>

        {/* ══ LISTA DE EVALUACIONES EXPANDIBLES (Idénticas a EvaluacionCard de Secundaria) ══ */}
        <Fade in timeout={500}>
          <Box sx={{ animation: `${fadeUp} 0.28s ease-out` }}>

            {/* Sub-header con botón refrescar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 9, height: 9, borderRadius: '50%', bgcolor: gold,
                  boxShadow: `0 0 8px ${alpha(gold, 0.6)}`,
                }} />
                <Typography variant="body2" fontWeight={800} sx={{ color: gold }}>
                  Prácticas y Actividades de Inicial
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {evaluaciones.length} {evaluaciones.length === 1 ? 'práctica registrada' : 'prácticas registradas'}
                </Typography>
              </Box>

              <Box
                onClick={cargarPracticas}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4,
                  fontSize: 12, fontWeight: 600, color: 'text.disabled', cursor: 'pointer',
                  '&:hover': { color: gold }, transition: 'color 0.15s',
                }}
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
                Refrescar
              </Box>
            </Box>

            {/* Loading State */}
            {loading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={26} sx={{ color: gold }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Cargando prácticas...
                </Typography>
              </Box>
            ) : evaluaciones.length === 0 ? (
              /* Empty State */
              <Box sx={{
                textAlign: 'center', py: 7, borderRadius: '16px',
                border: `2px dashed ${alpha(gold, 0.3)}`,
                bgcolor: isDark ? alpha(gold, 0.03) : alpha(gold, 0.02),
              }}>
                <HourglassIcon sx={{ fontSize: 38, color: alpha(gold, 0.35), mb: 1 }} />
                <Typography variant="body1" fontWeight={700} sx={{ color: gold, mb: 0.5 }}>
                  Sin prácticas asignadas en este trimestre
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                  Creá la primera práctica o ficha de trabajo para las familias
                </Typography>
                <Box
                  component="button"
                  onClick={handleIniciarNueva}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.8,
                    px: 2.2, py: 0.9, borderRadius: '10px', border: 'none',
                    bgcolor: gold, color: onGrad,
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'opacity .15s', '&:hover': { opacity: 0.85 },
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                  Nueva práctica
                </Box>
              </Box>
            ) : (
              /* Stack de EvaluacionCard */
              <Stack spacing={1.5}>
                {evaluaciones.map((ev, i) => (
                  <EvaluacionCardInicial
                    key={ev.id}
                    ev={ev}
                    index={i}
                    dimColor={gold}
                    dimBg={alpha(gold, 0.1)}
                    isDark={isDark}
                    onEliminar={evTarget => setDlgEliminar(evTarget)}
                    onEditar={evTarget => handleIniciarEditar(evTarget)}
                    onPublicar={id => handlePublicar(id)}
                    onDespublicar={id => handleDespublicar(id)}
                    onVerEntregas={evTarget => handleVerEntregas(evTarget)}
                  />
                ))}
              </Stack>
            )}

          </Box>
        </Fade>

      </Container>

      {/* ══ MODAL: ENTREGAS Y REVISIÓN DE FAMILIAS ══ */}
      <Dialog
        open={Boolean(evEntregas)}
        onClose={() => setEvEntregas(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: isDark ? '#0b1329' : '#ffffff',
            border: `1.5px solid ${alpha(gold, 0.25)}`,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1 }}>
          Entregas de Familias · {evEntregas?.nombre}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
            Revisá los archivos y fotos enviados por los padres y registrá la devolución formativa.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {loadingEntregas ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={28} sx={{ color: gold }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cargando entregas...
              </Typography>
            </Box>
          ) : listaEntregas.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron registros de estudiantes para este curso.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {listaEntregas.map(ent => {
                const entrego = ent.estado_entrega !== 'sin_entrega';
                const archivos = ent.archivos && ent.archivos.length > 0
                  ? ent.archivos
                  : ent.archivo_url
                    ? [{ url: ent.archivo_url, nombre: ent.archivo_nombre || 'Archivo adjunto', tipo: 'foto', tamano: 0 }]
                    : [];

                return (
                  <Paper
                    key={ent.matricula_id}
                    elevation={0}
                    sx={{
                      p: 2, borderRadius: '14px',
                      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#f9fafb',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={ent.estudiante_foto}
                          alt={ent.estudiante_nombres}
                          sx={{ width: 42, height: 42, bgcolor: alpha(gold, 0.2), color: gold, fontWeight: 700 }}
                        >
                          {ent.estudiante_nombres?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {ent.estudiante_apellidos} {ent.estudiante_nombres}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                            <Chip
                              label={entrego ? 'Entregado' : 'Pendiente'}
                              size="small"
                              sx={{
                                height: 20, fontSize: 10, fontWeight: 700,
                                bgcolor: entrego ? alpha('#16a34a', 0.12) : alpha('#f59e0b', 0.12),
                                color: entrego ? '#16a34a' : '#f59e0b',
                              }}
                            />
                            {ent.fecha_entrega && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(ent.fecha_entrega).toLocaleString('es-ES', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                })}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {archivos.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          {archivos.map((arc, aIdx) => (
                            <Button
                              key={aIdx}
                              size="small"
                              variant="outlined"
                              component="a"
                              href={arc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                textTransform: 'none', fontSize: 11.5, borderRadius: '8px',
                                borderColor: alpha(gold, 0.5), color: gold,
                              }}
                            >
                              Ver evidencia ({aIdx + 1})
                            </Button>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin archivos subidos
                        </Typography>
                      )}
                    </Box>

                    {ent.comentario_estudiante && (
                      <Box sx={{
                        mt: 1.5, p: 1.2, borderRadius: '8px',
                        bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
                        border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                      }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block' }}>
                          Nota de la familia:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 12.5, fontStyle: 'italic' }}>
                          "{ent.comentario_estudiante}"
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 1.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Dejá un mensaje para la familia (ej: ¡Excelente trabajo!, Revisado ⭐, Felicitaciones)..."
                        value={obsMap[ent.matricula_id] ?? ''}
                        onChange={e => {
                          const val = e.target.value;
                          setObsMap(prev => ({ ...prev, [ent.matricula_id]: val }));
                        }}
                        InputProps={{
                          sx: { fontSize: 12.5, borderRadius: '8px' },
                        }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleGuardarObservacion(ent.matricula_id)}
                        disabled={guardandoObsId === ent.matricula_id}
                        sx={{
                          borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: 12, px: 2,
                          background: gradBg, color: onGrad, flexShrink: 0,
                        }}
                      >
                        {guardandoObsId === ent.matricula_id ? <CircularProgress size={16} sx={{ color: onGrad }} /> : 'Guardar'}
                      </Button>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEvEntregas(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ MODAL: CONFIRMAR ELIMINAR ══ */}
      <Dialog
        open={Boolean(dlgEliminar)}
        onClose={() => !eliminando && setDlgEliminar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDark ? '#0b1329' : '#ffffff',
            border: `1.5px solid ${alpha('#ef4444', 0.25)}`,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>¿Eliminar esta práctica?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Se eliminará <strong>{dlgEliminar?.nombre}</strong> y las entregas asociadas. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDlgEliminar(null)} disabled={eliminando} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmarEliminar}
            disabled={eliminando}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {eliminando ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TARJETA EXPANDIBLE IDÉNTICA A SECUNDARIA (EvaluacionCard)
// ══════════════════════════════════════════════════════════════════════════════
const EvaluacionCardInicial: React.FC<{
  ev: Evaluacion;
  index: number;
  dimColor: string;
  dimBg: string;
  isDark: boolean;
  onEliminar: (ev: Evaluacion) => void;
  onEditar: (ev: Evaluacion) => void;
  onPublicar: (id: number) => void;
  onDespublicar: (id: number) => void;
  onVerEntregas: (ev: Evaluacion) => void;
}> = ({
  ev,
  index,
  dimColor,
  dimBg,
  isDark,
  onEliminar,
  onEditar,
  onPublicar,
  onDespublicar,
  onVerEntregas,
}) => {
  const [open, setOpen] = useState(false);
  const tipo = TIPOS_PRACTICA_INICIAL.find(t => t.value === ev.tipo) || {
    icon: '✏️',
    label: 'Práctica',
    color: dimColor,
  };

  const rowSx = {
    display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1.2,
    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
  };
  const lblSx = {
    minWidth: 126, flexShrink: 0,
    fontSize: 11, fontWeight: 700, color: 'text.disabled',
    display: 'flex', alignItems: 'center', gap: 0.5, pt: '1px',
  };
  const valSx = { fontSize: 13, lineHeight: 1.55 };

  return (
    <Box sx={{
      borderRadius: '16px',
      border: `1.5px solid ${open ? dimColor : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      overflow: 'hidden',
      animation: `${cardIn} 0.3s ease-out ${index * 0.06}s both`,
      transition: 'border-color 0.18s, box-shadow 0.18s',
      boxShadow: open
        ? `0 0 0 3px ${alpha(dimColor, 0.1)}, 0 6px 20px ${alpha(dimColor, 0.12)}`
        : isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)',
    }}>

      {/* ── Cabecera clickeable (Idéntica a Secundaria) ── */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          p: 2, cursor: 'pointer',
          bgcolor: open
            ? isDark ? alpha(dimColor, 0.1) : alpha(dimBg, 0.5)
            : isDark ? alpha('#fff', 0.02) : '#fff',
          transition: 'background 0.18s',
          display: 'flex', alignItems: 'center', gap: 1.5,
          '&:hover': {
            bgcolor: isDark ? alpha(dimColor, 0.08) : alpha(dimBg, 0.35),
          },
        }}
      >
        {/* Ícono */}
        <Box sx={{
          width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
          bgcolor: open ? alpha(dimColor, 0.18) : isDark ? alpha('#fff', 0.05) : alpha(dimColor, 0.07),
          border: `1.5px solid ${open ? alpha(dimColor, 0.35) : 'transparent'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s',
          fontSize: '1.2rem',
        }}>
          {tipo.icon}
        </Box>

        {/* Nombre y meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap
            sx={{ fontSize: 13.5, color: open ? dimColor : 'text.primary', lineHeight: 1.3, transition: 'color 0.18s' }}>
            {ev.nombre}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', alignItems: 'center', mt: 0.4 }}>
            <Chip
              label={`${tipo.icon} ${tipo.label}`}
              size="small"
              sx={{ fontSize: 10, height: 18, bgcolor: isDark ? alpha('#fff', 0.07) : '#f3f4f6', fontWeight: 700 }}
            />
            <Chip
              label="Formativa (Sin nota)"
              size="small"
              sx={{ fontSize: 10, height: 18, bgcolor: alpha(dimColor, 0.12), color: dimColor, fontWeight: 700 }}
            />
            {ev.permite_entrega_archivo && (
              <Chip
                icon={<UploadIcon sx={{ fontSize: '11px !important' }} />}
                label="Entrega en plataforma"
                size="small"
                sx={{ fontSize: 10, height: 18, bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6', fontWeight: 800 }}
              />
            )}
            {ev.fecha_limite && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <CalendarIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  Entrega: {ev.fecha_limite.slice(0, 10)}
                </Typography>
              </Box>
            )}
            {ev.foto_url && (
              <Tooltip title="Ficha Imagen adjunta">
                <ImageIcon sx={{ fontSize: 13, color: dimColor }} />
              </Tooltip>
            )}
            {ev.pdf_url && (
              <Tooltip title="Ficha PDF adjunta">
                <PdfIcon sx={{ fontSize: 13, color: '#dc2626' }} />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Acciones inline (Idénticas a Secundaria) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {/* Publicar / Ocultar a padres */}
          <Tooltip title={ev.visible_para_padres ? 'Visible a padres (clic para ocultar)' : 'Oculto a padres (clic para publicar)'}>
            <Box
              component="button"
              type="button"
              onClick={() => ev.visible_para_padres ? onDespublicar(ev.id) : onPublicar(ev.id)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: ev.visible_para_padres
                  ? alpha('#16a34a', isDark ? 0.22 : 0.12)
                  : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05),
                color: ev.visible_para_padres ? '#22c55e' : isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                border: `1.5px solid ${ev.visible_para_padres ? alpha('#22c55e', 0.4) : isDark ? alpha('#fff', 0.15) : alpha('#000', 0.12)}`,
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#22c55e',
                  bgcolor: alpha('#22c55e', 0.2),
                  borderColor: '#22c55e',
                  transform: 'scale(1.06)',
                },
              }}
            >
              {ev.visible_para_padres
                ? <VisibilityIcon sx={{ fontSize: 16 }} />
                : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
            </Box>
          </Tooltip>

          {/* Editar práctica */}
          <Tooltip title="Editar práctica">
            <Box
              component="button"
              type="button"
              onClick={() => onEditar(ev)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: isDark ? alpha('#3b82f6', 0.16) : alpha('#3b82f6', 0.08),
                color: isDark ? '#60a5fa' : '#2563eb',
                border: `1.5px solid ${alpha('#3b82f6', isDark ? 0.38 : 0.28)}`,
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#fff',
                  bgcolor: '#2563eb',
                  borderColor: '#2563eb',
                  transform: 'scale(1.06)',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>

          {/* Eliminar práctica */}
          <Tooltip title="Eliminar práctica">
            <Box
              component="button"
              type="button"
              onClick={e => {
                e.stopPropagation();
                onEliminar(ev);
              }}
              sx={{
                width: 32, height: 32, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: isDark ? alpha('#ef4444', 0.16) : alpha('#ef4444', 0.08),
                color: isDark ? '#f87171' : '#dc2626',
                border: `1.5px solid ${alpha('#ef4444', isDark ? 0.38 : 0.28)}`,
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#fff',
                  bgcolor: '#dc2626',
                  borderColor: '#dc2626',
                  transform: 'scale(1.06)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>

          {/* Desplegar / Plegar */}
          <Box sx={{
            width: 32, height: 32, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: open ? alpha(dimColor, 0.18) : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
            border: `1.5px solid ${open ? alpha(dimColor, 0.45) : isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08)}`,
            color: open ? dimColor : isDark ? 'rgba(255,255,255,0.75)' : 'text.primary',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {open ? <ArrowUpIcon sx={{ fontSize: 20 }} /> : <ArrowDownIcon sx={{ fontSize: 20 }} />}
          </Box>
        </Box>
      </Box>

      {/* ── Panel Detalle Expandible (Idéntico a DetallePanel de Secundaria) ── */}
      <Collapse in={open} timeout={240}>
        <Box sx={{
          borderTop: `1.5px solid ${alpha(dimColor, 0.2)}`,
          bgcolor: isDark ? alpha('#fff', 0.015) : alpha(dimBg, 0.12),
          p: 2.5,
        }}>
          {/* Header del detalle con botón de Ver Entregas */}
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 1.5, mb: 2, pb: 1.5,
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: dimColor, fontSize: 13, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AssignmentIcon sx={{ fontSize: 16 }} />
              Detalles de la Práctica
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onVerEntregas(ev)}
                startIcon={<UploadIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: '9px', textTransform: 'none', fontWeight: 800, fontSize: 12,
                  py: 0.6, px: 2, borderColor: dimColor, color: dimColor,
                  '&:hover': { bgcolor: alpha(dimColor, 0.1), borderColor: dimColor },
                }}
              >
                Ver entregas de familias
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onEditar(ev)}
                startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: '9px', textTransform: 'none', fontWeight: 800, fontSize: 12,
                  py: 0.6, px: 2, bgcolor: dimColor, color: '#fff',
                  boxShadow: 'none', '&:hover': { bgcolor: dimColor, opacity: 0.9 },
                }}
              >
                Editar práctica
              </Button>
            </Box>
          </Box>

          {/* Filas de información */}
          {ev.descripcion && (
            <Box sx={rowSx}>
              <Box sx={lblSx}>
                <DescriptionIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                Consigna / Instrucciones
              </Box>
              <Typography variant="body2" sx={{ ...valSx, flex: 1, whiteSpace: 'pre-line' }}>
                {ev.descripcion}
              </Typography>
            </Box>
          )}

          {ev.fecha_limite && (
            <Box sx={rowSx}>
              <Box sx={lblSx}>
                <CalendarIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                Fecha Límite
              </Box>
              <Typography variant="body2" fontWeight={700} sx={valSx}>
                {new Date(ev.fecha_limite).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Typography>
            </Box>
          )}

          {/* Fichas y Material Adjunto */}
          {(ev.pdf_url || ev.foto_url) && (
            <Box sx={rowSx}>
              <Box sx={lblSx}>
                <AttachIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                Material Adjunto
              </Box>
              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                {ev.pdf_url && (
                  <Button
                    size="small"
                    component="a"
                    href={ev.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<PdfIcon sx={{ color: '#dc2626' }} />}
                    sx={{
                      textTransform: 'none', fontSize: 12, fontWeight: 700, borderRadius: '8px',
                      bgcolor: isDark ? alpha('#fff', 0.05) : '#f8f9fa', color: 'text.primary',
                    }}
                  >
                    Descargar Ficha PDF
                  </Button>
                )}
                {ev.foto_url && (
                  <Button
                    size="small"
                    component="a"
                    href={ev.foto_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<ImageIcon sx={{ color: dimColor }} />}
                    sx={{
                      textTransform: 'none', fontSize: 12, fontWeight: 700, borderRadius: '8px',
                      bgcolor: isDark ? alpha('#fff', 0.05) : '#f8f9fa', color: 'text.primary',
                    }}
                  >
                    Ver Imagen Adjunta
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default PanelTareasInicial;