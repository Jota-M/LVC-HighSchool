'use client';
// app/dashboard/docente/notas/[id]/page.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, Chip, Fade,
  useTheme, alpha, LinearProgress, Stack, Collapse,
  CircularProgress, Tooltip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import GradeRoundedIcon           from '@mui/icons-material/GradeRounded';
import ArrowBackRoundedIcon       from '@mui/icons-material/ArrowBackRounded';
import AddRoundedIcon             from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon      from '@mui/icons-material/AssignmentRounded';
import HourglassEmptyRoundedIcon  from '@mui/icons-material/HourglassEmptyRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon  from '@mui/icons-material/KeyboardArrowUpRounded';
import ImageRoundedIcon           from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon    from '@mui/icons-material/PictureAsPdfRounded';
import CalendarTodayRoundedIcon   from '@mui/icons-material/CalendarTodayRounded';
import ScoreRoundedIcon           from '@mui/icons-material/ScoreRounded';
import InfoOutlinedIcon           from '@mui/icons-material/InfoOutlined';
import DescriptionOutlinedIcon    from '@mui/icons-material/DescriptionOutlined';
import MenuBookRoundedIcon        from '@mui/icons-material/MenuBookRounded';
import AccessTimeRoundedIcon      from '@mui/icons-material/AccessTimeRounded';
import OpenInNewRoundedIcon       from '@mui/icons-material/OpenInNewRounded';
import CheckRoundedIcon           from '@mui/icons-material/CheckRounded';
import VisibilityIcon             from '@mui/icons-material/Visibility';
import VisibilityOffIcon          from '@mui/icons-material/VisibilityOff';
import DeleteRoundedIcon          from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon         from '@mui/icons-material/RefreshRounded';

import { useParams, useRouter } from 'next/navigation';
import { useMisMateriasNotas, useEvaluaciones } from '@/hooks/useNotas';
import {
  MateriaDocenteNotas, Evaluacion,
  CriterioRubrica, TIPOS_EVALUACION,
  DIMENSIONES_CONFIG, DIMENSIONES_ORDEN, CodigoDimension,
} from '@/types/notasTypes';
import { adjuntosService, rubricaService } from '@/services/notasService';
import { toast } from 'react-hot-toast';

// ─── Animaciones ──────────────────────────────────────────────────────────────
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

