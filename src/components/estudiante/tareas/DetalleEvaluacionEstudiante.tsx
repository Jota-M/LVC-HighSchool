'use client';
// components/estudiante/tareas/DetalleEvaluacionEstudiante.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, Typography, Chip, Divider, Stack, Skeleton,
  IconButton, useTheme, alpha, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
  LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import CloseIcon          from '@mui/icons-material/Close';
import PictureAsPdfIcon   from '@mui/icons-material/PictureAsPdf';
import ImageIcon          from '@mui/icons-material/Image';
import EventIcon          from '@mui/icons-material/Event';
import ScaleIcon          from '@mui/icons-material/Scale';
import CommentIcon        from '@mui/icons-material/Comment';
import GradeIcon          from '@mui/icons-material/Grade';
import InfoOutlinedIcon   from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon      from '@mui/icons-material/OpenInNew';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon  from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BlockIcon          from '@mui/icons-material/Block';

import api from '@/lib/api';
import type { TareaEstudiante, EstadoTarea } from '@/types/estudiante';

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoTarea, { label: string; color: string; gradient: string }> = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  entregado: { label: 'Entregado', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#34d399)' },
  atrasado:  { label: 'Atrasado',  color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f87171)' },
  ausente:   { label: 'Ausente',   color: '#6b7280', gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)' },
};

const DIMENSIONES: Record<string, { label: string; color: string }> = {
  SER:  { label: 'Ser',            color: '#10B981' },
  SAB:  { label: 'Saber',          color: '#3B82F6' },
  HAC:  { label: 'Hacer',          color: '#F59E0B' },
  AUTO: { label: 'Autoevaluación', color: '#8B5CF6' },
};

const TIPOS_LABELS: Record<string, string> = {
  tarea: 'Tarea', examen: 'Examen', trabajo: 'Trabajo',
  practica: 'Práctica', proyecto: 'Proyecto', exposicion: 'Exposición', quiz: 'Quiz',
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
  foto_url?:     string | null;
  pdf_url?:      string | null;
  pdf_nombre?:   string | null;
  instrucciones?: string | null;
  descripcion?:  string | null;
  rubrica:       CriterioRubrica[];
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
  if (dias < 0)  return `Venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días restantes`;
};

const colorDias = (dias: number | null | undefined, estado: EstadoTarea, isDark: boolean) => {
  if (estado === 'entregado') return isDark ? '#34d399' : '#10b981';
  if (estado === 'atrasado')  return isDark ? '#f87171' : '#ef4444';
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
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const total  = criterios.reduce((a, c) => a + Number(c.puntos_posibles), 0);

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
  open:  boolean;
  onClose: () => void;
}

const DetalleEvaluacionEstudiante: React.FC<Props> = ({ tarea, open, onClose }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [detalle, setDetalle]     = useState<DetalleCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !tarea) { setDetalle(null); return; }
    setIsLoading(true);
    Promise.all([
      api.get(`/notas/evaluaciones/${tarea.evaluacion_id}`),
      api.get(`/notas/evaluaciones/${tarea.evaluacion_id}/rubrica`).catch(() => ({ data: { data: { criterios: [] } } })),
    ])
      .then(([evalRes, rubricaRes]) => {
        const ev = evalRes.data.data.evaluacion;
        setDetalle({
          foto_url:      ev.foto_url      ?? null,
          pdf_url:       ev.pdf_url       ?? null,
          pdf_nombre:    ev.pdf_nombre    ?? null,
          instrucciones: ev.instrucciones ?? null,
          descripcion:   ev.descripcion   ?? null,
          rubrica:       rubricaRes.data.data?.criterios ?? [],
        });
      })
      .catch(() => setDetalle({ foto_url: null, pdf_url: null, pdf_nombre: null, instrucciones: null, descripcion: null, rubrica: [] }))
      .finally(() => setIsLoading(false));
  }, [open, tarea?.evaluacion_id]);

  if (!tarea) return null;

  const cfg     = ESTADO_CONFIG[tarea.estado_calculado];
  const dimCfg  = tarea.dimension_codigo ? DIMENSIONES[tarea.dimension_codigo] : null;
  const cdias   = colorDias(tarea.dias_restantes, tarea.estado_calculado, isDark);

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
              {tarea.nota_sobre_100 != null && (
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
            {(detalle?.descripcion || detalle?.instrucciones) && (
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
                </Stack>
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
                      <Typography variant="h2" fontWeight={900} sx={{ color: '#fff', lineHeight: 1 }}>
                        {tarea.nota_sobre_100}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), fontWeight: 700 }}>
                        sobre 100 puntos
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                        {tarea.puntaje_obtenido} / {tarea.puntaje_maximo} pts
                      </Typography>
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
                  { label: 'Puntaje máximo',    value: `${tarea.puntaje_maximo} pts` },
                  { label: 'Peso en dimensión', value: `×${tarea.peso_en_dimension}` },
                  { label: 'Período',           value: tarea.periodo_nombre },
                  { label: 'Publicado el',      value: tarea.publicado_en
                    ? new Date(tarea.publicado_en).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—' },
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
    </Drawer>
  );
};

export default DetalleEvaluacionEstudiante;