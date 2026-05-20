'use client';
// app/dashboard/docente/prediccion/[id]/page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Chip, Tab, Tabs, Tooltip,
  LinearProgress, Fade, Alert, useTheme, alpha, Button,
  CircularProgress, Divider, Paper, IconButton, Drawer, Avatar,
} from '@mui/material';
import { keyframes } from '@mui/system';

import PsychologyRoundedIcon    from '@mui/icons-material/PsychologyRounded';
import GroupsRoundedIcon        from '@mui/icons-material/GroupsRounded';
import PersonRoundedIcon        from '@mui/icons-material/PersonRounded';
import ScienceRoundedIcon       from '@mui/icons-material/ScienceRounded';
import AutoAwesomeRoundedIcon   from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackRoundedIcon     from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon         from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon  from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon   from '@mui/icons-material/CheckCircleRounded';
import AssignmentRoundedIcon    from '@mui/icons-material/AssignmentRounded';
import MenuBookRoundedIcon      from '@mui/icons-material/MenuBookRounded';
import RefreshRoundedIcon       from '@mui/icons-material/RefreshRounded';


import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  usePrediccionClase,
  usePrediccionEstudiante,
  usePlanRecuperacion,
} from '@/hooks/usePrediccion';
import { EstudianteClase, NIVELES_RIESGO, CLASIFICACIONES } from '@/types/prediccionTypes';
import RecursoMaterialCard from '@/components/prediccion/RecursoMaterialCard';
import TabSimulacion       from '@/components/prediccion/TabSimulacion';
import TabRecursosIA       from '@/components/prediccion/TabRecursosIA';

// ── Animaciones ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;


// ── Helpers ───────────────────────────────────────────────────
const getNivel  = (v: string) => NIVELES_RIESGO.find(n => n.value === v)  ?? NIVELES_RIESGO[0];
const getClasif = (v: string) => CLASIFICACIONES.find(c => c.value === v) ?? CLASIFICACIONES[0];

