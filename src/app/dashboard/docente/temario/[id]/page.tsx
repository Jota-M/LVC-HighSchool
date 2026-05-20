'use client';
// app/dashboard/docente/temario/[id]/page.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, Chip, Fade, Collapse, Skeleton,
  IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Tooltip, CircularProgress,
  Stack, LinearProgress, alpha, useTheme, keyframes,
} from '@mui/material';
import {
  AutoStories as AutoStoriesIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  Link as LinkIcon,
  AccessTime as ClockIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { asistenciaService, AsignacionDocente } from '@/services/asistenciaService';
import {
  useTemario,
  useUnidadesTematicas,
  useTemas,
} from '@/hooks/useMaterial';
import {
  NIVELES_DIFICULTAD,
  NivelDificultad,
  CrearUnidadTematicaDTO,
  ActualizarUnidadTematicaDTO,
  CrearTemaDTO,
  ActualizarTemaDTO,
  TemarioItem,
} from '@/types/materialTypes';
import { toast } from 'react-hot-toast';

// ── Animaciones ───────────────────────────────────────────
const bounceIcon = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

// ── Paleta ────────────────────────────────────────────────
const PALETTES = [
  { main: '#6366f1', end: '#8b5cf6' },
  { main: '#0ea5e9', end: '#06b6d4' },
  { main: '#10b981', end: '#059669' },
  { main: '#f59e0b', end: '#ef4444' },
  { main: '#ec4899', end: '#a855f7' },
  { main: '#14b8a6', end: '#0891b2' },
];

interface GrupoUnidad {
  unidad: {
    unidad_id: number;
    numero_unidad: number;
    unidad_titulo: string;
    unidad_descripcion?: string;
  };
  temas: TemarioItem[];
}

// ── Dialog reutilizable de campo ─────────────────────────
const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
      {label.toUpperCase()}
    </Typography>
    {children}
  </Box>
);

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

// ── Card de Tema ──────────────────────────────────────────
const TemaRow: React.FC<{
  tema: TemarioItem;
  index: number;
  isDark: boolean;
  accent: string;
  onEdit: () => void;
  onDelete: () => void;
  submitting: boolean;
}> = ({ tema, index, isDark, accent, onEdit, onDelete, submitting }) => {
  const nivelInfo = NIVELES_DIFICULTAD.find(n => n.value === tema.nivel_dificultad);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        py: 1.5,
        px: 2,
        borderRadius: '14px',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
        transition: 'all 0.2s ease',
        animation: `${cardIn} 0.3s ease-out ${index * 0.05}s both`,
        '&:hover': {
          border: `1.5px solid ${alpha(accent, 0.3)}`,
          bgcolor: isDark ? alpha(accent, 0.05) : alpha(accent, 0.03),
          boxShadow: `0 4px 16px ${alpha(accent, 0.08)}`,
        },
      }}
    >
      {/* Número */}
      <Box sx={{
        minWidth: 32, height: 32,
        borderRadius: '10px',
        bgcolor: alpha(accent, 0.12),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Typography variant="caption" fontWeight={900} sx={{ color: accent, fontSize: '0.78rem' }}>
          {tema.numero_tema}
        </Typography>
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap sx={{ mb: 0.4 }}>
          {tema.tema_titulo}
        </Typography>
        {tema.tema_descripcion && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mb: 0.6 }}>
            {tema.tema_descripcion}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', flexWrap: 'wrap' }}>
          {nivelInfo && (
            <Chip
              label={nivelInfo.label}
              size="small"
              sx={{
                height: 18, fontSize: '0.6rem', fontWeight: 700,
                bgcolor: nivelInfo.bgColor, color: nivelInfo.color,
              }}
            />
          )}
          <Chip
            icon={<LinkIcon sx={{ fontSize: '10px !important' }} />}
            label={`${tema.total_materiales} material${tema.total_materiales !== 1 ? 'es' : ''}`}
            size="small"
            sx={{
              height: 18, fontSize: '0.6rem', fontWeight: 600,
              bgcolor: alpha(accent, 0.08), color: accent,
            }}
          />
        </Box>
      </Box>

      {/* Acciones */}
      <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0, alignItems: 'center' }}>
        <Tooltip title="Editar tema">
          <IconButton size="small" onClick={onEdit} disabled={submitting}
            sx={{ color: accent, opacity: 0.6, '&:hover': { opacity: 1, bgcolor: alpha(accent, 0.1) }, p: 0.5 }}>
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar tema">
          <IconButton size="small" color="error" onClick={onDelete} disabled={submitting}
            sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, p: 0.5 }}>
            <DeleteIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ── Card de Unidad (tab panel) ────────────────────────────
