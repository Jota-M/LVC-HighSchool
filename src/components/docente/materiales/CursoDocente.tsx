'use client';
// components/docente/materiales/CursoDocente.tsx

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box, Typography, Chip, IconButton, Button, TextField,
  alpha, Dialog, DialogContent, DialogActions,
  Skeleton, CircularProgress, Tooltip,
  List, ListItemButton, ListItemText, Collapse, LinearProgress,
  Tabs, Tab, FormControl, Select, MenuItem, InputLabel, Switch,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  DeleteForeverRounded as DeleteForeverIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  AutoAwesomeRounded as AutoAwesomeIcon,
  SaveRounded as SaveIcon,
  MenuBookRounded as MenuBookIcon,
  ArticleRounded as ArticleIcon,
  CheckCircleRounded as CheckCircleIcon,
  ArrowBackRounded as ArrowBackIcon,
  ArrowForwardRounded as ArrowForwardIcon,
  PeopleRounded as PeopleIcon,
  CloseRounded as CloseIcon,
  FactCheckRounded as FactCheckIcon,
  SchoolRounded as SchoolIcon,
  TrendingUpRounded as TrendingUpIcon,
} from '@mui/icons-material';
import { useUnidadesTematicas, useTemas, useResumenProgresoTema } from '@/hooks/useMaterial';
import QuizTema from './QuizTema';
import EditorContenidoMarkdown from './EditorContenidoMarkdown';
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

interface TemaNavItem {
  tema: Tema;
  unidad: UnidadTematica;
}

