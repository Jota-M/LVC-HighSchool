// components/prediccion/TabClase.tsx
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Typography, Chip, Tooltip, Alert, Button,
    Paper, Drawer, Avatar, alpha,
} from '@mui/material';

import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { usePrediccionClase } from '@/hooks/usePrediccion';
import { EstudianteClase } from '@/types/prediccionTypes';
import StudentPanel from '@/components/prediccion/StudentPanel';
import {
    fadeUp, pulse, getNivel, getInitials, NivelChip,
} from '@/components/prediccion/prediccionShared';

interface TabClaseProps {
    asignacionId: number;
    periodoId: number;
    paraleloId: number;
    accent: string;
    isDark: boolean;
}

const TabClase: React.FC<TabClaseProps> = ({ asignacionId, periodoId, paraleloId, accent, isDark }) => {
    const { estudiantes, resumen, analisisGemini, isLoading, error, analizar } = usePrediccionClase();
    const [cargado, setCargado] = useState(false);
    const [panelEst, setPanelEst] = useState<EstudianteClase | null>(null);
    const [filtroNivel, setFiltroNivel] = useState<string>('todos');
    const [busqueda, setBusqueda] = useState('');

    // Guard para evitar doble petición (useEffect + click simultáneo)
    const peticionEnCurso = useRef(false);

    const gradBg = `linear-gradient(135deg, ${accent} 0%, ${alpha(accent, 0.7)} 100%)`;

    const cargar = useCallback(async () => {
        if (peticionEnCurso.current) return; // ya hay una petición en vuelo
        peticionEnCurso.current = true;
        try {
            await analizar({
                asignacion_docente_id: asignacionId,
                periodo_evaluacion_id: periodoId,
                paralelo_id: paraleloId,
            });
            setCargado(true);
        } finally {
            peticionEnCurso.current = false;
        }
    }, [analizar, asignacionId, periodoId, paraleloId]);

    useEffect(() => {
        cargar();
    }, []); // eslint-disable-line

    const ordenRiesgo: Record<string, number> = { critico: 0, alto: 1, medio: 2, bajo: 3 };
    const estudiantesFiltrados = estudiantes
        .filter(e => filtroNivel === 'todos' || e.nivel_riesgo === filtroNivel)
        .filter(e => !busqueda || e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))
        .sort((a, b) => (ordenRiesgo[a.nivel_riesgo] ?? 4) - (ordenRiesgo[b.nivel_riesgo] ?? 4));

    return (
        <Box>
            {/* Loading inicial */}
            {isLoading && (
                <Box sx={{ textAlign: 'center', py: 12 }}>
                    <Box sx={{
                        width: 72, height: 72, borderRadius: '22px', mx: 'auto', mb: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: gradBg, animation: `${pulse} 1.6s ease-in-out infinite`,
                        boxShadow: `0 8px 24px ${alpha(accent, 0.35)}`,
                    }}>
                        <PsychologyRoundedIcon sx={{ color: '#fff', fontSize: 34 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
                        Analizando la clase…
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {estudiantes.length > 0
                            ? `Procesando ${estudiantes.length} estudiantes`
                            : 'El modelo ML está evaluando a todos los estudiantes'}
                    </Typography>
                </Box>
            )}

            {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>}

            {cargado && !isLoading && resumen && (
                <Box sx={{ animation: `${fadeUp} 0.35s ease-out` }}>

                    {/* ── Stats grandes con icon-badge ─────────────────── */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 2, mb: 4 }}>
                        {[
                            { label: 'Total estudiantes', value: resumen.total_estudiantes, color: accent, icon: GroupsRoundedIcon },
                            { label: 'Crítico', value: resumen.en_riesgo_critico, color: '#dc2626', icon: WarningAmberRoundedIcon },
                            { label: 'Alto', value: resumen.en_riesgo_alto, color: '#ea580c', icon: WarningAmberRoundedIcon },
                            { label: 'Medio', value: resumen.en_riesgo_medio, color: '#d97706', icon: WarningAmberRoundedIcon },
                            { label: 'Sin riesgo', value: resumen.sin_riesgo, color: '#16a34a', icon: CheckCircleRoundedIcon },
                            { label: 'Promedio clase', value: resumen.promedio_clase.toFixed(1), color: accent, icon: AssignmentRoundedIcon },
                        ].map(({ label, value, color, icon: Icon }) => (
                            <Paper key={label} elevation={0} sx={{
                                p: 2.5, borderRadius: '20px', position: 'relative', overflow: 'hidden',
                                border: `1.5px solid ${alpha(color, 0.18)}`,
                                bgcolor: isDark ? alpha(color, 0.06) : '#fff',
                                boxShadow: isDark ? 'none' : `0 4px 16px ${alpha('#000', 0.04)}`,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 28px ${alpha(color, 0.22)}` },
                            }}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: '14px', mb: 1.5,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: alpha(color, 0.14),
                                }}>
                                    <Icon sx={{ fontSize: 22, color }} />
                                </Box>
                                <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1, mb: 0.5 }}>
                                    {value}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    {label}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>

                    {/* ── Barra de distribución con labels grandes ──────── */}
                    <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: '20px', mb: 4,
                        border: `1.5px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={800}>Distribución de riesgo</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                                <Typography variant="h4" fontWeight={800} sx={{ color: '#dc2626', lineHeight: 1 }}>
                                    {resumen.pct_riesgo.toFixed(0)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>en riesgo</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', gap: '3px', mb: 1.5 }}>
                            {[
                                { val: resumen.en_riesgo_critico, color: '#dc2626', label: 'Crítico' },
                                { val: resumen.en_riesgo_alto, color: '#ea580c', label: 'Alto' },
                                { val: resumen.en_riesgo_medio, color: '#d97706', label: 'Medio' },
                                { val: resumen.sin_riesgo, color: '#16a34a', label: 'OK' },
                            ].filter(s => s.val > 0).map((seg, i) => (
                                <Tooltip key={i} title={`${seg.label}: ${seg.val} estudiante(s)`}>
                                    <Box sx={{
                                        width: `${(seg.val / resumen.total_estudiantes) * 100}%`, bgcolor: seg.color,
                                        transition: 'opacity 0.2s', cursor: 'pointer',
                                        '&:hover': { opacity: 0.8 },
                                    }} />
                                </Tooltip>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {[
                                { val: resumen.en_riesgo_critico, color: '#dc2626', label: 'Crítico' },
                                { val: resumen.en_riesgo_alto, color: '#ea580c', label: 'Alto' },
                                { val: resumen.en_riesgo_medio, color: '#d97706', label: 'Medio' },
                                { val: resumen.sin_riesgo, color: '#16a34a', label: 'OK' },
                            ].filter(s => s.val > 0).map((seg, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seg.color }} />
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">{seg.label} · {seg.val}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>

                    {/* ── Gemini ───────────────────────── */}
                    {analisisGemini && (
                        <Box sx={{
                            borderRadius: '22px', mb: 4, overflow: 'hidden',
                            border: `1.5px solid ${alpha('#f59e0b', 0.25)}`,
                            bgcolor: isDark ? alpha('#f59e0b', 0.04) : alpha('#fef9c3', 0.45),
                        }}>
                            <Box sx={{
                                px: 3, py: 2.2, display: 'flex', alignItems: 'center', gap: 1.5,
                                background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.2)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`,
                                borderBottom: `1px solid ${alpha('#f59e0b', 0.15)}`,
                            }}>
                                <Box sx={{
                                    width: 40, height: 40, borderRadius: '12px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    bgcolor: alpha('#f59e0b', 0.2),
                                }}>
                                    <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={800}>Análisis Gemini · Clase completa</Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Typography variant="body1" sx={{ mb: 2.5, lineHeight: 1.8, color: 'text.primary' }}>
                                    {analisisGemini.diagnostico}
                                </Typography>

                                <Typography variant="overline" fontWeight={800} sx={{
                                    letterSpacing: 1, color: '#f59e0b', display: 'block', mb: 1.5,
                                }}>
                                    Acciones recomendadas
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                    {analisisGemini.acciones_grupo.map((acc, i) => (
                                        <Box key={i} sx={{
                                            display: 'flex', gap: 1.5, alignItems: 'flex-start',
                                            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#fff', 0.65),
                                            borderRadius: '14px', p: 1.8,
                                        }}>
                                            <Box sx={{
                                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: alpha('#f59e0b', 0.18), color: '#f59e0b',
                                                fontWeight: 800, fontSize: 13,
                                            }}>
                                                {i + 1}
                                            </Box>
                                            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{acc}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {analisisGemini.alerta_institucional && (
                                    <Alert
                                        severity="error"
                                        icon={<WarningAmberRoundedIcon />}
                                        sx={{ mt: 2.5, borderRadius: '14px', fontSize: 13.5, alignItems: 'flex-start', py: 1.5 }}
                                    >
                                        {analisisGemini.mensaje_institucional}
                                    </Alert>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* ── Filtros ──────────────────────────── */}
                    <Box sx={{ display: 'flex', gap: 1.2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <SearchRoundedIcon sx={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                fontSize: 20, color: 'text.secondary',
                            }} />
                            <input
                                style={{
                                    width: '100%', padding: '12px 16px 12px 44px', borderRadius: 14,
                                    border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1)}`,
                                    background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                                    color: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                }}
                                placeholder="Buscar estudiante…"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                        </Box>
                        {['todos', 'critico', 'alto', 'medio', 'bajo'].map(n => {
                            const cfg = n === 'todos' ? null : getNivel(n);
                            return (
                                <Chip key={n}
                                    label={n === 'todos' ? 'Todos' : cfg!.label}
                                    onClick={() => setFiltroNivel(n)}
                                    sx={{
                                        fontWeight: 700, fontSize: 12.5, cursor: 'pointer', border: 'none',
                                        height: 36, px: 0.5,
                                        bgcolor: filtroNivel === n
                                            ? (n === 'todos' ? accent : cfg!.color)
                                            : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                                        color: filtroNivel === n ? '#fff' : 'text.secondary',
                                        transition: 'transform 0.15s',
                                        '&:active': { transform: 'scale(0.95)' },
                                    }}
                                />
                            );
                        })}
                    </Box>

                    {/* ── Grid de estudiantes ─────────── */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
                        {estudiantesFiltrados.map((est, i) => {
                            const cfg = getNivel(est.nivel_riesgo);
                            return (
                                <Box key={est.estudiante_id} onClick={() => setPanelEst(est)} sx={{
                                    p: 2.5, borderRadius: '22px', position: 'relative', overflow: 'hidden',
                                    border: `1.5px solid ${alpha(cfg.color, 0.22)}`,
                                    bgcolor: isDark ? alpha(cfg.color, 0.04) : '#fff',
                                    boxShadow: isDark ? 'none' : `0 4px 16px ${alpha('#000', 0.04)}`,
                                    cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                                    animation: `${fadeUp} 0.25s ease-out ${i * 0.02}s both`,
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: `0 14px 30px ${alpha(cfg.color, 0.25)}`,
                                        borderColor: cfg.color,
                                    },
                                }}>
                                    <Box sx={{
                                        position: 'absolute', left: 0, right: 0, top: 0, height: 5,
                                        bgcolor: cfg.color,
                                    }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                                        <Avatar sx={{
                                            width: 48, height: 48,
                                            bgcolor: alpha(cfg.color, 0.15), color: cfg.color,
                                            fontWeight: 800, fontSize: 16, flexShrink: 0,
                                            border: `2.5px solid ${alpha(cfg.color, 0.25)}`,
                                        }}>
                                            {getInitials(est.nombre_completo)}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ fontSize: 15, mb: 0.5 }}>
                                                {est.nombre_completo}
                                            </Typography>
                                            <NivelChip nivel={est.nivel_riesgo} size="medium" />
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                                        <Box sx={{
                                            flex: 1, textAlign: 'center', borderRadius: '14px', p: 1.5,
                                            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
                                        }}>
                                            <Typography variant="h4" fontWeight={800} sx={{ color: cfg.color, lineHeight: 1.1, mb: 0.3 }}>
                                                {est.nota_estimada_final.toFixed(1)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                Nota est.
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            flex: 1, textAlign: 'center', borderRadius: '14px', p: 1.5,
                                            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
                                        }}>
                                            <Typography variant="h4" fontWeight={800} sx={{
                                                lineHeight: 1.1, mb: 0.3,
                                                color: est.asistencia_pct < 75 ? '#dc2626' : 'text.primary',
                                            }}>
                                                {est.asistencia_pct.toFixed(0)}%
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                Asistencia
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 1.5 }}>
                                        <Box sx={{
                                            height: 6, borderRadius: 3, overflow: 'hidden',
                                            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                                        }}>
                                            <Box sx={{
                                                height: '100%', width: `${est.asistencia_pct}%`,
                                                bgcolor: est.asistencia_pct < 75 ? '#dc2626' : cfg.color,
                                                borderRadius: 3, transition: 'width 0.4s ease-out',
                                            }} />
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    {estudiantesFiltrados.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="body1" color="text.secondary">
                                No se encontraron estudiantes con estos filtros.
                            </Typography>
                        </Box>
                    )}

                    {/* Botón refrescar */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button onClick={cargar} startIcon={<RefreshRoundedIcon />}
                            sx={{
                                color: accent, fontWeight: 700, borderRadius: '12px', px: 3, py: 1,
                                border: `1.5px solid ${alpha(accent, 0.25)}`, fontSize: 14,
                                '&:hover': { bgcolor: alpha(accent, 0.08) },
                            }}>
                            Actualizar análisis
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Panel lateral */}
            <Drawer anchor="right" open={!!panelEst} onClose={() => setPanelEst(null)}
                PaperProps={{ sx: { boxShadow: '0 0 60px rgba(0,0,0,0.25)' } }}>
                <StudentPanel
                    estudiante={panelEst}
                    asignacionId={asignacionId}
                    periodoId={periodoId}
                    isDark={isDark}
                    accent={accent}
                    onClose={() => setPanelEst(null)}
                />
            </Drawer>
        </Box>
    );
};

export default TabClase;