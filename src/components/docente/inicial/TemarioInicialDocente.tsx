'use client';
// components/docente/inicial/TemarioInicialDocente.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, IconButton, Button, TextField,
  alpha, Dialog, DialogContent, DialogActions,
  Skeleton, Tooltip, List, ListItemButton, ListItemText,
  CircularProgress, Card, CardContent, CardMedia,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AddRounded as AddIcon, EditRounded as EditIcon,
  DeleteRounded as DeleteIcon, DeleteForeverRounded as DeleteForeverIcon,
  SaveRounded as SaveIcon, MenuBookRounded as MenuBookIcon,
  SchoolRounded as SchoolIcon, RecordVoiceOverRounded as VoiceIcon,
  PsychologyRounded as BrainIcon, DirectionsRunRounded as MotorIcon,
  FavoriteRounded as HeartIcon, CloseRounded as CloseIcon,
  InfoOutlined as InfoIcon, PlayCircleRounded as VideoIcon,
  ImageRounded as ImageIcon, SportsEsportsRounded as GameIcon,
  OpenInNewRounded as OpenInNewIcon, LinkRounded as LinkIcon,
  AutoAwesomeRounded as SparklesIcon, CheckCircleRounded as CheckIcon,
  VisibilityRounded as PreviewIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { inicialService } from '@/services/inicialService';
import { ActividadInicial, TipoActividad, PropuestaActividadIA, ContenidoInteractivoInicial } from '@/types/inicialTypes';
import { AsignacionDocente } from '@/services/asistenciaService';

