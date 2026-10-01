'use client';
// components/materiales/MaterialDetalleView.tsx
// Refactorizado con diseño institucional idéntico a Temario, Notas y Calificaciones

import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Card, CardContent, IconButton,
  Chip, alpha, useTheme, Skeleton, Tooltip, Button,
  Fade, Stack, Dialog, DialogContent,
  DialogActions, TextField, CircularProgress, Grid, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  ArrowBackRounded as BackIcon,
  FavoriteRounded as FavIcon,
  FavoriteBorderRounded as FavBorderIcon,
  EditRounded as EditIcon,
  DeleteForeverRounded as DeleteIcon,
  PublishRounded as PublishIcon,
  StarRounded as StarIcon,
  CheckCircleRounded as PublishedIcon,
  PauseCircleRounded as DraftIcon,
  PersonRounded as PersonIcon,
  SchoolRounded as SchoolIcon,
  CalendarTodayRounded as CalIcon,
  RemoveRedEyeRounded as EyeIcon,
  CloudDownloadRounded as DlIcon,
  BookmarkRounded as BookmarkIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  BarChartRounded as StatsIcon,
  CloseRounded as CloseIcon,
  LinkRounded as LinkIcon,
  InsertDriveFileRounded as FileIcon,
  MenuBookRounded as MenuBookIcon,
  VisibilityRounded as VisibilityIcon,
  ChevronRightRounded as ChevronRightIcon,
  SaveRounded as SaveIcon,
  AccessTimeRounded as TimeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  useMaterialDetalle,
  useFavoritosMaterial,
  useMateriales,
} from '@/hooks/useMaterial';
import { VisorArchivo } from './VisorArchivo';
import { ComentariosPanel } from './ComentariosPanel';
import { EstadisticasPanel } from './EstadisticasPanel';

// ── Animación idéntica a Notas, Temario y Calificaciones ──────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface MaterialDetalleViewProps {
  materialId: number;
  esDocente: boolean;
  matriculaId?: number;
}

