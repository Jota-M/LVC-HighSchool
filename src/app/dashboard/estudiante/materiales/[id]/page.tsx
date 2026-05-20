'use client';
// app/dashboard/estudiante/materiales/[id]/page.tsx

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, IconButton, Chip, Button, Skeleton,
  TextField, Avatar, Divider, Tooltip, alpha, useTheme,
  CircularProgress, Collapse, Badge,
} from '@mui/material';
import {
  ArrowBack         as BackIcon,
  Favorite          as FavIcon,
  FavoriteBorder    as FavBorderIcon,
  Download          as DownloadIcon,
  OpenInNew         as OpenIcon,
  ChatBubbleOutline as CommentIcon,
  HelpOutline       as DudaIcon,
  Send              as SendIcon,
  CheckCircle       as CheckIcon,
  Book              as BookIcon,
  AccessTime        as TimeIcon,
  Visibility        as EyeIcon,
  GetApp            as GetAppIcon,
  ExpandMore        as ExpandIcon,
  ExpandLess        as CollapseIcon,
  Link              as LinkIcon,
  PictureAsPdf      as PdfIcon,
  PlayCircle        as VideoIcon,
  Image             as ImageIcon,
} from '@mui/icons-material';
import { useMaterialDetalle, useComentariosMaterial } from '@/hooks/Usematerialdetalle';

// ── Utilidades ────────────────────────────────────────────────

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatFecha = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
};

const getYoutubeId = (url: string) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
};

const getMaterialIcon = (mime?: string | null, esEnlace?: boolean) => {
  if (esEnlace) return '🔗';
  if (!mime) return '📄';
  if (mime.includes('pdf'))   return '📕';
  if (mime.includes('video')) return '🎬';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  if (mime.includes('sheet') || mime.includes('excel'))   return '📊';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return '📊';
  return '📄';
};

// ── Visor de contenido ────────────────────────────────────────

const VisorContenido: React.FC<{
  url?: string | null;
  urlExterna?: string | null;
  esEnlace: boolean;
  mime?: string | null;
  titulo: string;
  accent: string;
  isDark: boolean;
}> = ({ url, urlExterna, esEnlace, mime, titulo, accent, isDark }) => {
  const urlFinal = urlExterna || url;
  if (!urlFinal) return null;

  // YouTube embed
  if (urlFinal) {
    const ytId = getYoutubeId(urlFinal);
    if (ytId) {
      return (
        <Box
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            paddingTop: '56.25%', // 16:9
            bgcolor: '#000',
          }}
        >
          <iframe
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            src={`https://www.youtube.com/embed/${ytId}`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      );
    }
  }

  // PDF embed
  if (mime?.includes('pdf') && !esEnlace && url) {
    return (
      <Box
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${alpha(accent, 0.2)}`,
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
        }}
      >
        <iframe
          src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
          style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
          title={titulo}
        />
      </Box>
    );
  }

  // Imagen
  if (mime?.includes('image') && url) {
    return (
      <Box
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
          border: `1px solid ${alpha(accent, 0.15)}`,
          p: 2,
        }}
      >
        <img
          src={url}
          alt={titulo}
          style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, objectFit: 'contain' }}
        />
      </Box>
    );
  }

  // Enlace externo genérico
  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: `2px dashed ${alpha(accent, 0.35)}`,
        p: 4,
        textAlign: 'center',
        bgcolor: alpha(accent, 0.04),
      }}
    >
      <Box sx={{ fontSize: '3rem', mb: 1 }}>
        {getMaterialIcon(mime, esEnlace)}
      </Box>
      <Typography variant="body1" fontWeight={600} mb={2}>
        {esEnlace ? 'Recurso externo' : 'Archivo disponible'}
      </Typography>
      <Button
        variant="contained"
        href={urlFinal}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<OpenIcon />}
        sx={{
          borderRadius: '10px',
          bgcolor: accent,
          color: isDark ? '#000' : '#fff',
          fontWeight: 700,
          '&:hover': { bgcolor: alpha(accent, 0.85) },
        }}
      >
        {esEnlace ? 'Abrir enlace' : 'Ver archivo'}
      </Button>
    </Box>
  );
};

// ── Tarjeta de tema vinculado ─────────────────────────────────

const TemaChip: React.FC<{ tema: any; accent: string }> = ({ tema, accent }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.5,
      py: 0.75,
      borderRadius: '10px',
      bgcolor: alpha(accent, 0.08),
      border: `1px solid ${alpha(accent, 0.15)}`,
    }}
  >
    <BookIcon sx={{ fontSize: 13, color: accent }} />
    <Box>
      <Typography variant="caption" color="text.disabled" display="block" lineHeight={1}>
        U{tema.numero_unidad} · {tema.unidad_titulo}
      </Typography>
      <Typography variant="caption" fontWeight={600} color={accent} lineHeight={1.4}>
        T{tema.numero_tema}: {tema.tema_titulo}
      </Typography>
    </Box>
    {tema.es_principal && (
      <Chip label="Principal" size="small" sx={{ height: 16, fontSize: '0.58rem', bgcolor: alpha(accent, 0.15), color: accent }} />
    )}
  </Box>
);

// ── Comentario ────────────────────────────────────────────────

const ComentarioItem: React.FC<{
  c: any;
  accent: string;
  isDark: boolean;
  onResponder: (id: number) => void;
}> = ({ c, accent, isDark, onResponder }) => {
  const initials = `${c.autor_nombres?.[0] ?? ''}${c.autor_apellidos?.[0] ?? ''}`.toUpperCase();

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700,
            bgcolor: alpha(accent, 0.15), color: accent, flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
            <Typography variant="caption" fontWeight={700}>
              {c.autor_nombres} {c.autor_apellidos}
            </Typography>
            {c.es_duda && (
              <Chip
                icon={<DudaIcon sx={{ fontSize: '10px !important' }} />}
                label={c.es_resuelto ? 'Resuelta' : 'Duda'}
                size="small"
                sx={{
                  height: 16, fontSize: '0.6rem',
                  bgcolor: c.es_resuelto ? alpha('#22c55e', 0.12) : alpha('#f59e0b', 0.12),
                  color: c.es_resuelto ? '#22c55e' : '#f59e0b',
                }}
              />
            )}
            <Typography variant="caption" color="text.disabled">{timeAgo(c.created_at)}</Typography>
          </Box>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{c.contenido}</Typography>
          <Button
            size="small"
            onClick={() => onResponder(c.id)}
            sx={{ mt: 0.5, fontSize: '0.7rem', color: 'text.disabled', p: 0, minWidth: 0 }}
          >
            Responder
          </Button>
        </Box>
      </Box>

      {/* Respuestas anidadas */}
      {c.respuestas?.length > 0 && (
        <Box sx={{ ml: 5.5, mt: 1, pl: 1.5, borderLeft: `2px solid ${alpha(accent, 0.2)}` }}>
          {c.respuestas.map((r: any) => (
            <Box key={r.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 26, height: 26, fontSize: '0.65rem', bgcolor: alpha(accent, 0.1), color: accent, flexShrink: 0 }}>
                {`${r.autor_nombres?.[0] ?? ''}${r.autor_apellidos?.[0] ?? ''}`.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.2 }}>
                  <Typography variant="caption" fontWeight={700}>{r.autor_nombres} {r.autor_apellidos}</Typography>
                  <Typography variant="caption" color="text.disabled">{timeAgo(r.created_at)}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{r.contenido}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ── Sección de comentarios ────────────────────────────────────

const SeccionComentarios: React.FC<{ material_id: number; accent: string; isDark: boolean }> = ({
  material_id, accent, isDark,
}) => {
  const { comentarios, isLoading, enviando, soloDudas, setSoloDudas, crear } = useComentariosMaterial(material_id);
  const [texto, setTexto]         = useState('');
  const [esDuda, setEsDuda]       = useState(false);
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [textoResp, setTextoResp] = useState('');
  const textareaRef = useRef<HTMLInputElement>(null);

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    const ok = await crear(texto, { es_duda: esDuda });
    if (ok) { setTexto(''); setEsDuda(false); }
  };

  const handleResponder = async (padre_id: number) => {
    if (!textoResp.trim()) return;
    const ok = await crear(textoResp, { comentario_padre_id: padre_id });
    if (ok) { setTextoResp(''); setRespondiendo(null); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon sx={{ fontSize: 18, color: accent }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Comentarios y Dudas
          </Typography>
          <Chip
            label={comentarios.length}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(accent, 0.12), color: accent }}
          />
        </Box>
        <Button
          size="small"
          variant={soloDudas ? 'contained' : 'outlined'}
          onClick={() => setSoloDudas(!soloDudas)}
          startIcon={<DudaIcon sx={{ fontSize: '14px !important' }} />}
          sx={{
            borderRadius: '8px', fontSize: '0.72rem',
            ...(soloDudas
              ? { bgcolor: accent, color: isDark ? '#000' : '#fff', '&:hover': { bgcolor: alpha(accent, 0.85) } }
              : { borderColor: alpha(accent, 0.4), color: accent }),
          }}
        >
          Solo dudas
        </Button>
      </Box>

      {/* Input nuevo comentario */}
      <Box
        sx={{
          borderRadius: '14px',
          border: `1px solid ${alpha(accent, 0.2)}`,
          bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
          p: 1.5,
          mb: 3,
        }}
      >
        <TextField
          inputRef={textareaRef}
          fullWidth
          multiline
          minRows={2}
          placeholder="Escribe un comentario o pregunta…"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{ '& textarea': { fontSize: '0.875rem' } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Button
            size="small"
            variant={esDuda ? 'contained' : 'text'}
            onClick={() => setEsDuda(!esDuda)}
            startIcon={<DudaIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              borderRadius: '8px', fontSize: '0.72rem',
              ...(esDuda
                ? { bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', '&:hover': { bgcolor: alpha('#f59e0b', 0.25) } }
                : { color: 'text.disabled' }),
            }}
          >
            Marcar como duda
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!texto.trim() || enviando}
            onClick={handleEnviar}
            endIcon={enviando ? <CircularProgress size={12} /> : <SendIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              borderRadius: '8px', fontWeight: 700,
              bgcolor: accent, color: isDark ? '#000' : '#fff',
              '&:hover': { bgcolor: alpha(accent, 0.85) },
              '&:disabled': { bgcolor: alpha(accent, 0.3) },
            }}
          >
            Enviar
          </Button>
        </Box>
      </Box>

      {/* Lista */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '10px' }} />)}
        </Box>
      ) : comentarios.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" color="text.disabled">
            {soloDudas ? 'No hay dudas publicadas' : 'Sé el primero en comentar'}
          </Typography>
        </Box>
      ) : (
        comentarios.map(c => (
          <Box key={c.id}>
            <ComentarioItem
              c={c}
              accent={accent}
              isDark={isDark}
              onResponder={id => { setRespondiendo(id === respondiendo ? null : id); setTextoResp(''); }}
            />

            {/* Input respuesta */}
            <Collapse in={respondiendo === c.id}>
              <Box
                sx={{
                  ml: 5.5, mb: 2, borderRadius: '12px',
                  border: `1px solid ${alpha(accent, 0.2)}`,
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  p: 1.5,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Escribe tu respuesta…"
                  value={textoResp}
                  onChange={e => setTextoResp(e.target.value)}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={() => setRespondiendo(null)} sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                    Cancelar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!textoResp.trim() || enviando}
                    onClick={() => handleResponder(c.id)}
                    sx={{
                      borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem',
                      bgcolor: accent, color: isDark ? '#000' : '#fff',
                    }}
                  >
                    Responder
                  </Button>
                </Box>
              </Box>
            </Collapse>
            <Divider sx={{ mb: 2, opacity: 0.4 }} />
          </Box>
        ))
      )}
    </Box>
  );
};

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────

export default function MaterialDetallePage() {
  const params   = useParams();
  const router   = useRouter();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const material_id = Number(params.id);
  const { material, isLoading, error, toggleFavorito, registrarDescarga } = useMaterialDetalle(material_id);

  const [temasExpanded, setTemasExpanded] = useState(true);
  const [comentariosExpanded, setComentariosExpanded] = useState(true);

  // Accent color del material o fallback
  const accent = material?.materia_color || '#6366f1';

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
        <Skeleton variant="rounded" height={56} width={200} sx={{ mb: 3, borderRadius: '12px' }} />
        <Skeleton variant="rounded" height={300} sx={{ mb: 3, borderRadius: '16px' }} />
        <Skeleton variant="rounded" height={120} sx={{ mb: 2, borderRadius: '14px' }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: '14px' }} />
      </Box>
    );
  }

  if (error || !material) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" mb={2}>
          {error || 'Material no encontrado'}
        </Typography>
        <Button onClick={() => router.back()} startIcon={<BackIcon />} variant="outlined">
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 960, mx: 'auto' }}>

      {/* ── Back ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton
          onClick={() => router.back()}
          size="small"
          sx={{
            borderRadius: '10px',
            border: `1px solid ${alpha(accent, 0.25)}`,
            color: accent,
            '&:hover': { bgcolor: alpha(accent, 0.08) },
          }}
        >
          <BackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {material.materia_nombre}
        </Typography>
      </Box>

      {/* ── Header del material ── */}
      <Box
        sx={{
          borderRadius: '20px',
          border: `1px solid ${alpha(accent, 0.2)}`,
          overflow: 'hidden',
          mb: 3,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          boxShadow: `0 4px 24px ${alpha(accent, 0.08)}`,
        }}
      >
        {/* Barra de color superior */}
        <Box
          sx={{
            height: 6,
            background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.3)})`,
          }}
        />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Icono */}
            <Box
              sx={{
                width: 56, height: 56, borderRadius: '14px',
                bgcolor: alpha(accent, 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', flexShrink: 0,
              }}
            >
              {getMaterialIcon(material.tipo_mime, material.es_enlace_externo)}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Chip
                  label={material.tipo_material_nombre}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.65rem', fontWeight: 700,
                    bgcolor: alpha(accent, 0.12), color: accent,
                  }}
                />
                {material.es_destacado && (
                  <Chip label="⭐ Destacado" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }} />
                )}
                {material.ya_accedido && (
                  <Chip icon={<CheckIcon sx={{ fontSize: '11px !important' }} />} label="Visto" size="small"
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#22c55e', 0.1), color: '#22c55e' }} />
                )}
              </Box>

              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                {material.titulo}
              </Typography>

              {material.descripcion && (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {material.descripcion}
                </Typography>
              )}

              {/* Meta */}
              <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EyeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {material.contador_vistas} vistas
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GetAppIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {material.contador_descargas} descargas
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatFecha(material.fecha_publicacion)}
                  </Typography>
                </Box>
                {material.tamano_bytes && (
                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(material.tamano_bytes)}
                  </Typography>
                )}
              </Box>

              {/* Docente */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: alpha(accent, 0.15), color: accent }}>
                  {material.docente_nombres?.[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {material.docente_nombres} {material.docente_apellidos}
                </Typography>
              </Box>
            </Box>

            {/* Acciones */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
              <Tooltip title={material.es_favorito ? 'Quitar favorito' : 'Guardar en favoritos'}>
                <IconButton
                  onClick={toggleFavorito}
                  sx={{
                    borderRadius: '10px',
                    border: `1px solid ${material.es_favorito ? alpha('#ef4444', 0.3) : alpha(accent, 0.2)}`,
                    color: material.es_favorito ? '#ef4444' : 'text.disabled',
                    '&:hover': { bgcolor: alpha('#ef4444', 0.08) },
                  }}
                >
                  {material.es_favorito ? <FavIcon /> : <FavBorderIcon />}
                </IconButton>
              </Tooltip>

              {(material.url_archivo || material.url_externa) && (
                <Button
                  variant="contained"
                  size="small"
                  href={(material.url_externa || material.url_archivo)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={registrarDescarga}
                  startIcon={material.es_enlace_externo ? <OpenIcon sx={{ fontSize: '15px !important' }} /> : <DownloadIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{
                    borderRadius: '10px', fontWeight: 700, fontSize: '0.78rem',
                    bgcolor: accent, color: isDark ? '#000' : '#fff',
                    '&:hover': { bgcolor: alpha(accent, 0.85) },
                  }}
                >
                  {material.es_enlace_externo ? 'Abrir' : 'Descargar'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Visor ── */}
      {(material.url_archivo || material.url_externa) && (
        <Box sx={{ mb: 3 }}>
          <VisorContenido
            url={material.url_archivo}
            urlExterna={material.url_externa}
            esEnlace={material.es_enlace_externo}
            mime={material.tipo_mime}
            titulo={material.titulo}
            accent={accent}
            isDark={isDark}
          />
        </Box>
      )}

      {/* ── Temas vinculados ── */}
      {material.temas?.length > 0 && (
        <Box
          sx={{
            borderRadius: '16px',
            border: `1px solid ${alpha(accent, 0.15)}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            mb: 3, overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2.5, py: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha(accent, 0.03) },
            }}
            onClick={() => setTemasExpanded(!temasExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon sx={{ fontSize: 17, color: accent }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Temas del temario
              </Typography>
              <Chip label={material.temas.length} size="small"
                sx={{ height: 18, fontSize: '0.63rem', bgcolor: alpha(accent, 0.1), color: accent }} />
            </Box>
            {temasExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
          </Box>

          <Collapse in={temasExpanded}>
            <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {material.temas.map(t => <TemaChip key={t.tema_id} tema={t} accent={accent} />)}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* ── Comentarios ── */}
      <Box
        sx={{
          borderRadius: '16px',
          border: `1px solid ${alpha(accent, 0.15)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 1.5,
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha(accent, 0.03) },
          }}
          onClick={() => setComentariosExpanded(!comentariosExpanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommentIcon sx={{ fontSize: 17, color: accent }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Comentarios y Dudas
            </Typography>
          </Box>
          {comentariosExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
        </Box>

        <Collapse in={comentariosExpanded}>
          <Box sx={{ px: 2.5, pb: 3 }}>
            <SeccionComentarios material_id={material_id} accent={accent} isDark={isDark} />
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}