// ─── Paleta ───────────────────────────────────────────────────────────────────
const usePalette = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold    = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg  = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ─── Panel de detalle ─────────────────────────────────────────────────────────
const DetallePanel: React.FC<{
  ev: Evaluacion;
  dimColor: string;
  isDark: boolean;
}> = ({ ev, dimColor, isDark }) => {
  const [criterios, setCriterios]           = useState<CriterioRubrica[]>([]);
  const [loadingRubrica, setLoadingRubrica] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoadingRubrica(true);
    rubricaService.listar(ev.id)
      .then(res => setCriterios(res.data.criterios))
      .catch(() => {})
      .finally(() => setLoadingRubrica(false));
  }, [ev.id]);

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

  const tipo        = TIPOS_EVALUACION.find(t => t.value === ev.tipo);
  const fechaLimite = ev.fecha_limite
    ? new Date(ev.fecha_limite).toLocaleString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <Box sx={{ p: 2 }}>
      {/* Info básica */}
      <Box sx={{ mb: 2 }}>
        {tipo && (
          <Box sx={rowSx}>
            <Typography sx={lblSx}><InfoOutlinedIcon sx={{ fontSize: 12 }} />Tipo</Typography>
            <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
              sx={{ fontSize: 11, height: 22, bgcolor: isDark ? alpha('#fff', 0.08) : '#f3f4f6' }} />
          </Box>
        )}
        <Box sx={rowSx}>
          <Typography sx={lblSx}><ScoreRoundedIcon sx={{ fontSize: 12 }} />Puntaje máximo</Typography>
          <Typography sx={{ ...valSx, fontWeight: 700, color: dimColor }}>
            {ev.puntaje_maximo} puntos
          </Typography>
        </Box>
        {ev.peso_en_dimension != null && (
          <Box sx={rowSx}>
            <Typography sx={lblSx}><ScoreRoundedIcon sx={{ fontSize: 12 }} />Peso en dimensión</Typography>
            <Typography sx={valSx}>{ev.peso_en_dimension}</Typography>
          </Box>
        )}
        {ev.fecha && (
          <Box sx={rowSx}>
            <Typography sx={lblSx}><CalendarTodayRoundedIcon sx={{ fontSize: 12 }} />Fecha</Typography>
            <Typography sx={valSx}>{ev.fecha.slice(0, 10)}</Typography>
          </Box>
        )}
        {fechaLimite && (
          <Box sx={rowSx}>
            <Typography sx={lblSx}><AccessTimeRoundedIcon sx={{ fontSize: 12 }} />Fecha límite</Typography>
            <Typography sx={{ ...valSx, color: '#f59e0b', fontWeight: 600 }}>{fechaLimite}</Typography>
          </Box>
        )}
        <Box sx={{ ...rowSx, borderBottom: 'none' }}>
          <Typography sx={lblSx}><InfoOutlinedIcon sx={{ fontSize: 12 }} />Visible a padres</Typography>
          <Chip
            label={ev.visible_para_padres ? '✓ Publicada' : '✗ No publicada'} size="small"
            sx={{
              fontSize: 10, height: 20,
              bgcolor: ev.visible_para_padres ? alpha('#16a34a', 0.14) : isDark ? alpha('#fff', 0.07) : '#f3f4f6',
              color: ev.visible_para_padres ? '#16a34a' : 'text.secondary',
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

      {/* Descripción */}
      {ev.descripcion && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 13, color: dimColor }} />
            <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11, letterSpacing: 0.4 }}>
              DESCRIPCIÓN
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{
            p: 1.5, borderRadius: '10px', lineHeight: 1.7, fontSize: 13,
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          }}>
            {ev.descripcion}
          </Typography>
        </Box>
      )}

      {/* Instrucciones */}
      {ev.instrucciones && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
            <MenuBookRoundedIcon sx={{ fontSize: 13, color: dimColor }} />
            <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11, letterSpacing: 0.4 }}>
              INSTRUCCIONES
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{
            p: 1.5, borderRadius: '10px', lineHeight: 1.7, fontSize: 13, whiteSpace: 'pre-line',
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          }}>
            {ev.instrucciones}
          </Typography>
        </Box>
      )}

      {/* Adjuntos */}
      {(ev.foto_url || ev.pdf_url) && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.2 }}>
            <ImageRoundedIcon sx={{ fontSize: 13, color: dimColor }} />
            <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11, letterSpacing: 0.4 }}>
              ADJUNTOS
            </Typography>
          </Box>
          <Stack spacing={1.2}>
            {ev.foto_url && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.8, display: 'block', fontWeight: 600 }}>
                  Imagen del enunciado
                </Typography>
                <Box component="img" src={ev.foto_url} alt="Foto del enunciado" sx={{
                  width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: '10px',
                  border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  bgcolor: isDark ? alpha('#000', 0.3) : '#f8f9fa',
                }} />
              </Box>
            )}
            {ev.pdf_url && (
              <Box component="a" href={ev.pdf_url} target="_blank" rel="noopener noreferrer" sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 1.5, borderRadius: '10px', textDecoration: 'none',
                bgcolor: alpha('#dc2626', 0.06),
                border: `1.5px solid ${alpha('#dc2626', 0.2)}`,
                transition: 'opacity 0.15s', '&:hover': { opacity: 0.8 },
              }}>
                <PictureAsPdfRoundedIcon sx={{ color: '#dc2626', fontSize: 26 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#dc2626' }}>
                    {ev.pdf_nombre ?? 'Instrucciones.pdf'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">Abrir PDF</Typography>
                </Box>
                <OpenInNewRoundedIcon sx={{ fontSize: 15, color: '#dc2626' }} />
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* Rúbrica */}
      {loadingRubrica ? (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <CircularProgress size={18} sx={{ color: dimColor }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, fontSize: 10 }}>
            Cargando rúbrica...
          </Typography>
        </Box>
      ) : criterios.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.2 }}>
            <CheckRoundedIcon sx={{ fontSize: 13, color: dimColor }} />
            <Typography variant="caption" fontWeight={800} sx={{ color: dimColor, fontSize: 11, letterSpacing: 0.4 }}>
              RÚBRICA
            </Typography>
            <Chip
              label={`${criterios.reduce((s, c) => s + c.puntos_posibles, 0)} pts`}
              size="small"
              sx={{ fontSize: 9, height: 17, bgcolor: alpha(dimColor, 0.12), color: dimColor, fontWeight: 700 }}
            />
          </Box>
          <Stack spacing={0.75}>
            {criterios.map((c, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.2,
                p: 1.2, borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
                border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
              }}>
                <Box sx={{
                  minWidth: 20, height: 20, borderRadius: '6px', flexShrink: 0,
                  bgcolor: alpha(dimColor, 0.15),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography variant="caption" fontWeight={900} sx={{ fontSize: 10, color: dimColor, lineHeight: 1 }}>
                    {i + 1}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>{c.criterio}</Typography>
                  {c.descripcion && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{c.descripcion}</Typography>
                  )}
                </Box>
                <Chip label={`${c.puntos_posibles} pts`} size="small"
                  sx={{ flexShrink: 0, fontSize: 10, height: 18, bgcolor: alpha(dimColor, 0.12), color: dimColor, fontWeight: 700 }} />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Sin contenido */}
      {!ev.descripcion && !ev.instrucciones && !ev.foto_url && !ev.pdf_url && criterios.length === 0 && !loadingRubrica && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
          Esta evaluación no tiene descripción, adjuntos ni rúbrica.
        </Typography>
      )}
    </Box>
  );
};

