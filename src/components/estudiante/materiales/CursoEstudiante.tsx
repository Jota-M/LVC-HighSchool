'use client';
// components/estudiante/materiales/CursoEstudiante.tsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Box, Typography, Chip, Button, List, ListItemButton, ListItemText,
    Collapse, LinearProgress, Skeleton, alpha, Tooltip, CircularProgress,
} from '@mui/material';
import {
    MenuBook as MenuBookIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UncheckedIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Article as ArticleIcon,
    AutoStories as AutoStoriesIcon,
    EmojiEvents as TrophyIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useUnidadesTematicas, useTemas } from '@/hooks/useMaterial';
import { useProgresoEstudiante } from '@/hooks/useEstudiante';
import { UnidadTematica, Tema, NIVELES_DIFICULTAD, ESTADOS_PROGRESO } from '@/types/materialTypes';
import type { MateriaResumen } from '@/services/estudianteService';
import { QuizEstudiante } from '@/components/estudiante/materiales/QuizEstudiante';

// ── Tipos internos ────────────────────────────────────────────

interface TemaNavItem {
    tema: Tema;
    unidad: UnidadTematica;
}

interface CursoEstudianteProps {
    materia: MateriaResumen;
    accent: string;
    accentDark: string;
    isDark: boolean;
}

// ── Componente principal ──────────────────────────────────────

