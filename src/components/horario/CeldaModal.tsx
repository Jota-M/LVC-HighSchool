// components/horario/CeldaModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Grid, FormControl,
  InputLabel, Select, MenuItem, TextField,
  CircularProgress, Alert, Divider, Chip,
  IconButton, Tooltip, alpha, useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  MenuBook as MateriaIcon,
  MeetingRoom as AulaIcon,
  Palette as ColorIcon,
} from '@mui/icons-material';
import { useGradoMaterias, useAsignaciones, useHorarioCeldas } from '@/hooks/useHorario';
import { COLORES_MATERIA, DIAS_SEMANA, HorarioDetalle } from '@/types/horariotypes';

interface CeldaTarget {
  dia_semana: number;
  bloque_horario_id: number;
  bloque_nombre: string;
  hora_inicio: string;
  hora_fin: string;
  existing?: HorarioDetalle;
}

interface Props {
  open: boolean;
  onClose: () => void;
  target: CeldaTarget | null;
  horarioId: number;
  gradoId: number;
  paraleloId: number;
  periodoId: number;
  readonly?: boolean;
}

interface FormData {
  grado_materia_id: number | '';
  asignacion_docente_id: number | '' | null;
  aula: string;
  color: string;
  observaciones: string;
}

const EMPTY_FORM: FormData = {
  grado_materia_id: '',
  asignacion_docente_id: '',
  aula: '',
  color: '',
  observaciones: '',
};

