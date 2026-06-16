'use client';
// components/docente/materiales/QuizTema.tsx

import React, { useState } from 'react';
import {
    Box, Typography, Chip, Button, alpha, CircularProgress,
    Skeleton, TextField, Collapse, IconButton, Tooltip,
} from '@mui/material';
import {
    Quiz as QuizIcon,
    AutoAwesome as AutoAwesomeIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useQuizTema, useResumenQuizTema } from '@/hooks/useMaterial';

interface QuizTemaProps {
    tema_id: number;
    paralelo_id: number;
    periodo_academico_id: number;
    accent: string;
    accentDark: string;
    isDark: boolean;
}

export const QuizTema: React.FC<QuizTemaProps> = ({
    tema_id, paralelo_id, periodo_academico_id, accent, accentDark, isDark,
}) => {
    const { preguntas, isLoading, generando, generar } = useQuizTema(tema_id);
    const { resumen, isLoading: loadingResumen } = useResumenQuizTema(tema_id, paralelo_id, periodo_academico_id);

    const [expandido, setExpandido] = useState(false);
    const [cantidad, setCantidad] = useState(5);
    const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

    const tieneQuiz = preguntas.length > 0;

    return (
        <Box sx={{
            mt: 2, borderRadius: '14px', overflow: 'hidden',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        }}>
            {/* Header */}
            <Box
                onClick={() => setExpandido(p => !p)}
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 3, py: 2, cursor: 'pointer',
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) },
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '9px',
                        bgcolor: alpha('#a855f7', 0.1), color: '#a855f7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <QuizIcon sx={{ fontSize: 17 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            Quiz de repaso
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
                            {isLoading ? 'Cargando…' : tieneQuiz ? `${preguntas.length} preguntas` : 'Sin quiz generado'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Resumen rápido (siempre visible si hay datos) */}
                    {!loadingResumen && resumen && resumen.total_intentaron > 0 && (
                        <Chip
                            icon={<TrophyIcon sx={{ fontSize: '13px !important' }} />}
                            label={`Prom. ${resumen.promedio_puntaje}% · ${resumen.total_intentaron}/${resumen.total_estudiantes} resolvieron`}
                            size="small"
                            sx={{
                                height: 22, fontSize: '0.66rem', fontWeight: 700, borderRadius: '6px',
                                bgcolor: alpha(accent, 0.1), color: accent,
                            }} />
                    )}
                    {expandido
                        ? <ExpandLessIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                        : <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.disabled' }} />}
                </Box>
            </Box>

            {/* Contenido expandido */}
            <Collapse in={expandido} timeout="auto">
                <Box sx={{
                    px: 3, pb: 3,
                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                    pt: 2,
                }}>
                    {/* Controles de generación */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                        <TextField
                            size="small" type="number" label="Nº preguntas"
                            value={cantidad}
                            onChange={e => {
                                const v = parseInt(e.target.value) || 1;
                                setCantidad(Math.min(20, Math.max(1, v)));
                            }}
                            inputProps={{ min: 1, max: 20 }}
                            sx={{ width: 130, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                        <Button
                            variant="outlined" size="small"
                            startIcon={generando ? <CircularProgress size={13} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                            onClick={() => generar(cantidad)}
                            disabled={generando}
                            sx={{
                                borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                borderColor: alpha('#a855f7', 0.4), color: '#a855f7',
                                '&:hover': { bgcolor: alpha('#a855f7', 0.06), borderColor: '#a855f7' },
                            }}>
                            {generando ? 'Generando…' : tieneQuiz ? 'Regenerar quiz con IA' : 'Generar quiz con IA'}
                        </Button>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                            Basado en el contenido actual del tema
                        </Typography>
                    </Box>

                    {/* Resumen detallado */}
                    {!loadingResumen && resumen && (
                        <Box sx={{
                            p: 1.5, mb: 2, borderRadius: '10px',
                            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                            border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                            display: 'flex', gap: 3, flexWrap: 'wrap',
                        }}>
                            {[
                                { label: 'Total estudiantes', val: resumen.total_estudiantes },
                                { label: 'Resolvieron', val: resumen.total_intentaron },
                                { label: 'Promedio', val: `${resumen.promedio_puntaje}%` },
                                { label: 'Aprobados (≥51%)', val: resumen.aprobados, color: '#16a34a' },
                            ].map(s => (
                                <Box key={s.label}>
                                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: s.color ?? accent, lineHeight: 1 }}>
                                        {s.val}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.3 }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Lista de preguntas */}
                    {isLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: '8px' }} />)}
                        </Box>
                    ) : !tieneQuiz ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>
                                Aún no hay preguntas generadas para este tema.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {preguntas.map((p, idx) => (
                                <Box key={p.id} sx={{
                                    borderRadius: '10px',
                                    border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                                    overflow: 'hidden',
                                }}>
                                    <Box
                                        onClick={() => setPreguntaAbierta(prev => prev === p.id ? null : p.id)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            px: 2, py: 1.25, cursor: 'pointer',
                                            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01) },
                                        }}>
                                        <Box sx={{
                                            width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                                            bgcolor: alpha(accent, 0.1), color: accent,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.68rem', fontWeight: 800,
                                        }}>
                                            {idx + 1}
                                        </Box>
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, flex: 1 }}>
                                            {p.pregunta}
                                        </Typography>
                                        {preguntaAbierta === p.id
                                            ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                            : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
                                    </Box>

                                    <Collapse in={preguntaAbierta === p.id} timeout="auto">
                                        <Box sx={{ px: 2, pb: 1.5, pl: 6 }}>
                                            {p.opciones.map((op, i) => {
                                                const esCorrecta = i === p.respuesta_correcta;
                                                return (
                                                    <Box key={i} sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1,
                                                        py: 0.4, fontSize: '0.78rem',
                                                        color: esCorrecta ? '#16a34a' : 'text.secondary',
                                                        fontWeight: esCorrecta ? 700 : 400,
                                                    }}>
                                                        {esCorrecta
                                                            ? <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                                                            : <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.15)}` }} />}
                                                        {op}
                                                    </Box>
                                                );
                                            })}
                                            {p.explicacion && (
                                                <Typography sx={{
                                                    mt: 1, fontSize: '0.74rem', color: 'text.disabled',
                                                    fontStyle: 'italic', lineHeight: 1.5,
                                                }}>
                                                    💡 {p.explicacion}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Collapse>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

export default QuizTema;