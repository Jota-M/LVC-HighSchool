'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, Button, Box, Typography,
  TextField, Grid, FormControl, Select, MenuItem,
  Alert, CircularProgress, useTheme, alpha, Chip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  CheckCircleOutline as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useGestionHorarios } from '@/hooks/useHorario';
import { useAcademicos } from '@/hooks/useAcademicos';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreado: (horarioId: number) => void;
}

interface FormData {
  periodo_academico_id: number | '';
  nivel_academico_id: number | '';
  grado_id: number | '';
  paralelo_id: number | '';
  nombre: string;
  observaciones: string;
}

const STEPS = ['Período y Curso', 'Detalles'];

export const NuevoHorarioModal: React.FC<Props> = ({ open, onClose, onCreado }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    periodo_academico_id: '',
    nivel_academico_id: '',
    grado_id: '',
    paralelo_id: '',
    nombre: '',
    observaciones: '',
  });

  const { crear, isCreando } = useGestionHorarios();
  const {
    periodos = [], niveles: nivelesAcademicos = [],
    grados = [], paralelos = [], periodoActivo, cargarParalelos,
  } = useAcademicos();

  // ── tokens ──────────────────────────────────────────────────────────────────
  const brand = isDark ? '#facc15' : '#0288d1';
  const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
  const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
  const bgModal = isDark ? '#09101dff' : '#ffffff';
  const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px'; // radio uniforme para todos los inputs

  // sx inyectado en cada FormControl / TextField
  // usa GlobalStyles + sx para forzar sobre el tema sin !important donde sea posible
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
    // label flotante color
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
    // texto dentro del select
    '& .MuiSelect-select': { borderRadius: `${R} !important` },
    // quita el fieldset extra que MUI agrega al Select
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
  };

  // ── lógica ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (periodoActivo && open && !form.periodo_academico_id)
      setForm(p => ({ ...p, periodo_academico_id: periodoActivo.id }));
  }, [periodoActivo, open]);

  useEffect(() => {
    if (!form.periodo_academico_id) return;
    const periodo = periodos.find((p: any) => p.id === form.periodo_academico_id);
    const anio = periodo ? new Date(periodo.fecha_inicio).getFullYear() : undefined;
    cargarParalelos({ anio, grado_id: form.grado_id ? Number(form.grado_id) : undefined });
  }, [form.periodo_academico_id, form.grado_id, periodos]);

  const gradosFiltrados = grados.filter(
    (g: any) => !form.nivel_academico_id || g.nivel_academico_id === form.nivel_academico_id
  );
  const paralelosFiltrados = paralelos.filter(
    (p: any) => !form.grado_id || p.grado_id === Number(form.grado_id)
  );
  const canNext = activeStep === 0 ? !!form.periodo_academico_id && !!form.paralelo_id : true;

  const handleChange = (field: keyof FormData, value: unknown) => {
    setForm(p => {
      const next = { ...p, [field]: value };
      if (field === 'nivel_academico_id') { next.grado_id = ''; next.paralelo_id = ''; }
      if (field === 'grado_id') next.paralelo_id = '';
      if (field === 'periodo_academico_id') { next.grado_id = ''; next.paralelo_id = ''; }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.paralelo_id || !form.periodo_academico_id) return;
    const horario = await crear({
      paralelo_id: Number(form.paralelo_id),
      periodo_academico_id: Number(form.periodo_academico_id),
      nombre: form.nombre || undefined,
      observaciones: form.observaciones || undefined,
    });
    onCreado(horario.id);
    handleReset();
  };

  const handleReset = () => {
    setActiveStep(0);
    setForm({ periodo_academico_id: '', nivel_academico_id: '', grado_id: '', paralelo_id: '', nombre: '', observaciones: '' });
  };
  const handleClose = () => { handleReset(); onClose(); };

  const periodoNombre = periodos.find((p: any) => p.id === form.periodo_academico_id)?.nombre ?? '';
  const paraleloSel = paralelosFiltrados.find((x: any) => x.id === form.paralelo_id);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px !important',
          overflow: 'hidden',
          background: bgModal,
          border: `1.5px solid ${brandBorder}`,
          boxShadow: isDark
            ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
            : `0 32px 64px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${borderField}`, background: brandDim }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(brand, 0.7),
                mb: 0.4,
              }}
            >
              Paso {activeStep + 1} de {STEPS.length} · {STEPS[activeStep]}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                  background: alpha(brand, 0.15),
                  border: `1px solid ${alpha(brand, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <CalendarIcon sx={{ color: brand, fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                Nuevo horario
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={handleClose}
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

        {/* barra de progreso */}
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {STEPS.map((_, i) => (
            <Box key={i} sx={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= activeStep ? brand : alpha(brand, 0.18),
              transition: 'background 0.3s',
            }} />
          ))}
        </Box>
      </Box>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 3, py: 3 }}>

        {activeStep === 0 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                ¿Para qué período y paralelo es este horario?
              </Typography>
            </Grid>

            {/* Período */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required sx={fieldSx}>
                <Select
                  value={form.periodo_academico_id}
                  onChange={e => handleChange('periodo_academico_id', e.target.value)}
                  displayEmpty
                  renderValue={(val) => {
                    const periodo = periodos.find((p: any) => p.id === val);

                    return periodo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {periodo.nombre}
                        </Typography>

                        {periodo.activo && (
                          <Chip
                            label="Activo"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: alpha(brand, 0.15),
                              color: brand,
                              border: `1px solid ${alpha(brand, 0.3)}`,
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Período académico *
                      </Typography>
                    );
                  }}
                >
                  {periodos.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{p.nombre}</Typography>

                        {p.activo && (
                          <Chip
                            label="Activo"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: alpha(brand, 0.15),
                              color: brand,
                            }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Nivel */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth sx={fieldSx}>
                <Select
                  value={form.nivel_academico_id}
                  onChange={e => handleChange('nivel_academico_id', e.target.value)}
                  displayEmpty
                  renderValue={(val) => {
                    const nivel = nivelesAcademicos.find((n: any) => n.id === val);

                    return nivel ? (
                      <Typography variant="body2">
                        {nivel.nombre}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Nivel académico
                      </Typography>
                    );
                  }}
                >
                  <MenuItem value="">
                    <em>Todos los niveles</em>
                  </MenuItem>

                  {nivelesAcademicos.map((n: any) => (
                    <MenuItem key={n.id} value={n.id}>
                      {n.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Grado + Paralelo */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={fieldSx}>
                <Select
                  value={form.grado_id}
                  onChange={e => handleChange('grado_id', e.target.value)}
                  displayEmpty
                  disabled={!gradosFiltrados.length}
                  renderValue={(val) => {
                    const grado = gradosFiltrados.find((g: any) => g.id === val);

                    return grado ? (
                      <Typography variant="body2">
                        {grado.nombre}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Grado
                      </Typography>
                    );
                  }}
                >
                  <MenuItem value="">
                    <em>Todos los grados</em>
                  </MenuItem>

                  {gradosFiltrados.map((g: any) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required sx={fieldSx}>
                <Select
                  value={form.paralelo_id}
                  onChange={e => handleChange('paralelo_id', e.target.value)}
                  displayEmpty
                  disabled={!paralelosFiltrados.length}
                  renderValue={(val) => {
                    const paralelo = paralelosFiltrados.find((p: any) => p.id === val);
                    return paralelo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Paralelo {paralelo.nombre}
                        </Typography>
                        {paralelo.turno_nombre && (
                          <Chip
                            label={paralelo.turno_nombre}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: alpha(brand, 0.15),
                              color: brand,
                              border: `1px solid ${alpha(brand, 0.3)}`,
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Paralelo *
                      </Typography>
                    );
                  }}
                >
                  {paralelosFiltrados.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Paralelo {p.nombre}
                        </Typography>
                        {p.turno_nombre && (
                          <Typography variant="caption" color="text.secondary">
                            · {p.turno_nombre}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!form.paralelo_id && form.periodo_academico_id && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ borderRadius: '12px', background: alpha(brand, 0.08), color: brand, border: `1px solid ${alpha(brand, 0.2)}`, '& .MuiAlert-icon': { color: brand } }}>
                  Selecciona un paralelo para continuar
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">Opcional — añade un nombre descriptivo o notas.</Typography>
            </Grid>

            {paraleloSel && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 1.75, borderRadius: '12px', background: alpha(brand, 0.08), border: `1px solid ${alpha(brand, 0.2)}`, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <CheckIcon sx={{ color: brand, fontSize: 20, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: brand }}>{paraleloSel.grado_nombre ?? ''} — Paralelo {paraleloSel.nombre}</Typography>
                    <Typography variant="caption" sx={{ color: alpha(brand, 0.7) }}>{periodoNombre}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Nombre del horario" placeholder="Ej: Horario 2026 — 3ro A Mañana" value={form.nombre} onChange={e => handleChange('nombre', e.target.value)} helperText="Se genera automáticamente si lo dejas vacío" sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={3} label="Observaciones" placeholder="Notas internas..." value={form.observaciones} onChange={e => handleChange('observaciones', e.target.value)} sx={fieldSx} />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {/* ── FOOTER ── */}
      <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(s => s - 1)} startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: '10px', color: 'text.secondary', border: `1px solid ${borderField}`, px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: brand, color: brand, background: alpha(brand, 0.06) } }}>
            Atrás
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleClose} sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>
          Cancelar
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button variant="contained" disabled={!canNext} onClick={() => setActiveStep(s => s + 1)} endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: canNext ? `0 4px 16px ${alpha(brand, 0.4)}` : 'none',
              '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
            }}>
            Siguiente
          </Button>
        ) : (
          <Button variant="contained" disabled={isCreando || !form.paralelo_id} onClick={handleSubmit}
            startIcon={isCreando ? <CircularProgress size={16} color="inherit" /> : <SchoolIcon />}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
              background: brand, color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
              '&:hover': { background: isDark ? '#eab308' : '#01579b', boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
              '&.Mui-disabled': { opacity: 0.3, background: brand, color: isDark ? '#000' : '#fff' },
            }}>
            {isCreando ? 'Creando...' : 'Crear horario'}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};