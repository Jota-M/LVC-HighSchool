'use client';
// components/materiales/MaterialDetalleView.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, IconButton,
  Chip, alpha, useTheme, Skeleton, Tooltip, Button,
  Fade, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Favorite as FavIcon,
  FavoriteBorder as FavBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as PublishedIcon,
  PauseCircle as DraftIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalIcon,
  Visibility as EyeIcon,
  CloudDownload as DlIcon,
  Bookmark as BookmarkIcon,
  Chat as ChatIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  useMaterialDetalle,
  useFavoritosMaterial,
  useMateriales,
} from '@/hooks/useMaterial';
import { VisorArchivo }     from './VisorArchivo';
import { ComentariosPanel } from './ComentariosPanel';
import { EstadisticasPanel } from './EstadisticasPanel';

// ── Tab pill ──────────────────────────────────────────────────────────────────
const TAB_CONFIG = [
  { label: 'Archivo',             icon: <BookmarkIcon sx={{ fontSize: 14 }} /> },
  { label: 'Comentarios',         icon: <ChatIcon     sx={{ fontSize: 14 }} /> },
  { label: 'Estadísticas',        icon: <StatsIcon    sx={{ fontSize: 14 }} /> },
];

interface MaterialDetalleViewProps {
  materialId:   number;
  esDocente:    boolean;
  matriculaId?: number;
}

