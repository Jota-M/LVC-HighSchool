'use client';
// components/docente/materiales/CursoDocente.tsx

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Box, Typography, Chip, IconButton, Button, TextField,
    alpha, Dialog, DialogTitle, DialogContent, DialogActions,
    DialogContentText, Skeleton, CircularProgress, Tooltip,
    List, ListItemButton, ListItemText, Collapse, LinearProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    AutoAwesome as AutoAwesomeIcon,
    Save as SaveIcon,
    MenuBook as MenuBookIcon,
    Article as ArticleIcon,
    CheckCircle as CheckCircleIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import { useUnidadesTematicas, useTemas, useResumenProgresoTema } from '@/hooks/useMaterial';
import QuizTema from './QuizTema';
import {
    UnidadTematica, Tema, NivelDificultad, NIVELES_DIFICULTAD,
} from '@/types/materialTypes';
import { AsignacionDocente } from '@/services/asistenciaService';

interface CursoDocenteProps {
    asignacion: AsignacionDocente;
    accent: string;
    accentDark: string;
    isDark: boolean;
}

// Lista plana de todos los temas en orden (para prev/next)
interface TemaNavItem {
    tema: Tema;
    unidad: UnidadTematica;
}

export const CursoDocente: React.FC<CursoDocenteProps> = ({
    asignacion, accent, accentDark, isDark,
}) => {
    const {
        unidades, isLoading: loadingUnidades, isSubmitting: submittingUnidad,
        crear: crearUnidad, actualizar: actualizarUnidad, eliminar: eliminarUnidad,
    } = useUnidadesTematicas({ grado_materia_id: asignacion.grado_materia_id });

    const [unidadExpandida, setUnidadExpandida] = useState<number | null>(null);
    const [temaSeleccionado, setTemaSeleccionado] = useState<Tema | null>(null);
    const [unidadDelTema, setUnidadDelTema] = useState<UnidadTematica | null>(null);

    // Lista plana para navegación prev/next — se reconstruye cuando cambian temas por unidad
    const [temasPorUnidad, setTemasPorUnidad] = useState<Record<number, Tema[]>>({});

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

    // ── Dialog: Unidad ──
    const [dlgUnidad, setDlgUnidad] = useState(false);
    const [unidadEdit, setUnidadEdit] = useState<UnidadTematica | null>(null);
    const [formUnidad, setFormUnidad] = useState({
        numero_unidad: 1, titulo: '', descripcion: '', objetivos: '',
    });

    const abrirNuevaUnidad = () => {
        setUnidadEdit(null);
        setFormUnidad({ numero_unidad: unidades.length + 1, titulo: '', descripcion: '', objetivos: '' });
        setDlgUnidad(true);
    };

    const abrirEditarUnidad = (u: UnidadTematica) => {
        setUnidadEdit(u);
        setFormUnidad({
            numero_unidad: u.numero_unidad,
            titulo: u.titulo,
            descripcion: u.descripcion ?? '',
            objetivos: u.objetivos ?? '',
        });
        setDlgUnidad(true);
    };

    const guardarUnidad = async () => {
        if (!formUnidad.titulo.trim()) return;
        const ok = unidadEdit
            ? await actualizarUnidad(unidadEdit.id, {
                titulo: formUnidad.titulo,
                descripcion: formUnidad.descripcion || undefined,
                objetivos: formUnidad.objetivos || undefined,
            })
            : await crearUnidad({
                grado_materia_id: asignacion.grado_materia_id,
                numero_unidad: formUnidad.numero_unidad,
                titulo: formUnidad.titulo,
                descripcion: formUnidad.descripcion || undefined,
                objetivos: formUnidad.objetivos || undefined,
            });
        if (ok) setDlgUnidad(false);
    };

    const [dlgEliminarUnidad, setDlgEliminarUnidad] = useState<UnidadTematica | null>(null);

    return (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

            {/* ── Sidebar ── */}
            <Box sx={{
                width: 300, flexShrink: 0, borderRadius: '14px',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
                overflow: 'hidden', position: 'sticky', top: 16,
            }}>
                {/* Header sidebar */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.5,
                    borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MenuBookIcon sx={{ fontSize: 15, color: accent }} />
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Contenido del curso</Typography>
                    </Box>
                    <Tooltip title="Nueva unidad">
                        <IconButton size="small" onClick={abrirNuevaUnidad}
                            sx={{ p: 0.5, color: accent, '&:hover': { bgcolor: alpha(accent, 0.08) } }}>
                            <AddIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Lista */}
                {loadingUnidades ? (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: '8px' }} />
                        ))}
                    </Box>
                ) : unidades.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.78rem', mb: 1.5 }}>
                            Sin unidades temáticas aún.
                        </Typography>
                        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />} onClick={abrirNuevaUnidad}
                            sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600, fontSize: '0.74rem', color: accent }}>
                            Crear primera unidad
                        </Button>
                    </Box>
                ) : (
                    <List disablePadding sx={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                        {unidades.map(u => (
                            <UnidadItem
                                key={u.id}
                                unidad={u}
                                accent={accent}
                                isDark={isDark}
                                expandida={unidadExpandida === u.id}
                                onToggle={() => setUnidadExpandida(prev => prev === u.id ? null : u.id)}
                                onEditarUnidad={() => abrirEditarUnidad(u)}
                                onEliminarUnidad={() => setDlgEliminarUnidad(u)}
                                temaSeleccionadoId={temaSeleccionado?.id ?? null}
                                onSelectTema={(t) => seleccionarTema(t, u)}
                                onTemasChange={(temas) => setTemasPorUnidad(prev => ({ ...prev, [u.id]: temas }))}
                            />
                        ))}
                    </List>
                )}
            </Box>

            {/* ── Panel principal ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {temaSeleccionado && unidadDelTema ? (
                    <EditorTema
                        key={temaSeleccionado.id}
                        tema={temaSeleccionado}
                        unidad={unidadDelTema}
                        accent={accent}
                        accentDark={accentDark}
                        isDark={isDark}
                        paralelo_id={asignacion.paralelo_id}
                        periodo_academico_id={asignacion.periodo_academico_id}
                        total_estudiantes={asignacion.total_estudiantes}
                        temaPrevio={temaPrevio}
                        temaSiguiente={temaSig}
                        onTemaActualizado={(t) => setTemaSeleccionado(t)}
                        onNavegar={(nav) => seleccionarTema(nav.tema, nav.unidad)}
                    />
                ) : (
                    <Box sx={{
                        textAlign: 'center', py: 14, borderRadius: '14px',
                        border: `1px dashed ${alpha(accent, 0.2)}`,
                    }}>
                        <ArticleIcon sx={{ fontSize: 36, color: alpha(accent, 0.3), mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
                            Selecciona un tema
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            Elige un tema del panel para ver o editar su contenido.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ════ Dialog: Crear/Editar unidad ════ */}
            <Dialog open={dlgUnidad} onClose={() => setDlgUnidad(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: '16px', border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {unidadEdit ? 'Editar unidad' : 'Nueva unidad temática'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
                    <TextField label="Título *" fullWidth size="small" autoFocus
                        value={formUnidad.titulo}
                        onChange={e => setFormUnidad(p => ({ ...p, titulo: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    <TextField label="Descripción" fullWidth size="small" multiline rows={2}
                        value={formUnidad.descripcion}
                        onChange={e => setFormUnidad(p => ({ ...p, descripcion: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    <TextField label="Objetivos" fullWidth size="small" multiline rows={2}
                        placeholder="¿Qué debería lograr el estudiante al terminar esta unidad?"
                        value={formUnidad.objetivos}
                        onChange={e => setFormUnidad(p => ({ ...p, objetivos: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={() => setDlgUnidad(false)} variant="outlined"
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                        Cancelar
                    </Button>
                    <Button onClick={guardarUnidad} variant="contained"
                        disabled={submittingUnidad || !formUnidad.titulo.trim()}
                        endIcon={submittingUnidad ? <CircularProgress size={13} color="inherit" /> : undefined}
                        sx={{
                            borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                            background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                            color: isDark ? '#000' : '#fff', boxShadow: 'none',
                        }}>
                        {submittingUnidad ? 'Guardando…' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ════ Dialog: Confirmar eliminar unidad ════ */}
            <Dialog open={!!dlgEliminarUnidad} onClose={() => setDlgEliminarUnidad(null)}
                PaperProps={{ sx: { borderRadius: '14px' } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Eliminar unidad?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '0.85rem' }}>
                        Se desactivará <strong>"{dlgEliminarUnidad?.titulo}"</strong> y sus temas dejarán de mostrarse.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={() => setDlgEliminarUnidad(null)} variant="outlined"
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={async () => {
                            if (!dlgEliminarUnidad) return;
                            await eliminarUnidad(dlgEliminarUnidad.id);
                            if (unidadExpandida === dlgEliminarUnidad.id) setUnidadExpandida(null);
                            if (unidadDelTema?.id === dlgEliminarUnidad.id) {
                                setTemaSeleccionado(null);
                                setUnidadDelTema(null);
                            }
                            setDlgEliminarUnidad(null);
                        }}
                        variant="contained" color="error" disabled={submittingUnidad}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', boxShadow: 'none' }}>
                        {submittingUnidad ? 'Eliminando…' : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// ════════════════════════════════════════════════════════════
// UnidadItem — fila del sidebar con temas anidados
// ════════════════════════════════════════════════════════════
const UnidadItem: React.FC<{
    unidad: UnidadTematica;
    accent: string;
    isDark: boolean;
    expandida: boolean;
    onToggle: () => void;
    onEditarUnidad: () => void;
    onEliminarUnidad: () => void;
    temaSeleccionadoId: number | null;
    onSelectTema: (t: Tema) => void;
    onTemasChange: (temas: Tema[]) => void;
}> = ({
    unidad, accent, isDark, expandida, onToggle, onEditarUnidad, onEliminarUnidad,
    temaSeleccionadoId, onSelectTema, onTemasChange,
}) => {
        const {
            temas, isLoading, isSubmitting,
            crear: crearTema, eliminar: eliminarTema,
        } = useTemas({ unidad_tematica_id: unidad.id });

        // Notificar al padre cada vez que cambia la lista de temas
        React.useEffect(() => { onTemasChange(temas); }, [temas]);

        const [dlgTema, setDlgTema] = useState(false);
        const [dlgEliminarTema, setDlgEliminarTema] = useState<Tema | null>(null);
        const [formTema, setFormTema] = useState({ titulo: '', nivel_dificultad: '' as NivelDificultad | '' });

        const guardarTema = async () => {
            if (!formTema.titulo.trim()) return;
            const ok = await crearTema({
                unidad_tematica_id: unidad.id,
                numero_tema: temas.length + 1,
                titulo: formTema.titulo,
                nivel_dificultad: formTema.nivel_dificultad || undefined,
            });
            if (ok) setDlgTema(false);
        };

        return (
            <>
                {/* ── Fila de unidad ── */}
                <ListItemButton
                    onClick={onToggle}
                    sx={{
                        py: 1, px: 2,
                        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`,
                    }}>
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
                        secondary={`${unidad.total_temas ?? temas.length} tema${(unidad.total_temas ?? temas.length) === 1 ? '' : 's'}`}
                        secondaryTypographyProps={{ fontSize: '0.63rem' }}
                    />
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); onEditarUnidad(); }}
                            sx={{ p: 0.35, opacity: 0.5, '&:hover': { opacity: 1 } }}>
                            <EditIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); onEliminarUnidad(); }}
                            sx={{ p: 0.35, opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}>
                            <DeleteIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                    </Tooltip>
                    {expandida
                        ? <ExpandLessIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.disabled' }} />
                        : <ExpandMoreIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.disabled' }} />}
                </ListItemButton>

                {/* ── Temas anidados ── */}
                <Collapse in={expandida} timeout="auto">
                    <Box sx={{ pl: 3.5, pr: 1.5, py: 0.75 }}>
                        {isLoading ? (
                            <Skeleton variant="rounded" height={28} sx={{ borderRadius: '6px' }} />
                        ) : (
                            <>
                                {temas.map(t => (
                                    <Box key={t.id} sx={{ position: 'relative', '&:hover .del-btn': { opacity: 1 } }}>
                                        <ListItemButton
                                            selected={temaSeleccionadoId === t.id}
                                            onClick={() => onSelectTema(t)}
                                            sx={{
                                                borderRadius: '7px', py: 0.55, px: 1, mb: 0.25, pr: 3,
                                                '&.Mui-selected': { bgcolor: alpha(accent, 0.1) },
                                                '&.Mui-selected:hover': { bgcolor: alpha(accent, 0.14) },
                                            }}>
                                            <ListItemText
                                                primary={`${unidad.numero_unidad}.${t.numero_tema} ${t.titulo}`}
                                                primaryTypographyProps={{
                                                    fontSize: '0.74rem',
                                                    fontWeight: temaSeleccionadoId === t.id ? 700 : 400,
                                                    noWrap: true,
                                                    color: temaSeleccionadoId === t.id ? accent : 'text.primary',
                                                }} />
                                            {t.contenido && (
                                                <Tooltip title="Tiene contenido">
                                                    <CheckCircleIcon sx={{ fontSize: 11, color: '#16a34a', flexShrink: 0, ml: 0.5 }} />
                                                </Tooltip>
                                            )}
                                        </ListItemButton>
                                        <IconButton size="small" className="del-btn"
                                            onClick={e => { e.stopPropagation(); setDlgEliminarTema(t); }}
                                            sx={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', p: 0.25, opacity: 0, transition: 'opacity 0.15s' }}>
                                            <DeleteIcon sx={{ fontSize: 12 }} />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                                    onClick={() => { setFormTema({ titulo: '', nivel_dificultad: '' }); setDlgTema(true); }}
                                    sx={{
                                        borderRadius: '6px', textTransform: 'none', fontWeight: 600,
                                        fontSize: '0.7rem', color: accent, mt: 0.5, py: 0.3,
                                    }}>
                                    Agregar tema
                                </Button>
                            </>
                        )}
                    </Box>
                </Collapse>

                {/* ════ Dialog: nuevo tema ════ */}
                <Dialog open={dlgTema} onClose={() => setDlgTema(false)} maxWidth="xs" fullWidth
                    PaperProps={{ sx: { borderRadius: '14px' } }}>
                    <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Nuevo tema
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 400, mt: 0.2 }}>
                            Unidad {unidad.numero_unidad}: {unidad.titulo}
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
                        <TextField label="Título *" fullWidth size="small" autoFocus
                            value={formTema.titulo}
                            onChange={e => setFormTema(p => ({ ...p, titulo: e.target.value }))}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        <TextField select label="Nivel de dificultad" fullWidth size="small"
                            SelectProps={{ native: true }}
                            value={formTema.nivel_dificultad}
                            onChange={e => setFormTema(p => ({ ...p, nivel_dificultad: e.target.value as NivelDificultad }))}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                            <option value="">Sin especificar</option>
                            {NIVELES_DIFICULTAD.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button onClick={() => setDlgTema(false)} variant="outlined"
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                            Cancelar
                        </Button>
                        <Button onClick={guardarTema} variant="contained"
                            disabled={isSubmitting || !formTema.titulo.trim()}
                            endIcon={isSubmitting ? <CircularProgress size={12} color="inherit" /> : undefined}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', boxShadow: 'none' }}>
                            {isSubmitting ? 'Creando…' : 'Crear'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ════ Dialog: eliminar tema ════ */}
                <Dialog open={!!dlgEliminarTema} onClose={() => setDlgEliminarTema(null)}
                    PaperProps={{ sx: { borderRadius: '14px' } }}>
                    <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Eliminar tema?</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ fontSize: '0.85rem' }}>
                            Se desactivará <strong>"{dlgEliminarTema?.titulo}"</strong>.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button onClick={() => setDlgEliminarTema(null)} variant="outlined"
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!dlgEliminarTema) return;
                                await eliminarTema(dlgEliminarTema.id);
                                setDlgEliminarTema(null);
                            }}
                            variant="contained" color="error" disabled={isSubmitting}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', boxShadow: 'none' }}>
                            {isSubmitting ? 'Eliminando…' : 'Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

// ════════════════════════════════════════════════════════════
// EditorTema — panel principal con progreso + prev/next
// ════════════════════════════════════════════════════════════
const EditorTema: React.FC<{
    tema: Tema;
    unidad: UnidadTematica;
    accent: string;
    accentDark: string;
    isDark: boolean;
    paralelo_id: number;
    periodo_academico_id: number;
    total_estudiantes: number;
    temaPrevio: TemaNavItem | null;
    temaSiguiente: TemaNavItem | null;
    onTemaActualizado: (t: Tema) => void;
    onNavegar: (nav: TemaNavItem) => void;
}> = ({
    tema, unidad, accent, accentDark, isDark,
    paralelo_id, periodo_academico_id, total_estudiantes,
    temaPrevio, temaSiguiente, onTemaActualizado, onNavegar,
}) => {
        const { actualizar, generarContenido, generandoIA, isSubmitting } = useTemas({
            unidad_tematica_id: tema.unidad_tematica_id,
        });

        const { resumen, isLoading: loadingResumen } = useResumenProgresoTema(
            tema.id, paralelo_id, periodo_academico_id
        );

        const [contenido, setContenido] = useState(tema.contenido ?? '');
        const [modoEdicion, setModoEdicion] = useState(!tema.contenido);
        const tieneCambios = contenido !== (tema.contenido ?? '');
        const generando = generandoIA === tema.id;

        const nivelInfo = NIVELES_DIFICULTAD.find(n => n.value === tema.nivel_dificultad);

        const handleGenerar = async (forzar: boolean) => {
            const res = await generarContenido(tema.id, forzar);
            if (res?.tema) {
                setContenido(res.tema.contenido ?? '');
                onTemaActualizado(res.tema);
                setModoEdicion(false);
            }
        };

        const handleGuardar = async () => {
            const ok = await actualizar(tema.id, { contenido });
            if (ok) {
                onTemaActualizado({ ...tema, contenido });
                setModoEdicion(false);
            }
        };

        // Porcentaje de completados
        const pctCompletados = resumen && resumen.total_estudiantes > 0
            ? Math.round((resumen.completados / resumen.total_estudiantes) * 100)
            : 0;

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

                    {/* Título + botones */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                                {tema.titulo}
                            </Typography>
                            {nivelInfo && (
                                <Chip label={nivelInfo.label} size="small" sx={{
                                    mt: 0.75, height: 19, fontSize: '0.63rem', fontWeight: 700, borderRadius: '5px',
                                    bgcolor: nivelInfo.bgColor, color: nivelInfo.color,
                                }} />
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            {modoEdicion ? (
                                <Button size="small" variant="contained"
                                    startIcon={isSubmitting ? <CircularProgress size={12} color="inherit" /> : <SaveIcon sx={{ fontSize: 14 }} />}
                                    onClick={handleGuardar}
                                    disabled={isSubmitting || !tieneCambios}
                                    sx={{
                                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                        background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                                        color: isDark ? '#000' : '#fff', boxShadow: 'none',
                                    }}>
                                    {isSubmitting ? 'Guardando…' : 'Guardar'}
                                </Button>
                            ) : (
                                <Button size="small" variant="outlined"
                                    startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                                    onClick={() => setModoEdicion(true)}
                                    sx={{
                                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                        borderColor: alpha(accent, 0.4), color: accent,
                                        '&:hover': { bgcolor: alpha(accent, 0.06), borderColor: accent },
                                    }}>
                                    Editar
                                </Button>
                            )}
                            <Button size="small" variant="outlined"
                                startIcon={generando
                                    ? <CircularProgress size={12} color="inherit" />
                                    : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleGenerar(!!tema.contenido)}
                                disabled={generando}
                                sx={{
                                    borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                    borderColor: alpha('#a855f7', 0.4), color: '#a855f7',
                                    '&:hover': { bgcolor: alpha('#a855f7', 0.06), borderColor: '#a855f7' },
                                }}>
                                {generando ? 'Generando…' : tema.contenido ? 'Regenerar con IA' : 'Generar con IA'}
                            </Button>
                        </Box>
                    </Box>

                    {/* ── Resumen de progreso ── */}
                    <Box sx={{
                        p: 1.5, borderRadius: '10px',
                        bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                        border: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                    }}>
                        {loadingResumen ? (
                            <Skeleton variant="rounded" height={32} sx={{ borderRadius: '6px' }} />
                        ) : resumen ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <PeopleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary' }}>
                                            Progreso de estudiantes
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: accent }}>
                                        {resumen.completados}/{resumen.total_estudiantes} completaron · {pctCompletados}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={pctCompletados}
                                    sx={{
                                        height: 5, borderRadius: '3px',
                                        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: '3px',
                                            background: `linear-gradient(90deg, ${accent}, ${accentDark})`,
                                        },
                                    }}
                                />
                                {/* Breakdown */}
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    {[
                                        { label: 'Completados', val: resumen.completados, color: '#16a34a' },
                                        { label: 'En progreso', val: resumen.en_progreso, color: accent },
                                        { label: 'Revisando', val: resumen.revisando, color: '#d97706' },
                                        { label: 'Sin iniciar', val: resumen.no_iniciado, color: '#6b7280' },
                                    ].map(s => (
                                        <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color }} />
                                            <Typography sx={{ fontSize: '0.63rem', color: 'text.disabled' }}>
                                                {s.label}: <strong style={{ color: s.color }}>{s.val}</strong>
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        ) : (
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', textAlign: 'center' }}>
                                Sin datos de progreso aún
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* ── Contenido ── */}
                <Box sx={{ p: 3 }}>
                    {modoEdicion ? (
                        <TextField fullWidth multiline minRows={14}
                            placeholder="Escribe el contenido en Markdown, o usa 'Generar con IA' para crear un borrador…"
                            value={contenido}
                            onChange={e => setContenido(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.82rem' } }} />
                    ) : contenido ? (
                        <Box sx={{
                            '& h2': { fontSize: '1.15rem', fontWeight: 700, mt: 3, mb: 1.5, '&:first-of-type': { mt: 0 } },
                            '& h3': { fontSize: '1rem', fontWeight: 700, mt: 2.5, mb: 1 },
                            '& p': { fontSize: '0.875rem', lineHeight: 1.8, color: 'text.secondary', mb: 1.5 },
                            '& ul, & ol': { pl: 3, mb: 1.5 },
                            '& li': { fontSize: '0.875rem', lineHeight: 1.75, color: 'text.secondary', mb: 0.5 },
                            '& strong': { color: 'text.primary', fontWeight: 700 },
                            '& code': {
                                fontFamily: 'monospace', fontSize: '0.8rem', px: 0.6, py: 0.15,
                                borderRadius: '4px', bgcolor: alpha(accent, 0.1), color: accent,
                            },
                            '& blockquote': {
                                borderLeft: `3px solid ${alpha(accent, 0.4)}`, pl: 2, ml: 0, my: 2,
                                color: 'text.secondary', fontStyle: 'italic',
                            },
                            '& table': { width: '100%', borderCollapse: 'collapse', mb: 2, fontSize: '0.82rem' },
                            '& th, & td': {
                                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                p: '6px 10px',
                            },
                            '& th': { bgcolor: alpha(accent, 0.06), fontWeight: 700 },
                        }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido}</ReactMarkdown>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 32, color: alpha('#a855f7', 0.3), mb: 1.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
                                Sin contenido todavía
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                Usa "Generar con IA" para un borrador, o "Editar" para escribirlo.
                            </Typography>
                        </Box>
                    )}
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
                                }}>
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
                                }}>
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
                {/* ── Quiz de repaso (Nivel 2) ── */}
                {contenido && (
                    <QuizTema
                        tema_id={tema.id}
                        paralelo_id={paralelo_id}
                        periodo_academico_id={periodo_academico_id}
                        accent={accent}
                        accentDark={accentDark}
                        isDark={isDark}
                    />
                )}
            </Box>
        );
    };

export default CursoDocente;