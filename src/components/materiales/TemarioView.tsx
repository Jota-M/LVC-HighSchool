'use client';
// components/materiales/TemarioView.tsx
import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, IconButton, Chip, Button,
  Collapse, Skeleton, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, alpha, useTheme, Tooltip, LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  Bookmark as BookmarkIcon,
  LinkOutlined as LinkIcon,
} from '@mui/icons-material';
import { useTemario, useUnidadesTematicas, useTemas } from '@/hooks/useMaterial';
import { NIVELES_DIFICULTAD, NivelDificultad, CrearUnidadTematicaDTO, CrearTemaDTO } from '@/types/materialTypes';

// ─── Props ────────────────────────────────────────────────
interface TemarioViewProps {
  grado_materia_id?: number; // Si no se pasa, se mostraría un selector
}

// ─── Componente ───────────────────────────────────────────
export const TemarioView: React.FC<TemarioViewProps> = ({ grado_materia_id }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  // Estado para la UI
  const [expandedUnidades, setExpandedUnidades] = useState<Record<number, boolean>>({});
  const [unidadDialogOpen, setUnidadDialogOpen] = useState(false);
  const [temaDialogOpen, setTemaDialogOpen]     = useState(false);
  const [unidadParaTema, setUnidadParaTema]     = useState<number | null>(null);

  // Hook de temario
  const {
    porUnidad, isLoading, refrescar,
  } = useTemario(grado_materia_id ?? null);

  const { crear: crearUnidad, isSubmitting: creandoUnidad } =
    useUnidadesTematicas({ grado_materia_id, activo: true });

  const { crear: crearTema, isSubmitting: creandoTema } =
    useTemas({});

  const toggleUnidad = (id: number) =>
    setExpandedUnidades(prev => ({ ...prev, [id]: !prev[id] }));

  const openTemaDialog = (unidad_id: number) => {
    setUnidadParaTema(unidad_id);
    setTemaDialogOpen(true);
  };

  // ── Formulario: Nueva Unidad ──────────────────────────────
  const [formUnidad, setFormUnidad] = useState<Partial<CrearUnidadTematicaDTO>>({});

  const handleCrearUnidad = async () => {
    if (!grado_materia_id || !formUnidad.numero_unidad || !formUnidad.titulo) return;
    const ok = await crearUnidad({
      grado_materia_id,
      numero_unidad: formUnidad.numero_unidad!,
      titulo:        formUnidad.titulo!,
      descripcion:   formUnidad.descripcion,
      objetivos:     formUnidad.objetivos,
    });
    if (ok) {
      setUnidadDialogOpen(false);
      setFormUnidad({});
      refrescar();
    }
  };

  // ── Formulario: Nuevo Tema ────────────────────────────────
  const [formTema, setFormTema] = useState<Partial<CrearTemaDTO>>({});

  const handleCrearTema = async () => {
    if (!unidadParaTema || !formTema.numero_tema || !formTema.titulo) return;
    const ok = await crearTema({
      unidad_tematica_id: unidadParaTema,
      numero_tema:        formTema.numero_tema!,
      titulo:             formTema.titulo!,
      descripcion:        formTema.descripcion,
      nivel_dificultad:   formTema.nivel_dificultad,
      duracion_estimada:  formTema.duracion_estimada,
      es_obligatorio:     formTema.es_obligatorio ?? true,
    });
    if (ok) {
      setTemaDialogOpen(false);
      setFormTema({});
      refrescar();
    }
  };

  // ── Skeleton ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '16px' }} />
        ))}
      </Box>
    );
  }

  // ── Sin datos ─────────────────────────────────────────────
  if (porUnidad.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          borderRadius: '20px',
          border: `2px dashed ${alpha(accent, 0.3)}`,
        }}
      >
        <BookIcon sx={{ fontSize: 64, color: alpha(accent, 0.4), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aún no hay unidades temáticas
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
          Crea la estructura de tu temario para organizar los materiales.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUnidadDialogOpen(true)}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${accent} 0%, ${isDark ? '#f59e0b' : '#01579b'} 100%)`,
            color: isDark ? '#000' : '#fff',
          }}
        >
          Crear primera unidad
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* ── Botón agregar unidad ── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setUnidadDialogOpen(true)}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: accent,
            border: `1px solid ${alpha(accent, 0.4)}`,
            '&:hover': { bgcolor: alpha(accent, 0.08) },
          }}
        >
          Nueva Unidad
        </Button>
      </Box>

      {/* ── Lista de Unidades ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {porUnidad.map(({ unidad, temas }) => {
          const isOpen = expandedUnidades[unidad.unidad_id] ?? false;

          return (
            <Card
              key={unidad.unidad_id}
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                overflow: 'visible',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: `0 4px 20px ${alpha(accent, 0.15)}`,
                },
              }}
            >
              {/* ── Header de unidad ── */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleUnidad(unidad.unidad_id)}
              >
                {/* Número */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${accent}, ${isDark ? '#f59e0b' : '#01579b'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {unidad.numero_unidad}
                </Box>

                {/* Título y descripción */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {unidad.unidad_titulo}
                  </Typography>
                  {unidad.unidad_descripcion && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {unidad.unidad_descripcion}
                    </Typography>
                  )}
                </Box>

                {/* Badge de temas */}
                <Chip
                  label={`${temas.length} tema${temas.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(accent, 0.12),
                    color: accent,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />

                {/* Expand */}
                <IconButton size="small">
                  {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* ── Temas ── */}
              <Collapse in={isOpen}>
                <Box
                  sx={{
                    px: 2,
                    pb: 2,
                    borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
                  }}
                >
                  {/* Lista de temas */}
                  {temas.map((tema, idx) => {
                    const nivelInfo = NIVELES_DIFICULTAD.find(n => n.value === tema.nivel_dificultad);
                    return (
                      <Box
                        key={tema.tema_id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 1.5,
                          px: 1,
                          borderBottom:
                            idx < temas.length - 1
                              ? `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04)}`
                              : 'none',
                          borderRadius: '10px',
                          transition: 'background 0.15s',
                          '&:hover': {
                            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                          },
                        }}
                      >
                        <BookmarkIcon
                          sx={{
                            color: alpha(accent, 0.5),
                            fontSize: 18,
                            flexShrink: 0,
                          }}
                        />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {tema.tema_numero}. {tema.tema_titulo}
                          </Typography>
                          {tema.tema_descripcion && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                mb: 0.6 
                              }}
                            >
                              {tema.tema_descripcion}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                          {nivelInfo && (
                            <Chip
                              label={nivelInfo.label}
                              size="small"
                              sx={{
                                bgcolor: nivelInfo.bgColor,
                                color: nivelInfo.color,
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                          )}
                          <Chip
                            icon={<LinkIcon sx={{ fontSize: '12px !important' }} />}
                            label={`${tema.total_materiales}`}
                            size="small"
                            sx={{
                              bgcolor: alpha(accent, 0.08),
                              color: accent,
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}

                  {/* Botón agregar tema */}
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => openTemaDialog(unidad.unidad_id)}
                    sx={{
                      mt: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      color: accent,
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: alpha(accent, 0.08) },
                    }}
                  >
                    Agregar tema
                  </Button>
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Box>

      {/* ═══ Dialog: Nueva Unidad ═══════════════════════════ */}
      <Dialog
        open={unidadDialogOpen}
        onClose={() => setUnidadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Nueva Unidad Temática</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Número de Unidad"
              type="number"
              size="small"
              value={formUnidad.numero_unidad ?? ''}
              onChange={e => setFormUnidad(p => ({ ...p, numero_unidad: parseInt(e.target.value) }))}
              sx={{ width: 160 }}
            />
            <TextField
              label="Título"
              size="small"
              fullWidth
              value={formUnidad.titulo ?? ''}
              onChange={e => setFormUnidad(p => ({ ...p, titulo: e.target.value }))}
            />
          </Box>
          <TextField
            label="Descripción (opcional)"
            size="small"
            multiline
            rows={2}
            fullWidth
            value={formUnidad.descripcion ?? ''}
            onChange={e => setFormUnidad(p => ({ ...p, descripcion: e.target.value }))}
          />
          <TextField
            label="Objetivos (opcional)"
            size="small"
            multiline
            rows={2}
            fullWidth
            value={formUnidad.objetivos ?? ''}
            onChange={e => setFormUnidad(p => ({ ...p, objetivos: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setUnidadDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCrearUnidad}
            variant="contained"
            disabled={creandoUnidad || !formUnidad.numero_unidad || !formUnidad.titulo}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${accent}, ${isDark ? '#f59e0b' : '#01579b'})`,
              color: isDark ? '#000' : '#fff',
            }}
          >
            {creandoUnidad ? 'Creando...' : 'Crear Unidad'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Dialog: Nuevo Tema ═════════════════════════════ */}
      <Dialog
        open={temaDialogOpen}
        onClose={() => setTemaDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Tema</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Número"
              type="number"
              size="small"
              value={formTema.numero_tema ?? ''}
              onChange={e => setFormTema(p => ({ ...p, numero_tema: parseInt(e.target.value) }))}
              sx={{ width: 120 }}
            />
            <TextField
              label="Título"
              size="small"
              fullWidth
              value={formTema.titulo ?? ''}
              onChange={e => setFormTema(p => ({ ...p, titulo: e.target.value }))}
            />
          </Box>
          <TextField
            label="Descripción (opcional)"
            size="small"
            multiline
            rows={2}
            fullWidth
            value={formTema.descripcion ?? ''}
            onChange={e => setFormTema(p => ({ ...p, descripcion: e.target.value }))}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Nivel de dificultad"
              size="small"
              sx={{ flex: 1 }}
              value={formTema.nivel_dificultad ?? ''}
              onChange={e => setFormTema(p => ({ ...p, nivel_dificultad: e.target.value as NivelDificultad }))}
            >
              <MenuItem value="">Sin especificar</MenuItem>
              {NIVELES_DIFICULTAD.map(n => (
                <MenuItem key={n.value} value={n.value}>{n.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Duración (min)"
              type="number"
              size="small"
              sx={{ width: 140 }}
              value={formTema.duracion_estimada ?? ''}
              onChange={e => setFormTema(p => ({ ...p, duracion_estimada: parseInt(e.target.value) }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setTemaDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCrearTema}
            variant="contained"
            disabled={creandoTema || !formTema.numero_tema || !formTema.titulo}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${accent}, ${isDark ? '#f59e0b' : '#01579b'})`,
              color: isDark ? '#000' : '#fff',
            }}
          >
            {creandoTema ? 'Creando...' : 'Crear Tema'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemarioView;