'use client';
// components/estudiante/materiales/RecursosTab.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Grid, Card, CardContent, Chip, IconButton,
    TextField, InputAdornment, Skeleton, alpha, Tooltip, Fade,
    Pagination, Button, Divider, CircularProgress, Badge, Avatar,
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
    Link as LinkIcon,
    PictureAsPdf as PdfIcon,
    PlayCircle as VideoIcon,
    Slideshow as SlidesIcon,
    Description as DocIcon,
    ChevronRight as ChevronRightIcon,
    CloudDownload as DownloadIcon,
    InsertDriveFile as FileIcon,
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

const getFileIcon = (mime?: string | null, esEnlace?: boolean) => {
    if (esEnlace) return <LinkIcon sx={{ fontSize: 22 }} />;
    if (!mime) return <DocIcon sx={{ fontSize: 22 }} />;
    if (mime.includes('pdf')) return <PdfIcon sx={{ fontSize: 22 }} />;
    if (mime.includes('video')) return <VideoIcon sx={{ fontSize: 22 }} />;
    if (mime.includes('presentation') || mime.includes('powerpoint')) return <SlidesIcon sx={{ fontSize: 22 }} />;
    return <DocIcon sx={{ fontSize: 22 }} />;
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
                {[
                    { key: 'repositorio', label: 'Repositorio', icon: <FolderIcon sx={{ fontSize: 15 }} />, badge: 0 },
                    { key: 'docente', label: 'Del docente', icon: <SchoolIcon sx={{ fontSize: 15 }} />, badge: pendientes },
                ].map(s => (
                    <Box
                        key={s.key}
                        onClick={() => setSeccion(s.key as Seccion)}
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

// ── CARD GRID (DISEÑO INSTITUCIONAL IDÉNTICO AL DOCENTE / CALIFICACIONES / NOTAS) ──────

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
    const vistas = Number(material.contador_vistas ?? 0);
    const descargas = Number(material.contador_descargas ?? 0);
    const comentarios = Number(material.total_comentarios ?? 0);

    return (
        <Fade in timeout={300}>
            <Card
                onClick={onAbrir}
                sx={{
                    height: '100%',
                    borderRadius: '18px',
                    border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                    bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 10px 22px ${alpha(iconColor, 0.18)}`,
                        borderColor: iconColor,
                        '& .btn-gestionar': {
                            backgroundColor: alpha(iconColor, 0.15),
                            borderColor: iconColor,
                            transform: 'translateX(2px)',
                        },
                    },
                }}
            >
                {/* Badge de Código o Tipo arriba a la izquierda */}
                <Chip
                    label={material.tipo_material_nombre || material.codigo_material || 'Material'}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: 22,
                        backgroundColor: isDark ? alpha(iconColor, 0.15) : alpha(iconColor, 0.1),
                        color: iconColor,
                        border: `1px solid ${alpha(iconColor, 0.25)}`,
                    }}
                />

                {/* Chip de Estado / Destacado / Favorito arriba a la derecha */}
                <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    {destacado && (
                        <Tooltip title="Material Destacado">
                            <Chip
                                icon={<StarIcon sx={{ fontSize: '13px !important', color: '#f59e0b !important' }} />}
                                label="⭐"
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    height: 22,
                                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                                    color: '#f59e0b',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    '& .MuiChip-label': { px: 0.6 },
                                }}
                            />
                        </Tooltip>
                    )}

                    <Chip
                        label={material.ya_accedido ? 'Revisado' : 'Nuevo'}
                        size="small"
                        icon={material.ya_accedido ? <CheckIcon sx={{ fontSize: '12px !important' }} /> : undefined}
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 22,
                            backgroundColor: material.ya_accedido
                                ? isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)'
                                : isDark ? alpha(accent, 0.15) : alpha(accent, 0.12),
                            color: material.ya_accedido ? '#16a34a' : accent,
                            border: `1px solid ${material.ya_accedido ? alpha('#16a34a', 0.25) : alpha(accent, 0.25)}`,
                        }}
                    />

                    <Tooltip title={esFavorito ? "Quitar de guardados" : "Guardar recurso"}>
                        <IconButton
                            size="small"
                            disabled={toggling}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFav();
                            }}
                            sx={{
                                width: 24,
                                height: 24,
                                color: esFavorito ? '#ef4444' : 'text.secondary',
                                '&:hover': { color: '#ef4444', backgroundColor: alpha('#ef4444', 0.1) },
                            }}
                        >
                            {esFavorito ? <FavIcon sx={{ fontSize: 16 }} /> : <FavBorderIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Contenido principal centrado */}
                <CardContent sx={{ p: 2.2, pt: 4.8, pb: 1.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Avatar circular centrado con icono del tipo */}
                    <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                margin: '0 auto',
                                bgcolor: isDark ? alpha(iconColor, 0.18) : alpha(iconColor, 0.12),
                                color: iconColor,
                                border: `3px solid ${alpha(iconColor, 0.25)}`,
                                boxShadow: `0 6px 14px ${alpha(iconColor, 0.22)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.75rem',
                            }}
                        >
                            {material.tipo_material_icono ? (
                                <span>{material.tipo_material_icono}</span>
                            ) : (
                                getFileIcon(material.tipo_mime, material.es_enlace_externo)
                            )}
                        </Avatar>
                    </Box>

                    {/* Título del Material */}
                    <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        gutterBottom
                        sx={{
                            fontSize: '1.02rem',
                            lineHeight: 1.25,
                            mb: 0.4,
                            color: 'text.primary',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {material.titulo}
                    </Typography>

                    {/* Subtítulo o Código / Descripción */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        gutterBottom
                        fontWeight={600}
                        sx={{
                            fontSize: '0.78rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {material.descripcion || (material.temas?.[0]?.tema_titulo ? `Tema: ${material.temas[0].tema_titulo}` : material.codigo_material)}
                    </Typography>

                    {/* Chip de Formato / Peso */}
                    <Box sx={{ my: 0.6, display: 'flex', justifyContent: 'center', gap: 0.6 }}>
                        {material.es_enlace_externo ? (
                            <Chip
                                icon={<LinkIcon sx={{ fontSize: '12px !important', color: `${iconColor} !important` }} />}
                                label="Enlace web"
                                size="small"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                    height: 22,
                                    backgroundColor: isDark ? alpha(iconColor, 0.15) : alpha(iconColor, 0.1),
                                    color: iconColor,
                                    border: `1px solid ${alpha(iconColor, 0.25)}`,
                                }}
                            />
                        ) : (
                            <Chip
                                icon={<FileIcon sx={{ fontSize: '12px !important' }} />}
                                label={material.tamano_bytes ? formatBytes(material.tamano_bytes) : (material.codigo_material || 'Documento')}
                                size="small"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                    height: 22,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    color: 'text.secondary',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                }}
                            />
                        )}
                    </Box>

                    {/* Botón Ver material (animado con .btn-gestionar) */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                        <Button
                            className="btn-gestionar"
                            size="small"
                            variant="outlined"
                            endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                px: 2,
                                py: 0.4,
                                borderColor: alpha(iconColor, 0.4),
                                color: iconColor,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Ver material
                        </Button>
                    </Box>
                </CardContent>

                {/* Footer métricas integrado idéntico al docente */}
                <Box
                    sx={{
                        p: 1.2,
                        px: 2,
                        borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
                        bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.015),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: '0 0 18px 18px',
                    }}
                >
                    <Tooltip title={`${vistas} visualizaciones`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EyeIcon sx={{ fontSize: 14, color: vistas > 0 ? '#0288d1' : 'text.disabled' }} />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
                                {vistas} {vistas === 1 ? 'vista' : 'vistas'}
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Tooltip title={`${descargas} descargas realizadas`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DownloadIcon sx={{ fontSize: 14, color: descargas > 0 ? '#16a34a' : 'text.disabled' }} />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
                                {descargas} desc.
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Tooltip title={`${comentarios} comentarios`}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: comentarios > 0 ? 0.8 : 0,
                                py: comentarios > 0 ? 0.2 : 0,
                                borderRadius: '6px',
                                bgcolor: comentarios > 0 ? alpha('#8b5cf6', 0.14) : 'transparent',
                            }}
                        >
                            <ChatIcon sx={{ fontSize: 14, color: comentarios > 0 ? '#8b5cf6' : 'text.disabled' }} />
                            <Typography
                                sx={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: comentarios > 0 ? '#8b5cf6' : 'text.secondary',
                                }}
                            >
                                {comentarios} com.
                            </Typography>
                        </Box>
                    </Tooltip>
                </Box>
            </Card>
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
    const cardColor = m.tipo_color || accent;

    return (
        <Card
            elevation={0}
            onClick={m.url_final ? undefined : onAbrir}
            {...(m.url_final ? { component: 'a', href: m.url_final, target: '_blank', rel: 'noopener noreferrer' } : {})}
            sx={{
                borderRadius: '16px',
                border: `1.5px solid ${esNuevo ? alpha(cardColor, 0.4) : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: esNuevo
                    ? isDark ? alpha(cardColor, 0.05) : alpha(cardColor, 0.02)
                    : isDark ? alpha('#fff', 0.02) : '#fff',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                textDecoration: 'none',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 10px 26px ${alpha(cardColor, 0.16)}`,
                    borderColor: alpha(cardColor, 0.45),
                },
            }}
        >
            <Box
                sx={{
                    height: 4,
                    background: `linear-gradient(90deg, ${cardColor}, ${alpha(cardColor, 0.35)})`,
                }}
            />
            <CardContent sx={{ p: { xs: 1.8, sm: 2 } }}>
                <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: '12px',
                        bgcolor: alpha(cardColor, 0.12), color: cardColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.35rem', flexShrink: 0,
                        border: `1px solid ${alpha(cardColor, 0.2)}`,
                    }}>
                        {m.tipo_recurso === 'externo' ? getIconoExterno(m.origen_externo) : '📄'}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', mb: 0.4, flexWrap: 'wrap' }}>
                            {esNuevo && (
                                <Chip
                                    size="small"
                                    label="Nuevo"
                                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(accent, 0.12), color: accent }}
                                />
                            )}
                            {esIA && (
                                <Chip
                                    size="small"
                                    icon={<AIIcon sx={{ fontSize: '10px !important', color: '#f59e0b !important' }} />}
                                    label="IA"
                                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b' }}
                                />
                            )}
                            {m.tipo_codigo && (
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                                    {m.tipo_codigo}
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.35, mb: 0.4 }}>
                            {m.titulo_final}
                        </Typography>

                        {m.mensaje_docente && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                                💬 {m.mensaje_docente}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        {esNuevo && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onMarcarVisto(m.id)}
                                disabled={marcando === m.id}
                                sx={{
                                    fontSize: '0.68rem',
                                    py: 0.4,
                                    px: 1.2,
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    borderColor: alpha(accent, 0.4),
                                    color: accent,
                                    textTransform: 'none',
                                }}
                            >
                                {marcando === m.id ? <CircularProgress size={12} /> : 'Marcar visto'}
                            </Button>
                        )}
                        {(m.url_final || m.material_id) && (
                            <IconButton
                                size="small"
                                onClick={m.url_final ? undefined : onAbrir}
                                {...(m.url_final ? { component: 'a', href: m.url_final, target: '_blank', rel: 'noopener noreferrer' } : {})}
                                sx={{ p: 0.7, borderRadius: '8px', color: cardColor, bgcolor: alpha(cardColor, 0.08) }}
                            >
                                <OpenIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RecursosTab;