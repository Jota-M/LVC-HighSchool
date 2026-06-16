// components/horario/BloqueHorarioManager.tsx
'use client';
import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Tooltip, alpha, useTheme,
  CircularProgress, Alert, Collapse, Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Coffee as RecresoIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { useBloques, useGestionBloques } from '@/hooks/useHorario';
import { BloqueHorario, BloqueHorarioCreate, BloqueHorarioUpdate } from '@/types/horariotypes';

// Turnos los traes de tu hook de gestión académica
interface Turno { id: number; nombre: string; hora_inicio: string; hora_fin: string; }
interface NivelAcademico { id: number; nombre: string; }

interface Props {
  turnos: Turno[];
  nivelesAcademicos?: NivelAcademico[];
}

interface FormData {
  turno_id: number | '';
  nivel_academico_id: number | '';
  nombre: string;
  codigo: string;
  numero: number | '';
  hora_inicio: string;
  hora_fin: string;
  es_recreo: boolean;
}

const EMPTY_FORM: FormData = {
  turno_id: '', nivel_academico_id: '', nombre: '', codigo: '', numero: '', hora_inicio: '', hora_fin: '', es_recreo: false,
};

export const BloqueHorarioManager: React.FC<Props> = ({ turnos, nivelesAcademicos = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#facc15' : '#0288d1';

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BloqueHorario | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [expandedTurno, setExpandedTurno] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { bloques, isLoading, refetch } = useBloques({ incluir_recreos: true });
  const { crear, actualizar, eliminar, isCreando, isActualizando, isEliminando } = useGestionBloques();

  const isBusy = isCreando || isActualizando;

  // Agrupar bloques por turno
  const bloquesPorTurno = turnos.reduce<Record<number, BloqueHorario[]>>((acc, t) => {
    acc[t.id] = bloques.filter((b) => b.turno_id === t.id).sort((a, b) => a.numero - b.numero);
    return acc;
  }, {});

  const openCreate = (turnoId?: number) => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, turno_id: turnoId || '' });
    setModalOpen(true);
  };

  const openEdit = (bloque: BloqueHorario) => {
    setEditTarget(bloque);
    setForm({
      turno_id: bloque.turno_id,
      nivel_academico_id: bloque.nivel_academico_id ?? '',
      nombre: bloque.nombre,
      codigo: bloque.codigo ?? '',
      numero: bloque.numero,
      hora_inicio: bloque.hora_inicio.slice(0, 5),
      hora_fin: bloque.hora_fin.slice(0, 5),
      es_recreo: bloque.es_recreo,
    });
    setModalOpen(true);
  };

  const handleClose = () => { setModalOpen(false); setEditTarget(null); setForm(EMPTY_FORM); };

  const handleSubmit = async () => {
    if (!form.turno_id || !form.nombre || !form.numero || !form.hora_inicio || !form.hora_fin) return;
    const payload = {
      turno_id: Number(form.turno_id),
      nivel_academico_id: form.nivel_academico_id !== '' ? Number(form.nivel_academico_id) : null,
      nombre: form.nombre,
      codigo: form.codigo || undefined,
      numero: Number(form.numero),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      es_recreo: form.es_recreo,
    };
    if (editTarget) {
      await actualizar({ id: editTarget.id, payload });
    } else {
      await crear(payload as BloqueHorarioCreate);
    }
    handleClose();
  };

  const handleDelete = async (id: number) => {
    await eliminar(id);
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Bloques Horarios</Typography>
          <Typography variant="body2" color="text.secondary">
            Configura las horas del día para cada turno
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openCreate()}
          sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}
        >
          Nuevo Bloque
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: accentColor }} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {turnos.map((turno) => {
            const bloquesT = bloquesPorTurno[turno.id] ?? [];
            const isExpanded = expandedTurno === turno.id || expandedTurno === null;

            return (
              <Paper key={turno.id} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(accentColor, 0.2)}` }}>
                {/* Turno header */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2.5, py: 1.5,
                    background: isDark ? alpha('#facc15', 0.08) : alpha('#0288d1', 0.06),
                    borderBottom: `1px solid ${alpha(accentColor, 0.15)}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedTurno(isExpanded && expandedTurno === turno.id ? null : turno.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TimeIcon sx={{ color: accentColor, fontSize: 20 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{turno.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {turno.hora_inicio} – {turno.hora_fin} · {bloquesT.length} bloques
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(e) => { e.stopPropagation(); openCreate(turno.id); }}
                      sx={{ borderRadius: 2, fontSize: '0.7rem' }}
                    >
                      Agregar
                    </Button>
                    <IconButton size="small">
                      {isExpanded && expandedTurno === turno.id ? <CollapseIcon /> : <ExpandIcon />}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={expandedTurno === null || expandedTurno === turno.id}>
                  {bloquesT.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <TimeIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2">No hay bloques configurados para este turno</Typography>
                      <Button size="small" onClick={() => openCreate(turno.id)} sx={{ mt: 1 }}>
                        Crear primer bloque
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', border: 'none', py: 1 } }}>
                            <TableCell>#</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Nivel</TableCell>
                            <TableCell>Código</TableCell>
                            <TableCell>Hora inicio</TableCell>
                            <TableCell>Hora fin</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bloquesT.map((bloque) => (
                            <TableRow
                              key={bloque.id}
                              sx={{
                                '& td': { border: 'none', py: 1 },
                                bgcolor: bloque.es_recreo ? alpha('#94a3b8', 0.06) : 'transparent',
                                '&:hover': { bgcolor: alpha(accentColor, 0.04) },
                              }}
                            >
                              <TableCell>
                                <Typography variant="caption" fontWeight={700} sx={{ color: accentColor }}>
                                  {bloque.numero}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {bloque.es_recreo && <RecresoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                                  <Typography variant="body2" fontWeight={600}>{bloque.nombre}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={bloque.nivel_nombre || 'General'}
                                  variant={bloque.nivel_nombre ? 'outlined' : 'filled'}
                                  sx={{
                                    height: 20, fontSize: '0.65rem',
                                    borderColor: bloque.nivel_nombre ? accentColor : 'transparent',
                                    bgcolor: bloque.nivel_nombre ? 'transparent' : alpha('#94a3b8', 0.1),
                                    color: bloque.nivel_nombre ? accentColor : '#6b7280',
                                    fontWeight: bloque.nivel_nombre ? 600 : 400,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: alpha(accentColor, 0.08), px: 0.8, py: 0.3, borderRadius: 1 }}>
                                  {bloque.codigo ?? '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{bloque.hora_inicio.slice(0, 5)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{bloque.hora_fin.slice(0, 5)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={bloque.es_recreo ? 'Recreo' : 'Clase'}
                                  icon={bloque.es_recreo ? <RecresoIcon /> : undefined}
                                  sx={{
                                    height: 20, fontSize: '0.65rem',
                                    bgcolor: bloque.es_recreo ? alpha('#94a3b8', 0.15) : alpha('#10b981', 0.1),
                                    color: bloque.es_recreo ? '#6b7280' : '#10b981',
                                    '& .MuiChip-icon': { fontSize: 12 },
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={bloque.activo ? 'Activo' : 'Inactivo'}
                                  sx={{
                                    height: 20, fontSize: '0.65rem',
                                    bgcolor: bloque.activo ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                    color: bloque.activo ? '#10b981' : '#ef4444',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Editar">
                                  <IconButton size="small" onClick={() => openEdit(bloque)}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                {confirmDeleteId === bloque.id ? (
                                  <Box component="span" sx={{ display: 'inline-flex', gap: 0.5 }}>
                                    <Button size="small" color="error" onClick={() => handleDelete(bloque.id)} disabled={isEliminando} sx={{ fontSize: '0.65rem' }}>
                                      {isEliminando ? '...' : 'Confirmar'}
                                    </Button>
                                    <Button size="small" onClick={() => setConfirmDeleteId(null)} sx={{ fontSize: '0.65rem' }}>
                                      No
                                    </Button>
                                  </Box>
                                ) : (
                                  <Tooltip title="Desactivar bloque">
                                    <IconButton size="small" color="error" onClick={() => setConfirmDeleteId(bloque.id)}>
                                      <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? `Editar: ${editTarget.nombre}` : 'Nuevo Bloque Horario'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{xs:12}}>
              <FormControl fullWidth required>
                <InputLabel>Turno</InputLabel>
                <Select
                  value={form.turno_id}
                  onChange={(e) => setForm((p) => ({ ...p, turno_id: e.target.value as number }))}
                  label="Turno"
                  disabled={!!editTarget}
                >
                  {turnos.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs:12}}>
              <FormControl fullWidth>
                <InputLabel>Nivel Académico (Opcional)</InputLabel>
                <Select
                  value={form.nivel_academico_id}
                  onChange={(e) => setForm((p) => ({ ...p, nivel_academico_id: e.target.value as number | '' }))}
                  label="Nivel Académico (Opcional)"
                >
                  <MenuItem value=""><em>General / Todos los niveles</em></MenuItem>
                  {nivelesAcademicos.map((n) => (
                    <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs:8}}>
              <TextField fullWidth required label="Nombre" placeholder="Ej: 1ra Hora" value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
            </Grid>
            <Grid size={{xs:4}}>
              <TextField fullWidth label="N°" type="number" placeholder="1" value={form.numero}
                onChange={(e) => setForm((p) => ({ ...p, numero: Number(e.target.value) || '' }))}
                inputProps={{ min: 1, max: 20 }} />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField fullWidth label="Código (opcional)" placeholder="Ej: BLQ-M-01" value={form.codigo}
                onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
                inputProps={{ style: { fontFamily: 'monospace' } }} />
            </Grid>

            <Grid size={{xs:6}}>
              <TextField fullWidth required type="time" label="Hora inicio" value={form.hora_inicio}
                onChange={(e) => setForm((p) => ({ ...p, hora_inicio: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField fullWidth required type="time" label="Hora fin" value={form.hora_fin}
                onChange={(e) => setForm((p) => ({ ...p, hora_fin: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid size={{xs:12}}>
              <FormControlLabel
                control={<Switch checked={form.es_recreo} onChange={(e) => setForm((p) => ({ ...p, es_recreo: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RecresoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">Es recreo / descanso</Typography>
                  </Box>
                }
              />
            </Grid>

            {form.hora_inicio && form.hora_fin && form.hora_fin <= form.hora_inicio && (
              <Grid size={{xs:12}}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>La hora de fin debe ser mayor a la de inicio</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={isBusy || !form.turno_id || !form.nombre || !form.numero || !form.hora_inicio || !form.hora_fin || (!!form.hora_fin && !!form.hora_inicio && form.hora_fin <= form.hora_inicio)}
            onClick={handleSubmit}
            startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}
          >
            {isBusy ? 'Guardando...' : editTarget ? 'Guardar Cambios' : 'Crear Bloque'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};