const CAMPOS_ICONOS: Record<string, React.ReactElement> = {
  'INI-COM': <VoiceIcon sx={{ fontSize: 18 }} />,
  'INI-CON': <BrainIcon sx={{ fontSize: 18 }} />,
  'INI-BIO': <MotorIcon sx={{ fontSize: 18 }} />,
  'INI-SOC': <HeartIcon sx={{ fontSize: 18 }} />,
};
const CAMPOS_COLORES: Record<string, string> = {
  'INI-COM': '#6366F1', 'INI-CON': '#0ea5e9', 'INI-BIO': '#22c55e', 'INI-SOC': '#f59e0b',
};
const CAMPOS_NOMBRES: Record<string, string> = {
  'INI-COM': 'Comunicacion, Lenguajes y Artes',
  'INI-CON': 'Conocimiento y Produccion',
  'INI-BIO': 'Desarrollo Bio Sicomotriz',
  'INI-SOC': 'Socio Cultural y Espiritual',
};
const CAMPOS_ORDEN = ['INI-COM', 'INI-CON', 'INI-BIO', 'INI-SOC'];
const TIPO_CONFIG = {
  video: { label: 'Video', color: '#ef4444', bg: '#fef2f2', icon: <VideoIcon sx={{ fontSize: 14 }} /> },
  imagen: { label: 'Imagen', color: '#8b5cf6', bg: '#f5f3ff', icon: <ImageIcon sx={{ fontSize: 14 }} /> },
  actividad: { label: 'Actividad Lúdica', color: '#f59e0b', bg: '#fffbeb', icon: <MenuBookIcon sx={{ fontSize: 14 }} /> },
  juego: { label: 'Minijuego Interactivo', color: '#10b981', bg: '#ecfdf5', icon: <GameIcon sx={{ fontSize: 14 }} /> },
} as const;
const EMOJIS = ['⭐', '🎨', '🎵', '📚', '🌟', '🎯', '🦋', '🌈', '🎲', '🏃', '🌸', '🎭', '🔢', '🌿', '🤸', '💃', '🐶', '🐮', '🦁', '🍎'];
const COLORES = ['#6366F1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#0ea5e9', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#a855f7'];

const SUGERENCIAS_TEMAS = [
  'Los animales de la granja y sus sonidos',
  'Los colores primarios y las figuras geométricas',
  'Las partes de mi cuerpo y los cinco sentidos',
  'Mi familia, mis amigos y el compartir',
  'El cuidado del agua y las plantitas',
  'Los números del 1 al 5 jugando',
];

function ytThumb(url: string): string | null {
  const m = (url || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

interface Campo { codigo: string; nombre: string; actividades: ActividadInicial[]; }
interface Props { asignacion: AsignacionDocente; accent: string; accentDark: string; isDark: boolean; }

// ActividadCard
const ActividadCard: React.FC<{
  a: ActividadInicial;
  isDark: boolean;
  onEdit: (a: ActividadInicial) => void;
  onDel: (a: ActividadInicial) => void;
  onJugar?: (a: ActividadInicial) => void;
}> = ({ a, isDark, onEdit, onDel, onJugar }) => {
  const tc = TIPO_CONFIG[a.tipo] || TIPO_CONFIG.actividad;
  const thumb = a.tipo === 'video' ? ytThumb(a.url || '') : null;
  return (
    <Card elevation={0} sx={{
      borderRadius: '20px', border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', position: 'relative',
      display: 'flex', flexDirection: 'column', height: '100%',
      '&:hover': {
        transform: 'translateY(-6px)', boxShadow: `0 12px 28px ${alpha(a.color_fondo || '#6366F1', 0.2)}`,
        borderColor: alpha(a.color_fondo || '#6366F1', 0.4), '& .ca': { opacity: 1, transform: 'translateY(0)' }
      },
    }}>
      {/* Franja de color o thumbnail */}
      {thumb ? (
        <Box sx={{ position: 'relative', height: 130, overflow: 'hidden', bgcolor: '#000' }}>
          <CardMedia component="img" image={thumb} alt={a.titulo} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <VideoIcon sx={{ fontSize: 48, color: '#fff', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
          </Box>
          <Box sx={{
            position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
            bgcolor: a.color_fondo || '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {a.emoji || '⭐'}
          </Box>
        </Box>
      ) : (
        <Box sx={{
          height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg,${a.color_fondo || '#6366F1'},${alpha(a.color_fondo || '#6366F1', 0.65)})`,
          fontSize: '2.5rem', position: 'relative', overflow: 'hidden'
        }}>
          {a.emoji || '⭐'}
          <Box sx={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', right: -15, top: -15 }} />
          <Box sx={{ position: 'absolute', width: 45, height: 45, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)', left: 8, bottom: -12 }} />
        </Box>
      )}
      <CardContent sx={{ p: 2, '&:last-child': { pb: '12px !important' }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
          <Chip
            icon={tc.icon}
            label={tc.label}
            size="small"
            sx={{
              height: 22, fontSize: '0.65rem', fontWeight: 800,
              bgcolor: isDark ? alpha(tc.color, 0.18) : tc.bg,
              color: tc.color,
              border: `1px solid ${alpha(tc.color, 0.3)}`
            }}
          />
          {a.url && (
            <Tooltip title="Abrir enlace">
              <IconButton size="small" onClick={() => window.open(a.url!, '_blank')}
                sx={{ borderRadius: '7px', color: 'text.disabled', '&:hover': { color: a.color_fondo || '#6366F1' } }}>
                <OpenInNewIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography sx={{
          fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.3, mb: a.descripcion ? 0.5 : 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {a.titulo}
        </Typography>

        {a.descripcion && (
          <Typography variant="caption" color="text.secondary" sx={{
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4, fontWeight: 500, mb: 1
          }}>
            {a.descripcion}
          </Typography>
        )}

        {a.contenido_interactivo && (
          <Box sx={{
            mt: 'auto', mb: 1, p: 0.8, borderRadius: '10px',
            bgcolor: alpha(a.color_fondo || '#10b981', isDark ? 0.12 : 0.08),
            border: `1px dashed ${alpha(a.color_fondo || '#10b981', 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: a.color_fondo || '#10b981' }}>
              🎮 Modo: {a.contenido_interactivo.tipo_interaccion || 'Juego'}
            </Typography>
            {onJugar && (
              <Button size="small" onClick={() => onJugar(a)}
                sx={{
                  py: 0.2, px: 1, minWidth: 0, fontSize: '0.65rem', fontWeight: 800,
                  borderRadius: '6px', bgcolor: a.color_fondo || '#10b981', color: '#fff',
                  textTransform: 'none', '&:hover': { opacity: 0.9 }
                }}>
                Probar
              </Button>
            )}
          </Box>
        )}

        <Box className="ca" sx={{ display: 'flex', gap: 0.7, mt: 'auto', opacity: 0, transform: 'translateY(4px)', transition: 'all 0.2s' }}>
          <Button size="small" startIcon={<EditIcon sx={{ fontSize: 12 }} />} onClick={() => onEdit(a)}
            sx={{
              flex: 1, borderRadius: '9px', textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', py: 0.4,
              border: `1px solid ${alpha(a.color_fondo || '#6366F1', 0.3)}`, color: a.color_fondo || '#6366F1',
              '&:hover': { bgcolor: alpha(a.color_fondo || '#6366F1', 0.1) }
            }}>Editar</Button>
          <IconButton size="small" onClick={() => onDel(a)}
            sx={{ borderRadius: '9px', color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}>
            <DeleteIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente principal
export const TemarioInicialDocente: React.FC<Props> = ({ asignacion, accent, accentDark, isDark }) => {
  const brand = accent;
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R, background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R }
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const [campos, setCampos] = useState<Campo[]>(CAMPOS_ORDEN.map(c => ({ codigo: c, nombre: CAMPOS_NOMBRES[c] || c, actividades: [] })));
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editando, setEditando] = useState<ActividadInicial | null>(null);
  const [form, setForm] = useState<{
    tipo: TipoActividad;
    titulo: string;
    descripcion: string;
    url: string;
    emoji: string;
    color_fondo: string;
    contenido_interactivo?: any;
  }>({
    tipo: 'juego',
    titulo: '',
    descripcion: '',
    url: '',
    emoji: '⭐',
    color_fondo: '#6366F1',
    contenido_interactivo: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [dlgDel, setDlgDel] = useState<ActividadInicial | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Estados de Gemini IA
  const [dlgIAOpen, setDlgIAOpen] = useState(false);
  const [temaIA, setTemaIA] = useState('');
  const [formatoIA, setFormatoIA] = useState<'juego' | 'actividad'>('juego');
  const [tipoJuegoIA, setTipoJuegoIA] = useState<'memorama' | 'adivinanza' | 'arrastrar' | 'tarjetas' | 'mixto'>('mixto');
  const [cantidadIA, setCantidadIA] = useState(3);
  const [loadingIA, setLoadingIA] = useState(false);
  const [propuestasIA, setPropuestasIA] = useState<PropuestaActividadIA[]>([]);
  const [actividadPreview, setActividadPreview] = useState<ActividadInicial | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const acts = await inicialService.getActividades({ gradoId: asignacion.grado_id });
      const mapa: Record<string, ActividadInicial[]> = {};
      for (const a of acts) { if (!mapa[a.campo_codigo]) mapa[a.campo_codigo] = []; mapa[a.campo_codigo].push(a); }
      setCampos(CAMPOS_ORDEN.map(c => ({ codigo: c, nombre: CAMPOS_NOMBRES[c] || c, actividades: (mapa[c] || []).sort((a, b) => a.orden - b.orden) })));
    } catch (e) { toast.error('Error al cargar actividades'); }
    finally { setLoading(false); }
  }, [asignacion.grado_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const campoActual = campos[idx] ?? null;
  const accentC = CAMPOS_COLORES[campoActual?.codigo ?? ''] ?? brand;

  const abrirNuevo = (tipo?: TipoActividad) => {
    setEditando(null);
    setForm({ tipo: tipo || 'juego', titulo: '', descripcion: '', url: '', emoji: '⭐', color_fondo: accentC, contenido_interactivo: null });
    setDlgOpen(true);
  };
  const abrirEditar = (a: ActividadInicial) => {
    setEditando(a);
    setForm({
      tipo: a.tipo,
      titulo: a.titulo,
      descripcion: a.descripcion || '',
      url: a.url || '',
      emoji: a.emoji,
      color_fondo: a.color_fondo,
      contenido_interactivo: a.contenido_interactivo || null
    });
    setDlgOpen(true);
  };

  const guardar = async () => {
    if (!form.titulo.trim() || !campoActual) return;
    setSubmitting(true);
    try {
      if (editando) {
        await inicialService.actualizarActividad(editando.id, {
          tipo: form.tipo,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || undefined,
          url: form.url || undefined,
          emoji: form.emoji,
          color_fondo: form.color_fondo,
          contenido_interactivo: form.contenido_interactivo || null,
        });
        toast.success('Actividad actualizada');
      } else {
        await inicialService.crearActividad({
          grado_materia_id: asignacion.grado_materia_id,
          campo_codigo: campoActual.codigo,
          tipo: form.tipo,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || undefined,
          url: form.url || undefined,
          emoji: form.emoji,
          color_fondo: form.color_fondo,
          contenido_interactivo: form.contenido_interactivo || null,
        });
        toast.success('Actividad lúdica creada');
      }
      setDlgOpen(false); await cargar();
    } catch (e) { toast.error('Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const eliminar = async () => {
    if (!dlgDel) return; setDeleting(true);
    try { await inicialService.eliminarActividad(dlgDel.id); toast.success('Eliminada'); setDlgDel(null); await cargar(); }
    catch (e) { toast.error('Error'); }
    finally { setDeleting(false); }
  };

  // Manejador de Gemini IA
  const handleGenerarConIA = async (temaElegido?: string) => {
    const temaFinal = temaElegido || temaIA;
    if (!temaFinal.trim() || !campoActual) {
      toast.error('Indica un tema para que Gemini genere la actividad');
      return;
    }
    setLoadingIA(true);
    try {
      const propuestas = await inicialService.generarActividadesIA({
        campoCodigo: campoActual.codigo,
        campoNombre: campoActual.nombre,
        tema: temaFinal.trim(),
        gradoNombre: asignacion.grado_nombre,
        formato: formatoIA,
        tipoJuego: tipoJuegoIA,
        cantidad: cantidadIA,
      });
      setPropuestasIA(propuestas);
      toast.success(`¡Gemini generó ${propuestas.length} actividad${propuestas.length !== 1 ? 'es' : ''} mágica${propuestas.length !== 1 ? 's' : ''}!`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al conectar con Gemini IA');
    } finally {
      setLoadingIA(false);
    }
  };

  const aplicarPropuesta = (p: PropuestaActividadIA) => {
    setEditando(null);
    setForm({
      tipo: p.tipo || 'juego',
      titulo: p.titulo,
      descripcion: p.descripcion,
      url: p.sugerencia_youtube_query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(p.sugerencia_youtube_query)}` : '',
      emoji: p.emoji || '⭐',
      color_fondo: p.color_fondo || accentC,
      contenido_interactivo: p.contenido_interactivo,
    });
    setDlgIAOpen(false);
    setDlgOpen(true);
    toast.success('Propuesta cargada lista para revisar o guardar');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
      {/* SIDEBAR */}
      <Box sx={{
        width: { xs: '100%', md: 300 }, flexShrink: 0, borderRadius: '18px',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff', overflow: 'hidden',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
        position: { xs: 'static', md: 'sticky' }, top: 24
      }}>
        <Box sx={{
          px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          bgcolor: isDark ? alpha(brand, 0.06) : alpha(brand, 0.03), display: 'flex', alignItems: 'center', gap: 1.2
        }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '9px', bgcolor: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.25)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MenuBookIcon sx={{ fontSize: 17, color: brand }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.1 }}>Campos de Saberes</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 600 }}>Temario Nivel Inicial</Typography>
          </Box>
        </Box>
        <List disablePadding sx={{ p: 1.2 }}>
          {campos.map((campo, i) => {
            const isA = i === idx; const color = CAMPOS_COLORES[campo.codigo] ?? brand;
            return (
              <ListItemButton key={campo.codigo} selected={isA} onClick={() => setIdx(i)}
                sx={{
                  borderRadius: '12px', mb: 0.5, px: 1.5, py: 1.2, transition: 'all 0.2s',
                  '&.Mui-selected': {
                    bgcolor: alpha(color, isDark ? 0.2 : 0.1), border: `1px solid ${alpha(color, 0.3)}`,
                    '&:hover': { bgcolor: alpha(color, isDark ? 0.25 : 0.12) }
                  },
                  '&:hover': { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03) }
                }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: '8px', bgcolor: isA ? alpha(color, 0.2) : alpha(color, 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mr: 1.5, color,
                  border: isA ? `1px solid ${alpha(color, 0.4)}` : 'none'
                }}>
                  {CAMPOS_ICONOS[campo.codigo] ?? <MenuBookIcon sx={{ fontSize: 18 }} />}
                </Box>
                <ListItemText
                  primary={<Typography sx={{ fontSize: '0.78rem', fontWeight: isA ? 800 : 600, color: isA ? color : 'text.primary', lineHeight: 1.2 }}>{campo.nombre}</Typography>}
                  secondary={<Typography sx={{ fontSize: '0.67rem', color: 'text.secondary', fontWeight: 500 }}>{campo.actividades.length} actividad{campo.actividades.length !== 1 ? 'es' : ''}</Typography>} />
                {campo.actividades.length > 0 && (
                  <Box sx={{
                    minWidth: 22, height: 22, borderRadius: '8px', bgcolor: isA ? alpha(color, 0.2) : alpha(color, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color }}>{campo.actividades.length}</Typography>
                  </Box>
                )}
              </ListItemButton>
            );
          })}
        </List>
        <Box sx={{
          px: 2.5, py: 1.5, borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01), display: 'flex', alignItems: 'center', gap: 0.8
        }}>
          <InfoIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled', fontWeight: 600 }}>Contenido multimedia para ninos</Typography>
        </Box>
      </Box>

      {/* MAIN AREA */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {loading ? (
          <Box>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: '18px', mb: 2 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map(i => <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}><Skeleton variant="rounded" height={200} sx={{ borderRadius: '20px' }} /></Grid>)}
            </Grid>
          </Box>
        ) : !campoActual ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 56, color: 'text.disabled' }} /><Typography variant="h6" color="text.secondary" fontWeight={700}>Sin campos disponibles</Typography>
          </Box>
        ) : (
          <>
            {/* Header campo activo */}
            <Box sx={{
              borderRadius: '18px', border: `1px solid ${alpha(accentC, 0.25)}`,
              bgcolor: isDark ? alpha(accentC, 0.07) : alpha(accentC, 0.04),
              p: { xs: 2, sm: 2.5 }, mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 46, height: 46, borderRadius: '13px', bgcolor: alpha(accentC, 0.15),
                  border: `2px solid ${alpha(accentC, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentC, flexShrink: 0
                }}>
                  {CAMPOS_ICONOS[campoActual.codigo] ?? <MenuBookIcon />}
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{campoActual.nombre}</Typography>
                    <Chip label={campoActual.codigo} size="small" sx={{
                      height: 20, fontSize: '0.62rem', fontFamily: 'monospace', fontWeight: 800,
                      bgcolor: alpha(accentC, 0.15), color: accentC, border: `1px solid ${alpha(accentC, 0.3)}`
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.3, fontWeight: 500 }}>
                    {campoActual.actividades.length > 0 ? `${campoActual.actividades.length} actividad${campoActual.actividades.length !== 1 ? 'es' : ''} — minijuegos, videos, imágenes y dinámicas` : 'Sin contenido aún — genera con Gemini o agrega manualmente'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  startIcon={<SparklesIcon sx={{ fontSize: 16 }} />}
                  onClick={() => { setTemaIA(''); setPropuestasIA([]); setDlgIAOpen(true); }}
                  sx={{
                    borderRadius: '11px', textTransform: 'none', fontWeight: 800, fontSize: '0.82rem', py: 0.8, px: 2.2,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(236,72,153,0.35)',
                    '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' },
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  Crear con Gemini IA ✨
                </Button>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 15 }} />} onClick={() => abrirNuevo()}
                  sx={{
                    borderRadius: '11px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', py: 0.8, px: 1.8,
                    background: `linear-gradient(135deg,${accentC},${accentC})`, color: '#fff',
                    boxShadow: `0 2px 10px ${alpha(accentC, 0.4)}`, '&:hover': { opacity: 0.88 }, flexShrink: 0
                  }}>
                  Agregar Manual
                </Button>
              </Box>
            </Box>

            {/* Leyenda tipos */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
              {(['juego', 'video', 'imagen', 'actividad'] as TipoActividad[]).map(tipo => {
                const c = TIPO_CONFIG[tipo];
                return <Chip key={tipo} icon={c.icon} label={c.label} size="small" sx={{
                  height: 24, fontSize: '0.7rem', fontWeight: 700,
                  bgcolor: isDark ? alpha(c.color, 0.15) : c.bg, color: c.color, border: `1px solid ${alpha(c.color, 0.25)}`
                }} />;
              })}
            </Box>

            {/* Grid actividades */}
            {campoActual.actividades.length === 0 ? (
              <Box sx={{
                borderRadius: '20px', border: `1.5px dashed ${alpha(accentC, 0.35)}`,
                bgcolor: isDark ? alpha(accentC, 0.03) : alpha(accentC, 0.025), p: { xs: 4, sm: 6 }, textAlign: 'center'
              }}>
                <Box sx={{
                  width: 76, height: 76, borderRadius: '22px',
                  background: `linear-gradient(135deg,${alpha('#EC4899', 0.2)},${alpha('#8B5CF6', 0.12)})`,
                  border: `2px solid ${alpha('#EC4899', 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2, fontSize: '2.2rem'
                }}>✨</Box>
                <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
                  ¡Crea experiencias lúdicas con Gemini IA!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: 'auto' }}>
                  La inteligencia artificial diseña memoramas, adivinanzas infantiles y retos familiares listos para jugar en un clic.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SparklesIcon sx={{ fontSize: 20 }} />}
                    onClick={() => { setTemaIA(''); setPropuestasIA([]); setDlgIAOpen(true); }}
                    sx={{
                      borderRadius: '14px', textTransform: 'none', fontWeight: 800, fontSize: '0.9rem', py: 1.2, px: 3.5,
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      color: '#fff',
                      boxShadow: '0 6px 20px rgba(236,72,153,0.4)',
                      '&:hover': { transform: 'scale(1.02)' },
                      transition: 'all 0.2s'
                    }}
                  >
                    Generar Actividades con Gemini IA ✨
                  </Button>
                </Box>

                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                  O agregar contenido manual:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(['juego', 'video', 'imagen', 'actividad'] as TipoActividad[]).map(tipo => {
                    const c = TIPO_CONFIG[tipo];
                    return <Button key={tipo} size="small" variant="outlined" onClick={() => abrirNuevo(tipo)}
                      sx={{
                        borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                        borderColor: alpha(c.color, 0.4), color: c.color, '&:hover': { bgcolor: alpha(c.color, 0.08) }
                      }}>
                      {c.label}
                    </Button>;
                  })}
                </Box>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {campoActual.actividades.map(act => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={act.id}>
                    <ActividadCard
                      a={act}
                      isDark={isDark}
                      onEdit={abrirEditar}
                      onDel={(a) => setDlgDel(a)}
                      onJugar={(a) => setActividadPreview(a)}
                    />
                  </Grid>
                ))}
                {/* Card agregar */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card elevation={0} onClick={() => abrirNuevo()} sx={{
                    borderRadius: '20px', height: '100%', minHeight: 220,
                    border: `1.5px dashed ${alpha(accentC, 0.35)}`,
                    bgcolor: isDark ? alpha(accentC, 0.03) : alpha(accentC, 0.025),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexDirection: 'column', gap: 1, transition: 'all 0.25s',
                    '&:hover': { borderColor: accentC, bgcolor: isDark ? alpha(accentC, 0.07) : alpha(accentC, 0.05), transform: 'translateY(-4px)' }
                  }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '14px', bgcolor: alpha(accentC, 0.12),
                      border: `1.5px solid ${alpha(accentC, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentC
                    }}>
                      <AddIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: accentC }}>Agregar nueva actividad</Typography>
                    <Typography variant="caption" color="text.secondary">O usa Gemini IA arriba ✨</Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* ══ DIALOG GEMINI IA GENERADOR DE ACTIVIDADES ══ */}
      <Dialog
        open={dlgIAOpen}
        onClose={() => !loadingIA && setDlgIAOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: isDark ? '#0d1117' : '#fff',
            border: `1px solid ${isDark ? alpha('#8B5CF6', 0.25) : alpha('#8B5CF6', 0.15)}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <Box sx={{
          px: 3, py: 2.5,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '13px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(236,72,153,0.4)', color: '#fff'
            }}>
              <SparklesIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
                Asistente Creativo Gemini IA · Nivel Inicial
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontWeight: 600 }}>
                {campoActual?.nombre} ({campoActual?.codigo})
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => !loadingIA && setDlgIAOpen(false)} sx={{ borderRadius: '8px' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Formulario de Prompt para el tema */}
          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary', mb: 0.8 }}>
              ¿Qué tema o experiencia lúdica deseas enseñar?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                placeholder="Ej: Los animalitos de la granja y sus sonidos, o Los colores del arcoíris..."
                value={temaIA}
                onChange={(e) => setTemaIA(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerarConIA(); }}
                disabled={loadingIA}
                sx={fieldSx}
                inputProps={{ maxLength: 150 }}
              />
              <Button
                variant="contained"
                onClick={() => handleGenerarConIA()}
                disabled={!temaIA.trim() || loadingIA}
                startIcon={loadingIA ? <CircularProgress size={16} color="inherit" /> : <SparklesIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '13px', px: 3, fontWeight: 800, textTransform: 'none',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: '#fff', boxShadow: '0 4px 14px rgba(236,72,153,0.3)',
                  flexShrink: 0, '&:disabled': { opacity: 0.5 }
                }}
              >
                {loadingIA ? 'Creando...' : 'Generar'}
              </Button>
            </Box>
          </Box>

          {/* ── Formato: Minijuego Interactivo vs Actividad Lúdica ── */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: 'text.primary', mb: 1 }}>
              🎯 Formato a generar con Gemini
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
              <Box
                onClick={() => setFormatoIA('juego')}
                sx={{
                  p: 1.5, borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${formatoIA === 'juego' ? '#10B981' : alpha(isDark ? '#fff' : '#000', 0.1)}`,
                  bgcolor: formatoIA === 'juego' ? alpha('#10B981', 0.12) : (isDark ? alpha('#fff', 0.03) : '#fafafa'),
                  boxShadow: formatoIA === 'juego' ? '0 4px 14px rgba(16,185,129,0.2)' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#10B981' }
                }}
              >
                <Typography sx={{ fontSize: '1.5rem', mb: 0.2 }}>🎮</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: formatoIA === 'juego' ? '#10B981' : 'text.primary' }}>
                  Minijuego Interactivo
                </Typography>
                <Typography sx={{ fontSize: '0.67rem', color: 'text.secondary', mt: 0.3, lineHeight: 1.3 }}>
                  Jugable en pantalla (arrastrar, cartas, adivinanza)
                </Typography>
              </Box>

              <Box
                onClick={() => setFormatoIA('actividad')}
                sx={{
                  p: 1.5, borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${formatoIA === 'actividad' ? '#F59E0B' : alpha(isDark ? '#fff' : '#000', 0.1)}`,
                  bgcolor: formatoIA === 'actividad' ? alpha('#F59E0B', 0.12) : (isDark ? alpha('#fff', 0.03) : '#fafafa'),
                  boxShadow: formatoIA === 'actividad' ? '0 4px 14px rgba(245,158,11,0.2)' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#F59E0B' }
                }}
              >
                <Typography sx={{ fontSize: '1.5rem', mb: 0.2 }}>📖</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: formatoIA === 'actividad' ? '#F59E0B' : 'text.primary' }}>
                  Actividad Lúdica
                </Typography>
                <Typography sx={{ fontSize: '0.67rem', color: 'text.secondary', mt: 0.3, lineHeight: 1.3 }}>
                  Dinámica pedagógica guiada para el aula o grupo
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Subtipo si es Minijuego, o nota si es Actividad Lúdica ── */}
          {formatoIA === 'juego' ? (
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: 'text.primary', mb: 1 }}>
                🎮 Tipo de minijuego a generar
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {([
                  { key: 'mixto', label: '🔀 Variedad (mixto)', desc: 'Mezcla todos los tipos' },
                  { key: 'memorama', label: '🃏 Memorama', desc: 'Encontrar parejas de cartas' },
                  { key: 'adivinanza', label: '❓ Adivinanza', desc: 'Elegir la respuesta correcta' },
                  { key: 'arrastrar', label: '🖐️ Arrastrar y soltar', desc: 'Mover elementos a su lugar' },
                  { key: 'tarjetas', label: '📇 Tarjetas', desc: 'Explorar tarjetas interactivas' },
                ] as { key: typeof tipoJuegoIA; label: string; desc: string }[]).map(({ key, label, desc }) => {
                  const isSelected = tipoJuegoIA === key;
                  return (
                    <Tooltip key={key} title={desc} arrow>
                      <Chip
                        label={label}
                        onClick={() => setTipoJuegoIA(key)}
                        sx={{
                          fontSize: '0.76rem', fontWeight: 700, py: 1.8, px: 0.5,
                          cursor: 'pointer', transition: 'all 0.18s',
                          bgcolor: isSelected ? 'rgba(16,185,129,0.18)' : (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)),
                          border: `1.5px solid ${isSelected ? '#10B981' : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08))}`,
                          color: isSelected ? '#10B981' : 'text.secondary',
                          boxShadow: isSelected ? '0 2px 10px rgba(16,185,129,0.25)' : 'none',
                          '&:hover': { bgcolor: alpha('#10B981', 0.12), borderColor: '#10B981', color: '#10B981' }
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box sx={{
              p: 1.5, borderRadius: '14px', bgcolor: alpha('#F59E0B', 0.08), border: `1px dashed ${alpha('#F59E0B', 0.35)}`,
              display: 'flex', alignItems: 'center', gap: 1.2
            }}>
              <Typography sx={{ fontSize: '1.3rem' }}>💡</Typography>
              <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', lineHeight: 1.4 }}>
                <b>Dinámicas pedagógicas de aula:</b> Gemini creará rondas, juegos grupales, canciones con mímica o desafíos de exploración con pasos claros para guiar con tus niños.
              </Typography>
            </Box>
          )}

          {/* ── Cantidad ── */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: 'text.primary', mb: 1 }}>
              🔢 Cantidad de actividades: <Box component="span" sx={{ color: '#8B5CF6', fontWeight: 900 }}>{cantidadIA}</Box>
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                const isSelected = cantidadIA === n;
                return (
                  <Box
                    key={n}
                    onClick={() => setCantidadIA(n)}
                    sx={{
                      width: 38, height: 38, borderRadius: '10px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      fontWeight: 800, fontSize: '0.88rem', transition: 'all 0.18s',
                      bgcolor: isSelected ? '#8B5CF6' : (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04)),
                      border: `1.5px solid ${isSelected ? '#8B5CF6' : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08))}`,
                      color: isSelected ? '#fff' : 'text.secondary',
                      boxShadow: isSelected ? '0 4px 12px rgba(139,92,246,0.35)' : 'none',
                      '&:hover': { bgcolor: isSelected ? '#7C3AED' : alpha('#8B5CF6', 0.12), borderColor: '#8B5CF6' },
                    }}
                  >
                    {n}
                  </Box>
                );
              })}
            </Box>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mt: 0.6, fontWeight: 600 }}>
              Tip: Entre más actividades, más tarda Gemini en crearlas ✨
            </Typography>
          </Box>

          {/* Sugerencias Rápidas */}
          <Box>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
              💡 O elige una temática sugerida para preescolar:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {SUGERENCIAS_TEMAS.map((sug) => (
                <Chip
                  key={sug}
                  label={sug}
                  size="small"
                  onClick={() => { setTemaIA(sug); handleGenerarConIA(sug); }}
                  sx={{
                    fontSize: '0.72rem', fontWeight: 600, py: 1.6, px: 0.5,
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                    '&:hover': { bgcolor: alpha('#8B5CF6', 0.15), borderColor: '#8B5CF6', color: '#8B5CF6' }
                  }}
                />
              ))}
            </Box>
          </Box>


          {/* Loading Animation */}
          {loadingIA && (
            <Box sx={{
              py: 5, textAlign: 'center', borderRadius: '18px',
              bgcolor: isDark ? alpha('#8B5CF6', 0.05) : alpha('#8B5CF6', 0.03),
              border: `1px dashed ${alpha('#8B5CF6', 0.3)}`
            }}>
              <CircularProgress size={36} sx={{ color: '#EC4899', mb: 1.5 }} />
              <Typography variant="body1" fontWeight={800} color="#8B5CF6">
                Gemini está diseñando actividades interactivas mágicas...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preparando minijuegos, tarjetas visuales y retos para niños de 3 a 5 años
              </Typography>
            </Box>
          )}

          {/* Propuestas generadas */}
          {propuestasIA.length > 0 && !loadingIA && (
            <Box>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🎯 Propuestas creadas por Gemini</span>
                <Chip label="Selecciona una para usarla" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha('#10B981', 0.15), color: '#10B981' }} />
              </Typography>

              <Grid container spacing={2}>
                {propuestasIA.map((p, pIdx) => {
                  const tc = TIPO_CONFIG[p.tipo] || TIPO_CONFIG.juego;
                  return (
                    <Grid size={{ xs: 12, md: 4 }} key={pIdx}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 2, height: '100%', borderRadius: '18px', display: 'flex', flexDirection: 'column',
                          border: `1.5px solid ${alpha(p.color_fondo || '#8B5CF6', 0.3)}`,
                          bgcolor: isDark ? alpha(p.color_fondo || '#8B5CF6', 0.05) : alpha(p.color_fondo || '#8B5CF6', 0.03),
                          transition: 'all 0.25s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 10px 24px ${alpha(p.color_fondo || '#8B5CF6', 0.2)}`,
                            borderColor: p.color_fondo || '#8B5CF6'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{
                            width: 38, height: 38, borderRadius: '10px', fontSize: '1.4rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(p.color_fondo || '#8B5CF6', 0.15)
                          }}>
                            {p.emoji}
                          </Box>
                          <Chip
                            icon={tc.icon}
                            label={tc.label}
                            size="small"
                            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, bgcolor: tc.bg, color: tc.color }}
                          />
                        </Box>

                        <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.25, mb: 0.8 }}>
                          {p.titulo}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, flex: 1, lineHeight: 1.4 }}>
                          {p.descripcion}
                        </Typography>

                        {/* Detalles del minijuego */}
                        {p.contenido_interactivo && (
                          <Box sx={{
                            p: 1, borderRadius: '10px', mb: 1.5,
                            bgcolor: isDark ? alpha('#000', 0.3) : '#fff',
                            border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.06)}`
                          }}>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: p.color_fondo || '#8B5CF6' }}>
                              🎮 Tipo: {p.contenido_interactivo.tipo_interaccion}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                              {p.contenido_interactivo.elementos?.length || 0} elementos lúdicos
                            </Typography>
                          </Box>
                        )}

                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          startIcon={<CheckIcon sx={{ fontSize: 15 }} />}
                          onClick={() => aplicarPropuesta(p)}
                          sx={{
                            borderRadius: '11px', fontWeight: 800, textTransform: 'none', py: 0.8,
                            bgcolor: p.color_fondo || '#8B5CF6', color: '#fff',
                            '&:hover': { filter: 'brightness(0.92)' }
                          }}
                        >
                          Usar esta actividad ✨
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ MODAL DE PREVISUALIZACIÓN / JUEGO INTERACTIVO ══ */}
      <Dialog
        open={!!actividadPreview}
        onClose={() => setActividadPreview(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: isDark ? '#0d1117' : '#fff',
            border: `1.5px solid ${alpha(actividadPreview?.color_fondo || '#10b981', 0.3)}`,
            overflow: 'hidden'
          }
        }}
      >
        {actividadPreview && (
          <Box>
            <Box sx={{
              p: 2.5,
              background: `linear-gradient(135deg, ${actividadPreview.color_fondo || '#10B981'}, ${alpha(actividadPreview.color_fondo || '#10B981', 0.7)})`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '2rem' }}>{actividadPreview.emoji}</Typography>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>
                    {actividadPreview.titulo}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    Modo {actividadPreview.contenido_interactivo?.tipo_interaccion || actividadPreview.tipo}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setActividadPreview(null)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                {actividadPreview.descripcion || actividadPreview.contenido_interactivo?.instruccion}
              </Typography>

              {/* Elementos interactivos del minijuego */}
              {actividadPreview.contenido_interactivo?.elementos && (
                <Grid container spacing={1.5} sx={{ mb: 2.5, justifyContent: 'center' }}>
                  {actividadPreview.contenido_interactivo.elementos.map((elem: any, elIdx: number) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={elIdx}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 1.8, borderRadius: '16px', textAlign: 'center',
                          border: `2px solid ${alpha(actividadPreview.color_fondo || '#10B981', 0.3)}`,
                          bgcolor: alpha(actividadPreview.color_fondo || '#10B981', 0.08),
                          cursor: 'pointer', transition: 'all 0.2s',
                          '&:hover': { transform: 'scale(1.05)', bgcolor: alpha(actividadPreview.color_fondo || '#10B981', 0.15) }
                        }}
                        onClick={() => toast.success(`¡${elem.nombre}! ${elem.pista || '⭐'}`)}
                      >
                        <Typography sx={{ fontSize: '2.4rem', mb: 0.5 }}>{elem.emoji}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>{elem.nombre}</Typography>
                        {elem.pista && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', mt: 0.3 }}>
                            {elem.pista}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Zonas de destino si es tipo arrastrar */}
              {actividadPreview.contenido_interactivo?.zonas && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: 'text.secondary', mb: 1 }}>
                    🎯 Zonas destino para arrastrar:
                  </Typography>
                  <Grid container spacing={1.5} sx={{ justifyContent: 'center' }}>
                    {actividadPreview.contenido_interactivo.zonas.map((z: any) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={z.id}>
                        <Box sx={{
                          p: 1.5, borderRadius: '14px', textAlign: 'center',
                          border: `2px dashed ${z.color || '#8B5CF6'}`,
                          bgcolor: alpha(z.color || '#8B5CF6', 0.08)
                        }}>
                          <Typography sx={{ fontSize: '1.8rem' }}>{z.emoji}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: z.color || '#8B5CF6' }}>
                            {z.nombre}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {actividadPreview.contenido_interactivo?.reto_en_casa && (
                <Box sx={{
                  p: 2, borderRadius: '14px',
                  bgcolor: alpha('#f59e0b', 0.1), border: '1px dashed #f59e0b', mb: 2, textAlign: 'left'
                }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', mb: 0.3 }}>
                    🏠 Reto en familia:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {actividadPreview.contenido_interactivo.reto_en_casa}
                  </Typography>
                </Box>
              )}

              {actividadPreview.url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VideoIcon />}
                  onClick={() => window.open(actividadPreview.url!, '_blank')}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Ver Recurso Multimedia
                </Button>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setActividadPreview(null)}
                sx={{ borderRadius: '12px', fontWeight: 800, px: 4, bgcolor: actividadPreview.color_fondo || '#10B981' }}
              >
                Cerrar Prueba
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* DIALOG CREAR/EDITAR */}
      <Dialog open={dlgOpen} onClose={() => !submitting && setDlgOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '22px', bgcolor: isDark ? '#0d1117' : '#fff', border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` } }}>
        <Box sx={{
          px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isDark ? `linear-gradient(135deg,${alpha(accentC, 0.1)},transparent)` : `linear-gradient(135deg,${alpha(accentC, 0.06)},transparent)`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '11px',
              background: `linear-gradient(135deg,${accentC},${alpha(accentC, 0.7)})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(accentC, 0.35)}`, fontSize: '1.1rem'
            }}>
              {form.emoji}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>{editando ? 'Editar actividad' : 'Nueva actividad'}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, mt: 0.2 }}>{campoActual?.nombre}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => !submitting && setDlgOpen(false)} sx={{ borderRadius: '8px', color: 'text.secondary' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Selector tipo */}
          <Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>Tipo de contenido</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['juego', 'video', 'imagen', 'actividad'] as TipoActividad[]).map(tipo => {
                const c = TIPO_CONFIG[tipo]; const sel = form.tipo === tipo;
                return (
                  <Box key={tipo} onClick={() => setForm(f => ({ ...f, tipo }))}
                    sx={{
                      flex: 1, borderRadius: '12px', p: 1, textAlign: 'center', cursor: 'pointer',
                      border: `2px solid ${sel ? c.color : alpha(isDark ? '#fff' : '#000', 0.1)}`,
                      bgcolor: sel ? (isDark ? alpha(c.color, 0.15) : c.bg) : (isDark ? alpha('#fff', 0.02) : '#fafafa'), transition: 'all 0.15s'
                    }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: sel ? c.color : 'text.secondary' }}>{c.label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <TextField label="Titulo" placeholder="Ej: Pintando con los dedos..." value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} fullWidth autoFocus sx={fieldSx} inputProps={{ maxLength: 200 }} />
          {(form.tipo === 'video' || form.tipo === 'imagen') && (
            <TextField label={form.tipo === 'video' ? 'URL del video (YouTube)' : 'URL de la imagen'}
              placeholder={form.tipo === 'video' ? 'https://youtube.com/watch?v=...' : 'https://ejemplo.com/imagen.jpg'}
              value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              fullWidth sx={fieldSx} InputProps={{ startAdornment: <LinkIcon sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} /> }} />
          )}
          <TextField label="Descripcion o instrucciones (opcional)" value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            multiline minRows={2} maxRows={4} fullWidth sx={fieldSx} inputProps={{ maxLength: 400 }} />
          {/* Emoji */}
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>Emoji</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              {EMOJIS.map(em => (
                <Box key={em} onClick={() => setForm(f => ({ ...f, emoji: em }))}
                  sx={{
                    width: 34, height: 34, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem',
                    border: `2px solid ${form.emoji === em ? accentC : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                    bgcolor: form.emoji === em ? alpha(accentC, 0.12) : 'transparent', transition: 'all 0.12s',
                    '&:hover': { bgcolor: alpha(accentC, 0.08) }
                  }}>
                  {em}
                </Box>
              ))}
            </Box>
          </Box>
          {/* Color */}
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>Color de fondo</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
              {COLORES.map(color => (
                <Box key={color} onClick={() => setForm(f => ({ ...f, color_fondo: color }))}
                  sx={{
                    width: 26, height: 26, borderRadius: '8px', cursor: 'pointer', bgcolor: color,
                    border: `3px solid ${form.color_fondo === color ? '#fff' : 'transparent'}`,
                    outline: `2px solid ${form.color_fondo === color ? color : 'transparent'}`, transition: 'all 0.12s'
                  }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`, gap: 1 }}>
          <Button variant="text" onClick={() => !submitting && setDlgOpen(false)} disabled={submitting}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} disabled={!form.titulo.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5,
              background: `linear-gradient(135deg,${accentC},${accentC})`, color: '#fff',
              boxShadow: `0 2px 8px ${alpha(accentC, 0.4)}`, '&:hover': { opacity: 0.9 }, '&:disabled': { opacity: 0.5 }
            }}>
            {submitting ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Agregar al temario')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG ELIMINAR */}
      <Dialog open={!!dlgDel} onClose={() => !deleting && setDlgDel(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', bgcolor: isDark ? '#0d1117' : '#fff', border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#ef4444', 0.15)}` } }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px', bgcolor: alpha('#ef4444', 0.12), border: `1px solid ${alpha('#ef4444', 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
            }}>
              <DeleteForeverIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Eliminar actividad?</Typography>
          </Box>
        </Box>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {dlgDel && (
            <Box sx={{
              display: 'flex', gap: 1.5, alignItems: 'center', p: 1.5, borderRadius: '12px',
              bgcolor: isDark ? alpha('#ef4444', 0.07) : alpha('#ef4444', 0.04), border: `1px solid ${alpha('#ef4444', 0.2)}`, mb: 1.5
            }}>
              <Typography sx={{ fontSize: '1.5rem' }}>{dlgDel.emoji}</Typography>
              <Box>
                <Typography variant="body2" fontWeight={700}>{dlgDel.titulo}</Typography>
                <Chip label={TIPO_CONFIG[dlgDel.tipo]?.label ?? dlgDel.tipo} size="small"
                  sx={{ height: 18, fontSize: '0.62rem', mt: 0.3, fontWeight: 700 }} />
              </Box>
            </Box>
          )}
          <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>Esta accion no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`, gap: 1 }}>
          <Button variant="text" onClick={() => !deleting && setDlgDel(null)} disabled={deleting}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}>Cancelar</Button>
          <Button variant="contained" onClick={eliminar} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteForeverIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5, bgcolor: '#ef4444', color: '#fff', '&:hover': { bgcolor: '#dc2626' } }}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemarioInicialDocente;
