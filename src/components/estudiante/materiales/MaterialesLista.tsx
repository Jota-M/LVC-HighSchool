'use client';
// components/estudiante/materiales/MaterialesLista.tsx

import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, IconButton,
  TextField, InputAdornment, Skeleton, alpha, Tooltip, Fade,
  Pagination, Badge,
} from '@mui/material';
import {
  Search        as SearchIcon,
  Favorite      as FavIcon,
  FavoriteBorder as FavBorderIcon,
  OpenInNew     as OpenIcon,
  Star          as StarIcon,
  Visibility    as EyeIcon,
  CheckCircle   as CheckIcon,
  ChatBubble    as ChatIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  useMaterialesEstudiante,
  useFavoritosEstudiante,
} from '@/hooks/useEstudiante';
import type { MateriaResumen, MaterialEstudiante } from '@/services/estudianteService';

// ── Utilidades ────────────────────────────────────────────────

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getMaterialEmoji = (icono?: string, mime?: string | null, esEnlace?: boolean) => {
  if (icono) return icono;
  if (esEnlace) return '🔗';
  if (!mime)   return '📄';
  if (mime.includes('pdf'))   return '📕';
  if (mime.includes('video')) return '🎬';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('word'))  return '📝';
  if (mime.includes('sheet') || mime.includes('excel')) return '📊';
  return '📄';
};

// ── Props ─────────────────────────────────────────────────────

interface MaterialesListaProps {
  materia:    MateriaResumen;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

// ── Lista principal ────────────────────────────────────────────

export const MaterialesLista: React.FC<MaterialesListaProps> = ({
  materia, accent, accentDark, isDark,
}) => {
  const router  = useRouter();
  const [search, setSearch] = useState('');

  const {
    materiales,
    paginacion,
    page,
    setPage,
    isLoading,
  } = useMaterialesEstudiante(materia.asignacion_docente_id);

  const { esFavorito, toggle: toggleFav, toggling } = useFavoritosEstudiante();

  // Filtrado local por texto
  const filtrados = search.trim()
    ? materiales.filter(m =>
        m.titulo.toLowerCase().includes(search.toLowerCase()) ||
        m.descripcion?.toLowerCase().includes(search.toLowerCase())
      )
    : materiales;

  const destacados = filtrados.filter(m => m.es_destacado);
  const normales   = filtrados.filter(m => !m.es_destacado);

  return (
    <Box>
      {/* ── Buscador ── */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar material…"
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
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover fieldset': { borderColor: alpha(accent, 0.5) },
              '&.Mui-focused fieldset': { borderColor: accent },
            },
          }}
        />
      </Box>

