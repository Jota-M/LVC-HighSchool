'use client';
// components/docente/materiales/TemarioDocente.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Chip, IconButton, Button, Collapse,
  Skeleton, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, alpha, Tooltip, Fade,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoStories as AutoStoriesIcon,
  Bookmark as BookmarkIcon,
  Link as LinkIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';
import { AsignacionDocente } from '@/services/asistenciaService';
import {
  useTemario,
  useUnidadesTematicas,
  useTemas,
} from '@/hooks/useMaterial';
import {
  NIVELES_DIFICULTAD,
  NivelDificultad,
  CrearUnidadTematicaDTO,
  CrearTemaDTO,
  TemarioItem,
} from '@/types/materialTypes';

interface TemarioDocenteProps {
  asignacion: AsignacionDocente;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

// Estructura agrupada que devuelve el hook
interface GrupoUnidad {
  unidad: {
    unidad_id: number;
    numero_unidad: number;
    unidad_titulo: string;
    unidad_descripcion?: string;
  };
  temas: TemarioItem[];
}

export const TemarioDocente: React.FC<TemarioDocenteProps> = ({
  asignacion, accent, accentDark, isDark,
}) => {
  // La asignacion tiene grado_materia_id indirectamente a través de asignacion_id
  // Necesitamos el grado_materia_id — lo derivamos de la asignación
 const gradoMateriaId = asignacion.grado_materia_id;

  const { porUnidad, isLoading, refrescar } = useTemario(gradoMateriaId ?? null);

  const { crear: crearUnidad, isSubmitting: creandoUnidad } =
    useUnidadesTematicas({ grado_materia_id: gradoMateriaId, activo: true });

  const { crear: crearTema, eliminar: eliminarTema, isSubmitting: submittingTema } =
    useTemas({});

  const { eliminar: eliminarUnidad, isSubmitting: submittingUnidad } =
    useUnidadesTematicas({ grado_materia_id: gradoMateriaId });

  // ── UI state ─────────────────────────────────────────────
  const [expandidas, setExpandidas] = useState<Record<number, boolean>>({});
  const toggle = (id: number) => setExpandidas(p => ({ ...p, [id]: !p[id] }));

  // ── Dialog Unidad ─────────────────────────────────────────
  const [dlgUnidad, setDlgUnidad]   = useState(false);
  const [fUnidad, setFUnidad]       = useState<Partial<CrearUnidadTematicaDTO>>({});

  const submitUnidad = async () => {
    if (!gradoMateriaId || !fUnidad.numero_unidad || !fUnidad.titulo) return;
    const ok = await crearUnidad({
      grado_materia_id: gradoMateriaId,
      numero_unidad:    fUnidad.numero_unidad!,
      titulo:           fUnidad.titulo!,
      descripcion:      fUnidad.descripcion,
      objetivos:        fUnidad.objetivos,
    });
    if (ok) { setDlgUnidad(false); setFUnidad({}); refrescar(); }
  };

  // ── Dialog Tema ───────────────────────────────────────────
  const [dlgTema, setDlgTema]       = useState(false);
  const [unidadParaTema, setUnidadParaTema] = useState<number | null>(null);
  const [fTema, setFTema]           = useState<Partial<CrearTemaDTO>>({});

  const abrirDlgTema = (unidadId: number) => {
    setUnidadParaTema(unidadId);
    setDlgTema(true);
  };

  const submitTema = async () => {
    if (!unidadParaTema || !fTema.numero_tema || !fTema.titulo) return;
    const ok = await crearTema({
      unidad_tematica_id: unidadParaTema,
      numero_tema:        fTema.numero_tema!,
      titulo:             fTema.titulo!,
      descripcion:        fTema.descripcion,
      nivel_dificultad:   fTema.nivel_dificultad,
      duracion_estimada:  fTema.duracion_estimada,
      es_obligatorio:     fTema.es_obligatorio ?? true,
    });
    if (ok) { setDlgTema(false); setFTema({}); refrescar(); }
  };

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '14px' }} />
        ))}
      </Box>
    );
  }

  // ── Sin grado_materia_id ──────────────────────────────────
  if (!gradoMateriaId) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
        <Typography variant="body2">
          No se encontró el identificador de la materia. Contacta al administrador.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Botón nueva unidad */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDlgUnidad(true)}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: accent,
            border: `1px solid ${alpha(accent, 0.4)}`,
            '&:hover': { bgcolor: alpha(accent, 0.07) },
          }}
        >
          Nueva Unidad
        </Button>
      </Box>

      {/* Sin unidades */}
      {porUnidad.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            borderRadius: '18px',
            border: `2px dashed ${alpha(accent, 0.25)}`,
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: 56, color: alpha(accent, 0.35), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            El temario está vacío
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Crea la primera unidad temática para organizar tus materiales.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDlgUnidad(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              color: isDark ? '#000' : '#fff',
            }}
          >
            Crear primera unidad
          </Button>
        </Box>
      )}

      {/* Lista de unidades */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(porUnidad as GrupoUnidad[]).map(({ unidad, temas }) => {
          const isOpen = expandidas[unidad.unidad_id] ?? false;

          return (
            <Fade key={unidad.unidad_id} in timeout={300}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(accent, 0.12)}`,
                  },
                }}
              >
                {/* Header de unidad */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: isOpen
                      ? `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`
                      : 'none',
                  }}
                  onClick={() => toggle(unidad.unidad_id)}
                >
                  {/* Número */}
                  <Box
                    sx={{
                      width: 42, height: 42,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isDark ? '#000' : '#fff',
                      fontWeight: 800,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {unidad.numero_unidad}
                  </Box>

                  {/* Texto */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
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
                      height: 22, fontSize: '0.68rem', fontWeight: 600,
                      bgcolor: alpha(accent, 0.1), color: accent,
                    }}
                  />

                  {/* Acciones de unidad */}
                  <Box onClick={e => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Eliminar unidad">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={submittingUnidad}
                        onClick={() => eliminarUnidad(unidad.unidad_id)}
                        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <IconButton size="small">
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Temas */}
                <Collapse in={isOpen}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {temas.map((tema, idx) => {
                      const nivelInfo = NIVELES_DIFICULTAD.find(n => n.value === tema.nivel_dificultad);
                      return (
                        <Box
                          key={tema.tema_id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
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
                          <BookmarkIcon sx={{ color: alpha(accent, 0.5), fontSize: 16, flexShrink: 0 }} />

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {tema.numero_tema}. {tema.tema_titulo}
                            </Typography>
                            {tema.tema_descripcion && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {tema.tema_descripcion}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                            {nivelInfo && (
                              <Chip
                                label={nivelInfo.label}
                                size="small"
                                sx={{
                                  height: 18, fontSize: '0.62rem', fontWeight: 600,
                                  bgcolor: nivelInfo.bgColor, color: nivelInfo.color,
                                }}
                              />
                            )}
                            <Chip
                              icon={<LinkIcon sx={{ fontSize: '11px !important' }} />}
                              label={`${tema.total_materiales}`}
                              size="small"
                              sx={{
                                height: 18, fontSize: '0.62rem', fontWeight: 600,
                                bgcolor: alpha(accent, 0.08), color: accent,
                              }}
                            />
                            <Tooltip title="Eliminar tema">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={submittingTema}
                                onClick={() => { eliminarTema(tema.tema_id); refrescar(); }}
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, p: 0.3 }}
                              >
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      );
                    })}

                    {/* Botón agregar tema */}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => abrirDlgTema(unidad.unidad_id)}
                      sx={{
                        mt: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        color: accent,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: alpha(accent, 0.07) },
                      }}
                    >
                      Agregar tema
                    </Button>
                  </Box>
                </Collapse>
              </Card>
            </Fade>
          );
        })}
      </Box>

      {/* ════ Dialog: Nueva Unidad ════════════════════════════ */}
      <Dialog
        open={dlgUnidad}
        onClose={() => setDlgUnidad(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Nueva Unidad Temática</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="N°" type="number" size="small"
              value={fUnidad.numero_unidad ?? ''}
              onChange={e => setFUnidad(p => ({ ...p, numero_unidad: parseInt(e.target.value) }))}
              sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <TextField
              label="Título *" size="small" fullWidth
              value={fUnidad.titulo ?? ''}
              onChange={e => setFUnidad(p => ({ ...p, titulo: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
          <TextField
            label="Descripción" size="small" multiline rows={2} fullWidth
            value={fUnidad.descripcion ?? ''}
            onChange={e => setFUnidad(p => ({ ...p, descripcion: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            label="Objetivos" size="small" multiline rows={2} fullWidth
            value={fUnidad.objetivos ?? ''}
            onChange={e => setFUnidad(p => ({ ...p, objetivos: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={() => setDlgUnidad(false)} variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={submitUnidad} variant="contained"
            disabled={creandoUnidad || !fUnidad.numero_unidad || !fUnidad.titulo}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600,
              background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              color: isDark ? '#000' : '#fff',
            }}
          >
            {creandoUnidad ? 'Creando…' : 'Crear Unidad'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Dialog: Nuevo Tema ═════════════════════════════ */}
      <Dialog
        open={dlgTema}
        onClose={() => setDlgTema(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Tema</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="N°" type="number" size="small"
              value={fTema.numero_tema ?? ''}
              onChange={e => setFTema(p => ({ ...p, numero_tema: parseInt(e.target.value) }))}
              sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <TextField
              label="Título *" size="small" fullWidth
              value={fTema.titulo ?? ''}
              onChange={e => setFTema(p => ({ ...p, titulo: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
          <TextField
            label="Descripción" size="small" multiline rows={2} fullWidth
            value={fTema.descripcion ?? ''}
            onChange={e => setFTema(p => ({ ...p, descripcion: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select label="Dificultad" size="small" sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              value={fTema.nivel_dificultad ?? ''}
              onChange={e => setFTema(p => ({ ...p, nivel_dificultad: e.target.value as NivelDificultad }))}
            >
              <MenuItem value="">Sin especificar</MenuItem>
              {NIVELES_DIFICULTAD.map(n => (
                <MenuItem key={n.value} value={n.value}>{n.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Duración (min)" type="number" size="small"
              sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              value={fTema.duracion_estimada ?? ''}
              onChange={e => setFTema(p => ({ ...p, duracion_estimada: parseInt(e.target.value) }))}
              InputProps={{ startAdornment: <ClockIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.disabled' }} /> }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={() => setDlgTema(false)} variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={submitTema} variant="contained"
            disabled={submittingTema || !fTema.numero_tema || !fTema.titulo}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600,
              background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              color: isDark ? '#000' : '#fff',
            }}
          >
            {submittingTema ? 'Creando…' : 'Crear Tema'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemarioDocente;