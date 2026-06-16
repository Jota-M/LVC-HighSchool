// components/prediccion/StudentPanel.tsx
'use client';
import React, { useEffect } from 'react';
import {
    Box, Typography, Chip, Alert, Button, CircularProgress,
    Divider, Paper, IconButton, Avatar, alpha,
} from '@mui/material';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import {
    usePrediccionEstudiante,
    usePlanRecuperacion,
} from '@/hooks/usePrediccion';
import { EstudianteClase } from '@/types/prediccionTypes';
import RecursoMaterialCard from '@/components/prediccion/RecursoMaterialCard';
import {
    fadeUp, getNivel, getClasif, getInitials, NivelChip, ProbBar,
} from '@/components/prediccion/prediccionShared';

interface StudentPanelProps {
    estudiante: EstudianteClase | null;
    asignacionId: number;
    periodoId: number;
    isDark: boolean;
    accent: string;
    onClose: () => void;
}

const StudentPanel: React.FC<StudentPanelProps> = ({
    estudiante, asignacionId, periodoId, isDark, accent, onClose,
}) => {
    const { resultado, analisis, meta, isLoading, error, predecir, limpiar } = usePrediccionEstudiante();
    const { plan, isLoading: planLoading, generarPlan } = usePlanRecuperacion();

    useEffect(() => {
        if (!estudiante) { limpiar(); return; }
        predecir({
            matricula_id: estudiante.matricula_id,
            asignacion_docente_id: asignacionId,
            periodo_evaluacion_id: periodoId,
        }, { incluirGemini: true, silencioso: true });
    }, [estudiante?.estudiante_id]); // eslint-disable-line

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

                        {/* Meta */}
                        {meta && (
                            <Box sx={{
                                display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2,
                                p: 1.5, bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#f8fafc', 1),
                                borderRadius: '10px',
                            }}>
                                {[
                                    ['Semana', `${meta.semana_actual}/${meta.total_semanas}`],
                                    ['SAB', meta.n_notas_sab ?? meta.n_notas_examenes ?? 0],
                                    ['HAC', meta.n_notas_hac ?? meta.n_notas_practicas ?? 0],
                                    ['Asistencia', `${estudiante.asistencia_pct.toFixed(0)}%`],
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
                                bgcolor: isDark ? alpha('#f59e0b', 0.07) : alpha('#fef9c3', 0.9),
                                border: `1.5px solid ${alpha('#f59e0b', 0.3)}`,
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
                                        onClick={() => generarPlan({
                                            matricula_id: estudiante.matricula_id,
                                            asignacion_docente_id: asignacionId,
                                            periodo_evaluacion_id: periodoId,
                                        })}
                                        disabled={planLoading}
                                        startIcon={planLoading ? <CircularProgress size={14} /> : <AssignmentRoundedIcon />}
                                        sx={{ borderRadius: '12px', fontWeight: 700, py: 1 }}>
                                        {planLoading ? 'Generando plan…' : 'Generar plan de recuperación'}
                                    </Button>
                                )}
                                {plan && (
                                    <Box sx={{
                                        bgcolor: isDark ? alpha('#2563eb', 0.07) : alpha('#dbeafe', 0.7),
                                        border: `1.5px solid ${alpha('#2563eb', 0.25)}`,
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

export default StudentPanel;