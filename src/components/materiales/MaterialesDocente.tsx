'use client';
// components/docente/materiales/MaterialesDocente.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Grid, Typography, Chip, IconButton, Button, TextField,
  MenuItem, alpha, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, Skeleton, Pagination, Stack,
  Menu, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Switch, FormControlLabel, CircularProgress, Autocomplete, Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  CheckCircle as PublishedIcon,
  PauseCircle as DraftIcon,
  RemoveRedEye as EyeIcon,
  CloudDownload as DownloadIcon,
  Chat as ChatIcon,
  Publish as PublishIcon,
  Star as StarIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Article as ArticleIcon,
  CalendarToday as CalIcon,
} from '@mui/icons-material';
import { AsignacionDocente } from '@/services/asistenciaService';
import { useMateriales, useTiposMaterial, useTemario } from '@/hooks/useMaterial';
import { MaterialAcademico, CrearMaterialDTO, MaterialFiltros } from '@/types/materialTypes';
import { useRouter } from 'next/navigation';

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date?: string | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface MaterialesDocenteProps {
  asignacion: AsignacionDocente;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

export const MaterialesDocente: React.FC<MaterialesDocenteProps> = ({
  asignacion, accent, accentDark, isDark,
}) => {
  const router = useRouter();
  const [vistaGrid, setVistaGrid] = useState(true);
  const [busqueda, setBusqueda]   = useState('');

  const {
    materiales, paginacion, isLoading, isSubmitting,
    filters, actualizarFiltros, crear, eliminar, publicar,
  } = useMateriales({
    asignacion_docente_id: asignacion.asignacion_id,
    limit: 12,
  });

  const { tipos }   = useTiposMaterial();
  const { temario } = useTemario(asignacion.grado_materia_id ?? null);

  const [dlgSubir, setDlgSubir]       = useState(false);
  const [dlgEliminar, setDlgEliminar] = useState(false);
  const [materialAEliminar, setMaterialAEliminar] = useState<MaterialAcademico | null>(null);
  const [esEnlace, setEsEnlace]       = useState(false);
  const [archivo, setArchivo]         = useState<File | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const [form, setForm] = useState<Partial<CrearMaterialDTO>>({
    visible_para_estudiantes: true,
    es_destacado: false,
    requiere_descarga: false,
    temas: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setArchivo(f);
  }, []);

  const handleSubmitMaterial = async () => {
    if (!form.tipo_material_id || !form.titulo) return;
    const ok = await crear({
      asignacion_docente_id:    asignacion.asignacion_id,
      tipo_material_id:         form.tipo_material_id!,
      titulo:                   form.titulo!,
      descripcion:              form.descripcion,
      es_enlace_externo:        esEnlace,
      url_externa:              esEnlace ? form.url_externa : undefined,
      visible_para_estudiantes: form.visible_para_estudiantes ?? true,
      fecha_publicacion:        form.fecha_publicacion,
      es_destacado:             form.es_destacado ?? false,
      requiere_descarga:        form.requiere_descarga ?? false,
      temas:                    form.temas ?? [],
      archivo:                  archivo ?? undefined,
    });
    if (ok) {
      setDlgSubir(false);
      setForm({ visible_para_estudiantes: true, es_destacado: false, requiere_descarga: false, temas: [] });
      setArchivo(null);
      setEsEnlace(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!materialAEliminar) return;
    await eliminar(materialAEliminar.id);
    setDlgEliminar(false);
    setMaterialAEliminar(null);
  };

  const canSubmit = form.tipo_material_id && form.titulo && (esEnlace ? !!form.url_externa : !!archivo);

  // Stats
  const totalPublicados = materiales.filter(m =>
    !!m.fecha_publicacion && new Date(m.fecha_publicacion) <= new Date() &&
    (!m.fecha_despublicacion || new Date(m.fecha_despublicacion) > new Date())
  ).length;
  const totalBorradores  = materiales.length - totalPublicados;
  const totalVistas      = materiales.reduce((s, m) => s + (m.total_vistas ?? 0), 0);

  // Filtro local por búsqueda
  const materialesFiltrados = materiales.filter(m =>
    !busqueda || m.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box>

      {/* ── Stats rápidas ── */}
      {!isLoading && (
        <Box sx={{
          display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total',       value: paginacion.total,  color: accent },
            { label: 'Publicados',  value: totalPublicados,   color: '#16a34a' },
            { label: 'Borradores',  value: totalBorradores,   color: '#6b7280' },
            { label: 'Vistas',      value: totalVistas,       color: '#f59e0b' },
          ].map(stat => (
            <Box key={stat.label} sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1, borderRadius: '8px',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
              border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
            }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Barra de acciones ── */}
      <Box sx={{
        display: 'flex', gap: 1.5, mb: 3,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Búsqueda */}
        <TextField
          size="small"
          placeholder="Buscar material..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 200, flex: 1, maxWidth: 300,
            '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' },
          }}
        />

        <TextField
          select size="small" label="Tipo"
          value={filters.tipo_material_id ?? ''}
          onChange={e => actualizarFiltros({ tipo_material_id: e.target.value ? Number(e.target.value) : undefined })}
          sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
        >
          <MenuItem value="">Todos</MenuItem>
          {tipos.map(t => <MenuItem key={t.id} value={t.id}>{t.icono} {t.nombre}</MenuItem>)}
        </TextField>

        <TextField
          select size="small" label="Estado"
          value={filters.solo_publicados ? 'pub' : ''}
          onChange={e => actualizarFiltros({ solo_publicados: e.target.value === 'pub' })}
          sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pub">Publicados</MenuItem>
        </TextField>

        <Box sx={{ flex: 1 }} />

        {/* Toggle vista */}
        <Box sx={{
          display: 'flex', gap: 0.25, p: 0.4,
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
          borderRadius: '8px',
        }}>
          <IconButton size="small" onClick={() => setVistaGrid(true)}
            sx={{
              borderRadius: '6px', p: 0.6,
              bgcolor: vistaGrid ? accent : 'transparent',
              color: vistaGrid ? (isDark ? '#000' : '#fff') : 'text.disabled',
              '&:hover': { bgcolor: vistaGrid ? accent : alpha(accent, 0.1) },
            }}>
            <GridViewIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={() => setVistaGrid(false)}
            sx={{
              borderRadius: '6px', p: 0.6,
              bgcolor: !vistaGrid ? accent : 'transparent',
              color: !vistaGrid ? (isDark ? '#000' : '#fff') : 'text.disabled',
              '&:hover': { bgcolor: !vistaGrid ? accent : alpha(accent, 0.1) },
            }}>
            <ListViewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => setDlgSubir(true)}
          sx={{
            borderRadius: '8px', textTransform: 'none', fontWeight: 600,
            fontSize: '0.82rem', px: 2.5, py: 0.9,
            background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
            color: isDark ? '#000' : '#fff', boxShadow: 'none',
            '&:hover': { boxShadow: `0 4px 16px ${alpha(accent, 0.3)}`, transform: 'translateY(-1px)' },
            transition: 'all 0.18s ease',
          }}
        >
          Subir material
        </Button>
      </Box>

      {/* ── Contenido ── */}
      {isLoading ? (
        <Grid container spacing={2}>
          {[1,2,3,4,5,6].map(i => (
            <Grid size={{ xs: 12, sm: vistaGrid ? 6 : 12, md: vistaGrid ? 4 : 12 }} key={i}>
              <Skeleton variant="rounded" height={vistaGrid ? 200 : 72} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      ) : materialesFiltrados.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 12, borderRadius: '12px',
          border: `1px dashed ${alpha(accent, 0.2)}`,
        }}>
          <ArticleIcon sx={{ fontSize: 40, color: alpha(accent, 0.3), mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
            {busqueda ? 'Sin resultados' : 'Sin materiales todavía'}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            {busqueda ? `No se encontró "${busqueda}"` : 'Sube el primer recurso para esta materia.'}
          </Typography>
          {!busqueda && (
            <Button variant="outlined" size="small" startIcon={<AddIcon />}
              onClick={() => setDlgSubir(true)}
              sx={{
                borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                borderColor: alpha(accent, 0.4), color: accent,
                '&:hover': { bgcolor: alpha(accent, 0.06), borderColor: accent },
              }}>
              Subir material
            </Button>
          )}
        </Box>
      ) : vistaGrid ? (
        // ── Vista Grid ──
        <Grid container spacing={2}>
          {materialesFiltrados.map(m => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.id}>
              <MaterialCardGrid
                material={m} accent={accent} accentDark={accentDark} isDark={isDark}
                onVer={() => router.push(`/dashboard/docente/materiales/detalle/${m.id}`)}
                onPublicar={() => publicar(m.id)}
                onEliminar={() => { setMaterialAEliminar(m); setDlgEliminar(true); }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        // ── Vista Lista ──
        <Stack spacing={1}>
          {materialesFiltrados.map(m => (
            <MaterialRowList
              key={m.id} material={m} accent={accent} accentDark={accentDark} isDark={isDark}
              onVer={() => router.push(`/dashboard/docente/materiales/detalle/${m.id}`)}
              onPublicar={() => publicar(m.id)}
              onEliminar={() => { setMaterialAEliminar(m); setDlgEliminar(true); }}
            />
          ))}
        </Stack>
      )}

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Pagination
            count={paginacion.totalPages} page={paginacion.page}
            onChange={(_, p) => actualizarFiltros({ page: p })}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': { borderRadius: '6px', fontSize: '0.82rem' },
              '& .Mui-selected': { bgcolor: `${accent} !important`, color: isDark ? '#000' : '#fff', fontWeight: 700 },
            }}
          />
        </Box>
      )}

      {/* ════ Dialog: Subir Material ════ */}
      <Dialog open={dlgSubir} onClose={() => setDlgSubir(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5, fontSize: '1rem' }}>
          Subir material
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 400, mt: 0.25 }}>
            {asignacion.materia_nombre} · {asignacion.grado_nombre} {asignacion.paralelo_nombre}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField select label="Tipo de material *" fullWidth size="small"
            value={form.tipo_material_id ?? ''}
            onChange={e => setForm(p => ({ ...p, tipo_material_id: Number(e.target.value) }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
            {tipos.map(t => (
              <MenuItem key={t.id} value={t.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <span style={{ fontSize: '1rem' }}>{t.icono}</span>{t.nombre}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Título *" fullWidth size="small"
            value={form.titulo ?? ''}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
          <TextField label="Descripción" fullWidth size="small" multiline rows={2}
            value={form.descripcion ?? ''}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['Archivo', 'Enlace externo'] as const).map((label, idx) => (
              <Box key={label} onClick={() => setEsEnlace(idx === 1)}
                sx={{
                  flex: 1, p: 1.25, borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  border: `1.5px solid ${(idx === 1) === esEnlace ? accent : alpha(isDark ? '#fff' : '#000', 0.1)}`,
                  bgcolor: (idx === 1) === esEnlace ? alpha(accent, 0.06) : 'transparent',
                  transition: 'all 0.15s',
                }}>
                <Typography variant="body2" fontWeight={600}
                  sx={{ color: (idx === 1) === esEnlace ? accent : 'text.secondary', fontSize: '0.8rem' }}>
                  {idx === 0 ? '📁' : '🔗'} {label}
                </Typography>
              </Box>
            ))}
          </Box>
          {!esEnlace ? (
            <Box
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              sx={{
                border: `1.5px dashed ${dragOver ? accent : alpha(isDark ? '#fff' : '#000', 0.15)}`,
                borderRadius: '10px', p: 3, textAlign: 'center', cursor: 'pointer',
                bgcolor: dragOver ? alpha(accent, 0.04) : 'transparent',
                transition: 'all 0.15s',
                '&:hover': { borderColor: alpha(accent, 0.5), bgcolor: alpha(accent, 0.03) },
              }}>
              <input ref={inputRef} type="file" hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) setArchivo(f); }}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.jpg,.jpeg,.png" />
              {archivo ? (
                <Box>
                  <Typography variant="body2" fontWeight={700} noWrap>{archivo.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(archivo.size)} · Clic para cambiar
                  </Typography>
                </Box>
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 28, color: alpha(accent, 0.4), mb: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Arrastra o haz clic · máx. 50 MB
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <TextField label="URL *" placeholder="https://..." fullWidth size="small"
              value={form.url_externa ?? ''}
              onChange={e => setForm(p => ({ ...p, url_externa: e.target.value }))}
              InputProps={{ startAdornment: <LinkIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.disabled' }} /> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
          )}
          <Divider />
          <Autocomplete multiple options={temario}
            getOptionLabel={t => `${t.unidad_numero}.${t.tema_numero} ${t.tema_titulo}`}
            isOptionEqualToValue={(opt, val) => opt.tema_id === val.tema_id}
            value={temario.filter(t => (form.temas ?? []).some(ft => ft.tema_id === t.tema_id))}
            onChange={(_, sel) => setForm(p => ({
              ...p,
              temas: sel.map((t, i) => ({ tema_id: t.tema_id, es_principal: i === 0, orden: i + 1 })),
            }))}
            renderTags={(val, getTagProps) =>
              val.map((t, idx) => (
                <Chip {...getTagProps({ index: idx })} key={t.tema_id}
                  label={`${t.unidad_numero}.${t.tema_numero} ${t.tema_titulo}`}
                  size="small"
                  sx={{ bgcolor: alpha(accent, 0.1), color: accent, fontWeight: 600, fontSize: '0.65rem', borderRadius: '4px' }} />
              ))
            }
            renderInput={params => (
              <TextField {...params}
                label={temario.length === 0 ? 'No hay temas creados aún' : 'Vincular a temas (opcional)'}
                size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            )}
            noOptionsText="No hay temas para esta materia" />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <FormControlLabel
              control={<Switch checked={form.visible_para_estudiantes ?? true} size="small"
                onChange={e => setForm(p => ({ ...p, visible_para_estudiantes: e.target.checked }))} />}
              label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Visible para estudiantes</Typography>} />
            <FormControlLabel
              control={<Switch checked={form.es_destacado ?? false} size="small"
                onChange={e => setForm(p => ({ ...p, es_destacado: e.target.checked }))} />}
              label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Destacado</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDlgSubir(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitMaterial} variant="contained"
            disabled={isSubmitting || !canSubmit}
            endIcon={isSubmitting ? <CircularProgress size={13} color="inherit" /> : undefined}
            sx={{
              borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              color: isDark ? '#000' : '#fff', boxShadow: 'none',
            }}>
            {isSubmitting ? 'Subiendo…' : 'Subir material'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Dialog: Confirmar eliminar ════ */}
      <Dialog open={dlgEliminar} onClose={() => setDlgEliminar(false)}
        PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Eliminar material?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.85rem' }}>
            Se eliminará <strong>"{materialAEliminar?.titulo}"</strong> y su archivo de forma permanente.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDlgEliminar(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
            Cancelar
          </Button>
          <Button onClick={confirmarEliminar} variant="contained" color="error" disabled={isSubmitting}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', boxShadow: 'none' }}>
            {isSubmitting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Card Grid ─────────────────────────────────────────────────────────────────
const MaterialCardGrid: React.FC<{
  material: MaterialAcademico; accent: string; accentDark: string; isDark: boolean;
  onVer: () => void; onPublicar: () => void; onEliminar: () => void;
}> = ({ material, accent, accentDark, isDark, onVer, onPublicar, onEliminar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPublished =
    !!material.fecha_publicacion &&
    new Date(material.fecha_publicacion) <= new Date() &&
    (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date());

  const iconColor = material.tipo_material_color || accent;

  return (
    <Box onClick={onVer} sx={{
      position: 'relative', borderRadius: '14px', overflow: 'hidden',
      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      cursor: 'pointer', transition: 'all 0.18s ease',
      '&:hover': {
        borderColor: alpha(accent, 0.4),
        boxShadow: `0 8px 28px ${alpha(accent, 0.12)}`,
        transform: 'translateY(-3px)',
      },
    }}>
      {/* Barra superior */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${iconColor}, ${alpha(iconColor, 0.2)})` }} />

      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '10px',
            bgcolor: alpha(iconColor, 0.12), color: iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', border: `1px solid ${alpha(iconColor, 0.2)}`,
          }}>
            {material.tipo_material_icono || '📄'}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {material.es_destacado && <StarIcon sx={{ color: '#f59e0b', fontSize: 14 }} />}
            <Chip size="small"
              label={isPublished ? 'Publicado' : 'Borrador'}
              icon={isPublished
                ? <PublishedIcon sx={{ fontSize: '10px !important', color: '#16a34a !important' }} />
                : <DraftIcon sx={{ fontSize: '10px !important' }} />}
              sx={{
                height: 18, fontSize: '0.6rem', fontWeight: 600, borderRadius: '4px',
                bgcolor: isPublished ? alpha('#16a34a', 0.08) : alpha('#6b7280', 0.08),
                color: isPublished ? '#16a34a' : '#6b7280',
              }} />
            <IconButton size="small"
              onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
              sx={{ p: 0.3, ml: 0.25 }}>
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Código */}
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.disabled', mb: 0.4 }}>
          {material.codigo_material}
        </Typography>

        {/* Título */}
        <Typography variant="body2" fontWeight={700} sx={{
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: 1.4, mb: 1, fontSize: '0.875rem',
        }}>
          {material.titulo}
        </Typography>

        {/* Descripción */}
        {material.descripcion && (
          <Typography variant="caption" color="text.secondary" sx={{
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            lineHeight: 1.5, mb: 1.5, fontSize: '0.72rem',
          }}>
            {material.descripcion}
          </Typography>
        )}

        {/* Fecha */}
        {material.fecha_publicacion && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <CalIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              {formatDate(material.fecha_publicacion)}
            </Typography>
          </Box>
        )}

        {/* Stats */}
        <Box sx={{
          display: 'flex', gap: 2, pt: 1.5,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
        }}>
          {[
            { icon: <EyeIcon sx={{ fontSize: 12 }} />,      val: material.total_vistas ?? 0 },
            { icon: <DownloadIcon sx={{ fontSize: 12 }} />, val: material.total_descargas ?? 0 },
            { icon: <ChatIcon sx={{ fontSize: 12 }} />,     val: material.total_comentarios ?? 0 },
          ].map(({ icon, val }, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Box sx={{ color: 'text.disabled' }}>{icon}</Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{val}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        onClick={e => e.stopPropagation()}
        PaperProps={{ sx: { borderRadius: '10px', minWidth: 160, border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}` } }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAnchorEl(null); onVer(); }} sx={{ borderRadius: '6px', mx: 0.5, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 28 }}><VisibilityIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primary="Ver detalle" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
        </ListItem>
        {!isPublished && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setAnchorEl(null); onPublicar(); }} sx={{ borderRadius: '6px', mx: 0.5, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 28 }}><PublishIcon sx={{ fontSize: 16, color: '#16a34a' }} /></ListItemIcon>
              <ListItemText primary="Publicar ahora" primaryTypographyProps={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAnchorEl(null); onEliminar(); }}
            sx={{ borderRadius: '6px', mx: 0.5, py: 0.75, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}><DeleteIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
        </ListItem>
      </Menu>
    </Box>
  );
};

// ── Row Lista ─────────────────────────────────────────────────────────────────
const MaterialRowList: React.FC<{
  material: MaterialAcademico; accent: string; accentDark: string; isDark: boolean;
  onVer: () => void; onPublicar: () => void; onEliminar: () => void;
}> = ({ material, accent, accentDark, isDark, onVer, onPublicar, onEliminar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPublished =
    !!material.fecha_publicacion &&
    new Date(material.fecha_publicacion) <= new Date() &&
    (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date());

  const iconColor = material.tipo_material_color || accent;

  return (
    <Box onClick={onVer} sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      p: 1.5, borderRadius: '12px', cursor: 'pointer',
      border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: alpha(accent, 0.35),
        bgcolor: alpha(accent, isDark ? 0.04 : 0.02),
        boxShadow: `0 4px 16px ${alpha(accent, 0.08)}`,
      },
    }}>
      {/* Icono */}
      <Box sx={{
        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
        bgcolor: alpha(iconColor, 0.1), color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', border: `1px solid ${alpha(iconColor, 0.15)}`,
      }}>
        {material.tipo_material_icono || '📄'}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.875rem' }}>
            {material.titulo}
          </Typography>
          {material.es_destacado && <StarIcon sx={{ color: '#f59e0b', fontSize: 13, flexShrink: 0 }} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
            {material.codigo_material}
          </Typography>
          {material.fecha_publicacion && (
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              · {formatDate(material.fecha_publicacion)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {[
          { icon: <EyeIcon sx={{ fontSize: 12 }} />,      val: material.total_vistas ?? 0 },
          { icon: <DownloadIcon sx={{ fontSize: 12 }} />, val: material.total_descargas ?? 0 },
          { icon: <ChatIcon sx={{ fontSize: 12 }} />,     val: material.total_comentarios ?? 0 },
        ].map(({ icon, val }, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ color: 'text.disabled' }}>{icon}</Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>{val}</Typography>
          </Box>
        ))}
      </Box>

      {/* Estado + menú */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Chip size="small"
          label={isPublished ? 'Publicado' : 'Borrador'}
          sx={{
            height: 18, fontSize: '0.6rem', fontWeight: 600, borderRadius: '4px',
            bgcolor: isPublished ? alpha('#16a34a', 0.08) : alpha('#6b7280', 0.08),
            color: isPublished ? '#16a34a' : '#6b7280',
          }} />
        <IconButton size="small"
          onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
          sx={{ p: 0.3 }}>
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Menú */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        onClick={e => e.stopPropagation()}
        PaperProps={{ sx: { borderRadius: '10px', minWidth: 160 } }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAnchorEl(null); onVer(); }} sx={{ borderRadius: '6px', mx: 0.5, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 28 }}><VisibilityIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primary="Ver detalle" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
        </ListItem>
        {!isPublished && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setAnchorEl(null); onPublicar(); }} sx={{ borderRadius: '6px', mx: 0.5, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 28 }}><PublishIcon sx={{ fontSize: 16, color: '#16a34a' }} /></ListItemIcon>
              <ListItemText primary="Publicar ahora" primaryTypographyProps={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAnchorEl(null); onEliminar(); }}
            sx={{ borderRadius: '6px', mx: 0.5, py: 0.75, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}><DeleteIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
        </ListItem>
      </Menu>
    </Box>
  );
};

export default MaterialesDocente;