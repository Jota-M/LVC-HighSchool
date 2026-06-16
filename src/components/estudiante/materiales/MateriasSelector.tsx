'use client';
// components/estudiante/materiales/MateriasSelector.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Grid, Card, CardContent, Chip,
    alpha, useTheme, Skeleton, Fade, LinearProgress, keyframes,
} from '@mui/material';
import {
    MenuBook as MenuBookIcon,
    Person as PersonIcon,
    Assignment as TemaIcon,
    CheckCircle as CheckIcon,
    AutoAwesome as AIIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useMisMaterias } from '@/hooks/useEstudiante';
import { estudianteService } from '@/services/estudianteService';
import type { MateriaResumen } from '@/services/estudianteService';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50%       { transform: translateY(-6px) rotate(2deg); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface MateriasSelectorProps { user: any; }

export const MateriasSelector: React.FC<MateriasSelectorProps> = ({ user }) => {
    const router = useRouter();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const accent = isDark ? '#facc15' : '#0288d1';
    const accentDark = isDark ? '#f59e0b' : '#01579b';

    const { materias, isLoading } = useMisMaterias();
    const [pendientesAsignados, setPendientesAsignados] = useState(0);

    useEffect(() => {
        estudianteService.getMaterialesAsignadosPendientes()
            .then(res => setPendientesAsignados(res.data.total))
            .catch(() => { });
    }, []);

    const gradient = `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`;

    return (
        <Box sx={{ minHeight: '100vh' }}>

            {/* ── Header ── */}
            <Fade in timeout={300}>
                <Box sx={{ mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                        <MenuBookIcon sx={{
                            color: accent, fontSize: 38,
                            animation: `${float} 3s ease-in-out infinite`,
                        }} />
                        <Typography variant="h4" fontWeight={800} sx={{
                            background: gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Mis Materiales
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Selecciona una materia para acceder a su contenido, recursos y seguimiento.
                    </Typography>

                    {/* Badge de pendientes */}
                    {pendientesAsignados > 0 && (
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1.5,
                            px: 1.5, py: 0.6, borderRadius: '8px',
                            bgcolor: alpha(accent, 0.1),
                            border: `1px solid ${alpha(accent, 0.2)}`,
                        }}>
                            <AIIcon sx={{ fontSize: 13, color: accent }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: accent }}>
                                {pendientesAsignados} material{pendientesAsignados > 1 ? 'es' : ''} nuevo{pendientesAsignados > 1 ? 's' : ''} de tu docente
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Fade>

            {/* ── Grid de materias ── */}
            {isLoading ? (
                <Grid container spacing={2.5}>
                    {[1, 2, 3, 4].map(i => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Skeleton variant="rounded" height={200} sx={{ borderRadius: '20px' }} />
                        </Grid>
                    ))}
                </Grid>
            ) : materias.length === 0 ? (
                <SinMaterias accent={accent} isDark={isDark} />
            ) : (
                <Grid container spacing={2.5}>
                    {materias.map((m, i) => (
                        <Grid key={m.asignacion_docente_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <MateriaCard
                                materia={m}
                                accent={accent}
                                accentDark={accentDark}
                                isDark={isDark}
                                index={i}
                                onClick={() => router.push(`/dashboard/estudiante/materiales/${m.asignacion_docente_id}`)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

// ── Card individual de materia ────────────────────────────────

const MateriaCard: React.FC<{
    materia: MateriaResumen;
    accent: string;
    accentDark: string;
    isDark: boolean;
    index: number;
    onClick: () => void;
}> = ({ materia, accent, accentDark, isDark, index, onClick }) => {
    const color = materia.materia_color || accent;
    const progreso = materia.progreso_promedio ?? 0;
    const [hovered, setHovered] = useState(false);

    return (
        <Fade in timeout={300 + index * 60}>
            <Card
                elevation={0}
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                sx={{
                    borderRadius: '20px',
                    cursor: 'pointer',
                    border: `1.5px solid ${hovered ? alpha(color, 0.5) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    transition: 'all 0.25s ease',
                    transform: hovered ? 'translateY(-5px)' : 'none',
                    boxShadow: hovered ? `0 16px 40px ${alpha(color, 0.2)}` : 'none',
                    animation: `${slideUp} 0.4s ease-out ${index * 0.07}s both`,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Barra de color superior */}
                <Box sx={{
                    height: 5,
                    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
                }} />

                <CardContent sx={{ p: 2.5 }}>

                    {/* Icono + código */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{
                            width: 46, height: 46, borderRadius: '14px',
                            bgcolor: alpha(color, 0.12),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <MenuBookIcon sx={{ fontSize: 22, color }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" sx={{
                                fontWeight: 800, fontSize: '0.65rem',
                                color: alpha(color, 0.8), letterSpacing: 0.8,
                            }}>
                                {materia.materia_codigo}
                            </Typography>
                            {/* Flecha animada al hover */}
                            <ArrowIcon sx={{
                                fontSize: 14, color,
                                transition: 'transform 0.2s',
                                transform: hovered ? 'translateX(3px)' : 'none',
                            }} />
                        </Box>
                    </Box>

                    {/* Nombre materia */}
                    <Typography variant="subtitle1" fontWeight={800} sx={{
                        lineHeight: 1.2, mb: 0.5, color: hovered ? color : 'text.primary',
                        transition: 'color 0.2s',
                    }}>
                        {materia.materia_nombre}
                    </Typography>

                    {/* Docente */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {materia.docente_nombres} {materia.docente_apellidos}
                        </Typography>
                    </Box>

                    {/* Barra de progreso */}
                    {materia.total_temas > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Progreso del curso
                                </Typography>
                                <Typography variant="caption" fontWeight={800} sx={{ color }}>
                                    {Math.round(progreso)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progreso}
                                sx={{
                                    height: 6, borderRadius: 3,
                                    bgcolor: alpha(color, 0.12),
                                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                                }}
                            />
                        </Box>
                    )}

                    {/* Chips informativos */}
                    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                        {materia.area_conocimiento && (
                            <Chip
                                label={materia.area_conocimiento}
                                size="small"
                                sx={{
                                    height: 20, fontSize: '0.62rem', fontWeight: 600,
                                    bgcolor: alpha(color, 0.1), color,
                                }}
                            />
                        )}
                        {materia.total_materiales > 0 && (
                            <Chip
                                icon={<MenuBookIcon sx={{ fontSize: '10px !important' }} />}
                                label={`${materia.total_materiales} recursos`}
                                size="small"
                                sx={{
                                    height: 20, fontSize: '0.62rem', fontWeight: 600,
                                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                                    color: 'text.secondary',
                                }}
                            />
                        )}
                        {materia.total_temas > 0 && (
                            <Chip
                                icon={<TemaIcon sx={{ fontSize: '10px !important' }} />}
                                label={`${materia.temas_completados}/${materia.total_temas} temas`}
                                size="small"
                                sx={{
                                    height: 20, fontSize: '0.62rem', fontWeight: 600,
                                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                                    color: 'text.secondary',
                                }}
                            />
                        )}
                    </Box>
                </CardContent>

                {/* Overlay sutil al hover */}
                <Box sx={{
                    position: 'absolute', inset: 0, borderRadius: '20px',
                    background: `radial-gradient(circle at top right, ${alpha(color, 0.06)}, transparent 70%)`,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                }} />
            </Card>
        </Fade>
    );
};

// ── Empty state ───────────────────────────────────────────────

const SinMaterias: React.FC<{ accent: string; isDark: boolean }> = ({ accent }) => (
    <Box sx={{
        textAlign: 'center', py: 12,
        borderRadius: '24px',
        border: `2px dashed ${alpha(accent, 0.2)}`,
    }}>
        <MenuBookIcon sx={{ fontSize: 64, color: alpha(accent, 0.3), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={700}>
            Sin materias activas
        </Typography>
        <Typography variant="body2" color="text.disabled">
            No tienes materias matriculadas para el período actual.
        </Typography>
    </Box>
);

export default MateriasSelector;