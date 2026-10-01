'use client';
// app/dashboard/docente/notas/[id]/page.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, Chip, Fade,
  useTheme, alpha, LinearProgress, Stack, Collapse,
  CircularProgress, Tooltip, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import ScoreRoundedIcon from '@mui/icons-material/ScoreRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import GradingRoundedIcon from '@mui/icons-material/GradingRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

import { useParams, useRouter } from 'next/navigation';
import { useMisMateriasNotas, useEvaluaciones, useDimensiones } from '@/hooks/useNotas';
import {
  MateriaDocenteNotas, Evaluacion,
  CriterioRubrica, TIPOS_EVALUACION,
  DIMENSIONES_CONFIG, DIMENSIONES_ORDEN, CodigoDimension,
} from '@/types/notasTypes';
import { adjuntosService, rubricaService } from '@/services/notasService';
import { PanelTareasInicial } from '@/components/docente/inicial/PanelTareasInicial';
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#facc15' : '#0288d1';
  const goldEnd = isDark ? '#f59e0b' : '#01579b';
  const gradBg = `linear-gradient(135deg, ${gold} 0%, ${goldEnd} 100%)`;
  return { isDark, gold, goldEnd, gradBg };
};

// ─── Panel de detalle ─────────────────────────────────────────────────────────
const DetallePanel: React.FC<{
  ev: Evaluacion;
  dimColor: string;
  isDark: boolean;
}> = ({ ev, dimColor, isDark }) => {
  const router = useRouter();
  const { gradBg } = usePalette();
  const [criterios, setCriterios] = useState<CriterioRubrica[]>([]);
  const [loadingRubrica, setLoadingRubrica] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoadingRubrica(true);
    rubricaService.listar(ev.id)
      .then(res => setCriterios(res.data.criterios))
      .catch(() => { })
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

  const tipo = TIPOS_EVALUACION.find(t => t.value === ev.tipo);
  const fechaLimite = ev.fecha_limite
    ? new Date(ev.fecha_limite).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    : null;

  const fechaInicioVirtual = ev.fecha_hora_inicio
    ? new Date(ev.fecha_hora_inicio).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    : null;

  const fechaFinVirtual = ev.fecha_hora_fin
    ? new Date(ev.fecha_hora_fin).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    : null;

  const esVirtual = ev.modalidad === 'virtual';

  return (
    <Box sx={{ p: 2 }}>
      {/* Barra superior con botón de edición completa */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 1.5, mb: 2, pb: 1.5,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
      }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ color: dimColor, fontSize: 13, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <AssignmentRoundedIcon sx={{ fontSize: 16 }} />
          Detalles de la Evaluación
        </Typography>

        <Button
          variant="contained"
          size="small"
          startIcon={<EditRoundedIcon sx={{ fontSize: 15 }} />}
          onClick={() => router.push(`/dashboard/docente/notas/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/nueva?evaluacionId=${ev.id}`)}
          sx={{
            borderRadius: '9px',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: 12,
            py: 0.6, px: 2,
            background: gradBg,
            color: isDark ? '#000' : '#fff',
            boxShadow: 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              opacity: 0.9,
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }
          }}
        >
          Editar práctica completa
        </Button>
      </Box>

      {/* Info básica */}
      <Box sx={{ mb: 2.5 }}>
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
        <Box sx={rowSx}>
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
        <Box sx={{ ...rowSx, borderBottom: 'none', alignItems: 'center' }}>
          <Typography sx={lblSx}><ComputerRoundedIcon sx={{ fontSize: 12 }} />Modalidad</Typography>
          <Chip
            icon={esVirtual ? <ComputerRoundedIcon sx={{ fontSize: '13px !important' }} /> : undefined}
            label={esVirtual ? '🌐 Virtual (Examen en línea)' : '📝 Presencial'}
            size="small"
            sx={{
              fontSize: 11,
              height: 24,
              fontWeight: 800,
              bgcolor: esVirtual ? alpha('#10b981', 0.16) : isDark ? alpha('#fff', 0.08) : '#f3f4f6',
              color: esVirtual ? '#10b981' : 'text.secondary',
              border: `1.5px solid ${esVirtual ? alpha('#10b981', 0.4) : isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1)}`,
            }}
          />
        </Box>
      </Box>

      {/* ── Si la modalidad es Virtual: Tarjeta de Resumen con Acciones Claras ── */}
      {esVirtual && (
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            mb: 3,
            borderRadius: '14px',
            border: `1.5px solid ${alpha('#10b981', 0.35)}`,
            background: isDark
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 78, 59, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, #f0fdf4 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '10px',
                bgcolor: alpha('#10b981', isDark ? 0.25 : 0.15),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#10b981',
              }}>
                <ComputerRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: 14 }}>
                    Examen Virtual
                  </Typography>
                  <Chip
                    label="Virtual Activo"
                    size="small"
                    sx={{
                      fontSize: 10, height: 20, fontWeight: 800,
                      bgcolor: alpha('#10b981', 0.2), color: '#10b981',
                      border: `1px solid ${alpha('#10b981', 0.4)}`,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Las preguntas y ponderaciones se gestionan desde el editor completo
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => router.push(`/dashboard/docente/notas/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/nueva?evaluacionId=${ev.id}`)}
                sx={{
                  borderRadius: '9px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: 12,
                  py: 0.6,
                  px: 2,
                  background: gradBg,
                  color: isDark ? '#000' : '#fff',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': { opacity: 0.9, transform: 'translateY(-1px)' },
                }}
              >
                Editar práctica y banco de preguntas
              </Button>
            </Box>
          </Box>

          {/* Grilla de parámetros */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 1.2,
            pt: 1.4,
            borderTop: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}>
            <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 10, fontWeight: 700 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#10b981' }} /> DURACIÓN
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.4, fontSize: 13 }}>
                {ev.duracion_minutos ? `${ev.duracion_minutos} minutos` : 'Sin límite de tiempo'}
              </Typography>
            </Box>

            <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 10, fontWeight: 700 }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 13, color: '#10b981' }} /> INTENTOS
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.4, fontSize: 13 }}>
                {ev.intentos_permitidos ? `${ev.intentos_permitidos} intento(s)` : '1 intento permitido'}
              </Typography>
            </Box>

            <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 10, fontWeight: 700 }}>
                <ShuffleRoundedIcon sx={{ fontSize: 13, color: '#10b981' }} /> ORDEN PREGUNTAS
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.4, fontSize: 13 }}>
                {ev.orden_aleatorio ? 'Aleatorio (barajadas)' : 'Secuencial original'}
              </Typography>
            </Box>

            <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 10, fontWeight: 700 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: '#10b981' }} /> PERÍODO ACTIVO
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.4, fontSize: 12 }} noWrap>
                {fechaInicioVirtual ? `${fechaInicioVirtual.slice(0, 12)}` : 'Abierto'}
                {fechaFinVirtual ? ` → ${fechaFinVirtual.slice(0, 12)}` : ''}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
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
  onEliminar: (ev: Evaluacion) => void;
  onPublicar: (id: number) => void;
  onDespublicar: (id: number) => void;
}> = ({ ev, index, dimColor, dimBg, isDark, onEliminar, onPublicar, onDespublicar }) => {
  const router = useRouter();
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
            {ev.modalidad === 'virtual' && (
              <Chip
                icon={<ComputerRoundedIcon sx={{ fontSize: '11px !important' }} />}
                label="Virtual"
                size="small"
                sx={{ fontSize: 10, height: 17, bgcolor: alpha('#10b981', 0.15), color: '#10b981', fontWeight: 800 }}
              />
            )}
            {ev.permite_entrega_archivo && (
              <Chip
                icon={<CloudUploadRoundedIcon sx={{ fontSize: '11px !important' }} />}
                label="Entrega en plataforma"
                size="small"
                sx={{ fontSize: 10, height: 17, bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6', fontWeight: 800 }}
              />
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

          {/* Editar práctica completa */}
          <Tooltip title="Editar práctica completa y preguntas">
            <Box
              component="button"
              type="button"
              onClick={() => router.push(`/dashboard/docente/notas/${ev.asignacion_docente_id}-${ev.periodo_evaluacion_id}/nueva?evaluacionId=${ev.id}`)}
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
              <EditRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>

          {/* Eliminar evaluación */}
          <Tooltip title="Eliminar evaluación">
            <Box
              component="button"
              type="button"
              onClick={(e) => {
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
              <DeleteRoundedIcon sx={{ fontSize: 16 }} />
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
            {open
              ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 20 }} />
              : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />}
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

  const { dimensionesConfig, dimensionesOrden } = useDimensiones();
  const [dimTab, setDimTab] = useState(0);
  const dimensionActiva: CodigoDimension = dimensionesOrden[dimTab] || 'SER';

  const {
    porDimension, isLoading: loadingEv,
    eliminar: eliminarEv, refrescar,
  } = useEvaluaciones({
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
  });

  const evaluacionesDim: Evaluacion[] = porDimension[dimensionActiva] ?? [];
  const cfg = dimensionesConfig[dimensionActiva] || DIMENSIONES_CONFIG[dimensionActiva];

  const [dlgEliminar, setDlgEliminar] = useState<Evaluacion | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const bgModal = isDark ? '#09101d' : '#ffffff';

  const handlePublicar = async (id: number) => {
    try { await adjuntosService.publicar(id); toast.success('Publicada'); refrescar(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const handleDespublicar = async (id: number) => {
    try { await adjuntosService.despublicar(id); toast.success('Ocultada'); refrescar(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const handleEliminarClick = (ev: Evaluacion) => {
    setDlgEliminar(ev);
  };
  const handleConfirmarEliminar = async () => {
    if (!dlgEliminar) return;
    setEliminando(true);
    try {
      const ok = await eliminarEv(dlgEliminar.id);
      if (ok) {
        setDlgEliminar(null);
      }
    } finally {
      setEliminando(false);
    }
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

  const esInicial =
    seleccionada.modalidad_evaluacion === 'cualitativa' ||
    seleccionada.nivel_nombre?.toLowerCase().includes('inicial');

  if (esInicial) {
    return (
      <PanelTareasInicial
        materia={seleccionada}
        asignacionId={asignacionId}
        periodoId={periodoId}
        paraleloId={seleccionada.paralelo_id}
        gradoId={seleccionada.grado_id}
        onVolver={() => router.push('/dashboard/docente/notas')}
      />
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
                onClick={() => router.push(`/dashboard/docente/notas/${asignacionId}-${periodoId}/nueva?dimension=${dimensionActiva}`)}
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
            <Tabs
              value={dimTab}
              onChange={(_, v) => setDimTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                background: gradBg, borderRadius: '16px', p: { xs: 0.5, md: 1 },
                minHeight: { xs: 36, md: 48 },
                '& .MuiTabs-flexContainer': {
                  flexWrap: 'nowrap',
                },
                '& .MuiTabs-scrollButtons': {
                  color: isDark ? '#000' : '#fff',
                  width: { xs: 28, md: 40 },
                  flexShrink: 0,
                  '&.Mui-disabled': { opacity: 0.3 },
                },
                '& .MuiTab-root': {
                  borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                  minWidth: 'max-content',
                  flexShrink: 0,
                  minHeight: { xs: 36, md: 48 },
                  fontSize: { xs: '0.75rem', md: '0.95rem' },
                  whiteSpace: 'nowrap',
                  color: isDark ? alpha('#000', 0.7) : alpha('#fff', 0.8),
                  '&:hover': { color: isDark ? '#000' : '#fff' },
                },
                '& .Mui-selected': { color: `${isDark ? '#000' : '#fff'} !important` },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#000' : '#fff', height: 3, borderRadius: '3px 3px 0 0',
                },
              }}>
              {dimensionesOrden.map(k => {
                const c = dimensionesConfig[k] || DIMENSIONES_CONFIG[k];
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
                    onEliminar={handleEliminarClick}
                    onPublicar={handlePublicar}
                    onDespublicar={handleDespublicar}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Fade>

      </Container>

      {/* ══ DIALOG: CONFIRMAR ELIMINAR EVALUACIÓN (Idéntico a Temario) ══ */}
      <Dialog
        open={!!dlgEliminar}
        onClose={() => !eliminando && setDlgEliminar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${alpha('#dc2626', 0.35)}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(220,38,38,0.08), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.2)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          background: isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '13px', flexShrink: 0,
              background: alpha('#dc2626', 0.15),
              border: `1.5px solid ${alpha('#dc2626', 0.35)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DeleteForeverRoundedIcon sx={{ color: '#dc2626', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#dc2626', mb: 0.2,
              }}>
                GESTIÓN DE TAREAS · ELIMINAR
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.15, color: 'text.primary' }}>
                ¿Eliminar esta tarea?
              </Typography>
            </Box>
          </Box>
          <Box
            onClick={() => !eliminando && setDlgEliminar(null)}
            sx={{
              width: 30, height: 30, borderRadius: '8px', cursor: eliminando ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'text.secondary',
              '&:hover': eliminando ? {} : { color: '#dc2626', bgcolor: alpha('#dc2626', 0.08) },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nombre de la tarea destacado */}
          <Box sx={{
            p: 2, borderRadius: '12px',
            bgcolor: isDark ? alpha('#dc2626', 0.08) : alpha('#dc2626', 0.04),
            border: `1px solid ${alpha('#dc2626', 0.2)}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <AssignmentRoundedIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0, opacity: 0.85 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }} noWrap>
                {dlgEliminar?.nombre}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.2 }}>
                {dlgEliminar?.tipo ? (TIPOS_EVALUACION.find(t => t.value === dlgEliminar.tipo)?.label ?? dlgEliminar.tipo) : 'Evaluación'} · {dlgEliminar?.puntaje_maximo ?? 100} pts · Dimensión {dlgEliminar?.dimension_codigo || dimensionActiva}
              </Typography>
            </Box>
          </Box>

          {/* Mensaje de impacto */}
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.7 }}>
            Al eliminar esta tarea se removerá permanentemente junto con las calificaciones, archivos adjuntos y entregas registradas por los estudiantes.
          </Typography>

          {/* Warning box */}
          <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1.2,
            p: 1.6, borderRadius: '10px',
            bgcolor: isDark ? alpha('#f59e0b', 0.08) : alpha('#f59e0b', 0.06),
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
          }}>
            <Typography sx={{ fontSize: '0.9rem', flexShrink: 0, mt: 0.1 }}>⚠️</Typography>
            <Typography sx={{ fontSize: '0.76rem', color: isDark ? '#fcd34d' : '#92400e', lineHeight: 1.5 }}>
              Esta acción <strong>no se puede deshacer</strong>. Las notas asociadas a esta tarea en el trimestre serán eliminadas.
            </Typography>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          gap: 1,
        }}>
          <Button
            onClick={() => setDlgEliminar(null)}
            variant="outlined"
            disabled={eliminando}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
              color: 'text.secondary',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            disabled={eliminando}
            startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : <DeleteForeverRoundedIcon sx={{ fontSize: 17 }} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
              boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
              px: 2.5,
            }}
          >
            {eliminando ? 'Eliminando…' : 'Sí, eliminar tarea'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}