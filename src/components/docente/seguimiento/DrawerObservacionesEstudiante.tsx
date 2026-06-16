'use client';
// components/docente/seguimiento/DrawerObservacionesEstudiante.tsx
// Convertido de Drawer a Dialog — mismos tokens brand/brandDim/brandBorder que NuevoHorarioModal.
// Funcionalidad 100% intacta.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Stack, Chip, IconButton, Button,
  Divider, Avatar, Tooltip, CircularProgress, Alert,
  ToggleButton, ToggleButtonGroup, useTheme, alpha,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Collapse, List, ListItemButton, ListItemText,
  Card, CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { keyframes } from '@mui/system';

import {
  useLineaTiempo,
  useCatalogoObservacion,
  useCrearObservacion,
  useCambiarVisibilidad,
} from '@/hooks/useSeguimientoPedagogico';
import {
  ResumenEstudianteAsignacion,
  LineaTiempoItem,
  NivelRelevancia,
  PlantillaObservacion,
  getNivelRelevancia,
  NIVELES_RELEVANCIA,
  CrearObservacionDTO,
} from '@/types/seguimientoPedagogicoTypes';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────
// CHIP de nivel
// ─────────────────────────────────────

const NivelChip: React.FC<{ nivel: NivelRelevancia }> = ({ nivel }) => {
  const meta = getNivelRelevancia(nivel);
  const Icon = nivel === 'urgente' ? ErrorIcon : nivel === 'requiere_atencion' ? WarningIcon : InfoIcon;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ fontSize: '12px !important', color: `${meta.color} !important` }} />}
      label={meta.label}
      sx={{ bgcolor: meta.bgColor, color: meta.color, fontWeight: 700, fontSize: '0.68rem', height: 22 }}
    />
  );
};

// ─────────────────────────────────────
// ITEM de línea de tiempo
// ─────────────────────────────────────

interface LineaTiempoItemCardProps {
  item: LineaTiempoItem;
  onToggleVisibilidad: (id: number, visible: boolean) => Promise<boolean>;
  isSubmitting: boolean;
  brand: string;
}

