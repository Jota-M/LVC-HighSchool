'use client';
// components/docente/seguimiento/DrawerObservacionesEstudiante.tsx
// Drawer lateral que muestra la línea de tiempo de un estudiante
// y permite registrar una nueva observación.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, Typography, Stack, Chip, IconButton, Button,
  Divider, Avatar, Tooltip, CircularProgress, Alert,
  ToggleButton, ToggleButtonGroup, useTheme, alpha,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Collapse, List, ListItemButton, ListItemText,
  Card, CardContent,
} from '@mui/material';
import CloseIcon         from '@mui/icons-material/Close';
import AddIcon           from '@mui/icons-material/Add';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ErrorIcon         from '@mui/icons-material/Error';
import WarningIcon       from '@mui/icons-material/Warning';
import InfoIcon          from '@mui/icons-material/Info';
import CheckIcon         from '@mui/icons-material/Check';
import AutoAwesomeIcon   from '@mui/icons-material/AutoAwesome';
import SchoolIcon        from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { keyframes }     from '@mui/system';

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
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
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
}

const LineaTiempoItemCard: React.FC<LineaTiempoItemCardProps> = ({
  item, onToggleVisibilidad, isSubmitting,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fecha = new Date(item.fecha_ocurrencia + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        border: `1px solid ${
          item.nivel_relevancia === 'urgente'
            ? alpha('#dc2626', 0.35)
            : item.nivel_relevancia === 'requiere_atencion'
              ? alpha('#d97706', 0.3)
              : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)
        }`,
        mb: 1.5,
        animation: `${fadeIn} 0.3s ease-out`,
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
                color:   item.categoria_color ?? 'text.primary',
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
}

const FormNuevaObservacion: React.FC<FormNuevaObsProps> = ({
  matriculaId, asignacionId, periodoId, onExito, onCancelar,
}) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { categorias, plantillasPorCategoria, isLoading: loadingCatalogo } = useCatalogoObservacion();
  const { crear, isSubmitting } = useCrearObservacion(onExito);

  const [categoriaId, setCategoriaId]             = useState<number | ''>('');
  const [nivelRelevancia, setNivelRelevancia]     = useState<NivelRelevancia>('informativo');
  const [descripcion, setDescripcion]             = useState('');
  const [fechaOcurrencia, setFechaOcurrencia]     = useState(new Date().toISOString().split('T')[0]);
  const [visiblePadre, setVisiblePadre]           = useState(false);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [plantillaId, setPlantillaId]             = useState<number | undefined>();

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
      matricula_id:             matriculaId,
      asignacion_docente_id:    asignacionId,
      periodo_academico_id:     periodoId,
      categoria_observacion_id: categoriaId as number,
      nivel_relevancia:         nivelRelevancia,
      descripcion:              descripcion.trim(),
      fecha_ocurrencia:         fechaOcurrencia,
      visible_para_padre:       visiblePadre,
      plantilla_id:             plantillaId,
    });
  };

  return (
    <Box>
      <Stack spacing={2}>
        {/* Categoría */}
        <FormControl fullWidth size="small" required>
          <InputLabel>Categoría</InputLabel>
          <Select
            label="Categoría"
            value={categoriaId}
            onChange={e => { setCategoriaId(e.target.value as number); setMostrarPlantillas(false); }}
            sx={{ borderRadius: '10px' }}
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
                color: isDark ? '#fbbf24' : '#3b82f6',
                mb: 0.5,
              }}
            >
              {mostrarPlantillas ? 'Ocultar plantillas' : 'Usar plantilla rápida'}
            </Button>
            <Collapse in={mostrarPlantillas}>
              <Card variant="outlined" sx={{ borderRadius: '10px', maxHeight: 180, overflow: 'auto' }}>
                <List dense disablePadding>
                  {plantillas.map(p => {
                    const meta = getNivelRelevancia(p.nivel_relevancia);
                    return (
                      <ListItemButton
                        key={p.id}
                        onClick={() => handlePlantilla(p)}
                        sx={{ borderRadius: '8px', mx: 0.5, my: 0.25 }}
                      >
                        <Box
                          sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            bgcolor: meta.color, mr: 1.5, flexShrink: 0,
                          }}
                        />
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
          InputProps={{ sx: { borderRadius: '10px' } }}
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
                    color:   n.color,
                    border:  `1.5px solid ${n.color} !important`,
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
          InputProps={{ sx: { borderRadius: '10px' } }}
          inputProps={{ max: new Date().toISOString().split('T')[0] }}
        />

        {/* Visibilidad */}
        <Card
          variant="outlined"
          onClick={() => setVisiblePadre(v => !v)}
          sx={{
            borderRadius: '10px',
            cursor: 'pointer',
            border: visiblePadre ? '1.5px solid #16a34a' : undefined,
            bgcolor: visiblePadre ? alpha('#16a34a', 0.05) : undefined,
            p: 1.5,
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
            variant="outlined" size="small"
            onClick={onCancelar}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained" size="small"
            disabled={!valido || isSubmitting}
            onClick={handleGuardar}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              background: isDark
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            {isSubmitting
              ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />Guardando...</>
              : 'Guardar'
            }
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// ─────────────────────────────────────
// DRAWER PRINCIPAL
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
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroNivel, setFiltroNivel]             = useState<NivelRelevancia | 'todos'>('todos');

  const { observaciones, isLoading, conteos, cargar, refrescar } = useLineaTiempo();
  const { publicar, ocultar, isSubmitting: submittingVis }       = useCambiarVisibilidad(refrescar);

  // Cargar al abrir
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 480 },
          bgcolor: isDark ? '#0f172a' : '#f8fafc',
          backgroundImage: 'none',
        },
      }}
    >
      {/* ── Header del drawer ── */}
      <Box sx={{
        p: 2.5,
        background: isDark
          ? 'linear-gradient(135deg, #1e3a5f, #1e293b)'
          : 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48, height: 48,
              bgcolor: alpha('#fff', 0.2),
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
            }}
          >
            {iniciales}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: '#fff' }}>
              {estudiante?.estudiante_apellidos}, {estudiante?.estudiante_nombres}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
              {estudiante?.estudiante_codigo}
            </Typography>
          </Box>

          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Conteos en el header */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          {conteos.urgentes > 0 && (
            <Chip size="small" label={`${conteos.urgentes} urgentes`}
              sx={{ bgcolor: alpha('#dc2626', 0.3), color: '#fca5a5', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
          {conteos.requieren_atencion > 0 && (
            <Chip size="small" label={`${conteos.requieren_atencion} atención`}
              sx={{ bgcolor: alpha('#d97706', 0.3), color: '#fde68a', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
          {conteos.no_leidos > 0 && (
            <Chip size="small" label={`${conteos.no_leidos} sin leer`}
              sx={{ bgcolor: alpha('#7c3aed', 0.3), color: '#c4b5fd', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
          {conteos.total === 0 && (
            <Chip size="small" label="Sin observaciones"
              sx={{ bgcolor: alpha('#fff', 0.1), color: alpha('#fff', 0.7), fontWeight: 700, fontSize: '0.7rem' }} />
          )}
        </Stack>
      </Box>

      {/* ── Cuerpo del drawer ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

        {/* Botón nueva observación */}
        {!mostrarFormulario && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setMostrarFormulario(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              mb: 2.5,
              py: 1.25,
              background: isDark
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: isDark ? '#000' : '#fff',
              '&:hover': { transform: 'translateY(-1px)' },
            }}
          >
            Nueva Observación
          </Button>
        )}

        {mostrarFormulario && estudiante && (
        
        <Collapse in={mostrarFormulario}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: '14px',
              mb: 2.5,
              border: isDark ? `1px solid ${alpha('#fbbf24', 0.25)}` : `1px solid ${alpha('#3b82f6', 0.25)}`,
              bgcolor: isDark ? alpha('#fbbf24', 0.04) : alpha('#3b82f6', 0.03),
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={700} mb={1.5} sx={{ color: isDark ? '#fbbf24' : '#3b82f6' }}>
                Registrar nueva observación
              </Typography>
              <FormNuevaObservacion
                matriculaId={estudiante!.matricula_id}
                asignacionId={asignacionId}
                periodoId={periodoId}
                onExito={() => {
                  setMostrarFormulario(false);
                  refrescar();
                }}
                onCancelar={() => setMostrarFormulario(false)}
              />
            </CardContent>
          </Card>
        </Collapse>
        )}

        <Divider sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.disabled" fontWeight={700}>
            HISTORIAL DE OBSERVACIONES
          </Typography>
        </Divider>

        {/* Filtros de nivel */}
        {conteos.total > 0 && (
          <Stack direction="row" spacing={0.75} mb={2} flexWrap="wrap" useFlexGap>
            {(['todos', 'urgente', 'requiere_atencion', 'informativo'] as const).map(n => {
              const meta = n !== 'todos' ? getNivelRelevancia(n) : null;
              const count = n === 'todos' ? conteos.total
                : n === 'urgente'           ? conteos.urgentes
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
                      ? meta ? meta.bgColor : (isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08))
                      : 'transparent',
                    color: filtroNivel === n
                      ? meta ? meta.color : 'text.primary'
                      : 'text.secondary',
                    border: '1px solid',
                    borderColor: filtroNivel === n
                      ? meta ? meta.color : 'text.primary'
                      : 'divider',
                  }}
                />
              );
            })}
          </Stack>
        )}

        {/* Lista de observaciones */}
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: isDark ? '#fbbf24' : '#3b82f6' }} />
          </Box>
        ) : observacionesFiltradas.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
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
            />
          ))
        )}
      </Box>
    </Drawer>
  );
};

export default DrawerObservacionesEstudiante;