const UnidadPanel: React.FC<{
  grupo: GrupoUnidad;
  isDark: boolean;
  accent: string;
  accentEnd: string;
  onEditUnidad: (grupo: GrupoUnidad) => void;
  onDeleteUnidad: (id: number) => void;
  onAddTema: (unidadId: number) => void;
  onEditTema: (tema: TemarioItem) => void;
  onDeleteTema: (id: number) => void;
  submittingUnidad: boolean;
  submittingTema: boolean;
}> = ({
  grupo, isDark, accent, accentEnd,
  onEditUnidad, onDeleteUnidad,
  onAddTema, onEditTema, onDeleteTema,
  submittingUnidad, submittingTema,
}) => {
  const { unidad, temas } = grupo;
  const gradient = `linear-gradient(135deg, ${accent}, ${accentEnd})`;

  return (
    <Box sx={{ animation: `${fadeUp} 0.3s ease-out` }}>
      {/* Header de unidad */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', gap: 2,
        p: 2.5, mb: 2,
        borderRadius: '18px',
        bgcolor: isDark ? alpha(accent, 0.08) : alpha(accent, 0.05),
        border: `1.5px solid ${alpha(accent, 0.2)}`,
      }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: '14px',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 20px ${alpha(accent, 0.3)}`,
          flexShrink: 0,
        }}>
          <Typography fontWeight={900} sx={{ color: isDark ? '#000' : '#fff', fontSize: '1.1rem' }}>
            {unidad.numero_unidad}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3, color: accent }}>
            {unidad.unidad_titulo}
          </Typography>
          {unidad.unidad_descripcion && (
            <Typography
  variant="body2"
  color="text.secondary"
  sx={{
    mt: 0.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
  }}
>
  {unidad.unidad_descripcion}
</Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              icon={<BookmarkIcon sx={{ fontSize: '11px !important' }} />}
              label={`${temas.length} tema${temas.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(accent, 0.12), color: accent }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar unidad">
            <IconButton
              size="small"
              onClick={() => onEditUnidad(grupo)}
              disabled={submittingUnidad}
              sx={{
                color: accent, opacity: 0.7,
                '&:hover': { opacity: 1, bgcolor: alpha(accent, 0.1) },
              }}
            >
              <EditIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar unidad">
            <IconButton
              size="small" color="error"
              onClick={() => onDeleteUnidad(unidad.unidad_id)}
              disabled={submittingUnidad}
              sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
            >
              <DeleteIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Lista de temas */}
      {temas.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 6,
          borderRadius: '16px',
          border: `2px dashed ${alpha(accent, 0.2)}`,
          bgcolor: isDark ? alpha(accent, 0.03) : alpha(accent, 0.02),
        }}>
          <FolderOpenIcon sx={{ fontSize: 40, color: alpha(accent, 0.35), mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
            Esta unidad no tiene temas aún
          </Typography>
          <Button
            size="small" startIcon={<AddIcon />}
            onClick={() => onAddTema(unidad.unidad_id)}
            sx={{
              mt: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
              color: accent, border: `1px solid ${alpha(accent, 0.35)}`,
              '&:hover': { bgcolor: alpha(accent, 0.07) },
            }}
          >
            Agregar primer tema
          </Button>
        </Box>
      ) : (
        <Stack spacing={1}>
          {temas.map((tema, idx) => (
            <TemaRow
              key={tema.tema_id}
              tema={tema}
              index={idx}
              isDark={isDark}
              accent={accent}
              onEdit={() => onEditTema(tema)}
              onDelete={() => onDeleteTema(tema.tema_id)}
              submitting={submittingTema}
            />
          ))}
        </Stack>
      )}

      {/* Botón agregar tema al pie */}
      {temas.length > 0 && (
        <Button
          size="small" startIcon={<AddIcon />}
          onClick={() => onAddTema(unidad.unidad_id)}
          sx={{
            mt: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
            color: accent, fontSize: '0.8rem',
            '&:hover': { bgcolor: alpha(accent, 0.07) },
          }}
        >
          Agregar tema
        </Button>
      )}
    </Box>
  );
};

