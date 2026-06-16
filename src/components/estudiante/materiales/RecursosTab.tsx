'use client';
// components/estudiante/materiales/RecursosTab.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Grid, Card, CardContent, Chip, IconButton,
    TextField, InputAdornment, Skeleton, alpha, Tooltip, Fade,
    Pagination, Button, Divider, CircularProgress, Badge,
} from '@mui/material';
import {
    Search as SearchIcon,
    Favorite as FavIcon,
    FavoriteBorder as FavBorderIcon,
    OpenInNew as OpenIcon,
    Star as StarIcon,
    Visibility as EyeIcon,
    CheckCircle as CheckIcon,
    ChatBubble as ChatIcon,
    AutoAwesome as AIIcon,
    Folder as FolderIcon,
    NewReleases as NewIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import {
    useMaterialesEstudiante,
    useFavoritosEstudiante,
} from '@/hooks/useEstudiante';
import { estudianteService } from '@/services/estudianteService';
import { toast } from 'react-hot-toast';
import type { MateriaResumen, MaterialEstudiante } from '@/services/estudianteService';

// ── Tipos ─────────────────────────────────────────────────────

interface MaterialAsignado {
    id: number;
    titulo_final: string;
    descripcion?: string | null;
    tipo_codigo?: string | null;
    tipo_color?: string | null;
    tipo_recurso: 'interno' | 'externo';
    url_final?: string | null;
    origen_externo?: string | null;
    mensaje_docente?: string | null;
    visto_por_estudiante: boolean;
    created_at: string;
    material_id?: number | null;
    origen: string;
}

interface RecursosTabProps {
    materia: MateriaResumen;
    accent: string;
    accentDark: string;
    isDark: boolean;
}

type Seccion = 'repositorio' | 'docente';

// ── Helpers ───────────────────────────────────────────────────

const getMaterialEmoji = (icono?: string, mime?: string | null, esEnlace?: boolean) => {
    if (icono) return icono;
    if (esEnlace) return '🔗';
    if (!mime) return '📄';
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('video')) return '🎬';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('word')) return '📝';
    if (mime.includes('sheet') || mime.includes('excel')) return '📊';
    return '📄';
};

const getIconoExterno = (origen?: string | null) => {
    if (origen === 'youtube') return '🎬';
    if (origen === 'khan_academy') return '📐';
    return '🔗';
};

const formatBytes = (bytes?: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// ════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════

export const RecursosTab: React.FC<RecursosTabProps> = ({
    materia, accent, accentDark, isDark,
}) => {
    const [seccion, setSeccion] = useState<Seccion>('repositorio');
    const [asignados, setAsignados] = useState<MaterialAsignado[]>([]);
    const [loadingAsignados, setLoadingAsignados] = useState(false);
    const [marcando, setMarcando] = useState<number | null>(null);
    const [asignadosCargados, setAsignadosCargados] = useState(false);

    // Cargar asignados al cambiar a esa sección
    useEffect(() => {
        if (seccion === 'docente' && !asignadosCargados) {
            setLoadingAsignados(true);
            estudianteService.getMaterialesAsignados()
                .then(res => {
                    // Filtrar por materia
                    const filtrados = res.data.materiales.filter(
                        (m: any) => m.asignacion_docente_id === materia.asignacion_docente_id
                    );
                    setAsignados(filtrados);
                    setAsignadosCargados(true);
                })
                .catch(() => toast.error('Error al cargar materiales del docente'))
                .finally(() => setLoadingAsignados(false));
        }
    }, [seccion, materia.asignacion_docente_id]);

    const marcarVisto = useCallback(async (id: number) => {
        setMarcando(id);
        try {
            await estudianteService.marcarMaterialVisto(id);
            setAsignados(prev => prev.map(m =>
                m.id === id ? { ...m, visto_por_estudiante: true } : m
            ));
        } catch {
            toast.error('Error al marcar como visto');
        } finally {
            setMarcando(null);
        }
    }, []);

    const pendientes = asignados.filter(a => !a.visto_por_estudiante).length;

    return (
        <Box>
            {/* ── Selector de sección ── */}
            <Box sx={{
                display: 'flex', gap: 1, mb: 3,
                borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                pb: 0,
            }}>
                {([
                    { key: 'repositorio', label: 'Repositorio', icon: <FolderIcon sx={{ fontSize: 15 }} /> },
                    { key: 'docente', label: 'Del docente', icon: <SchoolIcon sx={{ fontSize: 15 }} />, badge: pendientes },
                ] as const).map(s => (
                    <Box
                        key={s.key}
                        onClick={() => setSeccion(s.key)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.6,
                            px: 2, py: 1, cursor: 'pointer',
                            borderBottom: `2px solid ${seccion === s.key ? accent : 'transparent'}`,
                            color: seccion === s.key ? accent : 'text.secondary',
                            fontWeight: seccion === s.key ? 700 : 500,
                            fontSize: '0.85rem',
                            transition: 'all 0.15s',
                            '&:hover': { color: accent },
                        }}
                    >
                        {s.icon}
                        {s.label}
                        {s.badge > 0 && (
                            <Chip
                                label={s.badge}
                                size="small"
                                sx={{ height: 16, fontSize: '0.55rem', minWidth: 16, bgcolor: alpha(accent, 0.15), color: accent }}
                            />
                        )}
                    </Box>
                ))}
            </Box>

            {/* ── Sección: Repositorio ── */}
            {seccion === 'repositorio' && (
                <RepositorioSection
                    materia={materia}
                    accent={accent}
                    accentDark={accentDark}
                    isDark={isDark}
                />
            )}

            {/* ── Sección: Del docente ── */}
            {seccion === 'docente' && (
                <DocenteSection
                    asignados={asignados}
                    isLoading={loadingAsignados}
                    marcando={marcando}
                    onMarcarVisto={marcarVisto}
                    accent={accent}
                    isDark={isDark}
                />
            )}
        </Box>
    );
};