export const CursoEstudiante: React.FC<CursoEstudianteProps> = ({
    materia, accent, accentDark, isDark,
}) => {
    const { unidades, isLoading: loadingUnidades } = useUnidadesTematicas({
        grado_materia_id: materia.grado_materia_id,
    });

    const {
        progreso, isLoading: loadingProgreso, actualizar: actualizarProgreso,
        porcentajeGeneral, completados, totalTemas,
    } = useProgresoEstudiante(materia.grado_materia_id);

    const [unidadExpandida, setUnidadExpandida] = useState<number | null>(null);
    const [temaSeleccionado, setTemaSeleccionado] = useState<Tema | null>(null);
    const [unidadDelTema, setUnidadDelTema] = useState<UnidadTematica | null>(null);
    const [temasPorUnidad, setTemasPorUnidad] = useState<Record<number, Tema[]>>({});

    // Auto-expandir primera unidad al cargar
    useEffect(() => {
        if (unidades.length > 0 && unidadExpandida === null) {
            setUnidadExpandida(unidades[0].id);
        }
    }, [unidades]);

    // Lista plana para prev/next
    const listaNavegacion = useMemo<TemaNavItem[]>(() => {
        return unidades.flatMap(u =>
            (temasPorUnidad[u.id] ?? []).map(t => ({ tema: t, unidad: u }))
        );
    }, [unidades, temasPorUnidad]);

    const indexActual = temaSeleccionado
        ? listaNavegacion.findIndex(n => n.tema.id === temaSeleccionado.id)
        : -1;

    const temaPrevio = indexActual > 0 ? listaNavegacion[indexActual - 1] : null;
    const temaSig = indexActual >= 0 && indexActual < listaNavegacion.length - 1
        ? listaNavegacion[indexActual + 1] : null;

    const seleccionarTema = (t: Tema, u: UnidadTematica) => {
        setTemaSeleccionado(t);
        setUnidadDelTema(u);
        setUnidadExpandida(u.id);
    };

    // Helpers de progreso
    const getProgresoDeTema = (tema_id: number) =>
        progreso.find(p => p.tema_id === tema_id);

    const isLoading = loadingUnidades || loadingProgreso;

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            alignItems: { xs: 'stretch', md: 'flex-start' },
        }}>

            {/* ── Sidebar ── */}
            <Box sx={{
                width: { xs: '100%', md: 300 },
                flexShrink: 0, borderRadius: '14px',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                overflow: 'hidden',
                position: { xs: 'static', md: 'sticky' },
                top: 16,
            }}>

                {/* Header con progreso global — sin cambios */}
                <Box sx={{
                    px: 2, py: 1.5,
                    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MenuBookIcon sx={{ fontSize: 15, color: accent }} />
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, flex: 1 }}>
                            Contenido del curso
                        </Typography>
                        {!isLoading && totalTemas > 0 && (
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: accent }}>
                                {completados}/{totalTemas}
                            </Typography>
                        )}
                    </Box>

                    {!isLoading && totalTemas > 0 && (
                        <Box>
                            <LinearProgress
                                variant="determinate"
                                value={porcentajeGeneral}
                                sx={{
                                    height: 4, borderRadius: '3px',
                                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: '3px',
                                        background: `linear-gradient(90deg, ${accent}, ${accentDark})`,
                                    },
                                }}
                            />
                            <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mt: 0.4 }}>
                                {porcentajeGeneral}% completado
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Lista de unidades */}
                {isLoading ? (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: '8px' }} />
                        ))}
                    </Box>
                ) : unidades.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <ArticleIcon sx={{ fontSize: 28, color: alpha(accent, 0.3), mb: 1 }} />
                        <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.78rem' }}>
                            El docente aún no ha publicado contenido del curso.
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding sx={{
                        maxHeight: { xs: 320, md: 'calc(100vh - 280px)' }, // 👈 acotado en mobile
                        overflowY: 'auto',
                    }}>
                        {unidades.map(u => (
                            <UnidadItemEstudiante
                                key={u.id}
                                unidad={u}
                                accent={accent}
                                isDark={isDark}
                                expandida={unidadExpandida === u.id}
                                onToggle={() => setUnidadExpandida(prev => prev === u.id ? null : u.id)}
                                temaSeleccionadoId={temaSeleccionado?.id ?? null}
                                onSelectTema={(t) => seleccionarTema(t, u)}
                                onTemasChange={(temas) => setTemasPorUnidad(prev => ({ ...prev, [u.id]: temas }))}
                                getProgresoDeTema={getProgresoDeTema}
                            />
                        ))}
                    </List>
                )}
            </Box>

            {/* ── Panel principal ── */}
            <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
                {temaSeleccionado && unidadDelTema ? (
                    <LectorTema
                        key={temaSeleccionado.id}
                        tema={temaSeleccionado}
                        unidad={unidadDelTema}
                        accent={accent}
                        accentDark={accentDark}
                        isDark={isDark}
                        progresoActual={getProgresoDeTema(temaSeleccionado.id)}
                        onActualizarProgreso={actualizarProgreso}
                        temaPrevio={temaPrevio}
                        temaSiguiente={temaSig}
                        onNavegar={(nav) => seleccionarTema(nav.tema, nav.unidad)}
                    />
                ) : (
                    <Box sx={{
                        textAlign: 'center', py: 14, borderRadius: '14px',
                        border: `1px dashed ${alpha(accent, 0.2)}`,
                    }}>
                        <AutoStoriesIcon sx={{ fontSize: 40, color: alpha(accent, 0.3), mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
                            Selecciona un tema para comenzar
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            Navega por el temario del panel izquierdo y elige el contenido que quieres estudiar.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );

};

// ════════════════════════════════════════════════════════════
// UnidadItemEstudiante — fila del sidebar (solo lectura)
// ════════════════════════════════════════════════════════════

const UnidadItemEstudiante: React.FC<{
    unidad: UnidadTematica;
    accent: string;
    isDark: boolean;
    expandida: boolean;
    onToggle: () => void;
    temaSeleccionadoId: number | null;
    onSelectTema: (t: Tema) => void;
    onTemasChange: (temas: Tema[]) => void;
    getProgresoDeTema: (tema_id: number) => any;
}> = ({
    unidad, accent, isDark, expandida, onToggle,
    temaSeleccionadoId, onSelectTema, onTemasChange, getProgresoDeTema,
}) => {
        const { temas, isLoading } = useTemas({ unidad_tematica_id: unidad.id });

        useEffect(() => { onTemasChange(temas); }, [temas]);

        // Calcular completados en esta unidad
        const completadosUnidad = temas.filter(t => {
            const p = getProgresoDeTema(t.id);
            return p?.estado === 'completado';
        }).length;

        return (
            <>
                <ListItemButton
                    onClick={onToggle}
                    sx={{
                        py: 1, px: 2,
                        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
                    }}
                >
                    {/* Número de unidad */}
                    <Box sx={{
                        width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                        bgcolor: alpha(accent, 0.1), color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem', fontWeight: 800, mr: 1.25,
                    }}>
                        {unidad.numero_unidad}
                    </Box>

                    <ListItemText
                        primary={unidad.titulo}
                        primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600, noWrap: true }}
                        secondary={
                            temas.length > 0
                                ? `${completadosUnidad}/${temas.length} completados`
                                : `${unidad.total_temas ?? 0} tema${(unidad.total_temas ?? 0) === 1 ? '' : 's'}`
                        }
                        secondaryTypographyProps={{ fontSize: '0.63rem' }}
                    />

                    {expandida
                        ? <ExpandLessIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.disabled' }} />
                        : <ExpandMoreIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.disabled' }} />}
                </ListItemButton>

                {/* Temas anidados */}
                <Collapse in={expandida} timeout="auto">
                    <Box sx={{ pl: 3.5, pr: 1.5, py: 0.75 }}>
                        {isLoading ? (
                            <Skeleton variant="rounded" height={28} sx={{ borderRadius: '6px' }} />
                        ) : temas.length === 0 ? (
                            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', py: 0.5 }}>
                                Sin temas en esta unidad
                            </Typography>
                        ) : (
                            temas.map(t => {
                                const p = getProgresoDeTema(t.id);
                                const completado = p?.estado === 'completado';
                                const enProgreso = p?.estado === 'en_progreso' || p?.estado === 'revisando';
                                const seleccionado = temaSeleccionadoId === t.id;

                                return (
                                    <ListItemButton
                                        key={t.id}
                                        selected={seleccionado}
                                        onClick={() => onSelectTema(t)}
                                        sx={{
                                            borderRadius: '7px', py: 0.55, px: 1, mb: 0.25,
                                            '&.Mui-selected': { bgcolor: alpha(accent, 0.1) },
                                            '&.Mui-selected:hover': { bgcolor: alpha(accent, 0.14) },
                                        }}
                                    >
                                        {/* Indicador de progreso */}
                                        <Box sx={{ mr: 0.75, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                            {completado ? (
                                                <CheckCircleIcon sx={{ fontSize: 13, color: '#16a34a' }} />
                                            ) : enProgreso ? (
                                                <Box sx={{
                                                    width: 12, height: 12, borderRadius: '50%',
                                                    border: `2px solid ${accent}`,
                                                    bgcolor: alpha(accent, 0.2),
                                                }} />
                                            ) : (
                                                <UncheckedIcon sx={{ fontSize: 13, color: alpha('#000', 0.2) }} />
                                            )}
                                        </Box>

                                        <ListItemText
                                            primary={`${unidad.numero_unidad}.${t.numero_tema} ${t.titulo}`}
                                            primaryTypographyProps={{
                                                fontSize: '0.74rem',
                                                fontWeight: seleccionado ? 700 : 400,
                                                noWrap: true,
                                                color: seleccionado ? accent : completado ? 'text.secondary' : 'text.primary',
                                                sx: { textDecoration: completado ? 'none' : 'none' },
                                            }}
                                        />
                                    </ListItemButton>
                                );
                            })
                        )}
                    </Box>
                </Collapse>
            </>
        );
    };

// ════════════════════════════════════════════════════════════
// LectorTema — panel de lectura del estudiante
// ════════════════════════════════════════════════════════════

const LectorTema: React.FC<{
    tema: Tema;
    unidad: UnidadTematica;
    accent: string;
    accentDark: string;
    isDark: boolean;
    progresoActual: any;
    onActualizarProgreso: (
        tema_id: number,
        data: { estado?: string; porcentaje_avance?: number; tiempo_dedicado?: number }
    ) => Promise<boolean>;
    temaPrevio: TemaNavItem | null;
    temaSiguiente: TemaNavItem | null;
    onNavegar: (nav: TemaNavItem) => void;
}> = ({
    tema, unidad, accent, accentDark, isDark,
    progresoActual, onActualizarProgreso,
    temaPrevio, temaSiguiente, onNavegar,
}) => {
        const [marcando, setMarcando] = useState(false);

        // Tiempo de lectura: iniciar al montar, guardar al desmontar
        const tiempoInicioRef = useRef<number>(Date.now());

        useEffect(() => {
            tiempoInicioRef.current = Date.now();

            // Marcar como "en_progreso" si no ha sido iniciado
            if (!progresoActual || progresoActual.estado === 'no_iniciado') {
                onActualizarProgreso(tema.id, { estado: 'en_progreso', porcentaje_avance: 10 });
            }

            return () => {
                // Al salir del tema, guardar tiempo dedicado
                const segundos = Math.round((Date.now() - tiempoInicioRef.current) / 1000);
                if (segundos > 5) {
                    onActualizarProgreso(tema.id, { tiempo_dedicado: segundos });
                }
            };
        }, [tema.id]);

        const handleMarcarCompletado = async () => {
            setMarcando(true);
            const segundos = Math.round((Date.now() - tiempoInicioRef.current) / 1000);
            await onActualizarProgreso(tema.id, {
                estado: 'completado',
                porcentaje_avance: 100,
                tiempo_dedicado: segundos,
            });
            setMarcando(false);
        };

        const handleMarcarRevisando = async () => {
            setMarcando(true);
            await onActualizarProgreso(tema.id, { estado: 'revisando', porcentaje_avance: 75 });
            setMarcando(false);
        };

        const estado = progresoActual?.estado ?? 'no_iniciado';
        const completado = estado === 'completado';
        const estadoInfo = ESTADOS_PROGRESO.find(e => e.value === estado);
        const nivelInfo = NIVELES_DIFICULTAD.find(n => n.value === tema.nivel_dificultad);

        // Tiempo dedicado formateado
        const tiempoFormateado = progresoActual?.tiempo_dedicado
            ? progresoActual.tiempo_dedicado < 60
                ? `${progresoActual.tiempo_dedicado}s`
                : `${Math.round(progresoActual.tiempo_dedicado / 60)} min`
            : null;

        return (
            <Box sx={{
                borderRadius: '14px', overflow: 'hidden',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            }}>

                {/* ── Header ── */}
                <Box sx={{
                    px: 3, pt: 2.5, pb: 2,
                    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                }}>
                    {/* Eyebrow */}
                    <Typography sx={{
                        fontSize: '0.65rem', fontWeight: 700, color: 'text.disabled',
                        letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.75,
                    }}>
                        Unidad {unidad.numero_unidad} · Tema {tema.numero_tema}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                                {tema.titulo}
                            </Typography>

                            {/* Chips de metadata */}
                            <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                                {nivelInfo && (
                                    <Chip label={nivelInfo.label} size="small" sx={{
                                        height: 19, fontSize: '0.63rem', fontWeight: 700, borderRadius: '5px',
                                        bgcolor: nivelInfo.bgColor, color: nivelInfo.color,
                                    }} />
                                )}
                                {estadoInfo && (
                                    <Chip
                                        label={`${estadoInfo.icon} ${estadoInfo.label}`}
                                        size="small"
                                        sx={{
                                            height: 19, fontSize: '0.63rem', fontWeight: 700, borderRadius: '5px',
                                            bgcolor: isDark ? alpha(estadoInfo.color, 0.2) : estadoInfo.bgColor,
                                            color: estadoInfo.color,
                                        }}
                                    />
                                )}
                                {tiempoFormateado && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                        <TimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                        <Typography sx={{ fontSize: '0.63rem', color: 'text.disabled' }}>
                                            {tiempoFormateado} dedicados
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Botones de progreso */}
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            {!completado && (
                                <Tooltip title="Marcar como revisando / necesito repasar">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={handleMarcarRevisando}
                                        disabled={marcando || estado === 'revisando'}
                                        sx={{
                                            borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                            borderColor: alpha('#d97706', 0.4), color: '#d97706',
                                            '&:hover': { bgcolor: alpha('#d97706', 0.06), borderColor: '#d97706' },
                                            '&:disabled': { borderColor: alpha('#d97706', 0.2), color: alpha('#d97706', 0.4) },
                                        }}
                                    >
                                        {estado === 'revisando' ? '🔄 Revisando' : 'Revisar luego'}
                                    </Button>
                                </Tooltip>
                            )}

                            <Button
                                size="small"
                                variant={completado ? 'outlined' : 'contained'}
                                onClick={completado ? handleMarcarRevisando : handleMarcarCompletado}
                                disabled={marcando}
                                startIcon={
                                    marcando
                                        ? <CircularProgress size={12} color="inherit" />
                                        : completado
                                            ? <TrophyIcon sx={{ fontSize: 14 }} />
                                            : <CheckCircleIcon sx={{ fontSize: 14 }} />
                                }
                                sx={{
                                    borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                                    ...(completado ? {
                                        borderColor: '#16a34a', color: '#16a34a',
                                        '&:hover': { bgcolor: alpha('#16a34a', 0.06) },
                                    } : {
                                        background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                                        color: isDark ? '#000' : '#fff', boxShadow: 'none',
                                    }),
                                }}
                            >
                                {completado ? '✅ Completado' : 'Marcar como completado'}
                            </Button>
                        </Box>
                    </Box>

                    {/* Barra de progreso del tema */}
                    {progresoActual && (
                        <Box sx={{ mt: 1.5 }}>
                            <LinearProgress
                                variant="determinate"
                                value={Number(progresoActual.porcentaje_avance ?? 0)}
                                sx={{
                                    height: 4, borderRadius: '3px',
                                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: '3px',
                                        background: completado
                                            ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                                            : `linear-gradient(90deg, ${accent}, ${accentDark})`,
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* ── Contenido Markdown ── */}
                <Box sx={{ p: 3 }}>
                    {tema.contenido ? (
                        <Box sx={{
                            '& h1': { fontSize: '1.4rem', fontWeight: 800, mt: 0, mb: 2, letterSpacing: '-0.02em' },
                            '& h2': { fontSize: '1.15rem', fontWeight: 700, mt: 3, mb: 1.5, '&:first-of-type': { mt: 0 } },
                            '& h3': { fontSize: '1rem', fontWeight: 700, mt: 2.5, mb: 1 },
                            '& p': { fontSize: '0.9rem', lineHeight: 1.85, color: 'text.secondary', mb: 1.5 },
                            '& ul, & ol': { pl: 3, mb: 1.5 },
                            '& li': { fontSize: '0.9rem', lineHeight: 1.75, color: 'text.secondary', mb: 0.5 },
                            '& strong': { color: 'text.primary', fontWeight: 700 },
                            '& em': { color: 'text.secondary', fontStyle: 'italic' },
                            '& code': {
                                fontFamily: 'monospace', fontSize: '0.82rem', px: 0.6, py: 0.2,
                                borderRadius: '4px', bgcolor: alpha(accent, 0.1), color: accent,
                            },
                            '& pre': {
                                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                                borderRadius: '10px', p: 2, overflow: 'auto', mb: 2,
                                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                '& code': { bgcolor: 'transparent', p: 0, color: 'inherit' },
                            },
                            '& blockquote': {
                                borderLeft: `3px solid ${alpha(accent, 0.4)}`, pl: 2, ml: 0, my: 2,
                                color: 'text.secondary', fontStyle: 'italic',
                                bgcolor: alpha(accent, 0.04), borderRadius: '0 8px 8px 0', pr: 2, py: 0.5,
                            },
                            '& table': { width: '100%', borderCollapse: 'collapse', mb: 2, fontSize: '0.85rem' },
                            '& th, & td': {
                                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                p: '8px 12px',
                            },
                            '& th': { bgcolor: alpha(accent, 0.06), fontWeight: 700 },
                            '& hr': { border: 'none', borderTop: `1px solid ${alpha(accent, 0.15)}`, my: 2.5 },
                            '& a': { color: accent, textDecoration: 'underline' },
                        }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{tema.contenido}</ReactMarkdown>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <ArticleIcon sx={{ fontSize: 36, color: alpha(accent, 0.3), mb: 1.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
                                El docente aún no ha agregado contenido a este tema.
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                Vuelve más tarde o consulta a tu docente.
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* ── Quiz de repaso ── */}
                <Box sx={{ px: 3, pb: 2 }}>
                    <QuizEstudiante
                        tema_id={tema.id}
                        accent={accent}
                        accentDark={accentDark}
                        isDark={isDark}
                    />
                </Box>

                {/* ── Navegación prev/next ── */}
                {(temaPrevio || temaSiguiente) && (
                    <Box sx={{
                        display: 'flex', justifyContent: 'space-between', gap: 2,
                        px: 3, py: 2,
                        borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                    }}>
                        {temaPrevio ? (
                            <Button
                                startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
                                onClick={() => onNavegar(temaPrevio)}
                                sx={{
                                    borderRadius: '9px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                    color: 'text.secondary', px: 2, py: 1, maxWidth: '45%',
                                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                    '&:hover': { borderColor: alpha(accent, 0.4), color: accent, bgcolor: alpha(accent, 0.04) },
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mb: 0.2 }}>Anterior</Typography>
                                    <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                        {temaPrevio.unidad.numero_unidad}.{temaPrevio.tema.numero_tema} {temaPrevio.tema.titulo}
                                    </Typography>
                                </Box>
                            </Button>
                        ) : <Box />}

                        {temaSiguiente ? (
                            <Button
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                onClick={() => onNavegar(temaSiguiente)}
                                sx={{
                                    borderRadius: '9px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                    color: 'text.secondary', px: 2, py: 1, maxWidth: '45%',
                                    border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                                    '&:hover': { borderColor: alpha(accent, 0.4), color: accent, bgcolor: alpha(accent, 0.04) },
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mb: 0.2 }}>Siguiente</Typography>
                                    <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                        {temaSiguiente.unidad.numero_unidad}.{temaSiguiente.tema.numero_tema} {temaSiguiente.tema.titulo}
                                    </Typography>
                                </Box>
                            </Button>
                        ) : <Box />}
                    </Box>
                )}
            </Box>
        );
    };

export default CursoEstudiante;