// ── Página principal ──────────────────────────────────────
export default function DocenteTemarioDetailPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();
  const asignacionId = Number(params.id);

  // ── Asignación seleccionada ───────────────────────────
  const [asignacion, setAsignacion]     = useState<AsignacionDocente | null>(null);
  const [loadingAsig, setLoadingAsig]   = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await asistenciaService.getMisAsignaciones();
        const found = res.data.asignaciones.find(
          (a: AsignacionDocente) => a.asignacion_id === asignacionId
        );
        if (!found) { router.replace('/dashboard/docente/temario'); return; }
        setAsignacion(found);
      } catch {
        router.replace('/dashboard/docente/temario');
      } finally {
        setLoadingAsig(false);
      }
    };
    cargar();
  }, [asignacionId]);

  // Paleta dinámica según índice de materia (se puede mejorar)
  const paletteIdx = asignacionId % PALETTES.length;
  const palette    = PALETTES[paletteIdx];
  const isDarkMode = isDark;
  const accent     = isDarkMode ? '#facc15' : palette.main;
  const accentEnd  = isDarkMode ? '#f59e0b' : palette.end;
  const gradient   = `linear-gradient(135deg, ${accent}, ${accentEnd})`;

  // ── Temario ───────────────────────────────────────────
  const gradoMateriaId = asignacion?.grado_materia_id ?? null;
  const { porUnidad, isLoading: loadingTemario, refrescar } = useTemario(gradoMateriaId);

  // ── Tab activo = unidad ───────────────────────────────
  const [tabActivo, setTabActivo] = useState(0);

  const grupos = porUnidad as GrupoUnidad[];
  const grupoActivo = grupos[tabActivo] ?? null;

  // ── Hooks CRUD ────────────────────────────────────────
  const { crear: crearUnidad, actualizar: actualizarUnidad, eliminar: eliminarUnidad, isSubmitting: submittingUnidad } =
    useUnidadesTematicas({ grado_materia_id: gradoMateriaId ?? undefined, activo: true });

  const { crear: crearTema, actualizar: actualizarTema, eliminar: eliminarTema, isSubmitting: submittingTema } =
    useTemas({});

  // ── Dialog Unidad ─────────────────────────────────────
  const [dlgUnidad, setDlgUnidad]       = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<GrupoUnidad | null>(null);
  const [fUnidad, setFUnidad]           = useState<Partial<CrearUnidadTematicaDTO & { activo?: boolean }>>({});

  const abrirNuevaUnidad = () => {
    setEditingUnidad(null);
    setFUnidad({});
    setDlgUnidad(true);
  };
  const abrirEditarUnidad = (grupo: GrupoUnidad) => {
    setEditingUnidad(grupo);
    setFUnidad({
      numero_unidad: grupo.unidad.numero_unidad,
      titulo:        grupo.unidad.unidad_titulo,
      descripcion:   grupo.unidad.unidad_descripcion,
    });
    setDlgUnidad(true);
  };
  const submitUnidad = async () => {
    if (!gradoMateriaId || !fUnidad.numero_unidad || !fUnidad.titulo) return;
    let ok = false;
    if (editingUnidad) {
      ok = await actualizarUnidad(editingUnidad.unidad.unidad_id, {
        numero_unidad: fUnidad.numero_unidad,
        titulo:        fUnidad.titulo!,
        descripcion:   fUnidad.descripcion,
      });
    } else {
      ok = await crearUnidad({
        grado_materia_id: gradoMateriaId,
        numero_unidad:    fUnidad.numero_unidad!,
        titulo:           fUnidad.titulo!,
        descripcion:      fUnidad.descripcion,
        objetivos:        fUnidad.objetivos,
      });
    }
    if (ok) { setDlgUnidad(false); setFUnidad({}); setEditingUnidad(null); refrescar(); }
  };

  // ── Dialog Tema ───────────────────────────────────────
  const [dlgTema, setDlgTema]         = useState(false);
  const [unidadParaTema, setUnidadParaTema] = useState<number | null>(null);
  const [editingTema, setEditingTema]   = useState<TemarioItem | null>(null);
  const [fTema, setFTema]             = useState<Partial<CrearTemaDTO>>({});

  const abrirNuevoTema = (unidadId: number) => {
    setUnidadParaTema(unidadId);
    setEditingTema(null);
    setFTema({});
    setDlgTema(true);
  };
  const abrirEditarTema = (tema: TemarioItem) => {
    setUnidadParaTema(null);
    setEditingTema(tema);
    setFTema({
      numero_tema:       tema.numero_tema,
      titulo:            tema.tema_titulo,
      descripcion:       tema.tema_descripcion,
      nivel_dificultad:  tema.nivel_dificultad,
    });
    setDlgTema(true);
  };
  const submitTema = async () => {
    if (!fTema.numero_tema || !fTema.titulo) return;
    let ok = false;
    if (editingTema) {
      ok = await actualizarTema(editingTema.tema_id, {
        numero_tema:      fTema.numero_tema,
        titulo:           fTema.titulo!,
        descripcion:      fTema.descripcion,
        nivel_dificultad: fTema.nivel_dificultad,
        duracion_estimada: fTema.duracion_estimada,
      });
    } else if (unidadParaTema) {
      ok = await crearTema({
        unidad_tematica_id: unidadParaTema,
        numero_tema:        fTema.numero_tema!,
        titulo:             fTema.titulo!,
        descripcion:        fTema.descripcion,
        nivel_dificultad:   fTema.nivel_dificultad,
        duracion_estimada:  fTema.duracion_estimada,
        es_obligatorio:     true,
      });
    }
    if (ok) { setDlgTema(false); setFTema({}); setEditingTema(null); refrescar(); }
  };

  const handleDeleteTema = async (id: number) => {
    const ok = await eliminarTema(id);
    if (ok) refrescar();
  };
  const handleDeleteUnidad = async (id: number) => {
    const ok = await eliminarUnidad(id);
    if (ok) { setTabActivo(0); refrescar(); }
  };

  // ── Loading inicial ───────────────────────────────────
  if (loadingAsig) {
    return (
      <Box sx={{ py: 4 }}>
        <LinearProgress sx={{ borderRadius: 4, height: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 1 }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 4 }}>
          {/* Volver */}
          <Box
            onClick={() => router.push('/dashboard/docente/temario')}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.6, mb: 2.5,
              cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
              transition: 'color 0.15s',
              '&:hover': { color: accent },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Volver a mis materias
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 54, height: 54, borderRadius: '16px',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 28px ${alpha(accent, 0.35)}`,
                animation: `${bounceIcon} 2s ease-in-out infinite`,
                flexShrink: 0,
              }}>
                <AutoStoriesIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {asignacion?.materia_nombre ?? '—'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${asignacion?.grado_nombre} "${asignacion?.paralelo_nombre}"`}
                    size="small"
                    sx={{
                      background: gradient,
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 700, fontSize: '0.7rem',
                    }}
                  />
                  {asignacion?.turno_nombre && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      · {asignacion.turno_nombre}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    · {grupos.length} unidad{grupos.length !== 1 ? 'es' : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Botón nueva unidad */}
            <Button
              startIcon={<AddIcon />}
              onClick={abrirNuevaUnidad}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13,
                background: gradient,
                color: isDark ? '#000' : '#fff',
                px: 2.5, py: 1,
                boxShadow: `0 4px 16px ${alpha(accent, 0.3)}`,
                transition: 'all 0.2s ease',
                '&:hover': { opacity: 0.88, transform: 'translateY(-2px)' },
                alignSelf: 'flex-start',
              }}
            >
              Nueva Unidad
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* ── CARGANDO TEMARIO ─────────────────────────────── */}
      {loadingTemario && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2].map(i => (
            <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: '16px' }} />
          ))}
        </Box>
      )}

      {/* ── SIN UNIDADES ─────────────────────────────────── */}
      {!loadingTemario && grupos.length === 0 && (
        <Fade in timeout={400}>
          <Box sx={{
            textAlign: 'center', py: 12,
            borderRadius: '24px',
            border: `2px dashed ${alpha(accent, 0.2)}`,
            bgcolor: isDark ? alpha(accent, 0.03) : alpha(accent, 0.02),
          }}>
            <AutoStoriesIcon sx={{ fontSize: 60, color: alpha(accent, 0.3), mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={700} gutterBottom>
              El temario está vacío
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Creá la primera unidad temática para organizar los temas.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirNuevaUnidad}
              sx={{
                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                background: gradient, color: isDark ? '#000' : '#fff',
                px: 3, py: 1.2,
              }}
            >
              Crear primera unidad
            </Button>
          </Box>
        </Fade>
      )}

      {/* ── TABS + CONTENIDO ─────────────────────────────── */}
      {!loadingTemario && grupos.length > 0 && (
        <Fade in timeout={400}>
          <Box>
            {/* Tabs de unidades */}
            <Box sx={{
              mb: 3,
              background: gradient,
              borderRadius: '18px',
              p: 1,
            }}>
              <Tabs
                value={tabActivo}
                onChange={(_, v) => setTabActivo(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    minHeight: 50,
                    fontSize: '0.82rem',
                    color: isDark ? alpha('#000', 0.6) : alpha('#fff', 0.75),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: isDark ? '#000' : '#fff',
                      bgcolor: isDark ? alpha('#000', 0.08) : alpha('#fff', 0.12),
                    },
                  },
                  '& .Mui-selected': {
                    color: `${isDark ? '#000' : '#fff'} !important`,
                    bgcolor: isDark ? alpha('#000', 0.18) : alpha('#fff', 0.2),
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: isDark ? '#000' : '#fff',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                {grupos.map((g, i) => (
                  <Tab
                    key={g.unidad.unidad_id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 22, height: 22, borderRadius: '7px',
                          bgcolor: tabActivo === i
                            ? isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25)
                            : isDark ? alpha('#000', 0.15) : alpha('#fff', 0.15),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 900,
                          color: isDark ? '#000' : '#fff',
                          flexShrink: 0,
                        }}>
                          {g.unidad.numero_unidad}
                        </Box>
                        <Box component="span" sx={{
                          maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {g.unidad.unidad_titulo}
                        </Box>
                        {g.temas.length > 0 && (
                          <Box sx={{
                            fontSize: '0.6rem', fontWeight: 800,
                            bgcolor: isDark ? alpha('#000', 0.3) : alpha('#fff', 0.3),
                            color: isDark ? '#000' : '#fff',
                            borderRadius: '6px', px: 0.7, py: 0.1,
                            lineHeight: 1.5, minWidth: 16, textAlign: 'center',
                          }}>
                            {g.temas.length}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Sub-header con refresh */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
              <Box
                onClick={() => refrescar()}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  fontSize: 12, fontWeight: 600, color: 'text.disabled',
                  cursor: 'pointer', transition: 'color 0.15s',
                  '&:hover': { color: accent },
                }}
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
                Refrescar
              </Box>
            </Box>

            {/* Panel activo */}
            <Fade in timeout={300} key={tabActivo}>
              <Box>
                {grupoActivo && (
                  <UnidadPanel
                    grupo={grupoActivo}
                    isDark={isDark}
                    accent={accent}
                    accentEnd={accentEnd}
                    onEditUnidad={abrirEditarUnidad}
                    onDeleteUnidad={handleDeleteUnidad}
                    onAddTema={abrirNuevoTema}
                    onEditTema={abrirEditarTema}
                    onDeleteTema={handleDeleteTema}
                    submittingUnidad={submittingUnidad}
                    submittingTema={submittingTema}
                  />
                )}
              </Box>
            </Fade>
          </Box>
        </Fade>
      )}

      {/* ════ Dialog: Unidad (crear / editar) ════════════ */}
      <Dialog
        open={dlgUnidad}
        onClose={() => { setDlgUnidad(false); setEditingUnidad(null); setFUnidad({}); }}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '22px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
          {editingUnidad ? 'Editar Unidad Temática' : 'Nueva Unidad Temática'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ width: 90 }}>
              <FieldRow label="Número">
                <TextField
                  type="number" size="small" fullWidth sx={inputSx}
                  value={fUnidad.numero_unidad ?? ''}
                  onChange={e => setFUnidad(p => ({ ...p, numero_unidad: parseInt(e.target.value) }))}
                />
              </FieldRow>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldRow label="Título *">
                <TextField
                  size="small" fullWidth sx={inputSx}
                  value={fUnidad.titulo ?? ''}
                  onChange={e => setFUnidad(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ej. Introducción a la materia"
                />
              </FieldRow>
            </Box>
          </Box>
          <FieldRow label="Descripción">
            <TextField
              size="small" multiline rows={2} fullWidth sx={inputSx}
              value={fUnidad.descripcion ?? ''}
              onChange={e => setFUnidad(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción breve de la unidad..."
            />
          </FieldRow>
          {!editingUnidad && (
            <FieldRow label="Objetivos">
              <TextField
                size="small" multiline rows={2} fullWidth sx={inputSx}
                value={fUnidad.objetivos ?? ''}
                onChange={e => setFUnidad(p => ({ ...p, objetivos: e.target.value }))}
                placeholder="Objetivos de aprendizaje..."
              />
            </FieldRow>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button
            onClick={() => { setDlgUnidad(false); setEditingUnidad(null); setFUnidad({}); }}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={submitUnidad} variant="contained"
            disabled={submittingUnidad || !fUnidad.numero_unidad || !fUnidad.titulo}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              background: gradient, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(accent, 0.35)}`,
            }}
          >
            {submittingUnidad ? 'Guardando…' : editingUnidad ? 'Guardar cambios' : 'Crear Unidad'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Dialog: Tema (crear / editar) ═════════════ */}
      <Dialog
        open={dlgTema}
        onClose={() => { setDlgTema(false); setEditingTema(null); setFTema({}); }}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '22px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
          {editingTema ? 'Editar Tema' : 'Nuevo Tema'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ width: 90 }}>
              <FieldRow label="Número">
                <TextField
                  type="number" size="small" fullWidth sx={inputSx}
                  value={fTema.numero_tema ?? ''}
                  onChange={e => setFTema(p => ({ ...p, numero_tema: parseInt(e.target.value) }))}
                />
              </FieldRow>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldRow label="Título *">
                <TextField
                  size="small" fullWidth sx={inputSx}
                  value={fTema.titulo ?? ''}
                  onChange={e => setFTema(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ej. Conceptos básicos"
                />
              </FieldRow>
            </Box>
          </Box>
          <FieldRow label="Descripción">
            <TextField
              size="small" multiline rows={2} fullWidth sx={inputSx}
              value={fTema.descripcion ?? ''}
              onChange={e => setFTema(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción del tema..."
            />
          </FieldRow>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <FieldRow label="Dificultad">
                <TextField
                  select size="small" fullWidth sx={inputSx}
                  value={fTema.nivel_dificultad ?? ''}
                  onChange={e => setFTema(p => ({ ...p, nivel_dificultad: e.target.value as NivelDificultad || undefined }))}
                >
                  <MenuItem value="">Sin especificar</MenuItem>
                  {NIVELES_DIFICULTAD.map(n => (
                    <MenuItem key={n.value} value={n.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 8, height: 8, borderRadius: '50%',
                          bgcolor: n.color,
                        }} />
                        {n.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </FieldRow>
            </Box>
            <Box sx={{ width: 150 }}>
              <FieldRow label="Duración (min)">
                <TextField
                  type="number" size="small" fullWidth sx={inputSx}
                  value={fTema.duracion_estimada ?? ''}
                  onChange={e => setFTema(p => ({ ...p, duracion_estimada: parseInt(e.target.value) || undefined }))}
                  InputProps={{
                    startAdornment: <ClockIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.disabled' }} />,
                  }}
                />
              </FieldRow>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button
            onClick={() => { setDlgTema(false); setEditingTema(null); setFTema({}); }}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={submitTema} variant="contained"
            disabled={submittingTema || !fTema.numero_tema || !fTema.titulo}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              background: gradient, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(accent, 0.35)}`,
            }}
          >
            {submittingTema ? 'Guardando…' : editingTema ? 'Guardar cambios' : 'Crear Tema'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}