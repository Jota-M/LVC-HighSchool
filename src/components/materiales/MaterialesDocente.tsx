'use client';
// components/docente/materiales/MaterialesDocente.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Grid, Typography, Chip, IconButton, Button, TextField,
  MenuItem, alpha, Tooltip, Dialog, DialogContent,
  DialogActions, Skeleton, Pagination, Stack, Menu,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  Switch, CircularProgress, Autocomplete, InputAdornment,
  Card, CardContent, Avatar, Fade,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  CloseRounded as CloseIcon,
  MoreVertRounded as MoreVertIcon,
  VisibilityRounded as VisibilityIcon,
  DeleteForeverRounded as DeleteIcon,
  CloudUploadRounded as UploadIcon,
  LinkRounded as LinkIcon,
  CheckCircleRounded as PublishedIcon,
  PauseCircleRounded as DraftIcon,
  RemoveRedEyeRounded as EyeIcon,
  FileDownloadRounded as DownloadIcon,
  ChatBubbleOutlineRounded as ChatIcon,
  PublishRounded as PublishIcon,
  StarRounded as StarIcon,
  SearchRounded as SearchIcon,
  ClearRounded as ClearIcon,
  GridViewRounded as GridViewIcon,
  ViewListRounded as ListViewIcon,
  ArticleRounded as ArticleIcon,
  CalendarTodayRounded as CalIcon,
  InsertDriveFileRounded as FileIcon,
  WarningAmberRounded as WarningIcon,
  AutoStoriesRounded as MaterialsIcon,
  ChevronRightRounded as ChevronRightIcon,
  ForumRounded as ForumIcon,
  EditRounded as EditIcon,
} from '@mui/icons-material';
import { AsignacionDocente } from '@/services/asistenciaService';
import { useMateriales, useTiposMaterial, useTemario } from '@/hooks/useMaterial';
import { materialAcademicoService } from '@/services/materialService';
import { MaterialAcademico, CrearMaterialDTO, ActualizarMaterialDTO } from '@/types/materialTypes';
import { useRouter } from 'next/navigation';

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  const num = Number(bytes);
  if (isNaN(num)) return '';
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(0)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date?: string | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface MaterialesDocenteProps {
  asignacion: AsignacionDocente;
  accent: string;
  accentDark: string;
  isDark: boolean;
}

