'use client';
// components/estudiante/materiales/QuizEstudiante.tsx

import React, { useState } from 'react';
import {
    Box, Typography, Chip, Button, alpha, CircularProgress,
    Skeleton, Collapse, RadioGroup, FormControlLabel, Radio,
    LinearProgress, Tooltip,
} from '@mui/material';
import {
    Quiz as QuizIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    EmojiEvents as TrophyIcon,
    Refresh as RefreshIcon,
    LightbulbOutlined as TipIcon,
} from '@mui/icons-material';
import { useResolverQuiz } from '@/hooks/useMaterial';
import { usePerfilEstudiante } from '@/hooks/useEstudiante';
import type { QuizPregunta, RespuestaQuizDTO } from '@/types/materialTypes';

interface QuizEstudianteProps {
    tema_id: number;
    accent: string;
    accentDark: string;
    isDark: boolean;
}

export const QuizEstudiante: React.FC<QuizEstudianteProps> = ({
    tema_id, accent, accentDark, isDark,
}) => {
    const { perfil } = usePerfilEstudiante();
    const matricula_id = perfil?.matricula_id ?? null;

    const {
        preguntas, isLoading, enviando,
        resultado, ultimoIntento,
        responder, reiniciar,
    } = useResolverQuiz(tema_id, matricula_id);

    const [expandido, setExpandido] = useState(false);
    const [respuestas, setRespuestas] = useState<Record<number, number>>({});

    const tieneQuiz = preguntas.length > 0;
    const todoRespondido = preguntas.length > 0 && preguntas.every(p => respuestas[p.id] !== undefined);

    const handleResponder = async () => {
        const payload: RespuestaQuizDTO[] = Object.entries(respuestas).map(([quiz_id, respuesta_dada]) => ({
            quiz_id: Number(quiz_id),
            respuesta_dada,
        }));
        await responder(payload);
    };

    const handleReiniciar = () => {
        setRespuestas({});
        reiniciar();
    };

    // Color según puntaje
    const puntajeColor = (puntaje: number) =>
        puntaje >= 70 ? '#16a34a' : puntaje >= 50 ? '#d97706' : '#dc2626';

    const puntajeLabel = (puntaje: number) =>
        puntaje >= 70 ? '¡Excelente!' : puntaje >= 50 ? 'Aprobado' : 'Necesita repaso';

    return (
        <Box sx={{
            mt: 2, borderRadius: '14px', overflow: 'hidden',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        }}>
            {/* ── Header colapsable ── */}
            <Box
                onClick={() => tieneQuiz && setExpandido(p => !p)}
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 3, py: 2,
                    cursor: tieneQuiz ? 'pointer' : 'default',
                    '&:hover': tieneQuiz ? { bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015) } : {},
                }}
            >
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
                            {isLoading
                                ? 'Cargando…'
                                : !tieneQuiz
                                    ? 'El docente aún no ha generado un quiz para este tema'
                                    : resultado
                                        ? `Resultado: ${resultado.correctas}/${resultado.total} correctas`
                                        : ultimoIntento
                                            ? `Último intento: ${ultimoIntento.puntaje}% · ${ultimoIntento.correctas}/${ultimoIntento.total_preguntas}`
                                            : `${preguntas.length} pregunta${preguntas.length !== 1 ? 's' : ''}`}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Badge de último intento */}
                    {!resultado && ultimoIntento && (
                        <Chip
                            icon={<TrophyIcon sx={{ fontSize: '13px !important' }} />}
                            label={`${ultimoIntento.puntaje}%`}
                            size="small"
                            sx={{
                                height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px',
                                bgcolor: alpha(puntajeColor(ultimoIntento.puntaje), 0.12),
                                color: puntajeColor(ultimoIntento.puntaje),
                            }}
                        />
                    )}
                    {/* Badge de resultado actual */}
                    {resultado && (
                        <Chip
                            icon={<TrophyIcon sx={{ fontSize: '13px !important' }} />}
                            label={`${resultado.puntaje}% · ${puntajeLabel(resultado.puntaje)}`}
                            size="small"
                            sx={{
                                height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px',
                                bgcolor: alpha(puntajeColor(resultado.puntaje), 0.12),
                                color: puntajeColor(resultado.puntaje),
                            }}
                        />
                    )}
                    {tieneQuiz && (
                        expandido
                            ? <ExpandLessIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                            : <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    )}
                </Box>
            </Box>

            {/* ── Contenido ── */}
            <Collapse in={expandido && tieneQuiz} timeout="auto">
                <Box sx={{
                    px: 3, pb: 3, pt: 2,
                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '10px' }} />
                            ))}
                        </Box>
                    ) : resultado ? (
                        /* ── Vista de resultados ── */
                        <ResultadoView
                            resultado={resultado}
                            preguntas={preguntas}
                            accent={accent}
                            accentDark={accentDark}
                            isDark={isDark}
                            onReiniciar={handleReiniciar}
                        />
                    ) : (
                        /* ── Vista de preguntas ── */
                        <Box>
                            {/* Progreso de respuestas */}
                            <Box sx={{ mb: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                                        {Object.keys(respuestas).length}/{preguntas.length} respondidas
                                    </Typography>
                                    {ultimoIntento && (
                                        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
                                            Intento anterior: {ultimoIntento.puntaje}%
                                        </Typography>
                                    )}
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(Object.keys(respuestas).length / preguntas.length) * 100}
                                    sx={{
                                        height: 4, borderRadius: 2,
                                        bgcolor: alpha('#a855f7', 0.1),
                                        '& .MuiLinearProgress-bar': {
                                            background: `linear-gradient(90deg, #a855f7, #7c3aed)`,
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>

                            {/* Preguntas */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {preguntas.map((p, idx) => (
                                    <PreguntaItem
                                        key={p.id}
                                        pregunta={p}
                                        index={idx}
                                        respuestaSeleccionada={respuestas[p.id]}
                                        onSeleccionar={(val) => setRespuestas(prev => ({ ...prev, [p.id]: val }))}
                                        accent={accent}
                                        isDark={isDark}
                                    />
                                ))}
                            </Box>

                            {/* Botón enviar */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Tooltip title={!todoRespondido ? 'Responde todas las preguntas para continuar' : ''}>
                                    <span>
                                        <Button
                                            variant="contained"
                                            onClick={handleResponder}
                                            disabled={!todoRespondido || enviando}
                                            startIcon={enviando ? <CircularProgress size={14} color="inherit" /> : <QuizIcon sx={{ fontSize: 16 }} />}
                                            sx={{
                                                borderRadius: '10px', textTransform: 'none',
                                                fontWeight: 700, fontSize: '0.85rem',
                                                px: 3, py: 1,
                                                background: todoRespondido
                                                    ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                                                    : undefined,
                                                color: '#fff', boxShadow: 'none',
                                                '&:disabled': { opacity: 0.5 },
                                            }}
                                        >
                                            {enviando ? 'Enviando…' : 'Enviar respuestas'}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

// ════════════════════════════════════════════════════════════
// PreguntaItem
// ════════════════════════════════════════════════════════════

const PreguntaItem: React.FC<{
    pregunta: QuizPregunta;
    index: number;
    respuestaSeleccionada: number | undefined;
    onSeleccionar: (val: number) => void;
    accent: string;
    isDark: boolean;
}> = ({ pregunta, index, respuestaSeleccionada, onSeleccionar, accent, isDark }) => {
    const respondida = respuestaSeleccionada !== undefined;

    return (
        <Box sx={{
            borderRadius: '12px',
            border: `1px solid ${respondida
                ? alpha('#a855f7', 0.3)
                : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            bgcolor: respondida
                ? isDark ? alpha('#a855f7', 0.05) : alpha('#a855f7', 0.02)
                : isDark ? alpha('#fff', 0.01) : '#fafafa',
            overflow: 'hidden',
            transition: 'all 0.2s',
        }}>
            {/* Cabecera de pregunta */}
            <Box sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.5,
                px: 2, py: 1.5,
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
            }}>
                <Box sx={{
                    width: 24, height: 24, borderRadius: '7px', flexShrink: 0,
                    bgcolor: respondida ? alpha('#a855f7', 0.15) : alpha(accent, 0.1),
                    color: respondida ? '#a855f7' : accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, mt: 0.1,
                }}>
                    {index + 1}
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
                    {pregunta.pregunta}
                </Typography>
                {respondida && (
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#a855f7', flexShrink: 0, mt: 0.2 }} />
                )}
            </Box>

            {/* Opciones */}
            <Box sx={{ px: 2, py: 1.25 }}>
                <RadioGroup
                    value={respuestaSeleccionada ?? ''}
                    onChange={(e) => onSeleccionar(Number(e.target.value))}
                >
                    {pregunta.opciones.map((op, i) => {
                        const seleccionada = respuestaSeleccionada === i;
                        return (
                            <FormControlLabel
                                key={i}
                                value={i}
                                control={
                                    <Radio
                                        size="small"
                                        sx={{
                                            color: alpha('#a855f7', 0.4),
                                            '&.Mui-checked': { color: '#a855f7' },
                                            p: 0.5,
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{
                                        fontSize: '0.82rem',
                                        fontWeight: seleccionada ? 600 : 400,
                                        color: seleccionada ? '#a855f7' : 'text.primary',
                                        transition: 'all 0.15s',
                                    }}>
                                        {op}
                                    </Typography>
                                }
                                sx={{
                                    mx: 0, mb: 0.25, px: 1, py: 0.4, borderRadius: '8px',
                                    bgcolor: seleccionada ? alpha('#a855f7', 0.08) : 'transparent',
                                    border: `1px solid ${seleccionada ? alpha('#a855f7', 0.25) : 'transparent'}`,
                                    transition: 'all 0.15s',
                                    '&:hover': { bgcolor: alpha('#a855f7', 0.05) },
                                }}
                            />
                        );
                    })}
                </RadioGroup>
            </Box>
        </Box>
    );
};

// ════════════════════════════════════════════════════════════
// ResultadoView
// ════════════════════════════════════════════════════════════

const ResultadoView: React.FC<{
    resultado: { resultados: any[]; correctas: number; total: number; puntaje: number };
    preguntas: QuizPregunta[];
    accent: string;
    accentDark: string;
    isDark: boolean;
    onReiniciar: () => void;
}> = ({ resultado, preguntas, accent, isDark, onReiniciar }) => {
    const [detalleExpandido, setDetalleExpandido] = useState(false);

    const puntajeColor = resultado.puntaje >= 70 ? '#16a34a'
        : resultado.puntaje >= 50 ? '#d97706' : '#dc2626';

    const puntajeLabel = resultado.puntaje >= 70 ? '¡Excelente trabajo!'
        : resultado.puntaje >= 50 ? '¡Aprobado! Sigue practicando'
            : 'Necesitas repasar este tema';

    const puntajeEmoji = resultado.puntaje >= 70 ? '🏆'
        : resultado.puntaje >= 50 ? '👍' : '📖';

    return (
        <Box>
            {/* Tarjeta de resultado */}
            <Box sx={{
                p: 3, borderRadius: '14px', textAlign: 'center', mb: 2.5,
                background: `linear-gradient(135deg, ${alpha(puntajeColor, 0.1)}, ${alpha(puntajeColor, 0.04)})`,
                border: `1px solid ${alpha(puntajeColor, 0.2)}`,
            }}>
                <Typography sx={{ fontSize: '2.5rem', mb: 0.5 }}>{puntajeEmoji}</Typography>
                <Typography variant="h3" fontWeight={900} sx={{ color: puntajeColor, lineHeight: 1, mb: 0.5 }}>
                    {resultado.puntaje}%
                </Typography>
                <Typography sx={{ fontWeight: 700, color: puntajeColor, fontSize: '0.9rem', mb: 1 }}>
                    {puntajeLabel}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {resultado.correctas} de {resultado.total} respuestas correctas
                </Typography>

                {/* Barra de puntaje */}
                <Box sx={{ mt: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={resultado.puntaje}
                        sx={{
                            height: 8, borderRadius: 4,
                            bgcolor: alpha(puntajeColor, 0.12),
                            '& .MuiLinearProgress-bar': {
                                bgcolor: puntajeColor, borderRadius: 4,
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, justifyContent: 'center' }}>
                <Button
                    variant="outlined" size="small"
                    onClick={() => setDetalleExpandido(p => !p)}
                    endIcon={detalleExpandido ? <ExpandLessIcon sx={{ fontSize: 15 }} /> : <ExpandMoreIcon sx={{ fontSize: 15 }} />}
                    sx={{
                        borderRadius: '9px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                        borderColor: alpha('#a855f7', 0.4), color: '#a855f7',
                        '&:hover': { bgcolor: alpha('#a855f7', 0.06), borderColor: '#a855f7' },
                    }}
                >
                    {detalleExpandido ? 'Ocultar respuestas' : 'Ver respuestas'}
                </Button>
                <Button
                    variant="outlined" size="small"
                    onClick={onReiniciar}
                    startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                    sx={{
                        borderRadius: '9px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                        borderColor: alpha(accent, 0.4), color: accent,
                        '&:hover': { bgcolor: alpha(accent, 0.06), borderColor: accent },
                    }}
                >
                    Reintentar
                </Button>
            </Box>

            {/* Detalle de respuestas */}
            <Collapse in={detalleExpandido} timeout="auto">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {resultado.resultados.map((r, idx) => {
                        const pregunta = preguntas.find(p => p.id === r.quiz_id);
                        if (!pregunta) return null;

                        return (
                            <Box key={r.quiz_id} sx={{
                                borderRadius: '12px', overflow: 'hidden',
                                border: `1px solid ${r.es_correcta
                                    ? alpha('#16a34a', 0.25)
                                    : alpha('#dc2626', 0.25)}`,
                            }}>
                                {/* Header con resultado */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                    px: 2, py: 1.25,
                                    bgcolor: r.es_correcta
                                        ? isDark ? alpha('#16a34a', 0.1) : '#f0fdf4'
                                        : isDark ? alpha('#dc2626', 0.1) : '#fef2f2',
                                }}>
                                    {r.es_correcta
                                        ? <CheckCircleIcon sx={{ fontSize: 17, color: '#16a34a', flexShrink: 0 }} />
                                        : <CancelIcon sx={{ fontSize: 17, color: '#dc2626', flexShrink: 0 }} />}
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
                                        {pregunta.pregunta}
                                    </Typography>
                                </Box>

                                {/* Opciones con marcas */}
                                <Box sx={{ px: 2, py: 1.25 }}>
                                    {pregunta.opciones.map((op, i) => {
                                        const esDada = i === r.respuesta_dada;
                                        const esCorrecta = i === r.respuesta_correcta;
                                        return (
                                            <Box key={i} sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                py: 0.4, px: 1, borderRadius: '7px', mb: 0.25,
                                                bgcolor: esCorrecta
                                                    ? alpha('#16a34a', 0.08)
                                                    : esDada && !r.es_correcta
                                                        ? alpha('#dc2626', 0.08)
                                                        : 'transparent',
                                                border: `1px solid ${esCorrecta
                                                    ? alpha('#16a34a', 0.2)
                                                    : esDada && !r.es_correcta
                                                        ? alpha('#dc2626', 0.2)
                                                        : 'transparent'}`,
                                            }}>
                                                {esCorrecta
                                                    ? <CheckCircleIcon sx={{ fontSize: 13, color: '#16a34a', flexShrink: 0 }} />
                                                    : esDada && !r.es_correcta
                                                        ? <CancelIcon sx={{ fontSize: 13, color: '#dc2626', flexShrink: 0 }} />
                                                        : <Box sx={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${alpha(isDark ? '#fff' : '#000', 0.15)}`, flexShrink: 0 }} />}
                                                <Typography sx={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: esCorrecta || (esDada && !r.es_correcta) ? 600 : 400,
                                                    color: esCorrecta ? '#16a34a' : esDada && !r.es_correcta ? '#dc2626' : 'text.secondary',
                                                }}>
                                                    {op}
                                                    {esDada && !esCorrecta && (
                                                        <Typography component="span" sx={{ fontSize: '0.68rem', color: '#dc2626', ml: 0.5 }}>
                                                            (tu respuesta)
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Box>
                                        );
                                    })}

                                    {/* Explicación */}
                                    {r.explicacion && (
                                        <Box sx={{
                                            display: 'flex', gap: 0.75, alignItems: 'flex-start', mt: 1,
                                            p: 1, borderRadius: '8px',
                                            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                                        }}>
                                            <TipIcon sx={{ fontSize: 14, color: '#d97706', flexShrink: 0, mt: 0.1 }} />
                                            <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', lineHeight: 1.5, fontStyle: 'italic' }}>
                                                {r.explicacion}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Collapse>
        </Box>
    );
};

export default QuizEstudiante;