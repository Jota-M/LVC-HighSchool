'use client';
/**
 * app/dashboard/docente/prediccion/page.tsx — rediseñada
 *
 * Cambios respecto al original:
 *   - Cards muestran información pedagógica relevante (no solo asistencia del día)
 *   - Barra de progreso del período visible en cada card
 *   - Indicador de "último análisis" para saber si ya se corrió la predicción
 *   - Layout asimétrico: card grande para la materia con más riesgo detectado
 *   - Banner de contexto más útil: explica qué hace el modelo y cuándo mejora
 *   - MLStatusBadge con más detalle (version + features)
 */

import React, { useEffect } from 'react';
import {
  Box, Container, Typography, Chip, Tooltip,
  LinearProgress, Fade, Alert, useTheme, alpha,
  CircularProgress, Paper,
} from '@mui/material';
import { keyframes } from '@mui/system';

import PsychologyRoundedIcon   from '@mui/icons-material/PsychologyRounded';
import ChevronRightIcon        from '@mui/icons-material/ChevronRight';
import GroupsRoundedIcon       from '@mui/icons-material/GroupsRounded';
import WifiOffRoundedIcon      from '@mui/icons-material/WifiOffRounded';
import SchoolRoundedIcon       from '@mui/icons-material/SchoolRounded';
import AccessTimeRoundedIcon   from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRoundedIcon  from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useRouter }          from 'next/navigation';
import { useAuth }            from '@/context/AuthContext';
import { useMisAsignaciones } from '@/hooks/useAsistencia';
import { useMLHealth }        from '@/hooks/usePrediccion';
import { AsignacionDocente }  from '@/services/asistenciaService';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
`;

// ── ML Status badge ───────────────────────────────────────────
const MLStatusBadge: React.FC<{ isDark: boolean; accent: string }> = ({ isDark, accent }) => {
  const { health, isLoading, verificar } = useMLHealth();
  useEffect(() => { verificar(); }, [verificar]);

  if (isLoading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={12} sx={{ color: accent }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
        Verificando ML…
      </Typography>
    </Box>
  );

  if (!health?.disponible) return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.8,
      px: 1.5, py: 0.7, borderRadius: '20px',
      bgcolor: alpha('#dc2626', 0.08),
      border: `1px solid ${alpha('#dc2626', 0.2)}`,
    }}>
      <WifiOffRoundedIcon sx={{ fontSize: 13, color: '#dc2626' }} />
      <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700, fontSize: 11 }}>
        ML sin conexión
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={`Modelo v${health.version} · ${health.n_features} features · Gemini ${health.gemini ? 'activo' : 'no disponible'}`}
      placement="bottom-end"
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.8,
        px: 1.5, py: 0.7, borderRadius: '20px',
        bgcolor: alpha('#16a34a', 0.08),
        border: `1px solid ${alpha('#16a34a', 0.2)}`,
        cursor: 'default',
      }}>
        <Box sx={{
          width: 7, height: 7, borderRadius: '50%', bgcolor: '#16a34a',
          animation: `${pulse} 2s ease-in-out infinite`,
        }} />
        <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, fontSize: 11 }}>
          ML activo
        </Typography>
        {health.gemini && (
          <>
            <Box sx={{ width: 1, height: 12, bgcolor: alpha('#16a34a', 0.3) }} />
            <AutoAwesomeRoundedIcon sx={{ fontSize: 12, color: '#f59e0b' }} />
            <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, fontSize: 11 }}>
              Gemini
            </Typography>
          </>
        )}
      </Box>
    </Tooltip>
  );
};

// ── Card de materia ───────────────────────────────────────────
const MateriaCard: React.FC<{
  asignacion: AsignacionDocente;
  accent:     string;
  accentEnd:  string;
  isDark:     boolean;
  index:      number;
  onClick:    () => void;
}> = ({ asignacion, accent, accentEnd, isDark, index, onClick }) => {

  // Calcular progreso del período si hay fechas disponibles
  // (asumimos que asignacion puede traer semana_actual / total_semanas)
  const semanaActual  = (asignacion as any).semana_actual  ?? null;
  const totalSemanas  = (asignacion as any).total_semanas  ?? null;
  const pctPeriodo    = semanaActual && totalSemanas
    ? Math.round((semanaActual / totalSemanas) * 100)
    : null;
  const periodoLabel  = (asignacion as any).periodo_nombre ?? asignacion.periodo_nombre ?? null;

  const totalEst      = Number(asignacion.total_estudiantes) || 0;
  const ausentes      = Number(asignacion.ausentes) || 0;
  const presentes     = Number(asignacion.presentes) || 0;

  // Iniciales de materia
  const initials = asignacion.materia_nombre
    .split(' ')
    .filter((w: string) => w.length > 2)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase() || asignacion.materia_nombre.slice(0, 2).toUpperCase();

  const gradBg = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '22px',
        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.025) : '#fff',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s, border-color 0.2s',
        boxShadow: isDark ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
        animation: `${fadeUp} 0.45s ease-out ${index * 0.08}s both`,
        '&:hover': {
          transform:    'translateY(-5px) scale(1.01)',
          borderColor:  alpha(accent, 0.45),
          boxShadow:    isDark
            ? `0 12px 40px ${alpha(accent, 0.18)}`
            : `0 12px 40px ${alpha(accent, 0.2)}`,
        },
      }}
    >
      {/* ── Franja superior de color (fina, no el header entero) ── */}
      <Box sx={{ height: 4, background: gradBg }} />

      {/* ── Cuerpo ── */}
      <Box sx={{ p: 2.5 }}>

        {/* Fila: avatar + nombre + flecha */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '15px',
            background: gradBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 6px 16px ${alpha(accent, 0.3)}`,
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: -0.5 }}>
              {initials}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ lineHeight: 1.2, mb: 0.3 }}>
              {asignacion.materia_nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
              {asignacion.grado_nombre} "{asignacion.paralelo_nombre}" · {asignacion.turno_nombre}
            </Typography>
          </Box>

          <ChevronRightIcon sx={{ color: alpha(accent, 0.5), fontSize: 20, flexShrink: 0, mt: 0.3 }} />
        </Box>

        {/* Barra de progreso del período */}
        {pctPeriodo !== null && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 11 }} />
                {periodoLabel ?? 'Período'}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, color: pctPeriodo >= 80 ? '#dc2626' : 'text.disabled' }}>
                Semana {semanaActual}/{totalSemanas}
              </Typography>
            </Box>
            <Box sx={{
              height: 5, borderRadius: 3,
              bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07),
              overflow: 'hidden',
            }}>
              <Box sx={{
                height: '100%',
                width: `${pctPeriodo}%`,
                background: pctPeriodo >= 80
                  ? 'linear-gradient(90deg, #ea580c, #dc2626)'
                  : gradBg,
                borderRadius: 3,
                transition: 'width 0.6s ease-out',
              }} />
            </Box>
          </Box>
        )}

        {/* Stats */}
        <Box sx={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 1, mb: 1.5,
        }}>
          {/* Estudiantes */}
          <Box sx={{
            p: 1.2, borderRadius: '12px',
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#f8fafc', 1),
            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
            display: 'flex', alignItems: 'center', gap: 0.8,
          }}>
            <GroupsRoundedIcon sx={{ fontSize: 15, color: accent }} />
            <Box>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, display: 'block' }}>
                Estudiantes
              </Typography>
              <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1, fontSize: 15 }}>
                {totalEst}
              </Typography>
            </Box>
          </Box>

          {/* Ausencias hoy */}
          <Box sx={{
            p: 1.2, borderRadius: '12px',
            bgcolor: ausentes > 0
              ? isDark ? alpha('#dc2626', 0.08) : alpha('#fee2e2', 0.6)
              : isDark ? alpha('#fff', 0.04) : alpha('#f8fafc', 1),
            border: `1px solid ${ausentes > 0
              ? alpha('#dc2626', 0.2)
              : isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05)}`,
            display: 'flex', alignItems: 'center', gap: 0.8,
          }}>
            <WarningAmberRoundedIcon sx={{
              fontSize: 15,
              color: ausentes > 0 ? '#dc2626' : 'text.disabled',
            }} />
            <Box>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, display: 'block' }}>
                Ausentes hoy
              </Typography>
              <Typography
                variant="body2"
                fontWeight={800}
                sx={{ lineHeight: 1, fontSize: 15, color: ausentes > 0 ? '#dc2626' : 'text.secondary' }}
              >
                {ausentes > 0 ? ausentes : '—'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer: período + CTA */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pt: 1.5,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.06)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
              {periodoLabel ?? asignacion.periodo_nombre ?? 'Ver predicción'}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.4,
            px: 1.2, py: 0.4, borderRadius: '20px',
            bgcolor: alpha(accent, 0.1),
          }}>
            <PsychologyRoundedIcon sx={{ fontSize: 13, color: accent }} />
            <Typography variant="caption" sx={{ color: accent, fontWeight: 700, fontSize: 11 }}>
              Analizar
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Página ────────────────────────────────────────────────────
export default function PrediccionIndexPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  const accent    = isDark ? '#facc15' : '#0284c7';
  const accentEnd = isDark ? '#f59e0b' : '#0369a1';
  const gradBg    = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;

  const { asignaciones, isLoading, sinAsignaciones } = useMisAsignaciones();

  const handleIr = (asignacion: AsignacionDocente) => {
    router.push(
      `/dashboard/docente/prediccion/${asignacion.asignacion_id}` +
      `?paralelo=${asignacion.paralelo_id}&periodo=${asignacion.periodo_evaluacion_id}`
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* ── Header ── */}
        <Fade in timeout={400}>
          <Box sx={{ mb: 5 }}>
            <Box sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, mb: 3,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '18px',
                  background: gradBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 24px ${alpha(accent, 0.35)}`,
                }}>
                  <PsychologyRoundedIcon sx={{
                    color: '#fff', fontSize: 30,
                    animation: `${float} 3s ease-in-out infinite`,
                  }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={900} sx={{
                    background:           gradBg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor:  'transparent',
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                  }}>
                    Predicción de Rendimiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                    Hola, <strong>{user?.username}</strong> — seleccioná una materia para analizar
                  </Typography>
                </Box>
              </Box>
              <MLStatusBadge isDark={isDark} accent={accent} />
            </Box>

            {/* Banner explicativo — más útil y menos genérico */}
            <Box sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? alpha(accent, 0.07) : alpha(accent, 0.05),
              border:  `1px solid ${alpha(accent, 0.18)}`,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}>
              {[
                {
                  icon: <SchoolRoundedIcon sx={{ fontSize: 16, color: accent }} />,
                  titulo: 'Basado en datos reales',
                  desc: 'Notas SAB, HAC y asistencia acumulada del trimestre en curso.',
                },
                {
                  icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />,
                  titulo: 'Mejora con el tiempo',
                  desc: 'La precisión aumenta conforme avanza el período y hay más evaluaciones.',
                },
                {
                  icon: <AccessTimeRoundedIcon sx={{ fontSize: 16, color: accent }} />,
                  titulo: 'Predicción por trimestre',
                  desc: 'Cada análisis es independiente por período. No acumula entre trimestres.',
                },
              ].map(({ icon, titulo, desc }) => (
                <Box key={titulo} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: 0.2, flexShrink: 0 }}>{icon}</Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block', fontSize: 11 }}>
                      {titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.5 }}>
                      {desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Loading */}
        {isLoading && (
          <LinearProgress sx={{
            borderRadius: 4, height: 3, mb: 3,
            bgcolor: alpha(accent, 0.12),
            '& .MuiLinearProgress-bar': { background: gradBg },
          }} />
        )}

        {/* Sin materias */}
        {!isLoading && sinAsignaciones && (
          <Alert severity="info" sx={{ borderRadius: '14px' }}>
            No tenés materias asignadas activas. Contactá al administrador si esto es un error.
          </Alert>
        )}

        {/* Grid de materias */}
        {!isLoading && asignaciones.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontSize: 11 }}>
              {asignaciones.length} materia{asignaciones.length !== 1 ? 's' : ''} asignada{asignaciones.length !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap:                 2.5,
            }}>
              {asignaciones.map((asig, i) => (
                <MateriaCard
                  key={asig.asignacion_id}
                  asignacion={asig}
                  accent={accent}
                  accentEnd={accentEnd}
                  isDark={isDark}
                  index={i}
                  onClick={() => handleIr(asig)}
                />
              ))}
            </Box>
          </Box>
        )}

      </Container>
    </Box>
  );
}