// ── Repositorio ───────────────────────────────────────────────

const RepositorioSection: React.FC<{
    materia: MateriaResumen;
    accent: string;
    accentDark: string;
    isDark: boolean;
}> = ({ materia, accent, isDark }) => {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const { materiales, paginacion, page, setPage, isLoading } =
        useMaterialesEstudiante(materia.asignacion_docente_id);

    const { esFavorito, toggle: toggleFav, toggling } = useFavoritosEstudiante();

    const filtrados = search.trim()
        ? materiales.filter(m =>
            m.titulo.toLowerCase().includes(search.toLowerCase()) ||
            m.descripcion?.toLowerCase().includes(search.toLowerCase())
        )
        : materiales;

    const destacados = filtrados.filter(m => m.es_destacado);
    const normales = filtrados.filter(m => !m.es_destacado);

    return (
        <Box>
            {/* Buscador */}
            <TextField
                fullWidth
                placeholder="Buscar recurso…"
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: alpha(accent, 0.5) },
                        '&.Mui-focused fieldset': { borderColor: accent },
                    },
                }}
            />

            {isLoading ? (
                <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
                        </Grid>
                    ))}
                </Grid>
            ) : filtrados.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, borderRadius: '18px', border: `2px dashed ${alpha(accent, 0.18)}` }}>
                    <Typography fontSize="2.5rem" mb={1}>📭</Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        {search ? 'Sin resultados' : 'Sin recursos disponibles'}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" mt={0.5}>
                        {search ? `No se encontraron recursos para "${search}"` : 'Tu docente aún no ha publicado recursos.'}
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Destacados */}
                    {destacados.length > 0 && !search && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                                <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                    DESTACADOS
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                {destacados.map(m => (
                                    <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <RecursoCard
                                            material={m} accent={accent} isDark={isDark}
                                            esFavorito={esFavorito(m.id)} toggling={toggling === m.id}
                                            onToggleFav={() => toggleFav(m.id)}
                                            onAbrir={() => router.push(`/dashboard/estudiante/materiales/detalle/${m.id}`)}
                                            destacado
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Normales */}
                    {normales.length > 0 && (
                        <>
                            {destacados.length > 0 && !search && (
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
                                    TODOS LOS RECURSOS
                                </Typography>
                            )}
                            <Grid container spacing={2}>
                                {normales.map(m => (
                                    <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <RecursoCard
                                            material={m} accent={accent} isDark={isDark}
                                            esFavorito={esFavorito(m.id)} toggling={toggling === m.id}
                                            onToggleFav={() => toggleFav(m.id)}
                                            onAbrir={() => router.push(`/dashboard/estudiante/materiales/detalle/${m.id}`)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </>
            )}

            {paginacion.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={paginacion.totalPages} page={page}
                        onChange={(_, p) => setPage(p)} shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': { borderRadius: '8px' },
                            '& .Mui-selected': { bgcolor: `${accent} !important`, color: isDark ? '#000' : '#fff', fontWeight: 700 },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

// ── Card de recurso — diseño horizontal ──────────────────────

const RecursoCard: React.FC<{
    material: MaterialEstudiante;
    accent: string;
    isDark: boolean;
    esFavorito: boolean;
    toggling: boolean;
    onToggleFav: () => void;
    onAbrir: () => void;
    destacado?: boolean;
}> = ({ material, accent, isDark, esFavorito, toggling, onToggleFav, onAbrir, destacado }) => {
    const iconColor = material.tipo_material_color || accent;
    const emoji = getMaterialEmoji(material.tipo_material_icono, material.tipo_mime, material.es_enlace_externo);
    const tamano = formatBytes(material.tamano_bytes);
    const [hovered, setHovered] = React.useState(false);

    return (
        <Fade in timeout={280}>
            <Box
                onClick={onAbrir}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1.75,
                    p: 1.5, borderRadius: '14px', cursor: 'pointer',
                    border: `1px solid ${hovered ? alpha(iconColor, 0.35) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
                    bgcolor: hovered
                        ? isDark ? alpha(iconColor, 0.06) : alpha(iconColor, 0.03)
                        : isDark ? alpha('#fff', 0.02) : '#fff',
                    transition: 'all 0.18s ease',
                    boxShadow: hovered ? `0 4px 20px ${alpha(iconColor, 0.12)}` : 'none',
                    position: 'relative', overflow: 'hidden',
                }}
            >
                {/* Acento izquierdo animado */}
                <Box sx={{
                    position: 'absolute', left: 0, top: '15%', bottom: '15%',
                    width: 3, borderRadius: '0 3px 3px 0',
                    bgcolor: iconColor,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.18s',
                }} />

                {/* Icono tipo */}
                <Box sx={{
                    width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
                    bgcolor: isDark ? alpha(iconColor, 0.15) : alpha(iconColor, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                    border: `1px solid ${alpha(iconColor, 0.15)}`,
                    transition: 'transform 0.18s',
                    transform: hovered ? 'scale(1.05)' : 'scale(1)',
                }}>
                    {emoji}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Título */}
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                            lineHeight: 1.3, mb: 0.3,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                            color: hovered ? iconColor : 'text.primary',
                            transition: 'color 0.18s',
                        }}
                    >
                        {material.titulo}
                    </Typography>

                    {/* Descripción */}
                    {material.descripcion && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block', lineHeight: 1.4, mb: 0.5,
                                overflow: 'hidden', WebkitLineClamp: 2,
                            }}
                        >
                            {material.descripcion}
                        </Typography>
                    )}

                    {/* Meta row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={material.tipo_material_nombre}
                            size="small"
                            sx={{
                                height: 17, fontSize: '0.58rem', fontWeight: 700,
                                bgcolor: alpha(iconColor, 0.1), color: iconColor,
                                borderRadius: '5px',
                            }}
                        />
                        {tamano && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                {tamano}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <EyeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                {material.contador_vistas ?? 0}
                            </Typography>
                        </Box>
                        {(material.total_comentarios ?? 0) > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                <ChatIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                    {material.total_comentarios}
                                </Typography>
                            </Box>
                        )}
                        {material.ya_accedido && (
                            <Tooltip title="Ya revisado">
                                <CheckIcon sx={{ fontSize: 12, color: '#22c55e' }} />
                            </Tooltip>
                        )}
                        {destacado && (
                            <StarIcon sx={{ fontSize: 12, color: '#f59e0b' }} />
                        )}
                    </Box>
                </Box>

                {/* Acciones */}
                <Box
                    sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    {(material.url_archivo || material.url_externa) && (
                        <Tooltip title={material.es_enlace_externo ? 'Abrir enlace' : 'Ver archivo'}>
                            <IconButton
                                size="small"
                                component="a"
                                href={(material.url_externa || material.url_archivo)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    p: 0.6, borderRadius: '8px', color: iconColor,
                                    bgcolor: hovered ? alpha(iconColor, 0.12) : 'transparent',
                                    '&:hover': { bgcolor: alpha(iconColor, 0.18) },
                                    transition: 'all 0.15s',
                                }}
                            >
                                <OpenIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={esFavorito ? 'Quitar favorito' : 'Guardar'}>
                        <IconButton
                            size="small"
                            disabled={toggling}
                            onClick={onToggleFav}
                            sx={{
                                p: 0.6, borderRadius: '8px',
                                color: esFavorito ? '#ef4444' : 'text.disabled',
                                '&:hover': { bgcolor: alpha('#ef4444', 0.08), color: '#ef4444' },
                                transition: 'color 0.15s',
                            }}
                        >
                            {esFavorito ? <FavIcon sx={{ fontSize: 15 }} /> : <FavBorderIcon sx={{ fontSize: 15 }} />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Fade>
    );
};

// ── Sección del docente ───────────────────────────────────────

const DocenteSection: React.FC<{
    asignados: MaterialAsignado[];
    isLoading: boolean;
    marcando: number | null;
    onMarcarVisto: (id: number) => void;
    accent: string;
    isDark: boolean;
}> = ({ asignados, isLoading, marcando, onMarcarVisto, accent, isDark }) => {
    const router = useRouter();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: '14px' }} />
                ))}
            </Box>
        );
    }

    if (asignados.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 10, borderRadius: '18px', border: `2px dashed ${alpha(accent, 0.2)}` }}>
                <SchoolIcon sx={{ fontSize: 48, color: alpha(accent, 0.3), mb: 1.5 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={700} gutterBottom>
                    Sin materiales asignados
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    Tu docente aún no te ha asignado materiales personalizados.
                </Typography>
            </Box>
        );
    }

    const pendientes = asignados.filter(a => !a.visto_por_estudiante);
    const vistos = asignados.filter(a => a.visto_por_estudiante);

    return (
        <Box>
            {pendientes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                        <NewIcon sx={{ fontSize: 15, color: accent }} />
                        <Typography variant="subtitle2" fontWeight={700} color={accent}>
                            NUEVOS ({pendientes.length})
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {pendientes.map(m => (
                            <AsignadoCard key={m.id} m={m} accent={accent} isDark={isDark} marcando={marcando} onMarcarVisto={onMarcarVisto} onAbrir={() => m.material_id && router.push(`/dashboard/estudiante/materiales/detalle/${m.material_id}`)} />
                        ))}
                    </Box>
                </Box>
            )}

            {vistos.length > 0 && (
                <>
                    {pendientes.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                            <Divider sx={{ flex: 1 }} />
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>Vistos</Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {vistos.map(m => (
                            <AsignadoCard key={m.id} m={m} accent={accent} isDark={isDark} marcando={marcando} onMarcarVisto={onMarcarVisto} onAbrir={() => m.material_id && router.push(`/dashboard/estudiante/materiales/detalle/${m.material_id}`)} />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

const AsignadoCard: React.FC<{
    m: MaterialAsignado;
    accent: string;
    isDark: boolean;
    marcando: number | null;
    onMarcarVisto: (id: number) => void;
    onAbrir: () => void;
}> = ({ m, accent, isDark, marcando, onMarcarVisto, onAbrir }) => {
    const esIA = m.origen === 'gemini' || m.origen === 'web_search' || m.origen === 'automatico';
    const esNuevo = !m.visto_por_estudiante;

    return (
        <Box sx={{
            p: 2, borderRadius: '14px',
            border: `1.5px solid ${esNuevo ? alpha(accent, 0.4) : isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
            bgcolor: esNuevo
                ? isDark ? alpha(accent, 0.06) : alpha(accent, 0.03)
                : isDark ? alpha('#fff', 0.02) : '#fff',
            display: 'flex', gap: 1.5, alignItems: 'center',
            transition: 'all 0.15s',
        }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                {m.tipo_recurso === 'externo' ? getIconoExterno(m.origen_externo) : '📄'}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.3, flexWrap: 'wrap' }}>
                    {esIA && (
                        <Chip size="small" icon={<AIIcon sx={{ fontSize: '9px !important', color: '#f59e0b !important' }} />} label="IA" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b' }} />
                    )}
                </Box>
                <Typography variant="body2" fontWeight={700} noWrap>{m.titulo_final}</Typography>
                {m.mensaje_docente && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }} noWrap>
                        💬 {m.mensaje_docente}
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                {esNuevo && (
                    <Button size="small" variant="outlined" onClick={() => onMarcarVisto(m.id)} disabled={marcando === m.id}
                        sx={{ fontSize: '0.68rem', py: 0.35, px: 1, borderRadius: '7px', fontWeight: 600, borderColor: alpha(accent, 0.4), color: accent }}>
                        {marcando === m.id ? <CircularProgress size={11} /> : 'Visto'}
                    </Button>
                )}
                {(m.url_final || m.material_id) && (
                    <IconButton size="small" onClick={m.url_final ? undefined : onAbrir}
                        {...(m.url_final ? { component: 'a', href: m.url_final, target: '_blank' } : {})}
                        sx={{ p: 0.6, borderRadius: '8px', color: accent, bgcolor: alpha(accent, 0.08) }}>
                        <OpenIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
};

export default RecursosTab;