export const CeldaModal: React.FC<Props> = ({
  open, onClose, target, horarioId, gradoId, paraleloId, periodoId, readonly = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { gradoMaterias, isLoading: loadingMaterias } = useGradoMaterias(gradoId);
  const { asignaciones, isLoading: loadingAsig } = useAsignaciones(
    paraleloId,
    periodoId,
    form.grado_materia_id ? Number(form.grado_materia_id) : null
  );
  const { agregar, actualizar, eliminar, isAgregando, isActualizando, isEliminando, isBusy } =
    useHorarioCeldas(horarioId);

  const isEditing = !!target?.existing;

  // Inicializar form con datos existentes al abrir
  useEffect(() => {
    if (!open) { setForm(EMPTY_FORM); setConfirmDelete(false); return; }
    if (target?.existing) {
      const e = target.existing;
      setForm({
        grado_materia_id: e.grado_materia_id,
        asignacion_docente_id: e.asignacion_docente_id ?? '',
        aula: e.aula ?? '',
        color: e.color ?? '',
        observaciones: e.observaciones ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, target]);

  // Resetear docente al cambiar materia
  const handleMateria = (val: number | '') => {
    setForm((p) => ({ ...p, grado_materia_id: val, asignacion_docente_id: '' }));
  };

  const handleSubmit = async () => {
    if (!form.grado_materia_id || !target) return;
    const payload = {
      grado_materia_id: Number(form.grado_materia_id),
      asignacion_docente_id: form.asignacion_docente_id ? Number(form.asignacion_docente_id) : null,
      aula: form.aula || undefined,
      color: form.color || undefined,
      observaciones: form.observaciones || undefined,
    };
    if (isEditing && target.existing) {
      await actualizar({ detId: target.existing.id, payload });
    } else {
      await agregar({
        ...payload,
        dia_semana: target.dia_semana,
        bloque_horario_id: target.bloque_horario_id,
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!target?.existing) return;
    await eliminar(target.existing.id);
    onClose();
  };

  const accentColor = isDark ? '#facc15' : '#0288d1';

  // Materia seleccionada para mostrar preview
  const materiaSeleccionada = Array.isArray(gradoMaterias)
  ? gradoMaterias.find((gm) => gm.id === form.grado_materia_id)
  : null;
  const colorPreview = form.color || materiaSeleccionada?.materia_color || accentColor;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box
        sx={{
          background: isEditing
            ? `linear-gradient(135deg, ${colorPreview}dd, ${colorPreview}99)`
            : isDark
            ? 'linear-gradient(135deg,#facc15,#f59e0b)'
            : 'linear-gradient(135deg,#0288d1,#01579b)',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 3px #0004' }}>
              {isEditing ? (readonly ? 'Ver Celda' : 'Editar Celda') : 'Asignar Clase'}
            </Typography>
            {target && (
              <Typography variant="caption" sx={{ color: '#ffffffcc' }}>
                {DIAS_SEMANA[target.dia_semana]} · {target.bloque_nombre} ({target.hora_inicio.slice(0, 5)} – {target.hora_fin.slice(0, 5)})
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {loadingMaterias ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2.5}>

            {/* Materia */}
            <Grid size ={{xs:12}}>
              <FormControl fullWidth required disabled={readonly}>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MateriaIcon sx={{ fontSize: 16 }} /> Materia
                  </Box>
                </InputLabel>
                <Select
                  value={form.grado_materia_id}
                  onChange={(e) => handleMateria(e.target.value as number | '')}
                  label="  Materia"
                  renderValue={(val) => {
                    const m = Array.isArray(gradoMaterias)
                        ? gradoMaterias.find((gm) => gm.id === val) 
                        : null;
                    return m ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: m.materia_color || accentColor, flexShrink: 0 }} />
                        {m.materia_nombre}
                      </Box>
                    ) : '';
                  }}
                >
                  {Array.isArray(gradoMaterias) &&
                    gradoMaterias.map((gm) => (
                    <MenuItem key={gm.id} value={gm.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: gm.materia_color || accentColor, flexShrink: 0 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{gm.materia_nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">{gm.materia_codigo}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Docente */}
            <Grid size ={{xs:12}}>
              <FormControl fullWidth disabled={!form.grado_materia_id || readonly}>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 16 }} /> Docente (opcional)
                  </Box>
                </InputLabel>
                <Select
                  value={form.asignacion_docente_id}
                  onChange={(e) => setForm((p) => ({ ...p, asignacion_docente_id: e.target.value as number | '' }))}
                  label="  Docente (opcional)"
                >
                  <MenuItem value=""><em>Sin asignar</em></MenuItem>
                  {loadingAsig ? (
                    <MenuItem disabled><CircularProgress size={16} sx={{ mr: 1 }} /> Cargando...</MenuItem>
                  ) : (
                    asignaciones.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: alpha(accentColor, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PersonIcon sx={{ fontSize: 16, color: accentColor }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {a.docente_apellidos}, {a.docente_nombres}
                            </Typography>
                            {a.es_titular && (
                              <Chip label="Titular" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha(accentColor, 0.1), color: accentColor }} />
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {form.grado_materia_id && asignaciones.length === 0 && !loadingAsig && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                  No hay docentes asignados a esta materia en este paralelo
                </Typography>
              )}
            </Grid>

            <Grid size ={{xs:12}}>
              <Divider sx={{ my: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Opcionales</Typography>
              </Divider>
            </Grid>

            {/* Aula */}
            <Grid size ={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Aula"
                placeholder="Ej: Lab-01, Aula 3B"
                value={form.aula}
                onChange={(e) => setForm((p) => ({ ...p, aula: e.target.value }))}
                disabled={readonly}
                InputProps={{ startAdornment: <AulaIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
              />
            </Grid>

            {/* Color */}
            <Grid size ={{xs:12, sm:6}}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <ColorIcon sx={{ fontSize: 14, mr: 0.5 }} /> Color de celda
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {/* Sin color */}
                <Tooltip title="Color de la materia">
                  <Box
                    onClick={() => !readonly && setForm((p) => ({ ...p, color: '' }))}
                    sx={{
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: materiaSeleccionada?.materia_color || alpha(accentColor, 0.3),
                      cursor: readonly ? 'default' : 'pointer',
                      border: !form.color ? `3px solid ${accentColor}` : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  />
                </Tooltip>
                {COLORES_MATERIA.map((c) => (
                  <Box
                    key={c}
                    onClick={() => !readonly && setForm((p) => ({ ...p, color: c }))}
                    sx={{
                      width: 28, height: 28, borderRadius: '50%', bgcolor: c,
                      cursor: readonly ? 'default' : 'pointer',
                      border: form.color === c ? `3px solid ${isDark ? '#fff' : '#000'}` : '2px solid transparent',
                      transition: 'all 0.15s',
                      '&:hover': { transform: readonly ? 'none' : 'scale(1.2)' },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Observaciones */}
            <Grid size ={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observaciones"
                value={form.observaciones}
                onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
                disabled={readonly}
              />
            </Grid>

            {/* Confirm delete */}
            {confirmDelete && (
              <Grid size ={{xs:12}}>
                <Alert
                  severity="warning"
                  sx={{ borderRadius: 2 }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" color="inherit" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                        disabled={isEliminando}
                      >
                        {isEliminando ? 'Eliminando...' : 'Confirmar'}
                      </Button>
                    </Box>
                  }
                >
                  ¿Eliminar esta celda del horario?
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      {!readonly && (
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {isEditing && !confirmDelete && (
            <Tooltip title="Quitar esta clase del horario">
              <IconButton onClick={() => setConfirmDelete(true)} color="error" disabled={isBusy}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} color="inherit" disabled={isBusy} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!form.grado_materia_id || isBusy}
            onClick={handleSubmit}
            startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}
          >
            {isBusy ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Asignar'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};