// ─── Card expandible ──────────────────────────────────────────────────────────
const EvaluacionCard: React.FC<{
  ev: Evaluacion;
  index: number;
  dimColor: string;
  dimBg: string;
  isDark: boolean;
  onEliminar: (id: number) => void;
  onPublicar: (id: number) => void;
  onDespublicar: (id: number) => void;
}> = ({ ev, index, dimColor, dimBg, isDark, onEliminar, onPublicar, onDespublicar }) => {
  const [open, setOpen] = useState(false);
  const tipo = TIPOS_EVALUACION.find(t => t.value === ev.tipo);

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

      {/* ── Cabecera clickeable ── */}
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
        }}>
          <AssignmentRoundedIcon sx={{
            fontSize: 18,
            color: open ? dimColor : isDark ? alpha('#fff', 0.3) : alpha(dimColor, 0.6),
          }} />
        </Box>

        {/* Nombre y meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap
            sx={{ fontSize: 13, color: open ? dimColor : 'text.primary', lineHeight: 1.3, transition: 'color 0.18s' }}>
            {ev.nombre}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', alignItems: 'center', mt: 0.4 }}>
            {tipo && (
              <Chip label={`${tipo.icon} ${tipo.label}`} size="small"
                sx={{ fontSize: 10, height: 17, bgcolor: isDark ? alpha('#fff', 0.07) : '#f3f4f6' }} />
            )}
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
              {ev.puntaje_maximo} pts
            </Typography>
            {ev.fecha && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  {ev.fecha.slice(0, 10)}
                </Typography>
              </Box>
            )}
            {ev.foto_url && (
              <Tooltip title="Tiene imagen">
                <ImageRoundedIcon sx={{ fontSize: 12, color: isDark ? '#facc15' : '#0288d1' }} />
              </Tooltip>
            )}
            {ev.pdf_url && (
              <Tooltip title="Tiene PDF">
                <PictureAsPdfRoundedIcon sx={{ fontSize: 12, color: '#dc2626' }} />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Acciones inline */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <Tooltip title={ev.visible_para_padres ? 'Ocultar a padres' : 'Publicar a padres'}>
            <Box
              onClick={() => ev.visible_para_padres ? onDespublicar(ev.id) : onPublicar(ev.id)}
              sx={{
                width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: ev.visible_para_padres ? alpha('#16a34a', 0.12) : 'transparent',
                color: ev.visible_para_padres ? '#16a34a' : isDark ? alpha('#fff', 0.25) : '#d1d5db',
                border: `1px solid ${ev.visible_para_padres ? alpha('#16a34a', 0.3) : 'transparent'}`,
                transition: 'all 0.15s',
                '&:hover': { color: '#16a34a', bgcolor: alpha('#16a34a', 0.08) },
              }}
            >
              {ev.visible_para_padres
                ? <VisibilityIcon sx={{ fontSize: 14 }} />
                : <VisibilityOffIcon sx={{ fontSize: 14 }} />}
            </Box>
          </Tooltip>
          <Tooltip title="Eliminar evaluación">
            <Box
              onClick={() => onEliminar(ev.id)}
              sx={{
                width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: isDark ? alpha('#fff', 0.2) : '#d1d5db',
                transition: 'all 0.15s',
                '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.08) },
              }}
            >
              <DeleteRoundedIcon sx={{ fontSize: 14 }} />
            </Box>
          </Tooltip>
          <Box sx={{ color: open ? dimColor : 'text.disabled', transition: 'color 0.18s', display: 'flex' }}>
            {open
              ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
              : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
          </Box>
        </Box>
      </Box>

      {/* ── Panel detalle ── */}
      <Collapse in={open} timeout={240}>
        <Box sx={{
          borderTop: `1.5px solid ${alpha(dimColor, 0.2)}`,
          bgcolor: isDark ? alpha('#fff', 0.015) : alpha(dimBg, 0.12),
        }}>
          <DetallePanel ev={ev} dimColor={dimColor} isDark={isDark} />
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DocenteNotasDetailPage() {
  const { isDark, gold, goldEnd, gradBg } = usePalette();
  const router = useRouter();
  const params = useParams();

  const [asignacionId, periodoId] = String(params.id ?? '').split('-').map(Number);

  const { materias, isLoading: loadingMaterias } = useMisMateriasNotas();
  const seleccionada: MateriaDocenteNotas | undefined = materias.find(
    m => m.asignacion_id === asignacionId && m.periodo_evaluacion_id === periodoId
  );

  const [dimTab, setDimTab] = useState(0);
  const dimensionActiva: CodigoDimension = DIMENSIONES_ORDEN[dimTab];

  const {
    porDimension, isLoading: loadingEv,
    eliminar: eliminarEv, refrescar,
  } = useEvaluaciones({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
  });

  const evaluacionesDim: Evaluacion[] = porDimension[dimensionActiva] ?? [];
  const cfg = DIMENSIONES_CONFIG[dimensionActiva];

  const handlePublicar = async (id: number) => {
    try { await adjuntosService.publicar(id); toast.success('Publicada'); refrescar(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const handleDespublicar = async (id: number) => {
    try { await adjuntosService.despublicar(id); toast.success('Ocultada'); refrescar(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const handleEliminar = async (id: number) => {
    await eliminarEv(id);
  };

  useEffect(() => {
    if (!loadingMaterias && materias.length > 0 && !seleccionada)
      router.replace('/dashboard/docente/notas');
  }, [loadingMaterias, materias, seleccionada, router]);

  if (loadingMaterias || !seleccionada) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <LinearProgress sx={{ borderRadius: 4, height: 4 }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ══ HEADER ══ */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 3 }}>
            <Box onClick={() => router.push('/dashboard/docente/notas')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2,
                cursor: 'pointer', color: 'text.secondary', fontSize: 13, fontWeight: 600,
                '&:hover': { color: gold }, transition: 'color 0.15s',
              }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver a mis materias
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <GradeRoundedIcon sx={{ color: gold, fontSize: 34, animation: `${bounceIcon} 1.5s ease-in-out infinite` }} />
                <Box>
                  <Typography variant="h1" sx={{
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                    fontWeight: 800, background: gradBg,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {seleccionada.materia_nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4, flexWrap: 'wrap' }}>
                    <Chip label={seleccionada.trimestre_nombre} size="small"
                      sx={{ background: gradBg, color: isDark ? '#000' : '#fff', fontWeight: 700, fontSize: 11 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {seleccionada.grado_nombre} "{seleccionada.paralelo_nombre}" · {seleccionada.turno_nombre}
                      · {seleccionada.total_estudiantes} estudiantes
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Botón nueva evaluación */}
              <Box
                component="button"
                onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}/nueva`)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8,
                  px: 2, py: 1, borderRadius: '12px', border: 'none',
                  background: gradBg, color: isDark ? '#000' : '#fff',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  transition: 'opacity .15s, transform .15s',
                  '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
                  alignSelf: 'flex-start',
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 17 }} />
                Nueva evaluación
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ══ TABS ══ */}
        <Fade in timeout={450}>
          <Box sx={{ mb: 3 }}>
            <Tabs value={dimTab} onChange={(_, v) => setDimTab(v)}
              sx={{
                background: gradBg, borderRadius: '16px', p: 1,
                '& .MuiTab-root': {
                  borderRadius: '12px', textTransform: 'none', fontWeight: 600, minHeight: 48,
                  color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.8),
                  '&:hover': { color: isDark ? '#000' : '#fff' },
                },
                '& .Mui-selected': { color: `${isDark ? '#000' : '#fff'} !important` },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0',
                },
              }}>
              {DIMENSIONES_ORDEN.map(k => {
                const c = DIMENSIONES_CONFIG[k];
                const count = (porDimension[k] ?? []).length;
                return (
                  <Tab key={k} label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{c.label}</span>
                      <Box sx={{
                        fontSize: 10, fontWeight: 700,
                        bgcolor: isDark ? alpha('#000', 0.25) : alpha('#fff', 0.25),
                        color: isDark ? '#000' : '#fff',
                        borderRadius: '8px', px: 0.8, py: 0.2, lineHeight: 1.4,
                      }}>{c.porcentaje}%</Box>
                      {count > 0 && (
                        <Box sx={{
                          fontSize: 9, fontWeight: 800,
                          bgcolor: isDark ? alpha('#000', 0.35) : alpha('#fff', 0.35),
                          color: isDark ? '#000' : '#fff',
                          borderRadius: '6px', px: 0.7, py: 0.1, lineHeight: 1.4,
                          minWidth: 16, textAlign: 'center',
                        }}>{count}</Box>
                      )}
                    </Box>
                  } />
                );
              })}
            </Tabs>
          </Box>
        </Fade>

        {/* ══ LISTA ══ */}
        <Fade in timeout={500} key={dimensionActiva}>
          <Box sx={{ animation: `${fadeUp} 0.28s ease-out` }}>

            {/* Sub-header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 9, height: 9, borderRadius: '50%', bgcolor: cfg.color,
                  boxShadow: `0 0 8px ${alpha(cfg.color, 0.6)}`,
                }} />
                <Typography variant="body2" fontWeight={800} sx={{ color: cfg.color }}>{cfg.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {cfg.descripcion} · {cfg.porcentaje}% de la nota
                </Typography>
              </Box>
              <Box onClick={() => refrescar()}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4,
                  fontSize: 12, fontWeight: 600, color: 'text.disabled', cursor: 'pointer',
                  '&:hover': { color: cfg.color }, transition: 'color 0.15s',
                }}>
                <RefreshRoundedIcon sx={{ fontSize: 14 }} />
                Refrescar
              </Box>
            </Box>

            {/* Loading */}
            {loadingEv ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={26} sx={{ color: cfg.color }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Cargando evaluaciones...
                </Typography>
              </Box>

            ) : evaluacionesDim.length === 0 ? (
              <Box sx={{
                textAlign: 'center', py: 7, borderRadius: '16px',
                border: `2px dashed ${alpha(cfg.color, 0.3)}`,
                bgcolor: isDark ? alpha(cfg.color, 0.03) : alpha(cfg.bgColor, 0.25),
              }}>
                <HourglassEmptyRoundedIcon sx={{ fontSize: 38, color: alpha(cfg.color, 0.35), mb: 1 }} />
                <Typography variant="body1" fontWeight={700} sx={{ color: cfg.color, mb: 0.5 }}>
                  Sin evaluaciones en {cfg.label}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                  Creá la primera evaluación para esta dimensión
                </Typography>
                <Box
                  component="button"
                  onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}/nueva`)}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.8,
                    px: 2, py: 0.9, borderRadius: '10px', border: 'none',
                    bgcolor: cfg.color, color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'opacity .15s', '&:hover': { opacity: 0.85 },
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: 16 }} />
                  Nueva evaluación
                </Box>
              </Box>

            ) : (
              <Stack spacing={1.5}>
                {evaluacionesDim.map((ev, i) => (
                  <EvaluacionCard
                    key={ev.id}
                    ev={ev} index={i}
                    dimColor={cfg.color} dimBg={cfg.bgColor}
                    isDark={isDark}
                    onEliminar={handleEliminar}
                    onPublicar={handlePublicar}
                    onDespublicar={handleDespublicar}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Fade>

      </Container>
    </Box>
  );
}