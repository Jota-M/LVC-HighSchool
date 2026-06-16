'use client';
// components/estudiante/materiales/MiAvanceTab.tsx

import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Card, Grid, Chip, alpha, Skeleton, Fade,
    LinearProgress, ToggleButtonGroup, ToggleButton, Tooltip,
} from '@mui/material';
import {
    TrendingUp as TrendIcon,
    CalendarMonth as CalIcon,
    CheckCircle as CheckIcon,
    RadioButtonUnchecked as PendingIcon,
    BarChart as ChartIcon,
    List as ListIcon,
    EventAvailable as PresenteIcon,
    EventBusy as AusenteIcon,
    EventNote as TardanzaIcon,
    Cancel as CancelIcon,
    Schedule as LateIcon,
} from '@mui/icons-material';
import {
    useProgresoEstudiante,
    useAsistenciaEstudiante,
    useAsistenciaDetalleEstudiante,
} from '@/hooks/useEstudiante';
import { ESTADOS_PROGRESO } from '@/types/materialTypes';
import type { MateriaResumen } from '@/services/estudianteService';

interface MiAvanceTabProps {
    materia: MateriaResumen;
    accent: string;
    accentDark: string;
    isDark: boolean;
}

const ESTADOS_ASISTENCIA = {
    presente: { label: 'Presente', color: '#16a34a', bg: '#dcfce7', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
    ausente: { label: 'Ausente', color: '#dc2626', bg: '#fee2e2', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
    tardanza: { label: 'Tardanza', color: '#d97706', bg: '#fef3c7', icon: <LateIcon sx={{ fontSize: 14 }} /> },
    justificado: { label: 'Justificado', color: '#2563eb', bg: '#dbeafe', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
};

const getNombreMes = (mes: number) =>
    ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][mes - 1] ?? '';

const getDiaSemana = (fecha: string) => {
    const d = new Date(fecha + 'T12:00:00');
    return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()];
};

type VistaAsistencia = 'lista' | 'calendario';

export const MiAvanceTab: React.FC<MiAvanceTabProps> = ({
    materia, accent, accentDark, isDark,
}) => {
    const [vistaAsistencia, setVistaAsistencia] = useState<VistaAsistencia>('lista');

    // ── Progreso ──
    const {
        progreso, isLoading: loadingProgreso,
        porcentajeGeneral, completados, totalTemas,
    } = useProgresoEstudiante(materia.grado_materia_id);

    // ── Asistencia ──
    const { detalle, isLoading: loadingDetalle } = useAsistenciaDetalleEstudiante({
        asignacion_docente_id: materia.asignacion_docente_id,
    });

    const isLoading = loadingProgreso || loadingDetalle;

    // Stats asistencia
    const statsAsistencia = useMemo(() => {
        const total = materia.asistencias_total ?? detalle.length;
        const presente = materia.asistencias_presentes ?? detalle.filter(d => d.estado === 'presente').length;
        const ausente = materia.asistencias_ausentes ?? detalle.filter(d => d.estado === 'ausente').length;
        const tardanzas = detalle.filter(d => d.estado === 'tardanza').length;
        const justificados = detalle.filter(d => d.estado === 'justificado').length;
        const porcentaje = total > 0 ? Math.round((presente / total) * 100) : 0;
        return { total, presente, ausente, tardanzas, justificados, porcentaje };
    }, [materia, detalle]);

    // Agrupar por mes para calendario
    const porMes = useMemo(() => {
        const mapa: Record<string, typeof detalle> = {};
        detalle.forEach(d => {
            const fecha = new Date((d.fecha ?? '') + 'T12:00:00');
            if (isNaN(fecha.getTime())) return;
            const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!mapa[key]) mapa[key] = [];
            mapa[key].push(d);
        });
        return Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b));
    }, [detalle]);

    const alertColor = statsAsistencia.porcentaje >= 80 ? '#16a34a'
        : statsAsistencia.porcentaje >= 60 ? '#d97706' : '#dc2626';

    const contadoresProgreso = ESTADOS_PROGRESO.map(e => ({
        ...e,
        count: progreso.filter(p => p.estado === e.value).length,
    }));

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="rounded" height={160} sx={{ borderRadius: '18px' }} />
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: '18px' }} />
                <Skeleton variant="rounded" height={200} sx={{ borderRadius: '14px' }} />
            </Box>
        );
    }

    return (
        <Fade in timeout={300}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* ══════════════════════════════════
            BLOQUE 1 — Progreso del curso
        ══════════════════════════════════ */}
                <Card elevation={0} sx={{
                    borderRadius: '18px',
                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                    background: `linear-gradient(135deg, ${alpha(accent, 0.07)}, ${alpha(accentDark, 0.03)})`,
                    p: 2.5,
                }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendIcon sx={{ color: accent, fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight={800}>Progreso del curso</Typography>
                        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                            <Typography variant="h4" fontWeight={900} sx={{ color: accent, lineHeight: 1 }}>
                                {porcentajeGeneral}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {completados}/{totalTemas} temas
                            </Typography>
                        </Box>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={porcentajeGeneral}
                        sx={{
                            height: 10, borderRadius: 5, mb: 2,
                            bgcolor: alpha(accent, 0.12),
                            '& .MuiLinearProgress-bar': {
                                bgcolor: accent, borderRadius: 5,
                                background: `linear-gradient(90deg, ${accent}, ${accentDark})`,
                            },
                        }}
                    />

                    {/* Contadores por estado */}
                    <Grid container spacing={1.5}>
                        {contadoresProgreso.map(c => (
                            <Grid key={c.value} size={{ xs: 6, sm: 3 }}>
                                <Box sx={{
                                    p: 1.5, borderRadius: '12px',
                                    bgcolor: isDark ? alpha(c.color, 0.12) : c.bgColor,
                                    border: `1px solid ${alpha(c.color, 0.2)}`,
                                    textAlign: 'center',
                                }}>
                                    <Typography variant="h5" fontWeight={900} sx={{ color: c.color, lineHeight: 1 }}>
                                        {c.count}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: c.color, fontWeight: 600, fontSize: '0.65rem' }}>
                                        {c.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Card>

                {/* Lista de temas */}
                {progreso.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                            TEMAS
                        </Typography>
                        {progreso.map(p => {
                            const estadoInfo = ESTADOS_PROGRESO.find(e => e.value === p.estado);
                            return (
                                <Card key={p.tema_id} elevation={0} sx={{
                                    borderRadius: '12px',
                                    border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                                    p: 1.75,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                            bgcolor: estadoInfo?.color ?? '#9ca3af',
                                            boxShadow: `0 0 0 3px ${alpha(estadoInfo?.color ?? '#9ca3af', 0.2)}`,
                                        }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                                                    {p.tema_titulo ?? `Tema ${p.tema_id}`}
                                                </Typography>
                                                <Typography variant="caption" fontWeight={800} sx={{ color: accent, ml: 1, flexShrink: 0 }}>
                                                    {p.porcentaje_avance}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Number(p.porcentaje_avance)}
                                                sx={{
                                                    height: 4, borderRadius: 3,
                                                    bgcolor: alpha(estadoInfo?.color ?? accent, 0.12),
                                                    '& .MuiLinearProgress-bar': { bgcolor: estadoInfo?.color ?? accent, borderRadius: 3 },
                                                }}
                                            />
                                        </Box>
                                        <Chip
                                            label={`${estadoInfo?.icon ?? ''} ${estadoInfo?.label ?? 'No iniciado'}`}
                                            size="small"
                                            sx={{
                                                height: 20, fontSize: '0.62rem', fontWeight: 600, flexShrink: 0,
                                                bgcolor: isDark ? alpha(estadoInfo?.color ?? '#9ca3af', 0.15) : estadoInfo?.bgColor ?? '#f3f4f6',
                                                color: estadoInfo?.color ?? '#6b7280',
                                            }}
                                        />
                                    </Box>
                                    {p.tiempo_dedicado > 0 && (
                                        <Typography variant="caption" color="text.disabled" sx={{ pl: 3.5, mt: 0.5, display: 'block' }}>
                                            {Math.round(p.tiempo_dedicado / 60)} min estudiados
                                        </Typography>
                                    )}
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Fade>
    );
};

// ── Calendario de puntos por mes ──────────────────────────────

const CalendarioDots: React.FC<{
    anio: number;
    mes: number;
    registros: any[];
    isDark: boolean;
    accent: string;
}> = ({ anio, mes, registros, isDark, accent }) => {
    const nombreMes = new Date(anio, mes - 1, 1).toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });
    const mapaFechas: Record<string, string> = {};
    registros.forEach(r => {
        const f = r.fecha ?? '';
        if (f) mapaFechas[f.slice(0, 10)] = r.estado ?? 'presente';
    });

    const primerDia = new Date(anio, mes - 1, 1).getDay();
    const totalDias = new Date(anio, mes, 0).getDate();
    const dias: (number | null)[] = [...Array(primerDia).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
    while (dias.length % 7 !== 0) dias.push(null);

    const DIAS_SEM = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize', mb: 1.5 }}>
                {nombreMes}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.75 }}>
                {DIAS_SEM.map(d => (
                    <Typography key={d} variant="caption" sx={{ textAlign: 'center', color: 'text.disabled', fontSize: '0.6rem', fontWeight: 600 }}>
                        {d}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                {dias.map((dia, idx) => {
                    if (!dia) return <Box key={idx} />;
                    const key = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    const estadoKey = (mapaFechas[key] ?? null) as keyof typeof ESTADOS_ASISTENCIA | null;
                    const estado = estadoKey ? ESTADOS_ASISTENCIA[estadoKey] : null;

                    return (
                        <Tooltip key={idx} title={estado ? `${dia}: ${estado.label}` : `${dia}`} placement="top" arrow>
                            <Box sx={{
                                aspectRatio: '1', borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: estado
                                    ? isDark ? alpha(estado.color, 0.25) : alpha(estado.color, 0.15)
                                    : isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03),
                                border: `1px solid ${estado ? alpha(estado.color, 0.35) : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                                transition: 'transform 0.15s',
                                '&:hover': estado ? { transform: 'scale(1.15)' } : {},
                            }}>
                                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: estado ? 700 : 400, color: estado ? estado.color : 'text.disabled' }}>
                                    {dia}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
};

export default MiAvanceTab;