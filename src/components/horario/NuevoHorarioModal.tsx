// components/horario/NuevoHorarioModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, Stepper, Step, StepLabel,
  alpha, useTheme,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useGestionHorarios } from '@/hooks/useHorario';

// Estos hooks deben venir de tu gestión académica existente
// Ajusta los imports según tu proyecto
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

const STEPS = ['Período y Curso', 'Detalles (opcional)'];

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

  // Hooks de datos académicos - ajusta según tu implementación
  const {
  periodos = [],
  niveles: nivelesAcademicos = [], // 👈 alias correcto
  grados = [],
  paralelos = [],
  periodoActivo,
} = useAcademicos();

  // Autoseleccionar período activo
  useEffect(() => {
    if (periodoActivo && open && !form.periodo_academico_id) {
      setForm((p) => ({ ...p, periodo_academico_id: periodoActivo.id }));
    }
  }, [periodoActivo, open]);

  const gradosFiltrados = grados.filter(
    (g: any) => !form.nivel_academico_id || g.nivel_academico_id === form.nivel_academico_id
  );

  const paralelosFiltrados = paralelos.filter(
    (p: any) => !form.grado_id || p.grado_id === form.grado_id
  );

  const canNext =
    activeStep === 0
      ? !!form.periodo_academico_id && !!form.paralelo_id
      : true;

  const handleChange = (field: keyof FormData, value: unknown) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      // Cascada de resets
      if (field === 'nivel_academico_id') { next.grado_id = ''; next.paralelo_id = ''; }
      if (field === 'grado_id') next.paralelo_id = '';
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

  const accentColor = isDark ? '#facc15' : '#0288d1';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{ background: isDark ? 'linear-gradient(135deg,#facc15,#f59e0b)' : 'linear-gradient(135deg,#0288d1,#01579b)', p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: isDark ? '#000' : '#fff', fontWeight: 700 }}>
              Nuevo Horario
            </Typography>
          </Box>
          <Button onClick={handleClose} sx={{ minWidth: 0, color: isDark ? '#000' : '#fff' }}>
            <CloseIcon />
          </Button>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { color: isDark ? '#00000099' : '#ffffff99', fontWeight: 600 },
                  '& .MuiStepLabel-label.Mui-active': { color: isDark ? '#000' : '#fff' },
                  '& .MuiStepIcon-root': { color: isDark ? '#00000044' : '#ffffff44' },
                  '& .MuiStepIcon-root.Mui-active': { color: isDark ? '#000' : '#fff' },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* STEP 0: Período y Paralelo */}
        {activeStep === 0 && (
          <Grid container spacing={2.5}>
            <Grid size ={{xs:12}}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                ¿Para qué período y paralelo es este horario?
              </Typography>
            </Grid>

            {/* Período */}
            <Grid size ={{xs:12}}>
              <FormControl fullWidth required>
                <InputLabel>Período Académico</InputLabel>
                <Select
                  value={form.periodo_academico_id}
                  onChange={(e) => handleChange('periodo_academico_id', e.target.value)}
                  label="Período Académico"
                >
                  {periodos.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {p.nombre}
                        {p.activo && (
                          <Typography component="span" sx={{ fontSize: '0.65rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 1, bgcolor: accentColor, color: isDark ? '#000' : '#fff' }}>
                            ACTIVO
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Nivel */}
            <Grid size ={{xs:12}}>
              <FormControl fullWidth>
                <InputLabel>Nivel Académico</InputLabel>
                <Select
                  value={form.nivel_academico_id}
                  onChange={(e) => handleChange('nivel_academico_id', e.target.value)}
                  label="Nivel Académico"
                >
                  <MenuItem value=""><em>Todos los niveles</em></MenuItem>
                  {nivelesAcademicos.map((n: any) => (
                    <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Grado */}
            <Grid size ={{xs:12, sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Grado</InputLabel>
                <Select
                  value={form.grado_id}
                  onChange={(e) => handleChange('grado_id', e.target.value)}
                  label="Grado"
                  disabled={!gradosFiltrados.length}
                >
                  <MenuItem value=""><em>Todos los grados</em></MenuItem>
                  {gradosFiltrados.map((g: any) => (
                    <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Paralelo */}
            <Grid size ={{xs:12}}>
              <FormControl fullWidth required>
                <InputLabel>Paralelo *</InputLabel>
                <Select
                  value={form.paralelo_id}
                  onChange={(e) => handleChange('paralelo_id', e.target.value)}
                  label="Paralelo *"
                >
                  {paralelosFiltrados.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {p.grado_nombre ?? ''} — Paralelo {p.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Turno: {p.turno_nombre ?? '—'} · Aula: {p.aula ?? 'Sin asignar'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!form.paralelo_id && form.periodo_academico_id && (
              <Grid size ={{xs:12}}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Selecciona un paralelo para continuar
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        {/* STEP 1: Detalles opcionales */}
        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid size ={{xs:12}}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Opcional: añade un nombre descriptivo o notas
              </Typography>
            </Grid>
            <Grid size ={{xs:12}}>
              <TextField
                fullWidth
                label="Nombre del horario (opcional)"
                placeholder="Ej: Horario 2025 — 3ro A Mañana"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                helperText="Se autogenera si lo dejas vacío"
              />
            </Grid>
            <Grid size ={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones (opcional)"
                value={form.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((s) => s - 1)} variant="outlined" sx={{ borderRadius: 2 }}>
            Atrás
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!canNext}
            onClick={() => setActiveStep((s) => s + 1)}
            sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={isCreando || !form.paralelo_id}
            onClick={handleSubmit}
            startIcon={isCreando ? <CircularProgress size={16} color="inherit" /> : <SchoolIcon />}
            sx={{ borderRadius: 2, bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700 }}
          >
            {isCreando ? 'Creando...' : 'Crear Horario'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};