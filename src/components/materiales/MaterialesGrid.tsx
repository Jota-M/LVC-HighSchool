'use client';
// components/materiales/MaterialesGrid.tsx
import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Chip, IconButton,
  TextField, InputAdornment, MenuItem, Skeleton, Pagination, Tooltip,
  alpha, useTheme, Stack, LinearProgress, Menu, ListItemIcon, ListItemText,
  List, ListItem, ListItemButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  PlayCircle as VideoIcon,
  Slideshow as SlidesIcon,
  Link as LinkIcon,
  Description as DocIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudDownload as DownloadIcon,
  RemoveRedEye as EyeIcon,
  Chat as ChatIcon,
  Favorite as FavIcon,
  CheckCircle as PublishedIcon,
  PauseCircle as UnpublishedIcon,
} from '@mui/icons-material';
import { MaterialAcademico, MaterialFiltros, Paginacion } from '@/types/materialTypes';
import { useTiposMaterial } from '@/hooks/useMaterial';

// ─── Utilidades ───────────────────────────────────────────

const getFileIcon = (mime?: string | null, esEnlace?: boolean) => {
  if (esEnlace) return <LinkIcon />;
  if (!mime) return <DocIcon />;
  if (mime.includes('pdf'))   return <PdfIcon />;
  if (mime.includes('video')) return <VideoIcon />;
  if (mime.includes('presentation') || mime.includes('powerpoint')) return <SlidesIcon />;
  return <DocIcon />;
};

const formatBytes = (bytes?: number | null): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Props ────────────────────────────────────────────────

interface MaterialesGridProps {
  materiales: MaterialAcademico[];
  isLoading: boolean;
  paginacion: Paginacion;
  filters: MaterialFiltros;
  viewMode: 'grid' | 'list';
  onFiltrosChange: (f: Partial<MaterialFiltros>) => void;
  onView: (m: MaterialAcademico) => void;
  onEdit: (m: MaterialAcademico) => void;
  onDelete: (m: MaterialAcademico) => void;
}

// ─── Card individual ──────────────────────────────────────

const MaterialCard: React.FC<{
  material: MaterialAcademico;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ material, onView, onEdit, onDelete }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPublished =
    material.fecha_publicacion &&
    new Date(material.fecha_publicacion) <= new Date() &&
    (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date());

  const iconColor = material.tipo_material_color || accent;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px ${alpha(accent, 0.18)}`,
          borderColor: alpha(accent, 0.3),
        },
      }}
    >
      {/* Cabecera de color */}
      <Box
        sx={{
          height: 6,
          background: `linear-gradient(90deg, ${iconColor}, ${alpha(iconColor, 0.4)})`,
          borderRadius: '16px 16px 0 0',
        }}
      />

      <CardContent sx={{ pb: 1 }} onClick={onView}>
        {/* Icono + tipo */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: alpha(iconColor, 0.12),
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
            }}
          >
            {material.tipo_material_icono
              ? <span>{material.tipo_material_icono}</span>
              : getFileIcon(material.tipo_mime, material.es_enlace_externo)}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
            {material.es_destacado && (
              <Tooltip title="Destacado">
                <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
              </Tooltip>
            )}
            <Chip
              size="small"
              label={isPublished ? 'Publicado' : 'Borrador'}
              icon={isPublished ? <PublishedIcon sx={{ fontSize: '12px !important' }} /> : <UnpublishedIcon sx={{ fontSize: '12px !important' }} />}
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: isPublished ? alpha('#16a34a', 0.12) : alpha('#6b7280', 0.12),
                color: isPublished ? '#16a34a' : '#6b7280',
              }}
            />
          </Box>
        </Box>

        {/* Código + título */}
        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, letterSpacing: 1 }}>
          {material.codigo_material}
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            mb: 1,
          }}
        >
          {material.titulo}
        </Typography>

        {/* Materia + tipo */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Chip
            label={material.materia_nombre || material.tipo_material_nombre}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(accent, 0.1),
              color: accent,
              fontWeight: 600,
            }}
          />
          {material.tamano_bytes && (
            <Chip
              label={formatBytes(material.tamano_bytes)}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </Stack>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <EyeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{material.total_vistas ?? 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <DownloadIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{material.total_descargas ?? 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <ChatIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{material.total_comentarios ?? 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <FavIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">{material.total_favoritos ?? 0}</Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
          {material.docente_nombres} {material.docente_apellidos}
        </Typography>
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </CardActions>

      {/* Menu de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '12px', minWidth: 160 } }}
      >
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAnchorEl(null); onView(); }} sx={{ borderRadius: '8px', mx: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}><VisibilityIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ver" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAnchorEl(null); onEdit(); }} sx={{ borderRadius: '8px', mx: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Editar" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { setAnchorEl(null); onDelete(); }}
            sx={{ borderRadius: '8px', mx: 0.5, color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>
      </Menu>
    </Card>
  );
};

// ─── Grid/Lista de materiales ─────────────────────────────

export const MaterialesGrid: React.FC<MaterialesGridProps> = ({
  materiales, isLoading, paginacion, filters, viewMode,
  onFiltrosChange, onView, onEdit, onDelete,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const { tipos } = useTiposMaterial();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Trigger búsqueda fulltext en el parent si se desea,
      // o aplicar filtro local
    }
  };

  const skeletons = Array.from({ length: 6 });

  return (
    <Box>
      {/* ── Filtros ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar material…"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />

        <TextField
          select
          size="small"
          label="Tipo"
          value={filters.tipo_material_id ?? ''}
          onChange={e =>
            onFiltrosChange({ tipo_material_id: e.target.value ? Number(e.target.value) : undefined })
          }
          sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        >
          <MenuItem value="">Todos los tipos</MenuItem>
          {tipos.map(t => (
            <MenuItem key={t.id} value={t.id}>
              {t.icono} {t.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Estado"
          value={filters.solo_publicados ? 'publicados' : filters.visible_para_estudiantes === false ? 'ocultos' : ''}
          onChange={e => {
            const v = e.target.value;
            onFiltrosChange({
              solo_publicados: v === 'publicados',
              visible_para_estudiantes: v === 'ocultos' ? false : undefined,
            });
          }}
          sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="publicados">Publicados</MenuItem>
          <MenuItem value="ocultos">Solo docente</MenuItem>
        </TextField>
      </Box>

      {/* ── Contenido ── */}
      {isLoading ? (
        <Grid container spacing={2}>
          {skeletons.map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : materiales.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            borderRadius: '20px',
            border: `2px dashed ${alpha(accent, 0.3)}`,
          }}
        >
          <DocIcon sx={{ fontSize: 64, color: alpha(accent, 0.4), mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay materiales aún
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Sube el primer material para compartirlo con tus estudiantes.
          </Typography>
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {materiales.map(m => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={m.id}>
              <MaterialCard
                material={m}
                onView={() => onView(m)}
                onEdit={() => onEdit(m)}
                onDelete={() => onDelete(m)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        // Vista lista
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {materiales.map(m => (
            <Card
              key={m.id}
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: `0 4px 16px ${alpha(accent, 0.15)}`,
                  borderColor: alpha(accent, 0.3),
                },
              }}
              onClick={() => onView(m)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Box
                  sx={{
                    width: 40, height: 40,
                    borderRadius: '10px',
                    bgcolor: alpha(m.tipo_material_color || accent, 0.12),
                    color: m.tipo_material_color || accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {m.tipo_material_icono
                    ? <span style={{ fontSize: '1.1rem' }}>{m.tipo_material_icono}</span>
                    : getFileIcon(m.tipo_mime, m.es_enlace_externo)}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>{m.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {m.materia_nombre} · {m.docente_nombres} {m.docente_apellidos}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                  <Chip
                    label={m.tipo_material_nombre}
                    size="small"
                    sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(accent, 0.1), color: accent, fontWeight: 600 }}
                  />
                  <Typography variant="caption" color="text.disabled">{formatBytes(m.tamano_bytes)}</Typography>
                  <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(m); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); onDelete(m); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* ── Paginación ── */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={paginacion.totalPages}
            page={paginacion.page}
            onChange={(_, p) => onFiltrosChange({ page: p })}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': { borderRadius: '10px' },
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

export default MaterialesGrid;