function getInitials(nombre: string) {
  return nombre.split(',')[0].trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── NivelChip ─────────────────────────────────────────────────
const NivelChip: React.FC<{ nivel: string; size?: 'small' | 'medium' }> = ({ nivel, size = 'small' }) => {
  const cfg = getNivel(nivel);
  return (
    <Chip size={size} label={cfg.label} sx={{
      bgcolor: cfg.bgColor, color: cfg.color, fontWeight: 700,
      border: `1px solid ${cfg.borderColor}`, fontSize: size === 'small' ? 10 : 12,
    }} />
  );
};

// ── ProbBar ───────────────────────────────────────────────────
const ProbBar: React.FC<{ prob: number; isDark: boolean }> = ({ prob, isDark }) => {
  const pct   = Math.round(prob * 100);
  const color = pct >= 75 ? '#dc2626' : pct >= 50 ? '#ea580c' : pct >= 25 ? '#d97706' : '#16a34a';
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Prob. reprobar</Typography>
        <Typography variant="caption" fontWeight={800} sx={{ color, fontSize: 10 }}>{pct}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{
        height: 6, borderRadius: 4,
        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
      }} />
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════
// PANEL LATERAL — detalle del estudiante
// ══════════════════════════════════════════════════════════════
const StudentPanel: React.FC<{
  estudiante:   EstudianteClase | null;
  asignacionId: number;
  periodoId:    number;
  isDark:       boolean;
  accent:       string;
  onClose:      () => void;
}> = ({ estudiante, asignacionId, periodoId, isDark, accent, onClose }) => {
  const { resultado, analisis, meta, isLoading, error, predecir, limpiar } = usePrediccionEstudiante();
  const { plan, isLoading: planLoading, generarPlan } = usePlanRecuperacion();

// StudentPanel — useEffect actual (roto)
useEffect(() => {
  if (!estudiante) { limpiar(); return; }
  predecir({
    matricula_id:          estudiante.matricula_id,  // undefined si no viene del backend
    asignacion_docente_id: asignacionId,
    periodo_evaluacion_id: periodoId,
  }, { incluirGemini: true, silencioso: true });
}, [estudiante?.estudiante_id]);

  if (!estudiante) return null;
  const cfg = getNivel(resultado?.nivel_riesgo ?? estudiante.nivel_riesgo);

  return (
    <Box sx={{ width: { xs: '100vw', sm: 440 }, height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header con color de riesgo */}
      <Box sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${cfg.color} 0%, ${alpha(cfg.color, 0.7)} 100%)`,
        display: 'flex', alignItems: 'center', gap: 2,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.08) }} />
        <Avatar sx={{ width: 52, height: 52, bgcolor: alpha('#fff', 0.2), color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
          {getInitials(estudiante.nombre_completo)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2 }} noWrap>
            {estudiante.nombre_completo}
          </Typography>
          <NivelChip nivel={resultado?.nivel_riesgo ?? estudiante.nivel_riesgo} />
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: alpha('#fff', 0.8), flexShrink: 0 }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

        {isLoading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: accent }} size={32} />
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.5 }}>Analizando con ML…</Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>}

        {resultado && !isLoading && (
          <Box sx={{ animation: `${fadeUp} 0.3s ease-out` }}>

            {/* Nota y prob */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
              <Paper elevation={0} sx={{
                p: 2, borderRadius: '14px', textAlign: 'center',
                border: `1.5px solid ${alpha(cfg.color, 0.3)}`, bgcolor: alpha(cfg.color, 0.05),
              }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: cfg.color }}>
                  {resultado.nota_estimada_final.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Nota estimada · {getClasif(resultado.clasificacion_estimada).label}
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{
                p: 2, borderRadius: '14px', textAlign: 'center',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              }}>
                <Typography variant="h4" fontWeight={800}>
                  {Math.round(resultado.probabilidad_reprobar * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Prob. reprobar</Typography>
              </Paper>
            </Box>

            <ProbBar prob={resultado.probabilidad_reprobar} isDark={isDark} />
            <Divider sx={{ my: 2 }} />

            {/* Factores */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="caption" fontWeight={700}
                  sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                  <WarningAmberRoundedIcon sx={{ fontSize: 12 }} /> RIESGOS
                </Typography>
                {resultado.factores_riesgo.map((f, i) => (
                  <Typography key={i} variant="caption" display="block" color="text.secondary"
                    sx={{ mb: 0.4, lineHeight: 1.5, fontSize: 11 }}>• {f}</Typography>
                ))}
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={700}
                  sx={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 12 }} /> POSITIVOS
                </Typography>
                {resultado.factores_positivos.map((f, i) => (
                  <Typography key={i} variant="caption" display="block" color="text.secondary"
                    sx={{ mb: 0.4, lineHeight: 1.5, fontSize: 11 }}>• {f}</Typography>
                ))}
              </Box>
            </Box>

            {/* Meta — actualizado para mostrar campos nuevos SAB/HAC */}
            {meta && (
              <Box sx={{
                display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2,
                p: 1.5, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8fafc', 1),
                borderRadius: '10px',
              }}>
                {[
                  ['Semana',      `${meta.semana_actual}/${meta.total_semanas}`],
                  ['SAB',         meta.n_notas_sab ?? meta.n_notas_examenes ?? 0],
                  ['HAC',         meta.n_notas_hac ?? meta.n_notas_practicas ?? 0],
                  ['Asistencia',  `${estudiante.asistencia_pct.toFixed(0)}%`],
                  ...(meta.nota_complementaria_pct > 0
                    ? [['SER+AUT', `${meta.nota_complementaria_pct.toFixed(1)}pts`]]
                    : []),
                ].map(([label, val]) => (
                  <Box key={label as string}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block' }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12 }}>
                      {val}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Gemini */}
            {analisis && (
              <Box sx={{
                bgcolor:      isDark ? alpha('#f59e0b', 0.07) : alpha('#fef9c3', 0.9),
                border:       `1.5px solid ${alpha('#f59e0b', 0.3)}`,
                borderRadius: '14px', p: 2, mb: 2,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                  <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={800}>Análisis Gemini</Typography>
                  {analisis.alerta_urgente && (
                    <Chip size="small" label="URGENTE"
                      sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 9, height: 18 }} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7, fontSize: 12 }}>
                  {analisis.explicacion}
                </Typography>
                {analisis.recomendaciones.map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</Typography>
                    <Typography variant="caption" sx={{ lineHeight: 1.6 }}>{r}</Typography>
                  </Box>
                ))}

                {/* Recursos con link real al repositorio */}
                {analisis.recursos_sugeridos.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                      <MenuBookRoundedIcon sx={{ fontSize: 11, color: '#f59e0b' }} />
                      <Typography variant="caption" fontWeight={700} color="text.secondary">MATERIALES</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {analisis.recursos_sugeridos.map((rec, i) => (
                        <RecursoMaterialCard
                          key={i} recurso={rec} isDark={isDark} accent={accent}
                          basePath="/dashboard/docente/materiales" index={i}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Plan de recuperación */}
            {resultado.nivel_riesgo !== 'bajo' && (
              <Box>
                {!plan && (
                  <Button fullWidth variant="outlined"
                    onClick={() => generarPlan({ matricula_id: estudiante.matricula_id, asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId })}
                    disabled={planLoading}
                    startIcon={planLoading ? <CircularProgress size={14} /> : <AssignmentRoundedIcon />}
                    sx={{ borderRadius: '12px', fontWeight: 700, py: 1 }}>
                    {planLoading ? 'Generando plan…' : 'Generar plan de recuperación'}
                  </Button>
                )}
                {plan && (
                  <Box sx={{
                    bgcolor:      isDark ? alpha('#2563eb', 0.07) : alpha('#dbeafe', 0.7),
                    border:       `1.5px solid ${alpha('#2563eb', 0.25)}`,
                    borderRadius: '14px', p: 2,
                  }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: '#2563eb', mb: 0.8, display: 'block' }}>
                      📋 Plan de recuperación
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 1.5, display: 'block', lineHeight: 1.6 }}>
                      {plan.objetivo}
                    </Typography>
                    {plan.plan_semanal.map((sem, i) => (
                      <Box key={i} sx={{
                        p: 1.2, mb: 0.8, borderRadius: '10px',
                        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
                        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" fontWeight={700} sx={{ color: '#2563eb' }}>
                            Semana {sem.semana}
                          </Typography>
                          {sem.material_id_sugerido && (
                            <Button size="small"
                              href={`/dashboard/docente/materiales/${sem.material_id_sugerido}`}
                              target="_blank"
                              sx={{ fontSize: 9, py: 0.2, px: 0.8, minWidth: 0, color: accent }}>
                              📚 Material
                            </Button>
                          )}
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3, fontSize: 11 }}>
                          👨‍🏫 {sem.accion_docente}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 11 }}>
                          👨‍🎓 {sem.accion_estudiante}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: '#16a34a', fontWeight: 600, mt: 0.3, fontSize: 11 }}>
                          Meta: {sem.meta}
                        </Typography>
                      </Box>
                    ))}
                    {plan.involucrar_padres && plan.mensaje_padres && (
                      <Alert severity="info" sx={{ mt: 1, borderRadius: '10px', fontSize: 11 }}>
                        <strong>Padres:</strong> {plan.mensaje_padres}
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════
// TAB CLASE — grid clickeable con panel lateral
// ══════════════════════════════════════════════════════════════
const TabClase: React.FC<{
  asignacionId: number; periodoId: number; paraleloId: number; accent: string; isDark: boolean;
}> = ({ asignacionId, periodoId, paraleloId, accent, isDark }) => {
  const { estudiantes, resumen, analisisGemini, isLoading, error, analizar } = usePrediccionClase();
  const [cargado, setCargado]         = useState(false);
  const [panelEst, setPanelEst]       = useState<EstudianteClase | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [busqueda, setBusqueda]       = useState('');

  const gradBg = `linear-gradient(135deg, ${accent} 0%, ${alpha(accent, 0.7)} 100%)`;

  const cargar = useCallback(async () => {
    await analizar({ asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId, paralelo_id: paraleloId });
    setCargado(true);
  }, [analizar, asignacionId, periodoId, paraleloId]);

  const ordenRiesgo: Record<string, number> = { critico: 0, alto: 1, medio: 2, bajo: 3 };
  const estudiantesFiltrados = estudiantes
    .filter(e => filtroNivel === 'todos' || e.nivel_riesgo === filtroNivel)
    .filter(e => !busqueda || e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => (ordenRiesgo[a.nivel_riesgo] ?? 4) - (ordenRiesgo[b.nivel_riesgo] ?? 4));

  return (
    <Box>
      {!cargado && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '24px', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, boxShadow: `0 12px 32px ${alpha(accent, 0.35)}` }}>
            <PsychologyRoundedIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>Analizar rendimiento de la clase</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 380, mx: 'auto' }}>
            El modelo evaluará a todos los estudiantes basándose en asistencia y notas actuales.
          </Typography>
          <Button variant="contained" size="large" onClick={cargar}
            sx={{ background: gradBg, borderRadius: '14px', fontWeight: 700, px: 5, py: 1.5, boxShadow: `0 4px 16px ${alpha(accent, 0.4)}` }}>
            Generar análisis
          </Button>
        </Box>
      )}

      {isLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress sx={{ color: accent, mb: 2 }} size={40} />
          <Typography variant="body2" color="text.secondary">
            Analizando {estudiantes.length > 0 ? `${estudiantes.length} estudiantes` : '…'}
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>}

      {cargado && !isLoading && resumen && (
        <Box sx={{ animation: `${fadeUp} 0.35s ease-out` }}>

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 1.5, mb: 3 }}>
            {[
              { label: 'Total',      value: resumen.total_estudiantes,        color: accent },
              { label: '🔴 Crítico', value: resumen.en_riesgo_critico,        color: '#dc2626' },
              { label: '🟠 Alto',    value: resumen.en_riesgo_alto,           color: '#ea580c' },
              { label: '🟡 Medio',   value: resumen.en_riesgo_medio,          color: '#d97706' },
              { label: '🟢 OK',      value: resumen.sin_riesgo,               color: '#16a34a' },
              { label: 'Prom.',      value: resumen.promedio_clase.toFixed(1), color: accent },
            ].map(({ label, value, color }) => (
              <Paper key={label} elevation={0} sx={{
                p: 1.5, borderRadius: '14px', textAlign: 'center',
                border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
              }}>
                <Typography variant="h5" fontWeight={800} sx={{ color }}>{value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Barra distribución */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography variant="caption" color="text.secondary">Distribución de riesgo</Typography>
              <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>{resumen.pct_riesgo.toFixed(0)}% en riesgo</Typography>
            </Box>
            <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: '2px' }}>
              {[
                { val: resumen.en_riesgo_critico, color: '#dc2626', label: 'Crítico' },
                { val: resumen.en_riesgo_alto,    color: '#ea580c', label: 'Alto' },
                { val: resumen.en_riesgo_medio,   color: '#d97706', label: 'Medio' },
                { val: resumen.sin_riesgo,        color: '#16a34a', label: 'OK' },
              ].filter(s => s.val > 0).map((seg, i) => (
                <Tooltip key={i} title={`${seg.label}: ${seg.val}`}>
                  <Box sx={{ width: `${(seg.val / resumen.total_estudiantes) * 100}%`, bgcolor: seg.color }} />
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* Gemini */}
          {analisisGemini && (
            <Box sx={{ bgcolor: isDark ? alpha('#f59e0b', 0.07) : alpha('#fef9c3', 0.9), border: `1.5px solid ${alpha('#f59e0b', 0.3)}`, borderRadius: '16px', p: 2.5, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={800}>Análisis Gemini — Clase completa</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>{analisisGemini.diagnostico}</Typography>
              {analisisGemini.acciones_grupo.map((acc, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.6 }}>
                  <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</Typography>
                  <Typography variant="body2">{acc}</Typography>
                </Box>
              ))}
              {analisisGemini.alerta_institucional && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', fontSize: 12 }}>{analisisGemini.mensaje_institucional}</Alert>
              )}
            </Box>
          )}

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              style={{ flex: 1, minWidth: 160, padding: '6px 12px', borderRadius: 10, border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`, background: 'transparent', color: 'inherit', fontSize: 13, outline: 'none' }}
              placeholder="Buscar estudiante…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {['todos', 'critico', 'alto', 'medio', 'bajo'].map(n => {
              const cfg = n === 'todos' ? null : getNivel(n);
              return (
                <Chip key={n} size="small" label={n === 'todos' ? 'Todos' : cfg!.label}
                  onClick={() => setFiltroNivel(n)}
                  sx={{
                    fontWeight: 700, fontSize: 10, cursor: 'pointer', border: 'none',
                    bgcolor: filtroNivel === n ? (n === 'todos' ? accent : cfg!.color) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                    color: filtroNivel === n ? '#fff' : 'text.secondary',
                  }}
                />
              );
            })}
          </Box>

          {/* Grid clickeable */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.5 }}>
            {estudiantesFiltrados.map((est, i) => {
              const cfg = getNivel(est.nivel_riesgo);
              return (
                <Box key={est.estudiante_id} onClick={() => setPanelEst(est)} sx={{
                  p: 2, borderRadius: '16px',
                  border: `1.5px solid ${alpha(cfg.color, 0.3)}`,
                  bgcolor: isDark ? alpha(cfg.color, 0.05) : alpha(cfg.bgColor, 0.4),
                  cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                  animation: `${fadeUp} 0.25s ease-out ${i * 0.02}s both`,
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 6px 20px ${alpha(cfg.color, 0.2)}`, borderColor: cfg.color },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(cfg.color, 0.15), color: cfg.color, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {getInitials(est.nombre_completo)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1, fontSize: 12 }}>
                      {est.nombre_completo}
                    </Typography>
                  </Box>
                  <NivelChip nivel={est.nivel_riesgo} />
                  <Box sx={{ mt: 1.2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Nota est.</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: 10, color: cfg.color }}>{est.nota_estimada_final.toFixed(1)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Asistencia</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: 10, color: est.asistencia_pct < 75 ? '#dc2626' : 'text.primary' }}>
                        {est.asistencia_pct.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button size="small" onClick={cargar} startIcon={<RefreshRoundedIcon />} sx={{ color: accent, fontWeight: 600 }}>
              Actualizar análisis
            </Button>
          </Box>
        </Box>
      )}

      {/* Panel lateral */}
      <Drawer anchor="right" open={!!panelEst} onClose={() => setPanelEst(null)}
        PaperProps={{ sx: { boxShadow: '0 0 60px rgba(0,0,0,0.25)' } }}>
        <StudentPanel estudiante={panelEst} asignacionId={asignacionId} periodoId={periodoId}
          isDark={isDark} accent={accent} onClose={() => setPanelEst(null)} />
      </Drawer>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════
// TAB ESTUDIANTE — dropdown selector
// ══════════════════════════════════════════════════════════════
const TabEstudiante: React.FC<{
  asignacionId: number; periodoId: number; paraleloId: number; accent: string; isDark: boolean;
}> = ({ asignacionId, periodoId, paraleloId, accent, isDark }) => {
  const { estudiantes, analizar: cargarClase }                                           = usePrediccionClase();
  const { resultado, analisis, meta, isLoading, error, predecir, limpiar }               = usePrediccionEstudiante();
  const { plan, isLoading: planLoading, generarPlan }                                     = usePlanRecuperacion();
  const [seleccionado, setSeleccionado]                                                  = useState<EstudianteClase | null>(null);

  useEffect(() => {
    if (estudiantes.length === 0) {
      cargarClase({ asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId, paralelo_id: paraleloId }, { incluirGemini: false });
    }
  }, []); // eslint-disable-line

  const handleSeleccionar = async (est: EstudianteClase | null) => {
    console.log('estudiante seleccionado:', est);
    setSeleccionado(est); limpiar();
    if (!est) return;
    await predecir({ matricula_id: est.matricula_id, asignacion_docente_id: asignacionId, periodo_evaluacion_id: periodoId }, { incluirGemini: true, silencioso: true });
  };

  const cfg = resultado ? getNivel(resultado.nivel_riesgo) : null;
const router = useRouter();
  return (
    
    <Box>
      {/* Selector */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <select
          style={{ flex: 1, padding: '10px 14px', borderRadius: 14, border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`, background: 'transparent', color: 'inherit', fontSize: 14, outline: 'none', cursor: 'pointer' }}
          value={seleccionado?.estudiante_id ?? ''}
          onChange={e => {
            const est = estudiantes.find(es => es.estudiante_id === Number(e.target.value)) ?? null;
            handleSeleccionar(est);
          }}
        >
          <option value="">— Seleccioná un estudiante —</option>
          {estudiantes.map(est => (
            <option key={est.estudiante_id} value={est.estudiante_id}>
              {est.nombre_completo} ({getNivel(est.nivel_riesgo).label})
            </option>
          ))}
        </select>
        {estudiantes.length === 0 && <CircularProgress size={24} sx={{ color: accent, alignSelf: 'center' }} />}
      </Box>

      {isLoading && <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress sx={{ color: accent }} size={36} /></Box>}
      {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>}

      {resultado && cfg && !isLoading && (
        <Box sx={{ animation: `${fadeUp} 0.35s ease-out` }}>
          <Box sx={{ borderRadius: '20px', border: `2px solid ${cfg.borderColor}`, bgcolor: isDark ? alpha(cfg.color, 0.04) : alpha(cfg.bgColor, 0.3), p: 2.5, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <NivelChip nivel={resultado.nivel_riesgo} size="medium" />
                <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: cfg.color }}>
                  {resultado.nota_estimada_final.toFixed(1)}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>/100</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">{getClasif(resultado.clasificacion_estimada).label}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" fontWeight={800}>{Math.round(resultado.probabilidad_reprobar * 100)}%</Typography>
                <Typography variant="caption" color="text.secondary">prob. reprobar</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip size="small" label={`Confianza ${resultado.confianza.nivel.replace('_', ' ')}`} sx={{ fontSize: 9, height: 18 }} />
                </Box>
              </Box>
            </Box>
            <ProbBar prob={resultado.probabilidad_reprobar} isDark={isDark} />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                  <WarningAmberRoundedIcon sx={{ fontSize: 13 }} /> RIESGOS
                </Typography>
                {resultado.factores_riesgo.map((f, i) => (
                  <Typography key={i} variant="caption" display="block" color="text.secondary" sx={{ mb: 0.4, lineHeight: 1.5 }}>• {f}</Typography>
                ))}
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> POSITIVOS
                </Typography>
                {resultado.factores_positivos.map((f, i) => (
                  <Typography key={i} variant="caption" display="block" color="text.secondary" sx={{ mb: 0.4, lineHeight: 1.5 }}>• {f}</Typography>
                ))}
              </Box>
            </Box>
          </Box>

          {analisis && (
            <Box sx={{ bgcolor: isDark ? alpha('#f59e0b', 0.07) : alpha('#fef9c3', 0.9), border: `1.5px solid ${alpha('#f59e0b', 0.3)}`, borderRadius: '16px', p: 2.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={800}>Análisis Gemini</Typography>
                {analisis.alerta_urgente && <Chip size="small" label="URGENTE" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 9, height: 18 }} />}
              </Box>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>{analisis.explicacion}</Typography>
              {analisis.recomendaciones.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.6 }}>
                  <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</Typography>
                  <Typography variant="body2">{r}</Typography>
                </Box>
              ))}
              {analisis.recursos_sugeridos.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                    <MenuBookRoundedIcon sx={{ fontSize: 11, color: '#f59e0b' }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">MATERIALES SUGERIDOS</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    {analisis.recursos_sugeridos.map((rec, i) => (
                      <RecursoMaterialCard key={i} recurso={rec} isDark={isDark} accent={accent}
                        basePath="/dashboard/docente/materiales" index={i} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {resultado.nivel_riesgo !== 'bajo' && seleccionado && (
  <Button
    fullWidth variant="contained"
    onClick={() => router.push(
      `/dashboard/docente/prediccion/${asignacionId}/plan` +
      `?matricula_id=${seleccionado.matricula_id}` +
      `&periodo=${periodoId}` +
      `&nombre=${encodeURIComponent(seleccionado.nombre_completo)}`
    )}
    startIcon={<AssignmentRoundedIcon />}
    sx={{ borderRadius: '14px', fontWeight: 700, py: 1.2,
          background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})` }}
  >
    Generar plan de recuperación
  </Button>
)}
        </Box>
      )}

      {!seleccionado && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <PersonRoundedIcon sx={{ fontSize: 56, opacity: 0.2, mb: 1 }} />
          <Typography variant="body2">Seleccioná un estudiante para ver su análisis</Typography>
        </Box>
      )}
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL — 4 tabs
// ══════════════════════════════════════════════════════════════
export default function PrediccionDetallePage() {
  const theme        = useTheme();
  const isDark       = theme.palette.mode === 'dark';
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(0);

  const accent    = isDark ? '#facc15' : '#0284c7';
  const accentEnd = isDark ? '#f59e0b' : '#0369a1';
  const gradBg    = `linear-gradient(135deg, ${accent} 0%, ${accentEnd} 100%)`;

  const asignacionId = parseInt(params.id as string);
  const paraleloId   = parseInt(searchParams.get('paralelo') ?? '');
  const periodoId    = parseInt(searchParams.get('periodo')  ?? '');

  if (isNaN(asignacionId) || isNaN(paraleloId) || isNaN(periodoId)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '14px' }}>
          Parámetros inválidos. Volvé al listado de predicciones.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <IconButton size="small" onClick={() => router.back()}
                sx={{ border: `1.5px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1)}`, borderRadius: '10px' }}>
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: 38, height: 38, borderRadius: '12px', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PsychologyRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={800}
                sx={{ background: gradBg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Predicción de Rendimiento
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 7.5 }}>
              Asignación #{asignacionId} · Período #{periodoId} · Paralelo #{paraleloId}
            </Typography>
          </Box>
        </Fade>

        {/* ── 4 Tabs ── */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          mb: 3,
          '& .MuiTab-root':       { fontWeight: 700, textTransform: 'none', minHeight: 48 },
          '& .MuiTabs-indicator': { background: gradBg, height: 3, borderRadius: 2 },
        }}>
          <Tab icon={<GroupsRoundedIcon      sx={{ fontSize: 18 }} />} iconPosition="start" label="Clase" />
          <Tab icon={<PersonRoundedIcon      sx={{ fontSize: 18 }} />} iconPosition="start" label="Estudiante" />
          {/* TabSimulacion ahora es componente independiente */}
          <Tab icon={<ScienceRoundedIcon     sx={{ fontSize: 18 }} />} iconPosition="start" label="Simulación" />
          {/* Nuevo tab de asignación de recursos */}
          <Tab icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Recursos IA" />
        </Tabs>

        {tab === 0 && (
          <TabClase asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}
        {tab === 1 && (
          <TabEstudiante asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}
        {tab === 2 && (
          // TabSimulacion importado como componente separado
          // Ahora con sliders por dimensión: SAB, HAC, SER+AUT, Asistencia, Semanas
          <TabSimulacion asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}
        {tab === 3 && (
          <TabRecursosIA asignacionId={asignacionId} periodoId={periodoId} paraleloId={paraleloId} accent={accent} isDark={isDark} />
        )}

      </Container>
    </Box>
  );
}