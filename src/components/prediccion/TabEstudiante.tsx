// components/prediccion/TabEstudiante.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Chip, Alert, Button, CircularProgress,
    Divider, Avatar, Autocomplete, TextField, alpha,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';

import {
    usePrediccionClase,
    usePrediccionEstudiante,
} from '@/hooks/usePrediccion';
import { EstudianteClase } from '@/types/prediccionTypes';
import RecursoMaterialCard from '@/components/prediccion/RecursoMaterialCard';
import ModalNotificarPadre from '@/components/prediccion/ModalNotificarPadre';
import {
    fadeUp, getNivel, getClasif, getInitials, NivelChip, ProbBar,
} from '@/components/prediccion/prediccionShared';

interface TabEstudianteProps {
    asignacionId: number;
    periodoId: number;
    paraleloId: number;
    accent: string;
    isDark: boolean;
}

const TabEstudiante: React.FC<TabEstudianteProps> = ({ asignacionId, periodoId, paraleloId, accent, isDark }) => {
    const { estudiantes, analizar: cargarClase } = usePrediccionClase();
    const {
        resultado, analisis, meta, candidatoNotificacionPadre,
        isLoading, error, predecir, limpiar,
    } = usePrediccionEstudiante();
    const [seleccionado, setSeleccionado] = useState<EstudianteClase | null>(null);
    const [modalNotificarOpen, setModalNotificarOpen] = useState(false);
    const [padreNotificado, setPadreNotificado] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (estudiantes.length === 0) {
            cargarClase({
                asignacion_docente_id: asignacionId,
                periodo_evaluacion_id: periodoId,
                paralelo_id: paraleloId,
            }, { incluirGemini: false });
        }
    }, []); // eslint-disable-line

    const handleSeleccionar = async (est: EstudianteClase | null) => {
        setSeleccionado(est);
        setPadreNotificado(false);
        limpiar();
        if (!est) return;
        await predecir({
            matricula_id: est.matricula_id,
            asignacion_docente_id: asignacionId,
            periodo_evaluacion_id: periodoId,
        }, { incluirGemini: true, silencioso: true });
    };

    const cfg = resultado ? getNivel(resultado.nivel_riesgo) : null;

    // El backend arma el candidato con los datos de la predicción, pero no
    // conoce el nombre — lo completamos acá con el estudiante seleccionado.
    const candidatoConNombre = candidatoNotificacionPadre && seleccionado
        ? { ...candidatoNotificacionPadre, nombre_completo: seleccionado.nombre_completo }
        : null;

    return (
        <Box>
            {/* Selector */}
            <Autocomplete
                options={estudiantes}
                getOptionLabel={e => e.nombre_completo}
                value={seleccionado}
                onChange={(_, val) => handleSeleccionar(val)}
                loading={estudiantes.length === 0}
                renderOption={(props, option) => {
                    const optCfg = getNivel(option.nivel_riesgo);
                    return (
                        <Box component="li" {...props} sx={{ gap: 1.5 }}>
                            <Avatar sx={{
                                width: 32, height: 32, flexShrink: 0,
                                bgcolor: alpha(optCfg.color, 0.15), color: optCfg.color,
                                fontWeight: 800, fontSize: 12,
                            }}>
                                {getInitials(option.nombre_completo)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={700}>{option.nombre_completo}</Typography>
                                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                                    <NivelChip nivel={option.nivel_riesgo} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                        {Math.round(option.probabilidad_reprobar * 100)}% riesgo · {option.nota_estimada_final.toFixed(1)} pts
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                }}
                renderInput={params => (
                    <TextField {...params} label="Seleccioná un estudiante"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (<>{estudiantes.length === 0 && <CircularProgress size={16} />}{params.InputProps.endAdornment}</>),
                        }} />
                )}
                sx={{ mb: 3 }}
            />

            {isLoading && (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress sx={{ color: accent }} size={36} />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>}

            {resultado && cfg && !isLoading && (
                <Box sx={{ animation: `${fadeUp} 0.35s ease-out` }}>
                    <Box sx={{
                        borderRadius: '20px',
                        border: `2px solid ${cfg.borderColor}`,
                        bgcolor: isDark ? alpha(cfg.color, 0.04) : alpha(cfg.bgColor, 0.3),
                        p: 2.5, mb: 2,
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <NivelChip nivel={resultado.nivel_riesgo} size="medium" />
                                <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: cfg.color }}>
                                    {resultado.nota_estimada_final.toFixed(1)}
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>/100</Typography>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {getClasif(resultado.clasificacion_estimada).label}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" fontWeight={800}>
                                    {Math.round(resultado.probabilidad_reprobar * 100)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">prob. reprobar</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip size="small"
                                        label={`Confianza ${resultado.confianza.nivel.replace('_', ' ')}`}
                                        sx={{ fontSize: 9, height: 18 }} />
                                </Box>
                            </Box>
                        </Box>
                        <ProbBar prob={resultado.probabilidad_reprobar} isDark={isDark} />
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" fontWeight={700}
                                    sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                                    <WarningAmberRoundedIcon sx={{ fontSize: 13 }} /> RIESGOS
                                </Typography>
                                {resultado.factores_riesgo.map((f, i) => (
                                    <Typography key={i} variant="caption" display="block" color="text.secondary"
                                        sx={{ mb: 0.4, lineHeight: 1.5 }}>• {f}</Typography>
                                ))}
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={700}
                                    sx={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                                    <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> POSITIVOS
                                </Typography>
                                {resultado.factores_positivos.map((f, i) => (
                                    <Typography key={i} variant="caption" display="block" color="text.secondary"
                                        sx={{ mb: 0.4, lineHeight: 1.5 }}>• {f}</Typography>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Notificar al padre — solo aparece si el backend marcó al estudiante
                        como candidato (riesgo crítico). No se envía nada hasta confirmar. */}
                    {candidatoConNombre && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 1.5, mb: 2, p: 2, borderRadius: '16px',
                            border: `1.5px solid ${alpha('#dc2626', 0.25)}`,
                            bgcolor: isDark ? alpha('#dc2626', 0.06) : alpha('#fee2e2', 0.4),
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <CampaignRoundedIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="body2" fontWeight={700}>
                                        Riesgo crítico detectado
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {padreNotificado ? 'Padre/madre ya notificado' : '¿Avisar al padre/madre por WhatsApp?'}
                                    </Typography>
                                </Box>
                            </Box>
                            {padreNotificado ? (
                                <Chip size="small" icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                                    label="Notificado" sx={{ bgcolor: alpha('#16a34a', 0.15), color: '#16a34a', fontWeight: 700 }} />
                            ) : (
                                <Button
                                    variant="contained" size="small"
                                    onClick={() => setModalNotificarOpen(true)}
                                    sx={{
                                        borderRadius: '10px', fontWeight: 700, flexShrink: 0,
                                        bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' },
                                    }}
                                >
                                    Notificar al padre
                                </Button>
                            )}
                        </Box>
                    )}

                    {analisis && (
                        <Box sx={{
                            bgcolor: isDark ? alpha('#f59e0b', 0.07) : alpha('#fef9c3', 0.9),
                            border: `1.5px solid ${alpha('#f59e0b', 0.3)}`,
                            borderRadius: '16px', p: 2.5, mb: 2,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                                <Typography variant="subtitle2" fontWeight={800}>Análisis Gemini</Typography>
                                {analisis.alerta_urgente && (
                                    <Chip size="small" label="URGENTE"
                                        sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 9, height: 18 }} />
                                )}
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
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                                            MATERIALES SUGERIDOS
                                        </Typography>
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
                            sx={{
                                borderRadius: '14px', fontWeight: 700, py: 1.2,
                                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.7)})`,
                            }}
                        >
                            Generar plan de recuperación
                        </Button>
                    )}
                </Box>
            )}

            {!seleccionado && !isLoading && (
                <Box sx={{ textAlign: 'center', py: 8, border: `2px dashed ${alpha(accent, 0.2)}`, borderRadius: '20px', color: 'text.secondary' }}>
                    <PersonSearchRoundedIcon sx={{ fontSize: 52, opacity: 0.2, mb: 1.5 }} />
                    <Typography variant="body2" fontWeight={600}>Seleccioná un estudiante</Typography>
                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                        Visualizá su análisis predictivo y recomendaciones
                    </Typography>
                </Box>
            )}

            {candidatoConNombre && (
                <ModalNotificarPadre
                    open={modalNotificarOpen}
                    onClose={() => setModalNotificarOpen(false)}
                    candidatos={[candidatoConNombre]}
                    asignacionId={asignacionId}
                    accent={accent}
                    isDark={isDark}
                    onNotificado={() => {
                        setPadreNotificado(true);
                        setModalNotificarOpen(false);
                    }}
                />
            )}
        </Box>
    );
};

export default TabEstudiante;