export const CursoDocente: React.FC<CursoDocenteProps> = ({
  asignacion, accent, accentDark, isDark,
}) => {
  const brand = accent;
  const brandDark = accentDark;
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
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
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const {
    unidades, isLoading: loadingUnidades, isSubmitting: submittingUnidad,
    crear: crearUnidad, actualizar: actualizarUnidad, eliminar: eliminarUnidad,
  } = useUnidadesTematicas({ grado_materia_id: asignacion.grado_materia_id, activo: true });

  const [unidadExpandida, setUnidadExpandida] = useState<number | null>(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState<Tema | null>(null);
  const [unidadDelTema, setUnidadDelTema] = useState<UnidadTematica | null>(null);

  // Lista plana para navegación prev/next
  const [temasPorUnidad, setTemasPorUnidad] = useState<Record<number, Tema[]>>({});

  const handleTemaEliminado = (temaId: number) => {
    if (temaSeleccionado?.id === temaId) {
      setTemaSeleccionado(null);
      setUnidadDelTema(null);
    }
  };

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

  // ── Dialog: Crear / Editar Unidad (Estilo NuevoHorarioModal) ──
  const [dlgUnidad, setDlgUnidad] = useState(false);
  const [unidadEdit, setUnidadEdit] = useState<UnidadTematica | null>(null);
  const [formUnidad, setFormUnidad] = useState({
    numero_unidad: 1, titulo: '', descripcion: '', objetivos: '',
  });

  const abrirNuevaUnidad = () => {
    setUnidadEdit(null);
    const siguienteNum = unidades.length > 0
      ? Math.max(...unidades.map(u => u.numero_unidad)) + 1
      : 1;
    setFormUnidad({ numero_unidad: siguienteNum, titulo: '', descripcion: '', objetivos: '' });
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
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 3,
      alignItems: { xs: 'stretch', md: 'flex-start' },
    }}>
      {/* ── BARRA LATERAL: ESTRUCTURA DEL CURSO ── */}
      <Box sx={{
        width: { xs: '100%', md: 340 },
        flexShrink: 0,
        borderRadius: '18px',
        border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: { xs: 'static', md: 'sticky' },
        top: 24,
      }}>
        {/* Header lateral con estilo de Tareas */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          bgcolor: isDark ? alpha(brand, 0.06) : alpha(brand, 0.03),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '9px',
              bgcolor: alpha(brand, 0.12),
              border: `1px solid ${alpha(brand, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MenuBookIcon sx={{ fontSize: 17, color: brand }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                Unidades del Curso
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 600 }}>
                {unidades.length} {unidades.length === 1 ? 'unidad' : 'unidades'} registradas
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Crear nueva unidad">
            <Button
              size="small"
              onClick={abrirNuevaUnidad}
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                py: 0.5,
                px: 1.2,
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                color: isDark ? '#000' : '#fff',
                boxShadow: `0 2px 8px ${alpha(brand, 0.3)}`,
                '&:hover': { opacity: 0.9 },
              }}
            >
              Unidad
            </Button>
          </Tooltip>
        </Box>

        {/* Lista de unidades */}
        {loadingUnidades ? (
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: '12px' }} />
            ))}
          </Box>
        ) : unidades.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: alpha(brand, 0.3), mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 1.5 }}>
              No hay unidades temáticas aún.
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={abrirNuevaUnidad}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                color: isDark ? '#000' : '#fff',
                px: 2,
              }}
            >
              Crear primera unidad
            </Button>
          </Box>
        ) : (
          <List disablePadding sx={{
            maxHeight: { xs: 380, md: 'calc(100vh - 220px)' },
            overflowY: 'auto',
            p: 1.2,
          }}>
            {unidades.map(u => (
              <UnidadItem
                key={u.id}
                unidad={u}
                accent={brand}
                accentDark={brandDark}
                isDark={isDark}
                expandida={unidadExpandida === u.id}
                onToggle={() => setUnidadExpandida(prev => prev === u.id ? null : u.id)}
                onEditarUnidad={() => abrirEditarUnidad(u)}
                onEliminarUnidad={() => setDlgEliminarUnidad(u)}
                temaSeleccionadoId={temaSeleccionado?.id ?? null}
                onSelectTema={(t) => seleccionarTema(t, u)}
                onTemasChange={(temas) => setTemasPorUnidad(prev => ({ ...prev, [u.id]: temas }))}
                onTemaEliminado={handleTemaEliminado}
              />
            ))}
          </List>
        )}
      </Box>

      {/* ── PANEL PRINCIPAL: TRABAJO CON EL TEMA ── */}
      <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
        {temaSeleccionado && unidadDelTema ? (
          <EditorTema
            key={temaSeleccionado.id}
            tema={temaSeleccionado}
            unidad={unidadDelTema}
            accent={brand}
            accentDark={brandDark}
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
            textAlign: 'center',
            py: 12,
            px: 3,
            borderRadius: '18px',
            border: `1.5px dashed ${alpha(brand, 0.25)}`,
            bgcolor: isDark ? alpha(brand, 0.02) : alpha(brand, 0.015),
          }}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '16px',
              bgcolor: alpha(brand, 0.1),
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              mb: 2,
            }}>
              <ArticleIcon sx={{ fontSize: 32, color: brand }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.8 }}>
              Selecciona un tema para comenzar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', fontSize: '0.85rem' }}>
              Elige un tema del panel de la izquierda para redactar la lección en Markdown, generar contenido con IA, gestionar cuestionarios interactivos o consultar el avance de tus estudiantes.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: CREAR / EDITAR UNIDAD (ESTILO NUEVOHORARIOMODAL)                  */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dlgUnidad}
        onClose={() => setDlgUnidad(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* Header estilo NuevoHorarioModal */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: brandDim,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(brand, 0.8),
                  mb: 0.4,
                }}
              >
                PLAN DE ESTUDIOS · GESTIÓN DE TEMARIO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: alpha(brand, 0.15),
                    border: `1px solid ${alpha(brand, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <MenuBookIcon sx={{ color: brand, fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                  {unidadEdit ? 'Editar unidad temática' : 'Nueva unidad temática'}
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => setDlgUnidad(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* Formulario */}
        <DialogContent sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Título de la unidad *"
            fullWidth
            size="small"
            autoFocus
            value={formUnidad.titulo}
            onChange={e => setFormUnidad(p => ({ ...p, titulo: e.target.value }))}
            placeholder="Ejemplo: Unidad 1: Álgebra y Ecuaciones Lineales"
            sx={fieldSx}
          />
          <TextField
            label="Descripción general"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={formUnidad.descripcion}
            onChange={e => setFormUnidad(p => ({ ...p, descripcion: e.target.value }))}
            placeholder="Breve resumen de lo que comprende esta unidad temática..."
            sx={fieldSx}
          />
          <TextField
            label="Objetivos de aprendizaje"
            fullWidth
            size="small"
            multiline
            rows={2}
            placeholder="¿Qué destrezas o competencias logrará el estudiante al finalizar?"
            value={formUnidad.objetivos}
            onChange={e => setFormUnidad(p => ({ ...p, objetivos: e.target.value }))}
            sx={fieldSx}
          />
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}`, gap: 1 }}>
          <Button
            onClick={() => setDlgUnidad(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'text.secondary',
              borderColor: borderField,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarUnidad}
            variant="contained"
            disabled={submittingUnidad || !formUnidad.titulo.trim()}
            endIcon={submittingUnidad ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(brand, 0.3)}`,
              px: 2.5,
            }}
          >
            {submittingUnidad ? 'Guardando…' : 'Guardar unidad'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: CONFIRMAR ELIMINAR UNIDAD                                        */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!dlgEliminarUnidad}
        onClose={() => setDlgEliminarUnidad(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${alpha('#dc2626', 0.3)}`,
            boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          },
        }}
      >
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#dc2626',
                  mb: 0.4,
                }}
              >
                CONFIRMAR ELIMINACIÓN
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: alpha('#dc2626', 0.15),
                    border: `1px solid ${alpha('#dc2626', 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <DeleteForeverIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1, color: 'text.primary' }}>
                  ¿Eliminar unidad?
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => setDlgEliminarUnidad(null)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                '&:hover': { color: '#dc2626' },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
            Se desactivará la unidad <strong>"{dlgEliminarUnidad?.titulo}"</strong> y sus temas dejarán de mostrarse para los alumnos matriculados.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}`, gap: 1 }}>
          <Button
            onClick={() => setDlgEliminarUnidad(null)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!dlgEliminarUnidad) return;
              const unidadId = dlgEliminarUnidad.id;
              const ok = await eliminarUnidad(unidadId);
              if (ok) {
                if (unidadExpandida === unidadId) setUnidadExpandida(null);
                if (unidadDelTema?.id === unidadId) {
                  setTemaSeleccionado(null);
                  setUnidadDelTema(null);
                }
                setTemasPorUnidad(prev => {
                  const copy = { ...prev };
                  delete copy[unidadId];
                  return copy;
                });
              }
              setDlgEliminarUnidad(null);
            }}
            variant="contained"
            color="error"
            disabled={submittingUnidad}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem' }}
          >
            {submittingUnidad ? 'Eliminando…' : 'Sí, eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════════
// UnidadItem — fila estilizada al estilo Tareas/Calificaciones
// ══════════════════════════════════════════════════════════════════════════════════
const UnidadItem: React.FC<{
  unidad: UnidadTematica;
  accent: string;
  accentDark: string;
  isDark: boolean;
  expandida: boolean;
  onToggle: () => void;
  onEditarUnidad: () => void;
  onEliminarUnidad: () => void;
  temaSeleccionadoId: number | null;
  onSelectTema: (t: Tema) => void;
  onTemasChange: (temas: Tema[]) => void;
  onTemaEliminado?: (temaId: number) => void;
}> = ({
  unidad, accent, accentDark, isDark, expandida, onToggle, onEditarUnidad, onEliminarUnidad,
  temaSeleccionadoId, onSelectTema, onTemasChange, onTemaEliminado,
}) => {
  const brand = accent;
  const brandDark = accentDark;
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
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
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const {
    temas, isLoading, isSubmitting,
    crear: crearTema, eliminar: eliminarTema,
  } = useTemas({ unidad_tematica_id: unidad.id, activo: true });

  React.useEffect(() => { onTemasChange(temas); }, [temas]);

  const [dlgTema, setDlgTema] = useState(false);
  const [dlgEliminarTema, setDlgEliminarTema] = useState<Tema | null>(null);
  const [formTema, setFormTema] = useState({ titulo: '', nivel_dificultad: '' as NivelDificultad | '' });

  const guardarTema = async () => {
    if (!formTema.titulo.trim()) return;
    const siguienteNum = temas.length > 0
      ? Math.max(...temas.map(t => t.numero_tema)) + 1
      : 1;
    const ok = await crearTema({
      unidad_tematica_id: unidad.id,
      numero_tema: siguienteNum,
      titulo: formTema.titulo,
      nivel_dificultad: formTema.nivel_dificultad || undefined,
    });
    if (ok) setDlgTema(false);
  };

  return (
    <Box sx={{
      mb: 1,
      borderRadius: '14px',
      border: `1px solid ${expandida ? alpha(brand, 0.3) : isDark ? alpha('#fff', 0.05) : alpha('#000', 0.06)}`,
      bgcolor: expandida
        ? (isDark ? alpha(brand, 0.04) : alpha(brand, 0.02))
        : (isDark ? alpha('#fff', 0.015) : '#fafafa'),
      transition: 'all 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* ── Fila de Unidad ── */}
      <ListItemButton
        onClick={onToggle}
        sx={{
          py: 1.2,
          px: 1.8,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          '&:hover': { bgcolor: alpha(brand, 0.06) },
        }}
      >
        <Box sx={{
          width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
          background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
          color: isDark ? '#000' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.74rem', fontWeight: 900,
        }}>
          {unidad.numero_unidad}
        </Box>

        <ListItemText
          primary={unidad.titulo}
          primaryTypographyProps={{
            fontSize: '0.82rem',
            fontWeight: 700,
            noWrap: true,
            color: 'text.primary',
          }}
          secondary={`${unidad.total_temas ?? temas.length} ${(unidad.total_temas ?? temas.length) === 1 ? 'tema' : 'temas'}`}
          secondaryTypographyProps={{ fontSize: '0.66rem', fontWeight: 600, color: 'text.secondary' }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
          <Tooltip title="Editar unidad">
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onEditarUnidad(); }}
              sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: brand, bgcolor: alpha(brand, 0.1) } }}
            >
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar unidad">
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onEliminarUnidad(); }}
              sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.1) } }}
            >
              <DeleteIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ color: 'text.disabled', display: 'flex', ml: 0.3 }}>
            {expandida ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
          </Box>
        </Box>
      </ListItemButton>

      {/* ── Temas anidados ── */}
      <Collapse in={expandida} timeout="auto">
        <Box sx={{
          px: 1.5,
          py: 1,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.04) : alpha('#000', 0.05)}`,
          bgcolor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.015)',
        }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={34} sx={{ borderRadius: '10px' }} />
          ) : (
            <>
              {temas.map(t => {
                const isSelected = temaSeleccionadoId === t.id;
                return (
                  <Box
                    key={t.id}
                    sx={{
                      position: 'relative',
                      mb: 0.6,
                      borderRadius: '10px',
                      border: `1px solid ${isSelected ? alpha(brand, 0.4) : 'transparent'}`,
                      bgcolor: isSelected ? alpha(brand, 0.12) : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? alpha(brand, 0.15) : alpha(brand, 0.06),
                        '& .del-btn': { opacity: 1 },
                      },
                    }}
                  >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => onSelectTema(t)}
                      sx={{
                        borderRadius: '9px',
                        py: 0.75,
                        px: 1.2,
                        pr: 3.5,
                        '&.Mui-selected': { bgcolor: 'transparent' },
                        '&.Mui-selected:hover': { bgcolor: 'transparent' },
                      }}
                    >
                      <ListItemText
                        primary={`${unidad.numero_unidad}.${t.numero_tema} ${t.titulo}`}
                        primaryTypographyProps={{
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 800 : 500,
                          noWrap: true,
                          color: isSelected ? brand : 'text.primary',
                        }}
                      />
                      {t.contenido && (
                        <Tooltip title="Tiene contenido redactado">
                          <CheckCircleIcon sx={{ fontSize: 13, color: '#16a34a', flexShrink: 0, ml: 0.5 }} />
                        </Tooltip>
                      )}
                    </ListItemButton>

                    <IconButton
                      size="small"
                      className="del-btn"
                      onClick={e => { e.stopPropagation(); setDlgEliminarTema(t); }}
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        p: 0.4,
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        color: 'text.secondary',
                        '&:hover': { color: '#dc2626' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                );
              })}

              <Button
                fullWidth
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={() => { setFormTema({ titulo: '', nivel_dificultad: '' }); setDlgTema(true); }}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  color: brand,
                  mt: 0.8,
                  py: 0.6,
                  border: `1px dashed ${alpha(brand, 0.35)}`,
                  '&:hover': { bgcolor: alpha(brand, 0.08), borderColor: brand },
                }}
              >
                Agregar tema a Unidad {unidad.numero_unidad}
              </Button>
            </>
          )}
        </Box>
      </Collapse>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: NUEVO TEMA (ESTILO NUEVOHORARIOMODAL)                            */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dlgTema}
        onClose={() => setDlgTema(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${brandBorder}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${borderField}`,
          background: brandDim,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(brand, 0.8),
                  mb: 0.4,
                }}
              >
                UNIDAD {unidad.numero_unidad} · NUEVO TEMA
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: alpha(brand, 0.15),
                    border: `1px solid ${alpha(brand, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ArticleIcon sx={{ color: brand, fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Crear tema de estudio
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => setDlgTema(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderField}`,
                color: 'text.secondary',
                '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Título del tema *"
            fullWidth
            size="small"
            autoFocus
            value={formTema.titulo}
            onChange={e => setFormTema(p => ({ ...p, titulo: e.target.value }))}
            placeholder="Ejemplo: Resolución de sistemas por determinantes"
            sx={fieldSx}
          />

          <TextField
            select
            label="Nivel de dificultad"
            fullWidth
            size="small"
            value={formTema.nivel_dificultad}
            onChange={e => setFormTema(p => ({ ...p, nivel_dificultad: e.target.value as NivelDificultad }))}
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              displayEmpty: true,
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: bgModal,
                    border: `1px solid ${borderField}`,
                    borderRadius: '14px',
                    boxShadow: isDark
                      ? '0 12px 32px rgba(0,0,0,0.6)'
                      : '0 12px 32px rgba(0,0,0,0.12)',
                  },
                },
              },
            }}
            sx={fieldSx}
          >
            <MenuItem value="">
              <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Sin especificar
              </Box>
            </MenuItem>
            {NIVELES_DIFICULTAD.map(n => (
              <MenuItem key={n.value} value={n.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: n.color,
                      flexShrink: 0,
                    }}
                  />
                  <span>{n.label}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderField}`, gap: 1 }}>
          <Button
            onClick={() => setDlgTema(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarTema}
            variant="contained"
            disabled={isSubmitting || !formTema.titulo.trim()}
            endIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(brand, 0.3)}`,
              px: 2.5,
            }}
          >
            {isSubmitting ? 'Creando…' : 'Crear tema'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: CONFIRMAR ELIMINAR TEMA                                          */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!dlgEliminarTema}
        onClose={() => setDlgEliminarTema(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: bgModal,
            border: `1.5px solid ${alpha('#dc2626', 0.35)}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(220,38,38,0.08), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.2)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          background: isDark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '13px', flexShrink: 0,
              background: alpha('#dc2626', 0.15),
              border: `1.5px solid ${alpha('#dc2626', 0.35)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DeleteForeverIcon sx={{ color: '#dc2626', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#dc2626', mb: 0.2,
              }}>
                GESTIÓN DE TEMARIO · ELIMINAR
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.15, color: 'text.primary' }}>
                ¿Eliminar este tema?
              </Typography>
            </Box>
          </Box>
          <Box
            onClick={() => setDlgEliminarTema(null)}
            sx={{
              width: 30, height: 30, borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'text.secondary',
              '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.08) },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nombre del tema destacado */}
          <Box sx={{
            p: 2, borderRadius: '12px',
            bgcolor: isDark ? alpha('#dc2626', 0.08) : alpha('#dc2626', 0.04),
            border: `1px solid ${alpha('#dc2626', 0.2)}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <ArticleIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0, opacity: 0.8 }} />
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}>
              {dlgEliminarTema?.titulo}
            </Typography>
          </Box>

          {/* Mensaje de impacto */}
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.7 }}>
            Al eliminar este tema se desactivará junto con todo su contenido — lección, cuestionario y materiales asociados — y dejará de ser visible para los estudiantes matriculados.
          </Typography>

          {/* Warning box */}
          <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1.2,
            p: 1.6, borderRadius: '10px',
            bgcolor: isDark ? alpha('#f59e0b', 0.08) : alpha('#f59e0b', 0.06),
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
          }}>
            <Typography sx={{ fontSize: '0.9rem', flexShrink: 0, mt: 0.1 }}>⚠️</Typography>
            <Typography sx={{ fontSize: '0.76rem', color: isDark ? '#fcd34d' : '#92400e', lineHeight: 1.5 }}>
              Esta acción <strong>no se puede deshacer</strong>. El progreso registrado de los estudiantes en este tema se perderá.
            </Typography>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`,
          gap: 1,
        }}>
          <Button
            onClick={() => setDlgEliminarTema(null)}
            variant="outlined"
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
              color: 'text.secondary',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!dlgEliminarTema) return;
              const temaId = dlgEliminarTema.id;
              const ok = await eliminarTema(temaId);
              if (ok) {
                onTemaEliminado?.(temaId);
              }
              setDlgEliminarTema(null);
            }}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <DeleteForeverIcon sx={{ fontSize: 17 }} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
              boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
              px: 2.5,
            }}
          >
            {isSubmitting ? 'Eliminando…' : 'Sí, eliminar tema'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════════
// EditorTema — Espacio de trabajo con PESTAÑAS (Lección, Quiz, Progreso)
// ══════════════════════════════════════════════════════════════════════════════════
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

  // Pestaña activa del tema: 'leccion' | 'quiz' | 'progreso'
  const [tabTema, setTabTema] = useState<'leccion' | 'quiz' | 'progreso'>('leccion');

  // Estado del modal de generación personalizada con Gemini IA
  const [modalIAAbierto, setModalIAAbierto] = useState(false);
  const [instruccionesDocente, setInstruccionesDocente] = useState('');
  const [enfoque, setEnfoque] = useState<'equilibrado' | 'practico' | 'paso_a_paso' | 'teorico' | 'resumido'>('equilibrado');
  const [tono, setTono] = useState<'didactico' | 'academico' | 'motivador'>('didactico');
  const [incluirEjemplos, setIncluirEjemplos] = useState(true);
  const [incluirEjercicios, setIncluirEjercicios] = useState(true);
  const [incluirGlosario, setIncluirGlosario] = useState(false);
  // Secciones estructurales (habilitadas por defecto)
  const [incluirIntroduccion, setIncluirIntroduccion] = useState(true);
  const [incluirConceptosClave, setIncluirConceptosClave] = useState(true);
  const [incluirDesarrollo, setIncluirDesarrollo] = useState(true);
  const [incluirResumen, setIncluirResumen] = useState(true);
  // Secciones personalizadas
  const [seccionesPersonalizadas, setSeccionesPersonalizadas] = useState<string[]>([]);
  const [nuevaSeccion, setNuevaSeccion] = useState('');
  // Mensajes rotativos del overlay de carga
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const IA_LOADING_MSGS = [
    'Analizando el contexto del tema…',
    'Estructurando la lección con Gemini IA…',
    'Redactando la introducción…',
    'Desarrollando los conceptos clave…',
    'Elaborando ejemplos y ejercicios…',
    'Revisando coherencia pedagógica…',
    'Aplicando el enfoque y tono seleccionados…',
    'Finalizando y puliendo el contenido…',
  ];

  React.useEffect(() => {
    if (!generando) { setLoadingMsgIdx(0); return; }
    const interval = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % IA_LOADING_MSGS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [generando]);

  const nivelInfo = NIVELES_DIFICULTAD.find(n => n.value === tema.nivel_dificultad);

  const handleEjecutarGeneracionIA = async () => {
    const res = await generarContenido(tema.id, {
      forzar: true,
      instruccionesDocente: instruccionesDocente.trim() || undefined,
      enfoque,
      tono,
      incluirEjemplos,
      incluirEjercicios,
      incluirGlosario,
      incluirIntroduccion,
      incluirConceptosClave,
      incluirDesarrollo,
      incluirResumen,
      seccionesPersonalizadas: seccionesPersonalizadas.length > 0 ? seccionesPersonalizadas : undefined,
    });
    if (res?.tema) {
      setContenido(res.tema.contenido ?? '');
      onTemaActualizado(res.tema);
      setModoEdicion(false);
      setModalIAAbierto(false);
    }
  };

  const handleGuardar = async () => {
    const ok = await actualizar(tema.id, { contenido });
    if (ok) {
      onTemaActualizado({ ...tema, contenido });
      setModoEdicion(false);
    }
  };

  const pctCompletados = resumen && resumen.total_estudiantes > 0
    ? Math.round((resumen.completados / resumen.total_estudiantes) * 100)
    : 0;

  return (
    <Box sx={{
      borderRadius: '18px',
      overflow: 'hidden',
      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
      bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
    }}>
      {/* ── HEADER DEL TEMA (Idéntico al estilo de tarjetas de Notas/Tareas) ── */}
      <Box sx={{
        px: { xs: 2.5, sm: 3.5 },
        pt: 3,
        pb: 2.5,
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        bgcolor: isDark ? alpha(accent, 0.05) : alpha(accent, 0.025),
      }}>
        {/* Eyebrow */}
        <Typography sx={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: accent,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          mb: 0.8,
        }}>
          Unidad {unidad.numero_unidad}: {unidad.titulo} · Tema {tema.numero_tema}
        </Typography>

        {/* Título + Botones de Acción */}
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Typography variant="h5" sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              color: 'text.primary',
            }}>
              {tema.titulo}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {nivelInfo && (
                <Chip
                  label={nivelInfo.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    bgcolor: nivelInfo.bgColor,
                    color: nivelInfo.color,
                  }}
                />
              )}
              {tema.descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  {tema.descripcion}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Botones de acción de la lección */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {tabTema === 'leccion' && (
              <>
                {modoEdicion ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setContenido(tema.contenido ?? '');
                        setModoEdicion(false);
                      }}
                      disabled={isSubmitting}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                      onClick={handleGuardar}
                      disabled={isSubmitting || !tieneCambios}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                        color: isDark ? '#000' : '#fff',
                        boxShadow: `0 4px 12px ${alpha(accent, 0.3)}`,
                      }}
                    >
                      {isSubmitting ? 'Guardando…' : 'Guardar lección'}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setModoEdicion(true)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      borderColor: alpha(accent, 0.4),
                      color: accent,
                      '&:hover': { bgcolor: alpha(accent, 0.08), borderColor: accent },
                    }}
                  >
                    Editar lección
                  </Button>
                )}

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={generando
                    ? <CircularProgress size={14} color="inherit" />
                    : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setModalIAAbierto(true)}
                  disabled={generando}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    borderColor: alpha('#a855f7', 0.4),
                    color: '#a855f7',
                    '&:hover': { bgcolor: alpha('#a855f7', 0.08), borderColor: '#a855f7' },
                  }}
                >
                  {generando ? 'Generando…' : tema.contenido ? 'Regenerar con IA' : 'Generar con IA'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* ── PESTAÑAS DE VISTA DEL TEMA (LECCIÓN, CUESTIONARIO, PROGRESO) ── */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          mt: 2.5,
          pt: 1.5,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          flexWrap: 'wrap',
        }}>
          {[
            { key: 'leccion', label: 'Lección de estudio', icon: <MenuBookIcon sx={{ fontSize: 17 }} /> },
            { key: 'quiz', label: 'Cuestionario (Quiz)', icon: <FactCheckIcon sx={{ fontSize: 17 }} /> },
            { key: 'progreso', label: `Progreso alumnos (${pctCompletados}%)`, icon: <TrendingUpIcon sx={{ fontSize: 17 }} /> },
          ].map(tab => {
            const isActive = tabTema === tab.key;
            return (
              <Box
                key={tab.key}
                onClick={() => setTabTema(tab.key as any)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 2,
                  py: 0.8,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  color: isActive ? (isDark ? '#000' : '#fff') : 'text.secondary',
                  bgcolor: isActive ? accent : 'transparent',
                  boxShadow: isActive ? `0 2px 10px ${alpha(accent, 0.3)}` : 'none',
                  '&:hover': !isActive ? { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04) } : {},
                }}
              >
                {tab.icon}
                {tab.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── CUERPO SEGÚN PESTAÑA ACTIVA ── */}
      <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* PESTAÑA 1: LECCIÓN */}
        {tabTema === 'leccion' && (
          <Box>
            {modoEdicion ? (
              <EditorContenidoMarkdown
                value={contenido}
                onChange={setContenido}
                accent={accent}
                accentDark={accentDark}
                isDark={isDark}
                minRows={14}
                placeholder="Escribe o edita el contenido didáctico de la lección con la barra de herramientas, o usa 'Generar con IA' para un borrador estructurado..."
              />
            ) : contenido ? (
              <Box sx={{
                '& h1, & h2': { fontSize: '1.25rem', fontWeight: 800, mt: 3, mb: 1.5, color: 'text.primary', '&:first-of-type': { mt: 0 } },
                '& h3': { fontSize: '1.05rem', fontWeight: 700, mt: 2.5, mb: 1, color: 'text.primary' },
                '& p': { fontSize: '0.92rem', lineHeight: 1.8, color: 'text.secondary', mb: 1.8 },
                '& ul, & ol': { pl: 3.5, mb: 2 },
                '& li': { fontSize: '0.9rem', lineHeight: 1.8, color: 'text.secondary', mb: 0.6 },
                '& strong': { color: 'text.primary', fontWeight: 800 },
                '& code': {
                  fontFamily: 'monospace', fontSize: '0.84rem', px: 0.8, py: 0.25,
                  borderRadius: '6px', bgcolor: alpha(accent, 0.12), color: accent, fontWeight: 600,
                },
                '& blockquote': {
                  borderLeft: `4px solid ${accent}`, pl: 2.5, ml: 0, my: 2.5,
                  color: 'text.secondary', fontStyle: 'italic', bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  py: 1, pr: 1.5, borderRadius: '0 8px 8px 0',
                },
                '& table': { width: '100%', borderCollapse: 'collapse', mb: 2.5, fontSize: '0.85rem' },
                '& th, & td': {
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                  p: '8px 12px',
                },
                '& th': { bgcolor: alpha(accent, 0.08), fontWeight: 800, color: 'text.primary' },
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido}</ReactMarkdown>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AutoAwesomeIcon sx={{ fontSize: 44, color: alpha('#a855f7', 0.5), mb: 1.5 }} />
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.6 }}>
                  Este tema aún no tiene contenido didáctico
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3, fontSize: '0.86rem', lineHeight: 1.6 }}>
                  Puedes pulsar en <strong>"Generar con Gemini IA"</strong> para especificar qué aspectos debe tener la lección y dejar que la IA la redacte, o presionar <strong>"Redactar manualmente"</strong> para escribirla tú mismo.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon sx={{ fontSize: 17 }} />}
                    onClick={() => setModalIAAbierto(true)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(168,85,247,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #9333ea, #4f46e5)',
                      },
                    }}
                  >
                    Generar con Gemini IA
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setModoEdicion(true)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      color: accent,
                      borderColor: accent,
                    }}
                  >
                    Redactar manualmente
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* PESTAÑA 2: CUESTIONARIO / QUIZ */}
        {tabTema === 'quiz' && (
          <Box>
            <QuizTema
              tema_id={tema.id}
              paralelo_id={paralelo_id}
              periodo_academico_id={periodo_academico_id}
              accent={accent}
              accentDark={accentDark}
              isDark={isDark}
            />
          </Box>
        )}

        {/* PESTAÑA 3: PROGRESO DE ESTUDIANTES */}
        {tabTema === 'progreso' && (
          <Box sx={{
            p: 3,
            borderRadius: '14px',
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fafafa',
            border: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          }}>
            {loadingResumen ? (
              <Skeleton variant="rounded" height={80} sx={{ borderRadius: '10px' }} />
            ) : resumen ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 18, color: accent }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: 'text.primary' }}>
                      Avance de los alumnos en este tema
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: accent }}>
                    {resumen.completados} de {resumen.total_estudiantes} completados · {pctCompletados}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={pctCompletados}
                  sx={{
                    height: 8,
                    borderRadius: '4px',
                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '4px',
                      background: `linear-gradient(90deg, ${accent}, ${accentDark})`,
                    },
                    mb: 2.5,
                  }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                  {[
                    { label: 'Completados', val: resumen.completados, color: '#16a34a' },
                    { label: 'En progreso', val: resumen.en_progreso, color: accent },
                    { label: 'Revisando', val: resumen.revisando, color: '#d97706' },
                    { label: 'Sin iniciar', val: resumen.no_iniciado, color: '#6b7280' },
                  ].map(s => (
                    <Box key={s.label} sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      bgcolor: isDark ? alpha(s.color, 0.08) : alpha(s.color, 0.05),
                      border: `1px solid ${alpha(s.color, 0.2)}`,
                    }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', mb: 0.3 }}>
                        {s.label}
                      </Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: s.color }}>
                        {s.val}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', textAlign: 'center' }}>
                No hay datos de progreso registrados aún para este curso.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ── NAVEGACIÓN PREV / NEXT ENTRE TEMAS ── */}
      {(temaPrevio || temaSiguiente) && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2.5, sm: 3.5 },
          py: 2,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
          bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01),
        }}>
          {temaPrevio ? (
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              onClick={() => onNavegar(temaPrevio)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: 'text.secondary',
                px: 2,
                py: 1,
                maxWidth: '45%',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                '&:hover': { borderColor: alpha(accent, 0.4), color: accent, bgcolor: alpha(accent, 0.04) },
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase' }}>
                  Tema anterior
                </Typography>
                <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                  {temaPrevio.unidad.numero_unidad}.{temaPrevio.tema.numero_tema} {temaPrevio.tema.titulo}
                </Typography>
              </Box>
            </Button>
          ) : <Box />}

          {temaSiguiente ? (
            <Button
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => onNavegar(temaSiguiente)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: 'text.secondary',
                px: 2,
                py: 1,
                maxWidth: '45%',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                '&:hover': { borderColor: alpha(accent, 0.4), color: accent, bgcolor: alpha(accent, 0.04) },
              }}
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase' }}>
                  Tema siguiente
                </Typography>
                <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                  {temaSiguiente.unidad.numero_unidad}.{temaSiguiente.tema.numero_tema} {temaSiguiente.tema.titulo}
                </Typography>
              </Box>
            </Button>
          ) : <Box />}
        </Box>
      )}

      {/* ── MODAL GENERAR CON GEMINI IA (Estilo idéntico a NuevoHorarioModal) ── */}
      <Dialog
        open={modalIAAbierto}
        onClose={() => !generando && setModalIAAbierto(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            position: 'relative',
            background: isDark ? '#09101d' : '#ffffff',
            border: `1.5px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.22)'}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(168,85,247,0.1), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* Header estilo NuevoHorarioModal */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
          background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#a855f7',
                mb: 0.4,
              }}>
                Gemini IA · Generador de Lección Didáctica
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  background: alpha('#a855f7', 0.15),
                  border: `1px solid ${alpha('#a855f7', 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AutoAwesomeIcon sx={{ color: '#a855f7', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, color: 'text.primary' }}>
                    {tema.contenido ? 'Regenerar y personalizar lección' : 'Personalizar contenido con Gemini IA'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.3 }}>
                    Unidad {unidad.numero_unidad}: {unidad.titulo} · Tema {tema.numero_tema}: <strong>{tema.titulo}</strong>
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              onClick={() => !generando && setModalIAAbierto(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: generando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': !generando ? {
                  background: alpha('#a855f7', 0.12),
                  borderColor: alpha('#a855f7', 0.4),
                  color: '#a855f7',
                } : {},
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* Contenido / Parámetros */}
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* ── Overlay de carga ── */}
          {generando && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                bgcolor: isDark ? 'rgba(9,16,29,0.88)' : 'rgba(255,255,255,0.88)',
                '@keyframes pulse-ring': {
                  '0%':   { transform: 'scale(0.85)', opacity: 0.7 },
                  '50%':  { transform: 'scale(1.15)', opacity: 0.2 },
                  '100%': { transform: 'scale(0.85)', opacity: 0.7 },
                },
                '@keyframes spin-slow': {
                  from: { transform: 'rotate(0deg)' },
                  to:   { transform: 'rotate(360deg)' },
                },
                '@keyframes fade-in-up': {
                  from: { opacity: 0, transform: 'translateY(6px)' },
                  to:   { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {/* Orb central animado */}
              <Box sx={{ position: 'relative', width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Anillos de pulso */}
                {[1, 2, 3].map(n => (
                  <Box key={n} sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `2px solid ${alpha('#a855f7', 0.35 / n)}`,
                    animation: `pulse-ring ${1.4 + n * 0.5}s ease-in-out ${n * 0.18}s infinite`,
                  }} />
                ))}
                {/* Círculo giratorio exterior */}
                <Box sx={{
                  position: 'absolute',
                  inset: 6,
                  borderRadius: '50%',
                  border: '2px solid transparent',
                  borderTopColor: '#a855f7',
                  borderRightColor: alpha('#6366f1', 0.5),
                  animation: 'spin-slow 1.1s linear infinite',
                }} />
                {/* Núcleo */}
                <Box sx={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 28px rgba(168,85,247,0.55)',
                }}>
                  <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 26 }} />
                </Box>
              </Box>

              {/* Texto principal */}
              <Box sx={{ textAlign: 'center', maxWidth: 340, px: 2 }}>
                <Typography sx={{
                  fontWeight: 800, fontSize: '1.05rem', color: 'text.primary',
                  mb: 0.8, letterSpacing: '-0.01em',
                }}>
                  Gemini está generando tu lección
                </Typography>
                <Typography
                  key={loadingMsgIdx}
                  sx={{
                    fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.5,
                    animation: 'fade-in-up 0.4s ease both',
                  }}
                >
                  {IA_LOADING_MSGS[loadingMsgIdx]}
                </Typography>
              </Box>

              {/* Barra de progreso indeterminada */}
              <Box sx={{
                width: 220, height: 4, borderRadius: '99px',
                bgcolor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07),
                overflow: 'hidden',
                '@keyframes loading-bar': {
                  '0%':   { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(250%)' },
                },
              }}>
                <Box sx={{
                  width: '40%', height: '100%', borderRadius: '99px',
                  background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                  animation: 'loading-bar 1.6s ease-in-out infinite',
                }} />
              </Box>

              <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', fontStyle: 'italic' }}>
                Esto puede tardar entre 10 y 30 segundos…
              </Typography>
            </Box>
          )}
          <Box sx={{
            p: 1.8,
            borderRadius: '14px',
            bgcolor: isDark ? alpha('#a855f7', 0.08) : alpha('#a855f7', 0.04),
            border: `1px solid ${alpha('#a855f7', 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <AutoAwesomeIcon sx={{ color: '#a855f7', fontSize: 24, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.5 }}>
              Define los aspectos pedagógicos e instrucciones que Gemini <strong>deberá incluir obligatoriamente</strong>. La IA estructurará la lección en formato didáctico con ejemplos y ejercicios adaptados a tus indicaciones.
            </Typography>
          </Box>

          {/* Campo principal: Instrucciones del Docente */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: 'text.primary' }}>
                ¿Qué aspectos específicos o requerimientos debe tener la lección?
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                Indicaciones directas para Gemini
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              placeholder="Ej: Incluir un cuadro comparativo, añadir una analogía con la vida cotidiana en Bolivia, explicar paso a paso advirtiendo sobre errores comunes, y finalizar con 3 preguntas de reflexión..."
              value={instruccionesDocente}
              onChange={(e) => setInstruccionesDocente(e.target.value)}
              disabled={generando}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                    borderRadius: '14px',
                  },
                  '&:hover fieldset': { borderColor: alpha('#a855f7', 0.5) },
                  '&.Mui-focused fieldset': {
                    borderColor: '#a855f7',
                    borderWidth: '1.5px',
                    borderRadius: '14px',
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha('#a855f7', 0.12)}`,
                    borderRadius: '14px',
                  },
                },
                '& .MuiInputLabel-root': { color: 'text.secondary' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#a855f7' },
              }}
            />

            {/* Chips de sugerencias rápidas para el docente */}
            <Box sx={{ mt: 1.2, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, mr: 0.3 }}>
                Sugerencias rápidas:
              </Typography>
              {[
                'Incluir cuadro comparativo explicativo',
                'Añadir analogía con la vida cotidiana',
                'Enfocar en ejemplos de la realidad boliviana',
                'Incluir 3 preguntas de reflexión al final',
                'Explicar paso a paso advirtiendo errores comunes',
                'Explicación sencilla adaptada a secundaria',
              ].map((sug, i) => (
                <Chip
                  key={i}
                  label={`+ ${sug}`}
                  size="small"
                  clickable={!generando}
                  onClick={() => {
                    if (generando) return;
                    setInstruccionesDocente(prev => {
                      const clean = prev.trim();
                      if (!clean) return sug;
                      if (clean.endsWith('.') || clean.endsWith(',')) return `${clean} ${sug}.`;
                      return `${clean}, ${sug}.`;
                    });
                  }}
                  sx={{
                    fontSize: '0.7rem',
                    height: 24,
                    borderRadius: '8px',
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha('#a855f7', 0.12),
                      borderColor: alpha('#a855f7', 0.4),
                      color: '#a855f7',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Grid de Enfoque y Tono */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                '&:hover fieldset': { borderColor: alpha('#a855f7', 0.5) },
                '&.Mui-focused fieldset': { borderColor: '#a855f7', borderWidth: '1.5px', borderRadius: '14px' },
                '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha('#a855f7', 0.12)}`, borderRadius: '14px' },
              },
              '& .MuiInputLabel-root': { color: 'text.secondary' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#a855f7' },
              '& .MuiSelect-select': { borderRadius: '14px !important' },
              '& .MuiOutlinedInput-notchedOutline': { borderRadius: '14px !important' },
            }}>
              <InputLabel id="enfoque-label">Enfoque pedagógico</InputLabel>
              <Select
                labelId="enfoque-label"
                label="Enfoque pedagógico"
                value={enfoque}
                onChange={(e) => setEnfoque(e.target.value as any)}
                disabled={generando}
              >
                <MenuItem value="equilibrado">⚖️ Equilibrado (Teoría + Ejemplos)</MenuItem>
                <MenuItem value="practico">🛠️ Práctico y Aplicado (Casos reales)</MenuItem>
                <MenuItem value="paso_a_paso">🪜 Didáctico paso a paso (Gradual)</MenuItem>
                <MenuItem value="teorico">📚 Conceptual y Riguroso (Académico)</MenuItem>
                <MenuItem value="resumido">⚡ Síntesis y Puntos Clave</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', borderRadius: '14px' },
                '&:hover fieldset': { borderColor: alpha('#a855f7', 0.5) },
                '&.Mui-focused fieldset': { borderColor: '#a855f7', borderWidth: '1.5px', borderRadius: '14px' },
                '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha('#a855f7', 0.12)}`, borderRadius: '14px' },
              },
              '& .MuiInputLabel-root': { color: 'text.secondary' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#a855f7' },
              '& .MuiSelect-select': { borderRadius: '14px !important' },
              '& .MuiOutlinedInput-notchedOutline': { borderRadius: '14px !important' },
            }}>
              <InputLabel id="tono-label">Tono didáctico</InputLabel>
              <Select
                labelId="tono-label"
                label="Tono didáctico"
                value={tono}
                onChange={(e) => setTono(e.target.value as any)}
                disabled={generando}
              >
                <MenuItem value="didactico">🎒 Cercano y didáctico (Colegio)</MenuItem>
                <MenuItem value="academico">🎓 Formal y riguroso</MenuItem>
                <MenuItem value="motivador">🚀 Dinámico y motivador</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* ── Secciones estructurales ── */}
          <Box sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Estructura de la lección
              </Typography>
              <Typography
                component="span"
                onClick={() => {
                  const allOn = incluirIntroduccion && incluirConceptosClave && incluirDesarrollo && incluirResumen;
                  setIncluirIntroduccion(!allOn);
                  setIncluirConceptosClave(!allOn);
                  setIncluirDesarrollo(!allOn);
                  setIncluirResumen(!allOn);
                }}
                sx={{
                  fontSize: '0.68rem', fontWeight: 700, color: '#a855f7', cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {incluirIntroduccion && incluirConceptosClave && incluirDesarrollo && incluirResumen ? 'Desactivar todas' : 'Activar todas'}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
              {([
                { label: 'Introducción', sub: 'Contexto y motivación', value: incluirIntroduccion, set: setIncluirIntroduccion },
                { label: 'Conceptos Clave', sub: 'Ideas esenciales', value: incluirConceptosClave, set: setIncluirConceptosClave },
                { label: 'Desarrollo', sub: 'Explicación principal', value: incluirDesarrollo, set: setIncluirDesarrollo },
                { label: 'Resumen', sub: 'Síntesis final', value: incluirResumen, set: setIncluirResumen },
              ] as const).map(({ label, sub, value, set }) => (
                <Box
                  key={label}
                  onClick={() => !generando && set(!value)}
                  sx={{
                    display: 'flex', flexDirection: 'column', gap: 0.4,
                    p: 1.2, borderRadius: '10px', cursor: generando ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    bgcolor: value
                      ? (isDark ? alpha('#a855f7', 0.12) : alpha('#a855f7', 0.06))
                      : (isDark ? alpha('#fff', 0.03) : '#fff'),
                    border: `1px solid ${value ? alpha('#a855f7', 0.4) : (isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08))}`,
                    '&:hover': generando ? {} : {
                      bgcolor: value
                        ? (isDark ? alpha('#a855f7', 0.18) : alpha('#a855f7', 0.1))
                        : (isDark ? alpha('#fff', 0.06) : alpha('#000', 0.03)),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: value ? '#a855f7' : 'text.primary', lineHeight: 1.2 }}>
                      {label}
                    </Typography>
                    <Box sx={{
                      width: 14, height: 14, borderRadius: '4px', flexShrink: 0,
                      bgcolor: value ? '#a855f7' : 'transparent',
                      border: `1.5px solid ${value ? '#a855f7' : (isDark ? alpha('#fff', 0.25) : alpha('#000', 0.2))}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {value && <Box sx={{ width: 6, height: 6, borderRadius: '2px', bgcolor: '#fff' }} />}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.63rem', color: 'text.secondary', lineHeight: 1.3 }}>{sub}</Typography>
                </Box>
              ))}
            </Box>

            {/* Input para agregar secciones personalizadas */}
            <Box sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
                Agregar sección personalizada
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  component="input"
                  placeholder='Ej: "Aplicaciones en la vida real"'
                  value={nuevaSeccion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNuevaSeccion(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const s = nuevaSeccion.trim();
                      if (s && !seccionesPersonalizadas.includes(s)) {
                        setSeccionesPersonalizadas(p => [...p, s]);
                        setNuevaSeccion('');
                      }
                    }
                  }}
                  disabled={generando}
                  sx={{
                    flex: 1,
                    px: 1.4, py: 0.8,
                    fontSize: '0.78rem',
                    borderRadius: '10px',
                    border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
                    bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                    color: 'inherit',
                    outline: 'none',
                    fontFamily: 'inherit',
                    '&:focus': {
                      borderColor: '#a855f7',
                      boxShadow: `0 0 0 3px ${alpha('#a855f7', 0.12)}`,
                    },
                    '&::placeholder': { color: isDark ? alpha('#fff', 0.3) : alpha('#000', 0.3) },
                  }}
                />
                <Box
                  component="button"
                  onClick={() => {
                    const s = nuevaSeccion.trim();
                    if (s && !seccionesPersonalizadas.includes(s)) {
                      setSeccionesPersonalizadas(p => [...p, s]);
                      setNuevaSeccion('');
                    }
                  }}
                  disabled={generando || !nuevaSeccion.trim()}
                  sx={{
                    px: 1.8, py: 0,
                    borderRadius: '10px',
                    border: `1px solid ${alpha('#a855f7', 0.4)}`,
                    bgcolor: alpha('#a855f7', 0.1),
                    color: '#a855f7',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    '&:hover:not(:disabled)': { bgcolor: alpha('#a855f7', 0.2), borderColor: '#a855f7' },
                    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
                  }}
                >
                  + Añadir
                </Box>
              </Box>

              {seccionesPersonalizadas.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {seccionesPersonalizadas.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.6,
                        px: 1.2, py: 0.45,
                        borderRadius: '8px',
                        bgcolor: isDark ? alpha('#a855f7', 0.14) : alpha('#a855f7', 0.08),
                        border: `1px solid ${alpha('#a855f7', 0.35)}`,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#a855f7' }}>
                        {s}
                      </Typography>
                      <Box
                        component="span"
                        onClick={() => !generando && setSeccionesPersonalizadas(p => p.filter((_, j) => j !== i))}
                        sx={{
                          fontSize: '0.7rem', color: '#a855f7', cursor: 'pointer', lineHeight: 1,
                          opacity: 0.7, '&:hover': { opacity: 1 },
                        }}
                      >
                        ✕
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Componentes a incluir */}
          <Box sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              Subsecciones opcionales
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.2,
                px: 1.5,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              }}>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                    Ejemplos prácticos
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                    Casos ilustrativos
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={incluirEjemplos}
                  onChange={(e) => setIncluirEjemplos(e.target.checked)}
                  disabled={generando}
                  sx={{ '& .Mui-checked': { color: '#a855f7' }, '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#a855f7' } }}
                />
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.2,
                px: 1.5,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              }}>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                    Ejercicios y retos
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                    Para reflexionar
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={incluirEjercicios}
                  onChange={(e) => setIncluirEjercicios(e.target.checked)}
                  disabled={generando}
                  sx={{ '& .Mui-checked': { color: '#a855f7' }, '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#a855f7' } }}
                />
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.2,
                px: 1.5,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
              }}>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                    Glosario clave
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                    Términos y conceptos
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={incluirGlosario}
                  onChange={(e) => setIncluirGlosario(e.target.checked)}
                  disabled={generando}
                  sx={{ '& .Mui-checked': { color: '#a855f7' }, '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#a855f7' } }}
                />
              </Box>
            </Box>
          </Box>

          {tema.contenido && (
            <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontStyle: 'italic', px: 0.5 }}>
              💡 <strong>Nota:</strong> Este tema ya cuenta con una lección previa. Al generar, el borrador se actualizará con el nuevo contenido personalizado para que puedas revisarlo antes de confirmar el guardado final.
            </Typography>
          )}
        </DialogContent>

        {/* Footer / Botones */}
        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Button
            variant="outlined"
            onClick={() => setModalIAAbierto(false)}
            disabled={generando}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'text.secondary',
              borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleEjecutarGeneracionIA}
            disabled={generando}
            startIcon={generando ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(168,85,247,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #9333ea, #4f46e5)',
                boxShadow: '0 6px 20px rgba(168,85,247,0.45)',
              },
            }}
          >
            {generando ? 'Redactando lección con Gemini IA…' : 'Generar lección personalizada'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CursoDocente;