      {/* ── Skeleton ── */}
      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={210} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : filtrados.length === 0 ? (
        /* ── Empty state ── */
        <Box
          sx={{
            textAlign: 'center', py: 10,
            borderRadius: '18px',
            border: `2px dashed ${alpha(accent, 0.18)}`,
          }}
        >
          <Typography fontSize="2.5rem" mb={1}>📭</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {search ? 'Sin resultados' : 'Sin materiales disponibles'}
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={0.5}>
            {search
              ? `No se encontraron materiales para "${search}"`
              : 'Tu docente aún no ha publicado materiales para esta materia.'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* ── Destacados ── */}
          {destacados.length > 0 && !search && (
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  DESTACADOS
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {destacados.map(m => (
                  <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <MaterialCard
                      material={m}
                      accent={accent}
                      isDark={isDark}
                      esFavorito={esFavorito(m.id)}
                      toggling={toggling === m.id}
                      onToggleFav={() => toggleFav(m.id)}
                      onAbrir={() => router.push(`/dashboard/estudiante/materiales/${m.id}`)}
                      destacado
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* ── Normales ── */}
          {normales.length > 0 && (
            <>
              {destacados.length > 0 && !search && (
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
                  TODOS LOS MATERIALES
                </Typography>
              )}
              <Grid container spacing={2}>
                {normales.map(m => (
                  <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <MaterialCard
                      material={m}
                      accent={accent}
                      isDark={isDark}
                      esFavorito={esFavorito(m.id)}
                      toggling={toggling === m.id}
                      onToggleFav={() => toggleFav(m.id)}
                      onAbrir={() => router.push(`/dashboard/estudiante/materiales/${m.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      {/* ── Paginación ── */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={paginacion.totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': { borderRadius: '8px' },
              '& .Mui-selected': {
                bgcolor: `${accent} !important`,
                color: isDark ? '#000' : '#fff',
                fontWeight: 700,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// ── Card individual ────────────────────────────────────────────

interface MaterialCardProps {
  material:    MaterialEstudiante;
  accent:      string;
  isDark:      boolean;
  esFavorito:  boolean;
  toggling:    boolean;
  onToggleFav: () => void;
  onAbrir:     () => void;
  destacado?:  boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material, accent, isDark, esFavorito, toggling, onToggleFav, onAbrir, destacado,
}) => {
  const iconColor = material.tipo_material_color || accent;
  const emoji     = getMaterialEmoji(material.tipo_material_icono, material.tipo_mime, material.es_enlace_externo);
  const tamano    = formatBytes(material.tamano_bytes);

  return (
    <Fade in timeout={280}>
      <Card
        elevation={0}
        onClick={onAbrir}
        sx={{
          borderRadius: '16px',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          bgcolor: isDark ? alpha('#fff', 0.025) : '#fff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.22s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 10px 30px ${alpha(iconColor, 0.18)}`,
            borderColor: alpha(iconColor, 0.3),
          },
        }}
      >
        {/* Barra de color */}
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${iconColor}, ${alpha(iconColor, 0.25)})`,
          }}
        />

        {/* Badge ya visto */}
        {material.ya_accedido && (
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
            <Tooltip title="Ya revisado">
              <CheckIcon sx={{ fontSize: 15, color: '#22c55e' }} />
            </Tooltip>
          </Box>
        )}

        {/* Badge destacado */}
        {destacado && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
            <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
          </Box>
        )}

        <CardContent sx={{ flex: 1, pb: 1, pt: material.ya_accedido ? 1.5 : 2 }}>
          {/* Icono tipo */}
          <Box
            sx={{
              width: 44, height: 44,
              borderRadius: '12px',
              bgcolor: alpha(iconColor, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.35rem',
              mb: 1.5,
            }}
          >
            {emoji}
          </Box>

          {/* Chip tipo */}
          <Chip
            label={material.tipo_material_nombre}
            size="small"
            sx={{
              height: 18, fontSize: '0.6rem', fontWeight: 700, mb: 0.75,
              bgcolor: alpha(iconColor, 0.1), color: iconColor,
              borderRadius: '6px',
            }}
          />

          {/* Título */}
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4, mb: 0.5,
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
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.5,
              }}
            >
              {material.descripcion}
            </Typography>
          )}

          {/* Tamaño */}
          {tamano && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              {tamano}
            </Typography>
          )}
        </CardContent>

        {/* Footer: métricas + acciones */}
        <Box
          sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            px: 2, pb: 1.5, pt: 0.5,
            borderTop: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.05)}`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Métricas */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Vistas — CORREGIDO: usa contador_vistas directo del material */}
            <Tooltip title={`${material.contador_vistas ?? 0} vistas`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                <EyeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                  {material.contador_vistas ?? 0}
                </Typography>
              </Box>
            </Tooltip>

            {/* Comentarios */}
            {(material.total_comentarios ?? 0) > 0 && (
              <Tooltip title={`${material.total_comentarios} comentarios`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  <ChatIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" lineHeight={1}>
                    {material.total_comentarios}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>

          {/* Acciones */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Abrir enlace/archivo directamente */}
            {(material.url_archivo || material.url_externa) && (
              <Tooltip title={material.es_enlace_externo ? 'Abrir enlace' : 'Ver archivo'}>
                <IconButton
                  size="small"
                  component="a"
                  href={(material.url_externa || material.url_archivo)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    p: 0.6, borderRadius: '8px',
                    color: iconColor,
                    bgcolor: alpha(iconColor, 0.08),
                    '&:hover': { bgcolor: alpha(iconColor, 0.16) },
                  }}
                >
                  <OpenIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Favorito */}
            <Tooltip title={esFavorito ? 'Quitar favorito' : 'Guardar en favoritos'}>
              <IconButton
                size="small"
                disabled={toggling}
                onClick={onToggleFav}
                sx={{
                  p: 0.6, borderRadius: '8px',
                  color: esFavorito ? '#ef4444' : 'text.disabled',
                  '&:hover': { bgcolor: alpha('#ef4444', 0.08), color: '#ef4444' },
                  transition: 'color 0.18s',
                }}
              >
                {esFavorito
                  ? <FavIcon sx={{ fontSize: 15 }} />
                  : <FavBorderIcon sx={{ fontSize: 15 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>
    </Fade>
  );
};

export default MaterialesLista;