const MaterialDetalleView: React.FC<MaterialDetalleViewProps> = ({
  materialId, esDocente, matriculaId,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';

  // Paleta unificada con los demás módulos
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;

  const [activeTab, setActiveTab] = useState(0);
  const [dlgEliminar, setDlgEliminar] = useState(false);
  const [dlgPublicar, setDlgPublicar] = useState(false);
  const [dlgEditar, setDlgEditar] = useState(false);
  const [fechaPub, setFechaPub] = useState('');

  // Formulario de edición rápida
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editDestacado, setEditDestacado] = useState(false);

  const { material, temas, isLoading, registrarAcceso, refrescar } = useMaterialDetalle(materialId);
  const { esFavorito, toggle: toggleFav, toggling } = useFavoritosMaterial(matriculaId ?? null);
  const { eliminar, publicar, actualizar, isSubmitting } = useMateriales();

  const viewRegistradaRef = useRef<number | null>(null);

  useEffect(() => {
    // Los docentes no deben inflar el contador de vistas de estudiantes
    if (esDocente) return;
    if (!materialId || viewRegistradaRef.current === materialId) return;

    viewRegistradaRef.current = materialId;
    registrarAcceso({ tipo_accion: 'visualizacion', matricula_id: matriculaId });
  }, [materialId, matriculaId, esDocente, registrarAcceso]);

  useEffect(() => {
    if (material) {
      setEditTitulo(material.titulo || '');
      setEditDescripcion(material.descripcion || '');
      setEditDestacado(Boolean(material.es_destacado));
    }
  }, [material]);

  const handleEliminar = async () => {
    const ok = await eliminar(materialId);
    if (ok) router.back();
  };

  const handlePublicar = async () => {
    await publicar(materialId, { fecha_publicacion: fechaPub || undefined });
    setDlgPublicar(false);
    refrescar();
  };

  const handleDespublicar = async () => {
    await publicar(materialId, { despublicar: true });
    refrescar();
  };

  const handleGuardarEdicion = async () => {
    if (!editTitulo.trim()) return;
    const ok = await actualizar(materialId, {
      titulo: editTitulo.trim(),
      descripcion: editDescripcion.trim(),
      es_destacado: editDestacado,
    });
    if (ok) {
      setDlgEditar(false);
      refrescar();
    }
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (isLoading || !material) {
    return (
      <Box sx={{ minHeight: '100vh', py: 2.5, px: { xs: 1.5, sm: 2.5, md: 3 }, width: '100%' }}>
        <Skeleton variant="rounded" height={28} width={180} sx={{ borderRadius: '8px', mb: 2 }} />
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: '18px', mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8.5 }}>
            <Skeleton variant="rounded" height={520} sx={{ borderRadius: '18px' }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 3.5 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: '18px', mb: 2 }} />
            <Skeleton variant="rounded" height={240} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const isPublished =
    material.es_publicado !== undefined
      ? Boolean(material.es_publicado)
      : (!!material.fecha_publicacion &&
        new Date(material.fecha_publicacion) <= new Date() &&
        (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date()));

  const iconColor = material.tipo_material_color || gold;
  const vistas = Number(material.total_vistas ?? material.contador_vistas ?? 0);
  const descargas = Number(material.total_descargas ?? material.contador_descargas ?? 0);
  const comentarios = Number(material.total_comentarios ?? 0);

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return '';
    const num = Number(bytes);
    if (isNaN(num)) return '';
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(0)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const tabsConfig = [
    { label: 'Visor de Recurso', icon: <BookmarkIcon sx={{ fontSize: 16 }} /> },
    {
      label: 'Comentarios',
      icon: <ChatIcon sx={{ fontSize: 16 }} />,
      badge: comentarios > 0 ? comentarios : undefined,
    },
    ...(esDocente ? [{
      label: 'Estadísticas de Uso',
      icon: <StatsIcon sx={{ fontSize: 16 }} />,
      badge: vistas > 0 ? vistas : undefined,
    }] : []),
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 2.5, px: { xs: 1.5, sm: 2.5, md: 3 }, width: '100%' }}>
      {/* ══ BREADCRUMB / VOLVER ════════════════════════════════ */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 2.5 }}>
          <Box
            onClick={() => router.back()}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 1.5,
              cursor: 'pointer',
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 600,
              '&:hover': { color: gold },
              transition: 'color 0.15s',
            }}
          >
            <BackIcon sx={{ fontSize: 16 }} />
            Volver a mis materiales
          </Box>

          {/* ══ HEADER IDÉNTICO A TAREAS, CALIFICACIONES Y TEMARIO ══ */}
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            {/* Identidad del Recurso */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 58 },
                  height: { xs: 48, sm: 58 },
                  borderRadius: '16px',
                  bgcolor: isDark ? alpha(iconColor, 0.16) : alpha(iconColor, 0.12),
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.6rem', sm: '2rem' },
                  border: `2px solid ${alpha(iconColor, 0.3)}`,
                  boxShadow: `0 6px 18px ${alpha(iconColor, 0.22)}`,
                  animation: `${bounceIcon} 1.5s ease-in-out infinite`,
                  flexShrink: 0,
                }}
              >
                {material.tipo_material_icono || '📄'}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.35rem', sm: '1.75rem', md: '2.1rem' },
                    fontWeight: 800,
                    background: gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.18,
                    mb: 0.6,
                  }}
                >
                  {material.titulo}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                  {material.materia_nombre && (
                    <Chip
                      label={`${material.materia_nombre}${material.grado_nombre ? ` · ${material.grado_nombre}` : ''}`}
                      size="small"
                      sx={{
                        background: gradBg,
                        color: isDark ? '#000' : '#fff',
                        fontWeight: 700,
                        fontSize: 11,
                        height: 22,
                      }}
                    />
                  )}
                  <Chip
                    label={material.tipo_material_nombre || 'Material'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      height: 22,
                      bgcolor: isDark ? alpha(iconColor, 0.18) : alpha(iconColor, 0.12),
                      color: iconColor,
                      border: `1px solid ${alpha(iconColor, 0.25)}`,
                    }}
                  />
                  <Chip
                    label={isPublished ? 'Publicado' : 'Borrador'}
                    icon={isPublished
                      ? <PublishedIcon sx={{ fontSize: '12px !important', color: '#16a34a !important' }} />
                      : <DraftIcon sx={{ fontSize: '12px !important' }} />}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      height: 22,
                      bgcolor: isPublished ? alpha('#16a34a', 0.12) : alpha('#94a3b8', 0.12),
                      color: isPublished ? '#16a34a' : '#64748b',
                      border: `1px solid ${isPublished ? alpha('#16a34a', 0.25) : alpha('#94a3b8', 0.25)}`,
                    }}
                  />
                  {material.codigo_material && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'text.disabled',
                        fontSize: 11,
                        px: 0.5,
                      }}
                    >
                      {material.codigo_material}
                    </Typography>
                  )}
                  {material.es_destacado && (
                    <Chip
                      label="⭐ Destacado"
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: 10.5,
                        height: 22,
                        bgcolor: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.12)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Acciones principales del docente */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {!esDocente && matriculaId && (
                <Tooltip title={esFavorito(material.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                  <IconButton
                    onClick={() => toggleFav(material.id)}
                    disabled={toggling === material.id}
                    sx={{
                      borderRadius: '11px',
                      border: `1px solid ${alpha(esFavorito(material.id) ? '#ef4444' : (isDark ? '#fff' : '#000'), 0.15)}`,
                      color: esFavorito(material.id) ? '#ef4444' : 'text.secondary',
                      bgcolor: esFavorito(material.id) ? alpha('#ef4444', 0.1) : 'transparent',
                    }}
                  >
                    {esFavorito(material.id) ? <FavIcon sx={{ fontSize: 18 }} /> : <FavBorderIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              )}

              {esDocente && !isPublished ? (
                <Button
                  variant="contained"
                  startIcon={<PublishIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setDlgPublicar(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 2,
                    py: 0.8,
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(22, 163, 74, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.18s ease',
                  }}
                >
                  Publicar ahora
                </Button>
              ) : esDocente && isPublished ? (
                <Button
                  variant="outlined"
                  onClick={handleDespublicar}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 2,
                    py: 0.8,
                    borderColor: alpha('#94a3b8', 0.4),
                    color: 'text.secondary',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    '&:hover': {
                      borderColor: '#f59e0b',
                      color: '#f59e0b',
                      bgcolor: alpha('#f59e0b', 0.08),
                    },
                    transition: 'all 0.18s ease',
                  }}
                >
                  Pausar (Borrador)
                </Button>
              ) : null}

              {esDocente && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setDlgEditar(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 1.8,
                    py: 0.8,
                    borderColor: alpha(gold, 0.4),
                    color: gold,
                    bgcolor: alpha(gold, 0.05),
                    '&:hover': {
                      borderColor: gold,
                      bgcolor: alpha(gold, 0.12),
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.18s ease',
                  }}
                >
                  Editar
                </Button>
              )}

              {esDocente && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setDlgEliminar(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 1.8,
                    py: 0.8,
                    borderColor: alpha('#ef4444', 0.4),
                    color: '#ef4444',
                    bgcolor: alpha('#ef4444', 0.05),
                    '&:hover': {
                      borderColor: '#ef4444',
                      bgcolor: alpha('#ef4444', 0.12),
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.18s ease',
                  }}
                >
                  Eliminar
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* ══ TABS DE NAVEGACIÓN (ESTILO NOTAS / TEMARIO) ═══════ */}
      <Fade in timeout={380}>
        <Box sx={{
          display: 'inline-flex',
          gap: 1,
          p: 0.8,
          mb: 3,
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
          borderRadius: '16px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.07)}`,
          flexWrap: 'wrap',
        }}>
          {tabsConfig.map((tab, idx) => {
            const isSelected = activeTab === idx;
            return (
              <Box
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: '11px',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: isSelected ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  background: isSelected ? gradBg : 'transparent',
                  boxShadow: isSelected ? `0 4px 14px ${alpha(gold, 0.35)}` : 'none',
                  '&:hover': !isSelected ? {
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                    color: 'text.primary',
                  } : {},
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge != null && (
                  <Box
                    sx={{
                      fontSize: 10,
                      fontWeight: 800,
                      px: 0.7,
                      py: 0.15,
                      borderRadius: '6px',
                      bgcolor: isSelected
                        ? (isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)')
                        : alpha(gold, 0.15),
                      color: isSelected ? (isDark ? '#000' : '#fff') : gold,
                    }}
                  >
                    {tab.badge}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Fade>

      {/* ══ LAYOUT PRINCIPAL ════════════════════════════════ */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Columna Principal: Paneles de Contenido ────── */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Box sx={{ animation: `${fadeUp} 0.25s ease-out` }}>
            {/* Panel 0: Visor de Archivo */}
            {activeTab === 0 && (
              <Card
                sx={{
                  borderRadius: '18px',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  p: { xs: 1.5, sm: 2.5 },
                }}
              >
                <VisorArchivo
                  material={material}
                  matriculaId={matriculaId}
                  accent={gold}
                  accentDark={goldEnd}
                  isDark={isDark}
                />
              </Card>
            )}

            {/* Panel 1: Comentarios y Dudas */}
            {activeTab === 1 && (
              <Card
                sx={{
                  borderRadius: '18px',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  p: { xs: 1.5, sm: 2.5 },
                }}
              >
                <ComentariosPanel
                  materialId={material.id}
                  esDocente={esDocente}
                  accent={gold}
                  isDark={isDark}
                />
              </Card>
            )}

            {/* Panel 2: Estadísticas de Acceso (Solo Docente) */}
            {esDocente && activeTab === 2 && (
              <Card
                sx={{
                  borderRadius: '18px',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  p: { xs: 1.5, sm: 2.5 },
                }}
              >
                <EstadisticasPanel
                  materialId={material.id}
                  accent={gold}
                  isDark={isDark}
                />
              </Card>
            )}
          </Box>
        </Grid>

        {/* ── Columna Lateral: Información y Temas ───────── */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Stack spacing={2.5}>
            {/* Card 1: Métricas de Engagement Directas */}
            <Card
              sx={{
                borderRadius: '18px',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
                p: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 1.8,
                }}
              >
                Métricas del Recurso
              </Typography>

              <Grid container spacing={1.2}>
                {[
                  { label: 'Vistas', val: vistas, icon: <EyeIcon sx={{ fontSize: 18 }} />, color: '#0288d1' },
                  { label: 'Descargas', val: descargas, icon: <DlIcon sx={{ fontSize: 18 }} />, color: '#16a34a' },
                  { label: 'Comentarios', val: comentarios, icon: <ChatIcon sx={{ fontSize: 18 }} />, color: '#8b5cf6' },
                ].map(stat => (
                  <Grid size={{ xs: 4 }} key={stat.label}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '12px',
                        textAlign: 'center',
                        bgcolor: isDark ? alpha(stat.color, 0.08) : alpha(stat.color, 0.06),
                        border: `1px solid ${alpha(stat.color, 0.2)}`,
                      }}
                    >
                      <Box sx={{ color: stat.color, mb: 0.3, display: 'flex', justifyContent: 'center' }}>
                        {stat.icon}
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: stat.color, lineHeight: 1.1 }}>
                        {stat.val}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', mt: 0.3 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* Card 2: Información Técnica del Material */}
            <Card
              sx={{
                borderRadius: '18px',
                border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
                p: 2.2,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: gold,
                  mb: 2,
                }}
              >
                Detalles del Material
              </Typography>

              {/* Descripción */}
              {material.descripcion && (
                <Box sx={{ mb: 2, pb: 1.8, borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}` }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Descripción / Indicaciones
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    {material.descripcion}
                  </Typography>
                </Box>
              )}

              <Stack spacing={1.6}>
                {[
                  {
                    icon: <SchoolIcon sx={{ fontSize: 16 }} />,
                    label: 'Materia y Grado',
                    value: `${material.materia_nombre || 'Materia'} · ${material.grado_nombre || ''}`,
                  },
                  {
                    icon: <PersonIcon sx={{ fontSize: 16 }} />,
                    label: 'Docente Titular',
                    value: `${material.docente_nombres ?? ''} ${material.docente_apellidos ?? ''}`.trim() || 'Docente asignado',
                  },
                  {
                    icon: <FileIcon sx={{ fontSize: 16 }} />,
                    label: 'Formato / Peso',
                    value: material.es_enlace_externo
                      ? 'Enlace web externo'
                      : (material.tamano_bytes ? formatBytes(material.tamano_bytes) : (material.tipo_mime || 'Archivo digital')),
                  },
                  {
                    icon: <CalIcon sx={{ fontSize: 16 }} />,
                    label: 'Subido el',
                    value: material.created_at ? new Date(material.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                  },
                  {
                    icon: <TimeIcon sx={{ fontSize: 16 }} />,
                    label: 'Publicación',
                    value: material.fecha_publicacion
                      ? new Date(material.fecha_publicacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Borrador (No publicado)',
                  },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      bgcolor: isDark ? alpha(gold, 0.1) : alpha(gold, 0.08),
                      color: gold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {icon}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled', fontWeight: 600, lineHeight: 1.2 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }} noWrap>
                        {value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Card>

            {/* Card 3: Temas del Temario Vinculados */}
            {temas.length > 0 && (
              <Card
                sx={{
                  borderRadius: '18px',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
                  p: 2.2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8 }}>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: gold,
                    }}
                  >
                    Temas Vinculados
                  </Typography>
                  <Chip
                    label={`${temas.length} tema${temas.length > 1 ? 's' : ''}`}
                    size="small"
                    sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: alpha(gold, 0.1), color: gold }}
                  />
                </Box>

                <Stack spacing={1}>
                  {temas.map(t => (
                    <Box
                      key={t.tema_id}
                      sx={{
                        p: 1.2,
                        borderRadius: '11px',
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                        border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.05)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: alpha(gold, 0.05),
                          borderColor: alpha(gold, 0.25),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '7px',
                          bgcolor: alpha(gold, 0.15),
                          color: gold,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        U{t.numero_unidad}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>
                          {t.numero_tema}. {t.tema_titulo}
                        </Typography>
                        {t.es_principal && (
                          <Typography sx={{ fontSize: '0.64rem', color: gold, fontWeight: 800 }}>
                            ⭐ Tema principal
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* ════ MODAL: EDITAR MATERIAL ══════════════════════════ */}
      <Dialog
        open={dlgEditar}
        onClose={() => setDlgEditar(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            border: `1.5px solid ${alpha(gold, 0.3)}`,
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.6)'
              : '0 20px 50px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha(gold, 0.08) : alpha(gold, 0.04),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                background: gradBg,
                color: isDark ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <EditIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: gold }}>
                  Gestión de Recurso
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  Editar Información del Material
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDlgEditar(false)} size="small">
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
          <TextField
            label="Título del material *"
            fullWidth
            size="small"
            value={editTitulo}
            onChange={e => setEditTitulo(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <TextField
            label="Descripción o instrucciones"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={editDescripcion}
            onChange={e => setEditDescripcion(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <Box
            onClick={() => setEditDestacado(d => !d)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: '12px',
              cursor: 'pointer',
              bgcolor: editDestacado ? alpha('#f59e0b', 0.1) : (isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02)),
              border: `1.5px solid ${editDestacado ? '#f59e0b' : alpha(isDark ? '#fff' : '#000', 0.08)}`,
              transition: 'all 0.18s ease',
            }}
          >
            <StarIcon sx={{ color: editDestacado ? '#f59e0b' : 'text.disabled' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: editDestacado ? '#f59e0b' : 'text.primary' }}>
                Marcar como material destacado
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                Aparecerá en los primeros lugares y con insignia dorada para los estudiantes.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`, gap: 1 }}>
          <Button
            onClick={() => setDlgEditar(false)}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarEdicion}
            variant="contained"
            disabled={isSubmitting || !editTitulo.trim()}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              background: gradBg,
              color: isDark ? '#000' : '#fff',
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ MODAL: PUBLICAR MATERIAL ════════════════════════ */}
      <Dialog
        open={dlgPublicar}
        onClose={() => setDlgPublicar(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            border: `1.5px solid ${alpha('#16a34a', 0.3)}`,
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.6)'
              : '0 20px 50px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: alpha('#16a34a', 0.06),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                bgcolor: '#16a34a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PublishIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a' }}>
                  Publicación Inmediata
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  Publicar Material
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDlgPublicar(false)} size="small">
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Al publicar este material, estará disponible de inmediato para todos los estudiantes de la materia.
          </Typography>
          <TextField
            label="Programar fecha y hora (opcional)"
            type="datetime-local"
            size="small"
            fullWidth
            value={fechaPub}
            onChange={e => setFechaPub(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Déjalo vacío para publicar inmediatamente."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`, gap: 1 }}>
          <Button
            onClick={() => setDlgPublicar(false)}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePublicar}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#16a34a',
              color: '#fff',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            {isSubmitting ? <CircularProgress size={16} color="inherit" /> : 'Publicar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ MODAL: ELIMINAR MATERIAL ════════════════════════ */}
      <Dialog
        open={dlgEliminar}
        onClose={() => setDlgEliminar(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.6)'
              : '0 20px 50px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: alpha('#ef4444', 0.06),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                bgcolor: '#ef4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <DeleteIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ef4444' }}>
                  Acción Permanente
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  ¿Eliminar Material?
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDlgEliminar(false)} size="small">
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
            Se eliminará definitivamente <strong>"{material.titulo}"</strong> junto con sus archivos adjuntos, comentarios y registros de acceso. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`, gap: 1 }}>
          <Button
            onClick={() => setDlgEliminar(false)}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminar}
            variant="contained"
            color="error"
            disabled={isSubmitting}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialDetalleView;
