'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, Button, Box, Typography, Grid,
  FormControl, Select, MenuItem, TextField,
  CircularProgress, Alert, Chip, Tooltip,
  alpha, useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  MenuBook as MateriaIcon,
  MeetingRoom as AulaIcon,
  Palette as ColorIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useGradoMaterias, useAsignaciones, useHorarioCeldas, useAsignacionTitular } from '@/hooks/useHorario';
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
    paraleloId, periodoId,
    form.grado_materia_id ? Number(form.grado_materia_id) : null
  );
  const { agregar, actualizar, eliminar, isAgregando, isActualizando, isEliminando, isBusy } =
    useHorarioCeldas(horarioId);
  const { asignacionTitular } = useAsignacionTitular(
    form.grado_materia_id ? Number(form.grado_materia_id) : null,
    paraleloId,
    periodoId
  );
  const isEditing = !!target?.existing;

  // ── tokens ────────────────────────────────────────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.09)' : 'rgba(2,136,209,0.07)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.22)' : 'rgba(2,136,209,0.22)';
  const bgModal = isDark ? '#0a0c10' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '12px';

  const materiaSeleccionada = Array.isArray(gradoMaterias)
    ? gradoMaterias.find((gm) => gm.id === Number(form.grado_materia_id))
    : null;
  const colorPreview = form.color || materiaSeleccionada?.materia_color || brand;

  // header toma el color de la materia si hay una seleccionada, sino brand
  const headerAccent = isEditing && form.color
    ? form.color
    : materiaSeleccionada?.materia_color || brand;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.10)}`, borderRadius: R },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  // ── lógica ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (asignacionTitular && !form.asignacion_docente_id) {
      setForm(p => ({ ...p, asignacion_docente_id: asignacionTitular.id }));
    }
  }, [asignacionTitular]);
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

  const handleMateria = (val: number | '') => {
    setForm(p => ({ ...p, grado_materia_id: val, asignacion_docente_id: '' }));
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
      await agregar({ ...payload, dia_semana: target.dia_semana, bloque_horario_id: target.bloque_horario_id });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!target?.existing) return;
    await eliminar(target.existing.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.04), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            {target && (
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: alpha(brand, 0.7), mb: 0.4 }}>
                {DIAS_SEMANA[target.dia_semana]} · {target.bloque_nombre} ({target.hora_inicio.slice(0, 5)} – {target.hora_fin.slice(0, 5)})
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                background: alpha(headerAccent, 0.18),
                border: `1px solid ${alpha(headerAccent, 0.35)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {readonly
                  ? <ViewIcon sx={{ color: headerAccent, fontSize: 17 }} />
                  : isEditing
                    ? <EditIcon sx={{ color: headerAccent, fontSize: 17 }} />
                    : <MateriaIcon sx={{ color: headerAccent, fontSize: 17 }} />
                }
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1, color: 'text.primary' }}>
                {isEditing ? (readonly ? 'Ver clase' : 'Editar clase') : 'Asignar clase'}
              </Typography>
            </Box>
          </Box>

          <Box onClick={onClose} sx={{
            width: 32, height: 32, borderRadius: '9px', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${borderField}`,
            color: 'text.secondary', transition: 'all 0.15s',
            '&:hover': { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
          }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* barra color materia */}
        <Box sx={{ height: 3, borderRadius: 2, background: alpha(headerAccent, 0.25) }}>
          <Box sx={{ height: 3, borderRadius: 2, width: form.grado_materia_id ? '100%' : '30%', background: headerAccent, transition: 'width 0.4s ease' }} />
        </Box>
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        {loadingMaterias ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: brand }} />
          </Box>
        ) : (
          <Grid container spacing={2}>

            {/* Materia */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required disabled={readonly} sx={fieldSx}>
                <Select
                  value={form.grado_materia_id}
                  onChange={e => handleMateria(e.target.value as number)}
                  displayEmpty
                  renderValue={(val) => {
                    const materia = Array.isArray(gradoMaterias)
                      ? gradoMaterias.find(gm => gm.id === Number(val))
                      : null;

                    return materia ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: materia.materia_color || brand,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2">
                          {materia.materia_nombre}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Materia *
                      </Typography>
                    );
                  }}
                >
                  {Array.isArray(gradoMaterias) &&
                    gradoMaterias.map(gm => (
                      <MenuItem key={gm.id} value={gm.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: gm.materia_color || brand,
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {gm.materia_nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {gm.materia_codigo}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Docente */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth disabled={!form.grado_materia_id || readonly} sx={fieldSx}>
                <Select
                  value={form.asignacion_docente_id ?? ''}
                  onChange={e => setForm(p => ({ ...p, asignacion_docente_id: e.target.value as number | '' }))}
                  displayEmpty
                  renderValue={val => {
                    if (!val) return <Typography color="text.secondary" variant="body2">Docente (opcional)</Typography>;
                    const a = asignaciones.find(a => a.id === Number(val));
                    return a ? <Typography variant="body2">{a.docente_apellidos}, {a.docente_nombres}</Typography> : '';
                  }}
                >
                  <MenuItem value=""><em>Sin asignar</em></MenuItem>
                  {loadingAsig
                    ? <MenuItem disabled><CircularProgress size={14} sx={{ mr: 1 }} />Cargando...</MenuItem>
                    : asignaciones.map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: alpha(brand, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <PersonIcon sx={{ fontSize: 15, color: brand }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{a.docente_apellidos}, {a.docente_nombres}</Typography>
                            {a.es_titular && <Chip label="Titular" size="small" sx={{ height: 15, fontSize: '0.58rem', bgcolor: alpha(brand, 0.1), color: brand }} />}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              {form.grado_materia_id && asignaciones.length === 0 && !loadingAsig && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                  No hay docentes asignados a esta materia en este paralelo
                </Typography>
              )}
            </Grid>

            {/* Separador opcionales */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1, height: '1px', background: borderField }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Opcionales</Typography>
                <Box sx={{ flex: 1, height: '1px', background: borderField }} />
              </Box>
            </Grid>

            {/* Aula */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Aula"
                placeholder="Ej: Lab-01, Aula 3B"
                value={form.aula}
                onChange={e => setForm(p => ({ ...p, aula: e.target.value }))}
                disabled={readonly}
                sx={fieldSx}
                InputProps={{ startAdornment: <AulaIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 17 }} /> }}
              />
            </Grid>

            {/* Color */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 1.5, borderRadius: R, border: `1px solid ${borderField}`, background: bgField }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                  <ColorIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Color de celda</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  <Tooltip title="Color de la materia">
                    <Box onClick={() => !readonly && setForm(p => ({ ...p, color: '' }))}
                      sx={{
                        width: 26, height: 26, borderRadius: '50%', cursor: readonly ? 'default' : 'pointer',
                        bgcolor: materiaSeleccionada?.materia_color || alpha(brand, 0.4),
                        border: !form.color ? `2.5px solid ${brand}` : `2px solid transparent`,
                        transition: 'all 0.15s', '&:hover': { transform: readonly ? 'none' : 'scale(1.15)' },
                      }}
                    />
                  </Tooltip>
                  {COLORES_MATERIA.map(c => (
                    <Box key={c} onClick={() => !readonly && setForm(p => ({ ...p, color: c }))}
                      sx={{
                        width: 26, height: 26, borderRadius: '50%', bgcolor: c,
                        cursor: readonly ? 'default' : 'pointer',
                        border: form.color === c ? `2.5px solid ${isDark ? '#fff' : '#111'}` : '2px solid transparent',
                        transition: 'all 0.15s', '&:hover': { transform: readonly ? 'none' : 'scale(1.15)' },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Observaciones */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth multiline rows={2}
                label="Observaciones"
                value={form.observaciones}
                onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
                disabled={readonly}
                sx={fieldSx}
              />
            </Grid>

            {/* Confirm delete */}
            {confirmDelete && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning" sx={{ borderRadius: '12px' }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" color="inherit" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                      <Button size="small" color="error" variant="contained" onClick={handleDelete} disabled={isEliminando} sx={{ borderRadius: '8px' }}>
                        {isEliminando ? 'Eliminando...' : 'Confirmar'}
                      </Button>
                    </Box>
                  }
                >
                  ¿Eliminar esta clase del horario?
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      {/* ── FOOTER ── */}
      {!readonly && (
        <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
          {isEditing && !confirmDelete && (
            <Tooltip title="Quitar esta clase del horario">
              <Box onClick={() => setConfirmDelete(true)}
                sx={{
                  width: 36, height: 36, borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${borderField}`, color: 'text.secondary',
                  transition: 'all 0.15s',
                  '&:hover': { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
          )}

          <Box sx={{ flex: 1 }} />

          <Button onClick={onClose} disabled={isBusy}
            sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>
            Cancelar
          </Button>

          <Button variant="contained" disabled={!form.grado_materia_id || isBusy} onClick={handleSubmit}
            startIcon={isBusy ? <CircularProgress size={15} color="inherit" /> : <SaveIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.35)}`,
              '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
            }}>
            {isBusy ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Asignar'}
          </Button>
        </Box>
      )}
    </Dialog>
  );
};