const MaterialDetalleView: React.FC<MaterialDetalleViewProps> = ({
  materialId, esDocente, matriculaId,
}) => {
  const theme  = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const accent     = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [activeTab, setActiveTab]     = useState(0);
  const [dlgEliminar, setDlgEliminar] = useState(false);
  const [dlgPublicar, setDlgPublicar] = useState(false);
  const [fechaPub, setFechaPub]       = useState('');

  const { material, temas, isLoading, registrarAcceso } = useMaterialDetalle(materialId);
  const { esFavorito, toggle: toggleFav, toggling }     = useFavoritosMaterial(matriculaId ?? null);
  const { eliminar, publicar, isSubmitting }             = useMateriales();

  useEffect(() => {
    registrarAcceso({ tipo_accion: 'visualizacion', matricula_id: matriculaId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const handleEliminar = async () => {
    const ok = await eliminar(materialId);
    if (ok) router.back();
  };

  const handlePublicar = async () => {
    await publicar(materialId, { fecha_publicacion: fechaPub || new Date().toISOString() });
    setDlgPublicar(false);
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (isLoading || !material) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 4, alignItems: 'center' }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="rounded" width={200} height={20} />
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" height={480} sx={{ borderRadius: '12px', mb: 2 }} />
          </Box>
          <Skeleton variant="rounded" width={280} height={340} sx={{ borderRadius: '12px', flexShrink: 0 }} />
        </Box>
      </Container>
    );
  }

  const isPublished =
    !!material.fecha_publicacion &&
    new Date(material.fecha_publicacion) <= new Date() &&
    (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date());

  const iconColor = material.tipo_material_color || accent;
  const tabs = esDocente ? TAB_CONFIG : TAB_CONFIG.slice(0, 2);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>

        {/* ══ BREADCRUMB / BACK ════════════════════════════════ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <IconButton
            onClick={() => router.back()}
            size="small"
            sx={{
              width: 32,
              height: 32,
              bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
              borderRadius: '8px',
              '&:hover': { bgcolor: alpha(accent, 0.1), color: accent },
            }}
          >
            <BackIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
            Materiales
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>·</Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}
            noWrap
          >
            {material.titulo}
          </Typography>
        </Box>

        {/* ══ HEADER EDITORIAL ════════════════════════════════ */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mb: 5,
            pb: 4,
            borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            flexWrap: 'wrap',
          }}
        >
          {/* Icono grande */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '14px',
              bgcolor: alpha(iconColor, 0.1),
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              flexShrink: 0,
              border: `1px solid ${alpha(iconColor, 0.2)}`,
            }}
          >
            {material.tipo_material_icono || '📄'}
          </Box>

          {/* Título + meta */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Fila de badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                }}
              >
                {material.codigo_material}
              </Typography>

              <Chip
                size="small"
                label={isPublished ? 'Publicado' : 'Borrador'}
                icon={isPublished
                  ? <PublishedIcon sx={{ fontSize: '10px !important', color: '#16a34a !important' }} />
                  : <DraftIcon    sx={{ fontSize: '10px !important' }} />}
                sx={{
                  height: 18, fontSize: '0.6rem', fontWeight: 600, borderRadius: '4px',
                  bgcolor: isPublished ? alpha('#16a34a', 0.08) : alpha('#6b7280', 0.08),
                  color:   isPublished ? '#16a34a' : '#6b7280',
                }}
              />

              {material.tipo_material_nombre && (
                <Chip
                  size="small"
                  label={material.tipo_material_nombre}
                  sx={{
                    height: 18, fontSize: '0.6rem', fontWeight: 600, borderRadius: '4px',
                    bgcolor: alpha(iconColor, 0.08),
                    color: iconColor,
                  }}
                />
              )}

              {material.es_destacado && (
                <StarIcon sx={{ color: '#f59e0b', fontSize: 14 }} />
              )}
            </Box>

            {/* Título principal */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                mb: 0.75,
              }}
            >
              {material.titulo}
            </Typography>

            {material.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: 600 }}>
                {material.descripcion}
              </Typography>
            )}

            {/* Stats rápidas inline */}
            <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
              {[
                { icon: <EyeIcon sx={{ fontSize: 13 }} />,  val: material.total_vistas ?? 0,      label: 'vistas' },
                { icon: <DlIcon  sx={{ fontSize: 13 }} />,  val: material.total_descargas ?? 0,   label: 'descargas' },
                { icon: <ChatIcon sx={{ fontSize: 13 }} />, val: material.total_comentarios ?? 0, label: 'comentarios' },
              ].map(({ icon, val, label }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ color: alpha(accent, 0.6) }}>{icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    {val}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Acciones */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexShrink: 0 }}>
            {!esDocente && matriculaId && (
              <Tooltip title={esFavorito(material.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                <IconButton
                  onClick={() => toggleFav(material.id)}
                  disabled={toggling === material.id}
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(esFavorito(material.id) ? '#ef4444' : '#000', 0.12)}`,
                    borderRadius: '8px',
                    color: esFavorito(material.id) ? '#ef4444' : 'text.disabled',
                  }}
                >
                  {esFavorito(material.id) ? <FavIcon sx={{ fontSize: 16 }} /> : <FavBorderIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
            )}

            {esDocente && !isPublished && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PublishIcon sx={{ fontSize: 14 }} />}
                onClick={() => setDlgPublicar(true)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: '#16a34a',
                  color: '#fff',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#15803d', boxShadow: 'none' },
                }}
              >
                Publicar
              </Button>
            )}

            {esDocente && (
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => router.push(`/dashboard/docente/materiales/${material.id}/editar`)}
                  sx={{
                    border: `1px solid ${alpha('#000', 0.1)}`,
                    borderRadius: '8px',
                    '&:hover': { bgcolor: alpha(accent, 0.08), borderColor: alpha(accent, 0.3), color: accent },
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}

            {esDocente && (
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={() => setDlgEliminar(true)}
                  sx={{
                    border: `1px solid ${alpha('#000', 0.1)}`,
                    borderRadius: '8px',
                    color: 'text.disabled',
                    '&:hover': { bgcolor: alpha('#ef4444', 0.06), borderColor: alpha('#ef4444', 0.3), color: '#ef4444' },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* ══ LAYOUT PRINCIPAL ════════════════════════════════ */}
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          {/* ── Columna principal ─────────────────────────── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Tabs */}
            <Box
              sx={{
                display: 'inline-flex',
                gap: 0.5,
                mb: 3,
                p: 0.5,
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                borderRadius: '10px',
              }}
            >
              {tabs.map((tab, idx) => (
                <Box
                  key={tab.label}
                  onClick={() => setActiveTab(idx)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2,
                    py: 0.75,
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                    color: activeTab === idx ? (isDark ? '#000' : '#fff') : 'text.secondary',
                    bgcolor: activeTab === idx ? accent : 'transparent',
                    boxShadow: activeTab === idx ? `0 2px 8px ${alpha(accent, 0.25)}` : 'none',
                    '&:hover': activeTab !== idx
                      ? { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) }
                      : {},
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </Box>
              ))}
            </Box>

            {/* Panel Archivo */}
            {activeTab === 0 && (
              <Fade in timeout={200}>
                <Box>
                  <VisorArchivo
                    material={material}
                    matriculaId={matriculaId}
                    accent={accent}
                    accentDark={accentDark}
                    isDark={isDark}
                  />
                </Box>
              </Fade>
            )}

            {/* Panel Comentarios */}
            {activeTab === 1 && (
              <Fade in timeout={200}>
                <Box>
                  <ComentariosPanel
                    materialId={material.id}
                    esDocente={esDocente}
                    accent={accent}
                    isDark={isDark}
                  />
                </Box>
              </Fade>
            )}

            {/* Panel Estadísticas (solo docente) */}
            {esDocente && activeTab === 2 && (
              <Fade in timeout={200}>
                <Box>
                  <EstadisticasPanel
                    materialId={material.id}
                    accent={accent}
                    isDark={isDark}
                  />
                </Box>
              </Fade>
            )}
          </Box>

          {/* ── Sidebar ───────────────────────────────────── */}
          <Box
            sx={{
              width: { xs: '100%', lg: 260 },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Info del material */}
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  mb: 2,
                }}
              >
                Información
              </Typography>

              <Stack spacing={1.5}>
                {[
                  { icon: <BookmarkIcon sx={{ fontSize: 13 }} />, label: 'Tipo',      value: material.tipo_material_nombre },
                  { icon: <SchoolIcon   sx={{ fontSize: 13 }} />, label: 'Materia',   value: material.materia_nombre },
                  { icon: <SchoolIcon   sx={{ fontSize: 13 }} />, label: 'Grado',     value: material.grado_nombre },
                  { icon: <PersonIcon   sx={{ fontSize: 13 }} />, label: 'Docente',   value: `${material.docente_nombres ?? ''} ${material.docente_apellidos ?? ''}`.trim() },
                  { icon: <CalIcon      sx={{ fontSize: 13 }} />, label: 'Subido',    value: material.created_at ? new Date(material.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '' },
                ].map(({ icon, label, value }) => value && (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ color: alpha(accent, 0.6), mt: 0.1, flexShrink: 0 }}>{icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', lineHeight: 1.2 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3 }} noWrap>
                        {value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Temas vinculados */}
            {temas.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'text.disabled',
                    mb: 2,
                  }}
                >
                  Temas del temario
                </Typography>
                <Stack spacing={0.75}>
                  {temas.map(t => (
                    <Box
                      key={t.tema_id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.75,
                        px: 1,
                        borderRadius: '6px',
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          bgcolor: alpha(accent, 0.1),
                          color: accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {t.numero_unidad}
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, flex: 1 }} noWrap>
                        {t.numero_tema}. {t.tema_titulo}
                      </Typography>
                      {t.es_principal && (
                        <Chip
                          label="Principal"
                          size="small"
                          sx={{
                            height: 14,
                            fontSize: '0.5rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            bgcolor: alpha(accent, 0.08),
                            color: accent,
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* ════ Dialog Eliminar ════════════════════════════════ */}
      <Dialog
        open={dlgEliminar}
        onClose={() => setDlgEliminar(false)}
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Eliminar material?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Se eliminará <strong>"{material.titulo}"</strong> y su archivo de la nube de forma permanente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDlgEliminar(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminar} variant="contained" color="error" disabled={isSubmitting}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', boxShadow: 'none' }}
          >
            {isSubmitting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Dialog Publicar ════════════════════════════════ */}
      <Dialog
        open={dlgPublicar}
        onClose={() => setDlgPublicar(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Publicar material</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Los estudiantes podrán ver este material inmediatamente.
          </Typography>
          <TextField
            label="Programar publicación (opcional)"
            type="datetime-local"
            size="small" fullWidth
            value={fechaPub}
            onChange={e => setFechaPub(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Déjalo vacío para publicar ahora."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDlgPublicar(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePublicar} variant="contained" disabled={isSubmitting}
            sx={{
              borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              bgcolor: '#16a34a', color: '#fff', boxShadow: 'none',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            {isSubmitting ? <CircularProgress size={14} color="inherit" /> : 'Publicar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialDetalleView;