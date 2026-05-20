'use client';
// components/docente/materiales/MaterialesDocente.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Grid, Typography, Chip, IconButton, Button, TextField,
  MenuItem, alpha, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, Skeleton, Pagination, Stack,
  Menu, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Switch, FormControlLabel, CircularProgress, Autocomplete, Divider,
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

  const [esEnlace, setEsEnlace] = useState(false);
  const [archivo, setArchivo]   = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
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

  return (
    <Box>
      {/* ── Barra de acciones ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mb: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
          pb: 2.5,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        }}
      >
        <TextField
          select size="small" label="Tipo"
          value={filters.tipo_material_id ?? ''}
          onChange={e => actualizarFiltros({ tipo_material_id: e.target.value ? Number(e.target.value) : undefined })}
          sx={{
            minWidth: 140,
            '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {tipos.map(t => <MenuItem key={t.id} value={t.id}>{t.icono} {t.nombre}</MenuItem>)}
        </TextField>

        <TextField
          select size="small" label="Estado"
          value={filters.solo_publicados ? 'pub' : ''}
          onChange={e => actualizarFiltros({ solo_publicados: e.target.value === 'pub' })}
          sx={{
            minWidth: 130,
            '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pub">Publicados</MenuItem>
        </TextField>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => setDlgSubir(true)}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.82rem',
            px: 2.5,
            py: 0.9,
            background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
            color: isDark ? '#000' : '#fff',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 16px ${alpha(accent, 0.3)}`,
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.18s ease',
          }}
        >
          Subir material
        </Button>
      </Box>

      {/* ── Grid de materiales ── */}
      {isLoading ? (
        <Grid container spacing={2}>
          {[1,2,3,4,5,6].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={180} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      ) : materiales.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 12,
            borderRadius: '12px',
            border: `1px dashed ${alpha(accent, 0.2)}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 300, color: 'text.secondary', mb: 0.5 }}>
            Sin materiales todavía
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Sube el primer recurso para esta materia.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setDlgSubir(true)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha(accent, 0.4),
              color: accent,
              '&:hover': { bgcolor: alpha(accent, 0.06), borderColor: accent },
            }}
          >
            Subir material
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {materiales.map(m => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.id}>
              <MaterialCard
                material={m}
                accent={accent}
                accentDark={accentDark}
                isDark={isDark}
                onVer={() => router.push(`/dashboard/docente/materiales/${m.id}`)}
                onPublicar={() => publicar(m.id)}
                onEliminar={() => { setMaterialAEliminar(m); setDlgEliminar(true); }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Pagination
            count={paginacion.totalPages}
            page={paginacion.page}
            onChange={(_, p) => actualizarFiltros({ page: p })}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': { borderRadius: '6px', fontSize: '0.82rem' },
              '& .Mui-selected': {
                bgcolor: `${accent} !important`,
                color: isDark ? '#000' : '#fff',
                fontWeight: 700,
              },
            }}
          />
        </Box>
      )}

      {/* ════ Dialog: Subir Material ════════════════════════ */}
      <Dialog
        open={dlgSubir}
        onClose={() => setDlgSubir(false)}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
            boxShadow: isDark
              ? '0 24px 64px rgba(0,0,0,0.6)'
              : '0 24px 64px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5, fontSize: '1rem' }}>
          Subir material
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 400, mt: 0.25 }}>
            {asignacion.materia_nombre} · {asignacion.grado_nombre} {asignacion.paralelo_nombre}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField
            select label="Tipo de material *" fullWidth size="small"
            value={form.tipo_material_id ?? ''}
            onChange={e => setForm(p => ({ ...p, tipo_material_id: Number(e.target.value) }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          >
            {tipos.map(t => (
              <MenuItem key={t.id} value={t.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <span style={{ fontSize: '1rem' }}>{t.icono}</span>{t.nombre}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Título *" fullWidth size="small"
            value={form.titulo ?? ''}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          <TextField
            label="Descripción" fullWidth size="small" multiline rows={2}
            value={form.descripcion ?? ''}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          {/* Toggle archivo / enlace */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['Archivo', 'Enlace externo'] as const).map((label, idx) => (
              <Box
                key={label}
                onClick={() => setEsEnlace(idx === 1)}
                sx={{
                  flex: 1, p: 1.25, borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                  border: `1.5px solid ${(idx === 1) === esEnlace ? accent : alpha(isDark ? '#fff' : '#000', 0.1)}`,
                  bgcolor: (idx === 1) === esEnlace ? alpha(accent, 0.06) : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Typography variant="body2" fontWeight={600}
                  sx={{ color: (idx === 1) === esEnlace ? accent : 'text.secondary', fontSize: '0.8rem' }}>
                  {idx === 0 ? '📁' : '🔗'} {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Upload o URL */}
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
              }}
            >
              <input
                ref={inputRef} type="file" hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) setArchivo(f); }}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.jpg,.jpeg,.png"
              />
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
            <TextField
              label="URL *" placeholder="https://..." fullWidth size="small"
              value={form.url_externa ?? ''}
              onChange={e => setForm(p => ({ ...p, url_externa: e.target.value }))}
              InputProps={{ startAdornment: <LinkIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.disabled' }} /> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          )}

          <Divider />

          {/* Vincular temas */}
          <Autocomplete
            multiple
            options={temario}
            getOptionLabel={t => `${t.unidad_numero ?? t.numero_unidad}.${t.tema_numero ?? t.numero_tema} ${t.tema_titulo}`}
            isOptionEqualToValue={(opt, val) => opt.tema_id === val.tema_id}
            value={temario.filter(t => (form.temas ?? []).some(ft => ft.tema_id === t.tema_id))}
            onChange={(_, sel) =>
              setForm(p => ({
                ...p,
                temas: sel.map((t, i) => ({ tema_id: t.tema_id, es_principal: i === 0, orden: i + 1 })),
              }))
            }
            renderTags={(val, getTagProps) =>
              val.map((t, idx) => (
                <Chip
                  {...getTagProps({ index: idx })}
                  key={t.tema_id}
                  label={`${t.unidad_numero ?? t.numero_unidad}.${t.tema_numero ?? t.numero_tema} ${t.tema_titulo}`}
                  size="small"
                  sx={{ bgcolor: alpha(accent, 0.1), color: accent, fontWeight: 600, fontSize: '0.65rem', borderRadius: '4px' }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label={temario.length === 0 ? 'No hay temas creados aún' : 'Vincular a temas (opcional)'}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            noOptionsText="No hay temas para esta materia"
          />

          {/* Switches */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.visible_para_estudiantes ?? true}
                  onChange={e => setForm(p => ({ ...p, visible_para_estudiantes: e.target.checked }))}
                  size="small"
                />
              }
              label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Visible para estudiantes</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.es_destacado ?? false}
                  onChange={e => setForm(p => ({ ...p, es_destacado: e.target.checked }))}
                  size="small"
                />
              }
              label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Destacado</Typography>}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDlgSubir(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitMaterial} variant="contained"
            disabled={isSubmitting || !canSubmit}
            endIcon={isSubmitting ? <CircularProgress size={13} color="inherit" /> : undefined}
            sx={{
              borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: 'none',
            }}
          >
            {isSubmitting ? 'Subiendo…' : 'Subir material'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Dialog: Confirmar eliminar ════════════════════ */}
      <Dialog
        open={dlgEliminar}
        onClose={() => setDlgEliminar(false)}
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>¿Eliminar material?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.85rem' }}>
            Se eliminará <strong>"{materialAEliminar?.titulo}"</strong> y su archivo de forma permanente.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDlgEliminar(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminar} variant="contained" color="error"
            disabled={isSubmitting}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', boxShadow: 'none' }}
          >
            {isSubmitting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Card individual de material ───────────────────────────────────────────────

const MaterialCard: React.FC<{
  material:   MaterialAcademico;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
  onVer:      () => void;
  onPublicar: () => void;
  onEliminar: () => void;
}> = ({ material, accent, accentDark, isDark, onVer, onPublicar, onEliminar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPublished =
    !!material.fecha_publicacion &&
    new Date(material.fecha_publicacion) <= new Date() &&
    (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date());

  const iconColor = material.tipo_material_color || accent;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '12px',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        '&:hover': {
          borderColor: alpha(accent, 0.35),
          boxShadow: `0 8px 24px ${alpha(accent, 0.1)}`,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onVer}
    >
      {/* Barra superior fina de color */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${iconColor}, ${alpha(iconColor, 0.3)})`,
        }}
      />

      <Box sx={{ p: 2 }}>
        {/* Header: icono + estado + menú */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: alpha(iconColor, 0.1),
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            {material.tipo_material_icono || '📄'}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {material.es_destacado && (
              <StarIcon sx={{ color: '#f59e0b', fontSize: 14 }} />
            )}
            <Chip
              size="small"
              label={isPublished ? 'Publicado' : 'Borrador'}
              icon={isPublished
                ? <PublishedIcon sx={{ fontSize: '10px !important', color: '#16a34a !important' }} />
                : <DraftIcon    sx={{ fontSize: '10px !important' }} />}
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 600,
                borderRadius: '4px',
                bgcolor: isPublished ? alpha('#16a34a', 0.08) : alpha('#6b7280', 0.08),
                color:   isPublished ? '#16a34a' : '#6b7280',
              }}
            />
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
              sx={{ p: 0.3, ml: 0.25 }}
            >
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Código */}
        <Typography
          sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.disabled', mb: 0.5 }}
        >
          {material.codigo_material}
        </Typography>

        {/* Título */}
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            mb: 2,
            fontSize: '0.875rem',
          }}
        >
          {material.titulo}
        </Typography>

        {/* Stats */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            pt: 1.5,
            borderTop: `1px solid ${isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
          }}
        >
          {[
            { icon: <EyeIcon sx={{ fontSize: 12 }} />,      val: material.total_vistas    ?? 0 },
            { icon: <DownloadIcon sx={{ fontSize: 12 }} />, val: material.total_descargas  ?? 0 },
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={e => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: '10px',
            minWidth: 160,
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
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
              <ListItemText
                primary="Publicar ahora"
                primaryTypographyProps={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { setAnchorEl(null); onEliminar(); }}
            sx={{ borderRadius: '6px', mx: 0.5, py: 0.75, color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}><DeleteIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
        </ListItem>
      </Menu>
    </Box>
  );
};

export default MaterialesDocente;