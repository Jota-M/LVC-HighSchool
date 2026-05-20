'use client';
// app/dashboard/docente/prediccion/[id]/plan/page.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, CircularProgress,
  Alert, Chip, Divider, Paper, Avatar, alpha, useTheme,
  Fade, LinearProgress, Stepper, Step, StepLabel,
  StepContent, IconButton,
} from '@mui/material';
import { keyframes } from '@mui/system';

import ArrowBackRoundedIcon      from '@mui/icons-material/ArrowBackRounded';
import AssignmentRoundedIcon     from '@mui/icons-material/AssignmentRounded';
import AutoAwesomeRoundedIcon    from '@mui/icons-material/AutoAwesomeRounded';
import PeopleRoundedIcon         from '@mui/icons-material/PeopleRounded';
import SchoolRoundedIcon         from '@mui/icons-material/SchoolRounded';
import WarningAmberRoundedIcon   from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon    from '@mui/icons-material/CheckCircleRounded';
import MenuBookRoundedIcon       from '@mui/icons-material/MenuBookRounded';
import TrendingUpRoundedIcon     from '@mui/icons-material/TrendingUpRounded';
import BusinessRoundedIcon       from '@mui/icons-material/BusinessRounded';
import RefreshRoundedIcon        from '@mui/icons-material/RefreshRounded';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import prediccionService from '@/services/prediccionService';
import { NivelRiesgo, NIVELES_RIESGO, PlanRecuperacion } from '@/types/prediccionTypes';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Helpers ───────────────────────────────────────────────────
const getNivel = (v: string) => NIVELES_RIESGO.find(n => n.value === v) ?? NIVELES_RIESGO[0];

// ── NivelChip ─────────────────────────────────────────────────
const NivelChip: React.FC<{ nivel: string }> = ({ nivel }) => {
  const cfg = getNivel(nivel);
  return (
    <Chip label={cfg.label} sx={{
      bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 700,
      border: `1px solid ${cfg.borderColor}`, fontSize: 12,
    }} />
  );
};