const LineaTiempoItemCard: React.FC<LineaTiempoItemCardProps> = ({
  item, onToggleVisibilidad, isSubmitting, brand,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fecha = new Date(item.fecha_ocurrencia + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        border: `1px solid ${item.nivel_relevancia === 'urgente'
            ? alpha('#dc2626', 0.35)
            : item.nivel_relevancia === 'requiere_atencion'
              ? alpha('#d97706', 0.3)
              : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)
          }`,
        mb: 1.5,
        animation: `${fadeIn} 0.3s ease-out`,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
      }}
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        {/* Cabecera */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={item.categoria_nombre}
              sx={{
                bgcolor: item.categoria_color ? alpha(item.categoria_color, 0.12) : alpha('#000', 0.06),
                color: item.categoria_color ?? 'text.primary',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
            <NivelChip nivel={item.nivel_relevancia} />
          </Stack>

          <Tooltip title={item.visible_para_padre ? 'Ocultar al padre' : 'Publicar al padre'}>
            <IconButton
              size="small"
              disabled={isSubmitting}
              onClick={() => onToggleVisibilidad(item.observacion_id, !item.visible_para_padre)}
              sx={{
                width: 26, height: 26,
                color: item.visible_para_padre ? '#16a34a' : 'text.disabled',
                '&:hover': {
                  bgcolor: item.visible_para_padre ? alpha('#16a34a', 0.1) : alpha('#000', 0.05),
                },
              }}
            >
              {item.visible_para_padre
                ? <VisibilityIcon sx={{ fontSize: 14 }} />
                : <VisibilityOffIcon sx={{ fontSize: 14 }} />
              }
            </IconButton>
          </Tooltip>
        </Box>

        {/* Descripción */}
        <Typography variant="body2" sx={{ lineHeight: 1.55, mb: 1, color: 'text.primary' }}>
          {item.descripcion}
        </Typography>

        {/* Metadatos */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">{fecha}</Typography>
          </Box>

          {item.materia_nombre && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <SchoolIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">{item.materia_nombre}</Typography>
            </Box>
          )}

          {item.visible_para_padre && item.acuse_leido && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <CheckIcon sx={{ fontSize: 11, color: '#16a34a' }} />
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>Leído</Typography>
            </Box>
          )}

          {item.visible_para_padre && !item.acuse_leido && (
            <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 600 }}>
              Pendiente de lectura
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────
// FORMULARIO nueva observación
// ─────────────────────────────────────

interface FormNuevaObsProps {
  matriculaId: number;
  asignacionId: number;
  periodoId: number;
  onExito: () => void;
  onCancelar: () => void;
  brand: string;
  brandDim: string;
  brandBorder: string;
  fieldSx: object;
}

const FormNuevaObservacion: React.FC<FormNuevaObsProps> = ({
  matriculaId, asignacionId, periodoId, onExito, onCancelar,
  brand, brandDim, brandBorder, fieldSx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { categorias, plantillasPorCategoria, isLoading: loadingCatalogo } = useCatalogoObservacion();
  const { crear, isSubmitting } = useCrearObservacion(onExito);

  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [nivelRelevancia, setNivelRelevancia] = useState<NivelRelevancia>('informativo');
  const [descripcion, setDescripcion] = useState('');
  const [fechaOcurrencia, setFechaOcurrencia] = useState(new Date().toISOString().split('T')[0]);
  const [visiblePadre, setVisiblePadre] = useState(false);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [plantillaId, setPlantillaId] = useState<number | undefined>();

  const plantillas = categoriaId ? plantillasPorCategoria(categoriaId as number) : [];

  const handlePlantilla = (p: PlantillaObservacion) => {
    setDescripcion(p.texto);
    setNivelRelevancia(p.nivel_relevancia);
    setPlantillaId(p.id);
    setMostrarPlantillas(false);
  };

  const valido = !!(categoriaId && descripcion.trim());

  const handleGuardar = async () => {
    if (!valido) return;
    await crear({
      matricula_id: matriculaId,
      asignacion_docente_id: asignacionId,
      periodo_academico_id: periodoId,
      categoria_observacion_id: categoriaId as number,
      nivel_relevancia: nivelRelevancia,
      descripcion: descripcion.trim(),
      fecha_ocurrencia: fechaOcurrencia,
      visible_para_padre: visiblePadre,
      plantilla_id: plantillaId,
    });
  };

  return (
    <Stack spacing={2}>
      {/* Categoría */}
      <FormControl fullWidth size="small" required sx={fieldSx}>
        <InputLabel>Categoría</InputLabel>
        <Select
          label="Categoría"
          value={categoriaId}
          onChange={e => { setCategoriaId(e.target.value as number); setMostrarPlantillas(false); }}
          disabled={loadingCatalogo}
        >
          {categorias.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0 }} />
                {cat.nombre}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Plantillas rápidas */}
      {categoriaId !== '' && plantillas.length > 0 && (
        <Box>
          <Button
            size="small"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setMostrarPlantillas(v => !v)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: brand,
              mb: 0.5,
            }}
          >
            {mostrarPlantillas ? 'Ocultar plantillas' : 'Usar plantilla rápida'}
          </Button>
          <Collapse in={mostrarPlantillas}>
            <Card variant="outlined" sx={{ borderRadius: '10px', maxHeight: 160, overflow: 'auto', border: `1px solid ${brandBorder}` }}>
              <List dense disablePadding>
                {plantillas.map(p => {
                  const meta = getNivelRelevancia(p.nivel_relevancia);
                  return (
                    <ListItemButton
                      key={p.id}
                      onClick={() => handlePlantilla(p)}
                      sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}
                    >
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.color, mr: 1.5, flexShrink: 0 }} />
                      <ListItemText
                        primary={p.texto}
                        primaryTypographyProps={{ variant: 'caption', lineHeight: 1.5 }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Card>
          </Collapse>
        </Box>
      )}

      {/* Descripción */}
      <TextField
        label="Observación"
        multiline
        minRows={3}
        maxRows={5}
        required
        fullWidth
        size="small"
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
        placeholder="Describí la situación con detalle..."
        sx={fieldSx}
      />

      {/* Nivel de relevancia */}
      <Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
          Nivel de relevancia
        </Typography>
        <ToggleButtonGroup
          exclusive fullWidth size="small"
          value={nivelRelevancia}
          onChange={(_, v) => v && setNivelRelevancia(v)}
        >
          {NIVELES_RELEVANCIA.map(n => (
            <ToggleButton
              key={n.value}
              value={n.value}
              sx={{
                borderRadius: '8px !important',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.72rem',
                py: 0.75,
                '&.Mui-selected': {
                  bgcolor: n.bgColor,
                  color: n.color,
                  border: `1.5px solid ${n.color} !important`,
                },
              }}
            >
              {n.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Fecha */}
      <TextField
        label="Fecha del hecho"
        type="date"
        size="small"
        fullWidth
        value={fechaOcurrencia}
        onChange={e => setFechaOcurrencia(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: new Date().toISOString().split('T')[0] }}
        sx={fieldSx}
      />

      {/* Visibilidad */}
      <Card
        variant="outlined"
        onClick={() => setVisiblePadre(v => !v)}
        sx={{
          borderRadius: '10px',
          cursor: 'pointer',
          border: visiblePadre ? '1.5px solid #16a34a' : `1px solid ${alpha('#16a34a', 0.2)}`,
          bgcolor: visiblePadre ? alpha('#16a34a', 0.05) : 'transparent',
          p: 1.5,
          transition: 'all 0.2s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
              {visiblePadre ? 'Visible para el padre' : 'Nota interna'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {visiblePadre
                ? 'El padre verá esta observación en su panel.'
                : 'Solo el equipo docente puede verla.'}
            </Typography>
          </Box>
          {visiblePadre
            ? <VisibilityIcon sx={{ color: '#16a34a', fontSize: 20 }} />
            : <VisibilityOffIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
          }
        </Box>
      </Card>

      {/* Acciones */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button
          variant="outlined"
          size="small"
          onClick={onCancelar}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            borderColor: alpha(brand, 0.4),
            color: brand,
            '&:hover': { borderColor: brand, bgcolor: alpha(brand, 0.06) },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!valido || isSubmitting}
          onClick={handleGuardar}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            background: brand,
            color: useTheme().palette.mode === 'dark' ? '#000' : '#fff',
            boxShadow: valido ? `0 4px 16px ${alpha(brand, 0.4)}` : 'none',
            '&:hover': { boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
            '&.Mui-disabled': { opacity: 0.35, background: brand, color: useTheme().palette.mode === 'dark' ? '#000' : '#fff' },
          }}
        >
          {isSubmitting
            ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />Guardando...</>
            : 'Guardar observación'
          }
        </Button>
      </Stack>
    </Stack>
  );
};

// ─────────────────────────────────────
// MODAL PRINCIPAL
// ─────────────────────────────────────

interface DrawerObservacionesEstudianteProps {
  open: boolean;
  estudiante: ResumenEstudianteAsignacion | null;
  asignacionId: number;
  periodoId: number;
  onClose: () => void;
}

const DrawerObservacionesEstudiante: React.FC<DrawerObservacionesEstudianteProps> = ({
  open, estudiante, asignacionId, periodoId, onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── tokens (mismo sistema que NuevoHorarioModal) ──
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.10)' : 'rgba(2,136,209,0.08)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.22)' : 'rgba(2,136,209,0.22)';
  const bgModal = isDark ? '#09101d' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroNivel, setFiltroNivel] = useState<NivelRelevancia | 'todos'>('todos');

  const { observaciones, isLoading, conteos, cargar, refrescar } = useLineaTiempo();
  const { publicar, ocultar, isSubmitting: submittingVis } = useCambiarVisibilidad(refrescar);

  useEffect(() => {
    if (open && estudiante) {
      cargar({ matricula_id: estudiante.matricula_id, periodo_academico_id: periodoId });
      setMostrarFormulario(false);
      setFiltroNivel('todos');
    }
  }, [open, estudiante?.matricula_id]);

  const observacionesFiltradas = filtroNivel === 'todos'
    ? observaciones
    : observaciones.filter(o => o.nivel_relevancia === filtroNivel);

  const handleToggleVisibilidad = useCallback(async (id: number, visible: boolean) => {
    return visible ? publicar(id) : ocultar(id);
  }, [publicar, ocultar]);

  const iniciales = estudiante
    ? `${estudiante.estudiante_nombres.charAt(0)}${estudiante.estudiante_apellidos.charAt(0)}`
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px ${alpha(brand, 0.06)}, 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >

      {/* ── HEADER ── */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        borderBottom: `1px solid ${borderField}`,
        background: brandDim,
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Avatar con iniciales */}
            <Avatar
              sx={{
                width: 46, height: 46,
                background: alpha(brand, 0.18),
                border: `1.5px solid ${alpha(brand, 0.35)}`,
                color: brand,
                fontWeight: 800,
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              {iniciales}
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(brand, 0.7),
                  mb: 0.3,
                }}
              >
                Seguimiento Pedagógico
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.15, color: 'text.primary' }}>
                {estudiante?.estudiante_apellidos}, {estudiante?.estudiante_nombres}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {estudiante?.estudiante_codigo}
              </Typography>
            </Box>
          </Box>

          {/* Botón cerrar */}
          <Box
            onClick={onClose}
            sx={{
              width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderField}`,
              color: 'text.secondary',
              transition: 'all 0.15s',
              flexShrink: 0,
              '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Chips de conteo */}
        <Stack direction="row" spacing={0.75} sx={{ mt: 1.75 }} flexWrap="wrap" useFlexGap>
          {conteos.urgentes > 0 && (
            <Chip size="small" label={`${conteos.urgentes} urgentes`}
              sx={{ bgcolor: alpha('#dc2626', 0.12), color: '#dc2626', border: `1px solid ${alpha('#dc2626', 0.25)}`, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
          )}
          {conteos.requieren_atencion > 0 && (
            <Chip size="small" label={`${conteos.requieren_atencion} atención`}
              sx={{ bgcolor: alpha('#d97706', 0.12), color: '#d97706', border: `1px solid ${alpha('#d97706', 0.25)}`, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
          )}
          {conteos.no_leidos > 0 && (
            <Chip size="small" label={`${conteos.no_leidos} sin leer`}
              sx={{ bgcolor: alpha('#7c3aed', 0.12), color: '#7c3aed', border: `1px solid ${alpha('#7c3aed', 0.25)}`, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
          )}
          {conteos.total === 0 && (
            <Chip size="small" label="Sin observaciones"
              sx={{ bgcolor: alpha(brand, 0.08), color: alpha(brand, 0.8), border: `1px solid ${alpha(brand, 0.2)}`, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
          )}
        </Stack>
      </Box>

      {/* ── BODY (2 columnas en md+) ── */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >

        {/* Columna izquierda: formulario o botón */}
        <Box
          sx={{
            width: { xs: '100%', md: 320 },
            flexShrink: 0,
            borderRight: { md: `1px solid ${borderField}` },
            borderBottom: { xs: `1px solid ${borderField}`, md: 'none' },
            overflow: 'auto',
            p: 2.5,
          }}
        >
          {!mostrarFormulario ? (
            <Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setMostrarFormulario(true)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.25,
                  background: brand,
                  color: isDark ? '#000' : '#fff',
                  boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(brand, 0.5)}`,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Nueva Observación
              </Button>

              {/* Info rápida del estudiante */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: alpha(brand, 0.6),
                    mb: 1.5,
                  }}
                >
                  Resumen
                </Typography>

                {[
                  { label: 'Total observaciones', val: conteos.total },
                  { label: 'Urgentes', val: conteos.urgentes, color: '#dc2626' },
                  { label: 'Requieren atención', val: conteos.requieren_atencion, color: '#d97706' },
                  { label: 'Informativos', val: conteos.informativos },
                  { label: 'Sin leer por el padre', val: conteos.no_leidos, color: '#7c3aed' },
                ].map(({ label, val, color }) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.9,
                      borderBottom: `1px solid ${borderField}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: color ?? 'text.primary' }}
                    >
                      {val}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '8px',
                    background: alpha(brand, 0.15),
                    border: `1px solid ${alpha(brand, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <AddIcon sx={{ color: brand, fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: brand }}>
                  Nueva observación
                </Typography>
              </Box>

              {estudiante && (
                <FormNuevaObservacion
                  matriculaId={estudiante.matricula_id}
                  asignacionId={asignacionId}
                  periodoId={periodoId}
                  onExito={() => {
                    setMostrarFormulario(false);
                    refrescar();
                  }}
                  onCancelar={() => setMostrarFormulario(false)}
                  brand={brand}
                  brandDim={brandDim}
                  brandBorder={brandBorder}
                  fieldSx={fieldSx}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Columna derecha: historial */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Divider sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.6),
              }}
            >
              Historial de observaciones
            </Typography>
          </Divider>

          {/* Filtros de nivel */}
          {conteos.total > 0 && (
            <Stack direction="row" spacing={0.75} mb={2} flexWrap="wrap" useFlexGap>
              {(['todos', 'urgente', 'requiere_atencion', 'informativo'] as const).map(n => {
                const meta = n !== 'todos' ? getNivelRelevancia(n) : null;
                const count = n === 'todos' ? conteos.total
                  : n === 'urgente' ? conteos.urgentes
                    : n === 'requiere_atencion' ? conteos.requieren_atencion
                      : conteos.informativos;
                return (
                  <Chip
                    key={n}
                    size="small"
                    clickable
                    label={`${n === 'todos' ? 'Todos' : meta!.label} (${count})`}
                    onClick={() => setFiltroNivel(n)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      bgcolor: filtroNivel === n
                        ? meta ? meta.bgColor : alpha(brand, 0.12)
                        : 'transparent',
                      color: filtroNivel === n
                        ? meta ? meta.color : brand
                        : 'text.secondary',
                      border: '1px solid',
                      borderColor: filtroNivel === n
                        ? meta ? meta.color : brand
                        : borderField,
                      transition: 'all 0.15s',
                    }}
                  />
                );
              })}
            </Stack>
          )}

          {/* Lista */}
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: brand }} />
            </Box>
          ) : observacionesFiltradas.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: '12px',
                background: alpha(brand, 0.06),
                color: brand,
                border: `1px solid ${alpha(brand, 0.2)}`,
                '& .MuiAlert-icon': { color: brand },
              }}
            >
              {conteos.total === 0
                ? 'Este estudiante no tiene observaciones registradas aún.'
                : 'No hay observaciones con este filtro.'}
            </Alert>
          ) : (
            observacionesFiltradas.map(item => (
              <LineaTiempoItemCard
                key={item.observacion_id}
                item={item}
                onToggleVisibilidad={handleToggleVisibilidad}
                isSubmitting={submittingVis}
                brand={brand}
              />
            ))
          )}
        </Box>
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box
        sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${borderField}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexShrink: 0,
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.disabled" sx={{ mr: 'auto' }}>
          {conteos.total} observación{conteos.total !== 1 ? 'es' : ''} en total
        </Typography>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            border: `1px solid ${borderField}`,
            px: 2.5,
            '&:hover': { borderColor: alpha(brand, 0.4), color: brand, bgcolor: alpha(brand, 0.06) },
          }}
        >
          Cerrar
        </Button>
      </Box>
    </Dialog>
  );
};

export default DrawerObservacionesEstudiante;