export const MaterialesDocente: React.FC<MaterialesDocenteProps> = ({
  asignacion, accent, accentDark, isDark,
}) => {
  const router = useRouter();
  const [vistaGrid, setVistaGrid] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const {
    materiales, paginacion, isLoading, isSubmitting,
    filters, actualizarFiltros, crear, actualizar, eliminar, publicar,
  } = useMateriales({
    asignacion_docente_id: asignacion.asignacion_id,
    limit: 12,
  });

  const { tipos } = useTiposMaterial();
  const { temario } = useTemario(asignacion.grado_materia_id ?? null);

  const [dlgSubir, setDlgSubir] = useState(false);
  const [dlgEditar, setDlgEditar] = useState(false);
  const [materialAEditar, setMaterialAEditar] = useState<MaterialAcademico | null>(null);
  const [editEsEnlace, setEditEsEnlace] = useState(false);
  const [editArchivo, setEditArchivo] = useState<File | null>(null);
  const [editDragOver, setEditDragOver] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ActualizarMaterialDTO>>({});
  const editInputRef = useRef<HTMLInputElement>(null);

  const [dlgEliminar, setDlgEliminar] = useState(false);
  const [materialAEliminar, setMaterialAEliminar] = useState<MaterialAcademico | null>(null);
  const [esEnlace, setEsEnlace] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<Partial<CrearMaterialDTO>>({
    visible_para_estudiantes: true,
    es_destacado: false,
    requiere_descarga: false,
    temas: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Tokens visuales unificados ──────────────────────────────────────────────
  const brand = accent;
  const brandDark = accentDark;
  const brandDim = isDark ? alpha(brand, 0.12) : alpha(brand, 0.08);
  const brandBorder = isDark ? alpha(brand, 0.25) : alpha(brand, 0.22);
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgCard = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.025)';
  const borderField = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      fontSize: '0.84rem',
      '& fieldset': {
        borderColor: borderField,
        borderRadius: R,
      },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': {
        borderColor: brand,
        borderWidth: '1.5px',
        borderRadius: R,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`,
        borderRadius: R,
      },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary', fontSize: '0.84rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setArchivo(f);
  }, []);

  const handleSubmitMaterial = async () => {
    if (!form.tipo_material_id || !form.titulo) return;
    const ok = await crear({
      asignacion_docente_id: asignacion.asignacion_id,
      tipo_material_id: form.tipo_material_id!,
      titulo: form.titulo!,
      descripcion: form.descripcion,
      es_enlace_externo: esEnlace,
      url_externa: esEnlace ? form.url_externa : undefined,
      visible_para_estudiantes: form.visible_para_estudiantes ?? true,
      fecha_publicacion: form.fecha_publicacion,
      es_destacado: form.es_destacado ?? false,
      requiere_descarga: form.requiere_descarga ?? false,
      temas: form.temas ?? [],
      archivo: archivo ?? undefined,
    });
    if (ok) {
      setDlgSubir(false);
      setForm({ visible_para_estudiantes: true, es_destacado: false, requiere_descarga: false, temas: [] });
      setArchivo(null);
      setEsEnlace(false);
    }
  };

  const handleAbrirEditar = async (m: MaterialAcademico) => {
    setMaterialAEditar(m);
    setEditEsEnlace(Boolean(m.es_enlace_externo));
    setEditArchivo(null);
    setEditForm({
      tipo_material_id: m.tipo_material_id,
      titulo: m.titulo,
      descripcion: m.descripcion || '',
      es_enlace_externo: m.es_enlace_externo,
      url_externa: m.url_externa || '',
      visible_para_estudiantes: m.visible_para_estudiantes,
      es_destacado: m.es_destacado,
      requiere_descarga: m.requiere_descarga,
      temas: [],
    });
    setDlgEditar(true);

    try {
      const res = await materialAcademicoService.obtenerPorId(m.id);
      if (res.data?.temas) {
        setEditForm(p => ({
          ...p,
          temas: res.data.temas.map((t: any) => ({
            tema_id: t.tema_id,
            es_principal: t.es_principal,
            orden: t.orden,
          })),
        }));
      }
    } catch (e) {
      console.error('Error al cargar temas del material:', e);
    }
  };

  const handleEditDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setEditDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setEditArchivo(f);
  }, []);

  const handleSubmitEditar = async () => {
    if (!materialAEditar || !editForm.tipo_material_id || !editForm.titulo) return;
    const ok = await actualizar(materialAEditar.id, {
      tipo_material_id: editForm.tipo_material_id,
      titulo: editForm.titulo,
      descripcion: editForm.descripcion,
      es_enlace_externo: editEsEnlace,
      url_externa: editEsEnlace ? editForm.url_externa : undefined,
      visible_para_estudiantes: editForm.visible_para_estudiantes ?? true,
      es_destacado: editForm.es_destacado ?? false,
      requiere_descarga: editForm.requiere_descarga ?? false,
      temas: editForm.temas ?? [],
      archivo: editArchivo ?? undefined,
    });
    if (ok) {
      setDlgEditar(false);
      setMaterialAEditar(null);
      setEditArchivo(null);
    }
  };

  const canSubmitEdit = !!editForm.tipo_material_id && !!editForm.titulo && (editEsEnlace ? !!editForm.url_externa : true);

  const confirmarEliminar = async () => {
    if (!materialAEliminar) return;
    await eliminar(materialAEliminar.id);
    setDlgEliminar(false);
    setMaterialAEliminar(null);
  };

  const canSubmit = form.tipo_material_id && form.titulo && (esEnlace ? !!form.url_externa : !!archivo);

  // Stats calculadas con sincronización de contadores
  const totalPublicados = materiales.filter(m =>
    m.es_publicado !== undefined
      ? Boolean(m.es_publicado)
      : (!!m.fecha_publicacion && new Date(m.fecha_publicacion) <= new Date() &&
         (!m.fecha_despublicacion || new Date(m.fecha_despublicacion) > new Date()))
  ).length;
  const totalBorradores = materiales.length - totalPublicados;
  const totalVistas = materiales.reduce((s, m) => s + Number(m.total_vistas ?? m.contador_vistas ?? 0), 0);
  const totalDescargas = materiales.reduce((s, m) => s + Number(m.total_descargas ?? m.contador_descargas ?? 0), 0);
  const totalComentarios = materiales.reduce((s, m) => s + Number(m.total_comentarios ?? 0), 0);

  // Filtro local por búsqueda
  const materialesFiltrados = materiales.filter(m => {
    const coincideTexto = !busqueda ||
      m.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.codigo_material && m.codigo_material.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideTexto;
  });

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── METRIC CARDS / STATS RÁPIDAS ── */}
      {!isLoading && (
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {[
            {
              label: 'Total materiales',
              sub: `${totalBorradores} borrador(es)`,
              value: paginacion.total,
              color: brand,
              icon: <MaterialsIcon sx={{ fontSize: 20 }} />,
            },
            {
              label: 'Publicados',
              sub: 'Disponibles para alumnos',
              value: totalPublicados,
              color: '#16a34a',
              icon: <PublishedIcon sx={{ fontSize: 20 }} />,
            },
            {
              label: 'Visualizaciones',
              sub: `${totalDescargas} descargas directas`,
              value: totalVistas,
              color: '#0288d1',
              icon: <EyeIcon sx={{ fontSize: 20 }} />,
            },
            {
              label: 'Comentarios',
              sub: 'Dudas y retroalimentación',
              value: totalComentarios,
              color: '#8b5cf6',
              icon: <ForumIcon sx={{ fontSize: 20 }} />,
            },
          ].map((stat, idx) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
              <Box sx={{
                p: 2.2,
                borderRadius: '18px',
                bgcolor: bgCard,
                border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.8,
                transition: 'all 0.22s ease',
                '&:hover': {
                  borderColor: alpha(stat.color, 0.45),
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 24px ${alpha(stat.color, 0.15)}`,
                },
              }}>
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '13px',
                  bgcolor: alpha(stat.color, 0.12),
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1.5px solid ${alpha(stat.color, 0.22)}`,
                }}>
                  {stat.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{
                    fontSize: { xs: '1.25rem', sm: '1.45rem' },
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1.1,
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'text.primary',
                    mt: 0.3,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.68rem',
                    color: 'text.secondary',
                    mt: 0.2,
                    lineHeight: 1.1,
                    display: { xs: 'none', sm: 'block' },
                  }}>
                    {stat.sub}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── BARRA DE ACCIONES Y FILTROS ── */}
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        mb: 3,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 1.5, sm: 2 },
        borderRadius: '18px',
        bgcolor: bgCard,
        border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06)}`,
      }}>
        {/* Izquierda: Buscador + Filtros */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
          flex: 1,
          minWidth: 260,
        }}>
          {/* Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar por título o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: busqueda ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setBusqueda('')} sx={{ p: 0.5 }}>
                    <ClearIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              minWidth: { xs: '100%', sm: 220 },
              maxWidth: { sm: 320 },
              flex: { xs: '1 1 100%', sm: 'none' },
              ...fieldSx,
            }}
          />

          {/* Filtro de Tipo */}
          <TextField
            select
            size="small"
            label="Tipo de recurso"
            value={filters.tipo_material_id ?? ''}
            onChange={e => actualizarFiltros({ tipo_material_id: e.target.value ? Number(e.target.value) : undefined })}
            sx={{ minWidth: 150, flex: { xs: '1 1 calc(50% - 6px)', sm: 'none' }, ...fieldSx }}
          >
            <MenuItem value="">Todos los tipos</MenuItem>
            {tipos.map(t => (
              <MenuItem key={t.id} value={t.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{t.icono}</span>
                  <span>{t.nombre}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Filtro de Estado */}
          <TextField
            select
            size="small"
            label="Estado"
            value={filters.solo_publicados ? 'pub' : ''}
            onChange={e => actualizarFiltros({ solo_publicados: e.target.value === 'pub' })}
            sx={{ minWidth: 140, flex: { xs: '1 1 calc(50% - 6px)', sm: 'none' }, ...fieldSx }}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="pub">Solo Publicados</MenuItem>
          </TextField>
        </Box>

        {/* Derecha: Segmented Switch Grid/List + Botón Subir */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          mt: { xs: 1, sm: 0 },
        }}>
          {/* Switch Grid / List */}
          <Box sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
            borderRadius: '12px',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          }}>
            <Tooltip title="Vista Cuadrícula">
              <IconButton
                size="small"
                onClick={() => setVistaGrid(true)}
                sx={{
                  borderRadius: '9px',
                  p: 0.7,
                  bgcolor: vistaGrid ? brand : 'transparent',
                  color: vistaGrid ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  boxShadow: vistaGrid ? `0 2px 8px ${alpha(brand, 0.35)}` : 'none',
                  '&:hover': { bgcolor: vistaGrid ? brand : alpha(brand, 0.1) },
                  transition: 'all 0.18s ease',
                }}
              >
                <GridViewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista Lista">
              <IconButton
                size="small"
                onClick={() => setVistaGrid(false)}
                sx={{
                  borderRadius: '9px',
                  p: 0.7,
                  bgcolor: !vistaGrid ? brand : 'transparent',
                  color: !vistaGrid ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  boxShadow: !vistaGrid ? `0 2px 8px ${alpha(brand, 0.35)}` : 'none',
                  '&:hover': { bgcolor: !vistaGrid ? brand : alpha(brand, 0.1) },
                  transition: 'all 0.18s ease',
                }}
              >
                <ListViewIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Botón Subir Material */}
          <Button
            variant="contained"
            startIcon={<UploadIcon sx={{ fontSize: 18 }} />}
            onClick={() => setDlgSubir(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              px: 2.5,
              py: 0.95,
              background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(brand, 0.35)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(brand, 0.45)}`,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.18s ease',
            }}
          >
            Subir material
          </Button>
        </Box>
      </Box>

      {/* ── CONTENIDO PRINCIPAL ── */}
      {isLoading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid size={{ xs: 12, sm: vistaGrid ? 6 : 12, md: vistaGrid ? 4 : 12 }} key={i}>
              <Skeleton
                variant="rounded"
                height={vistaGrid ? 280 : 90}
                sx={{ borderRadius: '20px' }}
              />
            </Grid>
          ))}
        </Grid>
      ) : materialesFiltrados.length === 0 ? (
        <Box sx={{
          textAlign: 'center',
          py: 10,
          px: 3,
          borderRadius: '20px',
          bgcolor: bgCard,
          border: `1.5px dashed ${alpha(brand, 0.25)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{
            width: 72,
            height: 72,
            borderRadius: '22px',
            bgcolor: alpha(brand, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: brand,
          }}>
            <ArticleIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            {busqueda ? 'No se encontraron materiales' : 'Aún no hay materiales en este curso'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440 }}>
            {busqueda
              ? `No hubo coincidencias para "${busqueda}". Prueba a limpiar el buscador o ajustar los filtros.`
              : 'Empieza subiendo documentos, presentaciones, lecturas o enlaces interactivos para tus alumnos.'}
          </Typography>
          {!busqueda ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDlgSubir(true)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                px: 3,
                py: 1,
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                color: isDark ? '#000' : '#fff',
                boxShadow: `0 4px 14px ${alpha(brand, 0.3)}`,
              }}
            >
              Subir primer material
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setBusqueda('')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: borderField,
              }}
            >
              Limpiar búsqueda
            </Button>
          )}
        </Box>
      ) : vistaGrid ? (
        // ── VISTA CUADRÍCULA (GRID) ──
        <Grid container spacing={2.5}>
          {materialesFiltrados.map(m => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.id}>
              <MaterialCardGrid
                material={m}
                accent={brand}
                accentDark={brandDark}
                isDark={isDark}
                onVer={() => router.push(`/dashboard/docente/materiales/detalle/${m.id}`)}
                onEditar={() => handleAbrirEditar(m)}
                onPublicar={() => publicar(m.id)}
                onDespublicar={() => publicar(m.id, { despublicar: true })}
                onEliminar={() => { setMaterialAEliminar(m); setDlgEliminar(true); }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        // ── VISTA LISTA ──
        <Stack spacing={1.5}>
          {materialesFiltrados.map(m => (
            <MaterialRowList
              key={m.id}
              material={m}
              accent={brand}
              accentDark={brandDark}
              isDark={isDark}
              onVer={() => router.push(`/dashboard/docente/materiales/detalle/${m.id}`)}
              onEditar={() => handleAbrirEditar(m)}
              onPublicar={() => publicar(m.id)}
              onDespublicar={() => publicar(m.id, { despublicar: true })}
              onEliminar={() => { setMaterialAEliminar(m); setDlgEliminar(true); }}
            />
          ))}
        </Stack>
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
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
              },
              '& .Mui-selected': {
                bgcolor: `${brand} !important`,
                color: isDark ? '#000' : '#fff',
                fontWeight: 800,
                boxShadow: `0 2px 10px ${alpha(brand, 0.3)}`,
              },
            }}
          />
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: SUBIR MATERIAL (ESTILO NUEVOHORARIOMODAL)
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dlgSubir}
        onClose={() => setDlgSubir(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
              : '0 20px 50px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: brandDim,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(brand, 0.35)}`,
                color: isDark ? '#000' : '#fff',
              }}>
                <UploadIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: brand,
                }}>
                  Recursos Didácticos · Subir Nuevo Material
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  Nuevo Material Educativo
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500, mt: 0.2 }}>
                  {asignacion.materia_nombre} · {asignacion.grado_nombre} "{asignacion.paralelo_nombre}"
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDlgSubir(false)}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                '&:hover': {
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  color: 'text.primary',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, p: 3 }}>
          <TextField
            select
            label="Tipo de material *"
            fullWidth
            size="small"
            value={form.tipo_material_id ?? ''}
            onChange={e => setForm(p => ({ ...p, tipo_material_id: Number(e.target.value) }))}
            sx={fieldSx}
          >
            {tipos.map(t => (
              <MenuItem key={t.id} value={t.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <span style={{ fontSize: '1.1rem' }}>{t.icono}</span>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 600 }}>{t.nombre}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Título del material *"
            placeholder="Ej: Guía Práctica de Ecuaciones de 2do Grado"
            fullWidth
            size="small"
            value={form.titulo ?? ''}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            sx={fieldSx}
          />

          <TextField
            label="Descripción o instrucciones"
            placeholder="Añade detalles, recomendaciones o puntos clave para los alumnos..."
            fullWidth
            size="small"
            multiline
            rows={2.5}
            value={form.descripcion ?? ''}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            sx={fieldSx}
          />

          <Box>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Origen del recurso
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: 'Archivo digital', icon: <FileIcon sx={{ fontSize: 18 }} />, isLink: false },
                { label: 'Enlace externo (URL)', icon: <LinkIcon sx={{ fontSize: 18 }} />, isLink: true },
              ].map(opt => {
                const isSelected = esEnlace === opt.isLink;
                return (
                  <Box
                    key={opt.label}
                    onClick={() => setEsEnlace(opt.isLink)}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? brand : borderField}`,
                      bgcolor: isSelected ? alpha(brand, 0.08) : bgField,
                      color: isSelected ? brand : 'text.secondary',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        borderColor: alpha(brand, 0.45),
                      },
                    }}
                  >
                    {opt.icon}
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {opt.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {!esEnlace ? (
            <Box
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              sx={{
                border: `1.8px dashed ${dragOver ? brand : archivo ? '#16a34a' : alpha(brand, 0.3)}`,
                borderRadius: '16px',
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: dragOver
                  ? alpha(brand, 0.07)
                  : archivo
                    ? alpha('#16a34a', 0.04)
                    : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                transition: 'all 0.18s ease',
                '&:hover': {
                  borderColor: brand,
                  bgcolor: alpha(brand, 0.04),
                },
              }}
            >
              <input
                ref={inputRef}
                type="file"
                hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) setArchivo(f); }}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.jpg,.jpeg,.png,.zip,.rar"
              />
              {archivo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '10px',
                    bgcolor: alpha('#16a34a', 0.12),
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 280 }}>
                      {archivo.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(archivo.size)} · Clic para reemplazar archivo
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); setArchivo(null); }}
                    sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ py: 1 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: alpha(brand, 0.1),
                    color: brand,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.2,
                  }}>
                    <UploadIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', mb: 0.3 }}>
                    Arrastra aquí tu archivo o haz clic para examinar
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, Office, imágenes, video · Máximo 50 MB
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <TextField
              label="URL externa *"
              placeholder="https://drive.google.com/... o https://youtube.com/..."
              fullWidth
              size="small"
              value={form.url_externa ?? ''}
              onChange={e => setForm(p => ({ ...p, url_externa: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon sx={{ fontSize: 18, color: brand }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          )}

          <Autocomplete
            multiple
            options={temario}
            getOptionLabel={t => `${t.unidad_numero}.${t.tema_numero} ${t.tema_titulo}`}
            isOptionEqualToValue={(opt, val) => opt.tema_id === val.tema_id}
            value={temario.filter(t => (form.temas ?? []).some(ft => ft.tema_id === t.tema_id))}
            onChange={(_, sel) => setForm(p => ({
              ...p,
              temas: sel.map((t, i) => ({ tema_id: t.tema_id, es_principal: i === 0, orden: i + 1 })),
            }))}
            renderTags={(val, getTagProps) =>
              val.map((t, idx) => (
                <Chip
                  {...getTagProps({ index: idx })}
                  key={t.tema_id}
                  label={`${t.unidad_numero}.${t.tema_numero} ${t.tema_titulo}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(brand, 0.12),
                    color: brand,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    borderRadius: '6px',
                    border: `1px solid ${alpha(brand, 0.2)}`,
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label={temario.length === 0 ? 'No hay temas registrados en el temario' : 'Vincular a tema(s) del programa'}
                placeholder="Seleccionar temas..."
                size="small"
                sx={fieldSx}
              />
            )}
            noOptionsText="No hay temas en este curso"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                  Publicar ahora
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                  Visible para alumnos
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={form.visible_para_estudiantes ?? true}
                onChange={e => setForm(p => ({ ...p, visible_para_estudiantes: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: brand,
                    '& + .MuiSwitch-track': { backgroundColor: brand },
                  },
                }}
              />
            </Box>

            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                  Destacado ⭐
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                  Fijar en primer plano
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={form.es_destacado ?? false}
                onChange={e => setForm(p => ({ ...p, es_destacado: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#f59e0b',
                    '& + .MuiSwitch-track': { backgroundColor: '#f59e0b' },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${borderField}`,
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)',
          gap: 1.2,
        }}>
          <Button
            onClick={() => setDlgSubir(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderColor: borderField,
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitMaterial}
            variant="contained"
            disabled={isSubmitting || !canSubmit}
            endIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              px: 3,
              py: 0.9,
              background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(brand, 0.35)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(brand, 0.45)}`,
              },
              '&.Mui-disabled': {
                opacity: 0.6,
              },
            }}
          >
            {isSubmitting ? 'Subiendo recurso...' : 'Guardar y Subir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: EDITAR MATERIAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dlgEditar}
        onClose={() => setDlgEditar(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
              : '0 20px 50px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: brandDim,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(brand, 0.35)}`,
                color: isDark ? '#000' : '#fff',
              }}>
                <EditIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: brand,
                }}>
                  Recursos Didácticos · Editar Material
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  Editar Material Educativo
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500, mt: 0.2 }}>
                  {materialAEditar?.codigo_material} · {asignacion.materia_nombre}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDlgEditar(false)}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                '&:hover': {
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  color: 'text.primary',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, p: 3 }}>
          <TextField
            select
            label="Tipo de material *"
            fullWidth
            size="small"
            value={editForm.tipo_material_id ?? ''}
            onChange={e => setEditForm(p => ({ ...p, tipo_material_id: Number(e.target.value) }))}
            sx={fieldSx}
          >
            {tipos.map(t => (
              <MenuItem key={t.id} value={t.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <span style={{ fontSize: '1.1rem' }}>{t.icono}</span>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 600 }}>{t.nombre}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Título del material *"
            placeholder="Ej: Guía Práctica de Ecuaciones de 2do Grado"
            fullWidth
            size="small"
            value={editForm.titulo ?? ''}
            onChange={e => setEditForm(p => ({ ...p, titulo: e.target.value }))}
            sx={fieldSx}
          />

          <TextField
            label="Descripción o instrucciones"
            placeholder="Añade detalles, recomendaciones o puntos clave para los alumnos..."
            fullWidth
            size="small"
            multiline
            rows={2.5}
            value={editForm.descripcion ?? ''}
            onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
            sx={fieldSx}
          />

          <Box>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Origen del recurso
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: 'Archivo digital', icon: <FileIcon sx={{ fontSize: 18 }} />, isLink: false },
                { label: 'Enlace externo (URL)', icon: <LinkIcon sx={{ fontSize: 18 }} />, isLink: true },
              ].map(opt => {
                const isSelected = editEsEnlace === opt.isLink;
                return (
                  <Box
                    key={opt.label}
                    onClick={() => setEditEsEnlace(opt.isLink)}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? brand : borderField}`,
                      bgcolor: isSelected ? alpha(brand, 0.08) : bgField,
                      color: isSelected ? brand : 'text.secondary',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        borderColor: alpha(brand, 0.45),
                      },
                    }}
                  >
                    {opt.icon}
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {opt.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {!editEsEnlace ? (
            <Box
              onDragOver={e => { e.preventDefault(); setEditDragOver(true); }}
              onDragLeave={() => setEditDragOver(false)}
              onDrop={handleEditDrop}
              onClick={() => editInputRef.current?.click()}
              sx={{
                border: `1.8px dashed ${editDragOver ? brand : editArchivo ? '#16a34a' : alpha(brand, 0.3)}`,
                borderRadius: '16px',
                p: 2.5,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: editDragOver
                  ? alpha(brand, 0.07)
                  : editArchivo
                    ? alpha('#16a34a', 0.04)
                    : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                transition: 'all 0.18s ease',
                '&:hover': {
                  borderColor: brand,
                  bgcolor: alpha(brand, 0.04),
                },
              }}
            >
              <input
                ref={editInputRef}
                type="file"
                hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) setEditArchivo(f); }}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.jpg,.jpeg,.png,.zip,.rar"
              />
              {editArchivo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '10px',
                    bgcolor: alpha('#16a34a', 0.12),
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 280 }}>
                      {editArchivo.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(editArchivo.size)} · Nuevo archivo seleccionado (clic para cambiar)
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={e => { e.stopPropagation(); setEditArchivo(null); }}
                    sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ) : materialAEditar?.url_archivo && !materialAEditar.es_enlace_externo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '10px',
                    bgcolor: alpha(brand, 0.12),
                    color: brand,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 280 }}>
                      {materialAEditar.nombre_archivo || 'Archivo actual conservado'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {materialAEditar.tamano_bytes ? `${formatBytes(materialAEditar.tamano_bytes)} · ` : ''}Clic o arrastra para reemplazarlo
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ py: 1 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: alpha(brand, 0.1),
                    color: brand,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.2,
                  }}>
                    <UploadIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', mb: 0.3 }}>
                    Arrastra aquí el archivo o haz clic para subir
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, Office, imágenes, video · Máximo 50 MB
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <TextField
              label="URL externa *"
              placeholder="https://drive.google.com/... o https://youtube.com/..."
              fullWidth
              size="small"
              value={editForm.url_externa ?? ''}
              onChange={e => setEditForm(p => ({ ...p, url_externa: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon sx={{ fontSize: 18, color: brand }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          )}

          <Autocomplete
            multiple
            options={temario}
            getOptionLabel={t => `${t.unidad_numero}.${t.tema_numero} ${t.tema_titulo}`}
            isOptionEqualToValue={(opt, val) => opt.tema_id === val.tema_id}
            value={temario.filter(t => (editForm.temas ?? []).some(ft => ft.tema_id === t.tema_id))}
            onChange={(_, sel) => setEditForm(p => ({
              ...p,
              temas: sel.map((t, i) => ({ tema_id: t.tema_id, es_principal: i === 0, orden: i + 1 })),
            }))}
            renderTags={(val, getTagProps) =>
              val.map((t, idx) => (
                <Chip
                  {...getTagProps({ index: idx })}
                  key={t.tema_id}
                  label={`${t.unidad_numero}.${t.tema_numero} ${t.tema_titulo}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(brand, 0.12),
                    color: brand,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    borderRadius: '6px',
                    border: `1px solid ${alpha(brand, 0.2)}`,
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label={temario.length === 0 ? 'No hay temas registrados en el temario' : 'Vincular a tema(s) del programa'}
                placeholder="Seleccionar temas..."
                size="small"
                sx={fieldSx}
              />
            )}
            noOptionsText="No hay temas en este curso"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                  Visible para alumnos
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                  Habilitar acceso
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={editForm.visible_para_estudiantes ?? true}
                onChange={e => setEditForm(p => ({ ...p, visible_para_estudiantes: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: brand,
                    '& + .MuiSwitch-track': { backgroundColor: brand },
                  },
                }}
              />
            </Box>

            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: bgField,
              border: `1px solid ${borderField}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                  Destacado ⭐
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                  Fijar en primer plano
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={editForm.es_destacado ?? false}
                onChange={e => setEditForm(p => ({ ...p, es_destacado: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#f59e0b',
                    '& + .MuiSwitch-track': { backgroundColor: '#f59e0b' },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${borderField}`,
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)',
          gap: 1.2,
        }}>
          <Button
            onClick={() => setDlgEditar(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderColor: borderField,
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitEditar}
            variant="contained"
            disabled={isSubmitting || !canSubmitEdit}
            endIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              px: 3,
              py: 0.9,
              background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(brand, 0.35)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(brand, 0.45)}`,
              },
              '&.Mui-disabled': {
                opacity: 0.6,
              },
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: CONFIRMAR ELIMINAR (ESTILO NUEVOHORARIOMODAL ROJO)
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dlgEliminar}
        onClose={() => setDlgEliminar(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${alpha('#ef4444', 0.35)}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          },
        }}
      >
        <Box sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: alpha('#ef4444', 0.1),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                color: '#fff',
              }}>
                <DeleteIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#ef4444',
                }}>
                  Zona de Peligro · Eliminar
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  ¿Eliminar material?
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDlgEliminar(false)}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: alpha('#ef4444', 0.06),
            border: `1px solid ${alpha('#ef4444', 0.2)}`,
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            mb: 2,
          }}>
            <WarningIcon sx={{ color: '#ef4444', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: '0.84rem', color: 'text.primary', lineHeight: 1.4 }}>
              Esta acción eliminará permanentemente el recurso y su archivo asociado para todos los estudiantes.
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>
            Material a eliminar:{' '}
            <strong style={{ color: isDark ? '#fff' : '#000' }}>
              "{materialAEliminar?.titulo}"
            </strong>
          </Typography>
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${borderField}`,
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)',
          gap: 1.2,
        }}>
          <Button
            onClick={() => setDlgEliminar(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderColor: borderField,
              color: 'text.secondary',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminar}
            variant="contained"
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              px: 3,
              py: 0.9,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
              },
            }}
          >
            {isSubmitting ? 'Eliminando...' : 'Sí, eliminar recurso'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── CARD GRID (DISEÑO INSTITUCIONAL IDÉNTICO A CALIFICACIONES / MATERIAS) ──────
const MaterialCardGrid: React.FC<{
  material: MaterialAcademico;
  accent: string;
  accentDark: string;
  isDark: boolean;
  onVer: () => void;
  onEditar: () => void;
  onPublicar: () => void;
  onDespublicar?: () => void;
  onEliminar: () => void;
}> = ({ material, accent, isDark, onVer, onEditar, onPublicar, onDespublicar, onEliminar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPublished =
    material.es_publicado !== undefined
      ? Boolean(material.es_publicado)
      : (!!material.fecha_publicacion &&
         new Date(material.fecha_publicacion) <= new Date() &&
         (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date()));

  const iconColor = material.tipo_material_color || accent;
  const vistas = Number(material.total_vistas ?? material.contador_vistas ?? 0);
  const descargas = Number(material.total_descargas ?? material.contador_descargas ?? 0);
  const comentarios = Number(material.total_comentarios ?? 0);

  return (
    <Fade in timeout={300}>
      <Card
        onClick={onVer}
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

        {/* Chip de Estado / Destacado / Menú arriba a la derecha */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, display: 'flex', alignItems: 'center', gap: 0.6 }}>
          {material.es_destacado && (
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
            label={isPublished ? 'Publicado' : 'Borrador'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 22,
              backgroundColor: isPublished
                ? isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)'
                : isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.12)',
              color: isPublished ? '#16a34a' : '#64748b',
              border: `1px solid ${isPublished ? alpha('#16a34a', 0.25) : alpha('#94a3b8', 0.25)}`,
            }}
          />

          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
            sx={{
              width: 22,
              height: 22,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
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
              {material.tipo_material_icono || '📄'}
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

          {/* Subtítulo o Código + Fecha */}
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
            {material.descripcion || (material.fecha_publicacion ? `Publicado el ${formatDate(material.fecha_publicacion)}` : material.codigo_material)}
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

          {/* Botón Gestionar */}
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
              Gestionar
            </Button>
          </Box>
        </CardContent>

        {/* Footer métricas integrado */}
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

          <Tooltip title={`${comentarios} comentarios de alumnos`}>
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

        {/* Menú flotante contextual */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onClick={e => e.stopPropagation()}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 160,
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            },
          }}
        >
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setAnchorEl(null); onVer(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
              <ListItemIcon sx={{ minWidth: 28, color: 'text.primary' }}>
                <VisibilityIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Ver detalle" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setAnchorEl(null); onEditar(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
              <ListItemIcon sx={{ minWidth: 28, color: accent }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Editar material" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
          {!isPublished ? (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setAnchorEl(null); onPublicar(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
                <ListItemIcon sx={{ minWidth: 28, color: '#16a34a' }}>
                  <PublishIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Publicar ahora"
                  primaryTypographyProps={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}
                />
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setAnchorEl(null); onDespublicar?.(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
                <ListItemIcon sx={{ minWidth: 28, color: '#f59e0b' }}>
                  <DraftIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Pausar / Borrador"
                  primaryTypographyProps={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}
                />
              </ListItemButton>
            </ListItem>
          )}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { setAnchorEl(null); onEliminar(); }}
              sx={{ borderRadius: '8px', mx: 0.5, py: 0.7, color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700 }} />
            </ListItemButton>
          </ListItem>
        </Menu>
      </Card>
    </Fade>
  );
};

// ── ROW LIST (DISEÑO LISTA IDÉNTICO A MATERIAS / CALIFICACIONES) ───────────────
const MaterialRowList: React.FC<{
  material: MaterialAcademico;
  accent: string;
  accentDark: string;
  isDark: boolean;
  onVer: () => void;
  onEditar: () => void;
  onPublicar: () => void;
  onDespublicar?: () => void;
  onEliminar: () => void;
}> = ({ material, accent, isDark, onVer, onEditar, onPublicar, onDespublicar, onEliminar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isPublished =
    material.es_publicado !== undefined
      ? Boolean(material.es_publicado)
      : (!!material.fecha_publicacion &&
         new Date(material.fecha_publicacion) <= new Date() &&
         (!material.fecha_despublicacion || new Date(material.fecha_despublicacion) > new Date()));

  const iconColor = material.tipo_material_color || accent;
  const vistas = Number(material.total_vistas ?? material.contador_vistas ?? 0);
  const descargas = Number(material.total_descargas ?? material.contador_descargas ?? 0);
  const comentarios = Number(material.total_comentarios ?? 0);

  return (
    <Fade in timeout={250}>
      <Card
        onClick={onVer}
        sx={{
          borderRadius: '14px',
          border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
          p: 1.6,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateX(4px)',
            borderColor: iconColor,
            boxShadow: `0 4px 16px ${alpha(iconColor, 0.12)}`,
            '& .btn-gestionar-row': {
              backgroundColor: alpha(iconColor, 0.15),
              borderColor: iconColor,
            },
          },
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: isDark ? alpha(iconColor, 0.18) : alpha(iconColor, 0.12),
            color: iconColor,
            border: `2px solid ${alpha(iconColor, 0.25)}`,
            boxShadow: `0 3px 8px ${alpha(iconColor, 0.2)}`,
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          {material.tipo_material_icono || '📄'}
        </Avatar>

        <Box sx={{ minWidth: 160, flex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ fontSize: '0.92rem', color: 'text.primary' }}>
              {material.titulo}
            </Typography>
            {material.es_destacado && (
              <Tooltip title="Destacado">
                <StarIcon sx={{ color: '#f59e0b', fontSize: 16, flexShrink: 0 }} />
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: 'text.disabled', fontFamily: 'monospace' }}>
              {material.codigo_material}
            </Typography>
            {material.tipo_material_nombre && (
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: iconColor }}>
                · {material.tipo_material_nombre}
              </Typography>
            )}
            {material.fecha_publicacion && (
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                · {formatDate(material.fecha_publicacion)}
              </Typography>
            )}
            {material.es_enlace_externo ? (
              <Chip
                label="Enlace web"
                size="small"
                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(iconColor, 0.1), color: iconColor }}
              />
            ) : material.tamano_bytes ? (
              <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                · {formatBytes(material.tamano_bytes)}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {/* Métricas inline */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, flexShrink: 0, alignItems: 'center' }}>
          <Tooltip title={`${vistas} vistas`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <EyeIcon sx={{ fontSize: 14, color: vistas > 0 ? '#0288d1' : 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontWeight: 700 }}>{vistas}</Typography>
            </Box>
          </Tooltip>
          <Tooltip title={`${descargas} descargas`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <DownloadIcon sx={{ fontSize: 14, color: descargas > 0 ? '#16a34a' : 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontWeight: 700 }}>{descargas}</Typography>
            </Box>
          </Tooltip>
          <Tooltip title={`${comentarios} comentarios`}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              px: comentarios > 0 ? 0.7 : 0,
              py: comentarios > 0 ? 0.2 : 0,
              borderRadius: '4px',
              bgcolor: comentarios > 0 ? alpha('#8b5cf6', 0.12) : 'transparent',
            }}>
              <ChatIcon sx={{ fontSize: 14, color: comentarios > 0 ? '#8b5cf6' : 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.74rem', color: comentarios > 0 ? '#8b5cf6' : 'text.secondary', fontWeight: 700 }}>{comentarios}</Typography>
            </Box>
          </Tooltip>
        </Box>

        {/* Estado */}
        <Box sx={{ flexShrink: 0 }}>
          <Chip
            size="small"
            label={isPublished ? 'Publicado' : 'Borrador'}
            sx={{
              height: 22,
              fontSize: '0.66rem',
              fontWeight: 700,
              borderRadius: '6px',
              bgcolor: isPublished ? alpha('#16a34a', 0.1) : alpha('#94a3b8', 0.12),
              color: isPublished ? '#16a34a' : '#64748b',
              border: `1px solid ${isPublished ? alpha('#16a34a', 0.25) : alpha('#94a3b8', 0.25)}`,
            }}
          />
        </Box>

        {/* Botón Gestionar */}
        <Button
          className="btn-gestionar-row"
          size="small"
          variant="outlined"
          endIcon={<ChevronRightIcon sx={{ fontSize: 15 }} />}
          sx={{
            borderRadius: '9px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.74rem',
            px: 1.6,
            py: 0.4,
            borderColor: alpha(iconColor, 0.4),
            color: iconColor,
            display: { xs: 'none', sm: 'inline-flex' },
            transition: 'all 0.2s ease',
          }}
        >
          Gestionar
        </Button>

        {/* Menú de opciones */}
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
          sx={{ p: 0.4, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onClick={e => e.stopPropagation()}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 160,
              border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            },
          }}
        >
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setAnchorEl(null); onVer(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
              <ListItemIcon sx={{ minWidth: 28, color: 'text.primary' }}>
                <VisibilityIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Ver detalle" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { setAnchorEl(null); onEditar(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
              <ListItemIcon sx={{ minWidth: 28, color: accent }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Editar material" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
          {!isPublished ? (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setAnchorEl(null); onPublicar(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
                <ListItemIcon sx={{ minWidth: 28, color: '#16a34a' }}>
                  <PublishIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Publicar ahora"
                  primaryTypographyProps={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}
                />
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setAnchorEl(null); onDespublicar?.(); }} sx={{ borderRadius: '8px', mx: 0.5, py: 0.7 }}>
                <ListItemIcon sx={{ minWidth: 28, color: '#f59e0b' }}>
                  <DraftIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Pausar / Borrador"
                  primaryTypographyProps={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}
                />
              </ListItemButton>
            </ListItem>
          )}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { setAnchorEl(null); onEliminar(); }}
              sx={{ borderRadius: '8px', mx: 0.5, py: 0.8, color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 700 }} />
            </ListItemButton>
          </ListItem>
        </Menu>
      </Card>
    </Fade>
  );
};

export default MaterialesDocente;