// ── Card de semana del plan ───────────────────────────────────
const SemanaCard: React.FC<{
  semana:     number;
  accion_docente:   string;
  accion_estudiante: string;
  meta:       string;
  material_id?: number | null;
  isDark:     boolean;
  accent:     string;
  esUltima:   boolean;
}> = ({ semana, accion_docente, accion_estudiante, meta, material_id, isDark, accent, esUltima }) => (
  <Box sx={{
    p:            2.5,
    borderRadius: '16px',
    border:       `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
    bgcolor:      isDark ? alpha('#fff', 0.02) : '#fff',
    animation:    `${fadeUp} 0.3s ease-out ${semana * 0.07}s both`,
    boxShadow:    isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
  }}>
    {/* Header semana */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Avatar sx={{
        width: 40, height: 40,
        bgcolor: alpha(accent, 0.15),
        color: accent, fontWeight: 900, fontSize: 15,
      }}>
        {semana}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={800}>
          Semana {semana}
        </Typography>
        {esUltima && (
          <Chip size="small" label="Semana clave" sx={{
            height: 18, fontSize: 10, fontWeight: 700,
            bgcolor: alpha(accent, 0.1), color: accent,
          }} />
        )}
      </Box>
      {material_id && (
        <Button
          size="small"
          variant="outlined"
          href={`/dashboard/docente/materiales/${material_id}`}
          target="_blank"
          startIcon={<MenuBookRoundedIcon sx={{ fontSize: '13px !important' }} />}
          sx={{
            fontSize: '0.7rem', py: 0.4, px: 1.2,
            borderRadius: '10px', fontWeight: 700,
            borderColor: alpha(accent, 0.4), color: accent,
          }}
        >
          Material
        </Button>
      )}
    </Box>

    {/* Acciones */}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
      {/* Docente */}
      <Box sx={{
        p: 1.5, borderRadius: '12px',
        bgcolor: isDark ? alpha('#2563eb', 0.08) : alpha('#dbeafe', 0.5),
        border: `1px solid ${alpha('#2563eb', 0.2)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
          <SchoolRoundedIcon sx={{ fontSize: 13, color: '#2563eb' }} />
          <Typography variant="caption" fontWeight={800} sx={{ color: '#2563eb', fontSize: 10 }}>
            ACCIÓN DOCENTE
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ lineHeight: 1.6, fontSize: 12 }}>
          {accion_docente}
        </Typography>
      </Box>

      {/* Estudiante */}
      <Box sx={{
        p: 1.5, borderRadius: '12px',
        bgcolor: isDark ? alpha('#7c3aed', 0.08) : alpha('#ede9fe', 0.5),
        border: `1px solid ${alpha('#7c3aed', 0.2)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
          <AssignmentRoundedIcon sx={{ fontSize: 13, color: '#7c3aed' }} />
          <Typography variant="caption" fontWeight={800} sx={{ color: '#7c3aed', fontSize: 10 }}>
            TAREA ESTUDIANTE
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ lineHeight: 1.6, fontSize: 12 }}>
          {accion_estudiante}
        </Typography>
      </Box>
    </Box>

    {/* Meta */}
    <Box sx={{
      p: 1.2, borderRadius: '10px',
      bgcolor: isDark ? alpha('#16a34a', 0.07) : alpha('#f0fdf4', 1),
      border: `1px solid ${alpha('#16a34a', 0.2)}`,
      display: 'flex', alignItems: 'flex-start', gap: 0.8,
    }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#16a34a', mt: 0.15, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, lineHeight: 1.5, fontSize: 12 }}>
        <strong>Meta:</strong> {meta}
      </Typography>
    </Box>
  </Box>
);

// ══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function PlanRecuperacionPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const accent    = isDark ? '#facc15' : '#0284c7';
  const accentEnd = isDark ? '#f59e0b' : '#0369a1';
  const gradBg    = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;

  const asignacionId   = parseInt(params.id as string);
  const matriculaId    = parseInt(searchParams.get('matricula_id') ?? '');
  const periodoId      = parseInt(searchParams.get('periodo') ?? '');
  const nombreEstudiante = decodeURIComponent(searchParams.get('nombre') ?? 'Estudiante');

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prediccionService.planRecuperacion({
        matricula_id:          matriculaId,
        asignacion_docente_id: asignacionId,
        periodo_evaluacion_id: periodoId,
      });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar el plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(matriculaId) && !isNaN(asignacionId) && !isNaN(periodoId)) {
      cargar();
    } else {
      setError('Parámetros inválidos. Volvé a la pantalla de predicción.');
      setLoading(false);
    }
  }, [matriculaId, asignacionId, periodoId]); // eslint-disable-line

  // ── Plan no disponible ────────────────────────────────────────
  const planNoDisponible = !loading && !error && data && !data.plan;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">

        {/* ── Header ── */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <IconButton
                size="small"
                onClick={() => router.back()}
                sx={{
                  border: `1.5px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1)}`,
                  borderRadius: '10px',
                }}
              >
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
              <Box sx={{
                width: 42, height: 42, borderRadius: '13px',
                background: gradBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 20px ${alpha(accent, 0.35)}`,
              }}>
                <AssignmentRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={900} sx={{
                  background: gradBg,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor:  'transparent',
                  lineHeight: 1.2,
                }}>
                  Plan de Recuperación
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {nombreEstudiante}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* ── Loading ── */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '22px',
              background: gradBg, mx: 'auto', mb: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 10px 28px ${alpha(accent, 0.35)}`,
            }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <CircularProgress sx={{ color: accent, mb: 2 }} size={36} />
            <Typography variant="body1" fontWeight={600} gutterBottom>
              Generando plan con IA…
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gemini está analizando la situación del estudiante
            </Typography>
            <LinearProgress sx={{
              mt: 3, borderRadius: 4, height: 3, maxWidth: 280, mx: 'auto',
              bgcolor: alpha(accent, 0.12),
              '& .MuiLinearProgress-bar': { background: gradBg },
            }} />
          </Box>
        )}

        {/* ── Error ── */}
        {error && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Alert
              severity="error"
              sx={{ borderRadius: '14px', mb: 3, textAlign: 'left' }}
              action={
                <Button size="small" onClick={cargar} startIcon={<RefreshRoundedIcon />}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
            <Button variant="outlined" onClick={() => router.back()} sx={{ borderRadius: '12px' }}>
              Volver
            </Button>
          </Box>
        )}

        {/* ── Plan no disponible (semanas restantes < 2 o riesgo bajo) ── */}
        {planNoDisponible && (
          <Fade in timeout={400}>
            <Box>
              {/* Resumen del estudiante */}
              <Paper elevation={0} sx={{
                p: 3, mb: 3, borderRadius: '18px',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <NivelChip nivel={data.nivel_riesgo} />
                    <Typography variant="h3" fontWeight={900} sx={{
                      mt: 1, color: getNivel(data.nivel_riesgo).color,
                    }}>
                      {data.nota_estimada?.toFixed(1)}
                      <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                        /100
                      </Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Semana {data.semana_actual}/{data.total_semanas}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {data.semanas_restantes} semana(s) restante(s)
                    </Typography>
                  </Box>
                </Box>

                <Alert
                  severity={data.nivel_riesgo === 'bajo' ? 'success' : 'warning'}
                  sx={{ borderRadius: '12px' }}
                >
                  {data.mensaje ?? 'Plan no disponible para este período.'}
                </Alert>
              </Paper>

              <Button
                fullWidth variant="outlined"
                onClick={() => router.back()}
                sx={{ borderRadius: '14px', py: 1.5, fontWeight: 700 }}
              >
                Volver al análisis
              </Button>
            </Box>
          </Fade>
        )}

        {/* ── Plan disponible ── */}
        {!loading && !error && data?.plan && (
          <Fade in timeout={400}>
            <Box sx={{ animation: `${fadeUp} 0.4s ease-out` }}>

              {/* ── Resumen ejecutivo ── */}
              <Paper elevation={0} sx={{
                p: 3, mb: 3, borderRadius: '20px',
                background: `linear-gradient(135deg,
                  ${isDark ? alpha('#1e1b4b', 0.8) : alpha('#eff6ff', 0.9)} 0%,
                  ${isDark ? alpha('#1e1b4b', 0.4) : alpha('#fff', 0.9)} 100%)`,
                border: `1.5px solid ${isDark ? alpha('#6366f1', 0.3) : alpha('#6366f1', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <NivelChip nivel={data.nivel_riesgo} />
                      <Typography variant="caption" color="text.secondary">
                        Semana {data.semana_actual}/{data.total_semanas}
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={900}
                      sx={{ color: getNivel(data.nivel_riesgo).color, lineHeight: 1 }}>
                      {data.nota_estimada?.toFixed(1)}
                      <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                        nota estimada
                      </Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" fontWeight={900}
                      sx={{ color: data.plan.nota_proyectada >= 51 ? '#16a34a' : '#dc2626' }}>
                      {data.plan.nota_proyectada}
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 700, fontSize: 12 }}>
                        proyectada
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mt: 0.5 }}>
                      <TrendingUpRoundedIcon sx={{ fontSize: 14, color: data.plan.nota_proyectada >= 51 ? '#16a34a' : '#dc2626' }} />
                      <Typography variant="caption" sx={{
                        color: data.plan.nota_proyectada >= 51 ? '#16a34a' : '#dc2626',
                        fontWeight: 700, fontSize: 11,
                      }}>
                        {data.plan.nota_proyectada >= 51 ? 'Puede aprobar' : 'Sigue en riesgo'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Objetivo */}
                <Box sx={{
                  p: 2, borderRadius: '14px',
                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.8),
                  border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ fontSize: 10 }}>
                      OBJETIVO DEL PLAN
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {data.plan.objetivo}
                  </Typography>
                </Box>

                {/* Stats rápidos */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                  {[
                    {
                      label: 'Semanas del plan',
                      value: data.plan.plan_semanal.length,
                      color: accent,
                    },
                    {
                      label: 'Semanas restantes',
                      value: data.semanas_restantes,
                      color: data.semanas_restantes < 3 ? '#dc2626' : accent,
                    },
                    {
                      label: 'Nota proyectada',
                      value: data.plan.nota_proyectada,
                      color: data.plan.nota_proyectada >= 51 ? '#16a34a' : '#dc2626',
                    },
                  ].map(({ label, value, color }) => (
                    <Box key={label} sx={{
                      px: 1.5, py: 1, borderRadius: '10px',
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8fafc', 1),
                      border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                    }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, display: 'block' }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color, fontSize: 18, lineHeight: 1 }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* ── Involucrar dirección ── */}
              {data.plan.involucrar_direccion && data.plan.mensaje_direccion && (
                <Alert
                  severity="error"
                  icon={<BusinessRoundedIcon />}
                  sx={{ borderRadius: '14px', mb: 2.5 }}
                >
                  <Typography variant="body2" fontWeight={700} gutterBottom>
                    Reportar a Dirección
                  </Typography>
                  <Typography variant="body2">{data.plan.mensaje_direccion}</Typography>
                </Alert>
              )}

              {/* ── Involucrar padres ── */}
              {data.plan.involucrar_padres && data.plan.mensaje_padres && (
                <Alert
                  severity="warning"
                  icon={<PeopleRoundedIcon />}
                  sx={{ borderRadius: '14px', mb: 2.5 }}
                >
                  <Typography variant="body2" fontWeight={700} gutterBottom>
                    Comunicar a los Padres
                  </Typography>
                  <Typography variant="body2">{data.plan.mensaje_padres}</Typography>
                </Alert>
              )}

              {/* ── Semanas del plan ── */}
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentRoundedIcon sx={{ color: accent, fontSize: 20 }} />
                Plan semana a semana
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {data.plan.plan_semanal.map((sem: any, i: number) => (
                  <SemanaCard
                    key={i}
                    semana={sem.semana}
                    accion_docente={sem.accion_docente}
                    accion_estudiante={sem.accion_estudiante}
                    meta={sem.meta}
                    material_id={sem.material_id_sugerido}
                    isDark={isDark}
                    accent={accent}
                    esUltima={i === data.plan.plan_semanal.length - 1}
                  />
                ))}
              </Box>

              {/* ── Advertencia si no hay Gemini ── */}
              {!data.gemini_disponible && (
                <Alert severity="info" sx={{ borderRadius: '14px', mt: 3 }}>
                  Gemini no estaba disponible. El plan fue generado con información básica del período.
                </Alert>
              )}

              {/* ── Acciones ── */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  sx={{ borderRadius: '12px', fontWeight: 700, flex: 1 }}
                >
                  Volver al análisis
                </Button>
                <Button
                  variant="outlined"
                  onClick={cargar}
                  startIcon={<RefreshRoundedIcon />}
                  sx={{
                    borderRadius: '12px', fontWeight: 700,
                    borderColor: alpha(accent, 0.4), color: accent,
                  }}
                >
                  Regenerar
                </Button>
              </Box>

            </Box>
          </Fade>
        )}

      </Container>
    </Box>
  );
}